# Meeting Management System - Quick Start Guide

## 🚀 เริ่มต้นใช้งานใน 5 นาที

### ขั้นตอนที่ 1: ตรวจสอบ Prerequisites

```bash
# ตรวจสอบ Docker
docker --version
# ต้องการ: Docker 20+

# ตรวจสอบ Docker Compose
docker-compose --version
# ต้องการ: Docker Compose 2+

# ตรวจสอบ Node.js (ถ้าไม่ใช้ Docker)
node --version
# ต้องการ: Node.js 18+
```

---

### ขั้นตอนที่ 2: ตั้งค่า Environment

```bash
# คัดลอกไฟล์ตัวอย่าง
cp .env.production.example backend/.env

# แก้ไขค่าต่างๆ
nano backend/.env
```

**ค่าที่ต้องแก้:**
```bash
# Database
DB_HOST=localhost          # เปลี่ยนเป็น IP ของ database server
DB_PASS=your_password      # เปลี่ยนเป็นรหัสผ่านจริง

# MariaDB
MARIADB_HOST=localhost     # เปลี่ยนเป็น IP ของ MariaDB server
MARIADB_PASSWORD=your_password

# JWT Secret (สร้างใหม่)
JWT_SECRET=$(openssl rand -base64 32)
```

---

### ขั้นตอนที่ 3: สร้าง Database

```bash
# สร้าง database
createdb -h localhost -U postgres meeting_mgmt

# Import schema
psql -h localhost -U postgres -d meeting_mgmt -f init.sql
psql -h localhost -U postgres -d meeting_mgmt -f database/auth-schema.sql
psql -h localhost -U postgres -d meeting_mgmt -f database/agendas-schema.sql
```

---

### ขั้นตอนที่ 4: Deploy

**ตัวเลือก A: ใช้ Docker (แนะนำ)**
```bash
# Build และ start
docker-compose -f docker-compose.production.yml up -d --build

# ตรวจสอบสถานะ
docker-compose -f docker-compose.production.yml ps

# ดู logs
docker-compose -f docker-compose.production.yml logs -f
```

**ตัวเลือก B: ไม่ใช้ Docker**
```bash
# Backend
cd backend
npm ci --production
node src/server.js

# Frontend (terminal ใหม่)
cd frontend
npm ci
npm run build
# Serve dist/ ด้วย nginx หรือ serve
```

---

### ขั้นตอนที่ 5: ทดสอบ

```bash
# ทดสอบ Backend
curl http://localhost:3001/api/health

# ควรได้:
# {"success":true,"message":"API is running and database is connected","database":"connected"}

# ทดสอบ Frontend
curl http://localhost:3000

# เปิด browser
# http://localhost:3000
```

---

## 🎯 การใช้งาน

### Login
1. เปิด http://localhost:3000
2. ใช้ username/password จาก MariaDB personnel table
3. ระบบจะตรวจสอบสิทธิ์จาก users table

### สิทธิ์การใช้งาน

**Secretary (เจ้าหน้าที่ธุรการ):**
- สร้าง/แก้ไข/ลบ การประชุม ✅
- สร้าง/แก้ไข/ลบ วาระ ✅
- อัพโหลดรายงาน ✅
- เข้าถึง Management Tab ✅

**Manager (หัวหน้ากลุ่มงาน):**
- ดูการประชุม ✅
- สร้าง/แก้ไข/ลบ วาระ ✅
- ดูรายงาน ✅

**User (ผู้ใช้ทั่วไป):**
- ดูการประชุม ✅
- ดูวาระ ✅
- ดูรายงาน ✅

---

## 📊 ตรวจสอบ Database

```bash
# Export schema
node backend/scripts/dump_schema_node.js

# Export sample data
node backend/scripts/dump_samples.js

# ดูผลลัพธ์
cat backend/db_schema.json
cat backend/db_samples.json
```

---

## 🔧 คำสั่งที่ใช้บ่อย

### Docker Commands
```bash
# Start
docker-compose -f docker-compose.production.yml up -d

# Stop
docker-compose -f docker-compose.production.yml down

# Restart
docker-compose -f docker-compose.production.yml restart

# Logs
docker-compose -f docker-compose.production.yml logs -f backend
docker-compose -f docker-compose.production.yml logs -f frontend

# Rebuild
docker-compose -f docker-compose.production.yml up -d --build
```

### Database Commands
```bash
# Connect
psql -h localhost -U postgres -d meeting_mgmt

# Backup
pg_dump -h localhost -U postgres meeting_mgmt > backup.sql

# Restore
psql -h localhost -U postgres -d meeting_mgmt < backup.sql

# Check tables
psql -h localhost -U postgres -d meeting_mgmt -c "\dt"
```

### Health Checks
```bash
# Backend
curl http://localhost:3001/api/health

# Detailed health
curl http://localhost:3001/api/health/detailed

# Frontend
curl http://localhost:3000
```

---

## 🐛 แก้ปัญหาเบื้องต้น

### Backend ไม่ start
```bash
# ดู logs
docker-compose -f docker-compose.production.yml logs backend

# ตรวจสอบ database connection
psql -h localhost -U postgres -d meeting_mgmt

# ตรวจสอบ .env
cat backend/.env
```

### Frontend ไม่เชื่อมต่อ Backend
```bash
# ตรวจสอบ API URL
# frontend/.env หรือ frontend/src/services/api.js

# ทดสอบ backend โดยตรง
curl http://localhost:3001/api/health
```

### ไม่สามารถ login
```bash
# ตรวจสอบ MariaDB connection
mysql -h localhost -u root -p hr

# ตรวจสอบ personnel table
mysql -h localhost -u root -p hr -e "SELECT username FROM personnel LIMIT 5;"

# ตรวจสอบ users table (PostgreSQL)
psql -h localhost -U postgres -d meeting_mgmt -c "SELECT * FROM users;"
```

### อัพโหลดไฟล์ไม่ได้
```bash
# ตรวจสอบ uploads directory
ls -la uploads/

# ตรวจสอบ permissions
chmod 755 uploads/

# ตรวจสอบ disk space
df -h
```

---

## 📚 เอกสารเพิ่มเติม

- **MEETING_MGMT_PROJECT_SPEC.md** - เอกสารโปรเจกต์ฉบับสมบูรณ์
- **DEPLOYMENT_GUIDE.md** - คู่มือการ deploy แบบละเอียด
- **PROJECT_DELIVERABLES.md** - สรุปไฟล์ทั้งหมด
- **backend/scripts/README.md** - คู่มือการใช้ database scripts

---

## 🎉 เสร็จสิ้น!

ระบบพร้อมใช้งานแล้ว! 🚀

**เข้าถึงระบบ:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- pgAdmin: http://localhost:5050 (optional)

**ขั้นตอนถัดไป:**
1. สร้าง users ใน users table (สำหรับ secretary/manager)
2. ทดสอบการสร้างการประชุม
3. ทดสอบการสร้างวาระ
4. ทดสอบการอัพโหลดไฟล์
5. ตั้งค่า backup อัตโนมัติ

---

**Last Updated:** November 22, 2025  
**Version:** 2.0
