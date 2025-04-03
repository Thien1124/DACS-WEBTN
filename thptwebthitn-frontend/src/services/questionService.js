import apiClient from './api';

/**
 * Get all questions with optional filters
 * @param {object} filters - Optional filters (subject, difficulty, etc.)
 * @returns {Promise} - Promise resolving to questions array
 */
export const getQuestions = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to query parameters
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await apiClient.get(`/questions?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy danh sách câu hỏi.' };
  }
};

/**
 * Get a question by ID
 * @param {string} questionId - Question ID
 * @returns {Promise} - Promise resolving to question data
 */
export const getQuestionById = async (questionId) => {
  try {
    const response = await apiClient.get(`/questions/${questionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy thông tin câu hỏi.' };
  }
};

/**
 * Create a new question
 * @param {object} questionData - Question data
 * @returns {Promise} - Promise resolving to created question
 */
export const createQuestion = async (questionData) => {
  try {
    const response = await apiClient.post('/questions', questionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tạo câu hỏi.' };
  }
};

/**
 * Update an existing question
 * @param {string} questionId - Question ID
 * @param {object} questionData - Updated question data
 * @returns {Promise} - Promise resolving to updated question
 */
export const updateQuestion = async (questionId, questionData) => {
  try {
    const response = await apiClient.put(`/questions/${questionId}`, questionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể cập nhật câu hỏi.' };
  }
};

/**
 * Delete a question
 * @param {string} questionId - Question ID
 * @returns {Promise} - Promise resolving to success message
 */
export const deleteQuestion = async (questionId) => {
  try {
    const response = await apiClient.delete(`/questions/${questionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể xóa câu hỏi.' };
  }
};
