import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { FaExclamationTriangle } from 'react-icons/fa';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  text-align: center;
`;

const ErrorIcon = styled(FaExclamationTriangle)`
  font-size: 3rem;
  color: #ea4335;
  margin-bottom: 20px;
`;

const ErrorTitle = styled.h3`
  font-size: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  margin-bottom: 15px;
`;

const ErrorMessage = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#666'};
  max-width: 500px;
  margin-bottom: 25px;
`;

const RetryButton = styled.button`
  padding: 10px 20px;
  background: linear-gradient(45deg, #4285f4, #34a853);
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

const ErrorDisplay = ({ message, onRetry }) => {
  const { theme } = useSelector(state => state.ui);
  
  return (
    <ErrorContainer>
      <ErrorIcon />
      <ErrorTitle theme={theme}>Đã xảy ra lỗi</ErrorTitle>
      <ErrorMessage theme={theme}>{message || 'Không thể tải dữ liệu. Vui lòng thử lại sau.'}</ErrorMessage>
      
      {onRetry && <RetryButton onClick={onRetry}>Thử lại</RetryButton>}
    </ErrorContainer>
  );
};

export default ErrorDisplay;