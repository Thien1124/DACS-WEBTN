import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { ForgotPasswordForm } from '../../components/auth';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 100px);
  padding: 20px;
  background-color: ${props => props.theme === 'dark' ? '#1a1a1a' : '#f5f8fa'};
`;

const ForgotPasswordPage = () => {
  const { theme } = useSelector(state => state.ui);
  
  return (
    <PageContainer theme={theme}>
      <ForgotPasswordForm theme={theme} />
    </PageContainer>
  );
};

export default ForgotPasswordPage;