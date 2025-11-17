# 🧪 Testing Guide: Multiple File Upload

## วิธีทดสอบระบบ Multiple File Upload

---

## 🚀 เริ่มต้น

### 1. เริ่มระบบ

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Login

```
URL: http://localhost:5173
Username: [secretary account]
Password: [password]
```

---

## 📋 Test Case 1: อัพโหลดรายงานการประชุม (Multiple Files)

### Steps:

1. **ไปที่แท็บ "รายงานการประชุม"**
   - คลิกแท็บ "📋 รายงานการประชุม"

2. **เปิด Upload Form**
   - คลิกปุ่ม "+" (มุมขวาล่าง)
   - ต้องเห็น modal "📤 อัพโหลดรายงานการประชุม"

3. **เลือกการประชุม**
   - เลือกการประชุมจาก dropdown

4. **ทดสอบ Multiple File Selection**
   
   **วิธีที่ 1: คลิกเลือกไฟล์**
   - คลิกที่ upload area (พื้นที่สีเทา)
   - File dialog จะเปิด
   - **กด Ctrl (Windows) หรือ Cmd (Mac) + คลิกเลือกหลายไฟล์**
   - เลือก 3-5 ไฟล์
   - คลิก "Open"

   **วิธีที่ 2: Drag & Drop**
   - เปิด File Explorer
   - เลือกหลายไฟล์ (Ctrl+Click)
   - ลากไฟล์มาวางที่ upload area

5. **ตรวจสอบ File List**
   
   ต้องเห็น:
   ```
   ไฟล์ที่เลือก (3/10)
   
   📄 report1.pdf          [X]
      2.5 MB
   
   🖼️ image1.jpg           [X]
      1.2 MB
   
   📝 document1.docx       [X]
      0.8 MB
   ```

6. **ทดสอบ Remove File**
   - คลิกปุ่ม [X] ที่ไฟล์ใดไฟล์หนึ่ง
   - ไฟล์ต้องหายจาก list
   - File count ต้องอัพเดท (เช่น 3/10 → 2/10)

7. **อัพโหลด**
   - คลิกปุ่ม "📤 อัพโหลดรายงาน"
   - รอ loading
   - ต้องเห็นข้อความ "✅ อัพโหลด X ไฟล์สำเร็จ"

8. **ตรวจสอบผลลัพธ์**
   - Modal ปิด
   - รายการรายงานอัพเดท
   - ไม่มี error ใน console

### Expected Results:

✅ เลือกหลายไฟล์พร้อมกันได้  
✅ File list แสดงไฟล์ทั้งหมด  
✅ File count ถูกต้อง (เช่น "3/10 ไฟล์")  
✅ Remove button ทำงาน  
✅ Drag & drop ทำงาน  
✅ อัพโหลดสำเร็จไม่มี error  
✅ ไฟล์ถูกบันทึกใน database  

### Screenshots Needed:

📸 **Screenshot 1:** Upload area with drag & drop zone  
📸 **Screenshot 2:** File list showing 3+ files  
📸 **Screenshot 3:** File count display  
📸 **Screenshot 4:** Success message  

---

## 📋 Test Case 2: เพิ่มวาระพร้อมไฟล์ (Multiple Files)

### Steps:

1. **ไปที่แท็บ "วาระการประชุม"**
   - คลิกแท็บ "📑 วาระการประชุม"

2. **เปิด Agenda Form**
   - คลิกปุ่ม "+" (มุมขวาล่าง)
   - ต้องเห็น modal "📑 เพิ่มวาระการประชุม"

3. **กรอกข้อมูลวาระ**
   - เลขที่การประชุม: 1/2568
   - หมายเลขวาระ: 1.1
   - หัวข้อวาระ: ทดสอบ Multiple Upload
   - ประเภทวาระ: วาระที่ 3
   - กลุ่มงาน: กลุ่มงานบริหาร

4. **ทดสอบ Multiple File Selection**
   
   **วิธีที่ 1: คลิกเลือกไฟล์**
   - คลิกที่ upload area
   - เลือกหลายไฟล์ (Ctrl+Click)
   - เลือก 2-3 ไฟล์
   - คลิก "Open"

   **วิธีที่ 2: Drag & Drop**
   - ลากหลายไฟล์มาวางที่ upload area

5. **ตรวจสอบ File List**
   
   ต้องเห็น:
   ```
   ไฟล์ที่เลือก (2/5)
   
   📄 agenda1.pdf          [X]
      1.5 MB
   
   📊 data.xlsx            [X]
      0.5 MB
   ```

6. **บันทึก**
   - คลิกปุ่ม "บันทึก"
   - รอ loading
   - ต้องเห็นข้อความ "✅ บันทึกวาระพร้อม X ไฟล์สำเร็จ"

7. **ตรวจสอบผลลัพธ์**
   - Modal ปิด
   - วาระใหม่แสดงใน list
   - ไม่มี error

### Expected Results:

✅ เลือกหลายไฟล์พร้อมกันได้  
✅ File list แสดงไฟล์ทั้งหมด  
✅ File count ถูกต้อง (เช่น "2/5 ไฟล์")  
✅ บันทึกสำเร็จไม่มี error  
✅ วาระและไฟล์ถูกบันทึก  

### Screenshots Needed:

📸 **Screenshot 1:** Agenda form with file upload area  
📸 **Screenshot 2:** File list in agenda form  
📸 **Screenshot 3:** Success message  

---

## 📋 Test Case 3: File Validation

### Test 3.1: File Type Validation

**Steps:**
1. พยายามอัพโหลดไฟล์ .txt
2. ต้องเห็น error: "file.txt: ประเภทไฟล์ไม่รองรับ"

**Expected:**
✅ แสดง error message  
✅ ไฟล์ไม่ถูกเพิ่มใน list  

### Test 3.2: File Size Validation

**Steps:**
1. พยายามอัพโหลดไฟล์ขนาด > 10MB
2. ต้องเห็น error: "file.pdf: ไฟล์ใหญ่เกิน 10MB"

**Expected:**
✅ แสดง error message  
✅ ไฟล์ไม่ถูกเพิ่มใน list  

### Test 3.3: Max Files Validation

**Steps:**
1. พยายามอัพโหลด 6 ไฟล์ในวาระ (max 5)
2. ต้องเห็น error: "สามารถอัพโหลดได้สูงสุด 5 ไฟล์"

**Expected:**
✅ แสดง error message  
✅ ไฟล์เกินไม่ถูกเพิ่ม  

---

## 📋 Test Case 4: Supported File Types

### Test Each File Type:

| File Type | Extension | Expected |
|-----------|-----------|----------|
| PDF | .pdf | ✅ Success |
| JPEG | .jpg, .jpeg | ✅ Success |
| Word | .docx | ✅ Success |
| Excel | .xlsx | ✅ Success |
| Markdown | .md | ✅ Success |
| Text | .txt | ❌ Error |
| PNG | .png | ❌ Error |

**Steps for each:**
1. เลือกไฟล์ประเภทนั้น
2. ตรวจสอบว่าถูก accept หรือ reject
3. ตรวจสอบ icon ที่แสดง

**Expected Icons:**
- 📄 PDF
- 🖼️ JPG/JPEG
- 📝 DOCX
- 📊 XLSX
- 📋 MD

---

## 📋 Test Case 5: 500 Error Fix

### Test Single File Upload (Backward Compatible)

**Steps:**
1. เลือกไฟล์เดียว
2. อัพโหลด
3. ต้องไม่มี 500 error

**Expected:**
✅ อัพโหลดสำเร็จ  
✅ ไม่มี 500 error  
✅ Backend logs ไม่มี SQL error  

---

## 🔍 Browser DevTools Checks

### 1. Elements Tab

**Check HTML:**
```html
<input 
  type="file" 
  multiple 
  accept=".pdf,.jpg,.jpeg,.docx,.xlsx,.md" 
  style="display: none;"
/>
```

**Verify:**
✅ `multiple` attribute exists  
✅ `accept` attribute has correct types  

### 2. Console Tab

**Check for errors:**
```
❌ Should NOT see:
- 500 Internal Server Error
- SQL syntax error
- Uncaught TypeError
- Failed to fetch

✅ Should see:
- File uploaded successfully
- Audit log created
```

### 3. Network Tab

**Check upload request:**
```
Request URL: http://localhost:3001/api/meetings/1/reports-multiple
Request Method: PUT
Content-Type: multipart/form-data

Form Data:
- files: (binary)
- files: (binary)
- files: (binary)
```

**Verify:**
✅ Multiple files in FormData  
✅ Status: 200 OK  
✅ Response: { success: true, files_uploaded: 3 }  

---

## 🗄️ Database Verification

### Check Uploaded Files

```sql
-- Check meeting files
SELECT * FROM meeting_files 
WHERE meeting_id = 1 
ORDER BY created_at DESC;

-- Check agenda files
SELECT * FROM agenda_files 
WHERE agenda_id = 1 
ORDER BY created_at DESC;

-- Check audit logs
SELECT * FROM audit_logs 
WHERE action LIKE '%upload%' 
ORDER BY created_at DESC 
LIMIT 10;
```

**Expected:**
✅ Files saved in database  
✅ Correct file names  
✅ Correct file sizes  
✅ Audit logs created  

---

## 📹 Video Recording Checklist

### Video 1: Multiple File Selection (30 seconds)
- [ ] Show upload area
- [ ] Click to select multiple files (Ctrl+Click)
- [ ] Show file dialog with multiple files selected
- [ ] Show file list with all files
- [ ] Show file count (e.g., "3/10 ไฟล์")

### Video 2: Drag & Drop (20 seconds)
- [ ] Show File Explorer with multiple files
- [ ] Drag files to upload area
- [ ] Show drag active state
- [ ] Show files added to list

### Video 3: Remove Files (15 seconds)
- [ ] Show file list with 3+ files
- [ ] Click remove button on one file
- [ ] Show file removed from list
- [ ] Show updated file count

### Video 4: Successful Upload (30 seconds)
- [ ] Show filled form with multiple files
- [ ] Click submit button
- [ ] Show loading state
- [ ] Show success message
- [ ] Show updated list

### Video 5: No 500 Error (20 seconds)
- [ ] Show Network tab in DevTools
- [ ] Upload files
- [ ] Show 200 OK response
- [ ] Show no errors in console

---

## ✅ Final Checklist

### Before Submitting Evidence:

- [ ] All test cases passed
- [ ] Screenshots captured
- [ ] Videos recorded
- [ ] No errors in console
- [ ] Backend logs clean
- [ ] Database records verified
- [ ] Multiple file selection works
- [ ] Drag & drop works
- [ ] File validation works
- [ ] No 500 errors
- [ ] Audit logs created

---

## 📊 Test Results Template

```markdown
## Test Results

**Date:** [Date]
**Tester:** [Name]
**Browser:** [Chrome/Firefox/Edge]
**Version:** [Version]

### Test Case 1: Multiple File Upload - Reports
- Status: ✅ PASS / ❌ FAIL
- Files uploaded: 3
- Time taken: 5 seconds
- Notes: [Any notes]

### Test Case 2: Multiple File Upload - Agendas
- Status: ✅ PASS / ❌ FAIL
- Files uploaded: 2
- Time taken: 3 seconds
- Notes: [Any notes]

### Test Case 3: File Validation
- Type validation: ✅ PASS / ❌ FAIL
- Size validation: ✅ PASS / ❌ FAIL
- Max files validation: ✅ PASS / ❌ FAIL

### Test Case 4: File Types
- PDF: ✅ PASS / ❌ FAIL
- JPG: ✅ PASS / ❌ FAIL
- DOCX: ✅ PASS / ❌ FAIL
- XLSX: ✅ PASS / ❌ FAIL
- MD: ✅ PASS / ❌ FAIL

### Test Case 5: 500 Error Fix
- Single file upload: ✅ PASS / ❌ FAIL
- No SQL errors: ✅ PASS / ❌ FAIL
- Backend logs clean: ✅ PASS / ❌ FAIL

### Overall Result: ✅ PASS / ❌ FAIL
```

---

<div align="center">

**🧪 Happy Testing! 🧪**

ทดสอบให้ครบทุก test case!

</div>
