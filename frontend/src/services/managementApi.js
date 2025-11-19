import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.105.202:3001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
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
