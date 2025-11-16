import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper function to format Thai date
const formatThaiDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const thaiYear = d.getFullYear() + 543;
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${thaiYear}`;
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'ok', 
      message: 'Server is running',
      database: 'connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Server is running but database connection failed',
      database: 'disconnected'
    });
  }
});

// Get meetings with search
app.get('/api/meetings', async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = `
      SELECT 
        id,
        meeting_number,
        meeting_title,
        meeting_date,
        location,
        file_name,
        file_size,
        created_at
      FROM meetings
    `;
    
    const params = [];
    
    if (search) {
      query += ` WHERE 
        meeting_title ILIKE $1 OR 
        meeting_number ILIKE $1 OR 
        location ILIKE $1
      `;
      params.push(`%${search}%`);
    }
    
    query += ' ORDER BY meeting_date DESC, created_at DESC';
    
    const result = await pool.query(query, params);
    
    // Format data for frontend
    const formattedData = result.rows.map(row => ({
      id: row.id,
      meeting_number: row.meeting_number,
      meeting_title: row.meeting_title,
      meeting_date: row.meeting_date,
      meeting_date_thai: formatThaiDate(row.meeting_date),
      location: row.location,
      file_name: row.file_name,
      file_size: row.file_size,
      file_size_formatted: formatFileSize(row.file_size),
      created_at: row.created_at
    }));
    
    res.json({
      success: true,
      count: formattedData.length,
      data: formattedData
    });
    
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch meetings',
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
