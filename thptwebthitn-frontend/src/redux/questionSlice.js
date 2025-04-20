import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getQuestions, getQuestionById, createQuestion, updateQuestion, deleteQuestion } from '../services/questionService';

export const fetchQuestions = createAsyncThunk(
  'questions/fetchQuestions',
  async (params, { rejectWithValue }) => {
    try {
      return await getQuestions(params);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch questions');
    }
  }
);

export const fetchQuestionById = createAsyncThunk(
  'questions/fetchQuestionById',
  async (id, { rejectWithValue }) => {
    try {
      return await getQuestionById(id);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch question');
    }
  }
);

export const addQuestion = createAsyncThunk(
  'questions/addQuestion',
  async (questionData, { rejectWithValue }) => {
    try {
      return await createQuestion(questionData);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create question');
    }
  }
);

export const editQuestion = createAsyncThunk(
  'questions/editQuestion',
  async ({ id, questionData }, { rejectWithValue }) => {
    try {
      return await updateQuestion(id, questionData);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update question');
    }
  }
);

export const removeQuestion = createAsyncThunk(
  'questions/removeQuestion',
  async (id, { rejectWithValue }) => {
    try {
      await deleteQuestion(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete question');
    }
  }
);

const initialState = {
  list: [],
  loading: false,
  error: null,
  currentQuestion: null,
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  }
};

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    setPage(state, action) {
      state.pagination.currentPage = action.payload;
    },
    setPageSize(state, action) {
      state.pagination.pageSize = action.payload;
    },
    clearError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch questions
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items || action.payload;
        if (action.payload.pagination) {
          state.pagination = {
            currentPage: action.payload.pagination.currentPage,
            pageSize: action.payload.pagination.pageSize,
            totalItems: action.payload.pagination.totalItems,
            totalPages: action.payload.pagination.totalPages
          };
        }
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch question by id
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
      
      // Add question
      .addCase(addQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(addQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Edit question
      .addCase(editQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editQuestion.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(question => question.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(editQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove question
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

export const { setPage, setPageSize, clearError } = questionsSlice.actions;
export default questionsSlice.reducer;