const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const db = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Import middleware
const { authenticateToken } = require('./middleware/auth');
const { requireSecretary, requireSecretaryOrManager } = require('./middleware/permissions');
const { logView, logDownload } = require('./middleware/audit');

// Import routes
const authRoutes = require('./routes/auth');
const managementRoutes = require('./routes/management');

// Middleware
// Better CORS configuration for LAN access
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development (for LAN access)
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, you can add specific allowed origins here
    // For now, allow all
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
app.use(express.json());

// Auth routes (public - no authentication required)
app.use('/api/auth', authRoutes);

// Management routes (secretary only - authentication required)
app.use('/api/management', managementRoutes);

// Static file serving for uploads
const UPLOADS_PATH = process.env.UPLOADS_PATH || path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_PATH)) {
  fs.mkdirSync(UPLOADS_PATH, { recursive: true });
}

app.use('/uploads', express.static(UPLOADS_PATH));
/*
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_PATH);
  },
  filename: (req, file, cb) => {
    const uniqueName = `meeting_${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});
แก้ไขการอัพโหลดไฟล์ภาษาไทยแล้วอ่านไม่ออก @zackiehybrid 18 NOV 2025 */
// Configure multer for file uploads (fix Thai filename encoding)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_PATH);
  },
  filename: (req, file, cb) => {
    // แปลงชื่อไฟล์จาก Latin1 → UTF-8 (แก้ไฟล์ชื่อไทยเพี้ยน)
    const utf8Name = Buffer.from(file.originalname, 'latin1').toString('utf8');

    // ลบอักขระต้องห้าม (กันพัง)
    const safeName = utf8Name.replace(/[^\wก-ฮะ-์\. \-]/g, '');

    // ตั้งชื่อไฟล์ใหม่แบบปลอดภัย
    const finalName = `meeting_${Date.now()}_${safeName}`;

    cb(null, finalName);
  }
});

// Expanded file type validation - support all common file types
const allowedMimeTypes = [
  // Documents
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-powerpoint', // .ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'text/plain', // .txt
  'text/markdown', // .md
  'text/csv', // .csv
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/bmp',
  'image/webp',
  'image/svg+xml',
  // Archives
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  'application/x-tar',
  'application/gzip',
  // Video
  'video/mp4',
  'video/mpeg',
  'video/quicktime',
  'video/x-msvideo', // .avi
  'video/x-ms-wmv', // .wmv
  // Audio
  'audio/mpeg', // .mp3
  'audio/wav',
  'audio/ogg',
  'audio/mp4'
];

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Check mime type
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      // Also check file extension as fallback
      const ext = path.extname(file.originalname).toLowerCase();
      const allowedExtensions = [
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
        '.txt', '.md', '.csv',
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg',
        '.zip', '.rar', '.7z', '.tar', '.gz',
        '.mp4', '.mpeg', '.mov', '.avi', '.wmv',
        '.mp3', '.wav', '.ogg'
      ];
      
      if (allowedExtensions.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error(`File type not allowed: ${file.mimetype} (${ext}). Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, Images, Archives, Video, Audio`), false);
      }
    }
  },
  limits: {
    fileSize: 20 * 1024 * 1024 // Increased to 20MB per file
  }
});

// Helper function to format Thai date
function formatThaiDate(dateString) {
  let date;
  if (dateString instanceof Date) {
    date = dateString;
  } else if (typeof dateString === 'string') {
    date = new Date(dateString);
  } else {
    return 'วันที่ไม่ถูกต้อง';
  }

  if (isNaN(date.getTime())) {
    return 'วันที่ไม่ถูกต้อง';
  }

  const months = {
    '01': 'มกราคม', '02': 'กุมภาพันธ์', '03': 'มีนาคม',
    '04': 'เมษายน', '05': 'พฤษภาคม', '06': 'มิถุนายน',
    '07': 'กรกฎาคม', '08': 'สิงหาคม', '09': 'กันยายน',
    '10': 'ตุลาคม', '11': 'พฤศจิกายน', '12': 'ธันวาคม'
  };
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const thaiYear = year + 543;
  
  return `${parseInt(day)} ${months[month]} ${thaiYear}`;
}

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Routes

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ 
      success: true, 
      message: 'API is running and database is connected',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      database: 'disconnected'
    });
  }
});

// Detailed health check
app.get('/api/health/detailed', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'checking',
      filesystem: 'checking',
      memory: 'checking'
    }
  };

  try {
    // Check database
    await db.query('SELECT 1');
    health.services.database = 'healthy';

    // Check filesystem
    fs.accessSync(UPLOADS_PATH, fs.constants.W_OK);
    health.services.filesystem = 'healthy';

    // Check memory
    const used = process.memoryUsage();
    health.services.memory = {
      rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`
    };

  } catch (error) {
    health.status = 'unhealthy';
    health.error = error.message;
  }

  res.json(health);
});

// Get all meetings (protected route)
app.get('/api/meetings', authenticateToken, logView('meeting'), async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM meeting_reports';
    let params = [];

    if (search) {
      query += ' WHERE meeting_title ILIKE $1 OR meeting_number ILIKE $1 OR location ILIKE $1';
      params = [`%${search}%`];
    }

    query += ' ORDER BY meeting_date DESC';

    const result = await db.query(query, params);
    
    // Format the data for frontend
    const meetings = result.rows.map(meeting => ({
      ...meeting,
      meeting_date_thai: formatThaiDate(meeting.meeting_date),
      file_size_formatted: formatFileSize(meeting.file_size)
    }));

    res.json({
      success: true,
      data: meetings,
      count: meetings.length
    });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get meeting by ID (protected route)
app.get('/api/meetings/:id', authenticateToken, logView('meeting'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM meeting_reports WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }
    
    const meeting = result.rows[0];
    res.json({
      success: true,
      data: {
        ...meeting,
        meeting_date_thai: formatThaiDate(meeting.meeting_date),
        file_size_formatted: formatFileSize(meeting.file_size)
      }
    });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch meeting',
      message: error.message
    });
  }
});

// Upload single file endpoint (secretary only)
app.post('/api/upload', authenticateToken, requireSecretary, upload.single('pdfFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      filePath: `/uploads/${req.file.filename}`,
      fileSize: req.file.size,
      fileName: req.file.originalname
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

// Upload multiple files endpoint (secretary only)
app.post('/api/upload-multiple', authenticateToken, requireSecretary, upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filePath: `/uploads/${file.filename}`,
      fileSize: file.size,
      fileName: file.originalname,
      mimeType: file.mimetype
    }));

    res.json({
      success: true,
      message: `${req.files.length} files uploaded successfully`,
      files: uploadedFiles,
      count: req.files.length
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

// Create meeting (secretary only)
app.post('/api/meetings', authenticateToken, requireSecretary, async (req, res) => {
  try {
    const {
      meeting_number,
      meeting_title,
      meeting_date,
      meeting_time,
      location,
      department,
      file_path,
      file_size
    } = req.body;

    // Validate required fields
    if (!meeting_number || !meeting_title || !meeting_date) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await db.query(
      `INSERT INTO meeting_reports 
       (meeting_number, meeting_title, meeting_date, meeting_time, location, department, file_path, file_size, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [meeting_number, meeting_title, meeting_date, meeting_time, location, department, file_path, file_size, req.user.username]
    );

    // Audit log
    const { auditLog } = require('./middleware/audit');
    await auditLog(req.user.username, 'create_meeting', 'meeting_reports', result.rows[0].id, { meeting_number }, req);

    res.status(201).json({
      success: true,
      message: 'Meeting created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create meeting',
      message: error.message
    });
  }
});

// Update meeting (secretary only)
app.put('/api/meetings/:id', authenticateToken, requireSecretary, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      meeting_number,
      meeting_title,
      meeting_date,
      meeting_time,
      location,
      department,
      file_path,
      file_size
    } = req.body;

    const result = await db.query(
      `UPDATE meeting_reports 
       SET meeting_number = $1, meeting_title = $2, meeting_date = $3, 
           meeting_time = $4, location = $5, department = $6, 
           file_path = $7, file_size = $8, updated_at = CURRENT_TIMESTAMP, updated_by = $10
       WHERE id = $9
       RETURNING *`,
      [meeting_number, meeting_title, meeting_date, meeting_time, location, department, file_path, file_size, id, req.user.username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }

    // Audit log
    const { auditLog } = require('./middleware/audit');
    await auditLog(req.user.username, 'update_meeting', 'meeting_reports', id, { meeting_number }, req);

    res.json({
      success: true,
      message: 'Meeting updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update meeting',
      message: error.message
    });
  }
});

// Delete meeting (secretary only)
app.delete('/api/meetings/:id', authenticateToken, requireSecretary, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'DELETE FROM meeting_reports WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }

    // Audit log
    const { auditLog } = require('./middleware/audit');
    await auditLog(req.user.username, 'delete_meeting', 'meeting_reports', id, { meeting_number: result.rows[0].meeting_number }, req);

    res.json({
      success: true,
      message: 'Meeting deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete meeting',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT,"0.0.0.0", () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  console.log(`📁 Uploads path: ${UPLOADS_PATH}`);
});

//module.exports = app;


// ========================================
// Agenda Management Endpoints
// ========================================

// Get all agendas with filters (protected route) - NOW WITH FILES!
app.get('/api/agendas', authenticateToken, logView('agenda'), async (req, res) => {
  try {
    const { meeting_number, department, type } = req.query;
    let query = 'SELECT * FROM meeting_agendas';
    let params = [];
    let conditions = [];

    if (meeting_number) {
      conditions.push('meeting_number = $' + (params.length + 1));
      params.push(meeting_number);
    }

    if (department) {
      conditions.push('submitting_department = $' + (params.length + 1));
      params.push(department);
    }

    if (type) {
      conditions.push('agenda_type = $' + (params.length + 1));
      params.push(type);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY meeting_number DESC, agenda_number';

    const result = await db.query(query, params);

    // Get files for each agenda
    const agendasWithFiles = await Promise.all(
      result.rows.map(async (agenda) => {
        try {
          const filesResult = await db.query(
            'SELECT * FROM agenda_files WHERE agenda_id = $1 ORDER BY created_at',
            [agenda.id]
          );
          return {
            ...agenda,
            files: filesResult.rows
          };
        } catch (err) {
          console.error(`Error fetching files for agenda ${agenda.id}:`, err);
          return {
            ...agenda,
            files: []
          };
        }
      })
    );

    res.json({
      success: true,
      data: agendasWithFiles,
      count: agendasWithFiles.length
    });
  } catch (error) {
    console.error('Error fetching agendas:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get agenda by ID (protected route) - NOW WITH FILES!
app.get('/api/agendas/:id', authenticateToken, logView('agenda'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get agenda
    const agendaResult = await db.query('SELECT * FROM meeting_agendas WHERE id = $1', [id]);

    if (agendaResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agenda not found'
      });
    }

    // Get files for this agenda
    const filesResult = await db.query(
      'SELECT * FROM agenda_files WHERE agenda_id = $1 ORDER BY created_at',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...agendaResult.rows[0],
        files: filesResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching agenda:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agenda',
      message: error.message
    });
  }
});

// Get files for specific agenda (NEW ENDPOINT!)
app.get('/api/agendas/:id/files', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(
      'SELECT * FROM agenda_files WHERE agenda_id = $1 ORDER BY created_at',
      [id]
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching agenda files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch files',
      error: error.message
    });
  }
});

// Create agenda (secretary or manager only)
app.post('/api/agendas', authenticateToken, requireSecretaryOrManager, async (req, res) => {
  try {
    const {
      meeting_number,
      agenda_number,
      agenda_topic,
      agenda_type,
      submitting_department,
      description,
      file_path,
      file_size
    } = req.body;

    // Validate required fields
    if (!meeting_number || !agenda_number || !agenda_topic || !agenda_type || !submitting_department) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const result = await db.query(
      `INSERT INTO meeting_agendas 
       (meeting_number, agenda_number, agenda_topic, agenda_type, submitting_department, description, file_path, file_size, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [meeting_number, agenda_number, agenda_topic, agenda_type, submitting_department, description, file_path, file_size, req.user.username]
    );

    // Audit log
    const { auditLog } = require('./middleware/audit');
    await auditLog(req.user.username, 'create_agenda', 'meeting_agendas', result.rows[0].id, { agenda_number }, req);

    res.status(201).json({
      success: true,
      message: 'Agenda created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating agenda:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create agenda',
      message: error.message
    });
  }
});

// Create agenda with multiple files (secretary or manager only)
app.post('/api/agendas/with-files', authenticateToken, requireSecretaryOrManager, upload.array('files', 5), async (req, res) => {
  try {
    const {
      meeting_number,
      agenda_number,
      agenda_topic,
      agenda_type,
      submitting_department,
      description
    } = req.body;

    // Validate required fields
    if (!meeting_number || !agenda_number || !agenda_topic || !agenda_type || !submitting_department) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Create agenda first
    const agendaResult = await db.query(
      `INSERT INTO meeting_agendas 
       (meeting_number, agenda_number, agenda_topic, agenda_type, submitting_department, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [meeting_number, agenda_number, agenda_topic, agenda_type, submitting_department, description, req.user.username]
    );

    const agendaId = agendaResult.rows[0].id;

    // If files uploaded, save to agenda_files table
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await db.query(
          `INSERT INTO agenda_files (agenda_id, file_name, file_path, file_size, file_type, uploaded_by)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [agendaId, file.originalname, `/uploads/${file.filename}`, file.size, file.mimetype, req.user.username]
        );
      }
    }

    // Audit log
    const { auditLog } = require('./middleware/audit');
    await auditLog(req.user.username, 'create_agenda', 'meeting_agendas', agendaId, { files_count: req.files?.length || 0 }, req);

    res.status(201).json({
      success: true,
      message: 'Agenda created successfully with files',
      data: agendaResult.rows[0],
      files_uploaded: req.files?.length || 0
    });
  } catch (error) {
    console.error('Error creating agenda with files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create agenda with files',
      message: error.message
    });
  }
});

// Update agenda (secretary or manager only)
app.put('/api/agendas/:id', authenticateToken, requireSecretaryOrManager, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      meeting_number,
      agenda_number,
      agenda_topic,
      agenda_type,
      submitting_department,
      description,
      file_path,
      file_size
    } = req.body;

    const result = await db.query(
      `UPDATE meeting_agendas 
       SET meeting_number = $1, agenda_number = $2, agenda_topic = $3, 
           agenda_type = $4, submitting_department = $5, description = $6,
           file_path = $7, file_size = $8, updated_at = CURRENT_TIMESTAMP, updated_by = $10
       WHERE id = $9
       RETURNING *`,
      [meeting_number, agenda_number, agenda_topic, agenda_type, submitting_department, description, file_path, file_size, id, req.user.username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agenda not found'
      });
    }

    // Audit log
    const { auditLog } = require('./middleware/audit');
    await auditLog(req.user.username, 'update_agenda', 'meeting_agendas', id, { agenda_number }, req);

    res.json({
      success: true,
      message: 'Agenda updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating agenda:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update agenda',
      message: error.message
    });
  }
});

// Update agenda with files (secretary or manager only)
app.put('/api/agendas/:id/with-files', authenticateToken, requireSecretaryOrManager, upload.array('files', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      meeting_number,
      agenda_number,
      agenda_topic,
      agenda_type,
      submitting_department,
      description,
      deleteFileIds // Array of file IDs to delete
    } = req.body;

    // Parse deleteFileIds if it's a string
    let filesToDelete = [];
    if (deleteFileIds) {
      filesToDelete = typeof deleteFileIds === 'string' ? JSON.parse(deleteFileIds) : deleteFileIds;
    }

    // Update agenda data
    const result = await db.query(
      `UPDATE meeting_agendas 
       SET meeting_number = $1, agenda_number = $2, agenda_topic = $3, 
           agenda_type = $4, submitting_department = $5, description = $6,
           updated_at = CURRENT_TIMESTAMP, updated_by = $8
       WHERE id = $7
       RETURNING *`,
      [meeting_number, agenda_number, agenda_topic, agenda_type, submitting_department, description, id, req.user.username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agenda not found'
      });
    }

    // Delete old files if requested
    if (filesToDelete && filesToDelete.length > 0) {
      for (const fileId of filesToDelete) {
        // Get file path before deleting
        const fileResult = await db.query(
          'SELECT file_path FROM agenda_files WHERE id = $1 AND agenda_id = $2',
          [fileId, id]
        );

        if (fileResult.rows.length > 0) {
          const filePath = fileResult.rows[0].file_path;
          
          // Delete from database
          await db.query('DELETE FROM agenda_files WHERE id = $1', [fileId]);

          // Delete physical file
          const fullPath = path.join(UPLOADS_PATH, path.basename(filePath));
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      }
    }

    // Add new files if uploaded
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await db.query(
          `INSERT INTO agenda_files (agenda_id, file_name, file_path, file_size, file_type, uploaded_by)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, file.originalname, `/uploads/${file.filename}`, file.size, file.mimetype, req.user.username]
        );
      }
    }

    // Get updated agenda with files
    const filesResult = await db.query(
      'SELECT * FROM agenda_files WHERE agenda_id = $1 ORDER BY created_at',
      [id]
    );

    // Audit log
    const { auditLog } = require('./middleware/audit');
    await auditLog(req.user.username, 'update_agenda', 'meeting_agendas', id, { 
      agenda_number,
      files_deleted: filesToDelete?.length || 0,
      files_added: req.files?.length || 0
    }, req);

    res.json({
      success: true,
      message: 'Agenda updated successfully',
      data: {
        ...result.rows[0],
        files: filesResult.rows
      }
    });
  } catch (error) {
    console.error('Error updating agenda with files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update agenda',
      message: error.message
    });
  }
});

// Delete agenda (secretary or manager only)
app.delete('/api/agendas/:id', authenticateToken, requireSecretaryOrManager, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM meeting_agendas WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agenda not found'
      });
    }

    // Audit log
    const { auditLog } = require('./middleware/audit');
    await auditLog(req.user.username, 'delete_agenda', 'meeting_agendas', id, { agenda_number: result.rows[0].agenda_number }, req);

    res.json({
      success: true,
      message: 'Agenda deleted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting agenda:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete agenda',
      message: error.message
    });
  }
});


// ========================================
// Meeting Management (Separated from Report Upload)
// ========================================

// Create meeting without report (secretary only)
app.post('/api/meetings/create', authenticateToken, requireSecretary, async (req, res) => {
  try {
    const {
      meeting_number,
      meeting_title,
      meeting_date,
      meeting_time,
      location,
      department
    } = req.body;

    // Validate required fields
    if (!meeting_number || !meeting_title || !meeting_date) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน'
      });
    }

    // Check if meeting_number already exists
    const existing = await db.query(
      'SELECT id FROM meeting_reports WHERE meeting_number = $1',
      [meeting_number]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'เลขที่การประชุมนี้มีอยู่แล้ว'
      });
    }

    // Create meeting without file
    const result = await db.query(
      `INSERT INTO meeting_reports 
       (meeting_number, meeting_title, meeting_date, meeting_time, location, department, file_path, file_size)
       VALUES ($1, $2, $3, $4, $5, $6, '', 0)
       RETURNING *`,
      [meeting_number, meeting_title, meeting_date, meeting_time, location, department]
    );

    res.status(201).json({
      success: true,
      message: 'สร้างการประชุมสำเร็จ',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({
      success: false,
      message: 'สร้างการประชุมไม่สำเร็จ',
      error: error.message
    });
  }
});

// Upload report to existing meeting (secretary only) - Single file
app.put('/api/meetings/:id/report', authenticateToken, requireSecretary, upload.single('pdfFile'), async (req, res) => {
  try {
    const meetingId = req.params.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'ไม่พบไฟล์ที่อัพโหลด'
      });
    }

    // Update meeting with report file
    const result = await db.query(
      `UPDATE meeting_reports 
       SET file_path = $1, file_size = $2, updated_at = CURRENT_TIMESTAMP, updated_by = $3
       WHERE id = $4 
       RETURNING *`,
      [`/uploads/${req.file.filename}`, req.file.size, req.user.username, meetingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบการประชุมที่ระบุ'
      });
    }

    // Audit log
    const { auditLog } = require('./middleware/audit');
    await auditLog(req.user.username, 'upload_report', 'meeting_reports', meetingId, { file_name: req.file.originalname }, req);

    res.json({
      success: true,
      message: 'อัพโหลดรายงานสำเร็จ',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error uploading report:', error);
    res.status(500).json({
      success: false,
      message: 'อัพโหลดรายงานไม่สำเร็จ',
      error: error.message
    });
  }
});

// Upload multiple reports to existing meeting (secretary only) - Multiple files
app.put('/api/meetings/:id/reports-multiple', authenticateToken, requireSecretary, upload.array('files', 10), async (req, res) => {
  try {
    const meetingId = req.params.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ไม่พบไฟล์ที่อัพโหลด'
      });
    }

    // Check if meeting exists
    const meetingCheck = await db.query('SELECT id FROM meeting_reports WHERE id = $1', [meetingId]);
    if (meetingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบการประชุมที่ระบุ'
      });
    }

    // Save all files to meeting_files table
    for (const file of req.files) {
      await db.query(
        `INSERT INTO meeting_files (meeting_id, file_name, file_path, file_size, file_type, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [meetingId, file.originalname, `/uploads/${file.filename}`, file.size, file.mimetype, req.user.username]
      );
    }

    // Audit log
    const { auditLog } = require('./middleware/audit');
    await auditLog(req.user.username, 'upload_multiple_reports', 'meeting_reports', meetingId, { files_count: req.files.length }, req);

    res.json({
      success: true,
      message: `อัพโหลด ${req.files.length} ไฟล์สำเร็จ`,
      files_uploaded: req.files.length
    });
  } catch (error) {
    console.error('Error uploading multiple reports:', error);
    res.status(500).json({
      success: false,
      message: 'อัพโหลดรายงานไม่สำเร็จ',
      error: error.message
    });
  }
});

// Get meetings with agenda count (protected route)
app.get('/api/meetings/with-stats', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        m.*,
        (SELECT COUNT(*) FROM meeting_agendas WHERE meeting_number = m.meeting_number) as agenda_count,
        (CASE WHEN m.file_size > 0 THEN true ELSE false END) as has_report
      FROM meeting_reports m
      ORDER BY m.meeting_date DESC
    `;

    const result = await db.query(query);

    // Format the data
    const meetings = result.rows.map(meeting => ({
      ...meeting,
      meeting_date_thai: formatThaiDate(meeting.meeting_date),
      file_size_formatted: formatFileSize(meeting.file_size)
    }));

    res.json({
      success: true,
      data: meetings,
      count: meetings.length
    });
  } catch (error) {
    console.error('Error fetching meetings with stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});


// ========================================
// Report Status Endpoints
// ========================================

// Get meetings with reports (protected route)
app.get('/api/meetings/with-reports', authenticateToken, logView('meeting_report'), async (req, res) => {
  try {
    const query = `
      SELECT 
        m.*,
        (SELECT COUNT(*) FROM meeting_agendas WHERE meeting_number = m.meeting_number) as agenda_count
      FROM meeting_reports m 
      WHERE m.file_size > 0 
      ORDER BY m.meeting_date DESC
    `;

    const result = await db.query(query);

    // Format the data
    const meetings = result.rows.map(meeting => ({
      ...meeting,
      meeting_date_thai: formatThaiDate(meeting.meeting_date),
      file_size_formatted: formatFileSize(meeting.file_size)
    }));

    res.json({
      success: true,
      data: meetings,
      count: meetings.length
    });
  } catch (error) {
    console.error('Error fetching meetings with reports:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get meetings without reports (protected route)
app.get('/api/meetings/without-reports', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        m.*,
        (SELECT COUNT(*) FROM meeting_agendas WHERE meeting_number = m.meeting_number) as agenda_count
      FROM meeting_reports m 
      WHERE m.file_size = 0 OR m.file_size IS NULL
      ORDER BY m.meeting_date DESC
    `;

    const result = await db.query(query);

    // Format the data
    const meetings = result.rows.map(meeting => ({
      ...meeting,
      meeting_date_thai: formatThaiDate(meeting.meeting_date)
    }));

    res.json({
      success: true,
      data: meetings,
      count: meetings.length
    });
  } catch (error) {
    console.error('Error fetching meetings without reports:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = app;