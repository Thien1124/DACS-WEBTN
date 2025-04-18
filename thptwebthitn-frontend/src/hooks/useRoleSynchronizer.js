import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../redux/authSlice'; // Giả sử bạn có action này

export default function useRoleSynchronizer() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    const synchronizeRole = () => {
      if (!user) return;
      
      const storedUserData = JSON.parse(localStorage.getItem('user_data'));
      const storedRole = localStorage.getItem('user_role');
      
      // Kiểm tra nếu có sự khác biệt giữa Redux và localStorage
      if (storedUserData && storedRole && user.role !== storedRole) {
        console.log('Đồng bộ hóa role từ localStorage:', storedRole);
        dispatch(updateUser({
          ...user,
          role: storedRole
        }));
      } else if (storedUserData && user.role && user.role !== storedUserData.role) {
        // Đồng bộ ngược từ Redux xuống localStorage
        localStorage.setItem('user_role', user.role);
        localStorage.setItem('user_data', JSON.stringify({
          ...storedUserData,
          role: user.role
        }));
      }
    };
    
    synchronizeRole();
    
    // Cài đặt listener cho storage events (nếu thay đổi từ tab khác)
    const handleStorageChange = (e) => {
      if (e.key === 'user_role' || e.key === 'user_data') {
        synchronizeRole();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, dispatch]);
}