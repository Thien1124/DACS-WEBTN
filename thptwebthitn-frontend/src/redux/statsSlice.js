import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import examService from '../services/examService';

// Fetch exam statistics
export const fetchExamStats = createAsyncThunk(
  'stats/fetchExamStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await examService.getExamStatistics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const statsSlice = createSlice({
  name: 'stats',
  initialState: {
    examStats: {
      totalExams: 0,
      totalAttempts: 0,
      averageScore: 0,
      subjectStats: []
    },
    loading: false,
    error: null
  },
  reducers: {
    clearStats: (state) => {
      state.examStats = {
        totalExams: 0,
        totalAttempts: 0,
        averageScore: 0,
        subjectStats: []
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExamStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExamStats.fulfilled, (state, action) => {
        state.loading = false;
        state.examStats = action.payload;
      })
      .addCase(fetchExamStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch statistics';
      });
  }
});

export const { clearStats } = statsSlice.actions;
export default statsSlice.reducer;