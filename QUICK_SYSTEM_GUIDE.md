# 🚀 Meeting Reports System - Quick Guide for Developers

> **เวลาอ่าน: 10 นาที | สามารถเริ่มพัฒนาได้ทันที**

---

## 📋 Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture](#2-architecture)
3. [Entry Points](#3-entry-points)
4. [Data Flows](#4-data-flows)
5. [Key Components](#5-key-components)
6. [Dependencies](#6-dependencies)
7. [Quick Start](#7-quick-start)

---

## 1. System Overview

**ระบบจัดการรายงานการประชุม** สำหรับโรงพยาบาลลี้ จังหวัดลำพูน

### Tech Stack
```
Frontend: React 18 + Vite
Backend:  Node.js + Express
Database: PostgreSQL (primary) + MariaDB (auth)
```

### User Roles
- **Secretary** (เลขานุการ): สิทธิ์เต็ม - สร้าง/แก้ไข/ลบทุกอย่าง
- **Manager** (ผู้จัดการ): จัดการวาระ + อ่านทั้งหมด
- **User** (ผู้ใช้ทั่วไป): อ่านอย่างเดียว

---

## 2. Architecture

### System Diagram

```
┌─────────────────────┐
│   Frontend (React)  │  Port: 5173
│   - UI Components   │
│   - State Mgmt      │
└──────────┬──────────┘
           │ HTTP/REST
           ▼
┌─────────────────────┐
│  Backend (Express)  │  Port: 3001
│  - API Routes       │
│  - Auth Middleware  │
│  - File Upload      │
└──────┬──────────┬───┘
       │          │
       ▼          ▼
┌──────────┐  ┌──────────┐
│PostgreSQL│  │ MariaDB  │
│(Primary) │  │  (Auth)  │
│Port: 5432│  │Port: 3306│
└──────────┘  └──────────┘
```

### Folder Structure

```
meeting-reports-system/
├── frontend/
│   ├── src/
│   │   ├── components/      # UI Components
│   │   ├── contexts/        # React Context (Auth)
│   │   ├── pages/           # Page Components
│   │   ├── services/        # API Client
│   │   ├── App.jsx          # Main App + Routing
│   │   ├── AppContent.jsx   # Main Content (after login)
│   │   └── main.jsx         # Entry Point
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/          # DB Configs
│   │   ├── middleware/      # Auth, Permissions, Audit
│   │   ├── routes/          # API Routes
│   │   ├── server.js        # Main Server (Entry Point)
│   │   └── database.js      # PostgreSQL Connection
│   └── package.json
│
├── database/
│   ├── init.sql             # Main Schema
│   ├── auth-schema.sql      # Auth Tables
│   └── agendas-schema.sql   # Agenda Tables
│
└── uploads/                 # File Storage
```

---

## 3. Entry Points

### Frontend Entry Point

**File:** `frontend/src/main.jsx`

```javascript
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Flow:**
```
main.jsx
  └─> App.jsx (Router + AuthProvider)
       ├─> /login → Login.jsx
       └─> / → ProtectedRoute → AppContent.jsx
```

### Backend Entry Point

**File:** `backend/src/server.js`

```javascript
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.get('/api/meetings', authenticateToken, ...);
// ... more routes

app.listen(PORT);
```

**Flow:**
```
server.js
  ├─> Load Middleware (cors, json, auth)
  ├─> Load Routes (auth, meetings, agendas)
  ├─> Connect Databases (PostgreSQL + MariaDB)
  └─> Start Server (Port 3001)
```

---

## 4. Data Flows

### 4.1 Authentication Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Login   │───►│ Backend  │───►│ MariaDB  │───►│PostgreSQL│
│  Page    │    │   Auth   │    │   (HR)   │    │  (Role)  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │                │               │
     │ 1. Submit     │ 2. Verify      │ 3. Check      │ 4. Get
     │ Credentials   │ Password       │ Personnel     │ Role
     │               │ (MD5)          │               │
     │               ▼                │               │
     │         Generate JWT           │               │
     │               │                │               │
     ▼               ▼                ▼               ▼
Store Token    Return Token    Log Action      Set User State
```

**Steps:**
1. User enters username/password
2. POST `/api/auth/login`
3. Backend verifies against MariaDB `personnel` table (MD5 hash)
4. Backend gets role from PostgreSQL `users` table
5. Generate JWT token (24h expiry)
6. Return token + user info
7. Frontend stores in localStorage
8. Set AuthContext state

**Key Files:**
- Frontend: `contexts/AuthContext.jsx`, `pages/Login.jsx`
- Backend: `routes/auth.js`, `middleware/auth.js`

### 4.2 File Upload Flow (Meeting Reports)

#### Single File Upload

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Upload  │───►│ Backend  │───►│   File   │───►│PostgreSQL│
│  Form    │    │  Multer  │    │  System  │    │ Database │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │                │               │
     │ 1. Select     │ 2. Validate    │ 3. Save       │ 4. Update
     │ Meeting +     │ File Type      │ to /uploads   │ file_path
     │ File          │ & Size         │               │
     │               │                │               │
     ▼               ▼                ▼               ▼
  Browse File   Process Upload   Store File    Update Record
```

**API:** `PUT /api/meetings/:id/report`

**Code Example:**
```javascript
// Frontend
const formData = new FormData();
formData.append('pdfFile', file);
await api.put(`/meetings/${meetingId}/report`, formData);

// Backend
app.put('/api/meetings/:id/report', 
  authenticateToken, 
  requireSecretary, 
  upload.single('pdfFile'), 
  async (req, res) => {
    // Update meeting_reports.file_path
  }
);
```

#### Multiple Files Upload

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Multiple │───►│ Backend  │───►│   File   │───►│PostgreSQL│
│  Upload  │    │  Multer  │    │  System  │    │  (Files  │
│Component │    │ (array)  │    │          │    │  Table)  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │                │               │
     │ 1. Select     │ 2. Validate    │ 3. Save       │ 4. Insert
     │ Multiple      │ Each File      │ All Files     │ to meeting_
     │ Files         │                │               │ files table
     │               │                │               │
     ▼               ▼                ▼               ▼
Browse Multiple  Process Array   Store Files   Insert Records
```

**API:** `PUT /api/meetings/:id/reports-multiple`

**Code Example:**
```javascript
// Frontend
const formData = new FormData();
files.forEach(file => formData.append('files', file));
await api.put(`/meetings/${meetingId}/reports-multiple`, formData);

// Backend
app.put('/api/meetings/:id/reports-multiple',
  authenticateToken,
  requireSecretary,
  upload.array('files', 10),
  async (req, res) => {
    // Insert into meeting_files table
    for (const file of req.files) {
      await db.query('INSERT INTO meeting_files ...');
    }
  }
);
```

**Key Files:**
- Frontend: `components/UploadForm.jsx`, `components/MultipleFileUpload.jsx`
- Backend: `server.js` (upload endpoints)

### 4.3 Agenda Management Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Agenda  │───►│ Backend  │───►│   File   │───►│PostgreSQL│
│  Form    │    │   API    │    │  System  │    │ Database │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │                │               │
     │ 1. Fill       │ 2. Validate    │ 3. Save       │ 4. Insert
     │ Agenda +      │ Data +         │ Files         │ agenda +
     │ Files         │ Files          │               │ files
     │               │                │               │
     ▼               ▼                ▼               ▼
Submit Form    Process Data    Store Files    Save Records
```

**APIs:**
- Create without files: `POST /api/agendas`
- Create with files: `POST /api/agendas/with-files`

**Code Example:**
```javascript
// Frontend - With Files
const formData = new FormData();
formData.append('meeting_number', data.meeting_number);
formData.append('agenda_topic', data.agenda_topic);
// ... other fields
files.forEach(file => formData.append('files', file));

await api.post('/agendas/with-files', formData);

// Backend
app.post('/api/agendas/with-files',
  authenticateToken,
  requireSecretaryOrManager,
  upload.array('files', 5),
  async (req, res) => {
    // 1. Insert agenda
    const agendaResult = await db.query('INSERT INTO meeting_agendas ...');
    const agendaId = agendaResult.rows[0].id;
    
    // 2. Insert files
    for (const file of req.files) {
      await db.query('INSERT INTO agenda_files ...', [agendaId, ...]);
    }
  }
);
```

**Key Files:**
- Frontend: `components/AgendaForm.jsx`, `components/AgendaList.jsx`
- Backend: `server.js` (agenda endpoints)

---

## 5. Key Components

### 5.1 Frontend Components

#### Core Components

| Component | File | Purpose |
|-----------|------|---------|
| **App** | `App.jsx` | Main app with routing |
| **AppContent** | `AppContent.jsx` | Main content (after login) |
| **Login** | `pages/Login.jsx` | Login page |
| **AuthContext** | `contexts/AuthContext.jsx` | Authentication state |
| **ProtectedRoute** | `components/ProtectedRoute.jsx` | Route protection |
| **RestrictedFeature** | `components/RestrictedFeature.jsx` | Role-based UI |

#### Feature Components

| Component | File | Purpose |
|-----------|------|---------|
| **MeetingListView** | `components/MeetingListView.jsx` | Display meetings |
| **MeetingForm** | `components/MeetingForm.jsx` | Create/edit meetings |
| **UploadForm** | `components/UploadForm.jsx` | Upload reports |
| **MultipleFileUpload** | `components/MultipleFileUpload.jsx` | Multiple file upload |
| **AgendaList** | `components/AgendaList.jsx` | Display agendas |
| **AgendaForm** | `components/AgendaForm.jsx` | Create/edit agendas |
| **ReportStatus** | `components/ReportStatus.jsx` | Report status view |

#### API Service

**File:** `services/api.js`

```javascript
// Axios instance with interceptors
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000
});

// Auto-add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 5.2 Backend Components

#### Middleware

| Middleware | File | Purpose |
|------------|------|---------|
| **authenticateToken** | `middleware/auth.js` | JWT verification |
| **requireSecretary** | `middleware/permissions.js` | Secretary only |
| **requireSecretaryOrManager** | `middleware/permissions.js` | Secretary or Manager |
| **auditLog** | `middleware/audit.js` | Log all actions |
| **logView** | `middleware/audit.js` | Log view actions |

**Example Usage:**
```javascript
// Secretary only endpoint
app.post('/api/meetings', 
  authenticateToken,      // 1. Verify JWT
  requireSecretary,       // 2. Check role
  async (req, res) => {   // 3. Handle request
    // ... create meeting
  }
);

// Secretary or Manager endpoint
app.post('/api/agendas',
  authenticateToken,
  requireSecretaryOrManager,
  async (req, res) => {
    // ... create agenda
  }
);
```

#### Database Access

**PostgreSQL:**
```javascript
// database.js
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};
```

**MariaDB:**
```javascript
// config/mariadb.js
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.MARIADB_HOST,
  port: process.env.MARIADB_PORT,
  database: process.env.MARIADB_DATABASE,
  user: process.env.MARIADB_USER,
  password: process.env.MARIADB_PASSWORD
});

module.exports = pool;
```

### 5.3 Routing Structure

#### Frontend Routes

```javascript
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/" element={
    <ProtectedRoute>
      <AppContent />
    </ProtectedRoute>
  } />
  <Route path="*" element={<Navigate to="/" />} />
</Routes>
```

#### Backend API Routes

**Authentication:**
```
POST   /api/auth/login      - Login
POST   /api/auth/logout     - Logout
GET    /api/auth/verify     - Verify token
```

**Meetings:**
```
GET    /api/meetings                    - List all meetings
GET    /api/meetings/:id                - Get meeting by ID
POST   /api/meetings                    - Create meeting (Secretary)
POST   /api/meetings/create             - Create meeting without report
PUT    /api/meetings/:id                - Update meeting (Secretary)
DELETE /api/meetings/:id                - Delete meeting (Secretary)
PUT    /api/meetings/:id/report         - Upload single report (Secretary)
PUT    /api/meetings/:id/reports-multiple - Upload multiple reports (Secretary)
```

**Agendas:**
```
GET    /api/agendas                     - List agendas
GET    /api/agendas/:id                 - Get agenda by ID
POST   /api/agendas                     - Create agenda (Secretary/Manager)
POST   /api/agendas/with-files          - Create agenda with files
PUT    /api/agendas/:id                 - Update agenda (Secretary/Manager)
DELETE /api/agendas/:id                 - Delete agenda (Secretary/Manager)
```

**Files:**
```
POST   /api/upload                      - Upload single file (Secretary)
POST   /api/upload-multiple             - Upload multiple files (Secretary)
```

**Reports:**
```
GET    /api/meetings/with-reports       - Meetings with reports
GET    /api/meetings/without-reports    - Meetings without reports
GET    /api/meetings/with-stats         - Meetings with statistics
```

### 5.4 Database Schema

#### Main Tables

**meeting_reports** - การประชุม
```sql
id                SERIAL PRIMARY KEY
meeting_number    VARCHAR(50) UNIQUE NOT NULL
meeting_title     TEXT NOT NULL
meeting_date      DATE NOT NULL
meeting_time      TIME
location          TEXT
department        VARCHAR(100)
file_path         TEXT
file_size         BIGINT
created_at        TIMESTAMP
updated_at        TIMESTAMP
created_by        VARCHAR(100)
updated_by        VARCHAR(100)
```

**meeting_agendas** - วาระการประชุม
```sql
id                      SERIAL PRIMARY KEY
meeting_number          VARCHAR(50) NOT NULL
agenda_number           VARCHAR(20) NOT NULL
agenda_topic            TEXT NOT NULL
agenda_type             VARCHAR(50)
submitting_department   VARCHAR(100)
description             TEXT
file_path               TEXT
file_size               BIGINT
created_at              TIMESTAMP
updated_at              TIMESTAMP
```

**meeting_files** - ไฟล์การประชุม (หลายไฟล์)
```sql
id            SERIAL PRIMARY KEY
meeting_id    INTEGER NOT NULL → meeting_reports.id
file_name     VARCHAR(255) NOT NULL
file_path     TEXT NOT NULL
file_size     BIGINT
file_type     VARCHAR(100)
uploaded_by   VARCHAR(100)
created_at    TIMESTAMP
```

**agenda_files** - ไฟล์วาระ (หลายไฟล์)
```sql
id            SERIAL PRIMARY KEY
agenda_id     INTEGER NOT NULL → meeting_agendas.id
file_name     VARCHAR(255) NOT NULL
file_path     TEXT NOT NULL
file_size     BIGINT
file_type     VARCHAR(100)
uploaded_by   VARCHAR(100)
created_at    TIMESTAMP
```

**users** - ผู้ใช้และสิทธิ์
```sql
id          SERIAL PRIMARY KEY
username    VARCHAR(100) UNIQUE NOT NULL
role        VARCHAR(20) NOT NULL DEFAULT 'user'
is_active   BOOLEAN DEFAULT true
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

**audit_logs** - บันทึกการใช้งาน
```sql
id              SERIAL PRIMARY KEY
username        VARCHAR(100) NOT NULL
action          VARCHAR(50) NOT NULL
resource_type   VARCHAR(50)
resource_id     INTEGER
details         JSONB
ip_address      VARCHAR(45)
user_agent      TEXT
created_at      TIMESTAMP
```

#### External Table (MariaDB)

**personnel** - ข้อมูลบุคลากร (HR Database)
```sql
username    VARCHAR
password    VARCHAR (MD5 hash)
prefix      VARCHAR
fname       VARCHAR
lname       VARCHAR
```

---

## 6. Dependencies

### 6.1 Backend Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",        // Web framework
    "cors": "^2.8.5",            // Cross-origin requests
    "pg": "^8.11.3",             // PostgreSQL client
    "mysql2": "^3.6.5",          // MariaDB client
    "dotenv": "^16.3.1",         // Environment variables
    "multer": "^1.4.5-lts.1",    // File upload
    "jsonwebtoken": "^9.0.2",    // JWT tokens
    "bcryptjs": "^2.4.3"         // Password hashing
  },
  "devDependencies": {
    "nodemon": "^3.0.1"          // Auto-restart
  }
}
```

### 6.2 Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",          // UI library
    "react-dom": "^18.2.0",      // DOM rendering
    "react-router-dom": "^6.20.1", // Routing
    "axios": "^1.6.2"            // HTTP client
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1", // React plugin
    "vite": "^5.0.8"             // Build tool
  }
}
```

---

## 7. Quick Start

### 7.1 Prerequisites

```bash
Node.js 18+
PostgreSQL 14+
MariaDB (for authentication)
```

### 7.2 Installation (5 minutes)

```bash
# 1. Clone repository
git clone [repository-url]
cd meeting-reports-system

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. Setup environment variables
cd ../backend
cp .env.example .env
# Edit .env with your database credentials
```

### 7.3 Database Setup (3 minutes)

```bash
# Connect to PostgreSQL
psql -h 192.168.100.70 -p 5432 -U postgres -d meeting_mgmt

# Run SQL scripts
\i init.sql
\i database/auth-schema.sql
\i database/agendas-schema.sql
```

### 7.4 Start Development (2 minutes)

```bash
# Terminal 1 - Backend
cd backend
npm start
# Server running on http://localhost:3001

# Terminal 2 - Frontend
cd frontend
npm run dev
# App running on http://localhost:5173
```

### 7.5 Test System (1 minute)

1. Open http://localhost:5173
2. Login with HR credentials
3. Test features based on role:
   - **Secretary**: Create meeting, upload files, manage agendas
   - **Manager**: Create agendas, view all
   - **User**: View only

---

## 🎯 Development Tips

### Adding New API Endpoint

```javascript
// 1. Add route in backend/src/server.js
app.get('/api/new-endpoint', 
  authenticateToken,           // Add auth
  requireSecretary,            // Add permission check
  async (req, res) => {
    // Your logic here
    const result = await db.query('SELECT ...');
    res.json({ success: true, data: result.rows });
  }
);

// 2. Add API function in frontend/src/services/api.js
export const getNewData = async () => {
  const response = await api.get('/new-endpoint');
  return response.data;
};

// 3. Use in component
import { getNewData } from '../services/api';

const data = await getNewData();
```

### Adding New Component

```javascript
// 1. Create component file
// frontend/src/components/NewComponent.jsx
import { useState } from 'react';

function NewComponent() {
  const [data, setData] = useState([]);
  
  return (
    <div>
      {/* Your UI */}
    </div>
  );
}

export default NewComponent;

// 2. Import in AppContent.jsx
import NewComponent from './components/NewComponent';

// 3. Add to UI
<NewComponent />
```

### Database Query Pattern

```javascript
// SELECT
const result = await db.query(
  'SELECT * FROM table WHERE id = $1',
  [id]
);
const data = result.rows;

// INSERT
const result = await db.query(
  'INSERT INTO table (col1, col2) VALUES ($1, $2) RETURNING *',
  [val1, val2]
);
const newRecord = result.rows[0];

// UPDATE
const result = await db.query(
  'UPDATE table SET col1 = $1 WHERE id = $2 RETURNING *',
  [val1, id]
);

// DELETE
const result = await db.query(
  'DELETE FROM table WHERE id = $1 RETURNING *',
  [id]
);
```

---

## 📚 Additional Documentation

- **API Documentation**: `API_AUTH_DOCUMENTATION.md`
- **Authentication Guide**: `AUTHENTICATION_COMPLETE.md`
- **Testing Guide**: `TESTING_GUIDE_MULTIPLE_UPLOAD.md`
- **Project Summary**: `PROJECT_COMPLETE_SUMMARY.md`

---

## 🆘 Common Issues

### Issue: Cannot connect to database
```bash
# Check PostgreSQL is running
psql -h 192.168.100.70 -p 5432 -U postgres

# Check .env file has correct credentials
```

### Issue: Token expired
```bash
# Token expires after 24h
# Just login again to get new token
```

### Issue: File upload fails
```bash
# Check uploads directory exists
mkdir -p uploads

# Check file size limit (10MB)
# Check file type is allowed (PDF, JPG, DOCX, XLSX, MD)
```

---

**Created:** November 17, 2025  
**Status:** Production Ready  
**Version:** 1.0.0

---

<div align="center">

**🚀 Happy Coding! 🚀**

พร้อมเริ่มพัฒนาแล้ว!

</div>
