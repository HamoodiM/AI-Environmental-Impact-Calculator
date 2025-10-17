import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data.error || 'Invalid request');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.');
    } else {
      throw new Error('Network error. Please check your connection.');
    }
  }
);

export const calculateImpact = async (formData) => {
  try {
    const response = await api.post('/calculate', formData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getModels = async () => {
  try {
    const response = await api.get('/models');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRegions = async () => {
  try {
    const response = await api.get('/regions');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getStats = async () => {
  try {
    const response = await api.get('/stats');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const calculateBatch = async (entries) => {
  try {
    const response = await api.post('/calculate/batch', { entries });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
