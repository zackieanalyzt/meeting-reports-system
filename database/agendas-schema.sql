-- ========================================
-- Meeting Agendas System - Database Schema
-- ระบบจัดการวาระการประชุม
-- ========================================

-- Drop table if exists (for development)
DROP TABLE IF EXISTS meeting_agendas CASCADE;

-- Create meeting_agendas table
CREATE TABLE meeting_agendas (
    id SERIAL PRIMARY KEY,
    meeting_number VARCHAR(50) NOT NULL,
    agenda_number VARCHAR(10) NOT NULL,
    agenda_topic VARCHAR(500) NOT NULL,
    agenda_type VARCHAR(20) NOT NULL,
    submitting_department VARCHAR(200) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meeting_number) REFERENCES meeting_reports(meeting_number) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_agenda_meeting_number ON meeting_agendas(meeting_number);
CREATE INDEX idx_agenda_type ON meeting_agendas(agenda_type);
CREATE INDEX idx_agenda_department ON meeting_agendas(submitting_department);
CREATE INDEX idx_agenda_number ON meeting_agendas(agenda_number);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_agenda_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_meeting_agendas_updated_at 
    BEFORE UPDATE ON meeting_agendas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_agenda_updated_at_column();

-- ========================================
-- Insert Sample Data
-- ========================================

INSERT INTO meeting_agendas (
    meeting_number,
    agenda_number,
    agenda_topic,
    agenda_type,
    submitting_department,
    description,
    file_path,
    file_size
) VALUES 
(
    '1/2568',
    '3',
    'รายงานผลการดำเนินงานไตรมาสที่ 1 ปีงบประมาณ 2568',
    'วาระที่ 3',
    'กลุ่มงานบริหาร',
    'นำเสนอผลการดำเนินงานตามแผนปฏิบัติการประจำปีงบประมาณ 2568 ไตรมาสที่ 1 พร้อมทั้งปัญหาอุปสรรคและแนวทางแก้ไข',
    '/uploads/agenda_1_3.pdf',
    1450000
),
(
    '1/2568',
    '4.1',
    'โครงการปรับปรุงระบบเทคโนโลยีสารสนเทศ',
    'วาระที่ 4',
    'กลุ่มงานสารสนเทศ',
    'เสนอขออนุมัติงบประมาณสำหรับการปรับปรุงระบบ IT และจัดซื้ออุปกรณ์คอมพิวเตอร์ใหม่',
    '/uploads/agenda_1_4_1.pdf',
    2100000
),
(
    '1/2568',
    '4.2',
    'แผนการจัดซื้อยาและเวชภัณฑ์ประจำปี 2568',
    'วาระที่ 4',
    'กลุ่มงานเภสัชกรรม',
    'เสนอแผนการจัดซื้อยาและเวชภัณฑ์สำหรับปีงบประมาณ 2568 พร้อมงบประมาณที่ต้องการ',
    '/uploads/agenda_1_4_2.pdf',
    1890000
),
(
    '1/2568',
    '5',
    'เรื่องร้องเรียนการให้บริการและแนวทางแก้ไข',
    'วาระที่ 5',
    'กลุ่มงานพยาบาล',
    'แจ้งเรื่องร้องเรียนจากผู้รับบริการเกี่ยวกับการให้บริการ พร้อมแนวทางการแก้ไขและป้องกัน',
    '/uploads/agenda_1_5.pdf',
    890000
),
(
    '2/2568',
    '3',
    'รายงานความคืบหน้าโครงการพัฒนาคุณภาพบริการ',
    'วาระที่ 3',
    'กลุ่มงานเภสัชกรรม',
    'รายงานความคืบหน้าการดำเนินงานโครงการพัฒนาคุณภาพบริการด้านเภสัชกรรม',
    '/uploads/agenda_2_3.pdf',
    1670000
),
(
    '2/2568',
    '4',
    'การจัดทำแผนพัฒนาบุคลากร',
    'วาระที่ 4',
    'กลุ่มงานบริหาร',
    'เสนอแผนการพัฒนาบุคลากรประจำปี 2568 รวมถึงการฝึกอบรมและพัฒนาทักษะ',
    '/uploads/agenda_2_4.pdf',
    1320000
),
(
    '3/2568',
    '3',
    'รายงานสถานการณ์โรคติดต่อในพื้นที่',
    'วาระที่ 3',
    'กลุ่มงานควบคุมโรค',
    'รายงานสถานการณ์โรคติดต่อที่สำคัญในพื้นที่รับผิดชอบและมาตรการป้องกันควบคุม',
    '/uploads/agenda_3_3.pdf',
    1550000
)
ON CONFLICT DO NOTHING;

-- ========================================
-- Verify Data
-- ========================================

-- Display inserted records
SELECT 
    id,
    meeting_number,
    agenda_number,
    agenda_topic,
    agenda_type,
    submitting_department,
    file_size,
    created_at
FROM meeting_agendas
ORDER BY meeting_number, agenda_number;

-- Display record count
SELECT COUNT(*) as total_agendas FROM meeting_agendas;

-- Display agendas grouped by meeting
SELECT 
    meeting_number,
    COUNT(*) as agenda_count
FROM meeting_agendas
GROUP BY meeting_number
ORDER BY meeting_number;

-- ========================================
-- Useful Queries
-- ========================================

-- Get agendas by meeting number
-- SELECT * FROM meeting_agendas 
-- WHERE meeting_number = '1/2568'
-- ORDER BY agenda_number;

-- Get agendas by department
-- SELECT * FROM meeting_agendas 
-- WHERE submitting_department = 'กลุ่มงานบริหาร'
-- ORDER BY created_at DESC;

-- Get agendas by type
-- SELECT * FROM meeting_agendas 
-- WHERE agenda_type = 'วาระที่ 4'
-- ORDER BY meeting_number, agenda_number;

-- Get meeting with agendas count
-- SELECT 
--     mr.meeting_number,
--     mr.meeting_title,
--     COUNT(ma.id) as agenda_count
-- FROM meeting_reports mr
-- LEFT JOIN meeting_agendas ma ON mr.meeting_number = ma.meeting_number
-- GROUP BY mr.meeting_number, mr.meeting_title
-- ORDER BY mr.meeting_date DESC;
