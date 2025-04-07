import apiClient from './apiClient';

/**
 * Get list of users with pagination and filters
 */
export const getUsers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get(`/api/User/list?${queryParams}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy danh sách người dùng.' };
  }
};
/**
 * Change password
 */
export const changePassword = async (passwordData) => {
    try {
      const response = await apiClient.post('/api/Password/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể đổi mật khẩu.' };
    }
  };
/**
 * Update user roles
 */
export const updateUserRoles = async (userId, roles) => {
  try {
    const response = await apiClient.put(`/api/User/roles/${userId}`, { roles });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể cập nhật vai trò người dùng.' };
  }
};

/**
 * Update user status (activate/deactivate)
 */
export const updateUserStatus = async (userId, isActive) => {
  try {
    const response = await apiClient.put(`/api/User/status/${userId}`, { isActive });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể cập nhật trạng thái người dùng.' };
  }
};

/**
 * Delete user
 */
export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/api/User/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể xóa người dùng.' };
  }
};

/**
 * Get system information
 */
export const getSystemInfo = async () => {
  try {
    const response = await apiClient.get('/api/User/system-info');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy thông tin hệ thống.' };
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/api/User/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy thông tin cá nhân.' };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userData) => {
    try {
      const response = await apiClient.put('/api/User', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể cập nhật thông tin người dùng.' };
    }
  };
  
  export const updateProfile = async (profileData) => {
    try {
      console.log('Sending profile update:', profileData);
      
      // Sử dụng endpoint đúng: /api/User/update
      const response = await apiClient.put('/api/User/update', profileData);
      
      console.log('Profile update response:', response);
      
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Log chi tiết lỗi để debug
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
      
      throw error;
    }
  };
  export const uploadAvatar = async (formData) => {
    try {
      const response = await apiClient.post('/api/Users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Tải lên ảnh đại diện thất bại.' };
    }
  };
  export const getUserActivity = async () => {
    try {
      const response = await apiClient.get('/api/Users/activity');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy nhật ký hoạt động.' };
    }
  };
  