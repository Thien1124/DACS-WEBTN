/**
 * Tiện ích xử lý JWT token
 */

// Constants
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Lưu access token
 * @param {string} token - JWT access token
 */
export const setAccessToken = (token) => {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Lưu refresh token
 * @param {string} token - JWT refresh token
 */
export const setRefreshToken = (token) => {
  if (!token) return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

/**
 * Lấy access token
 * @returns {string|null} - JWT access token hoặc null
 */
export const getAccessToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Lấy refresh token
 * @returns {string|null} - JWT refresh token hoặc null
 */
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Xóa các token
 */
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  // Đảm bảo xóa token theo các tên khóa khác có thể tồn tại
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  
  // Xóa cả trong sessionStorage nếu có
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('refresh_token');
  
  console.log('[AUTH] All tokens cleared');
};

/**
 * Kiểm tra token có hết hạn không
 * @param {string} token - JWT token cần kiểm tra
 * @returns {boolean} - true nếu token hết hạn
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Decode JWT payload
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    
    // Kiểm tra thời gian hết hạn
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Lấy thời gian còn lại của token (tính theo giây)
 * @param {string} token - JWT token
 * @returns {number} - Số giây còn lại, 0 nếu đã hết hạn
 */
export const getTokenTimeRemaining = (token) => {
  if (!token) return 0;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime ? Math.floor(payload.exp - currentTime) : 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Lấy thông tin từ token
 * @param {string} token - JWT token
 * @returns {Object|null} - Payload của token hoặc null nếu token không hợp lệ
 */
export const getTokenPayload = (token) => {
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};