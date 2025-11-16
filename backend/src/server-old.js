const express = require('express');
const cors = require('cors');
const db = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to format Thai date
function formatThaiDate(dateString) {
  // Handle both string and Date object
  let date;
  if (dateString instanceof Date) {
    date = dateString;
  } else if (typeof dateString === 'string') {
    date = new Date(dateString);
  } else {
    return 'วันที่ไม่ถูกต้อง';
  }

  // Check if date is valid
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
      thai_date: formatThaiDate(meeting.meeting_date),
      formatted_file_size: formatFileSize(meeting.file_size)
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
      message: 'Internal server error'
    });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ 
      success: true, 
      message: 'API is running and database is connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
});

module.exports = app;