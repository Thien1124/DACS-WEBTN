import axios from 'axios';
import { getToken } from '../utils/auth';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Log request details for debugging
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers,
    });

    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    // Log error details
    console.error('Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized - Please login again');
          // Handle unauthorized access
          break;
        case 403:
          console.error('Forbidden - Access denied');
          break;
        case 404:
          console.error('Not found - The requested resource does not exist');
          break;
        case 500:
          console.error('Server error - Please try again later');
          break;
        default:
          console.error('An error occurred:', error.response.data);
      }
    } else if (error.request) {
      console.error('Network error - No response received');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;