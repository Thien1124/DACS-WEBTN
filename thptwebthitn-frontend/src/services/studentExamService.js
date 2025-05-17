import apiClient from '../utils/apiClient';

/**
 * Get assigned exams for the current student
 * @param {string} status - Filter by status (all, active, upcoming, completed, not-taken)
 * @param {number} page - Page number
 * @param {number} pageSize - Items per page
 * @returns {Promise} - Promise resolving to assigned exams data
 */
export const getAssignedExams = async (status = 'all', page = 1, pageSize = 10) => {
  try {
    const response = await apiClient.get('/api/student/exams/assigned', {
      params: { status, page, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching assigned exams:', error);
    throw error;
  }
};

/**
 * Get exam details for taking
 * @param {number} officialExamId - Official exam ID
 * @returns {Promise} - Promise resolving to exam details
 */
export const takeExam = async (officialExamId) => {
  try {
    const response = await apiClient.get(`/api/student/exams/${officialExamId}/take`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exam details for taking: ${officialExamId}`, error);
    throw error;
  }
};

/**
 * Submit exam answers
 * @param {number} officialExamId - Official exam ID
 * @param {object} data - Exam submission data with answers
 * @returns {Promise} - Promise resolving to submission result
 */
export const submitExam = async (officialExamId, data) => {
  try {
    const response = await apiClient.post(`/api/student/exams/${officialExamId}/submit`, data);
    return response.data;
  } catch (error) {
    console.error(`Error submitting exam: ${officialExamId}`, error);
    throw error;
  }
};

/**
 * Get exam result
 * @param {number} officialExamId - Official exam ID
 * @returns {Promise} - Promise resolving to exam result
 */
export const getExamResult = async (officialExamId) => {
  try {
    const response = await apiClient.get(`/api/student/exams/${officialExamId}/result`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exam result: ${officialExamId}`, error);
    throw error;
  }
};

/**
 * Get exam results for the current student
 * @param {number} page - Page number
 * @param {number} pageSize - Items per page
 * @returns {Promise} - Promise resolving to exam results
 */
export const getExamResults = async (page = 1, pageSize = 10) => {
  try {
    const response = await apiClient.get('/api/student/exams/results', {
      params: { page, pageSize }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching exam results:', error);
    throw error;
  }
};