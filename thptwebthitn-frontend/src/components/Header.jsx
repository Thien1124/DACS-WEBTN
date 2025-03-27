import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, toggleMenu } from '../redux/uiSlice';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png'; // Uncommented this line

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
      color: #007bff;
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
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#333333'};
  font-size: 1.5rem;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(45deg, #007bff, #00d6ff);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-left: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(45deg, #0062cc, #00b3ff);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const HeaderSpacer = styled.div`
  height: 4.5rem;
`;

function Header() {
  const dispatch = useDispatch();
  const { theme, isMenuVisible } = useSelector(state => state.ui);
  
  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };
  
  const handleMenuToggle = () => {
    dispatch(toggleMenu());
  };

  const handleLogin = () => {
    // In a real app, this would open a login modal or redirect to login page
    alert('Chức năng đăng nhập sẽ được phát triển trong tương lai!');
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
            <LoginButton onClick={handleLogin}>
              Đăng nhập
            </LoginButton>
            <ThemeToggle onClick={handleThemeToggle} theme={theme}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </ThemeToggle>
          </div>
        </HeaderContent>
      </HeaderContainer>
      <HeaderSpacer />
    </>
  );
}

export default Header;