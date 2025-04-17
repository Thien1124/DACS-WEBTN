import apiClient from './apiClient';
import { updateUserProfile } from '../services/authService'; // Import từ authService

/**
 * Get list of users with pagination and filters
 */
export const getUsers = async (params = {}) => {
  try {
    // Đảm bảo page và pageSize có giá trị mặc định nếu không được truyền vào
    const defaultParams = {
      page: 1,
      pageSize: 10,
      ...params
    };
    
    const queryParams = new URLSearchParams(defaultParams);
    console.log(`Fetching users with params: ${queryParams}`);
    
    // Gọi đúng API endpoint được xác nhận
    const response = await apiClient.get(`/api/User/list?${queryParams}`);
    
    console.log('API Response:', response);
    console.log('Response data:', response.data);
    
    // Kiểm tra nếu response.data tồn tại
    if (response.data) {
      // Nếu data là một mảng trực tiếp
      if (Array.isArray(response.data)) {
        return {
          items: response.data,
          totalItems: response.data.length,
          totalPages: 1,
          currentPage: defaultParams.page,
          pageSize: defaultParams.pageSize
        };
      }
      // Nếu data là object có property items
      else if (response.data.items && Array.isArray(response.data.items)) {
        return response.data;
      }
      // Trường hợp khác - trả về bất cứ dạng dữ liệu nào
      else {
        return {
          items: response.data, // Dữ liệu có thể không phải mảng, nhưng cứ trả về
          totalItems: 1,
          totalPages: 1,
          currentPage: defaultParams.page,
          pageSize: defaultParams.pageSize
        };
      }
    }
    
    // Nếu không có data, trả về object rỗng nhưng có cấu trúc
    return {
      items: [],
      totalItems: 0,
      totalPages: 0,
      currentPage: defaultParams.page,
      pageSize: defaultParams.pageSize
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    // Rethrow để component xử lý
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
  