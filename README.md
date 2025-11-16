# 📋 ระบบจัดการรายงานการประชุม (Meeting Reports System)

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-18.x-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2-blue.svg)
![PostgreSQL](https://img.shields.io/badge/postgresql-14%2B-blue.svg)

ระบบจัดการและค้นหารายงานการประชุมออนไลน์สำหรับหน่วยงานราชการ

[คุณสมบัติ](#-คุณสมบัติ) • [การติดตั้ง](#-การติดตั้ง) • [การใช้งาน](#-การใช้งาน) • [เอกสาร](#-เอกสาร)

</div>

---

## 🎯 ภาพรวม

ระบบจัดการรายงานการประชุมเป็นแอปพลิเคชันเว็บที่พัฒนาขึ้นเพื่อช่วยให้หน่วยงานราชการ โดยเฉพาะสำนักงานสาธารณสุขจังหวัดลำพูน สามารถจัดเก็บ ค้นหา และดาวน์โหลดรายงานการประชุมได้อย่างมีประสิทธิภาพ

### ปัญหาที่แก้ไข
- 📁 การจัดเก็บเอกสารการประชุมแบบกระจัดกระจาย
- 🔍 การค้นหาเอกสารที่ใช้เวลานาน
- 📊 การขาดระบบติดตามและรายงาน
- 🔒 การเข้าถึงเอกสารที่ไม่สะดวก

---

## ✨ คุณสมบัติ

### 🔍 คุณสมบัติหลัก
- **ค้นหาอย่างรวดเร็ว**: ค้นหาจากชื่อการประชุม, เลขที่, หรือสถานที่
- **แสดงผลภาษาไทย**: วันที่และข้อมูลแสดงเป็นภาษาไทย
- **ดาวน์โหลดเอกสาร**: ดาวน์โหลดไฟล์ PDF รายงานการประชุม
- **Responsive Design**: ใช้งานได้ทั้งคอมพิวเตอร์และมือถือ
- **Real-time Search**: ค้นหาแบบ real-time ด้วย debounce
- **Health Monitoring**: ตรวจสอบสถานะระบบแบบ real-time

---

## 🛠 เทคโนโลยี

### Frontend
- React 18.2 + Vite 5.0
- Axios
- CSS3 (Thai Government Design)

### Backend
- Node.js 18 + Express 4.18
- PostgreSQL 14+
- CORS, dotenv

### DevOps
- Docker + Docker Compose
- Nginx (Production)

---

## 📦 การติดตั้ง

### ตัวเลือก 1: Docker (แนะนำ)

```bash
# 1. Clone repository
git clone https://github.com/your-org/meeting-reports-system.git
cd meeting-reports-system

# 2. ตั้งค่า environment
cp backend/.env.example backend/.env
# แก้ไข backend/.env ตามต้องการ

# 3. Import database
psql -h 192.168.100.70 -U postgres -d meeting_mgmt -f init.sql

# 4. เริ่มระบบ
./start.sh
```

### ตัวเลือก 2: การพัฒนาแบบ Local

```bash
# Setup development environment
./Scripts/setup-dev.sh

# เริ่ม Backend (Terminal 1)
cd backend
npm run dev

# เริ่ม Frontend (Terminal 2)
cd frontend
npm run dev
```

---

## 🚀 การใช้งาน

### เริ่มระบบ
```bash
./start.sh
```

### หยุดระบบ
```bash
./stop.sh
```

### ทดสอบ API
```bash
./Scripts/test-api.sh
```

### สำรองข้อมูล
```bash
./Scripts/backup-db.sh
```

### ตรวจสอบระบบ
```bash
./Scripts/monitor.sh
```

---

## 🌐 การเข้าถึง

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

---

## 📚 เอกสาร

### เอกสารหลัก
- 📖 [README ฉบับเต็ม](./Documentation/README.md)
- 📡 [API Documentation](./Documentation/API_DOCUMENTATION.md)
- 🚀 [Deployment Guide](./Documentation/DEPLOYMENT_GUIDE.md)
- 🔧 [Troubleshooting Guide](./Documentation/TROUBLESHOOTING.md)
- 📋 [Product Requirements (PRD)](./PRD.md)

### สรุปงานแต่ละ Prompt
- [Prompt 4 Summary](./PROMPT4_SUMMARY.md) - Docker Configuration
- [Prompt 5 Summary](./PROMPT5_SUMMARY.md) - SQL และข้อมูลตัวอย่าง
- [Prompt 6 Summary](./PROMPT6_SUMMARY.md) - Documentation และ Final Setup

---

## 📊 โครงสร้างโปรเจ็กต์

```
meeting-reports-system/
├── 📚 Documentation/          # เอกสารทั้งหมด
│   ├── README.md
│   ├── API_DOCUMENTATION.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── TROUBLESHOOTING.md
├── 🔧 Scripts/                # Scripts สำหรับจัดการระบบ
│   ├── setup-dev.sh
│   ├── test-api.sh
│   ├── backup-db.sh
│   ├── deploy.sh
│   └── monitor.sh
├── 🧪 Testing/                # Testing utilities
│   └── postman-collection.json
├── backend/                   # Node.js + Express API
│   ├── src/
│   │   ├── server.js
│   │   └── database.js
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── .env.example
│   ├── nginx.conf
│   └── Dockerfile
├── uploads/                   # ไฟล์ PDF ตัวอย่าง
├── init.sql                   # Database schema
├── docker-compose.yml         # Development
├── docker-compose.prod.yml    # Production
├── start.sh                   # เริ่มระบบ
├── stop.sh                    # หยุดระบบ
├── PRD.md                     # Product Requirements
└── README.md                  # ไฟล์นี้
```

---

## 🔧 Configuration

### Backend Environment (.env)
```env
DB_HOST=192.168.100.70
DB_PORT=5432
DB_NAME=meeting_mgmt
DB_USER=postgres
DB_PASS=grespost
PORT=3001
NODE_ENV=production
```

### Frontend Environment (.env)
```env
VITE_API_URL=http://localhost:3001/api
```

---

## 🧪 Testing

### API Testing
```bash
# ทดสอบ API ทั้งหมด
./Scripts/test-api.sh

# ทดสอบด้วย curl
curl http://localhost:3001/api/health
curl http://localhost:3001/api/meetings
curl "http://localhost:3001/api/meetings?search=คณะกรรมการ"
```

### Import Postman Collection
```bash
# Import ไฟล์นี้ใน Postman
Testing/postman-collection.json
```

---

## 🚢 Deployment

### Production Deployment
```bash
# Deploy to production
./Scripts/deploy.sh

# หรือใช้ docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Monitoring
```bash
# ตรวจสอบสถานะระบบ
./Scripts/monitor.sh

# ดู logs
docker-compose logs -f

# ตรวจสอบ containers
docker-compose ps
```

---

## 🔒 Security

- ✅ SQL Injection Prevention (Parameterized queries)
- ✅ XSS Protection (Input sanitization)
- ✅ CORS Configuration
- ✅ Security Headers (Nginx)
- ✅ Environment Variables
- ✅ Docker Security Best Practices

---

## 📈 Performance

- ⚡ Page Load Time: < 3 seconds
- ⚡ API Response Time: < 500ms
- ⚡ Search Response Time: < 5 seconds
- ⚡ Database Indexing
- ⚡ Gzip Compression
- ⚡ Static Asset Caching

---

## 🐛 Troubleshooting

### ปัญหาที่พบบ่อย

**1. Database Connection Failed**
```bash
# ตรวจสอบ database
psql -h 192.168.100.70 -U postgres -d meeting_mgmt

# ตรวจสอบ credentials ใน .env
cat backend/.env
```

**2. Frontend Cannot Connect to Backend**
```bash
# ตรวจสอบ backend
curl http://localhost:3001/api/health

# ตรวจสอบ CORS settings
```

**3. Docker Build Fails**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild
docker-compose build --no-cache
```

ดูเพิ่มเติมที่ [Troubleshooting Guide](./Documentation/TROUBLESHOOTING.md)

---

## 🔮 Future Enhancements

- [ ] User Authentication & Authorization
- [ ] File Upload Functionality
- [ ] CRUD Operations
- [ ] Advanced Filters
- [ ] Pagination
- [ ] Export to Excel/CSV
- [ ] Email Notifications
- [ ] Mobile App

---

## 📞 Support

- 📧 Email: support@example.com
- 📖 Documentation: [Documentation/](./Documentation/)
- 🐛 Issues: GitHub Issues
- 💬 Contact: Development Team

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- สำนักงานสาธารณสุขจังหวัดลำพูน
- React Team
- Node.js Community
- PostgreSQL Community

---

<div align="center">

**Made with ❤️ for Thai Government Agencies**

[⬆ กลับไปด้านบน](#-ระบบจัดการรายงานการประชุม-meeting-reports-system)

</div>
