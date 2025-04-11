import axios from 'axios';

import { showErrorToast } from '../utils/toastUtils';
// Thời gian và người dùng hiện tại
const currentTime = "2025-04-08 11:17:02";
const currentUser = "vinhsonvlog";

console.log(`[${currentTime}] API client initialized by ${currentUser}`);

// Cấu hình baseURL - ĐẢM BẢO URL NÀY TRÙNG VỚI URL API BACKEND CỦA BẠN
const baseURL = 'http://localhost:5006'; // Thay đổi thành URL chính xác của API backend

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Log requests để debug
apiClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('auth_token');
    
    // Log request details
    console.log(`[${new Date().toISOString()}] API Request:`, {
      url: config.url,
      method: config.method,
      hasToken: !!token,
    });
    
    // Thêm token vào header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);


// Log responses để debug
apiClient.interceptors.response.use(
  (response) => {
    // Log response success
    console.log(`[${new Date().toISOString()}] API Response Success:`, {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    
    return response;
  },
  (error) => {
    // Log response error
    console.error(`[${new Date().toISOString()}] API Response Error:`, {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    // Xử lý lỗi cụ thể
    if (error.response?.status === 401) {
      console.log('Session expired, logging out...');
      
      // Xóa token và thông tin người dùng
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Hiển thị thông báo
      showErrorToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      
      // Chuyển hướng sang trang đăng nhập sau 2 giây
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
    
    return Promise.reject(error);
  }
);
export default apiClient;