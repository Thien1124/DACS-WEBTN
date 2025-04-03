import apiClient from './api';
import { setToken, saveUserData, removeToken, removeUserData } from '../utils/auth';

/**
 * Register a new user
 * @param {object} userData - User registration data
 * @returns {Promise} - Promise resolving to response data
 */
export const register = async (userData) => {
  try {
    const response = await apiClient.post('/api/Auth/register', {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber
    });

    // Nếu đăng ký thành công và API trả về token
    if (response.data.token) {
      setToken(response.data.token);
      saveUserData(response.data.user);
    }

    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error.response?.data?.message 
      || error.response?.data
      || 'Đăng ký thất bại. Vui lòng thử lại sau.';
    throw { message: errorMessage };
  }
};


/**
 * Log in a user
 * @param {object} credentials - User login credentials
 * @returns {Promise} - Promise resolving to response data
 */
export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/api/Auth/login', {
      usernameOrEmail: credentials.usernameOrEmail,
      password: credentials.password
    });

    if (response.data.token) {
      setToken(response.data.token);
      saveUserData(response.data.user);
    }

    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error.response?.data?.message 
      || error.response?.data
      || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.';
    throw { message: errorMessage };
  }
};

/**
 * Log out a user
 */
export const logout = () => {
  try {
    removeToken();
    removeUserData();
  } catch (error) {
    console.error('Logout error:', error);
  }
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
