import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as examService from '../services/examService';
import { getExams } from '../services/examService';
import { normalizeApiResponse } from '../utils/apiUtils';
import apiClient from '../services/apiClient';
// Async thunks
export const fetchExams = createAsyncThunk(
  'exams/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      console.log('Fetching exams with params:', params);
      const response = await apiClient.get('/api/Exam', { params });
      console.log('Raw API response:', response);
      
      // Normalize exam objects to ensure consistent properties
      const normalizedData = {
        ...response.data,
        data: Array.isArray(response.data.data) 
          ? response.data.data.map(exam => ({
              ...exam,
              // Ensure these fields always exist with proper boolean values
              isActive: exam.isActive === true,
              isApproved: exam.isApproved === true
            }))
          : []
      };
      
      return normalizedData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thêm thunk action cho việc lấy đề thi theo môn học với tên endpoint chính xác

export const fetchExamsBySubject = createAsyncThunk(
  'exams/fetchBySubject',
  async (params, { rejectWithValue }) => {
    try {
      return await examService.getExamsBySubject(params);
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


// Add this to your fetchExamDetails action in examSlice.js
export const fetchExamDetails = createAsyncThunk(
  'exams/fetchById',
  async (examId, { rejectWithValue }) => {
    try {
      console.log(`Fetching exam details for ID: ${examId}`);
      const response = await apiClient.get(`/api/Exam/${examId}`);
      console.log('Raw API response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching exam details:', error);
      return rejectWithValue(error.response?.data?.message || 'Could not fetch exam details');
    }
  }
);

// Tìm hàm fetchExamWithQuestions và kiểm tra
export const fetchExamWithQuestions = createAsyncThunk(
  'exams/fetchExamWithQuestions',
  async (examId, { rejectWithValue }) => {
    try {
      // Thay đổi URL nếu cần thiết - đảm bảo đúng API endpoint
      const response = await apiClient.get(`/api/Exam/WithQuestions/${examId}`);
      console.log('API response:', response.data); // Debug để kiểm tra dữ liệu
      return response.data;
    } catch (error) {
      console.error('Error fetching exam questions:', error);
      return rejectWithValue(error.response?.data || 'Không thể lấy thông tin đề thi');
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

// Update just the duration of an exam
export const updateExamDuration = createAsyncThunk(
  'exams/updateDuration',
  async ({ examId, duration }, { rejectWithValue, getState }) => {
    try {
      // First, get the current exam to preserve other fields
      const { exams } = getState();
      const currentExam = exams.list.find(exam => exam.id === examId);
      
      if (!currentExam) {
        return rejectWithValue('Không tìm thấy đề thi');
      }
      
      // Only update the duration field, keeping all other fields the same
      const updatedExam = {
        ...currentExam,
        duration
      };
      
      // Use the general exam update endpoint
      // Replace line 179
const response = await examService.updateExam(examId, updatedExam);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật thời gian làm bài');
    }
  }
);

// Add this action to your existing examSlice

// Sửa action approveExam
export const approveExam = createAsyncThunk(
  'exams/approveExam',
  async ({ examId, comment }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/api/Exam/${examId}/approve`, { 
        comment 
      });
      
      console.log('Redux approve response:', response);
      
      // Return normalized data
      return {
        examId,
        approved: true,
        comment
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Thêm action updateExam

export const updateExam = createAsyncThunk(
  'exams/updateExam',
  async (examData, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/api/Exam/${examData.id}`, examData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Không thể cập nhật đề thi';
      return rejectWithValue(errorMessage);
    }
  }
);

// Sửa action updateExamVisibility
export const updateExamVisibility = createAsyncThunk(
  'exams/updateVisibility',
  async ({ examId, isPublic }, { rejectWithValue }) => {
    try {
      console.log('updateVisibility with params:', { examId, isPublic });
      const status = isPublic ? 'published' : 'draft';
      
      const response = await apiClient.patch(`/api/Exam/${examId}/status`, {
        status: status
      });
      
      console.log('Raw visibility update response:', response);
      
      // Đảm bảo response luôn có trường status
      const enhancedResponse = {
        ...response.data,
        status: status,
        id: examId
      };
      
      return enhancedResponse;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || `Không thể cập nhật trạng thái hiển thị của đề thi`
      );
    }
  }
);

// Thêm vào phần createSlice để xử lý trạng thái tốt hơn
const initialState = {
  list: [], // Đảm bảo list luôn là một mảng
  currentExam: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },
  // ... other initial state properties
};

const examSlice = createSlice({
  name: 'exams',
  initialState,
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
      .addCase(fetchExams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExams.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        
        // Xử lý dữ liệu từ API
        if (action.payload && typeof action.payload === 'object') {
          // Lưu totalCount và thông tin phân trang
          state.totalCount = action.payload.totalCount || 0;
          state.currentPage = action.payload.page || 1;
          state.pageSize = action.payload.pageSize || 10;
          state.totalPages = action.payload.totalPages || 1;
          
          // Lưu danh sách đề thi
          if (Array.isArray(action.payload.data)) {
            state.list = action.payload.data;
          } else if (Array.isArray(action.payload)) {
            state.list = action.payload;
          } else {
            state.list = [];
          }
          
          console.log('Exams loaded:', state.list.length, 'Total count:', state.totalCount);
        }
      })
      .addCase(fetchExams.rejected, (state, action) => {
        state.loading = false;
        // Giữ lại dữ liệu cũ nếu có lỗi, nhưng báo lỗi
        state.error = action.payload || action.error?.message || 'Không thể lấy danh sách đề thi';
        console.error("Failed to fetch exams:", state.error);
        // Không nên xóa state.list ở đây để tránh mất dữ liệu khi refresh lỗi
        // state.list = [];
      })
      // Các trường hợp khác...
      // Xử lý fetchExamsBySubject
      .addCase(fetchExamsBySubject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExamsBySubject.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        
        console.log('API response for exams by subject:', action.payload);
        
        // Handle different response structures
        if (action.payload?.items) {
          // If API returns paginated data
          state.list = action.payload.items;
          state.totalItems = action.payload.totalCount || 0;
          state.currentPage = action.payload.currentPage || 1;
          state.totalPages = action.payload.totalPages || 1;
        } else if (action.payload?.data) {
          // Structure with data property
          state.list = action.payload.data;
          state.totalItems = action.payload.totalCount || action.payload.data.length;
        } else if (Array.isArray(action.payload)) {
          // If API returns direct array
          state.list = action.payload;
          state.totalItems = action.payload.length;
        } else {
          console.warn('Unknown API response structure', action.payload);
          state.list = [];
          state.totalItems = 0;
        }
      })
      .addCase(fetchExamsBySubject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Không thể tải danh sách đề thi. Vui lòng thử lại sau.';
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
        console.log('Setting currentExam with data:', action.payload);
        state.loading = false;
        state.error = null;
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
        
        // Điều chỉnh cấu trúc dữ liệu dựa trên API trả về
        // Nếu API trả về {exam: {...}, questions: [...]}
        state.currentExam = action.payload.exam || action.payload;
        state.examQuestions = action.payload.questions || [];
        
        console.log('Updated state:', {
          currentExam: state.currentExam,
          examQuestions: state.examQuestions
        });
      })
      .addCase(fetchExamWithQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Không thể tải câu hỏi của đề thi';
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
      })
      
      // Xử lý updateExamDuration
      .addCase(updateExamDuration.fulfilled, (state, action) => {
        const index = state.list.findIndex(exam => exam.id === action.payload.id);
        if (index !== -1) {
          state.list[index].duration = action.payload.duration;
        }
      })
      
      // Add the case in the extraReducers of your examSlice
      .addCase(approveExam.fulfilled, (state, action) => {
        // Find and update the exam in the list
        const exam = state.list.find(exam => exam.id === action.payload.examId);
        if (exam) {
          exam.isApproved = true;
          console.log('Redux state updated for exam approval:', exam);
        }
        
        state.loading = false;
      })
      
      // Trong reducers, thêm case xử lý updateExam
      .addCase(updateExam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExam.fulfilled, (state, action) => {
        state.loading = false;
        // Cập nhật đề thi trong danh sách
        const index = state.list.findIndex(exam => exam.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        // Cập nhật currentExam nếu đang xem
        if (state.currentExam && state.currentExam.id === action.payload.id) {
          state.currentExam = action.payload;
        }
      })
      .addCase(updateExam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Trong file src/redux/examSlice.js
      .addCase(updateExamVisibility.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        
        if (state.list && Array.isArray(state.list)) {
          const index = state.list.findIndex(exam => exam.id === action.payload.id);
          if (index !== -1) {
            state.list[index] = {
              ...state.list[index],
              ...action.payload
            };
          }
        }
        
        if (state.currentExam && state.currentExam.id === action.payload.id) {
          state.currentExam = {
            ...state.currentExam,
            ...action.payload
          };
        }
      });
  }
});

export const { setUserAnswer, resetUserAnswers, clearCurrentExam, clearExamResult } = examSlice.actions;
export default examSlice.reducer;