const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mariadb = require('../config/mariadb');
const db = require('../database');
const { auditLog } = require('../middleware/audit');

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอก username และ password'
      });
    }

    // Hash password with MD5 (to match MariaDB personnel table)
    const md5Password = crypto.createHash('md5').update(password).digest('hex');

    // Query MariaDB personnel table for authentication
    const [rows] = await mariadb.query(
      'SELECT username, prefix, fname, lname FROM personnel WHERE username = ? AND password = ?',
      [username, md5Password]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    const personnel = rows[0];

    // Check role from PostgreSQL users table
    const roleResult = await db.query(
      'SELECT role, is_active FROM users WHERE username = $1',
      [username]
    );

    let role = 'user'; // Default role for users not in users table
    let isActive = true;

    if (roleResult.rows.length > 0) {
      const userRecord = roleResult.rows[0];
      role = userRecord.role;
      isActive = userRecord.is_active;

      if (!isActive) {
        return res.status(403).json({
          success: false,
          message: 'บัญชีผู้ใช้ถูกระงับการใช้งาน'
        });
      }
    }
    // Note: ไม่สร้าง record อัตโนมัติ - ให้ใช้ default role 'user' สำหรับคนที่ไม่มีในตาราง

    // Generate JWT token สำหรับทุกคน (รวม user ธรรมดา)
    const token = jwt.sign(
      {
        username: personnel.username,
        prefix: personnel.prefix,
        fname: personnel.fname,
        lname: personnel.lname,
        role: role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Log successful login
    await auditLog(username, 'login', null, null, { role }, req);

    // ส่ง response ที่ถูกต้องสำหรับทุก role
    res.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        username: personnel.username,
        prefix: personnel.prefix,
        fname: personnel.fname,
        lname: personnel.lname,
        fullname: `${personnel.prefix}${personnel.fname} ${personnel.lname}`,
        role: role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
      error: error.message
    });
  }
});

// Logout endpoint (for audit logging)
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await auditLog(decoded.username, 'logout', null, null, null, req);
    }

    res.json({
      success: true,
      message: 'ออกจากระบบสำเร็จ'
    });
  } catch (error) {
    // Even if token verification fails, return success
    res.json({
      success: true,
      message: 'ออกจากระบบสำเร็จ'
    });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'ไม่พบ token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      success: true,
      user: {
        username: decoded.username,
        prefix: decoded.prefix,
        fname: decoded.fname,
        lname: decoded.lname,
        fullname: `${decoded.prefix}${decoded.fname} ${decoded.lname}`,
        role: decoded.role
      }
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Token ไม่ถูกต้องหรือหมดอายุ'
    });
  }
});

module.exports = router;
