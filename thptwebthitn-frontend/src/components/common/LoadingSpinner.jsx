import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${props => props.size === 'small' ? '0.5rem' : '1rem'};
`;

const Spinner = styled.div`
  width: ${props => props.size === 'small' ? '1.5rem' : '2.5rem'};
  height: ${props => props.size === 'small' ? '1.5rem' : '2.5rem'};
  border: ${props => props.size === 'small' ? '3px' : '5px'} solid rgba(0, 123, 255, 0.2);
  border-top: ${props => props.size === 'small' ? '3px' : '5px'} solid #007bff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin-top: 0.5rem;
  color: #007bff;
  font-size: ${props => props.size === 'small' ? '0.9rem' : '1.1rem'};
`;

const LoadingSpinner = ({ size = 'normal', text }) => {
  return (
    <SpinnerContainer size={size}>
      <div style={{ textAlign: 'center' }}>
        <Spinner size={size} />
        {text && <LoadingText size={size}>{text}</LoadingText>}
      </div>
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
