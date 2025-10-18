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
    console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`);
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

// Public API functions (no authentication required)
export const calculateImpact = async (formData) => {
  try {
    // In development mode, always include the dev token for authentication
    const headers = {};
    if (process.env.REACT_APP_NODE_ENV === 'development') {
      headers.Authorization = 'Bearer dev-token';
    }
    
    const response = await api.post('/calculate', formData, { headers });
    
    // Trigger dashboard refresh by updating a timestamp in localStorage
    // This will be detected by the dashboard to refresh statistics
    localStorage.setItem('lastCalculation', Date.now().toString());
    
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

export const getModelInfo = async (modelName) => {
  try {
    const response = await api.get(`/models/${modelName}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRegionInfo = async (regionName) => {
  try {
    const response = await api.get(`/regions/${regionName}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export the configured axios instance for use in AuthContext
export { api };
export default api;