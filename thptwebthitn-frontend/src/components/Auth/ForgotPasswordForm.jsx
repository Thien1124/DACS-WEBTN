import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const FormContainer = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const FormTitle = styled.h2`
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  background: linear-gradient(45deg, #007bff, #00d6ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#555'};
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 4px;
  font-size: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#333' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background: linear-gradient(45deg, #007bff, #00d6ff);
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(45deg, #0069d9, #00c2e6);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: translateY(0);
    box-shadow: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.5rem;
`;

const SuccessMessage = styled.div`
  color: #2ecc71;
  font-size: 0.95rem;
  margin-top: 1rem;
  padding: 10px;
  background-color: ${props => props.theme === 'dark' ? '#1a2e1a' : '#efffef'};
  border-radius: 4px;
  text-align: center;
`;

const LoginLink = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
`;

const LoginButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme === 'dark' ? '#4da3ff' : '#007bff'};
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ForgotPasswordForm = ({ theme, onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      try {
        // API call would go here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        setIsSubmitted(true);
      } catch (error) {
        setErrors({
          general: 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <FormContainer
      theme={theme}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <FormTitle>Quên Mật Khẩu</FormTitle>
      
      {isSubmitted ? (
        <>
          <SuccessMessage theme={theme}>
            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu vào email của bạn. Vui lòng kiểm tra hộp thư.
          </SuccessMessage>
          <LoginLink theme={theme}>
            <LoginButton theme={theme} onClick={onBackToLogin}>
              Quay lại đăng nhập
            </LoginButton>
          </LoginLink>
        </>
      ) : (
        <>
          <p style={{ marginBottom: '1.5rem', textAlign: 'center', color: theme === 'dark' ? '#a0aec0' : '#777' }}>
            Nhập email đã đăng ký của bạn để nhận hướng dẫn đặt lại mật khẩu.
          </p>
          
          {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}
          
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label theme={theme} htmlFor="email">Email</Label>
              <Input
                theme={theme}
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleInputChange}
                placeholder="example@gmail.com"
              />
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </FormGroup>
            
            <SubmitButton type="submit" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Gửi Yêu Cầu'}
            </SubmitButton>
          </form>
          
          <LoginLink theme={theme}>
            <LoginButton theme={theme} onClick={onBackToLogin}>
              Quay lại đăng nhập
            </LoginButton>
          </LoginLink>
        </>
      )}
    </FormContainer>
  );
};

export default ForgotPasswordForm;