# SAJ Solar Inverter API Documentation

## Overview
This document provides comprehensive API documentation for integrating with SAJ solar inverter monitoring system. The APIs allow access to device lists, real-time data, and status monitoring.

## Base URL
```
https://intl-developer.saj-electric.com/prod-api/open/api
```

## Authentication
All API calls require an access token that expires every 28,800 seconds (8 hours).

### App Credentials
- **App ID**: `VH_3TmblTqb`
- **App Secret**: `VdtqQAUrVHoKs5hQUpvD4khelTqbBac2eK3VtE4f5GUx3TmbZy7o0JvutUsIsCBf`

---

## 1. Get Access Token

### Endpoint
```
GET /access_token
```

### Headers
```
content-language: en_US:English
```

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| appId | string | Yes | Application ID |
| appSecret | string | Yes | Application Secret |

### Request Example
```bash
curl -X GET "https://intl-developer.saj-electric.com/prod-api/open/api/access_token?appId=VH_3TmblTqb&appSecret=VdtqQAUrVHoKs5hQUpvD4khelTqbBac2eK3VtE4f5GUx3TmbZy7o0JvutUsIsCBf" \
-H "content-language: en_US:English"
```

### Response
```json
{
  "code": 200,
  "msg": "request success",
  "data": {
    "access_token": "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKWpFE9+fnlF4OpbM/M9ht5Nfw3jD+YLLEshl+M+rUqn4Sq/Qf/u4VHcvxA+Kf6od/bXtyo5tHKjBvIpdpppiUcCAwEAAQ==",
    "expires": 28800
  }
}
```

---

## 2. Get Device List

### Endpoint
```
GET /developer/device/page
```

### Headers
```
content-language: en_US:English
accessToken: {access_token}
```

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| appId | string | Yes | Application ID |
| pageNum | integer | Yes | Page number (starts from 1) |

### Request Example
```bash
curl -X GET "https://intl-developer.saj-electric.com/prod-api/open/api/developer/device/page?appId=VH_3TmblTqb&pageNum=1" \
-H "content-language: en_US:English" \
-H "accessToken: {your_access_token}"
```

### Response
```json
{
  "total": 47,
  "rows": [
    {
      "deviceSn": "M2S4182G2349E02268",
      "deviceType": "S12",
      "plantId": "23225181132",
      "plantName": "Law How Keong",
      "isOnline": 0,
      "isAlarm": 0,
      "country": "Malaysia"
    }
  ],
  "code": 200,
  "msg": "查询成功",
  "totalPage": 5
}
```

---

## 3. Get Real-Time Device Data

### Endpoint
```
GET /device/realtimeDataCommon
```

### Headers
```
accessToken: {access_token}
content-language: en_US:English
clientSign: {client_signature}
```

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| deviceSn | string | Yes | Device Serial Number |

### Client Signature Generation
The clientSign is generated using SHA256 hash:
```
sha256("appId=VH_3TmblTqb,deviceSN={deviceSn}")
```

### Example Client Sign Generation
```bash
echo -n "appId=VH_3TmblTqb,deviceSN=M2S4182G2349E02268" | sha256sum
# Result: b86e6b979946cb7d99182a3433ca23adf2d59e6d148ddfc3b4322028620aba92
```

### Request Example
```bash
curl -X GET "https://intl-developer.saj-electric.com/prod-api/open/api/device/realtimeDataCommon?deviceSn=M2S4182G2349E02268" \
-H "accessToken: {your_access_token}" \
-H "content-language: en_US:English" \
-H "clientSign: b86e6b979946cb7d99182a3433ca23adf2d59e6d148ddfc3b4322028620aba92"
```

### Response
```json
{
  "code": 200,
  "msg": "request success",
  "data": {
    "deviceSn": "M2S4182G2349E02268",
    "dataTime": "2025-07-13 19:25:00",
    "updateDate": "2025-07-13 19:26:56",
    "isOnline": "0",
    "todayPvEnergy": "9.29",
    "totalPvEnergy": "2374.91",
    "rGridVolt": "240.00",
    "rGridFreq": "50.01",
    "rGridCurr": "0.09",
    "pv1volt": "34.70",
    "pv1curr": "0.01",
    "pv2volt": "34.50",
    "pv2curr": "0.00"
  }
}
```

---

## 4. Get Historical Device Data

### Endpoint
```
GET /device/historyDataCommon
```

### Headers
```
accessToken: {access_token}
content-language: en_US:English
clientSign: {client_signature}
```

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| deviceSn | string | Yes | Device Serial Number |
| startTime | string | Yes | Start time in format: yyyy-MM-dd HH:mm:ss |
| endTime | string | Yes | End time in format: yyyy-MM-dd HH:mm:ss |

### Important Notes
- **Time Interval Limit**: Maximum interval between startTime and endTime is 24 hours
- **Data Granularity**: Returns time-series data points (typically every 5-10 minutes)
- **Rate Limiting**: Implement delays between consecutive requests to avoid rate limits
- **Data Volume**: Each 24-hour period returns 140-160 data points depending on device activity

### Client Signature Generation
The clientSign is generated using SHA256 hash:
```
sha256("appId=VH_3TmblTqb,deviceSN={deviceSn}")
```

### Example Client Sign Generation
```bash
echo -n "appId=VH_3TmblTqb,deviceSN=M2S4182G2349E02278" | sha256sum
# Result: b86e6b979946cb7d99182a3433ca23adf2d59e6d148ddfc3b4322028620aba92
```

### Request Example
```bash
curl -X GET "https://intl-developer.saj-electric.com/prod-api/open/api/device/historyDataCommon?deviceSn=M2S4182G2349E02278&startTime=2025-08-26%2016:00:00&endTime=2025-08-27%2015:59:59" \
-H "accessToken: {your_access_token}" \
-H "content-language: en_US:English" \
-H "clientSign: b86e6b979946cb7d99182a3433ca23adf2d59e6d148ddfc3b4322028620aba92"
```

### Response
```json
{
  "code": 200,
  "msg": "request success",
  "data": [
    {
      "deviceSn": "M2S4182G2349E02278",
      "parallelEnable": 0,
      "parallelMaster": 0,
      "moduleSn": "M5310G2346009798",
      "dataTime": "2025-08-27 11:40:00",
      "invTime": "2025-08-27T03:40Z",
      "meterAStatus": "0",
      "meterAVolt1": "0",
      "meterACurr1": "0",
      "meterAPowerWatt1": "0",
      "meterAPowerVA1": "0",
      "meterAFreq1": "0",
      "meterAVolt2": "0",
      "meterACurr2": "0",
      "meterAPowerWatt2": "0",
      "meterAPowerVA2": "0",
      "meterAFreq2": "0",
      "meterAVolt3": "0",
      "meterACurr3": "0",
      "meterAPowerWatt3": "0",
      "meterAPowerVA3": "0",
      "meterAFreq3": "0",
      "pv1volt": "30.60",
      "pv1curr": "0.00",
      "pv2volt": "33.10",
      "pv2curr": "0.05",
      "pv3volt": "33.00",
      "pv3curr": "0.14",
      "batTempC": "0",
      "batEnergyPercent": "0",
      "batPower": "0",
      "totalPVPower": "12",
      "totalLoadPowerWatt": "0",
      "totalGridPowerWatt": "6",
      "backupTotalLoadPowerWatt": "0",
      "rGridVolt": "239.10",
      "rGridFreq": "50.03",
      "rGridCurr": "0.19",
      "rGridPowerWatt": "6",
      "rInvVolt": "0",
      "rInvCurr": "0",
      "rInvFreq": "0",
      "rInvPowerWatt": "0",
      "sGridVolt": "0",
      "sGridFreq": "0",
      "sGridCurr": "0",
      "sGridPowerWatt": "0",
      "sInvVolt": "0",
      "sInvCurr": "0",
      "sInvFreq": "0",
      "sInvPowerWatt": "0",
      "tGridVolt": "0",
      "tGridCurr": "0",
      "tGridFreq": "0",
      "tGridLPowerWatt": "0",
      "tInvVolt": "0",
      "tInvCurr": "0",
      "tInvFreq": "0",
      "tInvPowerWatt": "0",
      "parallTotalPVMeterEnergy": "0",
      "totalFeedInEnergy": "0",
      "totalTotalLoadEnergy": "0",
      "totalBatDisEnergy": "0",
      "totalBatChgEnergy": "0",
      "pv1power": "0",
      "pv2power": "2",
      "pv3power": "5",
      "pv4power": "0",
      "pv5power": "0",
      "pv6power": "0",
      "pv7power": "0",
      "pv8power": "0",
      "pv9power": "0",
      "pv10power": "0",
      "pv11power": "0",
      "pv12power": "0",
      "pv13power": "0",
      "pv14power": "0",
      "pv15power": "0",
      "pv16power": "0",
      "todayLoadEnergy": "0",
      "todayPvEnergy": "5.51",
      "totalPvEnergy": "3081.9",
      "gridDirection": "-1",
      "todaySellEnergy": "0",
      "todayFeedInEnergy": "0",
      "todayBatDisEnergy": "0",
      "todayBatChgEnergy": "0",
      "batteryDirection": "0",
      "rOutVolt": "0",
      "rOutCurr": "0",
      "rOutFreq": "0",
      "rOutPowerVA": "0",
      "rOutPowerWatt": "0",
      "sOutVolt": "0",
      "sOutCurr": "0",
      "sOutFreq": "0",
      "sOutPowerVA": "0",
      "sOutPowerWatt": "0",
      "tOutVolt": "0",
      "tOutCurr": "0",
      "tOutFreq": "0",
      "tOutPowerVA": "0",
      "tOutPowerWatt": "0",
      "sysGridPowerWatt": "9",
      "sysTotalLoadWatt": "0",
      "totalBatteryPower": "0",
      "tOutPowerWatt": "0",
      "totalSellEnergy": "0",
      "totalGridPowerVA": "0",
      "rGridPowerPF": "0.916",
      "pv4curr": "0.0",
      "pv5curr": "0.0",
      "pv6curr": "0.0",
      "pv7curr": "0.0",
      "pv8curr": "0.0",
      "pv9curr": "0",
      "pv10curr": "0",
      "pv11curr": "0",
      "pv12curr": "0",
      "pv13curr": "0",
      "pv14curr": "0",
      "pv15curr": "0",
      "pv16curr": "0",
      "tGridPowerPF": "0",
      "totalHour": "0.0",
      "iso1": "8687",
      "iso2": "0",
      "iso3": "0",
      "iso4": "0",
      "pf": "0.916",
      "qpower": "5",
      "mpvMode": "2",
      "isOnline": "0",
      "mfaultMSG": "0",
      "hfaultMSG": "",
      "faultMsgList": [],
      "invTempC": "0.0",
      "batCapacity": "",
      "averBat1Vol": "0",
      "averBat1Cur": "0",
      "averBat1SOC": "0",
      "averBat2Vol": "0",
      "averBat2Cur": "0",
      "averBat2SOC": "0",
      "averBat3Vol": "0",
      "averBat3Cur": "0",
      "averBat3SOC": "0",
      "linkSignal": "-76",
      "sinkTempC": "0",
      "ambTempC": "0",
      "bmsUserEnergy": "0",
      "bmsTotalPower": "0",
      "bmsTotalEnergy": "0",
      "batteryGroupDataList": [],
      "todayEquivalentHours": "0",
      "meterBVolt1": "0",
      "meterBCurr1": "0",
      "meterBPowerWatt1": "0",
      "meterBFreq1": "0",
      "meterBVolt2": "0",
      "meterBCurr2": "0",
      "meterBPowerWatt2": "0",
      "meterBFreq2": "0",
      "meterBVolt3": "0",
      "meterBCurr3": "0",
      "meterBPowerWatt3": "0",
      "meterBFreq3": "0",
      "rOnGridOutPowerWatt": "0",
      "rOnGridOutVolt": "0",
      "rOnGridOutCurr": "0",
      "rOnGridOutFreq": "0",
      "sOnGridOutPowerWatt": "0",
      "sOnGridOutVolt": "0",
      "tOnGridOutPowerWatt": "0",
      "tOnGridOutVolt": "0",
      "meterBPowerFactor1": "0",
      "meterBPowerFactor2": "0",
      "meterBPowerFactor3": "0",
      "meterAPowerFactor1": "0",
      "meterAPowerFactor2": "0",
      "meterAPowerFactor3": "0",
      "currentMaxBatPoweLimitSupport": false,
      "currentMaxChargePowerLimit": "-1",
      "currentMaxDisChargePowerLimit": "-1",
      "registerDnsp": false,
      "gridPowerPF": "0",
      "sgridPowerPF": "0"
    }
  ]
}
```

### Historical Data Collection Strategy
For collecting historical data over multiple days:

1. **24-Hour Chunks**: Split date ranges into 24-hour intervals due to API limits
2. **Sequential Requests**: Make requests sequentially with 1-2 second delays
3. **Data Aggregation**: Combine multiple 24-hour chunks into complete datasets
4. **Error Handling**: Implement retry logic for failed requests
5. **Rate Limiting**: Respect API rate limits to avoid blocking

### Example: 7-Day Data Collection
```javascript
// Generate 7 date ranges (24-hour chunks)
const dateRanges = [
  { startTime: "2025-08-26 16:00:00", endTime: "2025-08-27 15:59:59" },
  { startTime: "2025-08-27 16:00:00", endTime: "2025-08-28 15:59:59" },
  // ... continue for 7 days
];

// Make sequential API calls
for (const range of dateRanges) {
  const response = await fetchHistoricalData(deviceSn, range);
  // Process and store data
  await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
}
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 200 | request success | Successful request |
| 500 | Request method 'POST' not supported | Wrong HTTP method used |
| 10006 | Device sn and plant id can not be null at the same time | Missing required parameters |
| 200005 | Device sn and plant id can not be null at the same time | Parameter validation error |

---

## Rate Limits
- Access tokens expire after 28,800 seconds (8 hours)
- Recommend caching access tokens and refreshing before expiration
- Store client signatures in database to avoid regeneration on each call

---

## Implementation Notes

1. **Access Token Management**: 
   - Cache tokens for 8 hours
   - Refresh before expiration
   - Handle token expiration gracefully

2. **Client Signature Storage**:
   - Generate once per device
   - Store in database with device information
   - Format: `sha256("appId=VH_3TmblTqb,deviceSN={deviceSn}")`

3. **Pagination**:
   - Device list API supports pagination
   - Use `totalPage` to determine total pages
   - Iterate through all pages to get complete device list

4. **Device Status Monitoring**:
   - `isOnline`: 1 = online, 0 = offline
   - `isAlarm`: 1 = alarm active, 0 = no alarm
   - Real-time data updates every few minutes

5. **Error Handling**:
   - Always check response `code` field
   - Handle network timeouts and retries
   - Log API errors for debugging