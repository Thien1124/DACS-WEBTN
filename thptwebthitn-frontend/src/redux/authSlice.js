import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as userService from '../services/userService';

// Thunk để cập nhật thông tin user
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      // Gọi API cập nhật thông tin
      const response = await userService.updateUserProfile(profileData);
      
      // Kiểm tra dữ liệu trả về
      if (response && response.user) {
        return response.user; // Trả về dữ liệu người dùng đã cập nhật
      } else if (response) {
        return profileData; // Nếu API không trả về dữ liệu user, sử dụng dữ liệu đã gửi
      }
      
      return profileData;
    } catch (error) {
      console.error('Update profile error:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Cập nhật thông tin thất bại. Vui lòng thử lại.'
      );
    }
  }
);

const initialState = {
  isAuthenticated: false,
  user: {
    id: 1,
    fullName: 'Vinh Sơn',
    email: 'vinhsonvlog@example.com',
    role: 'Teacher', //  đổi thành 'Admin' hoặc 'Student' để test các vai trò khác
    isActive: true,
    phoneNumber: '0987654321'
  },
  token: null,
  error: null,
  loading: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      state.loading = false;
    },
    updateAvatar: (state, action) => {
      if (state.user) {
        state.user.avatar = action.payload;
      }
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload
        };
      }
    },
    register: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Xử lý updateUserProfile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        // Cập nhật trạng thái người dùng với dữ liệu mới
        if (state.user) {
          state.user = {
            ...state.user,
            ...(action.payload || {})
          };
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  updateUser, 
  updateAvatar, 
  register 
} = authSlice.actions;

// Add a new action to update user avatar
export const updateUserAvatar = (avatar) => ({
  type: '/api/User/avatar',
  payload: avatar
});

export default authSlice.reducer;