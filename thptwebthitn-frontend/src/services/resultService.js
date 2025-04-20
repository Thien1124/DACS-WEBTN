import apiClient from './apiClient';
import axios from 'axios';
import { getToken } from '../utils/auth';

// Thiết lập axios interceptor
axios.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
}, error => Promise.reject(error));

/**
 * Submit exam answers and calculate score
 * @param {Object} resultData - Result data with answers
 * @returns {Promise} - Promise resolving to exam result
 */
export const submitExam = async (resultData) => {
  try {
    const response = await apiClient.post('/api/Results', resultData);
    return response.data;
  } catch (error) {
    console.error('Error submitting exam:', error);
    throw error;
  }
};

/**
 * Get user's exam history
 * @param {string} userId - User ID
 * @param {Object} params - Query parameters
 * @returns {Promise} - Promise resolving to exam history
 */
export const getUserResults = async (userId, params = {}) => {
  try {
    const response = await apiClient.get(`/api/Results/user/${userId}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching results for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Get exam result details
 * @param {string} resultId - Result ID
 * @returns {Promise} - Promise resolving to result details
 */
export const getResultById = async (resultId) => {
  try {
    const response = await apiClient.get(`/api/Results/${resultId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching result ${resultId}:`, error);
    throw error;
  }
};

/**
 * Delete an exam result
 * @param {string} id - Result ID
 * @returns {Promise} - Promise resolving to deletion status
 */
export const deleteResult = async (id) => {
  try {
    const response = await apiClient.delete(`/api/Results/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting result ${id}:`, error);
    throw error;
  }
};

/**
 * Update result grade (for teachers)
 * @param {string} resultId - Result ID
 * @param {Object} gradeData - Updated grade data
 * @returns {Promise} - Promise resolving to updated result
 */
export const updateResultGrade = async (resultId, gradeData) => {
  try {
    const response = await apiClient.put(`/api/Results/${resultId}/grade`, gradeData);
    return response.data;
  } catch (error) {
    console.error(`Error updating grade for result ${resultId}:`, error);
    throw error;
  }
};