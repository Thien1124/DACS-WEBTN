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

// Thời gian và người dùng hiện tại
const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
const currentUser = "vinhsonvlog";

console.log(`[${currentTime}] API client initialized by ${currentUser}`);

// Cấu hình baseURL - ĐẢM BẢO URL NÀY TRÙNG VỚI URL API BACKEND CỦA BẠN
const baseURL = 'http://localhost:5006'; // Thay đổi thành URL chính xác của API backend

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
    const token = getAccessToken();
    
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
    });
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log response error
    console.error(`[${new Date().toISOString()}] API Response Error:`, {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    // Nếu lỗi 401 (Unauthorized) và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu đang refresh token, thêm request vào hàng đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      // Đánh dấu request này đang được retry
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const refreshToken = getRefreshToken();
        
        if (!refreshToken) {
          throw new Error('Không có refresh token');
        }
        
        console.log(`[${new Date().toISOString()}] Refreshing token...`);
        
        // Gọi API để refresh token
        const response = await axios.post(`${baseURL}/api/Auth/refresh-token`, {
          refreshToken: refreshToken
        });
        
        // Kiểm tra response
        const { token, refreshToken: newRefreshToken } = response.data;
        
        if (!token) {
          throw new Error('Không nhận được token mới');
        }
        
        // Lưu token mới
        setAccessToken(token);
        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
        }
        
        console.log(`[${new Date().toISOString()}] Token refreshed successfully`);
        
        // Cập nhật header cho request gốc
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        
        // Xử lý các request đang chờ
        processQueue(null, token);
        isRefreshing = false;
        
        // Thực hiện lại request gốc
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Xử lý các request đang chờ
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Xóa token và thông tin người dùng
        clearTokens();
        localStorage.removeItem('user_data');
        
        // Hiển thị thông báo
        showErrorToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', () => {
          // Lưu URL hiện tại để redirect sau khi đăng nhập lại
          sessionStorage.setItem('redirectUrl', window.location.pathname);
          
          // Chuyển hướng sang trang đăng nhập sau khi người dùng đã thấy thông báo
          window.location.href = '/';
        });
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;