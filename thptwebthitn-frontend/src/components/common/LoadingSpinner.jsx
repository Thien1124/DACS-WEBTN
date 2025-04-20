import React from 'react';
import styled from 'styled-components';
import { Spinner } from 'react-bootstrap';

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.fullSize ? '100px 0' : '20px 0'};
`;

const SpinnerText = styled.p`
  margin-top: 15px;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
`;

const LoadingSpinner = ({ 
  message = 'Đang tải dữ liệu...', 
  size = 'md',  // sm, md, lg
  fullSize = false,
  theme = 'light'
}) => {
  return (
    <SpinnerContainer fullSize={fullSize}>
      <Spinner 
        animation="border" 
        variant={theme === 'dark' ? 'light' : 'primary'}
        size={size} 
      />
      {message && <SpinnerText theme={theme}>{message}</SpinnerText>}
    </SpinnerContainer>
  );
};

export default LoadingSpinner;
