import apiClient from './api';

/**
 * Get all available exams
 * @param {object} filters - Optional filters (subject, difficulty, etc.)
 * @returns {Promise} - Promise resolving to exams array
 */
export const getAllExams = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to query parameters
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await apiClient.get(`/exams?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy danh sách đề thi.' };
  }
};

/**
 * Get an exam by ID
 * @param {string} examId - Exam ID
 * @returns {Promise} - Promise resolving to exam data
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
 * Start an exam session
 * @param {string} examId - Exam ID
 * @returns {Promise} - Promise resolving to exam session data
 */
export const startExam = async (examId) => {
  try {
    const response = await apiClient.post(`/exams/${examId}/start`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể bắt đầu bài thi.' };
  }
};

/**
 * Submit an exam
 * @param {string} examId - Exam ID
 * @param {object} answers - User's answers
 * @param {number} timeSpent - Time spent in seconds
 * @returns {Promise} - Promise resolving to exam results
 */
export const submitExam = async (examId, answers, timeSpent) => {
  try {
    const response = await apiClient.post(`/exams/${examId}/submit`, {
      answers,
      timeSpent
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể nộp bài thi.' };
  }
};

/**
 * Get exam history for current user
 * @param {object} filters - Optional filters (subject, date, etc.)
 * @returns {Promise} - Promise resolving to exam history
 */
export const getExamHistory = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to query parameters
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await apiClient.get(`/exams/history?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy lịch sử làm bài thi.' };
  }
};

/**
 * Get exam result details
 * @param {string} resultId - Result ID
 * @returns {Promise} - Promise resolving to exam result details
 */
export const getExamResult = async (resultId) => {
  try {
    const response = await apiClient.get(`/exams/results/${resultId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy kết quả bài thi.' };
  }
};
