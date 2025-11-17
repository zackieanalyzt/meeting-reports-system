# 🚀 Quick Start Guide - Authentication System

## เริ่มต้นใช้งานระบบ Authentication ใน 5 นาที

### ขั้นตอนที่ 1: ติดตั้ง Dependencies (ทำแล้ว ✅)

Dependencies ได้ถูกติดตั้งแล้ว:
- Backend: jsonwebtoken, bcryptjs, mysql2
- Frontend: react-router-dom

### ขั้นตอนที่ 2: ตั้งค่า Database

**Option A: ใช้ pgAdmin หรือ DBeaver**
1. เชื่อมต่อกับ PostgreSQL (192.168.100.70:5432)
2. เปิดไฟล์ `database/auth-schema.sql`
3. รัน SQL script

**Option B: ใช้ Command Line**
```bash
psql -h 192.168.100.70 -p 5432 -U postgres -d meeting_mgmt -f database/auth-schema.sql
```

### ขั้นตอนที่ 3: เพิ่มผู้ใช้ที่มีสิทธิพิเศษ

เปิด pgAdmin/DBeaver และรัน SQL:

```sql
-- เพิ่มเจ้าหน้าที่ธุรการ (แทนที่ 'your_username' ด้วย username จริง)
INSERT INTO users (username, role, is_active) 
VALUES ('your_username', 'secretary', true)
ON CONFLICT (username) DO UPDATE SET role = 'secretary';

-- เพิ่มหัวหน้ากลุ่มงาน (ถ้ามี)
INSERT INTO users (username, role, is_active) 
VALUES ('manager_username', 'manager', true)
ON CONFLICT (username) DO UPDATE SET role = 'manager';
```

**หมายเหตุ:** Username ต้องตรงกับที่มีในตาราง `personnel` ของ MariaDB

### ขั้นตอนที่ 4: ตรวจสอบ Environment Variables

ไฟล์ `backend/.env` ควรมี:

```env
# PostgreSQL (มีอยู่แล้ว)
DB_HOST=192.168.100.70
DB_PORT=5432
DB_NAME=meeting_mgmt
DB_USER=postgres
DB_PASS=grespost
PORT=3001

# MariaDB for Authentication (เพิ่มใหม่)
MARIADB_HOST=192.168.100.170
MARIADB_PORT=3306
MARIADB_DATABASE=hr
MARIADB_USER=root
MARIADB_PASSWORD=cjv671

# JWT Configuration (เพิ่มใหม่)
JWT_SECRET=meeting_mgmt_secret_key_2025_lamphun_pho
JWT_EXPIRES_IN=24h
```

### ขั้นตอนที่ 5: เริ่มต้นใช้งาน

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

รอจนเห็นข้อความ:
```
🚀 Backend server running on port 3001
✅ MariaDB connected successfully
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

เปิดเบราว์เซอร์ไปที่: http://localhost:5173

### ขั้นตอนที่ 6: ทดสอบการ Login

1. ระบบจะ redirect ไปหน้า login อัตโนมัติ
2. ใช้ username/password จากระบบ HR (ตาราง personnel)
3. ถ้า login สำเร็จ จะเห็น:
   - ชื่อผู้ใช้ที่มุมขวาบน
   - Role badge (เจ้าหน้าที่ธุรการ/หัวหน้ากลุ่มงาน/ผู้ใช้ทั่วไป)
   - ปุ่ม + จะแสดงตาม role

## 🎯 ทดสอบ Role-Based Permissions

### Secretary (เจ้าหน้าที่ธุรการ)
- ✅ เห็นปุ่ม + ในทุกแท็บ
- ✅ สร้าง/แก้ไข/ลบ การประชุมได้
- ✅ สร้าง/แก้ไข/ลบ วาระได้
- ✅ อัพโหลดรายงานได้

### Manager (หัวหน้ากลุ่มงาน)
- ❌ ไม่เห็นปุ่ม + ในแท็บการประชุม
- ✅ เห็นปุ่ม + ในแท็บวาระการประชุม
- ❌ ไม่เห็นปุ่ม + ในแท็บรายงาน

### User (ผู้ใช้ทั่วไป)
- ❌ ไม่เห็นปุ่ม + ในทุกแท็บ
- ✅ ดูข้อมูลได้ทั้งหมด

## 🔍 ตรวจสอบ Audit Logs

```sql
-- ดู login logs
SELECT 
    username,
    action,
    ip_address,
    created_at
FROM audit_logs
WHERE action IN ('login', 'logout')
ORDER BY created_at DESC
LIMIT 20;

-- ดู view logs
SELECT 
    username,
    action,
    resource_type,
    resource_id,
    created_at
FROM audit_logs
WHERE action = 'view'
ORDER BY created_at DESC
LIMIT 20;

-- สถิติการใช้งานแต่ละคน
SELECT 
    username,
    action,
    COUNT(*) as count
FROM audit_logs
GROUP BY username, action
ORDER BY username, count DESC;
```

## ❓ Troubleshooting

### ปัญหา: ไม่สามารถ login ได้

**ตรวจสอบ:**
1. MariaDB เชื่อมต่อได้หรือไม่?
   ```bash
   mysql -h 192.168.100.170 -u root -p hr
   # Password: cjv671
   ```

2. Username/Password ถูกต้องหรือไม่?
   ```sql
   SELECT username, prefix, fname, lname 
   FROM personnel 
   WHERE username = 'your_username';
   ```

3. Backend console มี error หรือไม่?

### ปัญหา: Login ได้แต่ไม่มีสิทธิ์

**ตรวจสอบ role:**
```sql
SELECT username, role, is_active 
FROM users 
WHERE username = 'your_username';
```

ถ้าไม่มีข้อมูล = role เป็น 'user' (ผู้ใช้ทั่วไป)

### ปัญหา: Token หมดอายุ

Token มีอายุ 24 ชั่วโมง - กด "ออกจากระบบ" แล้ว login ใหม่

### ปัญหา: Database connection failed

**ตรวจสอบ:**
1. PostgreSQL ทำงานหรือไม่?
2. MariaDB ทำงานหรือไม่?
3. Network เชื่อมต่อได้หรือไม่?
4. Credentials ใน .env ถูกต้องหรือไม่?

## 📚 เอกสารเพิ่มเติม

- `AUTHENTICATION_SETUP.md` - คู่มือการติดตั้งแบบละเอียด
- `PHASE2A_IMPLEMENTATION_SUMMARY.md` - สรุปการพัฒนา
- `database/auth-schema.sql` - Database schema
- `database/sample-users.sql` - ตัวอย่างการเพิ่มผู้ใช้

## 🎉 เสร็จแล้ว!

ระบบ Authentication พร้อมใช้งาน ✅

ถ้ามีปัญหาหรือต้องการความช่วยเหลือ ตรวจสอบ:
1. Backend console logs
2. Frontend browser console
3. Database audit_logs table
