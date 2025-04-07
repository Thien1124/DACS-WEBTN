import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as subjectService from '../services/subjectService';

// Admin async thunks
export const toggleSubjectStatus = createAsyncThunk(
  'admin/toggleSubjectStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await subjectService.toggleSubjectStatus(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể thay đổi trạng thái môn học');
    }
  }
);

export const createSubject = createAsyncThunk(
  'admin/createSubject',
  async (subjectData, { rejectWithValue }) => {
    try {
      const response = await subjectService.createSubject(subjectData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tạo môn học mới');
    }
  }
);

export const updateSubject = createAsyncThunk(
  'admin/updateSubject',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await subjectService.updateSubject(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật môn học');
    }
  }
);

export const deleteSubject = createAsyncThunk(
  'admin/deleteSubject',
  async (id, { rejectWithValue }) => {
    try {
      await subjectService.deleteSubject(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể xóa môn học');
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  success: null
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Toggle subject status
      .addCase(toggleSubjectStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(toggleSubjectStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = `Trạng thái môn học "${action.payload.title}" đã được thay đổi thành công thành ${action.payload.status ? 'kích hoạt' : 'vô hiệu hóa'}.`;
      })
      .addCase(toggleSubjectStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create subject
      .addCase(createSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createSubject.fulfilled, (state, action) => {
        state.loading = false;
        state.success = `Môn học "${action.payload.title}" đã được tạo thành công.`;
      })
      .addCase(createSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update subject
      .addCase(updateSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(updateSubject.fulfilled, (state, action) => {
        state.loading = false;
        state.success = `Môn học "${action.payload.title}" đã được cập nhật thành công.`;
      })
      .addCase(updateSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete subject
      .addCase(deleteSubject.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(deleteSubject.fulfilled, (state) => {
        state.loading = false;
        state.success = `Môn học đã được xóa thành công.`;
      })
      .addCase(deleteSubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearMessages } = adminSlice.actions;

export default adminSlice.reducer;