import apiClient from './apiClient';

/**
 * Get test analytics - statistics about which questions are most frequently answered incorrectly, average time spent, etc.
 * @param {string} testId - Test ID
 * @returns {Promise} - Promise resolving to test analytics data
 */
export const getTestAnalytics = async (testId) => {
  try {
    const response = await apiClient.get(`/api/analytics/test/${testId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching analytics for test ${testId}:`, error);
    throw error;
  }
};

/**
 * Get student analytics - average scores by subject for a student
 * @param {string} studentId - Student ID
 * @returns {Promise} - Promise resolving to student analytics data
 */
export const getStudentAnalytics = async (studentId) => {
  try {
    const response = await apiClient.get(`/api/analytics/student/${studentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching analytics for student ${studentId}:`, error);
    throw error;
  }
};

/**
 * Get student rankings by subject
 * @param {Object} params - Optional parameters (subject, limit, etc.)
 * @returns {Promise} - Promise resolving to student rankings data
 */
export const getStudentRankings = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/analytics/rank', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching student rankings:', error);
    throw error;
  }
};

/**
 * Get chart data for scores and exam times
 * @param {Object} params - Optional parameters (timeRange, subject, etc.)
 * @returns {Promise} - Promise resolving to chart data
 */
export const getChartData = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/analytics/chart-data', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching chart data:', error);
    throw error;
  }
};