-- SAJ Solar Monitor - Plants Table Migration  
-- Based on SAJ API plant page response structure

-- Create plants table matching SAJ API plant schema
CREATE TABLE IF NOT EXISTS saj_plants (
  id SERIAL PRIMARY KEY,
  plant_id VARCHAR(50) UNIQUE NOT NULL,
  plant_no VARCHAR(50),
  plant_name VARCHAR(255),
  remark TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_saj_plants_plant_id ON saj_plants(plant_id);
CREATE INDEX IF NOT EXISTS idx_saj_plants_plant_no ON saj_plants(plant_no);
CREATE INDEX IF NOT EXISTS idx_saj_plants_plant_name ON saj_plants(plant_name);
CREATE INDEX IF NOT EXISTS idx_saj_plants_remark ON saj_plants(remark) WHERE remark IS NOT NULL;

-- Create plant sync history table
CREATE TABLE IF NOT EXISTS saj_plant_sync_history (
  id SERIAL PRIMARY KEY,
  sync_started_at TIMESTAMP DEFAULT NOW(),
  sync_completed_at TIMESTAMP,
  total_plants_from_api INTEGER,
  new_plants_added INTEGER,
  plants_updated INTEGER,
  success BOOLEAN DEFAULT FALSE,
  error_message TEXT
);

-- Comments for table documentation
COMMENT ON TABLE saj_plants IS 'SAJ solar plants synchronized from API';
COMMENT ON COLUMN saj_plants.plant_id IS 'Unique plant ID from SAJ API';
COMMENT ON COLUMN saj_plants.plant_no IS 'Plant number/code from SAJ API';
COMMENT ON COLUMN saj_plants.plant_name IS 'Plant descriptive name from SAJ API';
COMMENT ON COLUMN saj_plants.remark IS 'Any remarks about the plant (e.g., "plant may be deleted")';

COMMENT ON TABLE saj_plant_sync_history IS 'History of plant synchronization operations';
COMMENT ON COLUMN saj_plant_sync_history.total_plants_from_api IS 'Total plants fetched from API';
COMMENT ON COLUMN saj_plant_sync_history.new_plants_added IS 'Number of new plants added to database';
COMMENT ON COLUMN saj_plant_sync_history.plants_updated IS 'Number of existing plants updated';