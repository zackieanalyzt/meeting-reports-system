# 🛠️ Management Tab Design & Implementation Plan
**Secretary-Only Administration Interface**

---

## 1. 🎯 Overview

### Purpose
สร้าง Management Tab สำหรับผู้ใช้ที่มี role = 'secretary' เพื่อจัดการระบบแบบรวมศูนย์

### Target Users
- **Role**: secretary เท่านั้น
- **Access**: ซ่อน tab จากผู้ใช้ role อื่น
- **Security**: Protected ทั้ง frontend และ backend

---

## 2. 📋 Features Specification

### A. Meeting Management (จัดการรายการประชุม)
```
✅ View All Meetings
   - แสดงตารางรายการประชุมทั้งหมด
   - Columns: เลขที่, ชื่อการประชุม, วันที่, สถานที่, แผนก, สถานะรายงาน
   - Search & Filter
   - Pagination (ถ้ามีข้อมูลเยอะ)

✅ Edit Meeting
   - แก้ไขข้อมูลการประชุม
   - อัพเดทรายละเอียด
   - เปลี่ยนแปลงไฟล์รายงาน

✅ Delete Meeting
   - ลบการประชุม (พร้อม confirmation)
   - ลบ agendas ที่เกี่ยวข้อง (cascade)
   - ลบไฟล์ที่เกี่ยวข้อง
   - บันทึก audit log

✅ View Meeting Details
   - ดูรายละเอียดเต็ม
   - แสดงจำนวน agendas
   - แสดงไฟล์ที่แนบ
```

### B. Agenda Management (จัดการวาระการประชุม)
```
✅ View All Agendas
   - แสดงตารางวาระทั้งหมด
   - Group by meeting_number
   - Filter by meeting, department, type
   - Sort by agenda_number

✅ Edit Agenda
   - แก้ไขข้อมูลวาระ
   - อัพเดทไฟล์แนบ
   - เปลี่ยนลำดับวาระ

✅ Delete Agenda
   - ลบวาระ (พร้อม confirmation)
   - ลบไฟล์ที่เกี่ยวข้อง
   - บันทึก audit log

✅ Reorder Agendas
   - เรียงลำดับวาระใหม่
   - Drag & drop (optional)
   - Manual number input
```


### C. Report File Management (จัดการไฟล์รายงาน)
```
✅ View All Files
   - แสดงรายการไฟล์ทั้งหมด
   - Group by meeting
   - Show file size, upload date, uploader

✅ Replace File
   - แทนที่ไฟล์เดิมด้วยไฟล์ใหม่
   - ลบไฟล์เก่าออกจาก filesystem
   - อัพเดท database

✅ Delete File
   - ลบไฟล์ (พร้อม confirmation)
   - ลบจาก filesystem และ database
   - บันทึก audit log

✅ Download File
   - ดาวน์โหลดไฟล์
   - บันทึก audit log (download)
```

### D. System Statistics (สถิติระบบ)
```
✅ Dashboard Overview
   - จำนวนการประชุมทั้งหมด
   - จำนวนวาระทั้งหมด
   - จำนวนรายงานที่อัพโหลดแล้ว
   - จำนวนรายงานที่ยังไม่อัพโหลด
   - พื้นที่ใช้สอยทั้งหมด (total file size)
   - จำนวนไฟล์ทั้งหมด

✅ Recent Activities
   - กิจกรรมล่าสุด 10 รายการ
   - จาก audit_logs table
   - แสดง: user, action, timestamp

✅ Storage Usage
   - แสดงพื้นที่ใช้สอยแยกตาม:
     - Meeting reports
     - Agenda files
     - Total
   - แสดงเป็น MB/GB
```

---

## 3. 🔒 Security Requirements

### Frontend Protection
```javascript
// ใน AppContent.jsx หรือ Navigation component
{user.role === 'secretary' && (
  <button onClick={() => setActiveTab('management')}>
    จัดการระบบ
  </button>
)}
```

### Backend Protection
```javascript
// ใน server.js - เพิ่ม management routes
app.get('/api/management/stats', 
  authenticateToken, 
  requireSecretary, 
  async (req, res) => {
    // Return statistics
  }
);
```

### Route Guards
- ทุก management endpoint ต้องมี `requireSecretary` middleware
- Frontend ซ่อน Management tab จาก role อื่น
- Backend return 403 ถ้า role ไม่ใช่ secretary

---

## 4. 🎨 UI/UX Design

### Layout Structure
```
┌─────────────────────────────────────────────────┐
│ Header: ระบบจัดการรายงานการประชุม              │
│ User: [ชื่อผู้ใช้] (เลขานุการ) [ออกจากระบบ]   │
├─────────────────────────────────────────────────┤
│ Tabs:                                           │
│ [รายการประชุม] [วาระการประชุม] [อัพโหลด]      │
│ [สถานะรายงาน] [จัดการระบบ] ← NEW TAB          │
├─────────────────────────────────────────────────┤
│ Management Tab Content:                         │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ 📊 สถิติระบบ                            │   │
│ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │   │
│ │ │ 25   │ │ 48   │ │ 23   │ │ 2    │   │   │
│ │ │ประชุม│ │วาระ  │ │รายงาน│ │รอ    │   │   │
│ │ └──────┘ └──────┘ └──────┘ └──────┘   │   │
│ │                                         │   │
│ │ พื้นที่ใช้สอย: 145.8 MB / 10 GB       │   │
│ │ [████████░░░░░░░░░░░░] 1.4%           │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ 📋 จัดการรายการประชุม                  │   │
│ │ [ค้นหา...] [กรอง▼]                     │   │
│ │                                         │   │
│ │ เลขที่  │ ชื่อ    │ วันที่  │ จัดการ  │   │
│ │ ─────────────────────────────────────  │   │
│ │ 1/2568 │ ประชุม... │ 15 ม.ค. │ [✏️][🗑️]│   │
│ │ 2/2568 │ ประชุม... │ 20 ม.ค. │ [✏️][🗑️]│   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ 📝 จัดการวาระการประชุม                 │   │
│ │ [เลือกการประชุม▼] [กรองแผนก▼]         │   │
│ │                                         │   │
│ │ วาระ │ หัวข้อ  │ แผนก  │ จัดการ       │   │
│ │ ─────────────────────────────────────  │   │
│ │ 1.1  │ เรื่อง... │ IT   │ [✏️][🗑️][↕️]│   │
│ │ 1.2  │ เรื่อง... │ HR   │ [✏️][🗑️][↕️]│   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ 📁 จัดการไฟล์รายงาน                    │   │
│ │                                         │   │
│ │ ไฟล์         │ ขนาด │ วันที่ │ จัดการ │   │
│ │ ─────────────────────────────────────  │   │
│ │ report_1.pdf │ 2.5MB│ 15 ม.ค.│[↓][🔄][🗑️]│   │
│ │ report_2.pdf │ 3.1MB│ 20 ม.ค.│[↓][🔄][🗑️]│   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ 📜 กิจกรรมล่าสุด                       │   │
│ │                                         │   │
│ │ • admin สร้างการประชุม 3/2568 (5 นาที)│   │
│ │ • secretary อัพโหลดรายงาน (10 นาที)   │   │
│ │ • manager สร้างวาระ 1.3 (15 นาที)     │   │
│ └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Color Scheme
- **Primary**: Blue (#3B82F6) - Actions
- **Success**: Green (#10B981) - Completed
- **Warning**: Yellow (#F59E0B) - Pending
- **Danger**: Red (#EF4444) - Delete
- **Info**: Gray (#6B7280) - Information

---

## 5. 🔌 API Endpoints (New)

### Statistics Endpoints
```javascript
GET /api/management/stats
Response: {
  meetings_total: 25,
  agendas_total: 48,
  reports_uploaded: 23,
  reports_pending: 2,
  storage_used_bytes: 152894720,
  storage_used_formatted: "145.8 MB",
  files_total: 25
}

GET /api/management/recent-activities
Response: {
  activities: [
    {
      id: 123,
      username: "admin",
      action: "create_meeting",
      table_name: "meeting_reports",
      record_id: 5,
      created_at: "2025-01-15T10:30:00Z",
      description: "สร้างการประชุม 3/2568"
    }
  ]
}

GET /api/management/storage-breakdown
Response: {
  meeting_reports: {
    count: 23,
    size_bytes: 98304000,
    size_formatted: "93.7 MB"
  },
  agenda_files: {
    count: 15,
    size_bytes: 54590720,
    size_formatted: "52.1 MB"
  },
  total: {
    count: 38,
    size_bytes: 152894720,
    size_formatted: "145.8 MB"
  }
}
```

### File Management Endpoints
```javascript
PUT /api/management/files/:id/replace
Body: FormData with new file
Response: { success: true, message: "แทนที่ไฟล์สำเร็จ" }

DELETE /api/management/files/:id
Response: { success: true, message: "ลบไฟล์สำเร็จ" }

GET /api/management/files
Response: {
  files: [
    {
      id: 1,
      meeting_id: 5,
      meeting_number: "1/2568",
      file_name: "report_1.pdf",
      file_size: 2621440,
      file_size_formatted: "2.5 MB",
      uploaded_by: "admin",
      created_at: "2025-01-15T10:00:00Z"
    }
  ]
}
```

### Bulk Operations
```javascript
DELETE /api/management/meetings/bulk
Body: { ids: [1, 2, 3] }
Response: { success: true, deleted_count: 3 }

DELETE /api/management/agendas/bulk
Body: { ids: [5, 6, 7] }
Response: { success: true, deleted_count: 3 }
```

---

## 6. 📁 File Structure (New Files)

### Frontend
```
frontend/src/
├── components/
│   ├── ManagementTab.jsx          # Main management interface
│   ├── StatisticsCard.jsx         # Statistics display
│   ├── MeetingManagement.jsx      # Meeting CRUD table
│   ├── AgendaManagement.jsx       # Agenda CRUD table
│   ├── FileManagement.jsx         # File operations
│   ├── RecentActivities.jsx       # Activity log display
│   └── ConfirmDialog.jsx          # Reusable confirmation dialog
│
└── services/
    └── managementApi.js           # Management API calls
```

### Backend
```
backend/src/
├── routes/
│   └── management.js              # Management routes
│
└── controllers/
    └── managementController.js    # Management business logic
```

---

## 7. 🚀 Implementation Steps

### Phase 1: Backend API (Priority: High)
```
1. สร้าง /api/management/stats endpoint
2. สร้าง /api/management/recent-activities endpoint
3. สร้าง /api/management/storage-breakdown endpoint
4. สร้าง /api/management/files endpoints (list, replace, delete)
5. เพิ่ม requireSecretary middleware ทุก endpoint
6. Test ด้วย Postman/curl
```

### Phase 2: Frontend Components (Priority: High)
```
1. สร้าง ManagementTab.jsx component
2. สร้าง StatisticsCard.jsx (แสดงสถิติ)
3. สร้าง MeetingManagement.jsx (ตาราง + CRUD)
4. สร้าง AgendaManagement.jsx (ตาราง + CRUD)
5. สร้าง FileManagement.jsx (ตาราง + operations)
6. สร้าง RecentActivities.jsx (activity log)
7. สร้าง ConfirmDialog.jsx (reusable)
```

### Phase 3: Integration (Priority: Medium)
```
1. เพิ่ม Management tab ใน AppContent.jsx
2. เชื่อม API calls กับ components
3. เพิ่ม error handling
4. เพิ่ม loading states
5. Test การทำงานทั้งระบบ
```

### Phase 4: Polish & Testing (Priority: Low)
```
1. ปรับปรุง UI/UX
2. เพิ่ม animations/transitions
3. Responsive design testing
4. Cross-browser testing
5. Performance optimization
```

---

## 8. 🧪 Testing Checklist

### Security Testing
- [ ] Non-secretary users ไม่เห็น Management tab
- [ ] API endpoints return 403 for non-secretary
- [ ] Token expiration handling
- [ ] CSRF protection (if implemented)

### Functionality Testing
- [ ] Statistics แสดงผลถูกต้อง
- [ ] Meeting CRUD ทำงานได้
- [ ] Agenda CRUD ทำงานได้
- [ ] File operations ทำงานได้
- [ ] Confirmation dialogs แสดงก่อนลบ
- [ ] Audit logs บันทึกถูกต้อง

### UI/UX Testing
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Loading states แสดงชัดเจน
- [ ] Error messages เข้าใจง่าย
- [ ] Success messages แสดงหลังทำงานสำเร็จ
- [ ] Thai language ถูกต้องทั้งหมด

---

## 9. 📝 Code Examples

### Example: ManagementTab Component
```javascript
// frontend/src/components/ManagementTab.jsx
import React, { useState, useEffect } from 'react';
import { getManagementStats } from '../services/managementApi';
import StatisticsCard from './StatisticsCard';
import MeetingManagement from './MeetingManagement';
import AgendaManagement from './AgendaManagement';
import FileManagement from './FileManagement';
import RecentActivities from './RecentActivities';

function ManagementTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getManagementStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>กำลังโหลด...</div>;

  return (
    <div className="management-tab">
      <h2>จัดการระบบ</h2>
      
      {/* Statistics Cards */}
      <div className="stats-grid">
        <StatisticsCard 
          title="การประชุมทั้งหมด" 
          value={stats.meetings_total} 
          icon="📋"
        />
        <StatisticsCard 
          title="วาระทั้งหมด" 
          value={stats.agendas_total} 
          icon="📝"
        />
        <StatisticsCard 
          title="รายงานที่อัพโหลด" 
          value={stats.reports_uploaded} 
          icon="✅"
        />
        <StatisticsCard 
          title="รอการอัพโหลด" 
          value={stats.reports_pending} 
          icon="⏳"
        />
      </div>

      {/* Storage Usage */}
      <div className="storage-section">
        <h3>พื้นที่ใช้สอย</h3>
        <p>{stats.storage_used_formatted} / 10 GB</p>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(stats.storage_used_bytes / 10737418240) * 100}%` }}
          />
        </div>
      </div>

      {/* Management Sections */}
      <MeetingManagement />
      <AgendaManagement />
      <FileManagement />
      <RecentActivities />
    </div>
  );
}

export default ManagementTab;
```

### Example: Backend Stats Endpoint
```javascript
// backend/src/routes/management.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireSecretary } = require('../middleware/permissions');
const db = require('../database');
const fs = require('fs');
const path = require('path');

// Get system statistics
router.get('/stats', authenticateToken, requireSecretary, async (req, res) => {
  try {
    // Count meetings
    const meetingsResult = await db.query('SELECT COUNT(*) FROM meeting_reports');
    const meetings_total = parseInt(meetingsResult.rows[0].count);

    // Count agendas
    const agendasResult = await db.query('SELECT COUNT(*) FROM meeting_agendas');
    const agendas_total = parseInt(agendasResult.rows[0].count);

    // Count reports uploaded
    const reportsResult = await db.query(
      'SELECT COUNT(*) FROM meeting_reports WHERE file_size > 0'
    );
    const reports_uploaded = parseInt(reportsResult.rows[0].count);

    // Count reports pending
    const reports_pending = meetings_total - reports_uploaded;

    // Calculate storage used
    const storageResult = await db.query(
      'SELECT SUM(file_size) as total FROM meeting_reports WHERE file_size > 0'
    );
    const storage_used_bytes = parseInt(storageResult.rows[0].total || 0);

    // Format file size
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    res.json({
      success: true,
      data: {
        meetings_total,
        agendas_total,
        reports_uploaded,
        reports_pending,
        storage_used_bytes,
        storage_used_formatted: formatFileSize(storage_used_bytes),
        files_total: reports_uploaded
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถิติ',
      error: error.message
    });
  }
});

module.exports = router;
```

---

## 10. 🎯 Success Criteria

### Must Have (MVP)
✅ Statistics dashboard แสดงข้อมูลถูกต้อง
✅ Meeting CRUD ทำงานได้ครบ
✅ Agenda CRUD ทำงานได้ครบ
✅ File delete/replace ทำงานได้
✅ Role-based access control ทำงานถูกต้อง
✅ Audit logs บันทึกทุก action

### Nice to Have
⭐ Drag & drop agenda reordering
⭐ Bulk operations (delete multiple)
⭐ Export data to Excel/CSV
⭐ Advanced search & filters
⭐ Real-time updates (WebSocket)
⭐ File preview (PDF viewer)

---

**สรุป**: Management Tab จะเป็น centralized admin interface สำหรับ secretary ในการจัดการระบบทั้งหมด พร้อม statistics, CRUD operations, และ audit trail
