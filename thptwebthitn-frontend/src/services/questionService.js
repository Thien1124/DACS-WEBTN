import apiClient from './apiClient';
import axios from 'axios';
import { getToken } from '../utils/auth';
axios.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
}, error => Promise.reject(error));

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
    
    const response = await apiClient.get(`/api/Question`, { params });
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
export const getQuestionById = async (id) => {
  try {
    const response = await apiClient.get(`/api/Question/${id}`);
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
    const response = await apiClient.post('/api/Question', questionData);
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
export const updateQuestion = async (id, questionData) => {
  try {
    const response = await apiClient.put(`/api/Question/${id}`, questionData);
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
    const response = await apiClient.delete(`/api/Question/${questionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể xóa câu hỏi.' };
  }
};
export const deleteOption = async (questionId, optionId) => {
  try {
    const response = await apiClient.delete(`/api/Question/${questionId}/options/${optionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting option ${optionId} from question ${questionId}:`, error);
    throw error;
  }
};
