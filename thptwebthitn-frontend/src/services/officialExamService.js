import apiClient from './apiClient';

/**
 * Create a new official exam
 * @param {Object} examData - Official exam data
 * @returns {Promise} - Promise resolving to created official exam
 */
export const createOfficialExam = async (examData) => {
  try {
    const response = await apiClient.post('/api/official-exams', examData);
    return response.data;
  } catch (error) {
    console.error('Error creating official exam:', error);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Get list of official exams with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.classroomName - Filter by classroom name
 * @param {boolean} params.active - Filter by active state
 * @param {number} params.page - Page number
 * @param {number} params.pageSize - Page size
 * @returns {Promise} - Promise resolving to official exams list
 */
export const getOfficialExams = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/official-exams', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching official exams:', error);
    throw error;
  }
};

/**
 * Get official exam details
 * @param {number} id - Official exam ID
 * @returns {Promise} - Promise resolving to official exam details
 */
export const getOfficialExamById = async (id) => {
  try {
    const response = await apiClient.get(`/api/official-exams/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching official exam ${id}:`, error);
    throw error;
  }
};

/**
 * Update an official exam
 * @param {number} id - Official exam ID
 * @param {Object} examData - Updated exam data
 * @returns {Promise} - Promise resolving to updated official exam
 */
export const updateOfficialExam = async (id, examData) => {
  try {
    const response = await apiClient.patch(`/api/official-exams/${id}`, examData);
    return response.data;
  } catch (error) {
    console.error(`Error updating official exam ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an official exam
 * @param {number} id - Official exam ID
 * @returns {Promise} - Promise resolving to deletion result
 */
export const deleteOfficialExam = async (id) => {
  try {
    const response = await apiClient.delete(`/api/official-exams/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting official exam ${id}:`, error);
    throw error;
  }
};

/**
 * Assign students to an official exam
 * @param {number} id - Official exam ID
 * @param {Object} studentData - Student assignment data
 * @param {Array<number>} studentData.studentIds - Array of student IDs to assign
 * @returns {Promise} - Promise resolving to assignment results
 */
export const assignStudents = async (id, studentData) => {
  try {
    const response = await apiClient.post(`/api/official-exams/${id}/students`, studentData);
    return response.data;
  } catch (error) {
    console.error(`Error assigning students to official exam ${id}:`, error);
    throw error;
  }
};

/**
 * Get students assigned to an official exam
 * @param {number} id - Official exam ID
 * @returns {Promise} - Promise resolving to list of assigned students
 */
export const getOfficialExamStudents = async (id) => {
  try {
    const response = await apiClient.get(`/api/official-exams/${id}/students`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching students for official exam ${id}:`, error);
    throw error;
  }
};

/**
 * Release results for an official exam
 * @param {number} id - Official exam ID
 * @param {Object} releaseData - Release configuration
 * @returns {Promise} - Promise resolving to release result
 */
export const releaseResults = async (id, releaseData) => {
  try {
    const response = await apiClient.post(`/api/official-exams/${id}/release-results`, releaseData);
    return response.data;
  } catch (error) {
    console.error(`Error releasing results for official exam ${id}:`, error);
    throw error;
  }
};

/**
 * Get statistics for an official exam
 * @param {number} id - Official exam ID
 * @returns {Promise} - Promise resolving to exam statistics
 */
export const getOfficialExamStatistics = async (id) => {
  try {
    const response = await apiClient.get(`/api/official-exams/${id}/statistics`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching statistics for official exam ${id}:`, error);
    throw error;
  }
};

export default {
  createOfficialExam,
  getOfficialExams,
  getOfficialExamById,
  updateOfficialExam,
  deleteOfficialExam,
  assignStudents,
  getOfficialExamStudents,
  releaseResults,
  getOfficialExamStatistics
};