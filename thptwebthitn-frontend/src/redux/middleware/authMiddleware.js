import { showErrorToast } from '../../utils/toastUtils';
import { refreshToken } from '../../services/authService';
import { isTokenExpired } from '../../utils/token';
import { tokenRefreshed, logout } from '../authSlice';

// Middleware để xử lý token
export const authMiddleware = store => next => async action => {
  // Nếu action là một promise (thunk) và không phải là action auth
  if (typeof action === 'function' && !action.type?.startsWith('auth/')) {
    const state = store.getState();
    const token = state.auth?.token;
    
    // Nếu có token và token đã hết hạn, thử refresh trước khi thực hiện action
    if (token && isTokenExpired(token)) {
      try {
        console.log('Token expired, attempting to refresh before action');
        
        // Thử refresh token
        const { token: newToken } = await refreshToken();
        
        // Dispatch action cập nhật token
        store.dispatch(tokenRefreshed({ token: newToken }));
        
        // Tiếp tục với action sau khi refresh thành công
        return next(action);
      } catch (error) {
        console.error('Token refresh failed in middleware:', error);
        
        // Nếu refresh thất bại, đăng xuất người dùng
        store.dispatch(logout());
        
        // Hiển thị thông báo
        showErrorToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        
        // Không tiếp tục action ban đầu
        return;
      }
    }
  }
  
  // Xử lý lỗi 401 từ các action bị rejected
  if (action.type?.endsWith('/rejected') && action.payload?.status === 401) {
    // Hiển thị thông báo nhưng không tự động chuyển hướng
    showErrorToast('Phiên đăng nhập đã hết hạn hoặc không hợp lệ.', () => {
      // Đăng xuất và chuyển hướng sau khi đóng toast
      store.dispatch(logout());
      window.location.href = '/';
    });
  }
  
  // Mọi trường hợp khác, cho phép action tiếp tục bình thường
  return next(action);
};

export default authMiddleware;