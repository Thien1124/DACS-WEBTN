import apiClient from './api';
import { setToken, saveUserData, removeToken, removeUserData } from '../utils/auth';

/**
 * Register a new user
 * @param {object} userData - User registration data
 * @returns {Promise} - Promise resolving to response data
 */
export const register = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Đăng ký thất bại. Vui lòng thử lại.' };
  }
};

/**
 * Log in a user
 * @param {object} credentials - User login credentials
 * @returns {Promise} - Promise resolving to response data
 */
export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    const { token, user } = response.data;
    
    // Store token and user data
    if (token) {
      setToken(token);
      saveUserData(user);
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.' };
  }
};

/**
 * Log out a user
 */
export const logout = () => {
  removeToken();
  removeUserData();
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise} - Promise resolving to response data
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Gửi yêu cầu đặt lại mật khẩu thất bại.' };
  }
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} password - New password
 * @returns {Promise} - Promise resolving to response data
 */
export const resetPassword = async (token, password) => {
  try {
    const response = await apiClient.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Đặt lại mật khẩu thất bại.' };
  }
};

/**
 * Change user password
 * @param {object} passwordData - Object containing current and new password
 * @returns {Promise} - Promise resolving to response data
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await apiClient.post('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Thay đổi mật khẩu thất bại.' };
  }
};

/**
 * Get current user profile
 * @returns {Promise} - Promise resolving to user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy thông tin người dùng.' };
  }
};
