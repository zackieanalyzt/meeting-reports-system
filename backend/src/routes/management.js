const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { requireSecretary } = require('../middleware/permissions');
const { auditLog } = require('../middleware/audit');
const fs = require('fs');
const path = require('path');

// Apply authentication and secretary role check to all management routes
router.use(authenticateToken);
router.use(requireSecretary);

// ========================================
// STATISTICS ENDPOINTS
// ========================================

// Get system statistics
router.get('/statistics', async (req, res) => {
  try {
    // Count meetings
    const meetingsResult = await db.query('SELECT COUNT(*) FROM meeting_reports');
    const meetings_total = parseInt(meetingsResult.rows[0].count);

    // Count agendas
    const agendasResult = await db.query('SELECT COUNT(*) FROM meeting_agendas');
    const agendas_total = parseInt(agendasResult.rows[0].count);

    // Count reports uploaded (meetings with files)
    const reportsResult = await db.query(
      'SELECT COUNT(*) FROM meeting_reports WHERE file_size > 0'
    );
    const reports_uploaded = parseInt(reportsResult.rows[0].count);

    // Count reports pending
    const reports_pending = meetings_total - reports_uploaded;

    // Calculate storage used from meeting_reports
    const storageResult = await db.query(
      'SELECT COALESCE(SUM(file_size), 0) as total FROM meeting_reports WHERE file_size > 0'
    );
    const meeting_storage = parseInt(storageResult.rows[0].total || 0);

    // Calculate storage used from meeting_files
    const filesStorageResult = await db.query(
      'SELECT COALESCE(SUM(file_size), 0) as total FROM meeting_files'
    );
    const files_storage = parseInt(filesStorageResult.rows[0].total || 0);

    const storage_used_bytes = meeting_storage + files_storage;

    // Count total files
    const filesCountResult = await db.query(
      'SELECT COUNT(*) FROM meeting_files'
    );
    const files_count = parseInt(filesCountResult.rows[0].count);

    // Format file size helper
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Audit log
    await auditLog(req.user.username, 'view_statistics', 'management', null, null, req);

    res.json({
      success: true,
      data: {
        meetings_total,
        agendas_total,
        reports_uploaded,
        reports_pending,
        storage_used_bytes,
        storage_used_formatted: formatFileSize(storage_used_bytes),
        files_total: reports_uploaded + files_count,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถิติ',
      error: error.message
    });
  }
});

// Get storage breakdown
router.get('/storage-breakdown', async (req, res) => {
  try {
    // Meeting reports storage
    const meetingStorageResult = await db.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(file_size), 0) as total FROM meeting_reports WHERE file_size > 0'
    );
    
    // Meeting files storage
    const filesStorageResult = await db.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(file_size), 0) as total FROM meeting_files'
    );

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const meetingStorage = parseInt(meetingStorageResult.rows[0].total);
    const filesStorage = parseInt(filesStorageResult.rows[0].total);
    const totalStorage = meetingStorage + filesStorage;

    res.json({
      success: true,
      data: {
        meeting_reports: {
          count: parseInt(meetingStorageResult.rows[0].count),
          size_bytes: meetingStorage,
          size_formatted: formatFileSize(meetingStorage)
        },
        meeting_files: {
          count: parseInt(filesStorageResult.rows[0].count),
          size_bytes: filesStorage,
          size_formatted: formatFileSize(filesStorage)
        },
        total: {
          count: parseInt(meetingStorageResult.rows[0].count) + parseInt(filesStorageResult.rows[0].count),
          size_bytes: totalStorage,
          size_formatted: formatFileSize(totalStorage)
        }
      }
    });
  } catch (error) {
    console.error('Error getting storage breakdown:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลพื้นที่',
      error: error.message
    });
  }
});

// Get recent activities
router.get('/recent-activities', async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    
    const result = await db.query(
      `SELECT 
        id, username, action, resource_type, resource_id, 
        details, ip_address, created_at
       FROM audit_logs 
       ORDER BY created_at DESC 
       LIMIT $1`,
      [limit]
    );

    // Format activities with Thai descriptions
    const activities = result.rows.map(activity => {
      let description = '';
      switch(activity.action) {
        case 'login':
          description = 'เข้าสู่ระบบ';
          break;
        case 'logout':
          description = 'ออกจากระบบ';
          break;
        case 'create_meeting':
          description = 'สร้างการประชุม';
          break;
        case 'update_meeting':
          description = 'แก้ไขการประชุม';
          break;
        case 'delete_meeting':
          description = 'ลบการประชุม';
          break;
        case 'create_agenda':
          description = 'สร้างวาระ';
          break;
        case 'update_agenda':
          description = 'แก้ไขวาระ';
          break;
        case 'delete_agenda':
          description = 'ลบวาระ';
          break;
        case 'upload_report':
          description = 'อัพโหลดรายงาน';
          break;
        case 'view_meeting':
          description = 'ดูการประชุม';
          break;
        case 'view_agenda':
          description = 'ดูวาระ';
          break;
        default:
          description = activity.action;
      }

      return {
        ...activity,
        description,
        time_ago: getTimeAgo(activity.created_at)
      };
    });

    res.json({
      success: true,
      data: activities,
      count: activities.length
    });
  } catch (error) {
    console.error('Error getting recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงกิจกรรม',
      error: error.message
    });
  }
});

// Helper function to calculate time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' ปีที่แล้ว';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' เดือนที่แล้ว';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' วันที่แล้ว';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' ชั่วโมงที่แล้ว';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' นาทีที่แล้ว';
  
  return Math.floor(seconds) + ' วินาทีที่แล้ว';
}

// ========================================
// MEETINGS MANAGEMENT ENDPOINTS
// ========================================

// Get all meetings with details
router.get('/meetings', async (req, res) => {
  try {
    const { search, department, has_report } = req.query;
    
    let query = `
      SELECT 
        m.*,
        (SELECT COUNT(*) FROM meeting_agendas WHERE meeting_number = m.meeting_number) as agenda_count,
        (CASE WHEN m.file_size > 0 THEN true ELSE false END) as has_report
      FROM meeting_reports m
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (m.meeting_title ILIKE $${paramCount} OR m.meeting_number ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (department) {
      paramCount++;
      query += ` AND m.department = $${paramCount}`;
      params.push(department);
    }

    if (has_report !== undefined) {
      if (has_report === 'true') {
        query += ` AND m.file_size > 0`;
      } else if (has_report === 'false') {
        query += ` AND (m.file_size = 0 OR m.file_size IS NULL)`;
      }
    }

    query += ' ORDER BY m.meeting_date DESC';

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error getting meetings:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลการประชุม',
      error: error.message
    });
  }
});

// ========================================
// AGENDAS MANAGEMENT ENDPOINTS
// ========================================

// Get all agendas with details
router.get('/agendas', async (req, res) => {
  try {
    const { meeting_number, department, type } = req.query;
    
    let query = `
      SELECT 
        a.*,
        m.meeting_title,
        m.meeting_date
      FROM meeting_agendas a
      LEFT JOIN meeting_reports m ON a.meeting_number = m.meeting_number
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (meeting_number) {
      paramCount++;
      query += ` AND a.meeting_number = $${paramCount}`;
      params.push(meeting_number);
    }

    if (department) {
      paramCount++;
      query += ` AND a.submitting_department = $${paramCount}`;
      params.push(department);
    }

    if (type) {
      paramCount++;
      query += ` AND a.agenda_type = $${paramCount}`;
      params.push(type);
    }

    query += ' ORDER BY a.meeting_number DESC, a.agenda_number';

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error getting agendas:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลวาระ',
      error: error.message
    });
  }
});

// ========================================
// FILES MANAGEMENT ENDPOINTS
// ========================================

// Get all files
router.get('/files', async (req, res) => {
  try {
    // Get meeting report files
    const meetingFilesQuery = `
      SELECT 
        'meeting_report' as file_type,
        m.id,
        m.meeting_number,
        m.meeting_title,
        m.file_path,
        m.file_size,
        m.created_by as uploaded_by,
        m.created_at
      FROM meeting_reports m
      WHERE m.file_size > 0
    `;

    // Get additional meeting files
    const additionalFilesQuery = `
      SELECT 
        'meeting_file' as file_type,
        mf.id,
        m.meeting_number,
        m.meeting_title,
        mf.file_path,
        mf.file_size,
        mf.uploaded_by,
        mf.created_at
      FROM meeting_files mf
      JOIN meeting_reports m ON mf.meeting_id = m.id
    `;

    const meetingFilesResult = await db.query(meetingFilesQuery);
    const additionalFilesResult = await db.query(additionalFilesQuery);

    // Combine and format
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const allFiles = [
      ...meetingFilesResult.rows.map(f => ({
        ...f,
        file_size_formatted: formatFileSize(f.file_size),
        file_name: path.basename(f.file_path)
      })),
      ...additionalFilesResult.rows.map(f => ({
        ...f,
        file_size_formatted: formatFileSize(f.file_size),
        file_name: path.basename(f.file_path)
      }))
    ];

    // Sort by created_at desc
    allFiles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      success: true,
      data: allFiles,
      count: allFiles.length
    });
  } catch (error) {
    console.error('Error getting files:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลไฟล์',
      error: error.message
    });
  }
});

// Delete file
router.delete('/files/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const UPLOADS_PATH = process.env.UPLOADS_PATH || path.join(__dirname, '../../../uploads');

    let filePath = null;
    let deleteQuery = '';

    if (type === 'meeting_report') {
      // Get file path
      const fileResult = await db.query(
        'SELECT file_path FROM meeting_reports WHERE id = $1',
        [id]
      );
      
      if (fileResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบไฟล์'
        });
      }

      filePath = fileResult.rows[0].file_path;

      // Update database (remove file reference)
      deleteQuery = `
        UPDATE meeting_reports 
        SET file_path = '', file_size = 0, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $1
        RETURNING *
      `;
    } else if (type === 'meeting_file') {
      // Get file path
      const fileResult = await db.query(
        'SELECT file_path FROM meeting_files WHERE id = $1',
        [id]
      );
      
      if (fileResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'ไม่พบไฟล์'
        });
      }

      filePath = fileResult.rows[0].file_path;

      // Delete from database
      deleteQuery = 'DELETE FROM meeting_files WHERE id = $1 RETURNING *';
    } else {
      return res.status(400).json({
        success: false,
        message: 'ประเภทไฟล์ไม่ถูกต้อง'
      });
    }

    // Execute delete query
    const result = await db.query(deleteQuery, [id]);

    // Delete physical file
    if (filePath) {
      const fullPath = path.join(UPLOADS_PATH, path.basename(filePath));
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // Audit log
    await auditLog(
      req.user.username, 
      'delete_file', 
      type, 
      id, 
      { file_path: filePath }, 
      req
    );

    res.json({
      success: true,
      message: 'ลบไฟล์สำเร็จ',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบไฟล์',
      error: error.message
    });
  }
});

// Bulk delete meetings
router.post('/meetings/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ IDs ที่ต้องการลบ'
      });
    }

    // Delete meetings
    const result = await db.query(
      'DELETE FROM meeting_reports WHERE id = ANY($1) RETURNING *',
      [ids]
    );

    // Audit log
    await auditLog(
      req.user.username,
      'bulk_delete_meetings',
      'meeting_reports',
      null,
      { count: result.rows.length, ids },
      req
    );

    res.json({
      success: true,
      message: `ลบการประชุม ${result.rows.length} รายการสำเร็จ`,
      deleted_count: result.rows.length
    });
  } catch (error) {
    console.error('Error bulk deleting meetings:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบการประชุม',
      error: error.message
    });
  }
});

// Bulk delete agendas - Soft Delete
router.post('/agendas/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ IDs ที่ต้องการลบ'
      });
    }

    // Soft delete agendas
    const result = await db.query(
      `UPDATE meeting_agendas 
       SET is_active = FALSE, deleted_at = NOW()
       WHERE id = ANY($1) AND is_active = TRUE
       RETURNING *`,
      [ids]
    );

    // Soft delete related files
    await db.query(
      `UPDATE agenda_files 
       SET is_active = FALSE, deleted_at = NOW()
       WHERE agenda_id = ANY($1) AND is_active = TRUE`,
      [ids]
    );

    // Audit log
    await auditLog(
      req.user.username,
      'bulk_soft_delete_agendas',
      'meeting_agendas',
      null,
      { count: result.rows.length, ids },
      req
    );

    res.json({
      success: true,
      message: `ลบวาระ ${result.rows.length} รายการสำเร็จ`,
      deleted_count: result.rows.length
    });
  } catch (error) {
    console.error('Error bulk deleting agendas:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบวาระ',
      error: error.message
    });
  }
});

module.exports = router;
