import apiClient from './apiClient';

/**
 * Get all subjects
 * @param {object} filters - Optional filters (grade, search query, sortBy, etc.)
 * @returns {Promise} - Promise resolving to subjects array
 */
export const getAllSubjects = async ({ page = 1, limit = 12, ...filters }) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    }).toString();

    const response = await apiClient.get(`/api/Subject?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    throw error;
  }
};
// Lấy tất cả môn học không phân trang
export const getAllSubjectsNoPaging = async () => {
  try {
    const response = await apiClient.get('/api/Subject/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all subjects:', error);
    throw error;
  }
};

// Lấy chi tiết môn học theo ID
export const getSubjectById = async (id) => {
  try {
    const response = await apiClient.get(`/api/Subject/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subject details:', error);
    throw error;
  }
};
// Tạo môn học mới
export const createSubject = async (subjectData) => {
  try {
    const response = await apiClient.post('/api/Subject', subjectData);
    return response.data;
  } catch (error) {
    console.error('Error creating subject:', error);
    throw error;
  }
};
// Cập nhật thông tin môn học
export const updateSubject = async (id, subjectData) => {
  try {
    const response = await apiClient.put(`/api/Subject/${id}`, subjectData);
    return response.data;
  } catch (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
};
// Xóa môn học
export const deleteSubject = async (id) => {
  try {
    const response = await apiClient.delete(`/api/Subject/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
};
// Thay đổi trạng thái môn học
export const toggleSubjectStatus = async (id) => {
  try {
    const response = await apiClient.patch(`/api/Subject/${id}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error('Error toggling subject status:', error);
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
    const response = await apiClient.get(`/subjects/${subjectId}/exams`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy danh sách đề thi.' };
  }
};

/**
 * Get featured subjects
 * @param {number} limit - Number of subjects to return
 * @returns {Promise} - Promise resolving to subjects array
 */
export const getFeaturedSubjects = async (limit = 4) => {
  try {
    const response = await apiClient.get(`/subjects/featured?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy danh sách môn học nổi bật.' };
  }
};
