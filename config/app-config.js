const config = {
  // SAJ Solar API Configuration
  saj: {
    appId: process.env.SAJ_APP_ID || 'VH_3TmblTqb',
    appSecret: process.env.SAJ_APP_SECRET || 'VdtqQAUrVHoKs5hQUpvD4khelTqbBac2eK3VtE4f5GUx3TmbZy7o0JvutUsIsCBf',
    baseUrl: process.env.SAJ_BASE_URL || 'https://intl-developer.saj-electric.com/prod-api/open/api',
    tokenExpiry: 28800, // 8 hours in seconds
    headers: {
      'content-language': 'en_US:English'
    }
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  },

  // Application Configuration
  app: {
    port: parseInt(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_change_in_production'
  },

  // API Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    max: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // Caching Configuration
  cache: {
    redisUrl: process.env.REDIS_URL,
    ttl: parseInt(process.env.CACHE_TTL_SECONDS) || 28800 // 8 hours
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },

  // Client Sign Generation Helper
  generateClientSign: (deviceSn) => {
    const crypto = require('crypto');
    const signString = `appId=${config.saj.appId},deviceSN=${deviceSn}`;
    return crypto.createHash('sha256').update(signString).digest('hex');
  }
};

module.exports = config;