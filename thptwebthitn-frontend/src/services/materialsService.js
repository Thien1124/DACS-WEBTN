import apiClient from './apiClient';

/**
 * Get list of study materials/documents
 * @param {Object} params - Query parameters (subject, search, page, etc.)
 * @returns {Promise} - Promise resolving to materials data
 */
export const getMaterials = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/materials/documents', { params });
    return response.data;
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
    console.error(`Error fetching material ${id}:`, error);
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
    const response = await apiClient.post('/api/materials/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading material:', error);
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