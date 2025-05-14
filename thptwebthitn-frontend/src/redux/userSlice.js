import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as userService from '../services/userService';
import apiClient from '../services/apiClient';
export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (params) => {
    const response = await userService.getUsers(params);
    return response;
  }
);

export const updateUserRole = createAsyncThunk(
  'users/updateRole',
  async ({ userId, roles }) => {
    const response = await userService.updateUserRoles(userId, roles);
    return response;
  }
);

export const updateUserStatus = createAsyncThunk(
  'users/updateStatus',
  async ({ userId, isActive }) => {
    const response = await userService.updateUserStatus(userId, isActive);
    return { userId, isActive, ...response };
  }
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (userId) => {
    await userService.deleteUser(userId);
    return userId;
  }
);

export const fetchSystemInfo = createAsyncThunk(
  'users/fetchSystemInfo',
  async () => {
    const response = await userService.getSystemInfo();
    return response;
  }
);

// Add this new action to your userSlice.js file

export const fetchUsersList = createAsyncThunk(
  'users/fetchUsersList',
  async ({ page = 1, pageSize = 100, role = 'Student', grade = '' }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/api/User/list', {
        params: {
          page,
          pageSize,
          role,
          grade: grade || undefined // Only include grade if it's not empty
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    systemInfo: null,
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0
    }
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Update user role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const index = state.list.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      
      // Update user status
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const index = state.list.findIndex(user => user.id === action.payload.userId);
        if (index !== -1) {
          state.list[index].isActive = action.payload.isActive;
        }
      })
      
      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter(user => user.id !== action.payload);
      })
      
      // Fetch system info
      .addCase(fetchSystemInfo.fulfilled, (state, action) => {
        state.systemInfo = action.payload;
      })
      
      // Fetch users list
      .addCase(fetchUsersList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsersList.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsersList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  }
});

export default userSlice.reducer;