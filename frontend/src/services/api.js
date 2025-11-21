import axios from 'axios';

// Dynamic API URL - works on localhost and LAN
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

// Request interceptor to add token to all requests
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
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getMeetings = async (searchTerm = '') => {
  try {
    const response = await api.get('/meetings', {
      params: searchTerm ? { search: searchTerm } : {}
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching meetings:', error);
    throw error;
  }
};

export const getMeetingById = async (id) => {
  try {
    const response = await api.get(`/meetings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching meeting:', error);
    throw error;
  }
};

export const createMeeting = async (meetingData) => {
  try {
    const response = await api.post('/meetings', meetingData);
    return response.data;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
};

export const createMeetingOnly = async (meetingData) => {
  try {
    const response = await api.post('/meetings/create', meetingData);
    return response.data;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
};

export const uploadMeetingReport = async (meetingId, file) => {
  try {
    const formData = new FormData();
    formData.append('pdfFile', file);

    const response = await api.put(
      `/meetings/${meetingId}/report`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error uploading report:', error);
    throw error;
  }
};

export const updateMeeting = async (id, meetingData) => {
  try {
    const response = await api.put(`/meetings/${id}`, meetingData);
    return response.data;
  } catch (error) {
    console.error('Error updating meeting:', error);
    throw error;
  }
};

export const deleteMeeting = async (id) => {
  try {
    const response = await api.delete(`/meetings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting meeting:', error);
    throw error;
  }
};

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('pdfFile', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 seconds for file upload
    });

    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export const detailedHealthCheck = async () => {
  try {
    const response = await api.get('/health/detailed');
    return response.data;
  } catch (error) {
    console.error('Detailed health check failed:', error);
    throw error;
  }
};

// Agenda APIs
export const getAgendas = async (filters = {}) => {
  try {
    const response = await api.get('/agendas', { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching agendas:', error);
    throw error;
  }
};

export const getAgendaById = async (id) => {
  try {
    const response = await api.get(`/agendas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching agenda:', error);
    throw error;
  }
};

export const createAgenda = async (agendaData) => {
  try {
    const response = await api.post('/agendas', agendaData);
    return response.data;
  } catch (error) {
    console.error('Error creating agenda:', error);
    throw error;
  }
};

export const updateAgenda = async (id, agendaData) => {
  try {
    const response = await api.put(`/agendas/${id}`, agendaData);
    return response.data;
  } catch (error) {
    console.error('Error updating agenda:', error);
    throw error;
  }
};

export const deleteAgenda = async (id) => {
  try {
    const response = await api.delete(`/agendas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting agenda:', error);
    throw error;
  }
};

// Get agenda with files by ID
export const getAgendaWithFiles = async (id) => {
  try {
    const response = await api.get(`/agendas/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching agenda with files:', error);
    throw error;
  }
};

// Update agenda with files
export const updateAgendaWithFiles = async (id, formData) => {
  try {
    const response = await api.put(`/agendas/${id}/with-files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for file upload
    });
    return response.data;
  } catch (error) {
    console.error('Error updating agenda with files:', error);
    throw error;
  }
};

// Report Status APIs
export const getMeetingsWithReports = async () => {
  try {
    const response = await api.get('/meetings/with-reports');
    return response.data;
  } catch (error) {
    console.error('Error fetching meetings with reports:', error);
    throw error;
  }
};

export const getMeetingsWithoutReports = async () => {
  try {
    const response = await api.get('/meetings/without-reports');
    return response.data;
  } catch (error) {
    console.error('Error fetching meetings without reports:', error);
    throw error;
  }
};
