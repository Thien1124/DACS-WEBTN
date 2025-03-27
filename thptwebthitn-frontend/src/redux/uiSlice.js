import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentAnimation: 'idle',
  theme: 'light',
  isMenuVisible: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setAnimation: (state, action) => {
      state.currentAnimation = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    toggleMenu: (state) => {
      state.isMenuVisible = !state.isMenuVisible;
    },
  },
});

export const { setAnimation, toggleTheme, toggleMenu } = uiSlice.actions;
export default uiSlice.reducer;