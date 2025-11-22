# 🔧 แก้ไข Error 500 หลังรัน Migration

**ปัญหา:** Error 500 เมื่อแก้ไข/ลบวาระ (หลังรัน migration แล้ว)  
**สถานะ:** ⚠️ รอการยืนยันก่อนแก้ไข

---

## 🔍 สาเหตุที่เป็นไปได้

### 1. ข้อมูลเก่ามี `is_active = NULL`
Migration อาจไม่ได้ update ข้อมูลเก่า

### 2. Query ใช้ `is_active = TRUE` แต่ควรใช้ `COALESCE`
เพื่อรองรับกรณี NULL

---

## 🔧 วิธีแก้ไข

### Fix #1: Update ข้อมูลเก่าให้เป็น TRUE

**รัน SQL นี้:**
```sql
-- Update existing records
UPDATE meeting_agendas SET is_active = TRUE WHERE is_active IS NULL;
UPDATE agenda_files SET is_active = TRUE WHERE is_active IS NULL;
UPDATE meeting_reports SET is_active = TRUE WHERE is_active IS NULL;
```

### Fix #2: แก้ Query ให้รองรับ NULL

**แทนที่:**
```sql
WHERE is_active = TRUE
```

**เป็น:**
```sql
WHERE COALESCE(is_active, TRUE) = TRUE
```

---

## 📋 ไฟล์ที่ต้องแก้ไข

### ไฟล์: backend/src/server.js

**จุดที่ต้องแก้ (7 จุด):**

#### 1. Get Agendas (บรรทัด 554)
```javascript
// Before
let conditions = ['is_active = TRUE'];

// After
let conditions = ['COALESCE(is_active, TRUE) = TRUE'];
```

#### 2. Get Agenda by ID (บรรทัด 621)
```javascript
// Before
WHERE id = $1 AND is_active = TRUE

// After
WHERE id = $1 AND COALESCE(is_active, TRUE) = TRUE
```

#### 3. Get Files for Agenda (บรรทัด 632)
```javascript
// Before
WHERE agenda_id = $1 AND is_active = TRUE

// After
WHERE agenda_id = $1 AND COALESCE(is_active, TRUE) = TRUE
```

#### 4. Get Files Endpoint (บรรทัด 659)
```javascript
// Before
WHERE agenda_id = $1 AND is_active = TRUE

// After
WHERE agenda_id = $1 AND COALESCE(is_active, TRUE) = TRUE
```

#### 5. Update Agenda - Get Files (บรรทัด 915)
```javascript
// Before
WHERE agenda_id = $1 AND is_active = TRUE

// After
WHERE agenda_id = $1 AND COALESCE(is_active, TRUE) = TRUE
```

#### 6. Delete Agenda - WHERE (บรรทัด 954)
```javascript
// Before
WHERE id = $1 AND is_active = TRUE

// After
WHERE id = $1 AND COALESCE(is_active, TRUE) = TRUE
```

#### 7. Delete Agenda - Update Files (บรรทัด 970)
```javascript
// Before
WHERE agenda_id = $1 AND is_active = TRUE

// After
WHERE agenda_id = $1 AND COALESCE(is_active, TRUE) = TRUE
```

---

## 🎯 แนะนำ

**ใช้ Fix #1 (Update ข้อมูล) + Fix #2 (แก้ Query)**

**เหตุผล:**
- ✅ แก้ปัญหาข้อมูลเก่า
- ✅ รองรับกรณี NULL ในอนาคต
- ✅ ปลอดภัยกว่า

---

## 📝 SQL Script สำหรับ Fix #1

**ไฟล์:** `fix_null_is_active.sql`

```sql
-- Fix NULL values in is_active columns
BEGIN;

-- Update meeting_agendas
UPDATE meeting_agendas 
SET is_active = TRUE 
WHERE is_active IS NULL;

-- Update agenda_files
UPDATE agenda_files 
SET is_active = TRUE 
WHERE is_active IS NULL;

-- Update meeting_reports
UPDATE meeting_reports 
SET is_active = TRUE 
WHERE is_active IS NULL;

-- Verify
SELECT 
  'meeting_agendas' as table_name,
  COUNT(*) as total,
  SUM(CASE WHEN is_active IS NULL THEN 1 ELSE 0 END) as null_count,
  SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_count
FROM meeting_agendas
UNION ALL
SELECT 
  'agenda_files',
  COUNT(*),
  SUM(CASE WHEN is_active IS NULL THEN 1 ELSE 0 END),
  SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END)
FROM agenda_files
UNION ALL
SELECT 
  'meeting_reports',
  COUNT(*),
  SUM(CASE WHEN is_active IS NULL THEN 1 ELSE 0 END),
  SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END)
FROM meeting_reports;

COMMIT;
```

---

## ⚡ ขั้นตอนการแก้ไข

### 1. รัน SQL Fix
```bash
psql -U postgres -d meeting_reports_db -f fix_null_is_active.sql
```

### 2. แก้ไข Backend Code
- แก้ 7 จุดใน `backend/src/server.js`
- เปลี่ยน `is_active = TRUE` → `COALESCE(is_active, TRUE) = TRUE`

### 3. Restart Backend
```bash
cd backend
npm restart
```

### 4. Test
- ลองแก้ไขวาระ
- ลองลบวาระ

---

**รอการยืนยันครับ!** 🚀
