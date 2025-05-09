import apiClient from './apiClient';
import { updateUserProfile } from '../services/authService'; // Import từ authService

/**
 * Get list of users with pagination and filters
 */
export const getUsers = async (params = {}) => {
  try {
    console.log('Fetching users with params:', params);
    
    // Xử lý params đặc biệt cho lọc role nếu cần
    let queryParams = { ...params };
 
    // Pass query parameters to the API request
    const response = await apiClient.get('/api/User/list', { params: queryParams });
    
    // Kiểm tra và xử lý cấu trúc response linh hoạt hơn
    let users = [];
    
    if (response && response.data) {
      if (Array.isArray(response.data)) {
        users = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // Nếu API trả về dạng { data: [...] }
        users = response.data.data;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        // Nếu API trả về dạng { items: [...] }
        users = response.data.items;
      } else if (response.data.users && Array.isArray(response.data.users)) {
        // Nếu API trả về dạng { users: [...] }
        users = response.data.users;
      }
    }
    
    console.log(`Retrieved ${users.length} users from API`);
    return users || [];
  } catch (error) {
    console.error('Error in getUsers service:', error);
    
    // Return empty array for 403 errors
    if (error.response && error.response.status === 403) {
      console.warn('Permission denied to access user list');
      return [];
    }
    
    throw error;
  }
};

/**
 * Update user roles
 */

export const updateUserRoles = async (userId, role) => {
  try {
    // Sửa lại tham số để phù hợp với API backend
    // API yêu cầu { role: 'RoleName' } thay vì { roles: [...] }
    console.log(`Updating user ${userId} with role: ${role}`);
    
    const response = await apiClient.put(`/api/User/roles/${userId}`, { role });
    
    console.log('Update role response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error.response?.data || { message: 'Không thể cập nhật vai trò người dùng.' };
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
      const response = await apiClient.post('/api/User/avatar', formData, {
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
      const response = await apiClient.get('/api/User/activity');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Không thể lấy nhật ký hoạt động.' };
    }
  };
