import axios from 'axios';

// Dynamic API URL - works on localhost and LAN (same as api.js)
const getApiUrl = () => {
  // Check environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Use current hostname with port 3001 (works on any network)
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:3001/api`;
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increased to 30 seconds for LAN and large data
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
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

// ========================================
// STATISTICS APIs
// ========================================

export const getStatistics = async () => {
  try {
    const response = await api.get('/management/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};

export const getStorageBreakdown = async () => {
  try {
    const response = await api.get('/management/storage-breakdown');
    return response.data;
  } catch (error) {
    console.error('Error fetching storage breakdown:', error);
    throw error;
  }
};

export const getRecentActivities = async (limit = 10) => {
  try {
    const response = await api.get('/management/recent-activities', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};

// ========================================
// MEETINGS MANAGEMENT APIs
// ========================================

export const getManagementMeetings = async (filters = {}) => {
  try {
    const response = await api.get('/management/meetings', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching management meetings:', error);
    throw error;
  }
};

export const bulkDeleteMeetings = async (ids) => {
  try {
    const response = await api.post('/management/meetings/bulk-delete', { ids });
    return response.data;
  } catch (error) {
    console.error('Error bulk deleting meetings:', error);
    throw error;
  }
};

// ========================================
// AGENDAS MANAGEMENT APIs
// ========================================

export const getManagementAgendas = async (filters = {}) => {
  try {
    const response = await api.get('/management/agendas', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching management agendas:', error);
    throw error;
  }
};

export const bulkDeleteAgendas = async (ids) => {
  try {
    const response = await api.post('/management/agendas/bulk-delete', { ids });
    return response.data;
  } catch (error) {
    console.error('Error bulk deleting agendas:', error);
    throw error;
  }
};

// ========================================
// FILES MANAGEMENT APIs
// ========================================

export const getManagementFiles = async () => {
  try {
    const response = await api.get('/management/files');
    return response.data;
  } catch (error) {
    console.error('Error fetching management files:', error);
    throw error;
  }
};

export const deleteFile = async (type, id) => {
  try {
    const response = await api.delete(`/management/files/${type}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export default api;
