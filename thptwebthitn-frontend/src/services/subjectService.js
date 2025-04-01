import apiClient from './api';

/**
 * Get all subjects
 * @param {object} filters - Optional filters (grade, search query, etc.)
 * @returns {Promise} - Promise resolving to subjects array
 */
export const getAllSubjects = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to query parameters
    if (filters.grade) params.append('grade', filters.grade);
    if (filters.search) params.append('search', filters.search);
    
    const response = await apiClient.get(`/subjects?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy danh sách môn học.' };
  }
};

/**
 * Get a subject by ID
 * @param {string} subjectId - Subject ID
 * @returns {Promise} - Promise resolving to subject data
 */
export const getSubjectById = async (subjectId) => {
  try {
    const response = await apiClient.get(`/subjects/${subjectId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy thông tin môn học.' };
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
