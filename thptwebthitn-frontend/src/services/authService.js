import apiClient from './apiClient';
import { 
  setToken,
  saveUserData, 
  removeToken, 
  removeUserData, 
  getUserData 
} from '../utils/auth';
import { 
  setRefreshToken,
  getRefreshToken,
  clearTokens,
  getAccessToken // Thêm hàm này vào import
} from '../utils/token';

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
    
    const { token, refreshToken, user } = response.data;
    
    // Lưu token và thông tin user - standardize token storage
    console.log('Setting token and user data', { token, refreshToken });
    
    // Store token in multiple locations for compatibility
    localStorage.setItem('auth_token', token);
    localStorage.setItem('token', token);
    
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    
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
    
    // Phân loại lỗi để có thể hiển thị ở đúng vị trí
    let errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.';
    let field = null;
    
    if (error.response) {
      console.error('Server error response:', error.response.data);
      
      // Phân tích phản hồi chi tiết từ server
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
        
        // Phân loại lỗi dựa trên nội dung
        if (error.response.data.toLowerCase().includes('tài khoản') || 
            error.response.data.toLowerCase().includes('không tồn tại')) {
          field = 'usernameOrEmail';
        } else if (error.response.data.toLowerCase().includes('mật khẩu')) {
          field = 'password';
        }
      } else if (error.response.data) {
        // Xử lý lỗi có cấu trúc
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        
        // Nếu server trả về lỗi cụ thể cho từng trường
        if (error.response.data.errors) {
          errorMessage.errors = error.response.data.errors;
        }
        
        // Kiểm tra xem có thông tin về trường nào bị lỗi không
        if (error.response.data.field) {
          field = error.response.data.field;
        }
      }
    }
    
    // QUAN TRỌNG: Đảm bảo trả về một đối tượng lỗi với message là một chuỗi
    throw { 
      message: errorMessage,
      field: field,
      isAuthenticated: false 
    };
  }
};

/**
 * Log out a user
 * @returns {Promise} - Promise resolving to success status
 */
export const logout = async () => {
  try {
    // Đặt cờ đánh dấu đăng xuất thủ công
    console.log('[AUTH SERVICE] Setting manual logout flag');
    sessionStorage.setItem('manual_logout', 'true');
    
    // Lưu refreshToken để gửi API nếu có
    const refreshToken = getRefreshToken();
    
    // Xóa tất cả dữ liệu trước khi gọi API để tránh race condition
    console.log('[AUTH SERVICE] Clearing all authentication data');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('remember_me');
    
    // Đảm bảo gọi các hàm xóa khác
    clearTokens();
    removeToken();
    removeUserData();
    
    // Sau khi xóa dữ liệu, gọi API để đăng xuất phía server
    if (refreshToken) {
      try {
        console.log('[AUTH SERVICE] Calling logout API with refresh token');
        await apiClient.post('/api/Auth/logout', { refreshToken });
        console.log('[AUTH SERVICE] Logout API called successfully');
      } catch (logoutError) {
        console.error('[AUTH SERVICE] Error during logout API call:', logoutError);
        // Vẫn tiếp tục, vì đã xóa dữ liệu cục bộ
      }
    }
    
    console.log('[AUTH SERVICE] Logout completed successfully');
    return { success: true };
  } catch (error) {
    console.error('[AUTH SERVICE] Logout error:', error);
    
    // Dù có lỗi, vẫn đảm bảo xóa tất cả dữ liệu
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('remember_me');
    
    return { success: false, error: error.message };
  }
};

/**
 * Refresh token
 * @returns {Promise} Promise resolving to new tokens
 */
export const refreshToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('Không có refresh token');
    }
    
    const response = await apiClient.post('/api/Auth/refresh-token', {
      refreshToken
    });
    
    const { token, refreshToken: newRefreshToken } = response.data;
    
    // Lưu token mới
    setToken(token);
    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
    }
    
    return {
      token,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    console.error('Refresh token error:', error);
    
    // Xóa token hiện tại nếu refresh thất bại
    clearTokens();
    
    throw error;
  }
};

/**
 * Validate token và đăng nhập tự động
 * @returns {Promise} - Promise resolving to auth status
 */
export const validateAndAutoLogin = async () => {
  try {
    const token = getAccessToken();
    const userData = getUserData();
    
    if (!token || !userData) {
      console.log('Không có token hoặc dữ liệu người dùng');
      return { isAuthenticated: false };
    }
    
    // Gọi API để kiểm tra token có hợp lệ không
    const response = await apiClient.get('/api/User/me');
    
    // Đảm bảo cập nhật đúng vai trò từ phản hồi API
    if (response && response.data) {
      // Cập nhật dữ liệu người dùng với dữ liệu mới nhất từ server
      saveUserData({
        ...userData,
        ...response.data,
        // Đảm bảo giữ nguyên vai trò từ API trả về
        role: response.data.role || userData.role
      });
      
      return {
        isAuthenticated: true,
        user: {
          ...userData,
          ...response.data,
          role: response.data.role || userData.role
        },
        token
      };
    }
    
    return { isAuthenticated: true, user: userData, token };
  } catch (error) {
    console.error('Auto login error:', error);
    clearTokens();
    removeUserData();
    return { isAuthenticated: false };
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
    console.log('Sending password change request:', passwordData);
    
    // Sử dụng đúng endpoint: /api/Password/change-password
    const response = await apiClient.post('/api/Password/change-password', {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword || passwordData.newPassword
    });
    
    console.log('Password change response:', response);
    
    return response.data;
  } catch (error) {
    console.error('Password change failed:', error);
    
    let errorMessage = 'Thay đổi mật khẩu thất bại.';
    
    // Kiểm tra và lấy thông báo lỗi chi tiết từ response
    if (error.response) {
      console.error('Server response:', error.response.data);
      
      if (error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.title) {
          errorMessage = error.response.data.title;
        } else if (error.response.data.errors) {
          // Handle validation errors
          const firstError = Object.values(error.response.data.errors)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = firstError[0];
          }
        }
      }
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
 * Verify token validity
 * @returns {Promise} - Promise resolving to verification result
 */
export const verifyToken = async () => {
  try {
    const response = await apiClient.get('/api/Auth/verify-token');
    return response.data;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Phiên đăng nhập không hợp lệ');
  }
};


