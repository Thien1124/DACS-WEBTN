import apiClient from './api';

/**
 * Get an exam by ID
 * @param {string} examId - Exam ID
 * @returns {Promise} - Promise resolving to exam data with questions
 */
export const getExamById = async (examId) => {
  try {
    const response = await apiClient.get(`/exams/${examId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy thông tin đề thi.' };
  }
};

/**
 * Submit exam answers
 * @param {string} examId - Exam ID
 * @param {array} answers - Array of answer choices
 * @returns {Promise} - Promise resolving to exam result
 */
export const submitExamAnswers = async (examId, answers) => {
  try {
    const response = await apiClient.post(`/exams/${examId}/submit`, { answers });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể nộp bài thi.' };
  }
};

/**
 * Get exam result by ID
 * @param {string} resultId - Result ID
 * @returns {Promise} - Promise resolving to exam result data
 */
export const getExamResult = async (resultId) => {
  try {
    const response = await apiClient.get(`/exam-results/${resultId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy kết quả bài thi.' };
  }
};

/**
 * Get user's exam history
 * @param {object} filters - Optional filters (subject, date range, etc.)
 * @returns {Promise} - Promise resolving to array of exam results
 */
export const getUserExamHistory = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to query parameters
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const response = await apiClient.get(`/user/exam-history?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy lịch sử bài thi.' };
  }
};

/**
 * Get user's exam statistics
 * @returns {Promise} - Promise resolving to user's exam statistics
 */
export const getUserExamStatistics = async () => {
  try {
    const response = await apiClient.get('/user/exam-statistics');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy thống kê bài thi.' };
  }
};
