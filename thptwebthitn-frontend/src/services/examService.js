import apiClient from './apiClient';

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

/**
 * Get exams for students by subject
 */
export const getExamsForStudent = async (subjectId, filters = {}) => {
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
export const getExamById = async (examId) => {
  try {
    const response = await apiClient.get(`/api/Exam/${examId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể lấy thông tin đề thi.' };
  }
};

/**
 * Start an exam session
 */
export const startExam = async (examId) => {
  try {
    const response = await apiClient.post(`/api/Exam/${examId}/start`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Không thể bắt đầu bài thi.' };
  }
};

/**
 * Submit an exam
 */
export const submitExam = async (examId, answers, timeSpent) => {
  try {
    const response = await apiClient.post(`/api/Exam/${examId}/submit`, {
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
    const response = await apiClient.get(`/api/Exam/results/${resultId}`);
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
