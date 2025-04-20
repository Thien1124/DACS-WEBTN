import React from 'react';
import styled from 'styled-components';
import { FaSearch, FaExclamationTriangle, FaPlus } from 'react-icons/fa';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const Icon = styled.div`
  font-size: 3rem;
  color: ${props => props.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 0.5rem;
`;

const Message = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
  margin-bottom: 1.5rem;
  max-width: 500px;
`;

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#3182ce'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#2b6cb0'};
  }
`;

const EmptyState = ({
  type = 'search',
  title,
  message,
  actionLabel,
  onAction,
  theme = 'light'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'search': return <FaSearch />;
      case 'error': return <FaExclamationTriangle />;
      case 'create': return <FaPlus />;
      default: return <FaSearch />;
    }
  };
  
  return (
    <Container theme={theme}>
      <Icon theme={theme}>{getIcon()}</Icon>
      <Title theme={theme}>{title || 'Không tìm thấy kết quả'}</Title>
      <Message theme={theme}>{message || 'Không có dữ liệu nào phù hợp với yêu cầu của bạn.'}</Message>
      
      {actionLabel && onAction && (
        <ActionButton theme={theme} onClick={onAction}>
          {type === 'create' && <FaPlus />}
          {actionLabel}
        </ActionButton>
      )}
    </Container>
  );
};

export default EmptyState;