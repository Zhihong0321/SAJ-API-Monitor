-- SAJ Solar Monitor - Device Table Migration
-- Based on SAJ-API-Schemas.json deviceListResponse

-- Create devices table matching SAJ API device list schema
CREATE TABLE IF NOT EXISTS saj_devices (
  id SERIAL PRIMARY KEY,
  device_sn VARCHAR(50) UNIQUE NOT NULL,
  device_type VARCHAR(20) NOT NULL,
  plant_id VARCHAR(50) NOT NULL,
  plant_name VARCHAR(255) NOT NULL,
  is_online INTEGER DEFAULT 0,
  is_alarm INTEGER DEFAULT 0,
  country VARCHAR(100) NOT NULL,
  client_sign VARCHAR(64), -- Pre-calculated client signature
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_saj_devices_device_sn ON saj_devices(device_sn);
CREATE INDEX IF NOT EXISTS idx_saj_devices_plant_id ON saj_devices(plant_id);
CREATE INDEX IF NOT EXISTS idx_saj_devices_status ON saj_devices(is_online, is_alarm);

-- Create tokens table for access token management
CREATE TABLE IF NOT EXISTS saj_tokens (
  id SERIAL PRIMARY KEY,
  access_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Add is_active column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='saj_tokens' AND column_name='is_active') THEN
        ALTER TABLE saj_tokens ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Create token requests tracking table
CREATE TABLE IF NOT EXISTS saj_token_requests (
  id SERIAL PRIMARY KEY,
  request_time TIMESTAMP DEFAULT NOW(),
  user_id INTEGER,
  endpoint_called VARCHAR(255),
  success BOOLEAN,
  error_message TEXT,
  token_used VARCHAR(100)
);

-- Create device sync history table
CREATE TABLE IF NOT EXISTS saj_sync_history (
  id SERIAL PRIMARY KEY,
  sync_started_at TIMESTAMP DEFAULT NOW(),
  sync_completed_at TIMESTAMP,
  total_devices_from_api INTEGER,
  new_devices_added INTEGER,
  devices_updated INTEGER,
  success BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  pages_processed INTEGER DEFAULT 0
);

-- Comments for table documentation
COMMENT ON TABLE saj_devices IS 'SAJ solar inverter devices synchronized from API';
COMMENT ON COLUMN saj_devices.device_sn IS 'Unique device serial number from SAJ API';
COMMENT ON COLUMN saj_devices.device_type IS 'Device model type (S12, R5, R6, R6S, etc.)';
COMMENT ON COLUMN saj_devices.plant_id IS 'Plant/installation ID from SAJ API';
COMMENT ON COLUMN saj_devices.plant_name IS 'Customer/plant name from SAJ API';
COMMENT ON COLUMN saj_devices.is_online IS 'Online status: 1=online, 0=offline';
COMMENT ON COLUMN saj_devices.is_alarm IS 'Alarm status: 1=alarm active, 0=no alarm';
COMMENT ON COLUMN saj_devices.client_sign IS 'Pre-calculated SHA256 signature for API calls';