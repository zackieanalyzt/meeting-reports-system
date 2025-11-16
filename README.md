# Meeting Reports System

ระบบจัดการรายงานการประชุม พัฒนาด้วย React + Node.js + PostgreSQL

## โครงสร้างโปรเจ็กต์

```
meeting-reports-system/
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite
├── docker-compose.yml
├── start.sh
├── stop.sh
└── README.md
```

## ความต้องการของระบบ

- Docker และ Docker Compose
- PostgreSQL Database (192.168.100.70:5432)
- Node.js 20+ (สำหรับการพัฒนาแบบ local)

## การติดตั้ง

### ใช้ Docker (แนะนำ)

```bash
# เริ่มระบบ
./start.sh

# หยุดระบบ
./stop.sh
```

### การพัฒนาแบบ Local

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## การเข้าถึง

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## API Endpoints

- `GET /api/health` - ตรวจสอบสถานะเซิร์ฟเวอร์
- `GET /api/meetings` - ดึงข้อมูลการประชุมทั้งหมด
- `GET /api/meetings/:id` - ดึงข้อมูลการประชุมตาม ID
- `POST /api/meetings` - สร้างการประชุมใหม่

## Database Configuration

- Host: 192.168.100.70
- Port: 5432
- Database: meeting_mgmt
- User: postgres
- Password: grespost

## หมายเหตุ

ต้องสร้างตาราง `meetings` ใน database ก่อนใช้งาน:

```sql
CREATE TABLE meetings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
