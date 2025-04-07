import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken, getUserData } from '../../utils/auth';

/**
 * Bảo vệ route chỉ cho phép người dùng có quyền nhất định truy cập
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child component to render if authorized
 * @param {string|string[]} props.role - Required role(s) to access this route
 */
const ProtectedRoute = ({ children, role }) => {
  const location = useLocation();
  const token = getToken();
  const userData = getUserData();
  
  // Kiểm tra đăng nhập
  if (!token || !userData) {
    // Redirect to login with return URL
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`} replace />;
  }
  
  // Kiểm tra quyền truy cập
  const hasRequiredRole = () => {
    if (!role) return true; // Không yêu cầu role cụ thể
    
    if (Array.isArray(role)) {
      // Nhiều role được chấp nhận
      return role.some(r => userData.roles?.includes(r));
    } else {
      // Một role duy nhất
      return userData.roles?.includes(role);
    }
  };
  
  if (!hasRequiredRole()) {
    // Không có quyền, chuyển về trang chủ hoặc trang lỗi
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Đã đăng nhập và có đủ quyền
  return children;
};

export default ProtectedRoute;