# 📋 แผนการแก้ไขครบวงจร - Meeting Management System

**วันที่:** 21 พฤศจิกายน 2568  
**สถานะ:** ⚠️ รอการอนุมัติก่อนแก้ไข

---

## 🎯 สรุปปัญหาทั้งหมด

### PART 1: Error 500 เมื่อแก้ไขวาระ
- ✅ **แก้แล้ว** - เปลี่ยน `file.originalname` → `file.filename`

### PART 2: ลบวาระไม่ได้ (Foreign Key Constraint)
- ⚠️ **ต้องแก้** - ใช้ Soft Delete แทน Hard Delete

### PART 3: UI แก้ไขวาระไม่ครบถ้วน
- ⚠️ **ต้องปรับปรุง** - ฟอร์มแก้ไข + การจัดการไฟล์

### PART 4: file_path ใน meeting_agendas ว่างเปล่า
- ⚠️ **ต้องตรวจสอบ** - ใช้ agenda_files เป็นหลัก

### PART 5: Database Schema
- ⚠️ **ต้องเพิ่ม** - is_active, deleted_at columns

---

## 📊 การวิเคราะห์ปัญหา

### ปัญหา PART 2: Foreign Key Constraint

**Error Message:**
```
update or delete on table "meeting_agendas"
violates foreign key constraint "agenda_files_agenda_id_fkey"
```

**สาเหตุ:**
- ตาราง `agenda_files` มี foreign key → `meeting_agendas.id`
- เมื่อลบ agenda จะ error เพราะยังมี files อ้างอิงอยู่

**โค้ดปัจจุบัน (Hard Delete):**
```javascript
// backend/src/server.js (บรรทัด 952)
DELETE FROM meeting_agendas WHERE id = $1
```

---

## 🔧 แผนการแก้ไขทั้งหมด

### Fix #1: เพิ่ม Columns ใน Database

**ตาราง meeting_agendas:**
```sql
ALTER TABLE meeting_agendas
ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN deleted_at TIMESTAMP NULL;
```

**ตาราง agenda_files:**
```sql
ALTER TABLE agenda_files
ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN deleted_at TIMESTAMP NULL;
```

**ตาราง meeting_reports:**
```sql
ALTER TABLE meeting_reports
ADD COLUMN is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN deleted_at TIMESTAMP NULL;
```

---

### Fix #2: แก้ Backend - Soft Delete

**ไฟล์:** `backend/src/server.js`

**เปลี่ยนจาก (Hard Delete):**
```javascript
app.delete('/api/agendas/:id', authenticateToken, requireSecretaryOrManager, async (req, res) => {
  const result = await db.query(
    'DELETE FROM meeting_agendas WHERE id = $1 RETURNING *',
    [id]
  );
});
```

**เป็น (Soft Delete):**
```javascript
app.delete('/api/agendas/:id', authenticateToken, requireSecretaryOrManager, async (req, res) => {
  const result = await db.query(
    `UPDATE meeting_agendas 
     SET is_active = FALSE, deleted_at = NOW(), updated_by = $2
     WHERE id = $1 AND is_active = TRUE
     RETURNING *`,
    [id, req.user.username]
  );
});
```

---

### Fix #3: แก้ Backend - กรองเฉพาะ Active Records

**ทุก SELECT query ต้องเพิ่ม:**
```sql
WHERE is_active = TRUE
```

**ตัวอย่าง:**
```javascript
// Get all agendas
app.get('/api/agendas', async (req, res) => {
  const result = await db.query(
    'SELECT * FROM meeting_agendas WHERE is_active = TRUE ORDER BY ...'
  );
});
```

---

### Fix #4: แก้ Management Routes

**ไฟล์:** `backend/src/routes/management.js`

**Bulk Delete (บรรทัด 595):**
```javascript
// เปลี่ยนจาก
'DELETE FROM meeting_agendas WHERE id = ANY($1)'

// เป็น
'UPDATE meeting_agendas SET is_active = FALSE, deleted_at = NOW() WHERE id = ANY($1)'
```

---

### Fix #5: สร้าง SQL Migration Script

**ไฟล์ใหม่:** `database/migrations/add_soft_delete_columns.sql`

```sql
-- Add soft delete columns to meeting_agendas
ALTER TABLE meeting_agendas
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Add soft delete columns to agenda_files
ALTER TABLE agenda_files
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Add soft delete columns to meeting_reports
ALTER TABLE meeting_reports
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meeting_agendas_is_active 
ON meeting_agendas(is_active);

CREATE INDEX IF NOT EXISTS idx_agenda_files_is_active 
ON agenda_files(is_active);

CREATE INDEX IF NOT EXISTS idx_meeting_reports_is_active 
ON meeting_reports(is_active);

-- Update existing records
UPDATE meeting_agendas SET is_active = TRUE WHERE is_active IS NULL;
UPDATE agenda_files SET is_active = TRUE WHERE is_active IS NULL;
UPDATE meeting_reports SET is_active = TRUE WHERE is_active IS NULL;
```

---

## 📁 สรุปไฟล์ที่ต้องแก้ไข

### Backend (4 ไฟล์)

| ลำดับ | ไฟล์ | การแก้ไข |
|------|------|---------|
| 1 | `backend/src/server.js` | แก้ DELETE → Soft Delete + เพิ่ม WHERE is_active = TRUE |
| 2 | `backend/src/routes/management.js` | แก้ Bulk Delete → Soft Delete |
| 3 | `database/migrations/add_soft_delete_columns.sql` | **สร้างใหม่** - SQL script |
| 4 | `database/run_migration.js` | **สร้างใหม่** - Script รัน migration |

### Frontend (ไม่ต้องแก้)
- ✅ Frontend ไม่ต้องแก้ไข (API response เหมือนเดิม)
- ✅ ปุ่มลบยังทำงานเหมือนเดิม
- ✅ Refresh list ทำงานเหมือนเดิม

---

## 🔍 รายละเอียดการแก้ไขแต่ละไฟล์

### 1. backend/src/server.js

**จุดที่ต้องแก้:**

#### A. Delete Agenda Endpoint (บรรทัด ~950)
```javascript
// Before
app.delete('/api/agendas/:id', authenticateToken, requireSecretaryOrManager, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'DELETE FROM meeting_agendas WHERE id = $1 RETURNING *',
      [id]
    );
    // ...
  }
});

// After
app.delete('/api/agendas/:id', authenticateToken, requireSecretaryOrManager, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Soft delete agenda
    const result = await db.query(
      `UPDATE meeting_agendas 
       SET is_active = FALSE, deleted_at = NOW(), updated_by = $2
       WHERE id = $1 AND is_active = TRUE
       RETURNING *`,
      [id, req.user.username]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agenda not found or already deleted'
      });
    }
    
    // Soft delete related files
    await db.query(
      `UPDATE agenda_files 
       SET is_active = FALSE, deleted_at = NOW()
       WHERE agenda_id = $1 AND is_active = TRUE`,
      [id]
    );
    
    // Audit log
    const { auditLog } = require('./middleware/audit');
    await auditLog(req.user.username, 'soft_delete_agenda', 'meeting_agendas', id, 
      { agenda_number: result.rows[0].agenda_number }, req);
    
    res.json({
      success: true,
      message: 'Agenda deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting agenda:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete agenda',
      message: error.message
    });
  }
});
```

#### B. Get Agendas Endpoint (บรรทัด ~680)
```javascript
// เพิ่ม WHERE is_active = TRUE
app.get('/api/agendas', authenticateToken, logView('agenda'), async (req, res) => {
  try {
    const { meeting_number, department, type } = req.query;
    let query = 'SELECT * FROM meeting_agendas WHERE is_active = TRUE'; // เพิ่ม
    // ... rest of code
  }
});
```

#### C. Get Agenda by ID (บรรทัด ~730)
```javascript
// เพิ่ม WHERE is_active = TRUE
const agendaResult = await db.query(
  'SELECT * FROM meeting_agendas WHERE id = $1 AND is_active = TRUE', 
  [id]
);
```

---

### 2. backend/src/routes/management.js

**จุดที่ต้องแก้:**

#### A. Bulk Delete Agendas (บรรทัด ~594)
```javascript
// Before
router.post('/agendas/bulk-delete', async (req, res) => {
  const result = await db.query(
    'DELETE FROM meeting_agendas WHERE id = ANY($1) RETURNING *',
    [ids]
  );
});

// After
router.post('/agendas/bulk-delete', async (req, res) => {
  const result = await db.query(
    `UPDATE meeting_agendas 
     SET is_active = FALSE, deleted_at = NOW()
     WHERE id = ANY($1) AND is_active = TRUE
     RETURNING *`,
    [ids]
  );
  
  // Also soft delete related files
  await db.query(
    `UPDATE agenda_files 
     SET is_active = FALSE, deleted_at = NOW()
     WHERE agenda_id = ANY($1) AND is_active = TRUE`,
    [ids]
  );
});
```

#### B. Get Management Agendas (บรรทัด ~340)
```javascript
// เพิ่ม WHERE is_active = TRUE
let query = `
  SELECT a.*, m.meeting_title, m.meeting_date
  FROM meeting_agendas a
  LEFT JOIN meeting_reports m ON a.meeting_number = m.meeting_number
  WHERE a.is_active = TRUE
`;
```

---

### 3. database/migrations/add_soft_delete_columns.sql (สร้างใหม่)

```sql
-- Migration: Add Soft Delete Support
-- Date: 2025-11-21
-- Description: Add is_active and deleted_at columns to support soft delete

BEGIN;

-- Add columns to meeting_agendas
ALTER TABLE meeting_agendas
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Add columns to agenda_files
ALTER TABLE agenda_files
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Add columns to meeting_reports
ALTER TABLE meeting_reports
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_meeting_agendas_is_active 
ON meeting_agendas(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_agenda_files_is_active 
ON agenda_files(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_meeting_reports_is_active 
ON meeting_reports(is_active) WHERE is_active = TRUE;

-- Update existing records
UPDATE meeting_agendas SET is_active = TRUE WHERE is_active IS NULL;
UPDATE agenda_files SET is_active = TRUE WHERE is_active IS NULL;
UPDATE meeting_reports SET is_active = TRUE WHERE is_active IS NULL;

COMMIT;
```

---

### 4. database/run_migration.js (สร้างใหม่)

```javascript
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Running migration: add_soft_delete_columns.sql');
    
    const sqlPath = path.join(__dirname, 'migrations', 'add_soft_delete_columns.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await client.query(sql);
    
    console.log('✅ Migration completed successfully!');
    
    // Verify
    const result = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'meeting_agendas' 
      AND column_name IN ('is_active', 'deleted_at')
    `);
    
    console.log('📊 Columns added:', result.rows.map(r => r.column_name));
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
```

---

## ⚠️ ข้อควรระวัง

### 1. Foreign Key Constraints
- ✅ Soft Delete แก้ปัญหา foreign key constraint
- ✅ ไม่ต้องลบ constraint ออก
- ✅ ข้อมูลยังอยู่ใน DB สามารถ restore ได้

### 2. Performance
- ✅ เพิ่ม index บน is_active column
- ✅ Query จะเร็วขึ้นเพราะ filter ด้วย is_active = TRUE

### 3. Data Integrity
- ✅ ข้อมูลไม่หายจริง
- ✅ สามารถ audit trail ได้
- ✅ สามารถ restore ได้ถ้าต้องการ

### 4. Backward Compatibility
- ✅ API response เหมือนเดิม
- ✅ Frontend ไม่ต้องแก้
- ✅ Existing code ทำงานได้ปกติ

---

## 🧪 การทดสอบ

### Test 1: ลบวาระ (ไม่มี Foreign Key Error)
```bash
1. เปิดแท็บ "จัดการระบบ" → "จัดการวาระ"
2. เลือกวาระที่มีไฟล์แนบ
3. กดปุ่ม "🗑️ ลบ"
4. ✅ ลบสำเร็จ ไม่มี error
5. ✅ วาระหายจากรายการ
6. ✅ ตรวจสอบ DB: is_active = FALSE, deleted_at มีค่า
```

### Test 2: ดูรายการวาระ (ไม่เห็นที่ถูกลบ)
```bash
1. เปิดแท็บ "วาระการประชุม"
2. ✅ เห็นเฉพาะวาระที่ is_active = TRUE
3. ✅ ไม่เห็นวาระที่ถูกลบ
```

### Test 3: Bulk Delete
```bash
1. เปิดแท็บ "จัดการระบบ" → "จัดการวาระ"
2. เลือกหลายวาระ
3. กด "🗑️ ลบที่เลือก"
4. ✅ ลบสำเร็จทั้งหมด
5. ✅ ไม่มี foreign key error
```

---

## 📝 ขั้นตอนการ Deploy

### 1. Run Migration
```bash
cd database
node run_migration.js
```

### 2. Restart Backend
```bash
cd backend
npm restart
```

### 3. Test
- ทดสอบลบวาระ
- ทดสอบดูรายการ
- ทดสอบ bulk delete

---

## ✅ Checklist

- [ ] สร้าง SQL migration script
- [ ] สร้าง run_migration.js
- [ ] แก้ DELETE → Soft Delete ใน server.js
- [ ] แก้ Bulk Delete ใน management.js
- [ ] เพิ่ม WHERE is_active = TRUE ทุก SELECT
- [ ] Run migration
- [ ] Test ลบวาระ
- [ ] Test ดูรายการ
- [ ] Test bulk delete
- [ ] ตรวจสอบ DB

---

## 🎉 สรุป

การแก้ไขนี้จะ:
- ✅ แก้ปัญหา Foreign Key Constraint
- ✅ ใช้ Soft Delete แทน Hard Delete
- ✅ เก็บข้อมูลไว้ใน DB (ไม่ลบจริง)
- ✅ Frontend ไม่ต้องแก้
- ✅ API response เหมือนเดิม
- ✅ สามารถ restore ข้อมูลได้

**รอการอนุมัติเพื่อเริ่มแก้ไข!** 🚀
