
import apiClient from './apiClient'; 
const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5006';

/**
 * Lấy dữ liệu cho Dashboard
 * @returns {Promise} Promise trả về dữ liệu cho Dashboard
 */
export const getDashboardData = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiClient.get(`/api/Dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Authentication failed. Please login again.');
    }
    
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard data');
  }
};

/**
 * Lấy chi tiết thống kê
 * @returns {Promise} Promise trả về dữ liệu thống kê chi tiết
 */
export const getDetailedStats = async () => {
  try {
    const response = await apiClient.get('/api/Dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching detailed stats:', error);
    throw error;
  }
};

/**
 * Lấy danh sách hoạt động gần đây
 * @param {number} limit - Số lượng hoạt động cần lấy
 * @returns {Promise} Promise trả về danh sách hoạt động
 */
export const getRecentActivities = async (limit = 10) => {
  try {
    const response = await apiClient.get(`/api/Dashboard/activities?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};

/**
 * Lấy danh sách sự kiện sắp tới
 * @returns {Promise} Promise trả về danh sách sự kiện
 */
export const getUpcomingEvents = async () => {
  try {
    const response = await apiClient.get('/api/Dashboard/events');
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
};