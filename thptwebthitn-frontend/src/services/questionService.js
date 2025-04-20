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
 * Get questions with pagination and filters
 * @param {Object} params - Query parameters
 * @returns {Promise} - Promise resolving to questions data
 */
export const getQuestions = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/Question', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

/**
 * Get question details by ID
 * @param {string} id - Question ID
 * @returns {Promise} - Promise resolving to question details
 */
export const getQuestionById = async (id) => {
  try {
    const response = await apiClient.get(`/api/Question/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching question ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new question
 * @param {Object} questionData - Question data
 * @returns {Promise} - Promise resolving to created question
 */
export const createQuestion = async (questionData) => {
  try {
    const response = await apiClient.post('/api/Question', questionData);
    return response.data;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};

/**
 * Update question details
 * @param {string} id - Question ID
 * @param {Object} questionData - Updated question data
 * @returns {Promise} - Promise resolving to updated question
 */
export const updateQuestion = async (id, questionData) => {
  try {
    const response = await apiClient.put(`/api/Question/${id}`, questionData);
    return response.data;
  } catch (error) {
    console.error(`Error updating question ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a question
 * @param {string} id - Question ID
 * @returns {Promise} - Promise resolving to deletion status
 */
export const deleteQuestion = async (id) => {
  try {
    const response = await apiClient.delete(`/api/Question/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting question ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an option from a question
 * @param {string} questionId - Question ID
 * @param {string} optionId - Option ID
 * @returns {Promise} - Promise resolving to deletion status
 */
export const deleteQuestionOption = async (questionId, optionId) => {
  try {
    const response = await apiClient.delete(`/api/Question/${questionId}/options/${optionId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting option ${optionId} from question ${questionId}:`, error);
    throw error;
  }
};
