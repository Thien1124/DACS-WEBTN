import apiClient from './apiClient';
import axios from 'axios';
import { API_URL } from '../config/constants';

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
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token not found. Please login again.');
    }

    console.log('Uploading video with token:', token.substring(0, 20) + '...');
    
    // Log FormData contents for debugging
    console.log('FormData contents:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
    }
    
    const response = await axios.post(`${API_URL}/api/videos/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      timeout: 300000 // 5 minutes timeout for large video files
    });

    console.log('Video upload response:', response.data);
    return response.data;
  } catch (error) {
    // Chi tiết hơn về lỗi
    console.error('Video upload error details:', error);
    
    if (error.response) {
      // Log chi tiết response từ server
      console.error('Server response:', {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data
      });
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    
    if (error.response?.status === 403) {
      throw new Error('You do not have permission to upload videos.');
    }
    
    if (error.response?.status === 413) {
      throw new Error('File too large. Maximum size is 500MB.');
    }
    
    if (error.response?.status === 500) {
      // Thêm phần này để bắt lỗi 500 chi tiết hơn
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          'Internal server error. Please try again later.';
      throw new Error(`Server error: ${errorMessage}`);
    }
    
    throw error.response?.data || error;
  }
};