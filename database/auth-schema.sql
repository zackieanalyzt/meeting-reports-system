-- ========================================
-- Authentication & Authorization Schema
-- Meeting Management System
-- ========================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ========================================
-- Users Table (สำหรับเก็บ role และสิทธิพิเศษ)
-- ========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_role CHECK (role IN ('secretary', 'manager', 'user'))
);

-- Create index for faster lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- ========================================
-- Audit Logs Table (สำหรับเก็บสถิติการใช้งาน)
-- ========================================
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INTEGER,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_audit_username ON audit_logs(username);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);

-- ========================================
-- Trigger for updating updated_at
-- ========================================
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at_trigger
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();

-- ========================================
-- Insert Sample Users (สำหรับทดสอบ)
-- ========================================
INSERT INTO users (username, role, is_active) VALUES
('admin', 'secretary', true),
('manager1', 'manager', true),
('user1', 'user', true)
ON CONFLICT (username) DO NOTHING;

-- ========================================
-- Add created_by columns to existing tables
-- ========================================
ALTER TABLE meeting_reports 
ADD COLUMN IF NOT EXISTS created_by VARCHAR(100),
ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100);

ALTER TABLE meeting_agendas 
ADD COLUMN IF NOT EXISTS created_by VARCHAR(100),
ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100);

-- ========================================
-- Verify Schema
-- ========================================
SELECT 'Users Table' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Audit Logs Table', COUNT(*) FROM audit_logs;

-- Display sample users
SELECT id, username, role, is_active, created_at FROM users ORDER BY id;
