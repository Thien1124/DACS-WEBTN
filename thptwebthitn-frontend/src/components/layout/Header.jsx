import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom"; // Import useNavigate và Link
import { toggleTheme, toggleMenu } from "../../redux/uiSlice";
import { logout } from "../../redux/authSlice"; // Import action logout
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../assets/images/logo.png";
import AuthModal from "../Auth/AuthModal";
import * as authService from "../../services/authService";
import { toast } from "react-toastify"; // Import toast từ react-toastify

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
  justify-content: center; /* Căn giữa ngang */
  align-items: center; /* Căn giữa dọc */
  list-style: none;
  padding: 10;
  margin: 0;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const NavItem = styled.li`
  margin: 0 1rem;

  @media (max-width: 768px) {
    margin: 0.5rem 0;
  }

  a {
    color: ${(props) => (props.theme === "dark" ? "#ffffff" : "#333333")};
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;

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
`;

const UserDropdown = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background-color: ${(props) =>
    props.theme === "dark" ? "#2d2d2d" : "#ffffff"};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-top: 8px;
  overflow: hidden;
  z-index: 1000;
`;

const DropdownItem = styled(Link)`
  display: block;
  padding: 10px 16px;
  color: ${(props) => (props.theme === "dark" ? "#e0e0e0" : "#333333")};
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) =>
      props.theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"};
  }
`;

const LogoutButton = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 16px;
  border: none;
  background: none;
  color: #e74c3c;
  cursor: pointer;
  transition: background-color 0.2s;

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
  display: flex;
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
  const { theme, isMenuVisible } = useSelector((state) => state.ui);
  const { isAuthenticated, user } = useSelector((state) => state.auth); // Updated selector
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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

  // Hàm lấy chữ cái đầu của tên người dùng
  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  // Hàm lấy tên hiển thị
  const getDisplayName = () => {
    if (!user) return "Người dùng";
    return user.fullName || user.username || user.email.split("@")[0];
  };

  // Callback sau khi đăng nhập thành công
  const handleLoginSuccess = () => {
    handleCloseAuthModal();
    // Điều hướng đến trang chính sau đăng nhập, ví dụ: dashboard
    navigate("/dashboard"); // Thay đổi đường dẫn theo yêu cầu của bạn
  };

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
                <Link to="/">Trang chủ</Link>
              </NavItem>
              <NavItem theme={theme}>
                <Link to="/subjects">Môn học</Link>
              </NavItem>
              <NavItem theme={theme}>
                <Link to="/about">Giới thiệu</Link>
              </NavItem>
              <NavItem theme={theme}>
                <Link to="/contact">Liên hệ</Link>
              </NavItem>
            </NavItems>
          </Nav>

          <div style={{ display: "flex", alignItems: "center" }}>
            {isAuthenticated ? (
              <UserProfile className="user-dropdown-container">
                <UserButton theme={theme} onClick={handleToggleUserDropdown}>
                  <UserAvatar>
                    {getInitials(user?.fullName || user?.username)}
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
                        Hồ sơ cá nhân
                      </DropdownItem>
                      <DropdownItem to="/dashboard" theme={theme}>
                        Bảng điều khiển
                      </DropdownItem>
                      <DropdownItem to="/settings" theme={theme}>
                        Cài đặt tài khoản
                      </DropdownItem>
                      <LogoutButton onClick={handleLogout}>
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

      {/* Truyền thêm callback onLoginSuccess cho AuthModal */}
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
