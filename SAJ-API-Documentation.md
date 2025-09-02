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