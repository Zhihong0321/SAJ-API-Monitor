const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { Client } = require('pg');
const router = express.Router();

// Database connection
const getDBClient = () => {
  return new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
};

// SAJ API Configuration
const SAJ_CONFIG = {
  baseUrl: 'https://intl-developer.saj-electric.com/prod-api/open/api',
  appId: process.env.SAJ_APP_ID || 'VH_3TmblTqb',
  appSecret: process.env.SAJ_APP_SECRET || 'VdtqQAUrVHoKs5hQUpvD4khelTqbBac2eK3VtE4f5GUx3TmbZy7o0JvutUsIsCBf',
  headers: {
    'content-language': 'en_US:English'
  }
};

// Utility function to generate client signature
const generateClientSign = (deviceSn) => {
  const signString = `appId=${SAJ_CONFIG.appId},deviceSN=${deviceSn}`;
  return crypto.createHash('sha256').update(signString).digest('hex');
};

// Get or refresh access token
router.post('/saj/token', async (req, res) => {
  try {
    console.log('🔑 Requesting new access token from SAJ API...');
    
    const response = await axios.get(`${SAJ_CONFIG.baseUrl}/access_token`, {
      params: {
        appId: SAJ_CONFIG.appId,
        appSecret: SAJ_CONFIG.appSecret
      },
      headers: SAJ_CONFIG.headers
    });

    if (response.data.code !== 200) {
      throw new Error(`SAJ API error: ${response.data.msg}`);
    }

    const tokenData = response.data.data;
    
    // Store token in database
    const client = await getDBClient();
    await client.connect();
    
    // Deactivate old tokens
    await client.query('UPDATE saj_tokens SET is_active = FALSE WHERE is_active = TRUE');
    
    // Insert new token
    const expiresAt = new Date(Date.now() + (tokenData.expires * 1000));
    await client.query(
      'INSERT INTO saj_tokens (access_token, expires_at) VALUES ($1, $2)',
      [tokenData.access_token, expiresAt]
    );
    
    await client.end();
    
    console.log('✅ Access token obtained and stored');
    res.json(tokenData);

  } catch (error) {
    console.error('❌ Failed to get access token:', error.message);
    res.status(500).json({ error: 'Failed to get access token', message: error.message });
  }
});

// Get devices from SAJ API with pagination
router.get('/saj/devices', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!accessToken) {
      return res.status(401).json({ error: 'Access token required' });
    }

    console.log(`📄 Fetching device list page ${page} from SAJ API...`);
    
    const response = await axios.get(`${SAJ_CONFIG.baseUrl}/developer/device/page`, {
      params: {
        appId: SAJ_CONFIG.appId,
        pageNum: page
      },
      headers: {
        ...SAJ_CONFIG.headers,
        accessToken: accessToken
      }
    });

    if (response.data.code !== 200) {
      throw new Error(`SAJ API error: ${response.data.msg}`);
    }

    console.log(`✅ Page ${page}: ${response.data.rows.length} devices fetched`);
    res.json(response.data);

  } catch (error) {
    console.error('❌ Failed to fetch devices:', error.message);
    res.status(500).json({ error: 'Failed to fetch devices', message: error.message });
  }
});

// Sync devices to database (add only new devices)
router.post('/devices/sync', async (req, res) => {
  const client = await getDBClient();
  
  try {
    await client.connect();
    const { devices } = req.body;
    
    console.log(`💾 Syncing ${devices.length} devices to database...`);
    
    // Start sync history record
    const syncResult = await client.query(
      'INSERT INTO saj_sync_history (total_devices_from_api) VALUES ($1) RETURNING id',
      [devices.length]
    );
    const syncId = syncResult.rows[0].id;
    
    let newDevicesAdded = 0;
    let devicesUpdated = 0;
    const newDeviceIds = [];
    
    // Process each device
    for (const device of devices) {
      try {
        // Check if device already exists
        const existingDevice = await client.query(
          'SELECT id FROM saj_devices WHERE device_sn = $1',
          [device.deviceSn]
        );
        
        if (existingDevice.rows.length === 0) {
          // Insert new device
          const insertResult = await client.query(`
            INSERT INTO saj_devices (
              device_sn, device_type, plant_id, plant_name, 
              is_online, is_alarm, country
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
          `, [
            device.deviceSn,
            device.deviceType,
            device.plantId,
            device.plantName,
            device.isOnline,
            device.isAlarm,
            device.country
          ]);
          
          newDevicesAdded++;
          newDeviceIds.push(insertResult.rows[0].id);
          console.log(`➕ Added new device: ${device.deviceSn}`);
          
        } else {
          // Update existing device status
          await client.query(`
            UPDATE saj_devices SET 
              is_online = $1, 
              is_alarm = $2,
              updated_at = NOW()
            WHERE device_sn = $3
          `, [device.isOnline, device.isAlarm, device.deviceSn]);
          
          devicesUpdated++;
          console.log(`🔄 Updated device: ${device.deviceSn}`);
        }
        
      } catch (deviceError) {
        console.error(`❌ Error processing device ${device.deviceSn}:`, deviceError.message);
      }
    }
    
    // Update sync history
    await client.query(`
      UPDATE saj_sync_history SET 
        sync_completed_at = NOW(),
        new_devices_added = $1,
        devices_updated = $2,
        success = TRUE
      WHERE id = $3
    `, [newDevicesAdded, devicesUpdated, syncId]);
    
    console.log(`✅ Sync completed: ${newDevicesAdded} new, ${devicesUpdated} updated`);
    
    res.json({
      success: true,
      newDevices: newDevicesAdded,
      updatedDevices: devicesUpdated,
      totalProcessed: devices.length,
      newDeviceIds
    });
    
  } catch (error) {
    console.error('❌ Database sync error:', error.message);
    
    // Update sync history with error
    try {
      await client.query(`
        UPDATE saj_sync_history SET 
          sync_completed_at = NOW(),
          success = FALSE,
          error_message = $1
        WHERE id = (SELECT id FROM saj_sync_history ORDER BY sync_started_at DESC LIMIT 1)
      `, [error.message]);
    } catch (updateError) {
      console.error('Failed to update sync history:', updateError.message);
    }
    
    res.status(500).json({ error: 'Database sync failed', message: error.message });
    
  } finally {
    await client.end();
  }
});

// Generate client signatures for new devices
router.post('/devices/generate-signatures', async (req, res) => {
  const client = await getDBClient();
  
  try {
    await client.connect();
    const { deviceIds } = req.body;
    
    console.log(`🔐 Generating client signatures for ${deviceIds.length} devices...`);
    
    for (const deviceId of deviceIds) {
      // Get device serial number
      const deviceResult = await client.query(
        'SELECT device_sn FROM saj_devices WHERE id = $1',
        [deviceId]
      );
      
      if (deviceResult.rows.length > 0) {
        const deviceSn = deviceResult.rows[0].device_sn;
        const clientSign = generateClientSign(deviceSn);
        
        // Update device with client signature
        await client.query(
          'UPDATE saj_devices SET client_sign = $1 WHERE id = $2',
          [clientSign, deviceId]
        );
        
        console.log(`🔐 Generated signature for device: ${deviceSn}`);
      }
    }
    
    console.log('✅ All client signatures generated');
    res.json({ success: true, generated: deviceIds.length });
    
  } catch (error) {
    console.error('❌ Failed to generate client signatures:', error.message);
    res.status(500).json({ error: 'Failed to generate client signatures', message: error.message });
    
  } finally {
    await client.end();
  }
});

// Get devices from local database
router.get('/devices', async (req, res) => {
  const client = await getDBClient();
  
  try {
    await client.connect();
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const result = await client.query(`
      SELECT * FROM saj_devices 
      ORDER BY updated_at DESC, created_at DESC 
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('❌ Failed to fetch devices:', error.message);
    res.status(500).json({ error: 'Failed to fetch devices', message: error.message });
    
  } finally {
    await client.end();
  }
});

// Get device summary statistics
router.get('/devices/summary', async (req, res) => {
  const client = await getDBClient();

  try {
    await client.connect();

    const result = await client.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN is_online = 1 THEN 1 END) as online,
        COUNT(CASE WHEN is_alarm = 1 THEN 1 END) as alarms,
        COUNT(CASE WHEN is_online = 0 THEN 1 END) as offline
      FROM saj_devices
    `);

    res.json(result.rows[0]);

  } catch (error) {
    console.error('❌ Failed to get device summary:', error.message);
    res.status(500).json({ error: 'Failed to get device summary', message: error.message });

  } finally {
    await client.end();
  }
});

// Get offline devices
router.get('/devices/offline', async (req, res) => {
  const client = await getDBClient();

  try {
    await client.connect();
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await client.query(`
      SELECT
        device_sn,
        plant_name,
        device_type,
        country,
        updated_at,
        created_at
      FROM saj_devices
      WHERE is_online = 0
      ORDER BY updated_at DESC, created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json(result.rows);

  } catch (error) {
    console.error('❌ Failed to get offline devices:', error.message);
    res.status(500).json({ error: 'Failed to get offline devices', message: error.message });

  } finally {
    await client.end();
  }
});

// Get sync history
router.get('/sync/history', async (req, res) => {
  const client = await getDBClient();

  try {
    await client.connect();
    const limit = parseInt(req.query.limit) || 10;

    const result = await client.query(`
      SELECT * FROM saj_sync_history
      ORDER BY sync_started_at DESC
      LIMIT $1
    `, [limit]);

    res.json(result.rows);

  } catch (error) {
    console.error('❌ Failed to fetch sync history:', error.message);
    res.status(500).json({ error: 'Failed to fetch sync history', message: error.message });

  } finally {
    await client.end();
  }
});

// =====================================================
// HISTORICAL DATA ENDPOINTS
// =====================================================

// Get specific device by SN
router.get('/devices/:deviceSn', async (req, res) => {
  const { deviceSn } = req.params;
  
  try {
    console.log(`📱 Getting device info for: ${deviceSn}`);
    
    // Try database first, but don't fail if database is unavailable
    let deviceFromDB = null;
    try {
      const client = await getDBClient();
      await client.connect();

      const result = await client.query(
        'SELECT * FROM saj_devices WHERE device_sn = $1',
        [deviceSn]
      );

      await client.end();
      
      if (result.rows.length > 0) {
        deviceFromDB = result.rows[0];
        console.log(`✅ Found device in database: ${deviceSn}`);
      }
    } catch (dbError) {
      console.log(`⚠️ Database unavailable, continuing with API only: ${dbError.message}`);
    }

    // If device found in DB, return it
    if (deviceFromDB) {
      return res.json(deviceFromDB);
    }

    // Otherwise, return basic device info based on deviceSn
    console.log(`📝 Returning basic device info for: ${deviceSn}`);
    res.json({
      device_sn: deviceSn,
      device_name: `Device ${deviceSn.slice(-8)}`, // Last 8 chars as name
      status: 'unknown',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to fetch device:', error.message);
    res.status(500).json({ error: 'Failed to fetch device', message: error.message });
  }
});

// Get real-time data for specific device
router.get('/devices/:deviceSn/realtime', async (req, res) => {
  const { deviceSn } = req.params;

  try {
    console.log(`📊 Getting real-time data for device: ${deviceSn}`);

    // Get access token using cached/shared token logic (FIXED: No longer requests new token each time)
    console.log(`🔑 Getting access token for realtime data (checking cache first)`);

    let accessToken = null;

    try {
      // First, try to get a valid cached token from database
      const client = await getDBClient();
      await client.connect();

      const tokenResult = await client.query(
        'SELECT access_token, expires_at FROM saj_tokens WHERE is_active = TRUE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1'
      );

      await client.end();

      if (tokenResult.rows.length > 0) {
        accessToken = tokenResult.rows[0].access_token;
        console.log(`✅ Using cached access token: ${accessToken.substring(0, 20)}...`);
      }
    } catch (dbError) {
      console.log(`⚠️ Database token check failed: ${dbError.message}`);
    }

    // If no valid cached token, request a new one
    if (!accessToken) {
      console.log(`🔑 Requesting new access token for realtime data`);
      console.log(`🔧 Using appId: ${SAJ_CONFIG.appId}`);

      const tokenResponse = await axios.get(`${SAJ_CONFIG.baseUrl}/access_token`, {
        params: {
          appId: SAJ_CONFIG.appId,
          appSecret: SAJ_CONFIG.appSecret
        },
        headers: SAJ_CONFIG.headers,
        timeout: 10000
      });

      console.log(`🔑 Token response code: ${tokenResponse.data.code}`);
      console.log(`🔑 Token response message: ${tokenResponse.data.msg || 'No message'}`);

      if (tokenResponse.data.code !== 200) {
        console.error(`❌ Token request failed:`, tokenResponse.data);
        throw new Error(`Failed to get access token: ${tokenResponse.data.msg || tokenResponse.data.code}`);
      }

      const tokenData = tokenResponse.data.data;
      accessToken = tokenData?.access_token;

      if (!accessToken) {
        console.error(`❌ No access token in response:`, tokenResponse.data);
        throw new Error('Access token not found in response');
      }

      // Store the new token in database for sharing
      try {
        const client = await getDBClient();
        await client.connect();

        // Deactivate old tokens
        await client.query('UPDATE saj_tokens SET is_active = FALSE WHERE is_active = TRUE');

        // Insert new token
        const expiresAt = new Date(Date.now() + (tokenData.expires * 1000));
        await client.query(
          'INSERT INTO saj_tokens (access_token, expires_at) VALUES ($1, $2)',
          [accessToken, expiresAt]
        );

        await client.end();
        console.log(`✅ New access token obtained and cached: ${accessToken.substring(0, 20)}...`);
      } catch (dbError) {
        console.log(`⚠️ Failed to cache token: ${dbError.message}`);
      }
    }

    console.log(`✅ Access token obtained: ${accessToken.substring(0, 20)}...`);
    const clientSign = generateClientSign(deviceSn);
    console.log(`🔐 Generated client signature: ${clientSign.substring(0, 20)}...`);

    // Get real-time data
    console.log(`📡 Making realtime API call...`);
    const response = await axios.get(`${SAJ_CONFIG.baseUrl}/device/realtimeDataCommon`, {
      params: { deviceSn },
      headers: {
        ...SAJ_CONFIG.headers,
        accessToken: accessToken,
        clientSign: clientSign
      },
      timeout: 15000
    });

    console.log(`📡 Realtime API response code: ${response.data.code}`);

    if (response.data.code === 200) {
      console.log('✅ Real-time data retrieved');
      res.json(response.data.data);
    } else {
      // Handle specific SAJ API error codes
      console.log(`❌ SAJ API returned error code: ${response.data.code}, message: ${response.data.msg}`);

      let httpStatus = 500;
      let userMessage = response.data.msg || 'Unknown API error';

      // Handle specific SAJ API error codes
      if (response.data.code === 200010) {
        httpStatus = 401;
        userMessage = 'Authentication failed - invalid token or expired session';
      } else if (response.data.code === 200011) {
        httpStatus = 403;
        userMessage = 'Access forbidden - invalid device or insufficient permissions';
      } else if (response.data.code === 200001) {
        httpStatus = 400;
        userMessage = 'Invalid request parameters';
      }

      res.status(httpStatus).json({
        error: 'SAJ API Error',
        message: userMessage,
        code: response.data.code,
        originalMessage: response.data.msg
      });
    }

  } catch (error) {
    console.error('❌ Failed to get real-time data:', error.message);
    res.status(500).json({ error: 'Failed to get real-time data', message: error.message });
  }
});

// Get historical data for specific device
router.get('/devices/:deviceSn/historical', async (req, res) => {
  const { deviceSn } = req.params;
  const { startTime, endTime } = req.query;

  if (!startTime || !endTime) {
    return res.status(400).json({
      error: 'Missing required parameters',
      message: 'startTime and endTime are required'
    });
  }

  try {
    console.log(`📊 Getting historical data for device: ${deviceSn}`);
    console.log(`📅 Date range: ${startTime} to ${endTime}`);

    // Get access token using cached/shared token logic (FIXED: No longer requests new token each time)
    console.log(`🔑 Getting access token for historical data (checking cache first)`);

    let accessToken = null;

    try {
      // First, try to get a valid cached token from database
      const client = await getDBClient();
      await client.connect();

      const tokenResult = await client.query(
        'SELECT access_token, expires_at FROM saj_tokens WHERE is_active = TRUE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1'
      );

      await client.end();

      if (tokenResult.rows.length > 0) {
        accessToken = tokenResult.rows[0].access_token;
        console.log(`✅ Using cached access token: ${accessToken.substring(0, 20)}...`);
      }
    } catch (dbError) {
      console.log(`⚠️ Database token check failed: ${dbError.message}`);
    }

    // If no valid cached token, request a new one
    if (!accessToken) {
      console.log(`🔑 Requesting new access token for historical data`);
      console.log(`🔧 Using appId: ${SAJ_CONFIG.appId}`);

      const tokenResponse = await axios.get(`${SAJ_CONFIG.baseUrl}/access_token`, {
        params: {
          appId: SAJ_CONFIG.appId,
          appSecret: SAJ_CONFIG.appSecret
        },
        headers: SAJ_CONFIG.headers,
        timeout: 10000
      });

      console.log(`🔑 Token response code: ${tokenResponse.data.code}`);
      console.log(`🔑 Token response message: ${tokenResponse.data.msg || 'No message'}`);

      if (tokenResponse.data.code !== 200) {
        console.error(`❌ Token request failed:`, tokenResponse.data);
        throw new Error(`Failed to get access token: ${tokenResponse.data.msg || tokenResponse.data.code}`);
      }

      const tokenData = tokenResponse.data.data;
      accessToken = tokenData?.access_token;

      if (!accessToken) {
        console.error(`❌ No access token in response:`, tokenResponse.data);
        throw new Error('Access token not found in response');
      }

      // Store the new token in database for sharing
      try {
        const client = await getDBClient();
        await client.connect();

        // Deactivate old tokens
        await client.query('UPDATE saj_tokens SET is_active = FALSE WHERE is_active = TRUE');

        // Insert new token
        const expiresAt = new Date(Date.now() + (tokenData.expires * 1000));
        await client.query(
          'INSERT INTO saj_tokens (access_token, expires_at) VALUES ($1, $2)',
          [accessToken, expiresAt]
        );

        await client.end();
        console.log(`✅ New access token obtained and cached: ${accessToken.substring(0, 20)}...`);
      } catch (dbError) {
        console.log(`⚠️ Failed to cache token: ${dbError.message}`);
      }
    }

    console.log(`✅ Access token obtained: ${accessToken.substring(0, 20)}...`);
    const clientSign = generateClientSign(deviceSn);
    console.log(`🔐 Generated client signature: ${clientSign.substring(0, 20)}...`);

    // Get historical data
    console.log(`📡 Making historical API call...`);
    const response = await axios.get(`${SAJ_CONFIG.baseUrl}/device/historyDataCommon`, {
      params: {
        deviceSn,
        startTime,
        endTime
      },
      headers: {
        ...SAJ_CONFIG.headers,
        accessToken: accessToken,
        clientSign: clientSign
      },
      timeout: 30000 // Longer timeout for historical data
    });

    console.log(`📡 Historical API response code: ${response.data.code}`);

    if (response.data.code === 200) {
      console.log(`✅ Historical data retrieved: ${response.data.data ? response.data.data.length : 0} data points`);
      res.json(response.data);
    } else {
      // Handle specific SAJ API error codes
      console.log(`❌ SAJ API returned error code: ${response.data.code}, message: ${response.data.msg}`);

      let httpStatus = 500;
      let userMessage = response.data.msg || 'Unknown API error';

      // Handle specific SAJ API error codes
      if (response.data.code === 200010) {
        httpStatus = 401;
        userMessage = 'Authentication failed - invalid token or expired session';
      } else if (response.data.code === 200011) {
        httpStatus = 403;
        userMessage = 'Access forbidden - invalid device or insufficient permissions';
      } else if (response.data.code === 200001) {
        httpStatus = 400;
        userMessage = 'Invalid request parameters';
      }

      res.status(httpStatus).json({
        error: 'SAJ API Error',
        message: userMessage,
        code: response.data.code,
        originalMessage: response.data.msg
      });
    }

  } catch (error) {
    console.error('❌ Failed to get historical data:', error.message);

    if (error.response) {
      res.status(error.response.status).json({
        error: 'SAJ API Error',
        message: error.response.data?.msg || error.message,
        status: error.response.status
      });
    } else {
      res.status(500).json({
        error: 'Failed to get historical data',
        message: error.message
      });
    }
  }
});

// NEW: Get device upload data (alternative historical data API)
router.get('/devices/:deviceSn/uploadData', async (req, res) => {
  const { deviceSn } = req.params;
  const { startTime, endTime, timeUnit } = req.query;

  if (!startTime || !endTime || timeUnit === undefined) {
    return res.status(400).json({
      error: 'Missing required parameters',
      message: 'startTime, endTime and timeUnit are required',
      timeUnitOptions: {
        0: 'minute data',
        1: 'day data', 
        2: 'month data',
        3: 'year data'
      }
    });
  }

  try {
    console.log(`📊 Getting uploadData for device: ${deviceSn}`);
    console.log(`📅 Date range: ${startTime} to ${endTime}`);
    console.log(`⏰ Time unit: ${timeUnit} (${['minute', 'day', 'month', 'year'][timeUnit] || 'unknown'})`);

    // Get access token using cached/shared token logic
    console.log(`🔑 Getting access token for uploadData (checking cache first)`);
    
    let accessToken = null;
    
    try {
      // First, try to get a valid cached token from database
      const client = await getDBClient();
      await client.connect();
      
      const tokenResult = await client.query(
        'SELECT access_token, expires_at FROM saj_tokens WHERE is_active = TRUE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1'
      );
      
      await client.end();
      
      if (tokenResult.rows.length > 0) {
        accessToken = tokenResult.rows[0].access_token;
        console.log(`✅ Using cached access token: ${accessToken.substring(0, 20)}...`);
      }
    } catch (dbError) {
      console.log(`⚠️ Database token check failed: ${dbError.message}`);
    }
    
    // If no valid cached token, request a new one
    if (!accessToken) {
      console.log(`🔑 Requesting new access token for uploadData`);
      console.log(`🔧 Using appId: ${SAJ_CONFIG.appId}`);
      
      const tokenResponse = await axios.get(`${SAJ_CONFIG.baseUrl}/access_token`, {
        params: {
          appId: SAJ_CONFIG.appId,
          appSecret: SAJ_CONFIG.appSecret
        },
        headers: SAJ_CONFIG.headers,
        timeout: 10000
      });
      
      console.log(`🔑 Token response code: ${tokenResponse.data.code}`);
      console.log(`🔑 Token response message: ${tokenResponse.data.msg || 'No message'}`);
      
      if (tokenResponse.data.code !== 200) {
        console.error(`❌ Token request failed:`, tokenResponse.data);
        throw new Error(`Failed to get access token: ${tokenResponse.data.msg || tokenResponse.data.code}`);
      }
      
      const tokenData = tokenResponse.data.data;
      accessToken = tokenData?.access_token;
      
      if (!accessToken) {
        console.error(`❌ No access token in response:`, tokenResponse.data);
        throw new Error('Access token not found in response');
      }
      
      // Store the new token in database for sharing
      try {
        const client = await getDBClient();
        await client.connect();
        
        // Deactivate old tokens
        await client.query('UPDATE saj_tokens SET is_active = FALSE WHERE is_active = TRUE');
        
        // Insert new token
        const expiresAt = new Date(Date.now() + (tokenData.expires * 1000));
        await client.query(
          'INSERT INTO saj_tokens (access_token, expires_at) VALUES ($1, $2)',
          [accessToken, expiresAt]
        );
        
        await client.end();
        console.log(`✅ New access token obtained and cached: ${accessToken.substring(0, 20)}...`);
      } catch (dbError) {
        console.log(`⚠️ Failed to cache token: ${dbError.message}`);
      }
    }
    
    console.log(`✅ Access token obtained: ${accessToken.substring(0, 20)}...`);
    const clientSign = generateClientSign(deviceSn);
    console.log(`🔐 Generated client signature: ${clientSign.substring(0, 20)}...`);

    // Get upload data using NEW API endpoint
    console.log(`📡 Making uploadData API call...`);
    const response = await axios.get(`${SAJ_CONFIG.baseUrl}/device/uploadData`, {
      params: {
        deviceSn,
        startTime,
        endTime,
        timeUnit: parseInt(timeUnit)
      },
      headers: {
        ...SAJ_CONFIG.headers,
        accessToken: accessToken,
        clientSign: clientSign
      },
      timeout: 30000 // Longer timeout for historical data
    });

    console.log(`📡 UploadData API response code: ${response.data.code}`);
    console.log(`📊 Data points received: ${response.data.data ? response.data.data.length : 0}`);

    if (response.data.code === 200) {
      console.log(`✅ Upload data retrieved successfully`);
      
      // Add metadata about the request for analysis
      const responseWithMeta = {
        ...response.data,
        requestInfo: {
          deviceSn,
          startTime,
          endTime,
          timeUnit: parseInt(timeUnit),
          timeUnitName: ['minute', 'day', 'month', 'year'][timeUnit] || 'unknown',
          dataPoints: response.data.data ? response.data.data.length : 0
        }
      };
      
      res.json(responseWithMeta);
    } else {
      // Handle specific SAJ API error codes
      console.log(`❌ SAJ API returned error code: ${response.data.code}, message: ${response.data.msg}`);
      
      let httpStatus = 500;
      let userMessage = response.data.msg || 'Unknown API error';
      
      // Handle specific SAJ API error codes
      if (response.data.code === 200010) {
        httpStatus = 401;
        userMessage = 'Authentication failed - invalid token or expired session';
      } else if (response.data.code === 200011) {
        httpStatus = 403;
        userMessage = 'Access forbidden - invalid device or insufficient permissions';
      } else if (response.data.code === 200001) {
        httpStatus = 400;
        userMessage = 'Invalid request parameters';
      }
      
      res.status(httpStatus).json({
        error: 'SAJ API Error',
        message: userMessage,
        code: response.data.code,
        originalMessage: response.data.msg
      });
    }

  } catch (error) {
    console.error('❌ Failed to get upload data:', error.message);

    if (error.response) {
      res.status(error.response.status).json({
        error: 'SAJ API Error',
        message: error.response.data?.msg || error.message,
        status: error.response.status
      });
    } else {
      res.status(500).json({
        error: 'Failed to get upload data',
        message: error.message
      });
    }
  }
});

// Get current token information from database
router.get('/saj/token/status', async (req, res) => {
  try {
    console.log('🔍 Checking current token status...');

    const client = await getDBClient();
    await client.connect();

    const tokenResult = await client.query(
      'SELECT access_token, expires_at, created_at, is_active FROM saj_tokens WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 1'
    );

    await client.end();

    if (tokenResult.rows.length > 0) {
      const token = tokenResult.rows[0];
      const now = new Date();
      const expiresAt = new Date(token.expires_at);
      const isExpired = expiresAt <= now;

      res.json({
        hasToken: true,
        isActive: token.is_active,
        isExpired: isExpired,
        expiresAt: token.expires_at,
        createdAt: token.created_at,
        timeUntilExpiry: isExpired ? 0 : Math.floor((expiresAt - now) / 1000), // seconds
        tokenPreview: token.access_token ? `${token.access_token.substring(0, 20)}...` : null
      });
    } else {
      res.json({
        hasToken: false,
        isActive: false,
        isExpired: true,
        message: 'No cached token found'
      });
    }

  } catch (error) {
    console.error('❌ Failed to get token status:', error.message);
    res.status(500).json({
      error: 'Failed to get token status',
      message: error.message
    });
  }
});

module.exports = router;