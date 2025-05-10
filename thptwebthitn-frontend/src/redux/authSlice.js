import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as userService from '../services/userService';
import * as authService from '../services/authService';
// Thunk để cập nhật thông tin user


const initialState = {
  isAuthenticated: false,
  user: null, // Không đặt giá trị mặc định
  token: null,
  error: null,
  loading: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateToken: (state, action) => {
      state.token = action.payload;},
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      
      // Đảm bảo role luôn được đặt đúng
      const role = user.role || (user.roles && user.roles[0]) || localStorage.getItem('user_role');
      
      state.user = { ...user, role };
      state.token = token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      
      // Đồng bộ với localStorage
      localStorage.setItem('user_role', role);
      localStorage.setItem('user_data', JSON.stringify({ ...user, role }));
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
        state.user.avatarUrl = action.payload;
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
    },
    // Thêm action mới cho refresh token
    tokenRefreshed: (state, action) => {
      state.token = action.payload.token;
    }
  },
  extraReducers: (builder) => {
    builder
      // loginUser cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const existingRole = state.user?.role;
        state.isAuthenticated = true;
        state.user = action.payload.user = {
          ...action.payload.user,
          // Đảm bảo role luôn được duy trì
          role: existingRole || action.payload.user.role || 'Student'
        }
        state.token = action.payload.token;
        state.loading = false;
        state.error = null;
        
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // logoutUser cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.loading = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // autoLogin cases
      .addCase(autoLogin.pending, (state) => {
        state.loading = true;
      })
      .addCase(autoLogin.fulfilled, (state, action) => {
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = {
            ...action.payload.user,
            // Đảm bảo lưu role đúng
            role: action.payload.user.role || action.payload.user.roles?.[0] || 'Student'
          };
          state.token = action.payload.token;
        }
        state.loading = false;
      })
      .addCase(autoLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // updateUserProfile cases
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
  register,
  tokenRefreshed
} = authSlice.actions;
// Add a new action 
// to update user avatar

export const updateToken = (token) => ({
  type: 'auth/updateToken',
  payload: token
});
export const loginUser = createAsyncThunk(
  'Auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (error) {
      return rejectWithValue(error.message || 'Đăng nhập thất bại');
    }
  }
);
export const logoutUser = createAsyncThunk(
  'Auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      
      return await authService.logout();
    } catch (error) {
      return rejectWithValue(error.message || 'Đăng xuất thất bại');
    }
  }
);
export const autoLogin = createAsyncThunk(
  'Auth/autoLogin',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.validateAndAutoLogin();
    } catch (error) {
      return rejectWithValue(error.message || 'Đăng nhập tự động thất bại');
    }
  }
);
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
export const updateUserAvatar = (avatar) => ({
  type: '/api/User/avatar',
  payload: avatar
});

export default authSlice.reducer;