import axios from 'axios';
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

/**
 * Upload avatar
 */
export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('No authentication token found');
      return { success: false, message: 'Bạn cần đăng nhập lại để thực hiện chức năng này' };
    }
    
    // Log the form data for debugging
    console.log('Form data file:', file.name, file.type, file.size);
    
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5006';
    
    // Use apiClient instead of direct axios for better token handling
    const response = await axios.post(`${API_URL}/api/User/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Avatar upload response:', response.data);
    
    return {
      success: true,
      avatarUrl: response.data.avatarUrl,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    console.error('Response details:', error.response?.data);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Lỗi khi tải lên ảnh đại diện'
    };
  }
};

/**
 * Upload avatar using base64
 */
export const uploadAvatarBase64 = async (base64Image, fileName, fileType) => {
  try {
    // Chuyển đổi base64 string thành Blob
    const base64Content = base64Image.split(',')[1];
    const byteCharacters = atob(base64Content);
    const byteArrays = [];
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }
    
    const byteArray = new Uint8Array(byteArrays);
    const blob = new Blob([byteArray], { type: fileType });
    const file = new File([blob], fileName, { type: fileType });
    
    // Sử dụng phương thức upload file thông thường
    return await uploadAvatar(file);
  } catch (error) {
    console.error('Error in base64 upload:', error);
    return {
      success: false,
      message: 'Không thể tải lên ảnh đại diện từ dữ liệu base64'
    };
  }
};

/**
 * Get user activity
 */
export const getUserActivity = async () => {
  try {
    const response = await apiClient.get('/api/User/activity');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy nhật ký hoạt động.' };
  }
};
