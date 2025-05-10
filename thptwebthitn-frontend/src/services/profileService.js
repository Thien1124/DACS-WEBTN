import axios from 'axios';
import apiClient from '../services/apiClient';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const getUserProfile = async () => {
  try {
    const response = await apiClient.get(`/api/User/me`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const getUserResults = async (userId) => {
  try {
    const response = await apiClient.get(`/api/Results/user/${userId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user results:', error);
    throw error;
  }
};

export const getUserAnalytics = async (userId) => {
  try {
    const response = await apiClient.get(`$/api/analytics/student/${userId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    throw error;
  }
};