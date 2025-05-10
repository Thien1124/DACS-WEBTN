import apiClient from './apiClient';

/**
 * Get list of study materials/documents
 * @param {Object} params - Query parameters (subject, search, page, etc.)
 * @returns {Promise} - Promise resolving to materials data
 */
export const getMaterials = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/materials/documents', { params });
    
    console.log('Materials API response:', response.data);
    
    // Return formatted data to match component expectations
    return {
      items: response.data.data || [],
      totalItems: response.data.totalCount || 0,
      totalPages: response.data.pageCount || 0,
      currentPage: response.data.currentPage || 1
    };
  } catch (error) {
    console.error('Error fetching materials:', error);
    throw error;
  }
};

/**
 * Get details for a specific document
 * @param {string} id - Document ID
 * @returns {Promise} - Promise resolving to document details
 */
export const getMaterialById = async (id) => {
  try {
    const response = await apiClient.get(`/api/materials/documents/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching material details:', error);
    throw error;
  }
};

/**
 * Upload a document
 * @param {FormData} formData - Form data with file and metadata
 * @returns {Promise} - Promise resolving to uploaded document
 */
export const uploadMaterial = async (formData) => {
  try {
    // Log FormData for debugging
    console.log('Uploading with form data:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
    }
    
    // CRITICAL: The API endpoint is /api/materials/documents/upload
    const response = await apiClient.post('/api/materials/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading material:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status code:', error.response.status);
    }
    throw error;
  }
};

/**
 * Upload a video for study materials
 * @param {FormData} formData - Form data with video file and metadata
 * @returns {Promise} - Promise resolving to uploaded video
 */
export const uploadVideo = async (formData) => {
  try {
    const response = await apiClient.post('/api/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};