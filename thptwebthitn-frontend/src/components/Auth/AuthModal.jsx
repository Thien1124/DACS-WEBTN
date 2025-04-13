import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  
  @media (max-width: 480px) {
    padding: 10px;
    align-items: flex-start;
    overflow-y: auto;
  }
`;

const ModalContainer = styled(motion.div)`
  width: 100%;
  max-width: 450px;
  position: relative;
  overflow: hidden;
  border-radius: 15px;
  
  @media (max-width: 480px) {
    border-radius: 10px;
    margin: 10px 0;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#555'};
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  }
  
  @media (max-width: 480px) {
    top: 10px;
    right: 10px;
    font-size: 1.2rem;
    width: 25px;
    height: 25px;
  }
`;

const GlassEffect = styled.div`
  position: absolute;
  top: -50px;
  left: -50px;
  width: 150px;
  height: 150px;
  background: linear-gradient(45deg, rgba(66, 133, 244, 0.3), rgba(66, 133, 244, 0));
  border-radius: 50%;
  z-index: -1;
  
  @media (max-width: 480px) {
    width: 100px;
    height: 100px;
    top: -30px;
    left: -30px;
  }
`;

const GlassEffect2 = styled.div`
  position: absolute;
  bottom: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: linear-gradient(45deg, rgba(66, 244, 188, 0), rgba(66, 244, 188, 0.3));
  border-radius: 50%;
  z-index: -1;
  
  @media (max-width: 480px) {
    width: 120px;
    height: 120px;
    bottom: -30px;
    right: -30px;
  }
`;

const AuthModal = ({ show, handleClose, theme }) => {
  const [formType, setFormType] = useState('login');
  const [isClosing, setIsClosing] = useState(false);
  
  // Tự động cuộn lên đầu khi form chuyển đổi
  useEffect(() => {
    if (show) {
      window.scrollTo(0, 0);
    }
  }, [show, formType]);
  
  // Effect xử lý đóng modal với animation
  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        handleClose();
        setIsClosing(false);
      }, 1000); // Thời gian để animation exit hoàn thành
      return () => clearTimeout(timer);
    }
  }, [isClosing, handleClose]);

  // Hàm xử lý đăng nhập thành công
  const handleLoginSuccess = () => {
    console.log(`[${new Date().toISOString().replace('T', ' ').substring(0, 19)}] Login successful, closing modal...`);
    console.log(`Current User: vinhsonvlog`);
    
    // Không đóng ngay lập tức, mà đặt state để đóng với animation
    setIsClosing(true);
  };

  // Hàm xử lý đăng ký thành công
  const handleRegisterSuccess = () => {
    console.log(`[${new Date().toISOString().replace('T', ' ').substring(0, 19)}] Registration successful, switching to login...`);
    console.log(`Current User: vinhsonvlog`);
    
    // Sau khi đăng ký thành công, chuyển sang form đăng nhập
    setFormType('login');
  };

  // Hàm chuyển đổi form
  const switchToRegister = () => setFormType('register');
  const switchToLogin = () => setFormType('login');

  return (
    <AnimatePresence>
      {show && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isClosing ? null : handleClose} // Vô hiệu hóa onClick khi đang đóng
        >
          <ModalContainer
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {!isClosing && (
              <CloseButton theme={theme} onClick={handleClose}>
                ✕
              </CloseButton>
            )}
            
            <GlassEffect />
            <GlassEffect2 />
            
            <AnimatePresence mode="wait">
              {formType === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                  <LoginForm 
                    theme={theme} 
                    switchToRegister={switchToRegister} 
                    onLoginSuccess={handleLoginSuccess} 
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                >
                  <RegisterForm 
                    theme={theme} 
                    switchToLogin={switchToLogin}
                    onRegisterSuccess={handleRegisterSuccess}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </ModalContainer>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;