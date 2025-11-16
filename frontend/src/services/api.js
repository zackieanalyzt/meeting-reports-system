import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

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

    const response = await axios.post(`${API_URL}/upload`, formData, {
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
