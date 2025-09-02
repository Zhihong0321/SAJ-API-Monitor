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

module.exports = router;