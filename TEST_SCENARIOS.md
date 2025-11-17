# 🧪 Test Scenarios - Authentication System

## การทดสอบระบบ Authentication และ RBAC

---

## 📋 Test Scenario 1: Login Flow

### Test Case 1.1: Login สำเร็จ (Secretary)
**Steps:**
1. เปิด http://localhost:5173
2. ระบบ redirect ไปหน้า login
3. กรอก username/password ของ secretary
4. กดปุ่ม "เข้าสู่ระบบ"

**Expected Result:**
- ✅ Login สำเร็จ
- ✅ Redirect ไปหน้าหลัก
- ✅ แสดงชื่อผู้ใช้ที่มุมขวาบน
- ✅ แสดง badge "เจ้าหน้าที่ธุรการ" (สีม่วง)
- ✅ เห็นปุ่ม + ในทุกแท็บ
- ✅ บันทึก login ใน audit_logs

**SQL Check:**
```sql
SELECT * FROM audit_logs 
WHERE username = 'your_username' AND action = 'login'
ORDER BY created_at DESC LIMIT 1;
```

---

### Test Case 1.2: Login สำเร็จ (Manager)
**Steps:**
1. Login ด้วย username/password ของ manager

**Expected Result:**
- ✅ Login สำเร็จ
- ✅ แสดง badge "หัวหน้ากลุ่มงาน" (สีน้ำเงิน)
- ✅ เห็นปุ่ม + เฉพาะในแท็บวาระการประชุม
- ❌ ไม่เห็นปุ่ม + ในแท็บการประชุมและรายงาน

---

### Test Case 1.3: Login สำเร็จ (User)
**Steps:**
1. Login ด้วย username/password ของ user ทั่วไป

**Expected Result:**
- ✅ Login สำเร็จ
- ✅ แสดง badge "ผู้ใช้ทั่วไป" (สีเทา)
- ❌ ไม่เห็นปุ่ม + ในทุกแท็บ
- ✅ ดูข้อมูลได้ทั้งหมด

---

### Test Case 1.4: Login ไม่สำเร็จ (Wrong Password)
**Steps:**
1. กรอก username ถูกต้อง
2. กรอก password ผิด
3. กดปุ่ม "เข้าสู่ระบบ"

**Expected Result:**
- ❌ Login ไม่สำเร็จ
- ✅ แสดงข้อความ "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
- ✅ ยังอยู่ที่หน้า login

---

### Test Case 1.5: Login ไม่สำเร็จ (User Inactive)
**Steps:**
1. ตั้งค่า is_active = false ในตาราง users
2. พยายาม login

**Expected Result:**
- ❌ Login ไม่สำเร็จ
- ✅ แสดงข้อความ "บัญชีผู้ใช้ถูกระงับการใช้งาน"

**SQL Setup:**
```sql
UPDATE users SET is_active = false WHERE username = 'test_user';
```

---

## 📋 Test Scenario 2: Role-Based UI

### Test Case 2.1: Secretary - แท็บการประชุม
**Steps:**
1. Login ด้วย secretary account
2. ไปที่แท็บ "การประชุม"

**Expected Result:**
- ✅ เห็นปุ่ม + (สร้างการประชุมใหม่)
- ✅ กดปุ่ม + แล้วเปิด form ได้
- ✅ สร้างการประชุมได้
- ✅ แก้ไขการประชุมได้
- ✅ ลบการประชุมได้

---

### Test Case 2.2: Manager - แท็บการประชุม
**Steps:**
1. Login ด้วย manager account
2. ไปที่แท็บ "การประชุม"

**Expected Result:**
- ❌ ไม่เห็นปุ่ม +
- ✅ ดูรายการการประชุมได้
- ❌ ไม่สามารถสร้าง/แก้ไข/ลบได้

---

### Test Case 2.3: Manager - แท็บวาระการประชุม
**Steps:**
1. Login ด้วย manager account
2. ไปที่แท็บ "วาระการประชุม"

**Expected Result:**
- ✅ เห็นปุ่ม +
- ✅ สร้างวาระได้
- ✅ แก้ไขวาระได้
- ✅ ลบวาระได้

---

### Test Case 2.4: User - ทุกแท็บ
**Steps:**
1. Login ด้วย user account
2. ลองทุกแท็บ

**Expected Result:**
- ❌ ไม่เห็นปุ่ม + ในทุกแท็บ
- ✅ ดูข้อมูลได้ทั้งหมด
- ✅ ค้นหาได้
- ✅ ดูรายละเอียดได้

---

## 📋 Test Scenario 3: API Permission

### Test Case 3.1: Create Meeting (Secretary)
**Steps:**
```bash
# Login first
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"secretary_user","password":"password"}' \
  | jq -r '.token')

# Create meeting
curl -X POST http://localhost:3001/api/meetings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meeting_number": "TEST/2568",
    "meeting_title": "Test Meeting",
    "meeting_date": "2025-05-15",
    "location": "Test Location",
    "department": "Test Dept"
  }'
```

**Expected Result:**
- ✅ Status 201 Created
- ✅ Meeting created successfully

---

### Test Case 3.2: Create Meeting (Manager) - Should Fail
**Steps:**
```bash
# Login as manager
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"manager_user","password":"password"}' \
  | jq -r '.token')

# Try to create meeting
curl -X POST http://localhost:3001/api/meetings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meeting_number": "TEST/2568",
    "meeting_title": "Test Meeting",
    "meeting_date": "2025-05-15"
  }'
```

**Expected Result:**
- ❌ Status 403 Forbidden
- ✅ Message: "คุณไม่มีสิทธิ์ในการดำเนินการนี้ (เฉพาะเจ้าหน้าที่ธุรการ)"

---

### Test Case 3.3: Create Agenda (Manager)
**Steps:**
```bash
# Login as manager
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"manager_user","password":"password"}' \
  | jq -r '.token')

# Create agenda
curl -X POST http://localhost:3001/api/agendas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "meeting_number": "1/2568",
    "agenda_number": "TEST.1",
    "agenda_topic": "Test Agenda",
    "agenda_type": "เพื่อทราบ",
    "submitting_department": "Test Dept"
  }'
```

**Expected Result:**
- ✅ Status 201 Created
- ✅ Agenda created successfully

---

### Test Case 3.4: Access Without Token - Should Fail
**Steps:**
```bash
# Try to get meetings without token
curl http://localhost:3001/api/meetings
```

**Expected Result:**
- ❌ Status 401 Unauthorized
- ✅ Message: "กรุณาเข้าสู่ระบบก่อนใช้งาน"

---

## 📋 Test Scenario 4: Audit Logging

### Test Case 4.1: Login Audit
**Steps:**
1. Login ด้วย username ใดก็ได้
2. ตรวจสอบ audit_logs

**SQL Check:**
```sql
SELECT 
    username,
    action,
    ip_address,
    user_agent,
    created_at
FROM audit_logs
WHERE action = 'login'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected Result:**
- ✅ มีบันทึกการ login
- ✅ มี username ถูกต้อง
- ✅ มี IP address
- ✅ มี user agent

---

### Test Case 4.2: View Audit
**Steps:**
1. Login แล้วดูรายการการประชุม
2. ดูรายละเอียดการประชุม 1 รายการ
3. ตรวจสอบ audit_logs

**SQL Check:**
```sql
SELECT 
    username,
    action,
    resource_type,
    resource_id,
    created_at
FROM audit_logs
WHERE action = 'view' AND username = 'your_username'
ORDER BY created_at DESC
LIMIT 10;
```

**Expected Result:**
- ✅ มีบันทึกการ view
- ✅ resource_type = 'meeting'
- ✅ มี resource_id (ถ้าดูรายละเอียด)

---

### Test Case 4.3: Logout Audit
**Steps:**
1. กดปุ่ม "ออกจากระบบ"
2. ตรวจสอบ audit_logs

**SQL Check:**
```sql
SELECT * FROM audit_logs 
WHERE action = 'logout' AND username = 'your_username'
ORDER BY created_at DESC LIMIT 1;
```

**Expected Result:**
- ✅ มีบันทึกการ logout
- ✅ Redirect ไปหน้า login

---

## 📋 Test Scenario 5: Token Management

### Test Case 5.1: Token Verification
**Steps:**
1. Login และเก็บ token
2. Refresh หน้า
3. ตรวจสอบว่ายัง login อยู่

**Expected Result:**
- ✅ ยัง login อยู่
- ✅ ไม่ต้อง login ใหม่
- ✅ แสดงข้อมูลผู้ใช้ถูกต้อง

---

### Test Case 5.2: Token Expiry (Manual Test)
**Steps:**
1. Login
2. รอ 24 ชั่วโมง (หรือแก้ JWT_EXPIRES_IN เป็น 1m สำหรับทดสอบ)
3. พยายามใช้งานระบบ

**Expected Result:**
- ❌ Token หมดอายุ
- ✅ Redirect ไปหน้า login
- ✅ แสดงข้อความ "Token ไม่ถูกต้องหรือหมดอายุ"

---

### Test Case 5.3: Invalid Token
**Steps:**
```bash
# Use invalid token
curl http://localhost:3001/api/meetings \
  -H "Authorization: Bearer invalid_token_here"
```

**Expected Result:**
- ❌ Status 403 Forbidden
- ✅ Message: "Token ไม่ถูกต้องหรือหมดอายุ"

---

## 📋 Test Scenario 6: User Management

### Test Case 6.1: Auto-Create User Record
**Steps:**
1. Login ด้วย username ที่ไม่มีในตาราง users
2. ตรวจสอบตาราง users

**SQL Check:**
```sql
SELECT * FROM users WHERE username = 'new_username';
```

**Expected Result:**
- ✅ มีการสร้าง user record อัตโนมัติ
- ✅ role = 'user' (default)
- ✅ is_active = true

---

### Test Case 6.2: Update User Role
**Steps:**
1. Login ด้วย user ทั่วไป (role = user)
2. อัพเดท role เป็น secretary
3. Logout และ Login ใหม่

**SQL Update:**
```sql
UPDATE users SET role = 'secretary' WHERE username = 'test_user';
```

**Expected Result:**
- ✅ Login ใหม่ได้ role เป็น secretary
- ✅ เห็นปุ่ม + ในทุกแท็บ
- ✅ มีสิทธิ์เต็ม

---

## 📋 Test Scenario 7: Edge Cases

### Test Case 7.1: Concurrent Logins
**Steps:**
1. Login ในเบราว์เซอร์ 1
2. Login ด้วย username เดียวกันในเบราว์เซอร์ 2

**Expected Result:**
- ✅ Login ได้ทั้ง 2 เบราว์เซอร์
- ✅ แต่ละเบราว์เซอร์มี token ของตัวเอง

---

### Test Case 7.2: SQL Injection Prevention
**Steps:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR '\''1'\''='\''1","password":"anything"}'
```

**Expected Result:**
- ❌ Login ไม่สำเร็จ
- ✅ ไม่มี SQL injection

---

### Test Case 7.3: XSS Prevention
**Steps:**
1. Login ด้วย username ปกติ
2. สร้างการประชุมด้วย title: `<script>alert('XSS')</script>`

**Expected Result:**
- ✅ บันทึกข้อมูลได้
- ✅ แสดงผลเป็น text ธรรมดา (ไม่รัน script)

---

## 📊 Test Summary Checklist

### Authentication
- [ ] Login สำเร็จ (Secretary)
- [ ] Login สำเร็จ (Manager)
- [ ] Login สำเร็จ (User)
- [ ] Login ไม่สำเร็จ (Wrong password)
- [ ] Login ไม่สำเร็จ (Inactive user)
- [ ] Logout สำเร็จ
- [ ] Token verification ทำงาน
- [ ] Token expiry ทำงาน

### Role-Based UI
- [ ] Secretary เห็นปุ่ม + ทุกแท็บ
- [ ] Manager เห็นปุ่ม + เฉพาะแท็บวาระ
- [ ] User ไม่เห็นปุ่ม + เลย
- [ ] Role badge แสดงถูกต้อง

### API Permissions
- [ ] Secretary สร้างการประชุมได้
- [ ] Manager สร้างการประชุมไม่ได้
- [ ] Manager สร้างวาระได้
- [ ] User สร้างอะไรไม่ได้
- [ ] ไม่มี token เข้าถึง API ไม่ได้

### Audit Logging
- [ ] บันทึก login
- [ ] บันทึก logout
- [ ] บันทึก view
- [ ] เก็บ IP address
- [ ] เก็บ user agent

### User Management
- [ ] Auto-create user record
- [ ] Update role ทำงาน
- [ ] Inactive user ไม่ login ได้

---

## 🎯 Test Result Template

```
Test Date: _______________
Tester: _______________

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1.1 Login (Secretary) | ⬜ Pass ⬜ Fail | |
| 1.2 Login (Manager) | ⬜ Pass ⬜ Fail | |
| 1.3 Login (User) | ⬜ Pass ⬜ Fail | |
| ... | | |

Overall Result: ⬜ Pass ⬜ Fail
```
