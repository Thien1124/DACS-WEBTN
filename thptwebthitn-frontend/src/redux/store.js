import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
  },
});

// If you need these types, convert the file to .ts extension
// For JS files, you can export the state and dispatch without type annotations
export const RootState = store.getState;
export const AppDispatch = store.dispatch;