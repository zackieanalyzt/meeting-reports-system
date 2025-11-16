# Product Requirement Document (PRD)
# ระบบจัดการรายงานการประชุม (Meeting Reports System)

**Version**: 1.0.0  
**Date**: January 2025  
**Status**: Production Ready  
**Owner**: Development Team

---

## 📋 Executive Summary

### Overview
ระบบจัดการรายงานการประชุมเป็นแอปพลิเคชันเว็บที่พัฒนาขึ้นเพื่อช่วยให้หน่วยงานราชการ โดยเฉพาะสำนักงานสาธารณสุขจังหวัดลำพูน สามารถจัดเก็บ ค้นหา และดาวน์โหลดรายงานการประชุมได้อย่างมีประสิทธิภาพ

### Business Goals
- ลดเวลาในการค้นหาเอกสารการประชุมจาก 15-30 นาที เหลือ 1-2 นาที
- เพิ่มประสิทธิภาพการจัดเก็บเอกสารแบบรวมศูนย์
- ลดการใช้กระดาษและพื้นที่จัดเก็บเอกสาร
- เพิ่มความสะดวกในการเข้าถึงข้อมูลสำหรับผู้บริหารและเจ้าหน้าที่

### Success Metrics
- ✅ ระยะเวลาการค้นหา < 5 วินาที
- ✅ Uptime > 99%
- ✅ User satisfaction > 90%
- ✅ ลดเวลาการทำงานของเจ้าหน้าที่ 50%

---

## 🎯 Product Vision

### Problem Statement
**ปัญหาปัจจุบัน**:
1. เอกสารการประชุมกระจัดกระจายในหลายที่
2. การค้นหาเอกสารใช้เวลานาน
3. ไม่มีระบบติดตามและรายงาน
4. การเข้าถึงเอกสารไม่สะดวก
5. เสี่ยงต่อการสูญหายของเอกสาร

**ผลกระทบ**:
- เสียเวลาในการค้นหาเอกสาร
- ประสิทธิภาพการทำงานลดลง
- ความพึงพอใจของผู้ใช้งานต่ำ
- ต้นทุนการจัดเก็บสูง

### Solution
ระบบจัดการรายงานการประชุมออนไลน์ที่:
- จัดเก็บเอกสารแบบรวมศูนย์
- ค้นหาได้รวดเร็วและแม่นยำ
- เข้าถึงได้ทุกที่ทุกเวลา
- ปลอดภัยและเชื่อถือได้

---

## 👥 Target Users

### Primary Users
1. **เจ้าหน้าที่ธุรการ**
   - จัดเก็บและอัปโหลดเอกสาร
   - จัดการข้อมูลการประชุม
   - ตอบคำถามเกี่ยวกับเอกสาร

2. **ผู้บริหาร**
   - ค้นหาและดาวน์โหลดรายงาน
   - ติดตามการประชุม
   - ตรวจสอบข้อมูล

3. **คณะกรรมการ**
   - เข้าถึงรายงานการประชุม
   - ดาวน์โหลดเอกสารที่เกี่ยวข้อง

4. **บุคลากรทั่วไป**
   - ค้นหาข้อมูลการประชุม
   - ดาวน์โหลดเอกสารที่ต้องการ

### User Personas

**Persona 1: นางสาวสมหญิง - เจ้าหน้าที่ธุรการ**
- อายุ: 35 ปี
- ประสบการณ์: 10 ปี
- ความต้องการ: ระบบที่ใช้งานง่าย อัปโหลดเอกสารได้รวดเร็ว
- Pain points: ต้องจัดเก็บเอกสารหลายที่ ค้นหายาก

**Persona 2: นายแพทย์สมชาย - ผู้อำนวยการ**
- อายุ: 50 ปี
- ประสบการณ์: 25 ปี
- ความต้องการ: เข้าถึงข้อมูลได้รวดเร็ว ใช้งานบนมือถือได้
- Pain points: ไม่มีเวลามาก ต้องการข้อมูลทันที

---

## ✨ Features & Requirements

### 1. Core Features (MVP)

#### 1.1 ระบบค้นหา (Search System)
**Priority**: P0 (Critical)

**Requirements**:
- ค้นหาจากชื่อการประชุม (meeting_title)
- ค้นหาจากเลขที่การประชุม (meeting_number)
- ค้นหาจากสถานที่ (location)
- รองรับภาษาไทย
- Case-insensitive search
- Partial matching (ILIKE)
- Real-time search with debounce (500ms)

**Acceptance Criteria**:
- ✅ ค้นหาได้ภายใน 5 วินาที
- ✅ แสดงผลลัพธ์ที่ถูกต้อง
- ✅ รองรับคำค้นหาภาษาไทย
- ✅ ไม่มี false positives

**Technical Specs**:
```sql
SELECT * FROM meeting_reports 
WHERE meeting_title ILIKE '%keyword%' 
   OR meeting_number ILIKE '%keyword%'
   OR location ILIKE '%keyword%'
ORDER BY meeting_date DESC;
```

#### 1.2 ระบบแสดงรายการ (List Display)
**Priority**: P0 (Critical)

**Requirements**:
- แสดงรายการการประชุมทั้งหมด
- เรียงตามวันที่ล่าสุด
- แสดงข้อมูล:
  - เลขที่การประชุม
  - ชื่อการประชุม
  - วันที่ (รูปแบบไทย)
  - สถานที่
  - ขนาดไฟล์
- Responsive design
- Loading states
- Empty states

**Acceptance Criteria**:
- ✅ แสดงข้อมูลครบถ้วน
- ✅ วันที่แสดงเป็นภาษาไทย
- ✅ ใช้งานได้บนมือถือ
- ✅ Loading indicator ชัดเจน

#### 1.3 ระบบดาวน์โหลด (Download System)
**Priority**: P0 (Critical)

**Requirements**:
- ดาวน์โหลดไฟล์ PDF
- แสดงชื่อไฟล์ที่ถูกต้อง
- แสดงขนาดไฟล์
- ปุ่มดาวน์โหลดชัดเจน

**Acceptance Criteria**:
- ✅ ดาวน์โหลดได้สำเร็จ
- ✅ ชื่อไฟล์ถูกต้อง
- ✅ ไฟล์ไม่เสียหาย

### 2. Technical Features

#### 2.1 Backend API
**Technology**: Node.js + Express

**Endpoints**:
```
GET /api/health
GET /api/meetings
GET /api/meetings?search={keyword}
```

**Requirements**:
- RESTful API design
- JSON response format
- Error handling
- CORS support
- Database connection pooling

#### 2.2 Frontend Application
**Technology**: React + Vite

**Requirements**:
- Single Page Application (SPA)
- Responsive design
- Thai language support
- Loading states
- Error boundaries
- SEO-friendly

#### 2.3 Database
**Technology**: PostgreSQL 14+

**Schema**:
```sql
CREATE TABLE meeting_reports (
    id SERIAL PRIMARY KEY,
    meeting_number VARCHAR(50) NOT NULL,
    meeting_title VARCHAR(500) NOT NULL,
    meeting_date DATE NOT NULL,
    meeting_time TIME,
    location VARCHAR(300),
    department VARCHAR(200),
    file_path VARCHAR(500),
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes**:
- idx_meeting_date (DESC)
- idx_meeting_number
- idx_department
- idx_meeting_title (Full-text)

### 3. Non-Functional Requirements

#### 3.1 Performance
- Page load time < 3 seconds
- API response time < 500ms
- Search response time < 5 seconds
- Support 100 concurrent users

#### 3.2 Security
- SQL injection prevention
- XSS protection
- CORS configuration
- Security headers
- Input validation

#### 3.3 Reliability
- Uptime > 99%
- Automated backups (daily)
- Error logging
- Health monitoring

#### 3.4 Usability
- Intuitive interface
- Thai language
- Mobile-friendly
- Accessibility (WCAG 2.1 Level A)

#### 3.5 Scalability
- Support up to 10,000 records
- Horizontal scaling ready
- Database optimization
- Caching strategy

---

## 🎨 User Interface Design

### Design Principles
1. **ความเรียบง่าย**: ใช้งานง่าย ไม่ซับซ้อน
2. **ความชัดเจน**: ข้อมูลแสดงชัดเจน อ่านง่าย
3. **ความสอดคล้อง**: ออกแบบตามมาตรฐานระบบราชการ
4. **การตอบสนอง**: ใช้งานได้ทุกอุปกรณ์

### Color Scheme
- **Primary**: #2c5aa0 (น้ำเงินกรมท่า)
- **Secondary**: #22c55e (เขียว)
- **Background**: #f0f8ff (ฟ้าอ่อน)
- **Text**: #1e293b (เทาเข้ม)
- **Error**: #ef4444 (แดง)

### Typography
- **Font**: Noto Sans Thai
- **Sizes**: 
  - Heading: 1.875rem (30px)
  - Body: 1rem (16px)
  - Small: 0.875rem (14px)

### Components

#### Header
- ชื่อระบบ
- สถานะการเชื่อมต่อ
- สีพื้นหลังน้ำเงินกรมท่า

#### Search Box
- ช่องค้นหาขนาดใหญ่
- Placeholder ชัดเจน
- ปุ่มล้างคำค้นหา
- Icon ค้นหา

#### Meeting Card
- เลขที่การประชุม (Badge)
- ชื่อการประชุม (Heading)
- วันที่ไทย
- สถานที่
- ขนาดไฟล์
- ปุ่มดาวน์โหลด (สีเขียว)

---

## 🔄 User Flows

### Flow 1: ค้นหาและดาวน์โหลดรายงาน

```
1. ผู้ใช้เข้าสู่ระบบ
   ↓
2. ระบบแสดงรายการการประชุมทั้งหมด
   ↓
3. ผู้ใช้พิมพ์คำค้นหา
   ↓
4. ระบบค้นหาและแสดงผลลัพธ์ (real-time)
   ↓
5. ผู้ใช้คลิกปุ่มดาวน์โหลด
   ↓
6. ระบบดาวน์โหลดไฟล์ PDF
```

### Flow 2: ดูรายการการประชุมทั้งหมด

```
1. ผู้ใช้เข้าสู่ระบบ
   ↓
2. ระบบโหลดข้อมูลจาก API
   ↓
3. แสดง Loading indicator
   ↓
4. แสดงรายการการประชุม (เรียงตามวันที่)
   ↓
5. ผู้ใช้เลื่อนดูรายการ
```

---

## 🏗 Technical Architecture

### System Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP/HTTPS
       ↓
┌─────────────┐
│   Nginx     │ (Production)
└──────┬──────┘
       │
       ├─→ Frontend (React + Vite)
       │   Port: 8080
       │
       └─→ Backend (Node.js + Express)
           Port: 3001
           │
           ↓
    ┌──────────────┐
    │ PostgreSQL   │
    │ Port: 5432   │
    └──────────────┘
```

### Technology Stack

**Frontend**:
- React 18.2
- Vite 5.0
- Axios
- CSS3

**Backend**:
- Node.js 18
- Express 4.18
- pg (PostgreSQL client)
- cors
- dotenv

**Database**:
- PostgreSQL 14+

**DevOps**:
- Docker
- Docker Compose
- Nginx (Production)

### Data Flow

```
User Action → Frontend (React)
              ↓
         API Call (Axios)
              ↓
         Backend (Express)
              ↓
         Database Query (PostgreSQL)
              ↓
         Response (JSON)
              ↓
         Frontend Update
              ↓
         UI Render
```

---

## 📊 Database Schema

### Table: meeting_reports

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | รหัสอัตโนมัติ |
| meeting_number | VARCHAR(50) | NOT NULL, UNIQUE | เลขที่การประชุม |
| meeting_title | VARCHAR(500) | NOT NULL | ชื่อการประชุม |
| meeting_date | DATE | NOT NULL | วันที่ประชุม |
| meeting_time | TIME | | เวลาประชุม |
| location | VARCHAR(300) | | สถานที่ประชุม |
| department | VARCHAR(200) | | หน่วยงาน |
| file_path | VARCHAR(500) | | ที่อยู่ไฟล์ |
| file_size | INTEGER | | ขนาดไฟล์ (bytes) |
| created_at | TIMESTAMP | DEFAULT NOW() | วันที่สร้าง |
| updated_at | TIMESTAMP | DEFAULT NOW() | วันที่แก้ไข |

### Indexes

```sql
CREATE INDEX idx_meeting_date ON meeting_reports(meeting_date DESC);
CREATE INDEX idx_meeting_number ON meeting_reports(meeting_number);
CREATE INDEX idx_department ON meeting_reports(department);
CREATE INDEX idx_meeting_title ON meeting_reports USING gin(to_tsvector('thai', meeting_title));
CREATE UNIQUE INDEX idx_unique_meeting_number ON meeting_reports(meeting_number);
```

---

## 🚀 Deployment Strategy

### Environments

1. **Development**
   - Local machines
   - Hot reload enabled
   - Debug logging

2. **Staging** (Future)
   - Test server
   - Production-like environment
   - UAT testing

3. **Production**
   - Production server
   - Optimized builds
   - Error logging only

### Deployment Process

```
1. Code Review
   ↓
2. Merge to main branch
   ↓
3. Run tests
   ↓
4. Build Docker images
   ↓
5. Deploy to staging (Future)
   ↓
6. UAT testing
   ↓
7. Deploy to production
   ↓
8. Monitor and verify
```

### Rollback Strategy

```
1. Detect issue
   ↓
2. Stop current deployment
   ↓
3. Restore previous Docker images
   ↓
4. Restart services
   ↓
5. Verify system
   ↓
6. Investigate and fix
```

---

## 📈 Success Metrics & KPIs

### Performance Metrics
- **Page Load Time**: < 3 seconds
- **API Response Time**: < 500ms
- **Search Response Time**: < 5 seconds
- **Uptime**: > 99%

### Usage Metrics
- **Daily Active Users**: Track
- **Search Queries**: Track
- **Downloads**: Track
- **Error Rate**: < 1%

### Business Metrics
- **Time Saved**: 50% reduction
- **User Satisfaction**: > 90%
- **Document Accessibility**: 100%
- **Cost Reduction**: 30%

---

## 🔒 Security Considerations

### Data Security
- SQL injection prevention (Parameterized queries)
- XSS protection (Input sanitization)
- CSRF protection (Future)
- Secure file storage

### Network Security
- HTTPS/SSL (Production)
- CORS configuration
- Rate limiting (Future)
- Firewall rules

### Access Control
- Authentication (Future)
- Authorization (Future)
- Audit logging (Future)

---

## 🧪 Testing Strategy

### Unit Testing
- Backend API functions
- Frontend components
- Database queries

### Integration Testing
- API endpoints
- Database connections
- File operations

### User Acceptance Testing (UAT)
- Search functionality
- Download functionality
- UI/UX validation
- Performance testing

### Test Cases

**Test Case 1: Search Functionality**
```
Given: User is on the homepage
When: User types "คณะกรรมการ" in search box
Then: System displays matching meetings within 5 seconds
```

**Test Case 2: Download File**
```
Given: User sees a meeting card
When: User clicks "ดาวน์โหลดรายงาน" button
Then: PDF file downloads successfully
```

---

## 📅 Timeline & Milestones

### Phase 1: Development (Completed)
- ✅ Backend API development
- ✅ Frontend development
- ✅ Database setup
- ✅ Docker configuration

### Phase 2: Documentation (Completed)
- ✅ API documentation
- ✅ Deployment guide
- ✅ Troubleshooting guide
- ✅ PRD document

### Phase 3: Testing (Current)
- ⏳ Unit testing
- ⏳ Integration testing
- ⏳ UAT testing
- ⏳ Performance testing

### Phase 4: Deployment (Next)
- ⏳ Staging deployment
- ⏳ Production deployment
- ⏳ Monitoring setup
- ⏳ Training

### Phase 5: Maintenance (Ongoing)
- ⏳ Bug fixes
- ⏳ Performance optimization
- ⏳ Feature enhancements
- ⏳ User support

---

## 🔮 Future Enhancements

### Phase 2 Features (Q2 2025)
- [ ] User authentication & authorization
- [ ] File upload functionality
- [ ] CRUD operations for meetings
- [ ] Advanced filters (date range, department)
- [ ] Pagination
- [ ] Sorting options

### Phase 3 Features (Q3 2025)
- [ ] Email notifications
- [ ] Export to Excel/CSV
- [ ] Meeting calendar view
- [ ] Dashboard & analytics
- [ ] Mobile app (iOS/Android)

### Phase 4 Features (Q4 2025)
- [ ] AI-powered search
- [ ] Document preview
- [ ] Version control
- [ ] Collaboration features
- [ ] API for third-party integration

---

## 📞 Support & Maintenance

### Support Channels
- **Email**: support@example.com
- **Phone**: 053-xxx-xxxx
- **Documentation**: https://docs.example.com
- **Issue Tracker**: GitHub Issues

### Maintenance Schedule
- **Daily**: Automated backups
- **Weekly**: Log review
- **Monthly**: Performance review
- **Quarterly**: Security audit

### SLA (Service Level Agreement)
- **Uptime**: 99% guaranteed
- **Response Time**: < 4 hours
- **Resolution Time**: < 24 hours (P0/P1)

---

## 👥 Team & Responsibilities

### Development Team
- **Project Manager**: Overall coordination
- **Backend Developer**: API development
- **Frontend Developer**: UI/UX development
- **DevOps Engineer**: Deployment & infrastructure
- **QA Engineer**: Testing & quality assurance

### Stakeholders
- **Product Owner**: สำนักงานสาธารณสุขจังหวัดลำพูน
- **End Users**: เจ้าหน้าที่และผู้บริหาร
- **IT Support**: Technical support team

---

## 📚 References

### Documentation
- [README.md](./Documentation/README.md)
- [API Documentation](./Documentation/API_DOCUMENTATION.md)
- [Deployment Guide](./Documentation/DEPLOYMENT_GUIDE.md)
- [Troubleshooting Guide](./Documentation/TROUBLESHOOTING.md)

### External Resources
- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

## 📝 Appendix

### Glossary
- **API**: Application Programming Interface
- **CRUD**: Create, Read, Update, Delete
- **MVP**: Minimum Viable Product
- **PRD**: Product Requirement Document
- **SLA**: Service Level Agreement
- **UAT**: User Acceptance Testing

### Change Log
- **v1.0.0** (2025-01-01): Initial release
  - Core features implemented
  - Documentation completed
  - Production ready

---

**Document Status**: ✅ Approved  
**Last Updated**: January 2025  
**Next Review**: March 2025
