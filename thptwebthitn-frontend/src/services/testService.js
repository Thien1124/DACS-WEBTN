import axios from 'axios';
import { API_URL } from '../config/constants';
import apiClient from './apiClient';

/**
 * Tạo đề thi theo cấu trúc độ khó
 * @param {Object} examData - Dữ liệu của đề thi cần tạo
 * @returns {Promise} - Promise chứa dữ liệu đề thi đã tạo
 */
export const createStructuredTest = async (examData) => {
  try {
    // Lấy token xác thực từ localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.');
    }
    
    console.log('Token hiện tại:', token);
    console.log('Gửi dữ liệu:', JSON.stringify(examData));
    
    // Thực hiện gọi API với header xác thực
    const response = await apiClient.post('/api/tests/structured', examData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Phản hồi API:', response.data);
    return response.data;
  } catch (error) {
    console.error('Lỗi chi tiết:', error.response?.data || error.message);
    
    if (error.response?.data?.ValidationErrors?.user) {
      // Thử refresh token nếu có lỗi xác thực
      try {
        // Lấy refreshToken (nếu ứng dụng của bạn hỗ trợ)
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Gọi API refresh token
          const refreshResponse = await axios.post(`${API_URL}/api/Auth/refresh-token`, {
            refreshToken: refreshToken
          });
          
          // Lưu token mới
          localStorage.setItem('token', refreshResponse.data.accessToken);
          
          // Thử gọi lại API với token mới
          const retryResponse = await axios.post(`${API_URL}/api/Exam/structured`, examData, {
            headers: {
              'Authorization': `Bearer ${refreshResponse.data.accessToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          return retryResponse.data;
        }
      } catch (refreshError) {
        console.error('Lỗi khi refresh token:', refreshError);
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
    }
    
    // Xử lý các lỗi khác
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.data?.Message) {
      throw new Error(error.response.data.Message);
    } else {
      throw new Error('Không thể tạo đề thi. Vui lòng thử lại sau.');
    }
  }
};

/**
 * Get exams by topic
 * @param {string} topic - Topic name
 * @param {number} page - Page number
 * @param {number} pageSize - Page size
 * @returns {Promise} - Promise with exams data
 */
export const getExamsByTopic = async (topic, page = 1, pageSize = 10) => {
  try {
    const response = await apiClient.get(`/api/tests/topic/${encodeURIComponent(topic)}`, {
      params: {
        page,
        pageSize
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching exams for topic ${topic}:`, error);
    throw error;
  }
};

/**
 * Create a practice exam with custom options
 * @param {Object} practiceOptions - Practice options
 * @param {number} practiceOptions.subjectId - Subject ID
 * @param {number} practiceOptions.questionCount - Number of questions
 * @param {number} practiceOptions.levelId - Difficulty level ID
 * @param {Array<number>} practiceOptions.questionTypes - Question types
 * @param {Array<number>} practiceOptions.chapterIds - Chapter IDs
 * @param {string} practiceOptions.topic - Topic
 * @returns {Promise} - Promise with created practice exam data
 */
export const createPracticeExam = async (practiceOptions) => {
  try {
    const response = await apiClient.post('/api/tests/practice', practiceOptions);
    return response.data;
  } catch (error) {
    console.error('Error creating practice exam:', error);
    throw error;
  }
};

/**
 * Get practice history for a user
 * @param {number} userId - User ID
 * @param {number} page - Page number
 * @param {number} pageSize - Page size
 * @returns {Promise} - Promise with user's practice history data
 */
export const getUserPracticeHistory = async (userId, page = 1, pageSize = 10) => {
  try {
    const response = await apiClient.get(`/api/tests/history/${userId}`, {
      params: {
        page,
        pageSize
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching practice history for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Get information about the current token
 * @returns {Promise} - Promise with token information
 */
export const getTokenInfo = async () => {
  try {
    const response = await apiClient.get('/api/tests/token-info');
    return response.data;
  } catch (error) {
    console.error('Error getting token information:', error);
    throw error;
  }
};

/**
 * Verify and process token manually
 * @param {Object} tokenData - Token data for verification
 * @param {string} tokenData.token - The token to verify
 * @returns {Promise} - Promise with verification result
 */
export const verifyToken = async (tokenData) => {
  try {
    const response = await apiClient.post('/api/tests/verify-token', tokenData);
    return response.data;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
};

/**
 * Create practice exam with fixed userId (temporary API)
 * @param {Object} practiceOptions - Practice options
 * @returns {Promise} - Promise with created practice exam data
 */
export const createFixedPracticeExam = async (practiceOptions) => {
  try {
    const response = await apiClient.post('/api/tests/practice-fixed', practiceOptions);
    return response.data;
  } catch (error) {
    console.error('Error creating fixed practice exam:', error);
    throw error;
  }
};

/**
 * Create simple practice exam (fallback API)
 * @param {Object} practiceOptions - Simple practice options
 * @returns {Promise} - Promise with created practice exam data
 */
export const createSimplePracticeExam = async (practiceOptions) => {
  try {
    const response = await apiClient.post('/api/tests/simple-practice', practiceOptions);
    return response.data;
  } catch (error) {
    console.error('Error creating simple practice exam:', error);
    throw error;
  }
};

/**
 * Ping test controller to verify it's working
 * @returns {Promise} - Promise with ping response
 */
export const pingTestController = async () => {
  try {
    const response = await apiClient.get('/api/tests/ping');
    return response.data;
  } catch (error) {
    console.error('Error pinging test controller:', error);
    throw error;
  }
};

/**
 * Get all exams/tests with pagination
 * @param {number} page - Page number
 * @param {number} pageSize - Page size
 * @param {Object} filters - Additional filters
 * @returns {Promise} - Promise with exams data
 */
export const getAllTests = async (page = 1, pageSize = 10, filters = {}) => {
  try {
    const response = await apiClient.get('/api/tests', {
      params: {
        page,
        pageSize,
        ...filters
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tests:', error);
    throw error;
  }
};

/**
 * Get exams created by the current teacher
 * @param {number} page - Page number
 * @param {number} pageSize - Page size
 * @returns {Promise} - Promise with teacher's exams data
 */
export const getTeacherTests = async (page = 1, pageSize = 10) => {
  try {
    const response = await apiClient.get('/api/tests/teacher', {
      params: {
        page,
        pageSize
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching teacher tests:', error);
    throw error;
  }
};

export default {
  createStructuredTest,
  getExamsByTopic,
  createPracticeExam,
  getUserPracticeHistory,
  getAllTests,
  getTeacherTests,
  // Add new functions to the default export
  getTokenInfo,
  verifyToken,
  createFixedPracticeExam,
  createSimplePracticeExam,
  pingTestController
};