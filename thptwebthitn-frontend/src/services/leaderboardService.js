import apiClient from './apiClient';

/**
 * Get top scorers for an exam
 * @param {string} examId - Exam ID
 * @returns {Promise} - Promise resolving to leaderboard data
 */
export const getExamLeaderboard = async (examId) => {
  try {
    const response = await apiClient.get(`/api/Leaderboard/${examId}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};

/**
 * Get exams by subject ID
 * @param {number} subjectId - Subject ID
 * @returns {Promise} - Promise resolving to exams data
 */
export const getExamsBySubject = async (subjectId) => {
  try {
    const response = await apiClient.get(`/api/Exam/BySubject/${subjectId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exams for subject ${subjectId}:`, error);
    throw error;
  }
};