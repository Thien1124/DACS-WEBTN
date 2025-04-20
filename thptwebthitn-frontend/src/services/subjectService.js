import apiClient from './apiClient';
import axios from 'axios';

// Cập nhật thời gian và người dùng hiện tại
const currentTime = "2025-04-08 10:41:07";
const currentUser = "vinhsonvlog";

/**
 * Get list of subjects with pagination and filters
 */
export const getSubjects = async (params = {}) => {
  try {
    const defaultParams = {
      page: 1,
      pageSize: 10,
      ...params
    };
    
    const queryParams = new URLSearchParams(defaultParams).toString();
    console.log(`Fetching subjects with params: ${queryParams}`);
    
    const response = await apiClient.get(`/api/Subject/list?${queryParams}`);
    
    if (response.data) {
      if (Array.isArray(response.data)) {
        return {
          items: response.data,
          totalItems: response.data.length,
          totalPages: 1,
          currentPage: defaultParams.page,
          pageSize: defaultParams.pageSize
        };
      } else if (response.data.items && Array.isArray(response.data.items)) {
        return response.data;
      }
    }
    
    return {
      items: [],
      totalItems: 0,
      totalPages: 0,
      currentPage: defaultParams.page,
      pageSize: defaultParams.pageSize
    };
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
};

/**
 * Get subject by ID
 * @param {string} id - Subject ID
 * @returns {Promise} - Promise resolving to subject data
 */
export const getSubjectById = async (subjectId) => {
  try {
    const response = await apiClient.get(`/api/Subject/${subjectId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy thông tin môn học.' };
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
    console.log(`[${new Date().toISOString()}] Fetching all subjects without paging`);
    
    // Try fetching with 'nopaging' parameter first
    try {
      const response = await apiClient.get('/api/Subject');
      console.log('Subjects response with noPaging:', response.data);
      return response.data;
    } catch (innerError) {
      console.log('Failed with noPaging parameter, trying alternate endpoint');
      
      // Fallback to regular endpoint with a large page size
      const fallbackResponse = await apiClient.get('/api/Subject');
      console.log('Subjects fallback response:', fallbackResponse.data);
      
      // If the response contains items, return those
      if (fallbackResponse.data && Array.isArray(fallbackResponse.data.items)) {
        return fallbackResponse.data.items;
      }
      
      // Otherwise return the whole response
      return fallbackResponse.data;
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching all subjects:`, error);
    throw error;
  }
};

// Tạo môn học mới
export const createSubject = async (subjectData) => {
  try {
    const response = await apiClient.post('/api/Subject', subjectData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tạo môn học mới.' };
  }
};

// Cập nhật thông tin môn học
export const updateSubject = async (subjectId, subjectData) => {
  try {
    const response = await apiClient.put(`/api/Subject/${subjectId}`, subjectData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể cập nhật môn học.' };
  }
};

// Xóa môn học
export const deleteSubject = async (subjectId) => {
  try {
    const response = await apiClient.delete(`/api/Subject/${subjectId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể xóa môn học.' };
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