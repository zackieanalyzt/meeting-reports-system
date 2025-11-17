# 🔐 Authentication API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication Flow

```
1. User Login → POST /auth/login
2. Receive JWT Token
3. Include Token in Headers for Protected Routes
4. Token expires in 24 hours
5. User Logout → POST /auth/logout
```

---

## 🌐 Public Endpoints (No Authentication Required)

### 1. Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "your_password"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "เข้าสู่ระบบสำเร็จ",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin",
    "prefix": "นาย",
    "fname": "สมชาย",
    "lname": "ใจดี",
    "fullname": "นายสมชาย ใจดี",
    "role": "secretary"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "บัญชีผู้ใช้ถูกระงับการใช้งาน"
}
```

---

### 2. Logout

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "ออกจากระบบสำเร็จ"
}
```

---

### 3. Verify Token

**Endpoint:** `GET /api/auth/verify`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "username": "admin",
    "prefix": "นาย",
    "fname": "สมชาย",
    "lname": "ใจดี",
    "fullname": "นายสมชาย ใจดี",
    "role": "secretary"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "ไม่พบ token"
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "Token ไม่ถูกต้องหรือหมดอายุ"
}
```

---

## 🔒 Protected Endpoints (Authentication Required)

### Authorization Header
All protected endpoints require:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📅 Meetings Endpoints

### 1. Get All Meetings

**Endpoint:** `GET /api/meetings`

**Permission:** All authenticated users

**Query Parameters:**
- `search` (optional): Search term

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

**Audit Log:** ✅ Logged as "view" action

---

### 2. Get Meeting by ID

**Endpoint:** `GET /api/meetings/:id`

**Permission:** All authenticated users

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "meeting_number": "1/2568",
    "meeting_title": "...",
    ...
  }
}
```

**Audit Log:** ✅ Logged as "view" action

---

### 3. Create Meeting

**Endpoint:** `POST /api/meetings`

**Permission:** 🔐 Secretary only

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "meeting_number": "5/2568",
  "meeting_title": "รายงานการประชุม...",
  "meeting_date": "2025-05-15",
  "meeting_time": "09:30:00",
  "location": "ห้องประชุม...",
  "department": "สำนักงาน...",
  "file_path": "/uploads/...",
  "file_size": 2150000
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Meeting created successfully",
  "data": {...}
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "คุณไม่มีสิทธิ์ในการดำเนินการนี้ (เฉพาะเจ้าหน้าที่ธุรการ)"
}
```

---

### 4. Update Meeting

**Endpoint:** `PUT /api/meetings/:id`

**Permission:** 🔐 Secretary only

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** Same as Create Meeting

**Success Response (200):**
```json
{
  "success": true,
  "message": "Meeting updated successfully",
  "data": {...}
}
```

---

### 5. Delete Meeting

**Endpoint:** `DELETE /api/meetings/:id`

**Permission:** 🔐 Secretary only

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Meeting deleted successfully",
  "data": {...}
}
```

---

## 📑 Agendas Endpoints

### 1. Get All Agendas

**Endpoint:** `GET /api/agendas`

**Permission:** All authenticated users

**Query Parameters:**
- `meeting_number` (optional)
- `department` (optional)
- `type` (optional)

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [...],
  "count": 15
}
```

**Audit Log:** ✅ Logged as "view" action

---

### 2. Create Agenda

**Endpoint:** `POST /api/agendas`

**Permission:** 🔐 Secretary or Manager

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "meeting_number": "1/2568",
  "agenda_number": "1.1",
  "agenda_topic": "เรื่องเพื่อทราบ...",
  "agenda_type": "เพื่อทราบ",
  "submitting_department": "กลุ่มงาน...",
  "description": "รายละเอียด...",
  "file_path": "/uploads/...",
  "file_size": 1500000
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Agenda created successfully",
  "data": {...}
}
```

**Error Response (403):**
```json
{
  "success": false,
  "message": "คุณไม่มีสิทธิ์ในการดำเนินการนี้ (เฉพาะเจ้าหน้าที่ธุรการและหัวหน้ากลุ่มงาน)"
}
```

---

### 3. Update Agenda

**Endpoint:** `PUT /api/agendas/:id`

**Permission:** 🔐 Secretary or Manager

---

### 4. Delete Agenda

**Endpoint:** `DELETE /api/agendas/:id`

**Permission:** 🔐 Secretary or Manager

---

## 📋 Reports Endpoints

### 1. Get Meetings with Reports

**Endpoint:** `GET /api/meetings/with-reports`

**Permission:** All authenticated users

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [...],
  "count": 8
}
```

**Audit Log:** ✅ Logged as "view" action

---

### 2. Upload Report

**Endpoint:** `PUT /api/meetings/:id/report`

**Permission:** 🔐 Secretary only

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `pdfFile`: PDF file (max 10MB)

**Success Response (200):**
```json
{
  "success": true,
  "message": "อัพโหลดรายงานสำเร็จ",
  "data": {...}
}
```

---

## 📤 File Upload Endpoint

### Upload File

**Endpoint:** `POST /api/upload`

**Permission:** 🔐 Secretary only

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `pdfFile`: PDF file (max 10MB)

**Success Response (200):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "filePath": "/uploads/meeting_1234567890_document.pdf",
  "fileSize": 2150000,
  "fileName": "document.pdf"
}
```

---

## 🔑 Role Permissions Summary

| Endpoint | Secretary | Manager | User |
|----------|-----------|---------|------|
| GET /api/meetings | ✅ | ✅ | ✅ |
| POST /api/meetings | ✅ | ❌ | ❌ |
| PUT /api/meetings/:id | ✅ | ❌ | ❌ |
| DELETE /api/meetings/:id | ✅ | ❌ | ❌ |
| GET /api/agendas | ✅ | ✅ | ✅ |
| POST /api/agendas | ✅ | ✅ | ❌ |
| PUT /api/agendas/:id | ✅ | ✅ | ❌ |
| DELETE /api/agendas/:id | ✅ | ✅ | ❌ |
| GET /api/meetings/with-reports | ✅ | ✅ | ✅ |
| POST /api/upload | ✅ | ❌ | ❌ |
| PUT /api/meetings/:id/report | ✅ | ❌ | ❌ |

---

## 📊 Audit Logging

All protected endpoints automatically log user actions to `audit_logs` table:

**Logged Actions:**
- `login` - User login
- `logout` - User logout
- `view` - View meetings/agendas/reports
- `download` - Download files (when implemented)
- `create` - Create records (future)
- `update` - Update records (future)
- `delete` - Delete records (future)

**Logged Data:**
- Username
- Action type
- Resource type (meeting, agenda, report)
- Resource ID
- IP address
- User agent
- Timestamp

---

## 🧪 Testing with cURL

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

### Get Meetings (with token)
```bash
curl http://localhost:3001/api/meetings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Meeting (Secretary only)
```bash
curl -X POST http://localhost:3001/api/meetings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "meeting_number": "5/2568",
    "meeting_title": "Test Meeting",
    "meeting_date": "2025-05-15",
    "location": "Test Location",
    "department": "Test Dept"
  }'
```

---

## ⚠️ Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (missing fields) |
| 401 | Unauthorized (no token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🔒 Security Notes

1. **Token Storage**: Store JWT token securely (localStorage in current implementation)
2. **Token Expiry**: 24 hours (configurable in JWT_EXPIRES_IN)
3. **Password Hashing**: MD5 (as per requirement - not recommended for production)
4. **HTTPS**: Use HTTPS in production
5. **CORS**: Configure CORS properly for production
6. **Rate Limiting**: Consider adding rate limiting for login endpoint
