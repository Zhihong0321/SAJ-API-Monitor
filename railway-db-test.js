const { Client } = require('pg');

// Simple Railway PostgreSQL connection test for deployment
async function testRailwayDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🚂 Railway PostgreSQL Connection Test');
    console.log('🔌 Connecting to database...');
    
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT NOW() as timestamp, version() as version');
    console.log('🕒 Database timestamp:', result.rows[0].timestamp);
    console.log('🐘 PostgreSQL version:', result.rows[0].version);
    
    // Test creating SAJ devices table
    await client.query(`
      CREATE TABLE IF NOT EXISTS saj_devices (
        id SERIAL PRIMARY KEY,
        device_sn VARCHAR(50) UNIQUE NOT NULL,
        device_type VARCHAR(20) NOT NULL,
        plant_id VARCHAR(50) NOT NULL,
        plant_name VARCHAR(255) NOT NULL,
        country VARCHAR(100),
        is_online INTEGER DEFAULT 0,
        is_alarm INTEGER DEFAULT 0,
        client_sign VARCHAR(64),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('📋 SAJ devices table ready');
    
    // Test creating access tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS saj_tokens (
        id SERIAL PRIMARY KEY,
        access_token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('🔑 SAJ tokens table ready');
    
    console.log('🎉 Railway PostgreSQL setup complete!');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Connection closed');
  }
}

testRailwayDatabase();