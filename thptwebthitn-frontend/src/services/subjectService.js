import apiClient from './apiClient';
import axios from 'axios';



// Cập nhật thời gian và người dùng hiện tại
const currentTime = "2025-04-08 10:41:07";
const currentUser = "vinhsonvlog";

/**
 * Get all subjects
 * @param {object} filters - Optional filters (grade, search query, sortBy, etc.)
 * @returns {Promise} - Promise resolving to subjects array
 */
export const getAllSubjects = async (filters = {}) => {
  console.log(`[${currentTime}] getAllSubjects called by ${currentUser}`);
  
  try {
    console.log(`[${currentTime}] Calling API: /api/Subject`);
    
    // Thêm tham số lọc vào URL
    const params = new URLSearchParams();
    if (filters.search) params.append('searchTerm', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('pageSize', filters.limit);
    
    // Thêm tham số _t để tránh cache
    params.append('_t', new Date().getTime());
    
    // Gọi API với các tham số
    const response = await apiClient.get(`/api/Subject?${params.toString()}`);
    
    console.log(`[${currentTime}] API response status:`, response.status);
    
    // Kiểm tra dữ liệu và cố gắng trích xuất mảng đối tượng
    if (!response.data) {
      return [];
    }
    
    // Nếu response là mảng, trả về ngay
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // Nếu response là object có thuộc tính data là mảng
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return {
        data: response.data.data,
        currentPage: response.data.page || 1,
        totalPages: response.data.totalPages || 1,
        totalItems: response.data.totalCount || response.data.data.length
      };
    }
    
    // Trường hợp khác, cố gắng chuyển về mảng rỗng
    console.warn(`[${currentTime}] Unexpected API response format, returning empty array`);
    return [];
  } catch (error) {
    console.error(`[${currentTime}] Error in getAllSubjects:`, error);
    throw error;
  }
};

// Lấy chi tiết môn học theo ID
export const getSubjectById = async (id) => {
  try {
    console.log(`[${currentTime}] ${currentUser} is fetching subject with ID: ${id}`);
    
    // Gọi API endpoint chính xác
    const response = await apiClient.get(`/api/Subject/${id}`);
    
    // Log kết quả
    console.log(`[${currentTime}] Subject details:`, response.data);
    
    return response.data;
  } catch (error) {
    console.error(`[${currentTime}] Error fetching subject:`, error);
    throw error;
  }
};
export const queryMultipleEndpoints = async () => {
  try {
    // Define response before using it
    const response = await axios.get('/api/subjects'); // or whatever your API call is
    return response.data;
  } catch (error) {
    console.error('Error querying multiple endpoints:', error);
    throw error;
  }
};
// Lấy tất cả môn học không phân trang
export const getAllSubjectsNoPaging = async () => {
  try {
    console.log(`[${currentTime}] Fetching all subjects without paging`);
    const response = await apiClient.get('/api/Subject/all');
    return response.data;
  } catch (error) {
    console.error(`[${currentTime}] Error fetching all subjects:`, error);
    throw error;
  }
};

// Tạo môn học mới
export const createSubject = async (subjectData) => {
  try {
    console.log(`[${currentTime}] Creating new subject:`, subjectData);
    const response = await apiClient.post('/api/Subject', subjectData);
    console.log(`[${currentTime}] Subject created successfully:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[${currentTime}] Error creating subject:`, error);
    throw error;
  }
};

// Cập nhật thông tin môn học
export const updateSubject = async (id, subjectData) => {
  try {
    console.log(`[${currentTime}] Updating subject with ID ${id}:`, subjectData);
    const response = await apiClient.put(`/api/Subject/${id}`, subjectData);
    console.log(`[${currentTime}] Subject updated successfully:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[${currentTime}] Error updating subject:`, error);
    throw error;
  }
};

// Xóa môn học
export const deleteSubject = async (id) => {
  try {
    console.log(`[${currentTime}] Deleting subject with ID: ${id}`);
    const response = await apiClient.delete(`/api/Subject/${id}`);
    console.log(`[${currentTime}] Subject deleted successfully`);
    return response.data;
  } catch (error) {
    console.error(`[${currentTime}] Error deleting subject:`, error);
    throw error;
  }
};

// Thay đổi trạng thái môn học
export const toggleSubjectStatus = async (id) => {
  try {
    console.log(`[${currentTime}] Toggling status for subject with ID: ${id}`);
    const response = await apiClient.patch(`/api/Subject/${id}/toggle-status`);
    console.log(`[${currentTime}] Subject status toggled successfully:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[${currentTime}] Error toggling subject status:`, error);
    throw error;
  }
};

/**
 * Get exams for a subject
 * @param {string} subjectId - Subject ID
 * @returns {Promise} - Promise resolving to exams array
 */
export const getSubjectExams = async (subjectId) => {
  try {
    console.log(`[${currentTime}] Fetching exams for subject with ID: ${subjectId}`);
    const response = await apiClient.get(`/subjects/${subjectId}/exams`);
    return response.data;
  } catch (error) {
    console.error(`[${currentTime}] Error fetching subject exams:`, error);
    throw error;
  }
};



// Exam vi du môn toán thôi nha 