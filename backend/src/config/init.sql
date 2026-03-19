-- POLOPS Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles enum
CREATE TYPE user_role AS ENUM ('senior_planner', 'field_officer', 'supervisor');
CREATE TYPE op_status AS ENUM ('draft', 'pending', 'active', 'closed', 'cancelled');
CREATE TYPE op_type AS ENUM ('bandobast', 'patrolling', 'vip_escort', 'anti_crime', 'traffic', 'naka_checking');
CREATE TYPE priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE officer_status AS ENUM ('available', 'on_duty', 'on_leave', 'sick', 'suspended');
CREATE TYPE alert_severity AS ENUM ('info', 'low', 'medium', 'high', 'critical');
CREATE TYPE shift_type AS ENUM ('morning', 'afternoon', 'night');

-- Officers / Users
CREATE TABLE officers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_number VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  rank VARCHAR(50) NOT NULL,
  role user_role NOT NULL DEFAULT 'field_officer',
  sector VARCHAR(50),
  phone VARCHAR(15),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  status officer_status DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Operations
CREATE TABLE operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  op_code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  type op_type NOT NULL,
  status op_status DEFAULT 'draft',
  priority priority DEFAULT 'medium',
  location TEXT NOT NULL,
  sector VARCHAR(50),
  zone VARCHAR(50),
  brief TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  actual_end_time TIMESTAMPTZ,
  officers_required INT DEFAULT 1,
  vehicles_required INT DEFAULT 0,
  radio_channel VARCHAR(20),
  commanding_officer_id UUID REFERENCES officers(id),
  created_by UUID REFERENCES officers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assignments (Officer <-> Operation)
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id UUID REFERENCES operations(id) ON DELETE CASCADE,
  officer_id UUID REFERENCES officers(id),
  shift shift_type,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES officers(id),
  UNIQUE(operation_id, officer_id)
);

-- Alerts / Incidents
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_code VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  severity alert_severity DEFAULT 'medium',
  location TEXT,
  sector VARCHAR(50),
  operation_id UUID REFERENCES operations(id),
  raised_by UUID REFERENCES officers(id),
  resolved_by UUID REFERENCES officers(id),
  resolved_at TIMESTAMPTZ,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Closing Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id UUID REFERENCES operations(id) UNIQUE,
  outcome VARCHAR(50) NOT NULL,
  arrests_made INT DEFAULT 0,
  incidents_count INT DEFAULT 0,
  officer_injuries INT DEFAULT 0,
  vehicles_checked INT DEFAULT 0,
  commanding_officer_remarks TEXT,
  submitted_by UUID REFERENCES officers(id),
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patrol beats
CREATE TABLE patrol_beats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beat_code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  sector VARCHAR(50),
  zone VARCHAR(50),
  description TEXT
);

-- Patrol logs (check-ins)
CREATE TABLE patrol_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  operation_id UUID REFERENCES operations(id),
  beat_id UUID REFERENCES patrol_beats(id),
  officer_id UUID REFERENCES officers(id),
  vehicle_number VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  notes TEXT,
  checked_in_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_operations_status ON operations(status);
CREATE INDEX idx_operations_sector ON operations(sector);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_resolved ON alerts(is_resolved);
CREATE INDEX idx_assignments_operation ON assignments(operation_id);
CREATE INDEX idx_patrol_logs_officer ON patrol_logs(officer_id);

-- Seed: default admin officer
INSERT INTO officers (badge_number, name, rank, role, email, password_hash, sector)
VALUES (
  'PNE-0001',
  'Super Admin',
  'SP',
  'senior_planner',
  'admin@polops.gov.in',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
  'HQ'
);
