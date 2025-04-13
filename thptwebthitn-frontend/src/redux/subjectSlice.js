import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as subjectService from '../services/subjectService';

import { getAllSubjects, getSubjectById } from '../services/subjectService';
export const fetchAllSubjects = async () => {
  // Logic code ở đây
};
// Async thunks
export const fetchSubjects = createAsyncThunk(
  'subjects/fetchSubjects',
  async (params, { rejectWithValue }) => {
    try {
      // Console log để kiểm tra params
      console.log('Fetching subjects with params:', params);
      const response = await subjectService.getAllSubjects(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách môn học');
    }
  }
);
export const fetchAllSubjectsNoPaging = createAsyncThunk(
  'subjects/fetchAllSubjectsNoPaging',
  async (_, { rejectWithValue }) => {
    try {
      const response = await subjectService.getAllSubjectsNoPaging();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách môn học');
    }
  }
);

export const fetchSubjectById = createAsyncThunk(
  'subjects/fetchSubjectById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await subjectService.getSubjectById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải thông tin môn học');
    }
  }
);
export const fetchSubjectExams = createAsyncThunk(
  'subjects/fetchSubjectExams',
  async (subjectId, { rejectWithValue }) => {
    try {
      const response = await subjectService.getSubjectExams(subjectId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách đề thi');
    }
  }
);

export const createNewSubject = createAsyncThunk(
  'subjects/addSubject',
  async (subjectData) => {
    const response = await subjectService.createSubject(subjectData);
    return response;
  }
);

export const updateExistingSubject = createAsyncThunk(
  'subjects/updateSubject',
  async ({ id, data }) => {
    const response = await subjectService.updateSubject(id, data);
    return response;
  }
);
// Thêm vào file này nếu chưa có
export const toggleSubjectStatus = async (id) => {
  try {
    // Trong môi trường thực tế, hãy uncomment dòng dưới đây
    // const response = await apiClient.patch(`/api/Subject/${id}/toggle-status`);
    
    // Mock response
    console.log(`Toggling status for subject ${id}`);
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: id,
      status: Math.random() > 0.5 // Mock random status
    };
  } catch (error) {
    console.error('Error toggling subject status:', error);
    throw error;
  }
};
export const deleteExistingSubject = createAsyncThunk(
  'subjects/deleteSubject',
  async (id) => {
    await subjectService.deleteSubject(id);
    return id;
  }
);
const initialState = {
  items: [], // Ensure items is always initialized as an array
  allSubjects: [],
  featuredSubjects: [],
  currentSubject: null,
  subjectExams: [],
  loading: false,
  allSubjectsLoading: false,
  examLoading: false,
  featuredLoading: false,
  error: null,
  examError: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  },
  filters: {
    grade: '',
    search: '',
    sortBy: 'name'
  }
};

const subjectSlice = createSlice({
  name: 'subjects',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      // Cập nhật chỉ những filters được cung cấp, giữ nguyên các filters khác
      state.filters = { ...state.filters, ...action.payload };
      console.log('Updated filters:', state.filters);
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      console.log('Reset filters to:', initialState.filters);
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearCurrentSubject: (state) => {
      state.currentSubject = null;
    },
    clearSubjectExams: (state) => {
      state.subjectExams = [];
    }
  },
  extraReducers: (builder) => {
    builder
    .addCase(fetchSubjects.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchSubjects.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload.items || action.payload;
      state.pagination = {
        currentPage: action.payload.currentPage || 1,
        totalPages: action.payload.totalPages || 1,
        totalItems: action.payload.totalItems || action.payload.length || 0
      };
    })
    .addCase(fetchSubjects.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.items = [];
    })
      
      // Fetch single subject
      .addCase(fetchSubjectById.fulfilled, (state, action) => {
        state.currentSubject = action.payload;
      })
      
      // Create subject
      .addCase(createNewSubject.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      
      // Update subject
      .addCase(updateExistingSubject.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      
      // Delete subject
      .addCase(deleteExistingSubject.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  }
});

export const { 
  
  setFilters, 
  resetFilters, 
  setPagination,
  clearCurrentSubject,
  clearSubjectExams
} = subjectSlice.actions;
export default subjectSlice.reducer;