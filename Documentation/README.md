# 📋 ระบบจัดการรายงานการประชุม (Meeting Reports System)

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-18.x-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2-blue.svg)

ระบบจัดการและค้นหารายงานการประชุมออนไลน์สำหรับหน่วยงานราชการ

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [API](#-api-documentation) • [Deployment](#-deployment)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [System Requirements](#-system-requirements)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

ระบบจัดการรายงานการประชุมเป็นแอปพลิเคชันเว็บที่พัฒนาขึ้นเพื่อช่วยให้หน่วยงานราชการสามารถจัดเก็บ ค้นหา และดาวน์โหลดรายงานการประชุมได้อย่างมีประสิทธิภาพ

### ปัญหาที่แก้ไข
- 📁 การจัดเก็บเอกสารการประชุมแบบกระจัดกระจาย
- 🔍 การค้นหาเอกสารที่ใช้เวลานาน
- 📊 การขาดระบบติดตามและรายงาน
- 🔒 การเข้าถึงเอกสารที่ไม่สะดวก

### ผู้ใช้งานเป้าหมาย
- เจ้าหน้าที่ธุรการ
- ผู้บริหาร
- คณะกรรมการ
- บุคลากรทั่วไป

---

## ✨ Features

### 🔍 Core Features
- **ค้นหาอย่างรวดเร็ว**: ค้นหาจากชื่อการประชุม, เลขที่, หรือสถานที่
- **แสดงผลภาษาไทย**: วันที่และข้อมูลแสดงเป็นภาษาไทย
- **ดาวน์โหลดเอกสาร**: ดาวน์โหลดไฟล์ PDF รายงานการประชุม
- **Responsive Design**: ใช้งานได้ทั้งคอมพิวเตอร์และมือถือ

### 🎨 UI/UX Features
- ออกแบบตามมาตรฐานระบบราชการไทย
- สีสันสบายตา โทนสีน้ำเงิน-เขียว
- แสดงสถานะการเชื่อมต่อแบบ real-time
- Loading states และ error handling

### 🔧 Technical Features
- RESTful API
- Full-text search
- Database indexing
- Docker containerization
- Health check monitoring

---

## 🛠 Technology Stack

### Frontend
- **React 18.2** - UI Framework
- **Vite 5.0** - Build Tool
- **Axios** - HTTP Client
- **CSS3** - Styling

### Backend
- **Node.js 18** - Runtime
- **Express 4.18** - Web Framework
- **PostgreSQL 14+** - Database
- **pg** - PostgreSQL Client

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx** - Web Server (Production)

### Development Tools
- **Git** - Version Control
- **ESLint** - Code Linting
- **Prettier** - Code Formatting

---

## 💻 System Requirements

### Development
- Node.js 18.x or higher
- npm 9.x or higher
- PostgreSQL 14.x or higher
- Git

### Production
- Docker 20.x or higher
- Docker Compose 2.x or higher
- 2GB RAM minimum
- 10GB disk space

---

## 📦 Installation

### Option 1: Docker (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/your-org/meeting-reports-system.git
cd meeting-reports-system

# 2. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# 3. Start services
./start.sh

# 4. Access application
# Frontend: http://localhost:8080
# Backend: http://localhost:3001
```

### Option 2: Manual Installation

#### Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env file

# 4. Setup database
psql -h localhost -U postgres -d meeting_mgmt -f ../init.sql

# 5. Start server
npm start
# or for development
npm run dev
```

#### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment (if needed)
cp .env.example .env

# 4. Start development server
npm run dev

# 5. Build for production
npm run build
```

---

## ⚙️ Configuration

### Backend Environment Variables

```env
# Database Configuration
DB_HOST=192.168.100.70
DB_PORT=5432
DB_NAME=meeting_mgmt
DB_USER=postgres
DB_PASS=your_password

# Server Configuration
PORT=3001
NODE_ENV=production
```

### Frontend Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api
```

### Database Setup

```sql
-- Create database
CREATE DATABASE meeting_mgmt;

-- Run initialization script
\i init.sql

-- Verify data
SELECT COUNT(*) FROM meeting_reports;
```

---

## 🚀 Usage

### Starting the Application

#### Development Mode
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### Production Mode
```bash
# Using Docker
./start.sh

# Manual
cd backend && npm start &
cd frontend && npm run build && npx serve -s dist
```

### Stopping the Application

```bash
# Docker
./stop.sh

# Manual
# Press Ctrl+C in each terminal
```

### Common Tasks

#### Search Meetings
1. เปิดเว็บไปที่ http://localhost:8080
2. พิมพ์คำค้นหาในช่องค้นหา
3. ระบบจะค้นหาอัตโนมัติ (debounce 500ms)

#### Download Report
1. คลิกปุ่ม "ดาวน์โหลดรายงาน" ในการ์ดที่ต้องการ
2. ไฟล์ PDF จะถูกดาวน์โหลด

---

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### 1. Health Check
```http
GET /api/health
```

**Response**
```json
{
  "status": "ok",
  "message": "Server is running",
  "database": "connected"
}
```

#### 2. Get All Meetings
```http
GET /api/meetings
```

**Response**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": 1,
      "meeting_number": "1/2568",
      "meeting_title": "รายงานการประชุม...",
      "meeting_date": "2025-01-15",
      "meeting_date_thai": "15 มกราคม 2568",
      "location": "ห้องประชุมดอกปีบ",
      "file_name": "meeting_1_2568.pdf",
      "file_size": 2150000,
      "file_size_formatted": "2.15 MB"
    }
  ]
}
```

#### 3. Search Meetings
```http
GET /api/meetings?search=คณะกรรมการ
```

**Query Parameters**
- `search` (string): ค้นหาจาก meeting_title, meeting_number, location

**Response**
```json
{
  "success": true,
  "count": 2,
  "data": [...]
}
```

### Error Responses

```json
{
  "success": false,
  "error": "Failed to fetch meetings",
  "message": "Connection timeout"
}
```

**Status Codes**
- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## 🚢 Deployment

### Docker Deployment

```bash
# 1. Build images
docker-compose build

# 2. Start services
docker-compose up -d

# 3. Check status
docker-compose ps

# 4. View logs
docker-compose logs -f
```

### Production Deployment

```bash
# 1. Use production compose file
docker-compose -f docker-compose.prod.yml up -d

# 2. Setup SSL (if needed)
# Configure nginx with SSL certificates

# 3. Setup backup
./Scripts/backup.sh

# 4. Monitor system
./Scripts/monitor.sh
```

### Environment-Specific Configurations

#### Development
- Hot reload enabled
- Debug logging
- CORS允许所有来源

#### Production
- Optimized builds
- Error logging only
- Restricted CORS
- Security headers
- Rate limiting

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Problem**: Backend cannot connect to PostgreSQL

**Solution**:
```bash
# Check database is running
psql -h 192.168.100.70 -U postgres -d meeting_mgmt

# Verify credentials in .env
cat backend/.env

# Check network connectivity
ping 192.168.100.70
```

#### 2. Frontend Cannot Connect to Backend

**Problem**: API calls return network errors

**Solution**:
```bash
# Check backend is running
curl http://localhost:3001/api/health

# Verify CORS settings in backend/src/server.js
# Check firewall rules
```

#### 3. Docker Build Fails

**Problem**: Docker build errors

**Solution**:
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Check Docker logs
docker-compose logs backend
```

#### 4. Search Not Working

**Problem**: Search returns no results

**Solution**:
```sql
-- Check data exists
SELECT COUNT(*) FROM meeting_reports;

-- Test search query
SELECT * FROM meeting_reports 
WHERE meeting_title ILIKE '%test%';

-- Rebuild indexes
REINDEX TABLE meeting_reports;
```

### Getting Help

- 📖 Check [API Documentation](./API_DOCUMENTATION.md)
- 🚀 Read [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- 🐛 See [Troubleshooting Guide](./TROUBLESHOOTING.md)
- 💬 Contact: support@example.com

---

## 👥 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- สำนักงานสาธารณสุขจังหวัดลำพูน
- React Team
- Node.js Community
- PostgreSQL Community

---

## 📞 Contact

**Project Maintainer**: Development Team

**Email**: dev@example.com

**Website**: https://example.com

---

<div align="center">

Made with ❤️ for Thai Government Agencies

</div>
