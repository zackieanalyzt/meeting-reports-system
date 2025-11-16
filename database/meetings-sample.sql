-- ========================================
-- Sample Meetings for Testing New Workflow
-- การประชุมตัวอย่างสำหรับทดสอบ Flow ใหม่
-- ========================================

-- การประชุมที่สร้างแล้วแต่ยังไม่มีวาระและรายงาน
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
    '5/2568',
    'การประชุมคณะกรรมการประจำเดือน พฤษภาคม 2568',
    '2025-05-15',
    '09:30:00',
    'ห้องประชุมดอกปีบ สำนักงานสาธารณสุขจังหวัดลำพูน',
    'สำนักงานสาธารณสุขจังหวัดลำพูน',
    '',
    0
),
(
    '6/2568',
    'การประชุมเร่งด่วนเรื่องงบประมาณประจำปี 2569',
    '2025-05-20',
    '14:00:00',
    'ห้องประชุมสักทอง สำนักงานสาธารณสุขจังหวัดลำพูน',
    'สำนักงานสาธารณสุขจังหวัดลำพูน',
    '',
    0
),
(
    '7/2568',
    'การประชุมคณะกรรมการพัฒนาคุณภาพบริการ',
    '2025-06-10',
    '10:00:00',
    'ห้องประชุมดอกปีบ สำนักงานสาธารณสุขจังหวัดลำพูน',
    'สำนักงานสาธารณสุขจังหวัดลำพูน',
    '',
    0
)
ON CONFLICT (meeting_number) DO NOTHING;

-- ========================================
-- Verify Data
-- ========================================

-- แสดงการประชุมทั้งหมดพร้อมสถานะ
SELECT 
    m.id,
    m.meeting_number,
    m.meeting_title,
    m.meeting_date,
    m.meeting_time,
    m.location,
    (SELECT COUNT(*) FROM meeting_agendas WHERE meeting_number = m.meeting_number) as agenda_count,
    (CASE WHEN m.file_size > 0 THEN 'มีรายงาน' ELSE 'ยังไม่มีรายงาน' END) as report_status
FROM meeting_reports m
ORDER BY m.meeting_date DESC;

-- แสดงการประชุมที่ยังไม่มีรายงาน
SELECT 
    meeting_number,
    meeting_title,
    meeting_date
FROM meeting_reports
WHERE file_size = 0 OR file_size IS NULL
ORDER BY meeting_date DESC;

-- แสดงการประชุมที่มีวาระแล้ว
SELECT 
    m.meeting_number,
    m.meeting_title,
    COUNT(a.id) as agenda_count
FROM meeting_reports m
LEFT JOIN meeting_agendas a ON m.meeting_number = a.meeting_number
GROUP BY m.meeting_number, m.meeting_title
HAVING COUNT(a.id) > 0
ORDER BY m.meeting_date DESC;

-- ========================================
-- Useful Queries for New Workflow
-- ========================================

-- Query 1: การประชุมที่พร้อมเพิ่มวาระ (สร้างแล้ว)
-- SELECT meeting_number, meeting_title, meeting_date
-- FROM meeting_reports
-- ORDER BY meeting_date DESC;

-- Query 2: การประชุมที่ยังไม่มีรายงาน (สำหรับอัพโหลด)
-- SELECT id, meeting_number, meeting_title, meeting_date
-- FROM meeting_reports
-- WHERE file_size = 0 OR file_size IS NULL
-- ORDER BY meeting_date DESC;

-- Query 3: การประชุมพร้อมสถิติ
-- SELECT 
--     m.*,
--     (SELECT COUNT(*) FROM meeting_agendas WHERE meeting_number = m.meeting_number) as agenda_count,
--     (CASE WHEN m.file_size > 0 THEN true ELSE false END) as has_report
-- FROM meeting_reports m
-- ORDER BY m.meeting_date DESC;

-- Query 4: การประชุมที่กำลังจะมาถึง
-- SELECT meeting_number, meeting_title, meeting_date
-- FROM meeting_reports
-- WHERE meeting_date > CURRENT_DATE
-- ORDER BY meeting_date ASC;
