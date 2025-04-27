import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import uiReducer from './uiSlice';
import examReducer from './examSlice';
import subjectReducer from './subjectSlice';
import userReducer from './userSlice';
import chapterReducer from './chapterSlice';
import authMiddleware from './middleware/authMiddleware';
import questionsReducer from './questionSlice'; // Fixed this path
import feedbackReducer from './feedbackSlice'; // Fixed this path

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    exams: examReducer,
    subjects: subjectReducer,
    users: userReducer,
    chapters: chapterReducer,
    questions: questionsReducer, 
    feedback: feedbackReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authMiddleware) // Only add your custom middleware
});

export default store;