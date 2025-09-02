const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static('public'));
app.use('/design-system', express.static('design-system'));

// API Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SAJ API Monitor',
    version: '1.0.0'
  });
});

// Welcome dashboard
app.get('/', (req, res) => {
  res.json({
    message: '🌞 Welcome to SAJ Solar API Monitor',
    description: 'Monitor your SAJ solar inverter devices in real-time',
    features: [
      '📊 Device monitoring dashboard',
      '⚡ Real-time energy data',
      '📱 Mobile-responsive interface',
      '🔄 Automatic device synchronization',
      '⚠️ Alarm and status monitoring'
    ],
    endpoints: {
      health: '/health',
      devices: '/api/devices',
      realtime: '/api/devices/:deviceSn/realtime',
      sync: '/api/sync'
    },
    status: 'ready'
  });
});

// API Routes placeholder
app.use('/api', (req, res, next) => {
  // API routes will be implemented here
  res.status(200).json({
    message: 'SAJ API endpoints coming soon',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`🌞 SAJ API Monitor running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  
  // Test database connection on startup
  if (process.env.DATABASE_URL) {
    require('./railway-db-test.js');
  }
});

module.exports = app;