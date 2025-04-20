import apiClient from './apiClient';

/**
 * Import exams from CSV file
 * @param {FormData} formData - Form data with CSV file
 * @returns {Promise} - Promise resolving to import result
 */
export const importExams = async (formData) => {
  try {
    const response = await apiClient.post('/api/ExamsImport/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error importing exams:', error);
    throw error;
  }
};

/**
 * Download CSV template for exam import
 * @returns {Promise} - Promise resolving to template file
 */
export const downloadImportTemplate = async () => {
  try {
    const response = await apiClient.get('/api/ExamsImport/import/template', {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading template:', error);
    throw error;
  }
};