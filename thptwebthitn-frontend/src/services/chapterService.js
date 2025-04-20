import apiClient from './apiClient';

/**
 * Get all chapters with pagination and filtering
 * @param {Object} params - Query parameters including pagination and filters
 * @returns {Promise} - Promise resolving to chapters data
 */
export const getChapters = async (params = {}) => {
  try {
    // Log the request for debugging
    console.log("Requesting chapters with params:", params);
    
    const response = await apiClient.get('/api/Chapter', { params });
    
    // Log the response
    console.log("Chapters API response:", response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching chapters:', error);
    const errorMessage = error.response?.data?.message || 'Không thể lấy danh sách chương';
    console.error(errorMessage);
    throw { message: errorMessage };
  }
};

/**
 * Create a new chapter
 * @param {Object} chapterData - Chapter data
 * @returns {Promise} - Promise resolving to created chapter
 */
export const createChapter = async (chapterData) => {
  try {
    const response = await apiClient.post('/api/Chapter', chapterData);
    return response.data;
  } catch (error) {
    console.error('Error creating chapter:', error);
    throw error;
  }
};

/**
 * Get chapter details by ID
 * @param {string} id - Chapter ID
 * @returns {Promise} - Promise resolving to chapter details
 */
export const getChapterById = async (id) => {
  try {
    const response = await apiClient.get(`/api/Chapter/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching chapter ${id}:`, error);
    throw error;
  }
};

/**
 * Update chapter details
 * @param {string} id - Chapter ID
 * @param {Object} chapterData - Updated chapter data
 * @returns {Promise} - Promise resolving to updated chapter
 */
export const updateChapter = async (id, chapterData) => {
  try {
    const response = await apiClient.put(`/api/Chapter/${id}`, chapterData);
    return response.data;
  } catch (error) {
    console.error(`Error updating chapter ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a chapter
 * @param {string} id - Chapter ID
 * @returns {Promise} - Promise resolving to deletion status
 */
export const deleteChapter = async (id) => {
  try {
    const response = await apiClient.delete(`/api/Chapter/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting chapter ${id}:`, error);
    throw error;
  }
};