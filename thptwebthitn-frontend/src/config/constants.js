// Kiểm tra môi trường và sử dụng URL phù hợp
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5006'; // Cập nhật port phù hợp với backend của bạn
export const USE_MOCK_DATA = false; // Set false khi backend đã sẵn sàng

// Các endpoints
export const API_ENDPOINTS = {
  EXAMS: '/api/Exam',
  SUBJECTS: '/api/Subject'
};

// Thêm các biến lựa chọn cho debug
export const DEBUG = {
  SHOW_API_LOGS: true,
  SHOW_REDUX_LOGS: true,
  USE_MOCK_DATA_ON_FAIL: true,
  RETRY_API_CALLS: true,
  LOG_COMPONENT_LIFECYCLE: false
};