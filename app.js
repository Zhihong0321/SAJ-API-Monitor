const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware with CSP configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
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

// HTML Page Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/sync', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'sync.html'));
});

app.get('/devices', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'devices.html'));
});

app.get('/plants', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'plants.html'));
});

app.get('/plant-sync', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'plant-sync.html'));
});

app.get('/plant-generation', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'plant-generation.html'));
});

app.get('/offline-devices', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'offline-devices.html'));
});

app.get('/device/:deviceSn', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'device.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

// Debug page for troubleshooting
app.get('/debug', (req, res) => {
  res.sendFile(path.join(__dirname, 'debug-sync.html'));
});

// Manual migration endpoint for fixing database issues
app.get('/migrate', async (req, res) => {
  try {
    console.log('🗄️ Manual migration requested...');
    const { runMigrations } = require('./database/migrate.js');
    await runMigrations();
    res.json({ 
      success: true, 
      message: 'Database migrations completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Manual migration failed:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Migration failed', 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Status endpoint for testing
app.get('/api/status', (req, res) => {
  res.json({
    message: '🌞 SAJ API Monitor - API Status',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      devices: '/api/devices',
      sync: '/api/devices/sync',
      token: '/api/saj/token'
    }
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

app.listen(PORT, async () => {
  console.log(`🌞 SAJ API Monitor running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔧 Debug page: http://localhost:${PORT}/debug`);
  
  // Auto-run database migration on startup
  if (process.env.DATABASE_URL) {
    console.log('🗄️ Running database migrations...');
    try {
      const { runMigrations } = require('./database/migrate.js');
      await runMigrations();
      console.log('✅ Database ready!');
    } catch (error) {
      console.error('❌ Database migration failed:', error.message);
    }
  }
});

module.exports = app;