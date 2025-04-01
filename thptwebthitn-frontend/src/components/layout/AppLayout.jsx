import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from './Navbar';
import Footer from './Footer';
import { useSelector } from 'react-redux';

const MainContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme === 'dark' ? '#1a1a1a' : '#f5f5f5'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const Content = styled.main`
  flex: 1;
  padding: 60px 0 20px;
  width: 100%;
`;

const AppLayout = () => {
  const [theme, setTheme] = useState('light');
  const location = useLocation();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  
  useEffect(() => {
    // Check if user has a saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Use system preference if no saved preference
      setTheme('dark');
    }
    
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  // Some routes might need different layouts or no layout at all
  const shouldShowNavFooter = () => {
    // Add routes that shouldn't have navbar/footer (like auth pages or exam pages)
    const routesWithoutFullLayout = ['/exams', '/login', '/register', '/forgot-password', '/reset-password'];
    
    // Check if current path is in the exclusion list
    return !routesWithoutFullLayout.some(route => location.pathname.startsWith(route));
  };
  
  return (
    <MainContainer theme={theme}>
      <Navbar theme={theme} toggleTheme={toggleTheme} isAuthenticated={isAuthenticated} />
      <Content>{<Outlet context={{ theme }} />}</Content>
      {shouldShowNavFooter() && <Footer theme={theme} />}
    </MainContainer>
  );
};

export default AppLayout;
