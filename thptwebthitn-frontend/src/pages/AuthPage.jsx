import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';
import ForgotPasswordForm from '../components/Auth/ForgotPasswordForm';
import ResetPasswordForm from '../components/Auth/ResetPasswordForm';
import { getToken } from '../utils/auth';

const AuthPageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.theme === 'dark' ? '#1a1a1a' : '#f5f7fa'};
  padding: 1rem;
`;

const AuthFormWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 480px;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const Logo = styled.img`
  height: 60px;
  margin-bottom: 1rem;
`;

const AppName = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#333'};
  margin: 0;
`;

const AuthPage = ({ type }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const theme = useSelector(state => state.theme?.current || 'light');
  
  // Xác định loại form từ pathname hoặc từ prop type
  const getFormTypeFromPath = (pathname) => {
    if (pathname.includes('register')) return 'register';
    if (pathname.includes('forgot-password')) return 'forgot-password';
    if (pathname.includes('reset-password')) return 'reset-password';
    return 'login'; // default
  };
  
  const [authType, setAuthType] = useState(type || getFormTypeFromPath(location.pathname));

  // Theo dõi thay đổi route
  useEffect(() => {
    if (!type) {
      setAuthType(getFormTypeFromPath(location.pathname));
    }
  }, [location.pathname, type]);
  
  // Chuyển hướng nếu người dùng đã đăng nhập
  useEffect(() => {
    const isUserAuthenticated = !!getToken();
    if (isUserAuthenticated && authType !== 'reset-password') {
      const redirectTo = location.state?.from || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [authType, location.state, navigate]);

  const handleSwitchForm = (formType) => {
    setAuthType(formType);
    
    // Cập nhật URL khi chuyển form mà không reload trang
    switch (formType) {
      case 'register':
        navigate('/register', { replace: true });
        break;
      case 'forgot-password':
        navigate('/forgot-password', { replace: true });
        break;
      case 'reset-password':
        navigate('/reset-password', { replace: true });
        break;
      default:
        navigate('/login', { replace: true });
    }
  };

  const renderAuthForm = () => {
    switch (authType) {
      case 'register':
        return (
          <RegisterForm 
            theme={theme} 
            switchToLogin={() => handleSwitchForm('login')} 
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm 
            theme={theme} 
            onBackToLogin={() => handleSwitchForm('login')} 
          />
        );
      case 'reset-password':
        return (
          <ResetPasswordForm 
            theme={theme} 
            onBackToLogin={() => handleSwitchForm('login')}
          />
        );
      default:
        return (
          <LoginForm 
            theme={theme} 
            switchToRegister={() => handleSwitchForm('register')} 
            switchToForgotPassword={() => handleSwitchForm('forgot-password')} 
          />
        );
    }
  };

  return (
    <AuthPageContainer theme={theme}>
      <AuthFormWrapper
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {renderAuthForm()}
      </AuthFormWrapper>
    </AuthPageContainer>
  );
};

export default AuthPage;