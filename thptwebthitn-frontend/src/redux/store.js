import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import uiReducer from './uiSlice';
import examReducer from './examSlice';
import subjectReducer from './subjectSlice';
import userReducer from './userSlice';
import authMiddleware from './middleware/authMiddleware';


const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    exams: examReducer,
    subjects: subjectReducer,
    users: userReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authMiddleware) // Only add your custom middleware
});

export default store;