import apiClient from './api';
import { setToken, saveUserData, removeToken, removeUserData } from '../utils/auth';

/**
 * Register a new user
 * @param {object} userData - User registration data
 * @returns {Promise} - Promise resolving to response data
 */
export const register = async (userData) => {
  try {
    console.log('Sending registration data:', userData);
    const response = await apiClient.post('/api/Auth/register', userData);
    console.log('Registration response:', response);
    return response.data;
  } catch (error) {
    console.error('Registration error details:', error);
    let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại sau.';
    
    if (error.response) {
      console.error('Server error response:', error.response.data);
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        const firstError = Object.values(validationErrors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = firstError[0];
        }
      }
    }
    
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
    console.log('Sending login credentials:', credentials);
    
    // Đảm bảo gửi rememberMe parameter nếu API cần
    const response = await apiClient.post('/api/Auth/login', {
      usernameOrEmail: credentials.usernameOrEmail,
      password: credentials.password,
      rememberMe: credentials.rememberMe || false
    });
    
    console.log('Login response:', response);
    
    // Kiểm tra xem response có token không
    if (!response.data || !response.data.token) {
      throw new Error('Không nhận được token từ server');
    }
    
    const { token, user } = response.data;
    
    // Lưu token và thông tin user
    console.log('Setting token and user data');
    setToken(token);
    if (user) {
      saveUserData(user);
    }
    
    // Lưu trạng thái "ghi nhớ đăng nhập"
    if (credentials.rememberMe) {
      localStorage.setItem('remember_me', 'true');
    } else {
      localStorage.removeItem('remember_me');
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error details:', error);
    let errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.';
    
    if (error.response) {
      console.error('Server error response:', error.response.data);
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    }
    
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
