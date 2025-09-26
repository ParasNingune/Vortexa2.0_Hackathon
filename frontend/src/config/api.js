// API Configuration
const API_BASE_URL = 'https://vortexa2-0-hackathon.onrender.com';

// API Endpoints
export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/api/health`,
  predict: `${API_BASE_URL}/api/predict`,
};

// API Helper Functions
export const apiCall = async (endpoint, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(endpoint, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Health Check Function
export const checkAPIHealth = async () => {
  try {
    const health = await apiCall(API_ENDPOINTS.health);
    return health;
  } catch (error) {
    console.error('Health check failed:', error);
    return { success: false, error: error.message };
  }
};

export default API_BASE_URL;
