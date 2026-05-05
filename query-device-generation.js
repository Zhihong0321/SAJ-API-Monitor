const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

// SAJ API Configuration
const SAJ_CONFIG = {
  baseUrl: 'https://intl-developer.saj-electric.com/prod-api/open/api',
  appId: process.env.SAJ_APP_ID || 'VH_3TmblTqb',
  appSecret: process.env.SAJ_APP_SECRET || 'VdtqQAUrVHoKs5hQUpvD4khelTqbBac2eK3VtE4f5GUx3TmbZy7o0JvutUsIsCBf',
  headers: {
    'content-language': 'en_US:English'
  }
};

// Target device
const TARGET_DEVICE = 'R5X2802J2511E15921';

// Utility function to generate client signature
const generateClientSign = (deviceSn) => {
  const signString = `appId=${SAJ_CONFIG.appId},deviceSN=${deviceSn}`;
  return crypto.createHash('sha256').update(signString).digest('hex');
};

// Get access token
async function getAccessToken() {
  try {
    console.log('🔑 Getting access token...');

    const response = await axios.get(`${SAJ_CONFIG.baseUrl}/access_token`, {
      params: {
        appId: SAJ_CONFIG.appId,
        appSecret: SAJ_CONFIG.appSecret
      },
      headers: SAJ_CONFIG.headers,
      timeout: 10000
    });

    if (response.data.code === 200) {
      console.log('✅ Access token obtained');
      return response.data.data.access_token;
    } else {
      throw new Error(`SAJ API Error: ${response.data.msg}`);
    }
  } catch (error) {
    console.error('❌ Failed to get access token:', error.message);
    throw error;
  }
}

// Get real-time generation data
async function getRealtimeGeneration(accessToken, deviceSn) {
  try {
    console.log(`📊 Getting real-time generation data for device: ${deviceSn}`);

    const clientSign = generateClientSign(deviceSn);

    const response = await axios.get(`${SAJ_CONFIG.baseUrl}/device/realtimeDataCommon`, {
      params: { deviceSn },
      headers: {
        ...SAJ_CONFIG.headers,
        accessToken: accessToken,
        clientSign: clientSign
      },
      timeout: 15000
    });

    if (response.data.code === 200) {
      console.log('✅ Real-time generation data retrieved successfully');
      return response.data;
    } else {
      console.log(`❌ API returned error: ${response.data.msg}`);
      return response.data;
    }
  } catch (error) {
    console.error('❌ Failed to get real-time generation data:', error.message);
    return { error: error.message };
  }
}

// Get historical generation data (last 24 hours)
async function getHistoricalGeneration(accessToken, deviceSn) {
  try {
    console.log(`📊 Getting historical generation data for device: ${deviceSn}`);

    // Get data for the last 24 hours
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

    const startTimeStr = startTime.toISOString().slice(0, 19).replace('T', ' ');
    const endTimeStr = endTime.toISOString().slice(0, 19).replace('T', ' ');

    console.log(`📅 Date range: ${startTimeStr} to ${endTimeStr}`);

    const clientSign = generateClientSign(deviceSn);

    const response = await axios.get(`${SAJ_CONFIG.baseUrl}/device/historyDataCommon`, {
      params: {
        deviceSn,
        startTime: startTimeStr,
        endTime: endTimeStr
      },
      headers: {
        ...SAJ_CONFIG.headers,
        accessToken: accessToken,
        clientSign: clientSign
      },
      timeout: 30000
    });

    if (response.data.code === 200) {
      console.log('✅ Historical generation data retrieved successfully');
      console.log(`📊 Data points: ${response.data.data ? response.data.data.length : 0}`);
      return response.data;
    } else {
      console.log(`❌ API returned error: ${response.data.msg}`);
      return response.data;
    }
  } catch (error) {
    console.error('❌ Failed to get historical generation data:', error.message);
    return { error: error.message };
  }
}

// Main function
async function queryDeviceGeneration() {
  console.log('🔋 SAJ Device Generation Data Query');
  console.log('=====================================');
  console.log(`📱 Target Device: ${TARGET_DEVICE}`);
  console.log('');

  try {
    // Get access token
    const accessToken = await getAccessToken();

    // Get real-time generation data
    console.log('\n📊 REAL-TIME GENERATION DATA:');
    console.log('===============================');
    const realtimeData = await getRealtimeGeneration(accessToken, TARGET_DEVICE);

    // Get historical generation data
    console.log('\n📊 HISTORICAL GENERATION DATA (Last 24h):');
    console.log('===========================================');
    const historicalData = await getHistoricalGeneration(accessToken, TARGET_DEVICE);

    // Display results
    console.log('\n📋 QUERY RESULTS:');
    console.log('=================');

    console.log('\n🔋 REAL-TIME DATA:');
    console.log(JSON.stringify(realtimeData, null, 2));

    console.log('\n📈 HISTORICAL DATA:');
    console.log(JSON.stringify(historicalData, null, 2));

    // Save to file
    const fs = require('fs');
    const result = {
      deviceSn: TARGET_DEVICE,
      queryTime: new Date().toISOString(),
      realtimeData,
      historicalData
    };

    const filename = `generation-data-${TARGET_DEVICE}-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(result, null, 2));
    console.log(`\n💾 Complete results saved to: ${filename}`);

  } catch (error) {
    console.error('💥 Query failed:', error.message);
    process.exit(1);
  }
}

// Run the query
if (require.main === module) {
  queryDeviceGeneration();
}

module.exports = { queryDeviceGeneration, generateClientSign };