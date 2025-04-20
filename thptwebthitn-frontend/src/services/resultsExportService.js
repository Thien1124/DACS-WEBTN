import apiClient from './apiClient';

/**
 * Export exam results
 * @param {Object} params - Export parameters
 * @returns {Promise} - Promise resolving to file blob
 */
export const exportResults = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/ResultsExport/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting results:', error);
    throw error;
  }
};