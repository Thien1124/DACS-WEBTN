import axios from 'axios';

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
  config => {
    console.log(`[${currentTime}] API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error(`[${currentTime}] API Request Error:`, error);
    return Promise.reject(error);
  }
);

// Log responses để debug
apiClient.interceptors.response.use(
  response => {
    console.log(`[${currentTime}] API Response [${response.status}] from: ${response.config.url}`);
    return response;
  },
  error => {
    if (error.response) {
      console.error(`[${currentTime}] API Error [${error.response.status}] from: ${error.config.url}`);
    } else if (error.request) {
      console.error(`[${currentTime}] API No Response from: ${error.config.url}`);
    } else {
      console.error(`[${currentTime}] API Error:`, error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;