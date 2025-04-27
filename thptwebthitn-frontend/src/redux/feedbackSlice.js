import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import feedbackServices from '../services/feedbackServices';
import { showSuccessToast, showErrorToast } from '../utils/toastUtils';

// Async thunks
export const submitFeedback = createAsyncThunk(
  'feedback/submit',
  async ({ testId, feedbackData }, { rejectWithValue }) => {
    try {
      const response = await feedbackServices.submitFeedback(testId, feedbackData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Không thể gửi phản hồi' });
    }
  }
);

export const getMyFeedbacks = createAsyncThunk(
  'feedback/getMyFeedbacks',
  async ({ page = 1, pageSize = 10 }, { rejectWithValue }) => {
    try {
      const response = await feedbackServices.getMyFeedbacks(page, pageSize);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Không thể tải danh sách phản hồi' });
    }
  }
);

export const getFeedbackDetails = createAsyncThunk(
  'feedback/getFeedbackDetails',
  async (feedbackId, { rejectWithValue }) => {
    try {
      const response = await feedbackServices.getFeedback(feedbackId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Không thể tải chi tiết phản hồi' });
    }
  }
);

export const getTestFeedbacks = createAsyncThunk(
  'feedback/getTestFeedbacks',
  async ({ testId, page = 1, pageSize = 10, status }, { rejectWithValue }) => {
    try {
      const response = await feedbackServices.getTestFeedbacks(testId, page, pageSize, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Không thể tải danh sách phản hồi của bài thi' });
    }
  }
);

export const getAllFeedbacks = createAsyncThunk(
  'feedback/getAllFeedbacks',
  async ({ page = 1, pageSize = 10, status }, { rejectWithValue }) => {
    try {
      const response = await feedbackServices.getAllFeedbacks(page, pageSize, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Không thể tải danh sách tất cả các phản hồi' });
    }
  }
);

export const resolveFeedback = createAsyncThunk(
  'feedback/resolveFeedback',
  async ({ testId, feedbackId, resolveData }, { rejectWithValue }) => {
    try {
      const response = await feedbackServices.resolveFeedback(testId, feedbackId, resolveData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Không thể xử lý phản hồi' });
    }
  }
);

// Initial state
const initialState = {
  // Danh sách phản hồi của người dùng
  myFeedbacks: {
    items: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      pageSize: 10
    }
  },
  
  // Danh sách phản hồi của một bài thi
  testFeedbacks: {
    items: [],
    loading: false,
    error: null,
    testId: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      pageSize: 10
    }
  },
  
  // Danh sách tất cả các phản hồi (cho admin)
  allFeedbacks: {
    items: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      pageSize: 10
    }
  },
  
  // Chi tiết phản hồi
  feedbackDetails: {
    data: null,
    loading: false,
    error: null
  },
  
  // Trạng thái gửi phản hồi
  submission: {
    loading: false,
    error: null,
    success: false
  },
  
  // Trạng thái xử lý phản hồi
  resolution: {
    loading: false,
    error: null,
    success: false
  }
};

// Slice
const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    resetSubmission: (state) => {
      state.submission = {
        loading: false,
        error: null,
        success: false
      };
    },
    resetResolution: (state) => {
      state.resolution = {
        loading: false,
        error: null,
        success: false
      };
    },
    setTestId: (state, action) => {
      state.testFeedbacks.testId = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Xử lý submitFeedback
    builder
      .addCase(submitFeedback.pending, (state) => {
        state.submission.loading = true;
        state.submission.error = null;
        state.submission.success = false;
      })
      .addCase(submitFeedback.fulfilled, (state, action) => {
        state.submission.loading = false;
        state.submission.success = true;
        showSuccessToast('Phản hồi đã được gửi thành công');
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.submission.loading = false;
        state.submission.error = action.payload?.message || 'Đã xảy ra lỗi khi gửi phản hồi';
        showErrorToast(state.submission.error);
      })
    
    // Xử lý getMyFeedbacks
      .addCase(getMyFeedbacks.pending, (state) => {
        state.myFeedbacks.loading = true;
        state.myFeedbacks.error = null;
      })
      .addCase(getMyFeedbacks.fulfilled, (state, action) => {
        state.myFeedbacks.loading = false;
        
        if (Array.isArray(action.payload)) {
          state.myFeedbacks.items = action.payload;
        } else {
          state.myFeedbacks.items = action.payload.items || [];
          state.myFeedbacks.pagination = {
            currentPage: action.payload.currentPage || 1,
            totalPages: action.payload.totalPages || 1,
            totalItems: action.payload.totalItems || action.payload.items?.length || 0,
            pageSize: action.payload.pageSize || 10
          };
        }
      })
      .addCase(getMyFeedbacks.rejected, (state, action) => {
        state.myFeedbacks.loading = false;
        state.myFeedbacks.error = action.payload?.message || 'Đã xảy ra lỗi khi tải danh sách phản hồi';
      })
    
    // Xử lý getFeedbackDetails
      .addCase(getFeedbackDetails.pending, (state) => {
        state.feedbackDetails.loading = true;
        state.feedbackDetails.error = null;
      })
      .addCase(getFeedbackDetails.fulfilled, (state, action) => {
        state.feedbackDetails.loading = false;
        state.feedbackDetails.data = action.payload;
      })
      .addCase(getFeedbackDetails.rejected, (state, action) => {
        state.feedbackDetails.loading = false;
        state.feedbackDetails.error = action.payload?.message || 'Đã xảy ra lỗi khi tải chi tiết phản hồi';
      })
    
    // Xử lý getTestFeedbacks
      .addCase(getTestFeedbacks.pending, (state) => {
        state.testFeedbacks.loading = true;
        state.testFeedbacks.error = null;
      })
      .addCase(getTestFeedbacks.fulfilled, (state, action) => {
        state.testFeedbacks.loading = false;
        
        if (Array.isArray(action.payload)) {
          state.testFeedbacks.items = action.payload;
        } else {
          state.testFeedbacks.items = action.payload.items || [];
          state.testFeedbacks.pagination = {
            currentPage: action.payload.currentPage || 1,
            totalPages: action.payload.totalPages || 1,
            totalItems: action.payload.totalItems || action.payload.items?.length || 0,
            pageSize: action.payload.pageSize || 10
          };
        }
      })
      .addCase(getTestFeedbacks.rejected, (state, action) => {
        state.testFeedbacks.loading = false;
        state.testFeedbacks.error = action.payload?.message || 'Đã xảy ra lỗi khi tải danh sách phản hồi của bài thi';
      })
    
    // Xử lý getAllFeedbacks
      .addCase(getAllFeedbacks.pending, (state) => {
        state.allFeedbacks.loading = true;
        state.allFeedbacks.error = null;
      })
      .addCase(getAllFeedbacks.fulfilled, (state, action) => {
        state.allFeedbacks.loading = false;
        
        if (Array.isArray(action.payload)) {
          state.allFeedbacks.items = action.payload;
        } else {
          state.allFeedbacks.items = action.payload.items || [];
          state.allFeedbacks.pagination = {
            currentPage: action.payload.currentPage || 1,
            totalPages: action.payload.totalPages || 1,
            totalItems: action.payload.totalItems || action.payload.items?.length || 0,
            pageSize: action.payload.pageSize || 10
          };
        }
      })
      .addCase(getAllFeedbacks.rejected, (state, action) => {
        state.allFeedbacks.loading = false;
        state.allFeedbacks.error = action.payload?.message || 'Đã xảy ra lỗi khi tải tất cả các phản hồi';
      })
    
    // Xử lý resolveFeedback
      .addCase(resolveFeedback.pending, (state) => {
        state.resolution.loading = true;
        state.resolution.error = null;
        state.resolution.success = false;
      })
      .addCase(resolveFeedback.fulfilled, (state, action) => {
        state.resolution.loading = false;
        state.resolution.success = true;
        showSuccessToast('Phản hồi đã được xử lý thành công');
        
        // Cập nhật trạng thái phản hồi trong danh sách (nếu có)
        const resolvedFeedback = action.payload;
        if (resolvedFeedback) {
          const updateFeedbackList = (list) => {
            const index = list.findIndex(item => item.id === resolvedFeedback.id);
            if (index !== -1) {
              list[index] = resolvedFeedback;
            }
          };
          
          updateFeedbackList(state.myFeedbacks.items);
          updateFeedbackList(state.testFeedbacks.items);
          updateFeedbackList(state.allFeedbacks.items);
          
          if (state.feedbackDetails.data?.id === resolvedFeedback.id) {
            state.feedbackDetails.data = resolvedFeedback;
          }
        }
      })
      .addCase(resolveFeedback.rejected, (state, action) => {
        state.resolution.loading = false;
        state.resolution.error = action.payload?.message || 'Đã xảy ra lỗi khi xử lý phản hồi';
        showErrorToast(state.resolution.error);
      });
  }
});

export const { resetSubmission, resetResolution, setTestId } = feedbackSlice.actions;

export default feedbackSlice.reducer;