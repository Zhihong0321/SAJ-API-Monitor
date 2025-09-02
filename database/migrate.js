const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database migration runner
async function runMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('🔌 Connected to PostgreSQL database');

    // Read and execute migration file
    const migrationPath = path.join(__dirname, 'migrations', '001_create_devices_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📋 Running database migrations...');
    await client.query(migrationSQL);
    
    console.log('✅ Database migrations completed successfully');
    console.log('📊 Tables created:');
    console.log('  - saj_devices (device storage)');
    console.log('  - saj_tokens (access token management)');
    console.log('  - saj_token_requests (token request tracking)');
    console.log('  - saj_sync_history (sync operation history)');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Run migrations if called directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };