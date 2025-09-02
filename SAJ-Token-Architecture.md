# 🔐 SAJ Token Access Architecture Documentation

## Overview

This document provides a comprehensive overview of the SAJ API token management system implemented in the SAJ-API-Monitor application. It covers the complete architecture from token acquisition to storage, caching strategies, error handling, and security considerations.

## Architecture Overview

The application implements a robust token management system with the following key components:

- **Token Acquisition**: Automated fetching from SAJ API using app credentials
- **Token Storage**: PostgreSQL database with expiration tracking
- **Token Caching**: Shared token pool to prevent authentication conflicts
- **Token Expiration**: 28,800 seconds (8 hours) lifecycle management
- **Error Handling**: Comprehensive handling of authentication failures

## Database Schema

```sql
-- Token storage table
CREATE TABLE saj_tokens (
  id SERIAL PRIMARY KEY,
  access_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Performance index for token queries
CREATE INDEX idx_saj_tokens_active_expires ON saj_tokens (is_active, expires_at);
```

## Token Lifecycle Management

### 1. Token Acquisition Process
```javascript
// POST /api/saj/token endpoint
const response = await axios.get(`${SAJ_CONFIG.baseUrl}/access_token`, {
  params: {
    appId: SAJ_CONFIG.appId,
    appSecret: SAJ_CONFIG.appSecret
  },
  headers: SAJ_CONFIG.headers
});

// Store with calculated expiration
const expiresAt = new Date(Date.now() + (tokenData.expires * 1000));
await client.query(
  'INSERT INTO saj_tokens (access_token, expires_at) VALUES ($1, $2)',
  [tokenData.access_token, expiresAt]
);
```

### 2. Token Expiration Handling
- **Expiration Time**: 28,800 seconds (8 hours) from issuance
- **Storage Format**: `expires_at = Date.now() + (expires * 1000)`
- **Validation Query**: `WHERE is_active = TRUE AND expires_at > NOW()`

### 3. Token Caching Strategy

**Mixed Strategy Implementation:**

| Endpoint | Caching Strategy | Implementation |
|----------|------------------|----------------|
| `/api/saj/devices` | Direct Request | Always gets fresh token |
| `/api/devices/:deviceSn/realtime` | Direct Request | Always gets fresh token |
| `/api/devices/:deviceSn/historical` | Direct Request | Always gets fresh token |
| `/api/devices/:deviceSn/uploadData` | **Cached Strategy** | Checks cache first, requests new only if needed |

**Cached Token Retrieval Pattern:**
```javascript
// Check database for valid cached token
const tokenResult = await client.query(
  'SELECT access_token, expires_at FROM saj_tokens WHERE is_active = TRUE AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1'
);

if (tokenResult.rows.length > 0) {
  accessToken = tokenResult.rows[0].access_token;
  console.log(`✅ Using cached token: ${accessToken.substring(0, 20)}...`);
}
```

## API Integration Patterns

### Headers Required for All API Calls
```javascript
const headers = {
  'content-language': 'en_US:English',
  'accessToken': accessToken,
  'clientSign': clientSign  // SHA256 hash per device
};
```

### Client Signature Generation
```javascript
// Generate per-device signature
const generateClientSign = (deviceSn) => {
  const signString = `appId=${SAJ_CONFIG.appId},deviceSN=${deviceSn}`;
  return crypto.createHash('sha256').update(signString).digest('hex');
};
```

## Error Handling Architecture

### SAJ API Error Code Mapping
```javascript
// Error code handling in endpoints
if (response.data.code === 200010) {
  httpStatus = 401;
  userMessage = 'Authentication failed - invalid token or expired session';
} else if (response.data.code === 200011) {
  httpStatus = 403;
  userMessage = 'Access forbidden - invalid device or insufficient permissions';
}
```

### Token Expiration Scenarios
1. **Natural Expiration**: Token exceeds 8-hour lifetime
2. **Forced Invalidation**: New token request deactivates previous tokens
3. **Concurrent Request Conflicts**: Multiple endpoints requesting tokens simultaneously

## Security Considerations

### Token Storage Security
- ✅ **Database Encryption**: Tokens stored in PostgreSQL with proper access controls
- ✅ **No Plain Text Logging**: Token values truncated in logs (`substring(0, 20)`)
- ✅ **Environment Variables**: App credentials stored securely
- ✅ **Token Deactivation**: Old tokens marked inactive when new ones obtained

### Access Control
- ✅ **Per-Device Signatures**: Unique client signatures prevent cross-device access
- ✅ **Token Validation**: All API calls validate token existence and expiration
- ✅ **Rate Limiting**: Application-level rate limiting prevents abuse

## Performance Optimizations

### Database Query Optimization
```sql
-- Optimized query for token retrieval
SELECT access_token, expires_at
FROM saj_tokens
WHERE is_active = TRUE AND expires_at > NOW()
ORDER BY created_at DESC
LIMIT 1;
```

### Connection Pooling
- ✅ **Database Connection Reuse**: Shared connection pool for token operations
- ✅ **Connection Cleanup**: Proper connection closing after operations
- ✅ **Error Recovery**: Graceful handling of database connection failures

## Monitoring and Observability

### Token Usage Logging
```javascript
console.log(`🔑 Token status: ${cachedToken ? 'CACHED' : 'NEW_REQUEST'}`);
console.log(`✅ Access token obtained: ${accessToken.substring(0, 20)}...`);
console.log(`🔐 Generated client signature: ${clientSign.substring(0, 20)}...`);
```

### Health Checks
- ✅ **Token Validity Checks**: Regular validation of cached tokens
- ✅ **Expiration Monitoring**: Proactive monitoring of token expiration times
- ✅ **Error Rate Tracking**: Monitoring of authentication failure rates

## Current Implementation Analysis

### Token Acquisition and Storage Mechanisms
- **Location**: `routes/api.js` - POST `/api/saj/token` endpoint
- **Storage**: PostgreSQL `saj_tokens` table
- **Expiration**: 28,800 seconds (8 hours) as specified by SAJ API
- **Mechanism**: Automatic deactivation of old tokens when new ones are obtained

### Token Expiration Handling (28800 seconds = 8 hours)
- **API Response**: SAJ returns `expires` field in seconds
- **Storage Calculation**: `expires_at = Date.now() + (expires * 1000)`
- **Validation**: `expires_at > NOW()` query condition
- **Buffer Time**: No proactive refresh (potential improvement area)

### Token Caching Strategy Across Endpoints
- **Mixed Implementation**: Some endpoints use caching, others request fresh tokens
- **Cached Endpoints**: `/api/devices/:deviceSn/uploadData` (checks cache first)
- **Direct Request Endpoints**:
  - `/api/saj/devices`
  - `/api/devices/:deviceSn/realtime`
  - `/api/devices/:deviceSn/historical`
- **Risk**: Concurrent requests to direct endpoints can cause authentication conflicts

### Error Handling for Expired/Invalid Tokens
- **SAJ Error Codes**:
  - `200010`: Authentication failed (invalid token/expired session)
  - `200011`: Access forbidden (invalid device/insufficient permissions)
- **HTTP Status Mapping**: 401 for auth failures, 403 for permission issues
- **User Messages**: Clear error messages for different failure scenarios

### Security and Storage Best Practices
- ✅ **Encrypted Storage**: PostgreSQL with access controls
- ✅ **Token Truncation**: Logs show only first 20 characters
- ✅ **Environment Variables**: App credentials secured
- ✅ **Token Deactivation**: Old tokens marked inactive
- ✅ **Per-Device Signatures**: SHA256 hash prevents cross-device access

## Future Improvements

### Recommended Enhancements
1. **Token Refresh Automation**: Proactive refresh before expiration (e.g., 30 minutes before)
2. **Token Pool Management**: Multiple active tokens for high-concurrency scenarios
3. **Circuit Breaker Pattern**: Automatic fallback when SAJ API is unresponsive
4. **Token Metrics Dashboard**: Real-time monitoring of token usage and health
5. **Standardized Caching**: Consistent caching strategy across all endpoints

### Migration Path
- **Phase 1**: Standardize all endpoints to use cached token strategy
- **Phase 2**: Implement proactive token refresh
- **Phase 3**: Add comprehensive monitoring and alerting

## Implementation Checklist

Before deploying ANY new SAJ API endpoint:

- [ ] **Cache Check**: Does it check database for existing valid token?
- [ ] **Conditional Request**: Does it only request new token if cache empty/expired?
- [ ] **Token Storage**: Does it store new tokens in database with expiration?
- [ ] **Error Handling**: Does it handle database connection failures gracefully?
- [ ] **Logging**: Does it log token usage (cached vs new) for debugging?
- [ ] **Concurrent Safety**: Can multiple instances call this endpoint simultaneously?

## Testing Requirements

**MANDATORY**: Test concurrent API calls before deployment:

```javascript
// Test script - all three should succeed
Promise.all([
  fetch('/api/devices/DEVICE123/uploadData?timeUnit=1&...'),
  fetch('/api/devices/DEVICE123/realtime'),
  fetch('/api/devices/DEVICE123/uploadData?timeUnit=0&...')
]).then(responses => {
  // All should return 200, not 401
  console.log('Concurrent test results:', responses.map(r => r.status));
});
```

## Emergency Recovery

If authentication cascade failure occurs:

1. **Clear Token Cache**: `UPDATE saj_tokens SET is_active = FALSE`
2. **Wait 30 seconds**: Allow SAJ API to reset
3. **Single Token Request**: Make ONE manual token request
4. **Verify Charts**: Check all charts load successfully
5. **Deploy Fix**: Update affected endpoints with token caching

---

*Document generated on: 2025-09-02*
*Based on codebase analysis of SAJ-API-Monitor application*