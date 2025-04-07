import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  padding: 0 2rem;
  background-color: ${props => props.theme === 'dark' ? '#121212' : '#f7f7f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const ErrorCode = styled(motion.h1)`
  font-size: 6rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#f56565' : '#e53e3e'};
`;

const ErrorTitle = styled(motion.h2)`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const ErrorMessage = styled(motion.p)`
  font-size: 1.2rem;
  max-width: 600px;
  margin-bottom: 2rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
`;

const HomeButton = styled(motion.div)`
  a {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#4285f4'};
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#3367d6'};
      transform: translateY(-2px);
    }
  }
`;

const Unauthorized = () => {
  const theme = localStorage.getItem('theme') || 'light';
  const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  return (
    <Container theme={theme}>
      <ErrorCode
        theme={theme}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        403
      </ErrorCode>
      
      <ErrorTitle
        theme={theme}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Không có quyền truy cập
      </ErrorTitle>
      
      <ErrorMessage
        theme={theme}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        Bạn không có quyền truy cập vào trang này. Tính năng này chỉ dành cho quản trị viên hệ thống.
        <br /><br />
        <small>Thời gian: {currentDate} (UTC)</small>
      </ErrorMessage>
      
      <HomeButton
        theme={theme}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Link to="/">Quay về trang chủ</Link>
      </HomeButton>
    </Container>
  );
};

export default Unauthorized;