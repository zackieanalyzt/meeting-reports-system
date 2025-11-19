# 📊 System Architecture Analysis
**Meeting Reports Management System**

---

## 1. 🎯 Entry Points

### Backend Entry Point
- **File**: `backend/src/server.js` (1020 lines)
- **Port**: 3001 (configurable via `process.env.PORT`)
- **Type**: CommonJS (Node.js/Express)
- **Start Command**: `npm start` หรือ `npm run dev` (with nodemon)

### Frontend Entry Point
- **File**: `frontend/src/main.jsx`
- **Port**: 3000 (Vite dev server)
- **Type**: ES Module (React 18 + Vite)
- **Start Command**: `npm run dev`

### Database Entry Point
- **Primary DB**: PostgreSQL (localhost:5432)
  - Database: `meeting_mgmt`
  - User: `postgres`
  - Password: `grespost`
- **Secondary DB**: MariaDB (for personnel authentication)
  - Table: `personnel` (username, password MD5, prefix, fname, lname)

---

## 2. 🏗️ Frontend Structure (React + Vite)

### Component Hierarchy
```
App.jsx (BrowserRouter)
├── AuthProvider (Context)
├── Routes
│   ├── /login → Login.jsx
│   ├── / → ProtectedRoute → AppContent.jsx
│   └── * → Navigate to /
```

### Components Organization
```
frontend/src/
├── main.jsx                    # Entry point
├── App.jsx                     # Router setup
├── AppContent.jsx              # Main app layout (after login)
├── index.css                   # Global styles
│
├── components/
│   ├── AgendaCard.jsx          # Display single agenda
│   ├── AgendaForm.jsx          # Create/Edit agenda
│   ├── AgendaList.jsx          # List all agendas
│   ├── MeetingForm.jsx         # Create/Edit meeting
│   ├── MeetingList.jsx         # List all meetings
│   ├── MeetingListView.jsx     # Alternative meeting view
│   ├── MultipleFileUpload.jsx  # Upload multiple files
│   ├── ProtectedRoute.jsx      # Route guard (requires auth)
│   ├── ReportStatus.jsx        # Show report upload status
│   ├── RestrictedFeature.jsx   # Role-based UI restriction
│   └── UploadForm.jsx          # Single file upload
│
├── contexts/
│   └── AuthContext.jsx         # Authentication state management
│
├── pages/
│   └── Login.jsx               # Login page
│
└── services/
    └── api.js                  # Axios API client
```

### Key Frontend Features
- **Authentication**: JWT token stored in localStorage
- **Authorization**: Role-based access control (secretary, manager, user)
- **State Management**: React Context API (AuthContext)
- **HTTP Client**: Axios with interceptors
- **Routing**: React Router v6
- **Protected Routes**: ProtectedRoute component wraps authenticated pages

---

## 3. 🔧 Backend Structure (Node.js + Express)

### Server Architecture
```
backend/src/
├── server.js                   # Main server file (1020 lines)
├── database.js                 # PostgreSQL connection pool
│
├── config/
│   └── mariadb.js              # MariaDB connection (for personnel auth)
│
├── middleware/
│   ├── auth.js                 # JWT authentication middleware
│   ├── permissions.js          # Role-based authorization
│   └── audit.js                # Audit logging middleware
│
└── routes/
    └── auth.js                 # Authentication routes
```

### API Routes Structure

#### Public Routes (No Auth Required)
```
POST   /api/auth/login          # Login with username/password
POST   /api/auth/logout         # Logout (audit log)
GET    /api/auth/verify         # Verify JWT token
```

#### Protected Routes (Requires Authentication)
```
# Health Check
GET    /api/health              # Basic health check
GET    /api/health/detailed     # Detailed system health

# Meetings (All authenticated users can view)
GET    /api/meetings            # List all meetings (with search)
GET    /api/meetings/:id        # Get meeting by ID
GET    /api/meetings/with-stats # Meetings with agenda count
GET    /api/meetings/with-reports    # Meetings that have reports
GET    /api/meetings/without-reports # Meetings without reports

# Meeting Management (Secretary only)
POST   /api/meetings            # Create meeting with report
POST   /api/meetings/create     # Create meeting without report
PUT    /api/meetings/:id        # Update meeting
PUT    /api/meetings/:id/report # Upload report to existing meeting
PUT    /api/meetings/:id/reports-multiple # Upload multiple reports
DELETE /api/meetings/:id        # Delete meeting

# File Upload (Secretary only)
POST   /api/upload              # Upload single file
POST   /api/upload-multiple     # Upload multiple files

# Agendas (View: All users, Manage: Secretary/Manager)
GET    /api/agendas             # List agendas (with filters)
GET    /api/agendas/:id         # Get agenda by ID
POST   /api/agendas             # Create agenda
POST   /api/agendas/with-files  # Create agenda with files
PUT    /api/agendas/:id         # Update agenda
DELETE /api/agendas/:id         # Delete agenda

# Static Files
GET    /uploads/*               # Serve uploaded files
```

### Middleware Chain
```
Request → CORS → JSON Parser → Route Handler
                              ↓
                    authenticateToken (JWT verify)
                              ↓
                    requireSecretary / requireSecretaryOrManager
                              ↓
                    logView / logDownload (audit)
                              ↓
                    Business Logic
                              ↓
                    Response
```

---

## 4. 🔐 Authentication & Authorization Flow

### Login Flow
```
1. User submits username + password
   ↓
2. Backend hashes password with MD5
   ↓
3. Query MariaDB personnel table
   ↓
4. If found, query PostgreSQL users table for role
   ↓
5. Generate JWT token with user info + role
   ↓
6. Return token + user object to frontend
   ↓
7. Frontend stores token in localStorage
   ↓
8. Frontend sets Authorization header for all requests
```

### Authorization Levels
```
Role: user (default)
├── View meetings
├── View agendas
└── View reports

Role: manager
├── All user permissions
├── Create/Edit/Delete agendas
└── Upload agenda files

Role: secretary
├── All manager permissions
├── Create/Edit/Delete meetings
├── Upload meeting reports
└── Manage all system data
```

### Token Verification
- **Middleware**: `authenticateToken` in `backend/src/middleware/auth.js`
- **Process**: Extract token → Verify JWT → Attach user to req.user
- **Expiry**: 24 hours (configurable via JWT_EXPIRES_IN)

---

## 5. 📊 Data Flow Diagrams

### A. File Upload Flow (Secretary Only)
```
[Frontend: UploadForm]
        ↓ FormData with file
[POST /api/upload]
        ↓ authenticateToken
[requireSecretary middleware]
        ↓ multer storage
[Save to /uploads/ directory]
        ↓ Generate unique filename
[Return file path + size]
        ↓
[Frontend receives file info]
        ↓
[Use file path in meeting/agenda creation]
```

### B. Meeting Creation Flow
```
[Frontend: MeetingForm]
        ↓ Meeting data + file path
[POST /api/meetings/create]
        ↓ authenticateToken + requireSecretary
[Validate required fields]
        ↓ Check meeting_number uniqueness
[INSERT INTO meeting_reports]
        ↓ created_by = req.user.username
[Audit log: create_meeting]
        ↓
[Return created meeting]
        ↓
[Frontend updates meeting list]
```

### C. Agenda Management Flow
```
[Frontend: AgendaForm]
        ↓ Agenda data + files
[POST /api/agendas/with-files]
        ↓ authenticateToken + requireSecretaryOrManager
[Upload files with multer]
        ↓
[INSERT INTO meeting_agendas]
        ↓ Get agenda_id
[INSERT INTO agenda_files (for each file)]
        ↓ Foreign key: agenda_id
[Audit log: create_agenda]
        ↓
[Return agenda + files count]
```

### D. Authentication Flow
```
[Frontend: Login Page]
        ↓ username + password
[POST /api/auth/login]
        ↓ Hash password (MD5)
[Query MariaDB personnel]
        ↓ If found
[Query PostgreSQL users for role]
        ↓ Generate JWT
[Return token + user object]
        ↓ Store in localStorage
[Frontend: Set axios default header]
        ↓ Authorization: Bearer <token>
[All subsequent API calls include token]
```

### E. Report View Flow (With Audit)
```
[Frontend: MeetingList]
        ↓ Click on meeting
[GET /api/meetings/:id]
        ↓ authenticateToken
[logView middleware]
        ↓ Log to audit_logs table
[Query meeting_reports]
        ↓ Format Thai date + file size
[Return meeting data]
        ↓
[Frontend displays meeting details]
        ↓ Click download
[Browser downloads from /uploads/]
        ↓ logDownload middleware
[Audit log: download_report]
```

---

## 6. 🗄️ Database Schema Relationships

```
┌─────────────────┐
│ MariaDB         │
│ personnel       │ (External - Authentication only)
│ - username (PK) │
│ - password (MD5)│
│ - prefix        │
│ - fname, lname  │
└─────────────────┘
        ↓ (Login verification)
┌─────────────────┐
│ PostgreSQL      │
│ users           │
│ - id (PK)       │
│ - username      │ ← Matches personnel.username
│ - role          │ (secretary/manager/user)
│ - is_active     │
└─────────────────┘
        ↓ (Authorization)
┌─────────────────────────────────────────────────┐
│ meeting_reports                                 │
│ - id (PK)                                       │
│ - meeting_number (UNIQUE)                       │
│ - meeting_title, meeting_date, location         │
│ - file_path, file_size                          │
│ - created_by, updated_by                        │
└─────────────────────────────────────────────────┘
        ↓ (1:N)                    ↓ (1:N)
┌──────────────────┐      ┌──────────────────┐
│ meeting_agendas  │      │ meeting_files    │
│ - id (PK)        │      │ - id (PK)        │
│ - meeting_number │ (FK) │ - meeting_id (FK)│
│ - agenda_number  │      │ - file_name      │
│ - agenda_topic   │      │ - file_path      │
│ - file_path      │      │ - uploaded_by    │
└──────────────────┘      └──────────────────┘

┌─────────────────┐
│ audit_logs      │ (Tracks all actions)
│ - id (PK)       │
│ - username      │
│ - action        │ (login, create_meeting, etc.)
│ - table_name    │
│ - record_id     │
│ - old_values    │ (JSONB)
│ - new_values    │ (JSONB)
│ - ip_address    │
│ - user_agent    │
└─────────────────┘
```

---

## 7. 📦 Key Dependencies

### Backend Dependencies
```json
{
  "express": "^4.18.2",        // Web framework
  "cors": "^2.8.5",            // Cross-origin resource sharing
  "pg": "^8.11.3",             // PostgreSQL client
  "mysql2": "^3.6.5",          // MariaDB client
  "dotenv": "^16.3.1",         // Environment variables
  "multer": "^1.4.5-lts.1",    // File upload handling
  "jsonwebtoken": "^9.0.2",    // JWT authentication
  "bcryptjs": "^2.4.3",        // Password hashing (not used - using MD5)
  "nodemon": "^3.0.1"          // Dev server auto-reload
}
```

### Frontend Dependencies
```json
{
  "react": "^18.2.0",          // UI library
  "react-dom": "^18.2.0",      // React DOM renderer
  "react-router-dom": "^6.30.2", // Client-side routing
  "axios": "^1.6.2",           // HTTP client
  "vite": "^5.0.8",            // Build tool & dev server
  "@vitejs/plugin-react": "^4.2.1" // Vite React plugin
}
```

---

## 8. 🔒 Security Features

### Implemented
✅ JWT-based authentication
✅ Role-based access control (RBAC)
✅ Token expiration (24h)
✅ Protected routes (frontend & backend)
✅ File type validation (PDF, JPG, DOCX, XLSX, MD, PNG)
✅ File size limit (10MB per file)
✅ Audit logging (all CRUD operations)
✅ CORS enabled
✅ SQL injection protection (parameterized queries)

### Potential Improvements
⚠️ Password hashing uses MD5 (weak - should use bcrypt)
⚠️ No rate limiting on login attempts
⚠️ No HTTPS enforcement
⚠️ No CSRF protection
⚠️ No input sanitization for XSS
⚠️ Hardcoded API URL in frontend (should use env variable)

---

## 9. 📁 File Storage

### Upload Directory
- **Path**: `uploads/` (configurable via UPLOADS_PATH env)
- **Naming**: `meeting_${timestamp}_${filename}`
- **Encoding Fix**: Thai filename support (Latin1 → UTF-8 conversion)
- **Access**: Static file serving via Express

### File Management
- Files stored on filesystem (not in database)
- Database stores file path and size only
- No automatic cleanup of orphaned files
- No file versioning

---

## 10. 🎨 UI/UX Patterns

### Frontend Patterns
- **Protected Routes**: Redirect to /login if not authenticated
- **Restricted Features**: Hide UI elements based on role
- **Loading States**: Show loading during async operations
- **Error Handling**: Display error messages to user
- **Confirmation Dialogs**: Confirm before delete operations
- **Thai Language**: All UI text in Thai

### Component Patterns
- **Functional Components**: All components use hooks
- **Context API**: Global auth state
- **Custom Hooks**: useAuth() for authentication
- **Axios Interceptors**: Auto-attach token, handle 401

---

## 11. 🚀 Deployment Architecture

### Development
```
Frontend (Vite)     Backend (Node.js)     PostgreSQL
localhost:3000  →   localhost:3001    →   localhost:5432
                                      ↓
                                    MariaDB
                                    (personnel auth)
```

### Production (Docker)
```
docker-compose.yml includes:
- frontend (Nginx)
- backend (Node.js)
- postgres (PostgreSQL)
```

---

## 12. 📝 Current System Status

### ✅ Working Features
- User authentication (MariaDB + PostgreSQL)
- Role-based authorization
- Meeting CRUD operations
- Agenda CRUD operations
- File upload (single & multiple)
- Report upload to meetings
- Audit logging
- Thai language support
- Thai filename encoding fix

### ❌ Missing Features
- **Management Tab** (for secretary role) - NOT IMPLEMENTED
- User management UI
- Audit log viewer
- System statistics dashboard
- File deletion/replacement UI
- Agenda reordering
- Search/filter improvements
- Export functionality

### 🐛 Known Issues
- No "meetings" table (only meeting_reports exists)
- Some tables missing updated_at column
- audit_logs has duplicate columns (actiontype/action)
- Hardcoded API URL in frontend
- MD5 password hashing (weak security)

---

## 13. 🎯 System Capabilities Summary

| Feature | Status | Access Level |
|---------|--------|--------------|
| Login/Logout | ✅ Working | All users |
| View Meetings | ✅ Working | All authenticated |
| View Agendas | ✅ Working | All authenticated |
| Create Meeting | ✅ Working | Secretary only |
| Upload Report | ✅ Working | Secretary only |
| Create Agenda | ✅ Working | Secretary/Manager |
| Delete Meeting | ✅ Working | Secretary only |
| Delete Agenda | ✅ Working | Secretary/Manager |
| Audit Logging | ✅ Working | Automatic |
| Management Dashboard | ❌ Missing | Secretary only |
| User Management | ❌ Missing | Secretary only |
| Statistics | ❌ Missing | Secretary only |

---

**สรุป**: ระบบมีโครงสร้างที่ดี แยก concerns ชัดเจน มี authentication/authorization ครบถ้วน แต่ยังขาด Management Tab สำหรับ secretary ในการจัดการระบบแบบรวมศูนย์
