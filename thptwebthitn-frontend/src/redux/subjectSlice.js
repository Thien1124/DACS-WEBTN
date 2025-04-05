import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as subjectService from '../services/subjectService';

// Async thunks
export const fetchSubjects = createAsyncThunk(
  'subjects/fetchSubjects',
  async (filters) => {
    const response = await subjectService.getAllSubjects(filters);
    return response;
  }
);

export const fetchSubjectById = createAsyncThunk(
  'subjects/fetchSubjectById',
  async (id) => {
    const response = await subjectService.getSubjectById(id);
    return response;
  }
);

export const createNewSubject = createAsyncThunk(
  'subjects/createSubject',
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

export const deleteExistingSubject = createAsyncThunk(
  'subjects/deleteSubject',
  async (id) => {
    await subjectService.deleteSubject(id);
    return id;
  }
);

const initialState = {
  items: [],
  currentSubject: null,
  loading: false,
  error: null,
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
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch subjects
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = {
          currentPage: action.payload.currentPage,
          totalPages: action.payload.totalPages,
          totalItems: action.payload.totalItems
        };
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
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

export const { setFilters, resetFilters, setPagination } = subjectSlice.actions;

export default subjectSlice.reducer;