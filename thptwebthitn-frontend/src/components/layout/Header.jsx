import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toggleTheme, toggleMenu } from "../../redux/uiSlice";
import { logout } from "../../redux/authSlice";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/images/logo.png";
import AuthModal from "../Auth/AuthModal";
import * as authService from "../../services/authService";
import { toast } from "react-toastify";
import { updateUser } from '../../redux/authSlice';
import { FaUserCog,FaClipboardCheck , FaUsers, FaBell, FaClipboardList, FaBook, FaQuestion, FaChartBar, FaCog, FaHistory, FaChartLine, FaPuzzlePiece, FaComment, FaTrophy, FaFileAlt, FaQuestionCircle, FaUserGraduate, FaCommentDots, FaFileUpload, FaComments, FaFlag, FaSchool } from 'react-icons/fa';
import NotificationBadge from '../notifications/NotificationBadge';

// Styled components hiện tại...
const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: ${(props) =>
    props.theme === "dark" ? "#1e1e1e" : "#ffffff"};
  color: ${(props) => (props.theme === "dark" ? "#ffffff" : "#333333")};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 0.8rem 2rem;
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;

  img {
    height: 32px;
    margin-right: 10px;
  }
`;

const Nav = styled.nav`
  @media (max-width: 768px) {
    display: ${(props) => (props.isMenuVisible ? "flex" : "none")};
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: ${(props) =>
      props.theme === "dark" ? "#1e1e1e" : "#ffffff"};
    flex-direction: column;
    padding: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const NavItems = styled.ul`
  display: flex;
  justify-content: center;
  align-items: center;
  list-style: none;
  padding: 10;
  margin: 0;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const NavItem = styled.li`
  margin: 0 1rem;
  position: relative;

  @media (max-width: 768px) {
    margin: 0.5rem 0;
  }

  a {
    color: ${(props) => (props.theme === "dark" ? "#ffffff" : "#333333")};
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
    
    /* Add active state styling */
    &.active {
      color: #4285f4;
      font-weight: 600;
      
      /* Add underline indicator */
      &:after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 0;
        width: 100%;
        height: 3px;
        background-color: #4285f4;
        border-radius: 2px;
      }
    }

    &:hover {
      color: #4285f4;
    }
  }
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  color: ${(props) => (props.theme === "dark" ? "#ffffff" : "#333333")};
  font-size: 1.2rem;
  cursor: pointer;
  margin-left: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) =>
      props.theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"};
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const UserButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${(props) => (props.theme === "dark" ? "#ffffff" : "#333333")};
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 20px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${(props) =>
      props.theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"};
  }
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(45deg, #4285f4, #34a853);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  overflow: hidden; /* Add this to contain the image */
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserDropdown = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  width: 240px;
  background-color: ${(props) =>
    props.theme === "dark" ? "#2d2d2d" : "#ffffff"};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 8px;
  overflow: hidden;
  z-index: 1000;
  
  /* Add these properties for scrolling */
  max-height: 80vh; /* Limit height to 80% of viewport height */
  overflow-y: auto; /* Enable vertical scrolling */
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${(props) => props.theme === "dark" ? "#1e1e1e" : "#f1f1f1"};
    border-radius: 0 8px 8px 0;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme === "dark" ? "#4a4a4a" : "#c1c1c1"};
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${(props) => props.theme === "dark" ? "#555" : "#a8a8a8"};
  }
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  color: ${(props) => (props.theme === "dark" ? "#e0e0e0" : "#333333")};
  text-decoration: none;
  transition: background-color 0.2s;
  position: relative; /* Add this to enable positioning of badge */
  
  svg {
    margin-right: 10px;
    color: ${props => props.theme === "dark" ? "#4285f4" : "#4285f4"};
  }

  &:hover {
    background-color: ${(props) =>
      props.theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"};
  }
  
  /* Add this for the badge styling */
  .badge {
    position: absolute;
    top: 8px;
    right: 10px;
    font-size: 0.7rem;
    padding: 0.2em 0.45em;
  }
`;

const DropdownSeparator = styled.div`
  height: 1px;
  background-color: ${props => 
    props.theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"
  };
  margin: 8px 0;
`;

const DropdownSection = styled.div`
  padding: 8px 16px;
  font-size: 0.85rem;
  color: ${props => props.theme === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"};
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: bold;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 10px 16px;
  border: none;
  background: none;
  color: #e74c3c;
  cursor: pointer;
  transition: background-color 0.2s;
  
  svg {
    margin-right: 10px;
  }

  &:hover {
    background-color: ${(props) =>
      props.theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"};
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${(props) => (props.theme === "dark" ? "#ffffff" : "#333333")};
  font-size: 1.5rem;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) =>
      props.theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"};
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(45deg, #4285f4, #34a853);
  color: white;
  border: none;
  border-radius: 25px;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    background: linear-gradient(45deg, #fbbc05, #ea4335);
    transition: width 0.5s ease;
    z-index: 0;
  }

  &:hover:before {
    width: 100%;
  }

  span {
    position: relative;
    z-index: 1;
  }

  &:active {
    transform: translateY(2px);
  }
`;

const HeaderSpacer = styled.div`
  height: 4.5rem;
`;

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { theme, isMenuVisible } = useSelector((state) => state.ui);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Xử lý click bên ngoài dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showUserDropdown &&
        !event.target.closest(".user-dropdown-container")
      ) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserDropdown]);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleMenuToggle = () => {
    dispatch(toggleMenu());
  };

  const handleOpenAuthModal = () => {
    setShowAuthModal(true);
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  const handleToggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleLogout = () => {
    authService.logout();
    dispatch(logout());
    toast.info('Đã đăng xuất thành công', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
    navigate('/');
  };
  useEffect(() => {
    // Đồng bộ role từ localStorage
    const userData = JSON.parse(localStorage.getItem('user_data'));
    const storedRole = localStorage.getItem('user_role'); // Đọc trực tiếp từ user_role
    
    if (userData) {
      // Ưu tiên role từ user_role nếu có
      const role = storedRole || userData.role || (userData.roles && userData.roles[0]);
      if (role) {
        console.log('Synchronizing role from localStorage:', role);
        dispatch(updateUser({
          ...userData,
          role: role
        }));
      }
    }
  }, [dispatch]);
  
  // Kiểm tra xem người dùng có phải admin không
  const isAdmin = user && user.role && user.role.toLowerCase() === 'admin';
  
  // Kiểm tra xem người dùng có phải teacher không
  const isTeacher = user && user.role && user.role.toLowerCase() === 'teacher';
  
  // Định nghĩa đường dẫn tới trang bài thi tùy theo vai trò
  const examsPath = isAdmin ? '/admin/exams' : '/exams';

  // Hàm lấy chữ cái đầu của tên người dùng
  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  // Hàm lấy tên hiển thị
  const getDisplayName = () => {
    if (!user) return "Người dùng";
    return user.fullName || user.username || user.email?.split("@")[0] || "Người dùng";
  };

  // Callback sau khi đăng nhập thành công
  const handleLoginSuccess = () => {
    handleCloseAuthModal();
    navigate("/dashboard");
  };

  // Add this inside your Header function
  const isActive = (path) => {
    if (path === '/' && currentPath === '/') {
      return true;
    }
    // For other pages, check if the currentPath starts with the path
    // (allows for active states on nested routes)
    return path !== '/' && currentPath.startsWith(path);
  };

  // Add this function before the return statement
  useEffect(() => {
    const fetchAndUpdateUserData = async () => {
    if (isAuthenticated && user?.id && !user.avatarUrl) {
      try {
        // Just use the existing data from localStorage instead of making the API call
        const userData = JSON.parse(localStorage.getItem('user_data'));
        if (userData && userData.avatarUrl) {
          dispatch(updateUser({
            ...user,
            avatarUrl: userData.avatarUrl
          }));
        }
        // If you still need to fetch user data, use a different endpoint that supports GET
        // For example: '/api/users/profile' or '/api/users/me'
      } catch (error) {
        console.error('Error updating user avatar:', error);
      }
    }
  };
  
  fetchAndUpdateUserData();
}, [isAuthenticated, user?.id, dispatch]);

  // Add this useEffect
  useEffect(() => {
    // Check if we have avatar info in localStorage
    const userData = JSON.parse(localStorage.getItem('user_data'));
    if (userData && userData.avatarUrl && (!user.avatarUrl || user.avatarUrl !== userData.avatarUrl)) {
      console.log('Updating user avatar from localStorage:', userData.avatarUrl);
      dispatch(updateUser({
        ...user,
        avatarUrl: userData.avatarUrl
      }));
    }
  }, []);

  return (
    <>
      <HeaderContainer theme={theme}>
        <HeaderContent>
          <Logo>
            <img src={logo} alt="ExamDG Logo" />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              ExamDG
            </motion.span>
          </Logo>

          <Nav $isMenuVisible={isMenuVisible} theme={theme}>
            <NavItems>
              <NavItem theme={theme}>
                <Link to="/" className={isActive('/') ? 'active' : ''}>Trang chủ</Link>
              </NavItem>
              <NavItem theme={theme}>
                <Link to="/subjects" className={isActive('/subjects') ? 'active' : ''}>Môn học</Link>
              </NavItem>
              <NavItem theme={theme}>
                <Link to={examsPath} className={isActive('/exams') || isActive('/admin/exams') || isActive('/teacher/exams') ? 'active' : ''}>Bài thi</Link>
              </NavItem>
              <NavItem theme={theme}>
                <Link to="/about" className={isActive('/about') ? 'active' : ''}>Giới thiệu</Link>
              </NavItem>
              <NavItem theme={theme}>
                <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>Liên hệ</Link>
              </NavItem>
              
            </NavItems>
          </Nav>

          <div style={{ display: "flex", alignItems: "center" }}>
            {isAuthenticated ? (
              <UserProfile className="user-dropdown-container">
                <UserButton theme={theme} onClick={handleToggleUserDropdown}>
                  <UserAvatar>
                    {user?.avatar || user?.avatarUrl ? (
                      <img 
                        src={`${process.env.REACT_APP_API_URL || 'http://localhost:5006'}${(user.avatar || user.avatarUrl)?.startsWith('/') ? '' : '/'}${user.avatar || user.avatarUrl}`} 
                        alt={user.fullName || 'Avatar'} 
                        onError={(e) => {
                          console.error('Avatar load failed:', e.target.src);
                          e.target.style.display = 'none';
                          e.target.parentNode.innerText = getInitials(user?.fullName || user?.username);
                        }}
                      />
                    ) : (
                      getInitials(user?.fullName || user?.username)
                    )}
                  </UserAvatar>
                  <span>{getDisplayName()}</span>
                </UserButton>

                <AnimatePresence>
                  {showUserDropdown && (
                    <UserDropdown
                      theme={theme}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <DropdownItem to="/profile" theme={theme}>
                        <FaUserCog />
                        Hồ sơ cá nhân
                      </DropdownItem>
                      <DropdownItem to="/dashboard" theme={theme}>
                        <FaChartBar />
                        Bảng điều khiển
                      </DropdownItem>
                      {user.role === 'Student' && (
                      <DropdownItem to="/notifications" theme={theme}>
                        <FaBell />
                        Thông báo
                      </DropdownItem>
                      )}
                      {/* Thêm mục Lịch sử bài thi ở đây, chỉ hiển thị cho học sinh */}
                      {user.role === 'Student' && (
                        <DropdownItem to="/exam-history" theme={theme}>
                          <FaHistory />
                          Lịch sử bài thi
                        </DropdownItem>
                      )}
                      {user.role === 'Student' && (
                        <DropdownItem to="/student/assigned-exams" theme={theme}>
                          <FaClipboardList />
                          Kỳ thi chính thức
                        </DropdownItem>
                      )}
                      {user.role === 'Student' && (
                        <DropdownItem to="/chat" theme={theme}>
                          <FaCommentDots />
                          Chat hỗ trợ
                        </DropdownItem>
                        
                      )}
                      {user.role === 'Student' && (
                        <>
                          
                          <DropdownItem to="/student/rankings" theme={theme}>
                            <FaChartLine />
                            Bảng xếp hạng
                          </DropdownItem>
                        </>
                      )}
                      {isAdmin && (
                        <>
                          <DropdownSeparator theme={theme} />
                          <DropdownSection theme={theme}>
                            Quản trị viên
                          </DropdownSection>
                          <DropdownItem to="/admin/users" theme={theme}>
                            <FaUsers />
                            Quản lý người dùng
                          </DropdownItem>
                          <DropdownItem to="/admin/exams" theme={theme}>
                            <FaClipboardList />
                            Quản lý đề thi
                          </DropdownItem>
                          <DropdownItem to="/admin/official-exams" theme={theme}>
                            <FaTrophy />
                            Kỳ thi chính thức
                          </DropdownItem>
                          
                          <DropdownItem to="/admin/questions" theme={theme}>
                            <FaQuestion />
                            Quản lý câu hỏi
                          </DropdownItem>
                          <DropdownItem to="/admin/statistics" theme={theme}>
                            <FaChartBar />
                            Thống kê hệ thống
                          </DropdownItem>
                          <DropdownItem to="/admin/reports" theme={theme}>
                            <FaChartLine />
                            Báo Cáo Hệ Thống
                          </DropdownItem>
                          <DropdownItem to="/admin/chapters" theme={theme}>
                          <FaPuzzlePiece />
                            Quản lý chương học
                          </DropdownItem>
                          <DropdownItem to="/admin/classrooms" theme={theme}>
                            <FaSchool />
                            Quản lý lớp học
                          </DropdownItem>
                          <DropdownItem to="/admin/notifications" className={({ isActive }) => isActive ? "active" : ""}>
                            <FaBell /> Quản lý thông báo
                          </DropdownItem>
                          <DropdownItem to="/admin/feedbacks" theme={theme}>
                            <FaFlag />
                            Phản hồi học sinh
                          </DropdownItem>
                          <DropdownItem to={`/student/analytics/${user.id}`} theme={theme}>
                            <FaChartBar />
                            Thống kê học sinh
                          </DropdownItem>
                          <DropdownItem to="/admin/students/classes" theme={theme}>
                            <FaUserGraduate /> Quản lý học sinh theo lớp
                          </DropdownItem>
                          <DropdownItem to="/analytics/charts" theme={theme}>
                            <FaChartLine />
                            Biểu đồ phân tích
                          </DropdownItem>
                          <DropdownItem to="/admin/chat" theme={theme} className="position-relative">
                            <FaComments />
                            Quản lý tin nhắn
                            {unreadChatCount > 0 && (
                              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.7rem'}}>
                                {unreadChatCount > 99 ? '99+' : unreadChatCount}
                              </span>
                            )}
                          </DropdownItem>
                        </>
                      )}
                      {isTeacher && !isAdmin && (
                        <>
                          <DropdownSeparator theme={theme} />
                          <DropdownSection theme={theme}>
                            Giáo viên
                          </DropdownSection>
                          <DropdownItem to="/teacher/exams" theme={theme}>
                            <FaClipboardList />
                            Quản lý đề thi
                          </DropdownItem>
                          <DropdownItem to="/teacher/verification-requests" theme={theme}>
                            <FaClipboardCheck />
                            Phúc Khảo Điểm
                          </DropdownItem>
                          <DropdownItem to="/teacher/questions" theme={theme}>
                            <FaQuestionCircle />
                            Ngân hàng câu hỏi
                          </DropdownItem>
                          <DropdownItem to="/teacher/statistics" theme={theme}>
                            <FaChartBar />
                            Thống kê bài thi
                          </DropdownItem>
                          <DropdownItem to="/teacher/class-results" theme={theme}>
                            <FaUserGraduate />
                            Kết quả theo lớp
                          </DropdownItem>
                          <DropdownItem to="/analytics/charts" theme={theme}>
                            <FaChartLine className="icon" />
                            <span className="label">Biểu đồ phân tích</span>
                          </DropdownItem>
                          <DropdownItem to="/student/rankings" theme={theme}>
                            <FaChartLine className="icon" />
                            <span className="label">Bảng xếp hạng học sinh</span>
                          </DropdownItem>
                          <DropdownItem to="/teacher/materials" theme={theme}>
                            <FaFileUpload />
                            Tài liệu ôn tập
                          </DropdownItem>
                          <DropdownItem to="/teacher/classrooms" theme={theme}>
                            <FaSchool />
                            Quản lý lớp học
                          </DropdownItem>
                          <DropdownItem to="/teacher/chat" theme={theme} className="position-relative">
                            <FaComments />
                            Quản lý tin nhắn
                            {unreadChatCount > 0 && (
                              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.7rem'}}>
                                {unreadChatCount > 99 ? '99+' : unreadChatCount}
                              </span>
                            )}
                          </DropdownItem>
                        </>
                      )}
                      <DropdownSeparator theme={theme} />
                      <DropdownItem to="/settings" theme={theme}>
                        <FaCog />
                        Cài đặt tài khoản
                      </DropdownItem>
                      <DropdownItem to="/my-feedbacks" theme={theme}>
                        <FaComment />
                        Phản hồi của tôi
                      </DropdownItem>
                      <LogoutButton onClick={handleLogout}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                          <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                        </svg>
                        Đăng xuất
                      </LogoutButton>
                    </UserDropdown>
                  )}
                </AnimatePresence>
              </UserProfile>
            ) : (
              <LoginButton onClick={handleOpenAuthModal}>
                <span>Đăng nhập</span>
              </LoginButton>
            )}
            <ThemeToggle onClick={handleThemeToggle} theme={theme}>
              {theme === "dark" ? "☀️" : "🌙"}
            </ThemeToggle>
            <MenuButton onClick={handleMenuToggle} theme={theme}>
              {isMenuVisible ? "✕" : "☰"}
            </MenuButton>
          </div>
        </HeaderContent>
      </HeaderContainer>
      <HeaderSpacer />

      <AuthModal
        show={showAuthModal}
        handleClose={handleCloseAuthModal}
        theme={theme}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default Header;