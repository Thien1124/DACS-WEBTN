import apiClient from './apiClient';

/**
 * Get system overview statistics
 * @returns {Promise} - Promise resolving to overview data
 */
export const getSystemOverview = async () => {
  try {
    const response = await apiClient.get('/api/Statistics/overview');
    return response.data;
  } catch (error) {
    console.error('Error fetching system overview:', error);
    throw error;
  }
};

/**
 * Get statistics by subject
 * @returns {Promise} - Promise resolving to subject statistics
 */
export const getSubjectStatistics = async () => {
  try {
    const response = await apiClient.get('/api/Statistics/by-subject');
    return response.data;
  } catch (error) {
    console.error('Error fetching subject statistics:', error);
    throw error;
  }
};