import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Cập nhật thời gian và người dùng hiện tại
const currentTime = "2025-04-08 10:30:14";
const currentUser = "vinhsonvlog";

const ProtectedRoute = ({ children, roles = [], role }) => {
  // QUAN TRỌNG: useSelector phải được gọi ở cấp cao nhất của component
  // KHÔNG đặt nó sau điều kiện if
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  // Log cho mục đích gỡ lỗi
  console.log(`ProtectedRoute check at ${currentTime} by ${currentUser}:`, {
    roles, 
    role,
    childrenType: children?.type?.name || 'Unknown',
    authState: { isAuthenticated, userRole: user?.role }
  });
  
  // === DEV MODE ===
  // Set thành true để bỏ qua kiểm tra xác thực trong quá trình phát triển
  const DEV_MODE = true;
  
  if (DEV_MODE) {
    console.log(`[${currentTime}] DEV MODE enabled - skipping authentication`);
    return children;
  }
  
  // === PRODUCTION MODE ===
  // Hooks đã được gọi trước tất cả các điều kiện rồi, nên phần này an toàn
  
  // Kiểm tra xác thực
  if (!isAuthenticated) {
    console.log(`User not authenticated, redirecting to login`);
    return <Navigate to="/login" replace />;
  }
  
  // Kiểm tra roles array
  if (roles && roles.length > 0) {
    const userRole = user?.role || '';
    console.log(`Checking roles: User role '${userRole}' against required roles:`, roles);
    
    const hasRequiredRole = roles.some(r => 
      userRole.toLowerCase() === r.toLowerCase()
    );
    
    if (!hasRequiredRole) {
      console.log(`User lacks required role, redirecting to unauthorized`);
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // Kiểm tra single role
  if (role && user?.role?.toLowerCase() !== role.toLowerCase()) {
    console.log(`User lacks required role '${role}', redirecting to unauthorized`);
    return <Navigate to="/unauthorized" replace />;
  }
  
  console.log(`Access granted to protected route`);
  return children;
};

export default ProtectedRoute;