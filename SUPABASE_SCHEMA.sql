-- ==================================================
-- 5G MEC SERVER DATABASE SCHEMA
-- Technology: Supabase (PostgreSQL + Real-time)
-- ==================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================================================
-- Table: patients
-- Purpose: Patient demographics and room assignments
-- ==================================================
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  room_id TEXT,
  admission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  discharge_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'discharged', 'transferred')),
  contact_number TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  blood_type TEXT,
  allergies JSONB DEFAULT '[]'::jsonb,
  current_medications JSONB DEFAULT '[]'::jsonb,
  medical_conditions JSONB DEFAULT '[]'::jsonb,
  doctor_assigned TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_patients_room ON patients(room_id);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_patient_id ON patients(patient_id);

-- ==================================================
-- Table: ai_reports
-- Purpose: Real-time AI monitoring data from edge nodes
-- ==================================================
CREATE TABLE IF NOT EXISTS ai_reports (
  id BIGSERIAL PRIMARY KEY,
  report_id UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  module TEXT NOT NULL CHECK (module IN ('NeoCare-AI', 'GeriCare-AI')),
  status TEXT NOT NULL,
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),
  timestamp BIGINT NOT NULL,
  predictions JSONB,
  bbox JSONB,
  alert_level TEXT DEFAULT 'normal' CHECK (alert_level IN ('normal', 'warning', 'critical')),
  alert_count INTEGER DEFAULT 0,
  person_ids JSONB,
  metadata JSONB,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Edge node information
  edge_node_id TEXT,
  edge_node_type TEXT
);

-- Indexes for real-time queries
CREATE INDEX idx_reports_room ON ai_reports(room_id);
CREATE INDEX idx_reports_patient ON ai_reports(patient_id);
CREATE INDEX idx_reports_timestamp ON ai_reports(timestamp DESC);
CREATE INDEX idx_reports_alert_level ON ai_reports(alert_level);
CREATE INDEX idx_reports_created ON ai_reports(created_at DESC);

-- ==================================================
-- Table: consultations
-- Purpose: Video consultation sessions via Daily.co
-- ==================================================
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  room_id TEXT NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  doctor_id TEXT,
  doctor_name TEXT,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  connection_quality TEXT CHECK (connection_quality IN ('excellent', 'good', 'fair', 'poor')),
  notes TEXT,
  recorded BOOLEAN DEFAULT FALSE,
  recording_url TEXT,
  
  -- Daily.co specific
  daily_room_name TEXT,
  daily_room_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_consultations_room ON consultations(room_id);
CREATE INDEX idx_consultations_patient ON consultations(patient_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_start ON consultations(start_time DESC);

-- ==================================================
-- Table: room_status
-- Purpose: Current status of each room (aggregated)
-- ==================================================
CREATE TABLE IF NOT EXISTS room_status (
  id BIGSERIAL PRIMARY KEY,
  room_id TEXT NOT NULL UNIQUE,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'stable' CHECK (status IN ('stable', 'warning', 'critical')),
  
  -- Vital signs (latest)
  heart_rate INTEGER,
  spo2 INTEGER,
  temperature REAL,
  respiratory_rate INTEGER,
  blood_pressure TEXT,
  
  -- AI monitoring
  last_ai_status TEXT,
  last_ai_confidence REAL,
  last_ai_update TIMESTAMPTZ,
  
  -- Connected edge node
  connected_edge_node TEXT,
  edge_node_online BOOLEAN DEFAULT FALSE,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_room_status_room ON room_status(room_id);

-- ==================================================
-- Table: edge_nodes
-- Purpose: Track all connected edge nodes
-- ==================================================
CREATE TABLE IF NOT EXISTS edge_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id TEXT UNIQUE NOT NULL,
  node_type TEXT NOT NULL CHECK (node_type IN ('control_center', 'consultation_station', 'neocare_ai', 'gericare_ai')),
  node_name TEXT,
  
  -- Network info
  ip_address TEXT,
  mac_address TEXT,
  
  -- Status
  online BOOLEAN DEFAULT FALSE,
  last_heartbeat TIMESTAMPTZ,
  
  -- Capabilities
  has_camera BOOLEAN DEFAULT FALSE,
  has_arduino BOOLEAN DEFAULT FALSE,
  
  -- Assignment
  assigned_rooms TEXT[], -- Array of room IDs
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_edge_nodes_online ON edge_nodes(online);
CREATE INDEX idx_edge_nodes_type ON edge_nodes(node_type);

-- ==================================================
-- Table: system_logs
-- Purpose: System-wide event logging
-- ==================================================
CREATE TABLE IF NOT EXISTS system_logs (
  id BIGSERIAL PRIMARY KEY,
  log_level TEXT NOT NULL CHECK (log_level IN ('info', 'warning', 'error', 'critical')),
  component TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  edge_node_id TEXT,
  room_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_logs_level ON system_logs(log_level);
CREATE INDEX idx_logs_created ON system_logs(created_at DESC);
CREATE INDEX idx_logs_edge_node ON system_logs(edge_node_id);

-- ==================================================
-- FUNCTIONS & TRIGGERS
-- ==================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_status_updated_at BEFORE UPDATE ON room_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_edge_nodes_updated_at BEFORE UPDATE ON edge_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- REAL-TIME PUBLICATION
-- Enable real-time subscriptions for these tables
-- ==================================================

-- In Supabase Dashboard:
-- 1. Go to Database → Replication
-- 2. Enable real-time for:
--    - ai_reports (for live monitoring updates)
--    - room_status (for room status changes)
--    - consultations (for video call status)
--    - edge_nodes (for node connectivity)

-- ==================================================
-- ROW LEVEL SECURITY (RLS)
-- ==================================================

-- Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE edge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all for authenticated users (API key)
-- For production, create more granular policies

CREATE POLICY "Allow all for service role" ON patients
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow all for service role" ON ai_reports
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow all for service role" ON consultations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow all for service role" ON room_status
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow all for service role" ON edge_nodes
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow all for service role" ON system_logs
  FOR ALL USING (auth.role() = 'service_role');

-- For anon key access (edge nodes)
CREATE POLICY "Allow read for anon" ON ai_reports
  FOR SELECT USING (true);

CREATE POLICY "Allow insert for anon" ON ai_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read for anon" ON room_status
  FOR SELECT USING (true);

CREATE POLICY "Allow read for anon" ON patients
  FOR SELECT USING (true);

-- ==================================================
-- SAMPLE DATA (for testing)
-- ==================================================

-- Insert sample patient
INSERT INTO patients (patient_id, full_name, age, gender, room_id, blood_type)
VALUES 
  ('P001', 'Test Baby', 1, 'male', 'R1', 'O+'),
  ('P002', 'Elderly Patient', 75, 'female', 'R2', 'A+')
ON CONFLICT (patient_id) DO NOTHING;

-- Insert sample room status
INSERT INTO room_status (room_id, patient_id, status, edge_node_online)
VALUES 
  ('R1', (SELECT id FROM patients WHERE patient_id = 'P001'), 'stable', FALSE),
  ('R2', (SELECT id FROM patients WHERE patient_id = 'P002'), 'stable', FALSE),
  ('R3', NULL, 'stable', FALSE),
  ('R4', NULL, 'stable', FALSE)
ON CONFLICT (room_id) DO NOTHING;

-- ==================================================
-- SETUP COMPLETE
-- ==================================================

-- Next steps in Supabase Dashboard:
-- 1. Go to Database → Replication
-- 2. Enable real-time for: ai_reports, room_status, consultations, edge_nodes
-- 3. Go to Settings → API
-- 4. Copy your API URL and anon key
-- 5. Add to .env.local in your Next.js app
