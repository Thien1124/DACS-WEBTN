import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

const NavbarContainer = styled.nav`
  background-color: ${props => props.theme === 'dark' ? '#222' : 'white'};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 0.75rem 1.5rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: background-color 0.3s ease;
`;

const NavbarContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? 'white' : '#333'};
  text-decoration: none;
  
  span {
    background: linear-gradient(45deg, #007bff, #00d6ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#555'};
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${props => props.theme === 'dark' ? '#4da3ff' : '#007bff'};
  }
  
  &.active {
    color: ${props => props.theme === 'dark' ? '#4da3ff' : '#007bff'};
  }
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const Button = styled(Link)`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(45deg, #007bff, #00d6ff);
  color: white;
  
  &:hover {
    background: linear-gradient(45deg, #0069d9, #00c2e6);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
  }
`;

const SecondaryButton = styled(Button)`
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#555'};
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#333' : '#f5f5f5'};
  }
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#555'};
  font-size: 1.25rem;
  cursor: pointer;
  margin-left: 1rem;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MobileMenuButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#555'};
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme === 'dark' ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  z-index: 999;
`;

const MobileNavLink = styled(Link)`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  text-decoration: none;
  font-weight: 500;
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#444' : '#eee'};
  
  &:hover {
    color: ${props => props.theme === 'dark' ? '#4da3ff' : '#007bff'};
  }
`;

const MobileAuthButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const MobileButton = styled(Link)`
  padding: 0.75rem;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  text-align: center;
`;

const MobilePrimaryButton = styled(MobileButton)`
  background: linear-gradient(45deg, #007bff, #00d6ff);
  color: white;
`;

const MobileSecondaryButton = styled(MobileButton)`
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#555'};
`;

const UserMenu = styled.div`
  position: relative;
`;

const UserMenuButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#555'};
  cursor: pointer;
  font-weight: 500;
  padding: 0.5rem;
  
  &:hover {
    color: ${props => props.theme === 'dark' ? '#4da3ff' : '#007bff'};
  }
`;

const UserAvatar = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: #007bff;
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
  margin-top: 0.5rem;
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  overflow: hidden;
`;

const UserDropdownItem = styled(Link)`
  display: block;
  padding: 0.75rem 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#555'};
  text-decoration: none;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#333' : '#f5f5f5'};
    color: ${props => props.theme === 'dark' ? '#4da3ff' : '#007bff'};
  }
`;

const LogoutButton = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  color: ${props => props.theme === 'dark' ? '#e74c3c' : '#dc3545'};
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#333' : '#f5f5f5'};
  }
`;

const Navbar = ({ theme, toggleTheme, isAuthenticated }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };
  
  const handleLogout = () => {
    dispatch(logout());
    setIsUserMenuOpen(false);
    navigate('/');
  };
  
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close user menu when clicking outside
      if (isUserMenuOpen && !e.target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);
  
  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [navigate]);
  
  // Get first letter of name for avatar
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };
  
  return (
    <NavbarContainer theme={theme}>
      <NavbarContent>
        <Logo theme={theme} to="/">
          <span>THPT</span>WebThiTN
        </Logo>
        
        <NavLinks>
          <NavLink theme={theme} to="/">Trang chủ</NavLink>
          <NavLink theme={theme} to="/subjects">Môn học</NavLink>
          <NavLink theme={theme} to="/about">Giới thiệu</NavLink>
          <NavLink theme={theme} to="/contact">Liên hệ</NavLink>
        </NavLinks>
        
        {isAuthenticated ? (
          <UserMenu className="user-menu">
            <UserMenuButton theme={theme} onClick={toggleUserMenu}>
              <UserAvatar>{getInitials(user?.name)}</UserAvatar>
              <span>{user?.name || 'Người dùng'}</span>
            </UserMenuButton>
            
            <AnimatePresence>
              {isUserMenuOpen && (
                <UserDropdown
                  theme={theme}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <UserDropdownItem theme={theme} to="/profile">Hồ sơ cá nhân</UserDropdownItem>
                  <UserDropdownItem theme={theme} to="/history">Lịch sử bài thi</UserDropdownItem>
                  <UserDropdownItem theme={theme} to="/change-password">Đổi mật khẩu</UserDropdownItem>
                  <LogoutButton theme={theme} onClick={handleLogout}>Đăng xuất</LogoutButton>
                </UserDropdown>
              )}
            </AnimatePresence>
          </UserMenu>
        ) : (
          <AuthButtons>
            <SecondaryButton theme={theme} to="/login">Đăng nhập</SecondaryButton>
            <PrimaryButton to="/register">Đăng ký</PrimaryButton>
          </AuthButtons>
        )}
        
        <ThemeToggle theme={theme} onClick={toggleTheme}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </ThemeToggle>
        
        <MobileMenuButton theme={theme} onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </MobileMenuButton>
      </NavbarContent>
      
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            theme={theme}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <MobileNavLink theme={theme} to="/">Trang chủ</MobileNavLink>
            <MobileNavLink theme={theme} to="/subjects">Môn học</MobileNavLink>
            <MobileNavLink theme={theme} to="/about">Giới thiệu</MobileNavLink>
            <MobileNavLink theme={theme} to="/contact">Liên hệ</MobileNavLink>
            
            {isAuthenticated ? (
              <>
                <MobileNavLink theme={theme} to="/profile">Hồ sơ cá nhân</MobileNavLink>
                <MobileNavLink theme={theme} to="/history">Lịch sử bài thi</MobileNavLink>
                <MobileNavLink theme={theme} to="/change-password">Đổi mật khẩu</MobileNavLink>
                <MobileNavLink 
                  theme={theme} 
                  as="button" 
                  onClick={handleLogout} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    textAlign: 'left', 
                    width: '100%', 
                    cursor: 'pointer',
                    color: theme === 'dark' ? '#e74c3c' : '#dc3545'
                  }}
                >
                  Đăng xuất
                </MobileNavLink>
              </>
            ) : (
              <MobileAuthButtons>
                <MobileSecondaryButton theme={theme} to="/login">Đăng nhập</MobileSecondaryButton>
                <MobilePrimaryButton to="/register">Đăng ký</MobilePrimaryButton>
              </MobileAuthButtons>
            )}
          </MobileMenu>
        )}
      </AnimatePresence>
    </NavbarContainer>
  );
};

export default Navbar;
