import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showSuccessToast } from '../utils/toastUtils';
import * as authService from '../services/authService';
import { logout as logoutAction } from '../redux/authSlice';

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Tạo hàm logout chuẩn cho toàn bộ ứng dụng
  const handleLogout = useCallback(async () => {
    // 1. Set cờ để đánh dấu đang đăng xuất thủ công
    sessionStorage.setItem('manual_logout', 'true');
    
    // 2. Hiển thị thông báo thành công
    showSuccessToast('Đăng xuất thành công');
    
    // 3. Gọi API logout để hủy token trên server
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Vẫn tiếp tục quá trình đăng xuất ngay cả khi API lỗi
    }
    
    // 4. Xóa tất cả thông tin xác thực khỏi localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('remember_me');
    
    // 5. Cập nhật trạng thái Redux
    dispatch(logoutAction());
    
    // 6. Chuyển hướng về trang chủ
    navigate('/');
    
    // 7. QUAN TRỌNG: Tải lại trang sau một khoảng thời gian ngắn
    setTimeout(() => {
      window.location.reload();
    }, 300);
    
    // Trả về true để chỉ ra rằng đăng xuất thành công
    return true;
  }, [dispatch, navigate]);

  return { logout: handleLogout };
};