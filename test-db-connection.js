const { Client } = require('pg');
require('dotenv').config();

// Test PostgreSQL connection
async function testDatabaseConnection() {
  // Railway internal URL won't work from local - need to get external URL
  console.log('ℹ️  Note: Railway internal URLs (.railway.internal) only work within Railway environment');
  console.log('   For local testing, you need the external database URL from Railway');
  console.log('   This test demonstrates the connection logic that will work when deployed');
  
  const databaseUrl = process.env.DATABASE_URL || 'postgresql://user:password@host:port/database';
  
  if (!databaseUrl || databaseUrl.includes('user:password@host')) {
    console.log('⚠️  Please set DATABASE_URL environment variable with your Railway PostgreSQL connection string');
    console.log('   You can get this from: railway variables');
    return;
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to PostgreSQL database...');
    await client.connect();
    
    console.log('✅ Database connection successful!');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('🕒 Current time:', result.rows[0].current_time);
    console.log('🐘 PostgreSQL version:', result.rows[0].postgres_version);
    
    // Test creating a simple table
    await client.query(`
      CREATE TABLE IF NOT EXISTS connection_test (
        id SERIAL PRIMARY KEY,
        test_message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Insert test data
    await client.query(
      'INSERT INTO connection_test (test_message) VALUES ($1)',
      ['Railway PostgreSQL connection test successful']
    );
    
    // Read test data
    const testResult = await client.query('SELECT * FROM connection_test ORDER BY created_at DESC LIMIT 1');
    console.log('📝 Test data inserted:', testResult.rows[0]);
    
    // Clean up test table
    await client.query('DROP TABLE connection_test');
    console.log('🧹 Test table cleaned up');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('   Make sure your DATABASE_URL is correct');
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testDatabaseConnection();