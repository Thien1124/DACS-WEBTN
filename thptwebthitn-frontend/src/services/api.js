import axios from 'axios';
import { getToken } from '../utils/auth';

// Create an axios instance with base URL and default headers
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error statuses
    if (error.response) {
      // Handle 401 Unauthorized errors (e.g., token expired)
      if (error.response.status === 401) {
        // You might want to redirect to login or refresh token here
        console.error('Unauthorized access. Please log in again.');
      }
      
      // Handle 403 Forbidden errors
      if (error.response.status === 403) {
        console.error('You do not have permission to access this resource.');
      }
      
      // Handle 500 Server errors
      if (error.response.status >= 500) {
        console.error('Server error. Please try again later.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Network error. Please check your connection.');
    } else {
      // Something happened in setting up the request
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
