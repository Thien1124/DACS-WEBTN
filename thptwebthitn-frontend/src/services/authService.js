import apiClient from './apiClient';
import { setToken, saveUserData, removeToken, removeUserData, getUserData } from '../utils/auth';

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
    
    // Có thể đăng nhập tự động sau khi đăng ký thành công (tùy thuộc vào API)
    // Nếu API trả về token sau đăng ký, lưu token và thông tin người dùng
    if (response.data.token && response.data.user) {
      setToken(response.data.token);
      saveUserData(response.data.user);
    }
    
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
 * Kiểm tra trạng thái xác thực hiện tại của người dùng
 * @returns {Promise} - Promise resolving to user data or error
 */
export const checkAuthStatus = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    
    // Nếu không có token, người dùng chưa đăng nhập
    if (!token) {
      return { isAuthenticated: false };
    }
    
    // Gọi API để kiểm tra token có hợp lệ không
    const response = await apiClient.get('/api/User/me');
    console.log('Auth status check response:', response.data);
    
    // Cập nhật thông tin người dùng trong localStorage nếu cần
    if (response.data) {
      saveUserData(response.data);
    }
    
    return {
      isAuthenticated: true,
      user: response.data
    };
  } catch (error) {
    console.error('Auth status check failed:', error);
    
    // Nếu token không hợp lệ hoặc hết hạn, xóa dữ liệu đăng nhập
    removeToken();
    removeUserData();
    
    return { isAuthenticated: false, error: error.response?.data || error };
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
    console.log('Setting token and user data', { token, user });
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
    
    return {
      isAuthenticated: true,
      user: user,
      token: token
    };
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
    
    throw { message: errorMessage, isAuthenticated: false };
  }
};


/**
 * Log out a user
 * @returns {Promise} - Promise resolving to success status
 */
export const logout = async () => {
  try {
    // Có thể gọi API để logout phía server (tùy vào yêu cầu)
    // const response = await apiClient.post('/api/Auth/logout');
    
    // Xóa token và thông tin người dùng khỏi localStorage
    removeToken();
    removeUserData();
    localStorage.removeItem('remember_me');
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    
    // Vẫn xóa dữ liệu cục bộ ngay cả khi API thất bại
    removeToken();
    removeUserData();
    localStorage.removeItem('remember_me');
    
    return { success: false, error: error.message };
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise} - Promise resolving to response data
 */
export const requestPasswordReset = async (email) => {
  try {
    console.log('Sending password reset request for email:', email);
    const response = await apiClient.post('/api/Password/forgot-password', { email });
    console.log('Password reset request response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Password reset request failed:', error);
    
    let errorMessage = 'Gửi yêu cầu đặt lại mật khẩu thất bại.';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (typeof error.response?.data === 'string') {
      errorMessage = error.response.data;
    }
    
    throw { message: errorMessage };
  }
};

/**
 * Reset password with code
 * @param {object} resetData - Reset data including email, resetCode, newPassword, and confirmPassword
 * @returns {Promise} - Promise resolving to response data
 */
export const resetPasswordWithCode = async (resetData) => {
  try {
    console.log('Sending password reset with code request:', {
      email: resetData.email,
      resetCode: resetData.resetCode,
      // Không log mật khẩu
    });
    
    const response = await apiClient.post('/api/Password/reset-password', {
      email: resetData.email,
      resetCode: resetData.resetCode,
      newPassword: resetData.newPassword,
      confirmPassword: resetData.confirmPassword // Thêm tham số confirmPassword
    });
    
    console.log('Password reset with code response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Password reset with code failed:', error);
    
    let errorMessage = 'Đặt lại mật khẩu thất bại.';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (typeof error.response?.data === 'string') {
      errorMessage = error.response.data;
    } else if (error.response?.data?.errors) {
      const validationErrors = error.response.data.errors;
      const firstError = Object.values(validationErrors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        errorMessage = firstError[0];
      }
    }
    
    throw { message: errorMessage };
  }
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} password - New password
 * @param {string} confirmPassword - Confirm new password
 * @returns {Promise} - Promise resolving to response data
 */
export const resetPassword = async (token, password, confirmPassword) => {
  try {
    const response = await apiClient.post(`/api/Password/reset-password`, { 
      token, 
      newPassword: password,
      confirmPassword: confirmPassword || password // Sử dụng tham số confirmPassword nếu được cung cấp, nếu không thì dùng password
    });
    return response.data;
  } catch (error) {
    console.error('Password reset failed:', error);
    
    let errorMessage = 'Đặt lại mật khẩu thất bại.';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    throw { message: errorMessage };
  }
};

/**
 * Change user password
 * @param {object} passwordData - Object containing current and new password
 * @returns {Promise} - Promise resolving to response data
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await apiClient.post('/api/Password/change-password', {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword || passwordData.newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Password change failed:', error);
    
    let errorMessage = 'Thay đổi mật khẩu thất bại.';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    throw { message: errorMessage };
  }
};

/**
 * Get current user profile
 * @returns {Promise} - Promise resolving to user data
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/api/User/me');
    
    // Cập nhật thông tin người dùng trong localStorage
    if (response.data) {
      saveUserData(response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('Get current user failed:', error);
    
    let errorMessage = 'Không thể lấy thông tin người dùng.';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    throw { message: errorMessage };
  }
};

/**
 * Update user profile
 * @param {object} userData - User data to update
 * @returns {Promise} - Promise resolving to updated user data
 */
export const updateUserProfile = async (userData) => {
  try {
    console.log('Sending update profile request:', userData);
    
    // Create the request body with the exact format the API expects
    const updateData = {
      fullName: userData.fullName?.trim(),
      email: userData.email?.trim(),
      phoneNumber: userData.phoneNumber?.trim()
    };

    // Log the formatted request data
    console.log('Formatted update data:', updateData);

    const response = await apiClient.put('/api/User/update', updateData);
    
    console.log('Update profile response:', response.data);

    if (response.data) {
      // Merge the new data with existing user data
      const currentUserData = getUserData() || {};
      const updatedUserData = {
        ...currentUserData,
        ...response.data
      };
      
      // Save the updated user data
      saveUserData(updatedUserData);
    }
    
    return response.data;
  } catch (error) {
    console.error('Profile update error details:', error);
    console.error('Server response:', error.response?.data);
    
    let errorMessage = 'Không thể cập nhật thông tin cá nhân.';
    
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.errors) {
        const firstError = Object.values(error.response.data.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = firstError[0];
        }
      }
    }
    
    throw { message: errorMessage };
  }
};

/**
 * Update user information
 * @param {object} userInfo - User information to update
 * @returns {Promise} - Promise resolving to updated user data
 */
export const updateUserInfo = async (userInfo) => {
  try {
    const response = await apiClient.put('/api/User/update', {
      email: userInfo.email,
      fullName: userInfo.fullName, 
      phoneNumber: userInfo.phoneNumber
    });
    
    // Update user data in localStorage if the update is successful
    if (response.data) {
      saveUserData(response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('Update user info failed:', error);
    
    let errorMessage = 'Cập nhật thông tin thất bại.';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    throw { message: errorMessage };
  }
};

/**
 * Validate token và đăng nhập tự động
 * @returns {Promise} - Promise resolving to auth status
 */
export const validateAndAutoLogin = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (!token) {
      return { isAuthenticated: false };
    }
    
    // Gắn token vào header của apiClient
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Kiểm tra token có hợp lệ không bằng cách gọi API
    const response = await apiClient.get('/api/User/me');
    
    // Nếu API trả về thành công, đồng nghĩa với token hợp lệ
    return {
      isAuthenticated: true,
      user: response.data || (userData ? JSON.parse(userData) : null),
      token: token
    };
  } catch (error) {
    console.error('Auto-login failed:', error);
    
    // Xóa thông tin đăng nhập không hợp lệ
    removeToken();
    removeUserData();
    
    return { isAuthenticated: false };
  }
};