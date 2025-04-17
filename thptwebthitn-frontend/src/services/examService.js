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
 * Get all available exams
 */
export const getAllExams = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await apiClient.get(`/api/Exam?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy danh sách đề thi.' };
  }
};

export const getExams = async (params) => {
  try {
    const response = await apiClient.get(`/api/Exam`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching exams:', error);
    throw error;
  }
};
export const getExamsBySubject = async (subjectId, options = {}) => {
  try {
    const { 
      page = 1, 
      limit = 9, 
      search = '', 
      difficulty = '', 
      sort = 'newest' 
    } = options;
    
    // Xây dựng query params
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    
    if (search) {
      params.append('search', search);
    }
    
    if (difficulty) {
      params.append('difficulty', difficulty);
    }
    
    if (sort) {
      params.append('sort', sort);
    }
    
    // Gọi API để lấy danh sách đề thi theo môn học
    const response = await apiClient.get(`/api/Exam/BySubject/${subjectId}`);
    
    return {
      items: response.data.items || [],
      currentPage: response.data.currentPage || page,
      totalPages: response.data.totalPages || 1,
      totalItems: response.data.totalCount || 0,
      pageSize: response.data.pageSize || limit
    };
  } catch (error) {
    console.error('Error fetching exams by subject:', error);
    
    // Trả về dữ liệu mẫu khi API chưa hoàn thiện hoặc có lỗi
    return {
      items: [
        {
          id: 1,
          title: 'Kiểm tra học kỳ 1 - Đề số 1',
          description: 'Đề kiểm tra học kỳ 1, bao gồm toàn bộ kiến thức từ tuần 1 đến tuần 15.',
          difficulty: 'medium',
          timeLimit: 90,
          questionCount: 40,
          image: 'https://placehold.co/800x400/4299e1/ffffff?text=Exam+1'
        },
        {
          id: 2,
          title: 'Kiểm tra chương 3 - Đề số 2',
          description: 'Đề kiểm tra chương 3, tập trung vào phần lý thuyết và bài tập cơ bản.',
          difficulty: 'easy',
          timeLimit: 45,
          questionCount: 25,
          image: 'https://placehold.co/800x400/48bb78/ffffff?text=Exam+2'
        },
        {
          id: 3,
          title: 'Đề thi thử cuối kỳ - Nâng cao',
          description: 'Đề thi thử cuối kỳ với độ khó cao, dành cho học sinh giỏi chuẩn bị thi HSG.',
          difficulty: 'hard',
          timeLimit: 120,
          questionCount: 50,
          image: 'https://placehold.co/800x400/e53e3e/ffffff?text=Exam+3'
        },
      ],
      currentPage: parseInt(options.page) || 1,
      totalPages: 1,
      totalItems: 3,
      pageSize: parseInt(options.limit) || 9
    };
  }
};
/**
 * Get exams for students by subject
 */
export const getExamsForStudents = async (subjectId, filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(`/api/Exam/ForStudents/${subjectId}?${params}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy danh sách đề thi.' };
  }
};

/**
 * Get an exam by ID
 */
export const getExamById = async (id) => {
  try {
    const response = await apiClient.get(`/api/Exam/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy thông tin đề thi.' };
  }
};
// Lấy thông tin chi tiết của một bài thi kèm danh sách câu hỏi đầy đủ
export const getExamWithQuestions = async (id) => {
  try {
    const response = await apiClient.get(`/api/Exam/WithQuestions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching exam with questions ${id}:`, error);
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
 * Create a new exam
 */
export const createExam = async (examData) => {
  try {
    const response = await apiClient.post('/api/Exam', examData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể tạo đề thi mới.' };
  }
};

/**
 * Update an exam
 */
export const updateExam = async (examId, examData) => {
  try {
    const response = await apiClient.put(`/api/Exam/${examId}`, examData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể cập nhật đề thi.' };
  }
};

/**
 * Delete an exam
 */
export const deleteExam = async (examId) => {
  try {
    const response = await apiClient.delete(`/api/Exam/${examId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể xóa đề thi.' };
  }
};
