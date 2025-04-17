import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as examService from '../services/examService';
// Async thunks
export const fetchExams = createAsyncThunk(
  'exams/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await examService.getExams(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
export const fetchExamsBySubject = createAsyncThunk(
  'exams/fetchBySubject',
  async (subjectId, { rejectWithValue }) => {
    try {
      const response = await examService.getExamsBySubject(subjectId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const fetchExamsForStudents = createAsyncThunk(
  'exams/fetchForStudents',
  async (subjectId, { rejectWithValue }) => {
    try {
      const response = await examService.getExamsForStudents(subjectId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const fetchExamDetails = createAsyncThunk(
  'exams/fetchDetails',
  async (examId, { rejectWithValue }) => {
    try {
      const response = await examService.getExamById(examId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchExamWithQuestions = createAsyncThunk(
  'exams/fetchWithQuestions',
  async (examId, { rejectWithValue }) => {
    try {
      const response = await examService.getExamWithQuestions(examId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createNewExam = createAsyncThunk(
  'exams/create',
  async (examData, { rejectWithValue }) => {
    try {
      const response = await examService.createExam(examData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const updateExamDetails = createAsyncThunk(
  'exams/update',
  async ({ id, examData }, { rejectWithValue }) => {
    try {
      const response = await examService.updateExam(id, examData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeExam = createAsyncThunk(
  'exams/remove',
  async (id, { rejectWithValue }) => {
    try {
      await examService.deleteExam(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const startExamSession = createAsyncThunk(
  'exams/start',
  async (examId, { rejectWithValue }) => {
    try {
      const response = await examService.startExam(examId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitExamAnswers = createAsyncThunk(
  'exams/submit',
  async ({ examId, answers }, { rejectWithValue }) => {
    try {
      const response = await examService.submitExam(examId, answers);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
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
  name: 'exams',
  initialState: {
    list: [],
    currentExam: null,
    examQuestions: [],
    userAnswers: {},
    examResult: null,
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0
    }
  },
  reducers: {
    setUserAnswer: (state, action) => {
      const { questionId, answerId } = action.payload;
      state.userAnswers = {
        ...state.userAnswers,
        [questionId]: answerId
      };
    },
    resetUserAnswers: (state) => {
      state.userAnswers = {};
    },
    clearCurrentExam: (state) => {
      state.currentExam = null;
      state.examQuestions = [];
    },
    clearExamResult: (state) => {
      state.examResult = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchExams
      .addCase(fetchExams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch exams';
      })
      
      // Xử lý fetchExamsBySubject
      .addCase(fetchExamsBySubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExamsBySubject.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchExamsBySubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch exams by subject';
      })
      
      // Xử lý fetchExamsForStudents
      .addCase(fetchExamsForStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExamsForStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchExamsForStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch exams for students';
      })
      
      // Xử lý fetchExamDetails
      .addCase(fetchExamDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExamDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentExam = action.payload;
      })
      .addCase(fetchExamDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch exam details';
      })
      
      // Xử lý fetchExamWithQuestions
      .addCase(fetchExamWithQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExamWithQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.currentExam = action.payload;
        state.examQuestions = action.payload.questions || [];
      })
      .addCase(fetchExamWithQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch exam with questions';
      })
      
      // Xử lý createNewExam
      .addCase(createNewExam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewExam.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createNewExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create exam';
      })
      
      // Xử lý updateExamDetails
      .addCase(updateExamDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExamDetails.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(exam => exam.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.currentExam && state.currentExam.id === action.payload.id) {
          state.currentExam = action.payload;
        }
      })
      .addCase(updateExamDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update exam';
      })
      
      // Xử lý removeExam
      .addCase(removeExam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeExam.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(exam => exam.id !== action.payload);
        if (state.currentExam && state.currentExam.id === action.payload) {
          state.currentExam = null;
        }
      })
      .addCase(removeExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to remove exam';
      })
      
      // Xử lý startExamSession
      .addCase(startExamSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startExamSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentExam = {
          ...action.payload.exam,
          startTime: action.payload.startTime,
          endTime: action.payload.endTime
        };
        state.userAnswers = {};
      })
      .addCase(startExamSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to start exam';
      })
      
      // Xử lý submitExamAnswers
      .addCase(submitExamAnswers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitExamAnswers.fulfilled, (state, action) => {
        state.loading = false;
        state.examResult = action.payload;
        // Giữ nguyên userAnswers để có thể hiển thị lại kết quả
      })
      .addCase(submitExamAnswers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to submit exam';
      });
  }
});

export const { setUserAnswer, resetUserAnswers, clearCurrentExam, clearExamResult } = examSlice.actions;
export default examSlice.reducer;