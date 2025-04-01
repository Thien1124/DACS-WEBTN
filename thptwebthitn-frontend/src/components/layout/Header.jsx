import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, toggleMenu } from '../../redux/uiSlice';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import logo from '../../assets/logo.png';
import AuthModal from '../Auth/AuthModal'; // Import AuthModal thay vì LoginModal

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: ${props => props.theme === 'dark' ? '#1e1e1e' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#333333'};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 0.8rem 2rem;
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
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
    display: ${props => props.isMenuVisible ? 'flex' : 'none'};
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: ${props => props.theme === 'dark' ? '#1e1e1e' : '#ffffff'};
    flex-direction: column;
    padding: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const NavItems = styled.ul`
  display: flex;
  list-style: none;
  
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
    color: ${props => props.theme === 'dark' ? '#ffffff' : '#333333'};
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
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#333333'};
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
    background-color: ${props => props.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#333333'};
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
    background-color: ${props => props.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
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
    content: '';
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
  const { theme, isMenuVisible } = useSelector(state => state.ui);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
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
          
          <MenuButton onClick={handleMenuToggle} theme={theme}>
            {isMenuVisible ? '✕' : '☰'}
          </MenuButton>
          
          <Nav isMenuVisible={isMenuVisible} theme={theme}>
            <NavItems>
              <NavItem theme={theme}><a href="#home">Trang chủ</a></NavItem>
              <NavItem theme={theme}><a href="#courses">Khóa học</a></NavItem>
              <NavItem theme={theme}><a href="#about">Giới thiệu</a></NavItem>
              <NavItem theme={theme}><a href="#contact">Liên hệ</a></NavItem>
            </NavItems>
          </Nav>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <LoginButton onClick={handleOpenAuthModal}>
              <span>Đăng nhập</span>
            </LoginButton>
            <ThemeToggle onClick={handleThemeToggle} theme={theme}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </ThemeToggle>
          </div>
        </HeaderContent>
      </HeaderContainer>
      <HeaderSpacer />
      
      {/* Sử dụng AuthModal mới */}
      <AuthModal 
        show={showAuthModal} 
        handleClose={handleCloseAuthModal} 
        theme={theme}
      />
    </>
  );
}

export default Header;