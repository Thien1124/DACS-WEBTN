import { configureStore } from '@reduxjs/toolkit';
import quizReducer from './quizSlice';
import uiReducer from './uiSlice';

const store = configureStore({
  reducer: {
    quiz: quizReducer,
    ui: uiReducer,
  },
});

export default store;