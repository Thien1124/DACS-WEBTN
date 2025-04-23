import axios from 'axios';
import { showErrorToast } from '../utils/toastUtils';
import { 
  getAccessToken, 
  getRefreshToken, 
  setAccessToken, 
  setRefreshToken,
  isTokenExpired,
  clearTokens 
} from '../utils/token';
import { getToken } from '../utils/auth';

// Thời gian và người dùng hiện tại
const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
const currentUser = "vinhsonvlog";

console.log(`[${currentTime}] API client initialized by ${currentUser}`);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5006';

// Biến để theo dõi trạng thái refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};
 
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5006',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Thêm interceptor để tự động gắn token vào headers
apiClient.interceptors.request.use(
  config => {
    // Nếu URL chứa tham số public=true, không gửi token
    if (config.url.includes('public=true')) {
      return config;
    }
    
    // Lấy token từ localStorage - Ensure consistent token key usage
    const token = localStorage.getItem('auth_token') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('accessToken') ||
                  localStorage.getItem('jwt') ||
                  sessionStorage.getItem('auth_token');
    
    // Log để debug
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      hasToken: !!token
    });
    
    // Gắn token vào header nếu có
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý lỗi phản hồi
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
);

// Thêm hàm tiện ích cho API công khai
apiClient.getPublic = async function(url, config = {}) {
  try {
    // Tạo bản sao của config để không ảnh hưởng đến config gốc
    const publicConfig = {
      ...config,
      headers: {
        ...config.headers,
        // Không gửi Authorization header
      }
    };
    
    // Đảm bảo không có Authorization header
    if (publicConfig.headers && publicConfig.headers.Authorization) {
      delete publicConfig.headers.Authorization;
    }
    
    console.log(`Calling public API: ${url}`);
    return await axios.get(url, publicConfig);
  } catch (error) {
    console.error('Error in public API call:', error);
    throw error;
  }
};

export default apiClient;