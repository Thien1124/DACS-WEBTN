import apiClient from '../services/apiClient';
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

export const getExams = async (params = {}) => {
  try {
    // Đảm bảo tham số phân trang luôn hợp lệ
    const queryParams = new URLSearchParams();
    
    // Đảm bảo page và pageSize luôn có giá trị hợp lệ
    queryParams.append('page', params.page || 1); // Mặc định page 1
    queryParams.append('pageSize', params.pageSize || 10); // Mặc định 10 item/trang
    
    // Các tham số tìm kiếm khác
    if (params.SearchTerm) queryParams.append('SearchTerm', params.SearchTerm);
    if (params.subjectId) queryParams.append('subjectId', params.subjectId);
    if (params.activeOnly !== undefined) queryParams.append('activeOnly', params.activeOnly);
    if (params.isApproved !== undefined) queryParams.append('isApproved', params.isApproved);
    
    console.log(`Fetching exams with URL: /api/Exam?${queryParams.toString()}`);
    
    const response = await apiClient.get(`/api/Exam?${queryParams.toString()}`);
    console.log('API response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching exams:', error);
    throw error.response?.data || { message: 'Không thể tải danh sách đề thi.' };
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
export const getExamsBySubject = async (subjectId, page = 1, pageSize = 10) => {
  try {
    // Đảm bảo tham số phân trang luôn hợp lệ
    const validPage = Math.max(1, page);
    const validPageSize = Math.max(10, pageSize);
    
    // SỬA: Sửa URL để phù hợp với API endpoint
    const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5006'}/api/Exam/BySubject/${subjectId}?page=${validPage}&pageSize=${validPageSize}&isPublic=true&isActive=true`;
    
    console.log('Gọi API với URL:', url);
    
    // Thử không gửi token xác thực trước
    try {
      const response = await apiClient.getPublic(url);
      console.log('API response:', response.data);
      return response.data;
    } catch (publicError) {
      // Nếu gọi không xác thực thất bại, thử gọi với xác thực
      console.warn('Gọi API công khai thất bại, thử gọi với xác thực:', publicError);
      const response = await apiClient.get(url);
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching exams by subject:', error);
    
    // Thử với URL thay thế
    try {
      console.warn('Thử với URL API thay thế');
      const alternativeUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5006'}/api/Exam?subjectId=${subjectId}&page=${page}&pageSize=${pageSize}&isPublic=true&isActive=true`;
      const response = await apiClient.getPublic(alternativeUrl);
      return response.data;
    } catch (altError) {
      console.error('Alternative URL also failed:', altError);
    }
    
    // Sử dụng mock data nếu tất cả các cách đều thất bại
    return {
      data: mockExamsBySubject(subjectId),
      totalCount: mockExamsBySubject(subjectId).length,
      page: page,
      pageSize: pageSize,
      totalPages: 1,
      _isMockData: true
    };
  }
};

// Hàm tạo mock data
const mockExamsBySubject = (subjectId) => {
  const subjectNames = {
    '1': 'Toán học',
    '2': 'Vật lý',
    '3': 'Hóa học',
    '4': 'Sinh học',
    '5': 'Ngữ văn',
    '6': 'Lịch sử',
    '7': 'Địa lý',
    '8': 'Tiếng Anh'
  };
  
  const subject = subjectNames[subjectId] || 'Không xác định';
  
  return [
    {
      id: parseInt(subjectId) * 100 + 1,
      title: `Kiểm tra 15 phút ${subject}`,
      description: `Bài kiểm tra nhanh về ${subject}.`,
      duration: 15,
      subjectId: parseInt(subjectId),
      subjectName: subject,
      isActive: true,
      isPublic: true
    },
    {
      id: parseInt(subjectId) * 100 + 2,
      title: `Kiểm tra 1 tiết ${subject}`,
      description: `Bài kiểm tra 1 tiết về ${subject}.`,
      duration: 45,
      subjectId: parseInt(subjectId),
      subjectName: subject,
      isActive: true,
      isPublic: true
    },
    {
      id: parseInt(subjectId) * 100 + 3,
      title: `Thi cuối kỳ ${subject}`,
      description: `Bài thi cuối học kỳ môn ${subject}.`,
      duration: 90,
      subjectId: parseInt(subjectId),
      subjectName: subject,
      isActive: true,
      isPublic: true
    }
  ];
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
export const getExamWithQuestions = async (id) => {
  try {
    const response = await apiClient.get(`/api/Exam/${id}/WithQuestions`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exam ${id} with questions:`, error);
    throw error;
  }
};

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
export const updateExamStatus = async (id, status) => {
  try {
    const response = await apiClient.patch(`/api/Exam/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating exam ${id} status:`, error);
    throw error;
  }
};

/**
 * Approve an exam
 * @param {string} id - Exam ID
 * @returns {Promise} - Promise resolving to approved exam
 */
export const approveExam = async (id) => {
  try {
    if (USE_MOCK_DATA) {
      return await mockApproveExam(id);
    }
    
    const response = await apiClient.patch(`/api/Exam/${id}/approve`, { isApproved: true });
    return response.data;
  } catch (error) {
    console.error(`Error approving exam ${id}:`, error);
    
    if (USE_MOCK_DATA) {
      return await mockApproveExam(id);
    }
    
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
