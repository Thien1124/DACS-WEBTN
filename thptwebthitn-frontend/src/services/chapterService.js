import apiClient from './apiClient';

/**
 * Get chapters with filters and pagination
 * @param {Object} params - Query parameters
 * @returns {Promise} - Promise resolving to chapters data
 */
export const getChapters = async (params = {}) => {
  try {
    console.log('Fetching chapters with params:', params);
    
    const response = await apiClient.get('/api/Chapter', { params });
    console.log('Raw chapters response:', response);
    
    // Xử lý nhiều định dạng response khác nhau
    if (response.data) {
      // Trường hợp API trả về {data: [...]} như trong Postman
      if (response.data.data && Array.isArray(response.data.data)) {
        return { items: response.data.data };
      }
      // Các trường hợp khác
      else if (Array.isArray(response.data)) {
        return { items: response.data };
      } else if (response.data.items && Array.isArray(response.data.items)) {
        return response.data;
      } else {
        return { items: [] };
      }
    }
    
    return { items: [] };
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return { items: [], error: error.message || 'Unknown error' };
  }
};

/**
 * Get chapters for a specific subject
 * @param {number} subjectId - Subject ID
 * @returns {Promise} - Promise resolving to chapters data
 */
export const getChaptersBySubject = async (subjectId) => {
  try {
    const params = {
      subjectId: subjectId,
      pageSize: 100, // Get more chapters at once
      includeInactive: false
    };
    const response = await apiClient.get('/api/Chapter', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching chapters by subject:', error);
    throw error.response?.data || { message: 'Could not fetch chapters for this subject' };
  }
};

/**
 * Get a chapter by ID
 * @param {number} id - Chapter ID
 * @returns {Promise} - Promise resolving to chapter data
 */
export const getChapter = async (id) => {
  try {
    const response = await apiClient.get(`/api/Chapter/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching chapter ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new chapter
 * @param {Object} chapterData - New chapter data
 * @returns {Promise} - Promise resolving to created chapter
 */
export const createChapter = async (chapterData) => {
  try {
    const response = await apiClient.post('/api/Chapter', chapterData);
    return response.data;
  } catch (error) {
    console.error('Error creating chapter:', error);
    throw error.response?.data || { message: 'Could not create chapter' };
  }
};

/**
 * Update a chapter
 * @param {number} id - Chapter ID
 * @param {Object} chapterData - Updated chapter data
 * @returns {Promise} - Promise resolving to updated chapter
 */
export const updateChapter = async (id, chapterData) => {
  try {
    const response = await apiClient.put(`/api/Chapter/${id}`, chapterData);
    return response.data;
  } catch (error) {
    console.error('Error updating chapter:', error);
    throw error.response?.data || { message: 'Could not update chapter' };
  }
};

/**
 * Delete a chapter
 * @param {number} id - Chapter ID
 * @returns {Promise} - Promise resolving to success message
 */
export const deleteChapter = async (id) => {
  try {
    const response = await apiClient.delete(`/api/Chapter/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting chapter:', error);
    throw error.response?.data || { message: 'Could not delete chapter' };
  }
};