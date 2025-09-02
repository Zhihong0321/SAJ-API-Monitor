const axios = require('axios');

// Quick test of one uploadData call
async function quickTest() {
  try {
    // Test day data - most likely to work and useful for charts
    const url = 'https://saj-api-monitor-production.up.railway.app/api/devices/R5X2602J2516E27344/uploadData';
    
    console.log('🧪 Testing uploadData API (Day Data)...');
    console.log('📡 URL:', url);
    
    const params = {
      startTime: '2025-08-26 00:00:00',
      endTime: '2025-09-02 23:59:59', 
      timeUnit: 1 // Day data
    };
    
    console.log('📋 Parameters:', params);
    
    const response = await axios.get(url, { 
      params,
      timeout: 30000,
      validateStatus: function (status) {
        return status < 500; // Don't reject on 4xx errors, we want to analyze them
      }
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📋 Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.code === 200) {
      console.log('✅ SUCCESS! Upload data endpoint works!');
      console.log('📈 Data points:', response.data.data?.length || 0);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('🔍 First data point keys:', Object.keys(response.data.data[0]));
      }
    } else {
      console.log('❌ API Error - but we got a response to analyze!');
    }
    
  } catch (error) {
    console.log('❌ Request completely failed:', error.message);
    if (error.response) {
      console.log('📊 Error Response:', error.response.data);
    }
  }
}

quickTest();