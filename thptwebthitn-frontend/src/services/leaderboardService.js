import apiClient from './apiClient';

/**
 * Get top scorers for an exam
 * @param {string} examId - Exam ID
 * @returns {Promise} - Promise resolving to leaderboard data
 */
export const getExamLeaderboard = async (examId) => {
  try {
    const response = await apiClient.get(`/api/Leaderboard/${examId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching leaderboard for exam ${examId}:`, error);
    throw error;
  }
};