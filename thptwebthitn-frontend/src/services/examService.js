import apiClient from './apiClient';
import { getAllTests, getTeacherTests } from './testService';

import { 
  mockGetExams, 
  mockGetExamById, 
  mockCreateExam, 
  mockUpdateExam,
  mockDeleteExam,
  mockApproveExam
} from '../data/mockExamService';

import axios from 'axios';
import { getToken } from '../utils/auth';

// Cấu hình: true = sử dụng mock data, false = sử dụng API thực
const USE_MOCK_DATA = false; // Sửa từ true thành false để sử dụng API thực

axios.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
}, error => Promise.reject(error));

/**
 * Get all exams with optional filters
 */
export const getAllExams = async (filters = {}) => {
  try {
    console.log("Requesting exams with filters:", filters);
    
    // Add timeout to prevent hanging requests
    const response = await apiClient.get('/api/Exam', { 
      params: filters,
      timeout: 10000 // 10 seconds timeout
    });
    
    console.log("Exams API response:", response.data);
    
    if (response.data && response.data.items) {
      return response.data;
    } else if (Array.isArray(response.data)) {
      return { 
        items: response.data, 
        totalItems: response.data.length, 
        totalPages: 1 
      };
    }
    
    // Handle empty response
    if (!response.data) {
      console.warn("API returned empty data");
      return { items: [], totalItems: 0, totalPages: 0 };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching exams:', error);
    
    // Enhanced error details for debugging
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    
    throw { 
      message: error.response?.data?.message || 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.',
      status: error.response?.status,
      originalError: error
    };
  }
};

// Thêm/sửa hàm getExams trong examService.js

export const getExams = async (page = 1, pageSize = 10, filters = {}) => {
  try {
    return await getAllTests(page, pageSize, filters);
  } catch (error) {
    // If the new endpoint fails, try the old one
    try {
      const response = await apiClient.get('/api/Exams', {
        params: {
          page,
          pageSize,
          ...filters
        }
      });
      return response.data;
    } catch (fallbackError) {
      console.error('Error fetching exams with fallback:', fallbackError);
      throw fallbackError;
    }
  }
};

/**
 * Create a new exam
 * @param {Object} examData - Exam data
 * @returns {Promise} - Promise resolving to created exam
 */
export const createExam = async (examData) => {
  try {
    if (USE_MOCK_DATA) {
      return await mockCreateExam(examData);
    }
    
    const response = await apiClient.post('/api/Exam', examData);
    return response.data;
  } catch (error) {
    console.error('Error creating exam:', error);
    
    if (USE_MOCK_DATA) {
      return await mockCreateExam(examData);
    }
    
    throw error;
  }
};

/**
 * Get exams by subject ID
 * @param {string} subjectId - Subject ID
 * @param {number} page - Page number (default: 1)
 * @param {number} pageSize - Items per page (default: 10)
 * @returns {Promise} - Promise resolving to exams data
 */
export const getExamsBySubject = async (params) => {
  try {
    const { 
      subjectId, 
      examTypeId = null,
      page = 1, 
      pageSize = 10, 
      activeOnly = true,
      isOpen = true,
      searchTerm = null
    } = params;

    // Build query string with all available parameters
    let queryParams = new URLSearchParams();
    if (examTypeId !== null) queryParams.append('examTypeId', examTypeId);
    queryParams.append('page', page);
    queryParams.append('pageSize', pageSize);
    queryParams.append('activeOnly', activeOnly);
    if (isOpen !== null) queryParams.append('isOpen', isOpen);
    if (searchTerm) queryParams.append('searchTerm', searchTerm);

    const url = `/api/Exam/BySubject/${subjectId}?${queryParams.toString()}`;
    console.log('Calling API:', url);
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching exams by subject:', error);
    
    if (error.response?.status === 404) {
      throw new Error('Không tìm thấy môn học với mã số này');
    }
    
    const errorMessage = 
      error.response?.data?.detail || 
      error.response?.data?.title ||
      error.response?.data ||
      error.message || 
      'Không thể tải danh sách đề thi';
      
    throw new Error(errorMessage);
  }
};

export const getExamWithQuestions = async (examId) => {
  try {
    console.log(`Fetching exam ${examId} with questions`);
    const response = await apiClient.get(`/api/Exam/WithQuestions/${examId}`);
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch exam with questions: ${error}`);
    throw error;
  }
};


export const getExamDetails = async (examId) => {
  try {
    console.log(`Fetching exam ${examId} details from API`);
    // Try both endpoints because you might have different API paths
    let response;
    
    try {
      response = await apiClient.get(`/api/Exam/${examId}`);
    } catch (e) {
      console.log('First endpoint failed, trying alternative');
      response = await apiClient.get(`/api/Exams/${examId}`);
    }
    
    console.log('API response for exam details:', response);
    return response.data;
  } catch (error) {
    console.error(`Failed to get exam ${examId} details:`, error);
    throw error;
  }
};
/**
 * Get exams for students by subject ID
 * @param {string} subjectId - Subject ID
 * @param {Object} params - Query parameters
 * @returns {Promise} - Promise resolving to exams data
 */
export const getExamsForStudents = async (subjectId, params = {}) => {
  try {
    const response = await apiClient.get(`/api/Exam/ForStudents/${subjectId}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching student exams for subject ${subjectId}:`, error);
    throw error;
  }
};

/**
 * Get exam details by ID
 * @param {string} id - Exam ID
 * @returns {Promise} - Promise resolving to exam details
 */
export const getExamById = async (id) => {
  try {
    if (USE_MOCK_DATA) {
      return await mockGetExamById(id);
    }
    
    const response = await apiClient.get(`/api/Exam/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exam ${id}:`, error);
    
    if (USE_MOCK_DATA) {
      return await mockGetExamById(id);
    }
    
    throw error;
  }
};

/**
 * Update exam details
 * @param {string} id - Exam ID
 * @param {Object} examData - Updated exam data
 * @returns {Promise} - Promise resolving to updated exam
 */
export const updateExam = async (id, examData) => {
  try {
    if (USE_MOCK_DATA) {
      return await mockUpdateExam(id, examData);
    }
    
    const response = await apiClient.put(`/api/Exam/${id}`, examData);
    return response.data;
  } catch (error) {
    console.error(`Error updating exam ${id}:`, error);
    
    if (USE_MOCK_DATA) {
      return await mockUpdateExam(id, examData);
    }
    
    throw error;
  }
};

/**
 * Delete an exam
 * @param {string} id - Exam ID
 * @returns {Promise} - Promise resolving to deletion status
 */
export const deleteExam = async (id) => {
  try {
    if (USE_MOCK_DATA) {
      return await mockDeleteExam(id);
    }
    
    const response = await apiClient.delete(`/api/Exam/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting exam ${id}:`, error);
    
    if (USE_MOCK_DATA) {
      return await mockDeleteExam(id);
    }
    
    throw error;
  }
};

/**
 * Get exam with full questions
 * @param {string} id - Exam ID
 * @returns {Promise} - Promise resolving to exam with questions
 */


/**
 * Clone an existing exam
 * @param {string} id - Exam ID to clone
 * @returns {Promise} - Promise resolving to cloned exam
 */
export const cloneExam = async (id) => {
  try {
    const response = await apiClient.post(`/api/Exam/clone/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error cloning exam ${id}:`, error);
    throw error;
  }
};

/**
 * Update exam status (draft or public)
 * @param {string} id - Exam ID
 * @param {string} status - New status
 * @returns {Promise} - Promise resolving to updated exam
 */
export const updateExamStatus = async (id, isPublic) => {
  try {
    // Xác định status chính xác
    const status = isPublic ? 'published' : 'draft';
    console.log(`Updating exam ${id} status to: ${status}`);
    
    // Gọi API với tham số đúng
    const response = await apiClient.patch(`/api/Exam/${id}/status`, { 
      status: status 
    });
    
    console.log('Status update raw response:', response);
    
    // Đảm bảo kết quả trả về có đủ thông tin
    const result = {
      ...response.data,
      id: id,
      status: status
    };
    
    return result;
  } catch (error) {
    console.error(`Error updating exam ${id} status:`, error);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Approve an exam
 * @param {string} id - Exam ID
 * @param {string} comment - Optional approval comment
 * @returns {Promise} - Promise resolving to approved exam
 */
export const approveExam = async (id, comment = '') => {
  try {
    console.log(`Approving exam ${id} with comment: ${comment}`);
    
    const response = await apiClient.post(`/api/Exam/${id}/approve`, { 
      comment: comment 
    });
    
    console.log('Approve exam raw response:', response);
    
    const result = {
      ...response.data,
      id: id,
      isApproved: true
    };
    
    return result;
  } catch (error) {
    console.error(`Error approving exam ${id}:`, error);
    throw error;
  }
};

/**
 * Get user progress for exams
 * @param {string} userId - User ID
 * @returns {Promise} - Promise resolving to user progress data
 */
export const getUserProgress = async (userId) => {
  try {
    const response = await apiClient.get(`/api/Exam/user-progress/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching progress for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Start an exam session
 */
export const startExam = async (examId) => {
  try {
    // Giả sử API sẽ trả về thời gian bắt đầu và thời hạn nộp bài
    // Nếu không có API cụ thể, chúng ta có thể tạo logic ở frontend
    const currentTime = new Date();
    const exam = await getExamById(examId);
    
    // Tính thời gian kết thúc dựa trên thời gian đề thi (phút)
    const endTime = new Date(currentTime.getTime() + exam.duration * 60000);
    
    return {
      startTime: currentTime,
      endTime: endTime,
      exam
    };
  } catch (error) {
    console.error(`Error starting exam ${examId}:`, error);
    throw error;
  }
};

/**
 * Submit an exam
 */
export const submitExam = async (examId, answers, timeSpent) => {
  try {
    const response = await apiClient.post(`/api/Results`, {
      answers,
      timeSpent,
      submittedAt: new Date().toISOString() // Thêm thời gian nộp bài
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể nộp bài thi.' };
  }
};

/**
 * Get exam history for current user
 */
export const getExamHistory = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.fromDate) params.append('fromDate', filters.fromDate);
    if (filters.toDate) params.append('toDate', filters.toDate);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await apiClient.get(`/api/Exam/history?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy lịch sử làm bài thi.' };
  }
};

/**
 * Get exam result details
 */
export const getExamResult = async (resultId) => {
  try {
    const response = await apiClient.get(`/api/Results/${resultId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy kết quả bài thi.' };
  }
};

/**
 * Get exam statistics
 */
export const getExamStatistics = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/Exam/statistics', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy thống kê đề thi.' };
  }
};


// ... existing code ...

// Update getTeacherExams to use the new endpoint
export const getTeacherExams = async (page = 1, pageSize = 10, filters = {}) => {
  try {
    return await getTeacherTests(page, pageSize);
  } catch (error) {
    // If the new endpoint fails, try the old one
    try {
      const response = await apiClient.get('/api/Exams/teacher', {
        params: {
          page,
          pageSize,
          ...filters
        }
      });
      return response.data;
    } catch (fallbackError) {
      console.error('Error fetching teacher exams with fallback:', fallbackError);
      throw fallbackError;
    }
  }
};
