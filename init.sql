-- ========================================
-- Meeting Reports System - Database Schema
-- สำนักงานสาธารณสุขจังหวัดลำพูน
-- ========================================

-- Drop table if exists (for development)
DROP TABLE IF EXISTS meeting_reports CASCADE;

-- Create meeting_reports table
CREATE TABLE meeting_reports (
    id SERIAL PRIMARY KEY,
    meeting_number VARCHAR(50) NOT NULL,
    meeting_title VARCHAR(500) NOT NULL,
    meeting_date DATE NOT NULL,
    meeting_time TIME,
    location VARCHAR(300),
    department VARCHAR(200),
    file_path VARCHAR(500),
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_meeting_date ON meeting_reports(meeting_date DESC);
CREATE INDEX idx_meeting_number ON meeting_reports(meeting_number);
CREATE INDEX idx_department ON meeting_reports(department);
CREATE INDEX idx_meeting_title ON meeting_reports USING gin(to_tsvector('thai', meeting_title));

-- Create unique constraint on meeting_number
CREATE UNIQUE INDEX idx_unique_meeting_number ON meeting_reports(meeting_number);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_meeting_reports_updated_at 
    BEFORE UPDATE ON meeting_reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Insert Sample Data
-- ========================================

-- Insert meeting records with ON CONFLICT to prevent duplicates
INSERT INTO meeting_reports (
    meeting_number,
    meeting_title,
    meeting_date,
    meeting_time,
    location,
    department,
    file_path,
    file_size
) VALUES 
(
    '1/2568',
    'รายงานการประชุมคณะกรรมการวางแผนและประเมินผล ครั้งที่ 1/2568',
    '2025-01-15',
    '09:30:00',
    'ห้องประชุมดอกปีบ สำนักงานสาธารณสุขจังหวัดลำพูน',
    'สำนักงานสาธารณสุขจังหวัดลำพูน',
    '/uploads/meeting_1_2568.pdf',
    2150000
),
(
    '2/2568',
    'รายงานการประชุมคณะกรรมการพัฒนาระบบบริการสุขภาพ ครั้งที่ 2/2568',
    '2025-02-20',
    '10:00:00',
    'ห้องประชุมดอกปีบ สำนักงานสาธารณสุขจังหวัดลำพูน',
    'สำนักงานสาธารณสุขจังหวัดลำพูน',
    '/uploads/meeting_2_2568.pdf',
    1980000
),
(
    '3/2568',
    'รายงานการประชุมคณะกรรมการควบคุมโรคติดต่อ ครั้งที่ 3/2568',
    '2025-03-25',
    '13:30:00',
    'ห้องประชุมดอกปีบ สำนักงานสาธารณสุขจังหวัดลำพูน',
    'สำนักงานสาธารณสุขจังหวัดลำพูน',
    '/uploads/meeting_3_2568.pdf',
    2320000
),
(
    '4/2568',
    'รายงานการประชุมคณะกรรมการสาธารณสุขฉุกเฉิน ครั้งที่ 4/2568',
    '2025-04-10',
    '14:00:00',
    'ห้องประชุมดอกปีบ สำนักงานสาธารณสุขจังหวัดลำพูน',
    'สำนักงานสาธารณสุขจังหวัดลำพูน',
    '/uploads/meeting_4_2568.pdf',
    1870000
)
ON CONFLICT (meeting_number) DO NOTHING;

-- ========================================
-- Verify Data
-- ========================================

-- Display inserted records
SELECT 
    id,
    meeting_number,
    meeting_title,
    meeting_date,
    meeting_time,
    location,
    department,
    file_size,
    created_at
FROM meeting_reports
ORDER BY meeting_date DESC;

-- Display record count
SELECT COUNT(*) as total_meetings FROM meeting_reports;

-- ========================================
-- Useful Queries
-- ========================================

-- Search meetings by keyword
-- SELECT * FROM meeting_reports 
-- WHERE meeting_title ILIKE '%คณะกรรมการ%' 
-- OR location ILIKE '%ดอกปีบ%'
-- ORDER BY meeting_date DESC;

-- Get meetings by date range
-- SELECT * FROM meeting_reports 
-- WHERE meeting_date BETWEEN '2025-01-01' AND '2025-12-31'
-- ORDER BY meeting_date DESC;

-- Get meetings by department
-- SELECT * FROM meeting_reports 
-- WHERE department = 'สำนักงานสาธารณสุขจังหวัดลำพูน'
-- ORDER BY meeting_date DESC;
