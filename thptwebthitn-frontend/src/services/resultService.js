import apiClient from './apiClient';
import axios from 'axios';
import { getToken } from '../utils/auth';


// Thiết lập axios interceptor
axios.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
}, error => Promise.reject(error));

// Lấy lịch sử bài thi theo người dùng
export const getUserResults = async (userId) => {
  try {
    const response = await apiClient.get(`/api/Results/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching results for user ${userId}:`, error);
    throw error;
  }
};

// Lấy chi tiết kết quả bài thi
export const getResultById = async (resultId) => {
  try {
    const response = await apiClient.get(`/api/Results/${resultId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching result ${resultId}:`, error);
    throw error;
  }
};

// Xóa kết quả bài thi (chỉ dành cho admin)
export const deleteResult = async (id) => {
  try {
    const response = await apiClient.delete(`/api/Results/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting result ${id}:`, error);
    throw error;
  }
};

// Cập nhật điểm bài thi (dành cho giáo viên)
export const updateResultGrade = async (resultId, gradeData) => {
  try {
    const response = await apiClient.put(`/api/Results/${resultId}/grade`, gradeData);
    return response.data;
  } catch (error) {
    console.error(`Error updating grade for result ${resultId}:`, error);
    throw error;
  }
};