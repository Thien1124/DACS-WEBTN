import apiClient from '../../services/apiClient';
import { createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Toggle activation status of a subject
 * Chỉ dành cho giáo viên và admin
 * 
 * @param {string|number} id - Subject ID
 * @returns {Promise} - Promise resolving to the updated subject
 */
export const toggleSubjectStatus = async (id) => {
  try {
    const response = await apiClient.patch(`/api/Subject/${id}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error('Error toggling subject status:', error);
    throw error;
  }
};

/**
 * Async thunk for toggling subject status
 * Chỉ dành cho giáo viên và admin
 */
export const toggleSubjectStatusThunk = createAsyncThunk(
  'admin/toggleSubjectStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await toggleSubjectStatus(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể thay đổi trạng thái môn học');
    }
  }
);