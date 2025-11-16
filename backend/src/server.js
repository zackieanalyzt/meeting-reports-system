const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const db = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Static file serving for uploads
const UPLOADS_PATH = process.env.UPLOADS_PATH || path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_PATH)) {
  fs.mkdirSync(UPLOADS_PATH, { recursive: true });
}

app.use('/uploads', express.static(UPLOADS_PATH));

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

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
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

// Get all meetings
app.get('/api/meetings', async (req, res) => {
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

// Get meeting by ID
app.get('/api/meetings/:id', async (req, res) => {
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

// Upload file endpoint
app.post('/api/upload', upload.single('pdfFile'), (req, res) => {
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

// Create meeting
app.post('/api/meetings', async (req, res) => {
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
       (meeting_number, meeting_title, meeting_date, meeting_time, location, department, file_path, file_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [meeting_number, meeting_title, meeting_date, meeting_time, location, department, file_path, file_size]
    );

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

// Update meeting
app.put('/api/meetings/:id', async (req, res) => {
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
           file_path = $7, file_size = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [meeting_number, meeting_title, meeting_date, meeting_time, location, department, file_path, file_size, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }

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

// Delete meeting
app.delete('/api/meetings/:id', async (req, res) => {
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
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  console.log(`📁 Uploads path: ${UPLOADS_PATH}`);
});

module.exports = app;
