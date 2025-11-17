# 🐛 Bug Fix Summary: Authentication Token

## ปัญหา
- ❌ 401 Unauthorized Error ในทุก API calls หลัง login
- ❌ Token ไม่ถูกส่งไปกับ API requests

## สาเหตุ
1. `api.js` - ไม่มี request interceptor สำหรับใส่ token
2. `api.js` - ฟังก์ชัน upload ใช้ `axios` โดยตรงแทน `api` instance
3. `AuthContext.jsx` - ไม่ sync localStorage กับ token state

## การแก้ไข

### 1. frontend/src/services/api.js

**เพิ่ม Request Interceptor:**
```javascript
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

**เพิ่ม Response Interceptor:**
```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**แก้ไขฟังก์ชัน:**
- `uploadMeetingReport`: เปลี่ยนจาก `axios.put` เป็น `api.put`
- `uploadFile`: เปลี่ยนจาก `axios.post` เป็น `api.post`

### 2. frontend/src/contexts/AuthContext.jsx

**อัพเดท useEffect:**
```javascript
useEffect(() => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token); // เพิ่ม
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token'); // เพิ่ม
  }
}, [token]);
```

**ปรับปรุง login:**
- ลบการ set localStorage manual (ให้ useEffect จัดการ)
- เพิ่ม error logging
- Handle both success และ error cases

**ปรับปรุง logout:**
- ลบการลบ localStorage manual (ให้ useEffect จัดการ)
- ตรวจสอบว่ามี token ก่อน logout

## ผลลัพธ์

### Before
- ❌ API calls ได้ 401 error
- ❌ ไม่สามารถใช้งานระบบ
- ❌ Token ไม่ persistent

### After
- ✅ API calls ทำงานปกติ
- ✅ ใช้งานระบบได้เต็มรูปแบบ
- ✅ Token persistent หลัง refresh
- ✅ Auto redirect เมื่อ token หมดอายุ

## การทดสอบ

1. **Login**: ✅ สำเร็จ
2. **API Calls**: ✅ มี token ใน headers
3. **Refresh**: ✅ ยัง login อยู่
4. **Logout**: ✅ Token ถูกลบ
5. **File Upload**: ✅ มี token

## ไฟล์ที่แก้ไข

1. `frontend/src/services/api.js` (+30 lines)
2. `frontend/src/contexts/AuthContext.jsx` (+10 lines)

## เอกสาร

- **BUGFIX_AUTH_TOKEN.md** - รายละเอียดเต็ม

---

**Status:** ✅ Fixed  
**Priority:** Critical  
**Date:** November 17, 2025
