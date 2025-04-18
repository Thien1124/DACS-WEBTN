import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout } from '../redux/authSlice';
import * as authService from '../services/authService';
import { showErrorToast } from '../utils/toastUtils';
import authConfig from '../config/authConfig';
// Tạo context cho Auth
export const AuthContext = createContext(null);

// Hook dùng để truy cập context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [tokenRefreshTimer, setTokenRefreshTimer] = useState(null);

  // Hàm kiểm tra JWT token có hợp lệ không
  const checkTokenValidity = (token) => {
    if (!token) return false;
    
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp * 1000; // Chuyển sang milliseconds
      return Date.now() < exp;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  // Hàm lấy thời gian hết hạn của token
  const getTokenExpiration = (token) => {
    try {
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1]));
      return payload.exp * 1000; // Chuyển sang milliseconds
    } catch (error) {
      return null;
    }
  };

  // Hàm tự động refresh token
  const setupTokenRefresh = () => {
    // Xóa timer cũ
    if (tokenRefreshTimer) {
      clearTimeout(tokenRefreshTimer);
    }
    
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    
    // Nếu token không hợp lệ, đăng xuất luôn
    if (!checkTokenValidity(token)) {
      console.log('Token không hợp lệ, tiến hành đăng xuất');
      dispatch(logout());
      return;
    }
    
    // Lấy thời gian hết hạn và thiết lập refresh trước 1 phút
    const expTime = getTokenExpiration(token);
    if (!expTime) return;
    
    const currentTime = Date.now();
    const timeUntilRefresh = expTime - currentTime - (60 * 1000); // Refresh trước 1 phút
    
    // Nếu thời gian refresh hợp lý, thiết lập timer
    if (timeUntilRefresh > 0) {
      console.log(`Token sẽ được refresh sau ${Math.round(timeUntilRefresh/1000)} giây`);
      
      const timer = setTimeout(async () => {
        try {
          // Thực hiện refresh token
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const response = await authService.refreshToken(refreshToken);
            
            console.log('Token refreshed successfully:', response);
            
            if (response.token) {
              localStorage.setItem('auth_token', response.token);
              if (response.refreshToken) {
                localStorage.setItem('refresh_token', response.refreshToken);
              }
              
              // Thiết lập timer mới
              setupTokenRefresh();
            }
          }
        } catch (error) {
          console.error('Failed to refresh token:', error);
          // Đăng xuất nếu không thể refresh
          dispatch(logout());
        }
      }, timeUntilRefresh);
      
      setTokenRefreshTimer(timer);
    } else {
      console.log('Token đã hết hạn hoặc sắp hết hạn, tiến hành đăng xuất');
      dispatch(logout());
    }
  };

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
    try{
      const manualLogout = sessionStorage.getItem('manual_logout') === 'true';
      if (manualLogout) {
        // Xóa biến này để không ảnh hưởng lần sau
        sessionStorage.removeItem('manual_logout');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('remember_me');
          
        // Đảm bảo không cố gắng đăng nhập lại
        setLoading(false);
        return;
      }
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setLoading(false);
          return;
        }
        
        if (!checkTokenValidity(token)) {
          // Thử refresh token nếu có
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const response = await authService.refreshToken(refreshToken);
              if (response.token) {
                // Lưu token mới và cập nhật state
                localStorage.setItem('auth_token', response.token);
                if (response.refreshToken) {
                  localStorage.setItem('refresh_token', response.refreshToken);
                }
                
                // Lấy thông tin user
                const userData = await authService.getCurrentUser();
                
                dispatch(loginSuccess({
                  user: userData,
                  token: response.token
                }));
              }
            } catch (refreshError) {
              console.error('Failed to refresh token during init:', refreshError);
              // Nếu không refresh được, xóa thông tin đăng nhập
              localStorage.removeItem('auth_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user_data');
            }
          } else {
            // Không có refresh token, xóa thông tin đăng nhập
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
          }
        } else {
          // Token còn hạn, thiết lập trạng thái đăng nhập
          try {
            const userData = await authService.getCurrentUser();
              if (userData) {
                // Đảm bảo lưu role vào localStorage
                const userRole = userData.role || (userData.roles && userData.roles.length > 0 ? userData.roles[0] : null);
                if (userRole) {
                  localStorage.setItem('user_data', JSON.stringify({
                    ...userData,
                    role: userRole
                  }));
                  localStorage.setItem('user_role', userRole); // Thêm dòng này để đảm bảo nhất quán
                }
                
                dispatch(loginSuccess({
                  user: {
                    ...userData,
                    role: userRole
                  },
                  token
                }));
              }
          } catch (error) {
            console.error('Error getting current user:', error);
            // Nếu có lỗi, xóa thông tin đăng nhập
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_data');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
        // Thiết lập refresh token timer
        setupTokenRefresh();
      }
    };
    
    checkAuthStatus();
    
    return () => {
      // Cleanup
      if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
      }
    };
  }, [dispatch]);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // Đọc từ localStorage trước
          const storedUserData = JSON.parse(localStorage.getItem('user_data'));
          const storedRole = localStorage.getItem('user_role');
          
          if (storedUserData) {
            // Đặt role ưu tiên từ user_role nếu có, nếu không thì lấy từ userData
            const role = storedRole || storedUserData.role || 
              (storedUserData.roles && storedUserData.roles[0]) || 'Student';
            
            // Cập nhật Redux store với thông tin từ localStorage
            dispatch(loginSuccess({
              user: { ...storedUserData, role },
              token
            }));
            
            console.log('Auth restored from localStorage, role:', role);
          }
          
          // Sau đó cập nhật từ server nếu cần
          const userData = await authService.getCurrentUser();
          if (userData) {
            const userRole = userData.role || 
              (userData.roles && userData.roles.length > 0 ? userData.roles[0] : storedRole);
            
            // Lưu vào localStorage
            const userToSave = { ...userData, role: userRole };
            localStorage.setItem('user_data', JSON.stringify(userToSave));
            localStorage.setItem('user_role', userRole);
            
            // Cập nhật Redux store
            dispatch(loginSuccess({
              user: userToSave,
              token
            }));
            
            console.log('Auth refreshed from server, role:', userRole);
          }
        } catch (error) {
          console.error('Error during auth initialization:', error);
          // Không xóa localStorage/logout ở đây để tránh vòng lặp
        }
      }
    };
    
    initializeAuth();
  }, [dispatch]);
  
  return (
    <AuthContext.Provider value={{ loading, setupTokenRefresh }}>
      {children}
    </AuthContext.Provider>
  );
};