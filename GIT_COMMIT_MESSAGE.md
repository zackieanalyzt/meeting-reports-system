# Git Commit Message

## Commit Summary (50 characters max)
```
feat: เพิ่มฟีเจอร์แก้ไขวาระและปรับ layout แท็บจัดการระบบ
```

## Commit Description (Detailed)
```
feat: เพิ่มฟีเจอร์แก้ไขวาระและปรับ layout แท็บจัดการระบบ

### ✨ Features
- เพิ่มฟังก์ชันแก้ไขวาระการประชุมในแท็บจัดการระบบ
- รองรับการจัดการไฟล์แนบ (ลบไฟล์เดิม + อัปโหลดไฟล์ใหม่)
- เพิ่ม EditAgendaModal component สำหรับแก้ไขวาระ
- ปรับ layout ตารางจัดการวาระให้กว้างเต็มหน้าจอ
- เพิ่ม hover effects และ responsive design

### 🔧 Backend Changes
- เพิ่ม endpoint: PUT /api/agendas/:id/with-files
- รองรับการ update วาระพร้อมไฟล์หลายไฟล์
- รองรับการลบไฟล์เดิม (ทั้ง database และ filesystem)
- เพิ่ม audit logging สำหรับการแก้ไขวาระ

### 🎨 Frontend Changes
- เพิ่ม API functions: getAgendaWithFiles(), updateAgendaWithFiles()
- สร้าง EditAgendaModal component ใหม่
- เพิ่มปุ่ม "✏️ แก้ไข" ในตาราง AgendasManager
- ปรับ CSS layout:
  - ตารางกว้าง 100% (เต็มหน้าจอ)
  - คอลัมน์หัวข้อแสดงข้อความเต็ม (word-break)
  - ปุ่มจัดการจัดกลาง ไม่ตกขอบ
  - เพิ่ม hover effects และ animations

### 🐛 Bug Fixes
- แก้ปัญหาแท็บจัดการระบบโหลดไม่ขึ้น (API URL + timeout)
- แก้ปัญหา Health Check รบกวนผู้ใช้ (silent fail)
- แก้ปัญหาตารางแคบและปุ่มตกขอบ

### 📝 Files Changed
- backend/src/server.js
- frontend/src/services/api.js
- frontend/src/services/managementApi.js
- frontend/src/components/management/EditAgendaModal.jsx (new)
- frontend/src/components/management/AgendasManager.jsx
- frontend/src/AppContent.jsx

### 🧪 Testing
- ทดสอบการแก้ไขวาระ (ข้อมูล + ไฟล์)
- ทดสอบการลบไฟล์เดิมและเพิ่มไฟล์ใหม่
- ทดสอบ responsive design (desktop, tablet, mobile)
- ตรวจสอบแท็บอื่นไม่เพี้ยน

### 🔒 Security
- Authentication: requireSecretaryOrManager
- File validation: multer filter
- Audit logging: บันทึกการแก้ไข

Breaking Changes: None
```

---

## Alternative: Conventional Commits Format

### Option 1: Single Commit (Recommended)
```bash
git add .
git commit -m "feat: เพิ่มฟีเจอร์แก้ไขวาระและปรับ layout แท็บจัดการระบบ

- เพิ่ม EditAgendaModal component สำหรับแก้ไขวาระ
- เพิ่ม endpoint PUT /api/agendas/:id/with-files
- รองรับการจัดการไฟล์แนบ (ลบเดิม + อัปโหลดใหม่)
- ปรับ layout ตารางให้กว้างเต็มหน้าจอ
- แก้ปัญหาแท็บจัดการระบบโหลดไม่ขึ้น
- แก้ปัญหา Health Check รบกวนผู้ใช้

Files changed:
- backend/src/server.js
- frontend/src/services/api.js
- frontend/src/services/managementApi.js
- frontend/src/components/management/EditAgendaModal.jsx (new)
- frontend/src/components/management/AgendasManager.jsx
- frontend/src/AppContent.jsx"
```

### Option 2: Multiple Commits (Detailed)
```bash
# Commit 1: Fix management tab loading issue
git add frontend/src/services/managementApi.js frontend/src/services/api.js frontend/src/AppContent.jsx
git commit -m "fix: แก้ปัญหาแท็บจัดการระบบโหลดไม่ขึ้น

- แก้ API URL ใน managementApi.js ให้เป็น dynamic
- เพิ่ม timeout จาก 10s เป็น 30s
- แก้ Health Check ให้ silent fail ไม่รบกวนผู้ใช้"

# Commit 2: Add edit agenda feature
git add backend/src/server.js frontend/src/services/api.js frontend/src/components/management/EditAgendaModal.jsx frontend/src/components/management/AgendasManager.jsx
git commit -m "feat: เพิ่มฟีเจอร์แก้ไขวาระการประชุม

- เพิ่ม endpoint PUT /api/agendas/:id/with-files
- สร้าง EditAgendaModal component
- เพิ่มปุ่มแก้ไขในตาราง AgendasManager
- รองรับการจัดการไฟล์แนบ (ลบเดิม + อัปโหลดใหม่)
- ปรับ layout ตารางให้กว้างเต็มหน้าจอ"
```

---

## Short Version (for quick commit)
```bash
git commit -m "feat: เพิ่มฟีเจอร์แก้ไขวาระและปรับ layout"
```

---

## English Version (International)
```
feat: add agenda edit feature and improve layout

- Add EditAgendaModal component for editing agendas
- Add PUT /api/agendas/:id/with-files endpoint
- Support file management (delete old + upload new)
- Improve table layout to full width
- Fix management tab loading issue
- Fix health check interruption

Files changed:
- backend/src/server.js
- frontend/src/services/api.js
- frontend/src/services/managementApi.js
- frontend/src/components/management/EditAgendaModal.jsx (new)
- frontend/src/components/management/AgendasManager.jsx
- frontend/src/AppContent.jsx
```

---

## 📝 คำแนะนำการใช้งาน

### แนะนำ: ใช้ Option 1 (Single Commit)
เหมาะสำหรับการ commit ครั้งเดียวที่รวมทั้ง bug fixes และ features

### ถ้าต้องการแยก: ใช้ Option 2 (Multiple Commits)
แยก commit เป็น 2 ส่วน:
1. Bug fixes (แก้ปัญหาโหลดไม่ขึ้น)
2. New features (เพิ่มฟีเจอร์แก้ไขวาระ)

### Git Commands
```bash
# ตรวจสอบไฟล์ที่เปลี่ยนแปลง
git status

# เพิ่มไฟล์ทั้งหมด
git add .

# หรือเพิ่มเฉพาะไฟล์ที่ต้องการ
git add backend/src/server.js
git add frontend/src/services/api.js
git add frontend/src/services/managementApi.js
git add frontend/src/components/management/EditAgendaModal.jsx
git add frontend/src/components/management/AgendasManager.jsx
git add frontend/src/AppContent.jsx

# Commit (เลือก message จากด้านบน)
git commit -m "feat: เพิ่มฟีเจอร์แก้ไขวาระและปรับ layout แท็บจัดการระบบ"

# Push
git push origin main
```
