import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import Header from '../layout/Header';
import ConfirmModal from '../common/ConfirmModal';
import { FaSearch, FaEdit, FaTrash, FaUserShield, FaFilter, FaChartPie, FaSync } from 'react-icons/fa';
import apiClient from '../../services/apiClient';
import { getUsers, updateUserRoles } from '../../services/userService';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex-grow: 1;
  padding-top: 80px; // Đủ khoảng cách để không bị che bởi header
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  margin: 0;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const SearchContainer = styled.div`
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  border-radius: 8px;
  padding: 0 1rem;
  flex: 1;
  max-width: 500px;
  height: 42px;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  
  svg {
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
    margin-right: 0.5rem;
  }
  
  input {
    background: transparent;
    border: none;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
    font-size: 1rem;
    width: 100%;
    outline: none;
  }
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-bottom: 2rem;
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const TableHeader = styled.thead`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  
  th {
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  }
`;

const TableBody = styled.tbody`
  tr {
    border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
    
    &:hover {
      background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
    }
  }
  
  td {
    padding: 1rem;
  }
`;

const Badge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  
  ${props => {
    switch(props.role?.toLowerCase()) {
      case 'admin':
        return `
          background-color: #fed7d7;
          color: #742a2a;
        `;
      case 'teacher':
        return `
          background-color: #c6f6d5;
          color: #22543d;
        `;
      case 'student':
        return `
          background-color: #e9d8fd;
          color: #553c9a;
        `;
      default:
        return `
          background-color: #e2e8f0;
          color: #2d3748;
        `;
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &.edit {
    background-color: #4299e1;
    color: white;
    
    &:hover {
      background-color: #3182ce;
    }
  }
  
  &.delete {
    background-color: #e53e3e;
    color: white;
    
    &:hover {
      background-color: #c53030;
    }
  }
  
  &.role {
    background-color: #805ad5;
    color: white;
    
    &:hover {
      background-color: #6b46c1;
    }
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid ${props => props.active 
    ? '#4285f4' 
    : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.active 
    ? '#4285f4' 
    : 'transparent'};
  color: ${props => props.active 
    ? '#ffffff' 
    : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  font-weight: 500;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active 
      ? '#3b78e7' 
      : props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const ModalBody = styled.div`
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1rem;
  outline: none;
  
  &:focus {
    border-color: #4285f4;
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.cancel {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
  
  &.confirm {
    background-color: #4285f4;
    color: white;
    
    &:hover {
      background-color: #3b78e7;
    }
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .icon {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: ${props => props.color || '#4285f4'};
  }
  
  .count {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  .label {
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  }
`;

// Filter
const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterLabel = styled.span`
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: auto;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#718096' : '#e2e8f0'};
  }
`;

const UserManagement = () => {
  const { theme } = useSelector(state => state.ui || { theme: 'light' });
  const { token, user: currentUser } = useSelector(state => state.auth || { token: null, user: null });
  const dispatch = useDispatch();
  
  // State cho danh sách người dùng và phân trang
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // State cho tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // State cho modal phân quyền
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  
  // Thống kê người dùng
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    adminCount: 0,
    teacherCount: 0,
    studentCount: 0
  });
  
  // Fetch danh sách người dùng
  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, roleFilter]);
  
  // Hàm fetch API danh sách người dùng
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching users...");
      
      // Log token để debug
      const authToken = localStorage.getItem('auth_token');
      console.log('Auth token exists:', !!authToken);
      if (authToken) {
        console.log('Token last 5 chars:', authToken.slice(-5));
      }
      
      // Xây dựng params
      const params = {
        page: currentPage,
        pageSize: pageSize
      };
      
      // Thêm role vào params nếu có
      if (roleFilter) {
        params.role = roleFilter;
      }
      
      // Debug trực tiếp endpoint để xem response
      try {
        const directResponse = await fetch(`http://localhost:5006/api/User/list?page=${currentPage}&pageSize=${pageSize}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Direct API call status:', directResponse.status);
        if (directResponse.ok) {
          const directData = await directResponse.json();
          console.log('Direct API response:', directData);
        }
      } catch (directErr) {
        console.error('Direct API call error:', directErr);
      }
      
      // Gọi API qua service
      console.log('Calling getUsers service...');
      const result = await getUsers(params);
      console.log('getUsers result:', result);
      
      // Xử lý kết quả
      if (result) {
        // Kiểm tra có property items và đó là mảng
        if (result.items && Array.isArray(result.items)) {
          setUsers(result.items);
          setTotalPages(result.totalPages || 1);
          setTotalUsers(result.totalItems || result.items.length);
          calculateUserStats(result.items);
          console.log(`Loaded ${result.items.length} users`);
        } 
        // Nếu result là mảng
        else if (Array.isArray(result)) {
          setUsers(result);
          setTotalPages(1);
          setTotalUsers(result.length);
          calculateUserStats(result);
          console.log(`Loaded ${result.length} users (array format)`);
        }
        // Trường hợp result là object khác
        else {
          console.warn('Unexpected result format:', result);
          
          // Thử tạo mảng từ object nếu có thể
          const userArray = Object.values(result).filter(item => 
            item && typeof item === 'object' && item.username
          );
          
          if (userArray.length > 0) {
            setUsers(userArray);
            setTotalPages(1);
            setTotalUsers(userArray.length);
            calculateUserStats(userArray);
            console.log(`Created user array from object with ${userArray.length} items`);
          } else {
            setError("Không nhận được dữ liệu người dùng từ API");
            setUsers([]);
          }
        }
      } else {
        setError("API không trả về dữ liệu");
        setUsers([]);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      
      // Phân tích chi tiết lỗi
      if (err.response) {
        // Server trả về response với status code nằm ngoài phạm vi 2xx
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
        
        if (err.response.status === 401) {
          setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
        } else if (err.response.status === 403) {
          setError("Bạn không có quyền truy cập vào tài nguyên này");
        } else if (err.response.status === 404) {
          setError("API endpoint không tồn tại");
        } else {
          setError(`Lỗi máy chủ: ${err.response.status} - ${err.response.data?.message || err.message}`);
        }
      } else if (err.request) {
        // Request đã được gửi nhưng không nhận được response
        console.error('Error request:', err.request);
        setError("Không nhận được phản hồi từ máy chủ");
      } else {
        // Có lỗi khi thiết lập request
        console.error('Error message:', err.message);
        setError(`Lỗi: ${err.message}`);
      }
      
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Tính toán thống kê người dùng
  const calculateUserStats = useCallback((userList) => {
    // Nếu không có dữ liệu thống kê phía server, tính toán thủ công
    const stats = {
      totalUsers: userList.length,
      adminCount: userList.filter(user => user.role === 'Admin').length,
      teacherCount: userList.filter(user => user.role === 'Teacher').length,
      studentCount: userList.filter(user => user.role === 'Student').length
    };
    setUserStats(stats);
  }, []);
  
  // Hàm xử lý tìm kiếm
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Reset về trang đầu tiên khi tìm kiếm không cần thiết vì chúng ta đang lọc dữ liệu đã tải
  };
  
  // Hàm xử lý lọc theo vai trò
  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi bộ lọc
  };
  
  // Hàm xử lý thay đổi trang
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  
  // Hàm mở modal phân quyền
  const handleOpenRoleModal = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setShowRoleModal(true);
  };
  
  // Hàm đóng modal phân quyền
  const handleCloseRoleModal = () => {
    setShowRoleModal(false);
    setSelectedUser(null);
    setSelectedRole('');
  };
  
  // Hàm xử lý thay đổi quyền
  const handleChangeRole = async () => {
    if (!selectedUser || !selectedRole) return;
    
    try {
      // Gọi API từ service
      await updateUserRoles(selectedUser.id, selectedRole);
      
      // Cập nhật danh sách người dùng
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          return { ...user, role: selectedRole };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      calculateUserStats(updatedUsers);
      
      showSuccessToast(`Đã thay đổi quyền của người dùng ${selectedUser.fullName} thành ${selectedRole}`);
      handleCloseRoleModal();
    } catch (err) {
      console.error("Error changing role:", err);
      showErrorToast(err.message || 'Không thể thay đổi quyền người dùng');
    }
  };
  
  
  
  
  
  
  // Lọc danh sách người dùng theo từ khóa tìm kiếm
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.username?.toLowerCase().includes(searchLower) ||
        user.fullName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    });
  }, [users, searchTerm]);
  
  // Lọc người dùng hiện tại khỏi danh sách nếu là Admin (để tránh tự xóa/thay đổi)
  const filteredAndProtectedUsers = useMemo(() => {
    if (currentUser?.role === 'Admin') {
      return filteredUsers.filter(u => u.id !== currentUser.id);
    }
    return filteredUsers;
  }, [filteredUsers, currentUser]);

  return (
    <PageContainer>
      <MainContent>
        <Container>
          <HeaderSection>
            <Title theme={theme}>Quản lý người dùng</Title>
            <RefreshButton theme={theme} onClick={fetchUsers}>
              <FaSync />
              Làm mới dữ liệu
            </RefreshButton>
          </HeaderSection>
          
          {/* Thống kê người dùng */}
          <StatsContainer>
            <StatCard theme={theme} color="#4285f4">
              <div className="icon">
                <FaChartPie />
              </div>
              <div className="count">{userStats.totalUsers}</div>
              <div className="label">Tổng người dùng</div>
            </StatCard>
            <StatCard theme={theme} color="#ea4335">
              <div className="icon">
                <FaUserShield />
              </div>
              <div className="count">{userStats.adminCount}</div>
              <div className="label">Admin</div>
            </StatCard>
            <StatCard theme={theme} color="#34a853">
              <div className="icon">
                <FaUserShield />
              </div>
              <div className="count">{userStats.teacherCount}</div>
              <div className="label">Giáo viên</div>
            </StatCard>
            <StatCard theme={theme} color="#fbbc05">
              <div className="icon">
                <FaUserShield />
              </div>
              <div className="count">{userStats.studentCount}</div>
              <div className="label">Học sinh</div>
            </StatCard>
          </StatsContainer>
          
          <SearchContainer>
            <SearchInput theme={theme}>
              <FaSearch />
              <input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </SearchInput>
          </SearchContainer>
          
          <FiltersContainer>
            <FilterLabel theme={theme}>
              <FaFilter style={{ marginRight: '0.5rem' }} /> Lọc theo vai trò:
            </FilterLabel>
            <FilterSelect 
              theme={theme} 
              value={roleFilter} 
              onChange={handleRoleFilterChange}
            >
              <option value="">Tất cả vai trò</option>
              <option value="Admin">Admin</option>
              <option value="Teacher">Giáo viên</option>
              <option value="Student">Học sinh</option>
            </FilterSelect>
          </FiltersContainer>
          
          <TableContainer>
            <UserTable theme={theme}>
              <TableHeader theme={theme}>
                <tr>
                  <th>ID</th>
                  <th>Tên đăng nhập</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </TableHeader>
              <TableBody theme={theme}>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center' }}>Đang tải dữ liệu...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'red' }}>{error}</td>
                  </tr>
                ) : filteredAndProtectedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center' }}>Không tìm thấy người dùng nào</td>
                  </tr>
                ) : (
                  filteredAndProtectedUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>
                        <Badge role={user.role}>{user.role}</Badge>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <ActionButtons>
                          <ActionButton
                            className="role"
                            onClick={() => handleOpenRoleModal(user)}
                            title="Phân quyền"
                          >
                            <FaUserShield />
                          </ActionButton>
                          <ActionButton
                            className="edit"
                            onClick={() => {/* Thêm chức năng sửa thông tin người dùng */}}
                            title="Chỉnh sửa"
                          >
                            <FaEdit />
                          </ActionButton>
                          
                        </ActionButtons>
                      </td>
                    </tr>
                  ))
                )}
              </TableBody>
            </UserTable>
          </TableContainer>
          
          {/* Phân trang */}
          {!loading && !error && totalPages > 1 && (
            <Pagination>
              <PageButton
                theme={theme}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt;
              </PageButton>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  // Hiển thị tất cả các trang nếu có 5 trang hoặc ít hơn
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  // Nếu đang ở gần đầu, hiển thị 5 trang đầu tiên
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  // Nếu đang ở gần cuối, hiển thị 5 trang cuối
                  pageNum = totalPages - 4 + i;
                } else {
                  // Nếu ở giữa, hiển thị 2 trang trước và 2 trang sau trang hiện tại
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <PageButton
                    key={pageNum}
                    theme={theme}
                    active={currentPage === pageNum}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </PageButton>
                );
              })}
              
              <PageButton
                theme={theme}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &gt;
              </PageButton>
            </Pagination>
          )}
          
          {/* Modal phân quyền */}
          {showRoleModal && (
            <Modal>
              <ModalContent theme={theme}>
                <ModalHeader>
                  <ModalTitle theme={theme}>Phân quyền người dùng</ModalTitle>
                </ModalHeader>
                <ModalBody>
                  <FormGroup>
                    <Label theme={theme}>Người dùng</Label>
                    <p>{selectedUser?.fullName} ({selectedUser?.username})</p>
                  </FormGroup>
                  <FormGroup>
                    <Label theme={theme}>Vai trò</Label>
                    <Select
                      theme={theme}
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Teacher">Giáo viên</option>
                      <option value="Student">Học sinh</option>
                    </Select>
                  </FormGroup>
                </ModalBody>
                <ButtonGroup>
                  <Button className="cancel" theme={theme} onClick={handleCloseRoleModal}>
                    Hủy bỏ
                  </Button>
                  <Button className="confirm" onClick={handleChangeRole}>
                    Lưu thay đổi
                  </Button>
                </ButtonGroup>
              </ModalContent>
            </Modal>
          )}
          
        </Container>
      </MainContent>
    </PageContainer>
  );
};

export default UserManagement;