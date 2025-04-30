import apiClient from './apiClient';

/**
 * Get test analytics by ID
 * @param {string|number} testId - The test ID
 * @returns {Promise} - Promise with test statistics
 */
export const getTestAnalytics = async (testId) => {
  try {
    const response = await apiClient.get(`/api/analytics/test/${testId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching test analytics:', error);
    throw error;
  }
};

/**
 * Get student analytics by ID
 * @param {string|number} studentId - The student ID
 * @returns {Promise} - Promise with student analytics
 */
export const getStudentAnalytics = async (studentId) => {
  try {
    const response = await apiClient.get(`/api/analytics/student/${studentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching student analytics:', error);
    throw error;
  }
};

/**
 * Get student rankings by subject
 * @param {Object} params - Optional parameters for filtering
 * @returns {Promise} - Promise with student rankings
 */
export const getStudentRankings = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/api/analytics/rank?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching student rankings:', error);
    throw error;
  }
};

/**
 * Get chart data for exams
 * @param {Object} params - Optional parameters for filtering
 * @returns {Promise} - Promise with chart data
 */
export const getChartData = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiClient.get(`/api/analytics/chart-data?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chart data:', error);
    throw error;
  }
};