# สรุปงาน Prompt 5: SQL และข้อมูลตัวอย่าง

## ภาพรวม
สร้าง SQL script และข้อมูลตัวอย่างสำหรับระบบจัดการรายงานการประชุม สำนักงานสาธารณสุขจังหวัดลำพูน

## ไฟล์ที่สร้าง

### 1. init.sql
SQL script สำหรับสร้างโครงสร้างฐานข้อมูลและข้อมูลตัวอย่าง

#### โครงสร้างตาราง: meeting_reports

| ฟิลด์ | ชนิดข้อมูล | คำอธิบาย |
|------|-----------|---------|
| id | SERIAL PRIMARY KEY | รหัสอัตโนมัติ |
| meeting_number | VARCHAR(50) | เลขที่การประชุม (เช่น 1/2568) |
| meeting_title | VARCHAR(500) | ชื่อการประชุม |
| meeting_date | DATE | วันที่ประชุม |
| meeting_time | TIME | เวลาประชุม |
| location | VARCHAR(300) | สถานที่ประชุม |
| department | VARCHAR(200) | หน่วยงาน |
| file_path | VARCHAR(500) | ที่อยู่ไฟล์ |
| file_size | INTEGER | ขนาดไฟล์ (bytes) |
| created_at | TIMESTAMP | วันที่สร้างระเบียน |
| updated_at | TIMESTAMP | วันที่แก้ไขล่าสุด |

#### Indexes
```sql
-- Performance indexes
CREATE INDEX idx_meeting_date ON meeting_reports(meeting_date DESC);
CREATE INDEX idx_meeting_number ON meeting_reports(meeting_number);
CREATE INDEX idx_department ON meeting_reports(department);
CREATE INDEX idx_meeting_title ON meeting_reports USING gin(to_tsvector('thai', meeting_title));

-- Unique constraint
CREATE UNIQUE INDEX idx_unique_meeting_number ON meeting_reports(meeting_number);
```

#### Triggers
- **update_meeting_reports_updated_at**: อัปเดต updated_at อัตโนมัติเมื่อมีการแก้ไขข้อมูล

#### คุณสมบัติพิเศษ
- ✅ ON CONFLICT DO NOTHING - ป้องกันการ insert ซ้ำ
- ✅ Full-text search support สำหรับภาษาไทย
- ✅ Auto-update timestamp trigger
- ✅ Optimized indexes สำหรับการค้นหา

### 2. ข้อมูลตัวอย่าง (4 records)

#### Record 1: การประชุมวางแผนและประเมินผล
- เลขที่: 1/2568
- วันที่: 15 มกราคม 2568
- เวลา: 09:30 น.
- ขนาดไฟล์: 2.15 MB

#### Record 2: การประชุมพัฒนาระบบบริการสุขภาพ
- เลขที่: 2/2568
- วันที่: 20 กุมภาพันธ์ 2568
- เวลา: 10:00 น.
- ขนาดไฟล์: 1.98 MB

#### Record 3: การประชุมควบคุมโรคติดต่อ
- เลขที่: 3/2568
- วันที่: 25 มีนาคม 2568
- เวลา: 13:30 น.
- ขนาดไฟล์: 2.32 MB

#### Record 4: การประชุมสาธารณสุขฉุกเฉิน
- เลขที่: 4/2568
- วันที่: 10 เมษายน 2568
- เวลา: 14:00 น.
- ขนาดไฟล์: 1.87 MB

**สถานที่ทั้งหมด**: ห้องประชุมดอกปีบ สำนักงานสาธารณสุขจังหวัดลำพูน

### 3. ไฟล์ PDF ตัวอย่าง (4 ไฟล์)

สร้างไฟล์ PDF จำลองในโฟลเดอร์ `uploads/`:

- ✅ meeting_1_2568.pdf (รายงานการประชุมวางแผนและประเมินผล)
- ✅ meeting_2_2568.pdf (รายงานการประชุมพัฒนาระบบบริการสุขภาพ)
- ✅ meeting_3_2568.pdf (รายงานการประชุมควบคุมโรคติดต่อ)
- ✅ meeting_4_2568.pdf (รายงานการประชุมสาธารณสุขฉุกเฉิน)

**หมายเหตุ**: ไฟล์ PDF เป็นไฟล์จำลองที่มีโครงสร้าง PDF พื้นฐาน สามารถเปิดได้ด้วย PDF reader

## วิธีใช้งาน

### 1. Import ข้อมูลเข้า PostgreSQL

```bash
# เชื่อมต่อ PostgreSQL
psql -h 192.168.100.70 -p 5432 -U postgres -d meeting_mgmt

# หรือ import จากไฟล์
psql -h 192.168.100.70 -p 5432 -U postgres -d meeting_mgmt -f init.sql
```

### 2. ตรวจสอบข้อมูล

```sql
-- ดูข้อมูลทั้งหมด
SELECT * FROM meeting_reports ORDER BY meeting_date DESC;

-- นับจำนวนระเบียน
SELECT COUNT(*) FROM meeting_reports;

-- ค้นหาตามคำสำคัญ
SELECT * FROM meeting_reports 
WHERE meeting_title ILIKE '%คณะกรรมการ%'
ORDER BY meeting_date DESC;
```

### 3. ตัวอย่าง Query ที่มีประโยชน์

```sql
-- ค้นหาตามช่วงวันที่
SELECT * FROM meeting_reports 
WHERE meeting_date BETWEEN '2025-01-01' AND '2025-12-31'
ORDER BY meeting_date DESC;

-- ค้นหาตามหน่วยงาน
SELECT * FROM meeting_reports 
WHERE department = 'สำนักงานสาธารณสุขจังหวัดลำพูน'
ORDER BY meeting_date DESC;

-- ค้นหาตามสถานที่
SELECT * FROM meeting_reports 
WHERE location ILIKE '%ดอกปีบ%'
ORDER BY meeting_date DESC;
```

## โครงสร้างโฟลเดอร์

```
meeting-reports-system/
├── init.sql                    # SQL script
├── uploads/                    # โฟลเดอร์เก็บไฟล์ PDF
│   ├── meeting_1_2568.pdf
│   ├── meeting_2_2568.pdf
│   ├── meeting_3_2568.pdf
│   ├── meeting_4_2568.pdf
│   └── .gitkeep
└── PROMPT5_SUMMARY.md          # เอกสารนี้
```

## คุณสมบัติเด่น

✅ โครงสร้างตารางครบถ้วน พร้อม indexes
✅ ป้องกันข้อมูลซ้ำด้วย UNIQUE constraint
✅ Auto-update timestamp
✅ Full-text search support (ภาษาไทย)
✅ ข้อมูลตัวอย่าง 4 records
✅ ไฟล์ PDF จำลอง 4 ไฟล์
✅ ON CONFLICT DO NOTHING สำหรับ idempotent inserts
✅ Query examples ที่มีประโยชน์

## การอัปเดต Backend

Backend ต้องอัปเดต query ให้ใช้ชื่อตาราง `meeting_reports` แทน `meetings` และเพิ่มฟิลด์ใหม่:
- meeting_time
- department
- file_path

## หมายเหตุ

- ข้อมูลตัวอย่างเป็นข้อมูลจำลองสำหรับทดสอบระบบ
- ไฟล์ PDF เป็นไฟล์จำลองที่มีโครงสร้าง PDF พื้นฐาน
- ขนาดไฟล์ที่ระบุเป็นค่าจำลองสำหรับการแสดงผล
- สามารถเพิ่มข้อมูลเพิ่มเติมได้โดยใช้ INSERT statement
