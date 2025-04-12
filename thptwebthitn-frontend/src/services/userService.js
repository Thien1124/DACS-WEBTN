import apiClient from './apiClient';
import { updateUserProfile } from '../services/authService'; // Import từ authService

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
export { updateUserProfile };
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
  