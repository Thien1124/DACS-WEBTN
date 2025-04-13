import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as questionService from '../services/questionService';
import { showErrorToast, showSuccessToast } from '../utils/toastUtils';

export const fetchQuestions = createAsyncThunk(
  'questions/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await questionService.getQuestions(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchQuestionById = createAsyncThunk(
  'questions/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await questionService.getQuestionById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createNewQuestion = createAsyncThunk(
  'questions/create',
  async (questionData, { rejectWithValue }) => {
    try {
      const response = await questionService.createQuestion(questionData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateQuestion = createAsyncThunk(
  'questions/update',
  async ({ id, questionData }, { rejectWithValue }) => {
    try {
      const response = await questionService.updateQuestion(id, questionData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeQuestion = createAsyncThunk(
  'questions/remove',
  async (id, { rejectWithValue }) => {
    try {
      await questionService.deleteQuestion(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const questionSlice = createSlice({
  name: 'questions',
  initialState: {
    list: [],
    currentQuestion: null,
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0
    }
  },
  reducers: {
    clearCurrentQuestion: (state) => {
      state.currentQuestion = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchQuestions
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Xử lý fetchQuestionById
      .addCase(fetchQuestionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuestion = action.payload;
      })
      .addCase(fetchQuestionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Xử lý createNewQuestion
      .addCase(createNewQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createNewQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Xử lý updateQuestion
      .addCase(updateQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(question => question.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(updateQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Xử lý removeQuestion
      .addCase(removeQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(question => question.id !== action.payload);
      })
      .addCase(removeQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentQuestion } = questionSlice.actions;
export default questionSlice.reducer;