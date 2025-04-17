import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaExclamationCircle } from 'react-icons/fa';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.theme === 'dark' ? '#ff6b6b' : '#e74c3c'};
  font-size: 0.85rem;
  margin-top: 0.5rem;
  animation: ${fadeIn} 0.2s ease-in;
`;

const ErrorIcon = styled(FaExclamationCircle)`
  margin-right: 6px;
  flex-shrink: 0;
`;

const ErrorText = styled.span`
  line-height: 1.4;
`;

/**
 * Component to display validation error message
 */
const ValidationError = ({ error, theme = 'light' }) => {
  if (!error) return null;
  
  return (
    <ErrorContainer theme={theme}>
      <ErrorIcon />
      <ErrorText>{error}</ErrorText>
    </ErrorContainer>
  );
};

export default ValidationError;