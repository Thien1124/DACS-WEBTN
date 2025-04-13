import { createSlice } from '@reduxjs/toolkit';
import { mockExam, mockExamResult } from '../data/mockExamData';

// Mô phỏng async thunks cho testing UI
export const fetchExamWithQuestions = () => {
  return async (dispatch) => {
    dispatch(setLoading(true));
    
    try {
      // Giả lập trễ mạng
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set dữ liệu mẫu từ mockExam
      dispatch(setCurrentExam(mockExam));
      dispatch(setExamQuestions(mockExam.questions));
      return mockExam;
    } catch (error) {
      dispatch(setError('Không thể tải bài thi'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const startExamSession = () => {
  return async (dispatch) => {
    dispatch(setLoading(true));
    
    try {
      // Giả lập trễ mạng
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Tính thời gian bắt đầu và kết thúc
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + mockExam.duration * 60 * 1000);
      
      const examWithTime = {
        ...mockExam,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      };
      
      dispatch(setCurrentExam(examWithTime));
      return { success: true, exam: examWithTime };
    } catch (error) {
      dispatch(setError('Không thể bắt đầu bài thi'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };
};

export const submitExamAnswers = () => {
  return async (dispatch, getState) => {
    dispatch(setLoading(true));
    
    try {
      // Giả lập trễ mạng
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { userAnswers } = getState().exams;
      
      // Tính toán các câu trả lời đúng
      const correctCount = mockExam.questions.reduce((count, question) => {
        if (userAnswers[question.id] === question.correctOption) {
          return count + 1;
        }
        return count;
      }, 0);
      
      // Tính điểm
      const score = Math.round((correctCount / mockExam.questions.length) * 100);
      
      // Tạo kết quả bài thi
      const result = {
        ...mockExamResult,
        score,
        totalCorrect: correctCount,
        totalQuestions: mockExam.questions.length,
        completedAt: new Date().toISOString(),
        // Chuyển đổi câu trả lời từ những gì người dùng đã chọn
        answers: Object.keys(userAnswers).map(questionId => {
          const qId = parseInt(questionId);
          const question = mockExam.questions.find(q => q.id === qId);
          
          return {
            questionId: qId,
            selectedOption: userAnswers[qId],
            isCorrect: question?.correctOption === userAnswers[qId]
          };
        })
      };
      
      dispatch(setExamResult(result));
      return result;
      
    } catch (error) {
      dispatch(setError('Không thể nộp bài'));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };
};

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
    setCurrentExam: (state, action) => {
      state.currentExam = action.payload;
    },
    setExamQuestions: (state, action) => {
      state.examQuestions = action.payload;
    },
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
    setExamResult: (state, action) => {
      state.examResult = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearCurrentExam: (state) => {
      state.currentExam = null;
      state.examQuestions = [];
    }
  }
});

export const { 
  setCurrentExam, 
  setExamQuestions, 
  setUserAnswer, 
  resetUserAnswers,
  setExamResult,
  setLoading,
  setError,
  clearCurrentExam
} = examSlice.actions;

export default examSlice.reducer;