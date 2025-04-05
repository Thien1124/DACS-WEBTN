import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as examService from '../services/examService';

// Async thunks
export const fetchExams = createAsyncThunk(
  'exam/fetchExams',
  async (filters) => {
    const response = await examService.getAllExams(filters);
    return response;
  }
);

export const fetchExamsForStudent = createAsyncThunk(
  'exam/fetchExamsForStudent',
  async ({ subjectId, filters }) => {
    const response = await examService.getExamsForStudent(subjectId, filters);
    return response;
  }
);

export const startExamSession = createAsyncThunk(
  'exam/startExam',
  async (examId) => {
    const response = await examService.startExam(examId);
    return response;
  }
);

export const submitExam = createAsyncThunk(
  'exam/submitExam',
  async ({ examId, answers, timeSpent }) => {
    const response = await examService.submitExam(examId, answers, timeSpent);
    return response;
  }
);

export const fetchExamHistory = createAsyncThunk(
  'exam/fetchHistory',
  async (filters) => {
    const response = await examService.getExamHistory(filters);
    return response;
  }
);

export const fetchExamResult = createAsyncThunk(
  'exam/fetchResult',
  async (resultId) => {
    const response = await examService.getExamResult(resultId);
    return response;
  }
);

const examSlice = createSlice({
  name: 'exam',
  initialState: {
    items: [],
    currentExam: null,
    examHistory: [],
    currentResult: null,
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0
    },
    activeSession: null
  },
  reducers: {
    resetExamState: (state) => {
      state.currentExam = null;
      state.activeSession = null;
      state.error = null;
    },
    updateExamTimer: (state, action) => {
      if (state.activeSession) {
        state.activeSession.timeRemaining = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch exams
      .addCase(fetchExams.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Start exam
      .addCase(startExamSession.fulfilled, (state, action) => {
        state.activeSession = {
          ...action.payload,
          startTime: new Date().toISOString(),
          timeRemaining: action.payload.duration * 60 // Convert to seconds
        };
      })

      // Submit exam
      .addCase(submitExam.fulfilled, (state, action) => {
        state.activeSession = null;
        state.currentResult = action.payload;
      })

      // Fetch history
      .addCase(fetchExamHistory.fulfilled, (state, action) => {
        state.examHistory = action.payload.items;
        state.pagination = action.payload.pagination;
      })

      // Fetch result
      .addCase(fetchExamResult.fulfilled, (state, action) => {
        state.currentResult = action.payload;
      });
  }
});

export const { resetExamState, updateExamTimer } = examSlice.actions;

export default examSlice.reducer;