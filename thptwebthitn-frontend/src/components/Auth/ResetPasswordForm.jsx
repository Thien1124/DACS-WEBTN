import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import * as authService from '../../services/authService';

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

const PasswordRequirements = styled.ul`
  margin-top: 0.5rem;
  padding-left: 1.5rem;
  font-size: 0.8rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
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

const ResetPasswordForm = ({ theme, onBackToLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    email: '',
    resetCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Lấy email từ state nếu có
  useEffect(() => {
    if (location.state?.email) {
      setFormData(prev => ({
        ...prev,
        email: location.state.email
      }));
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    // Reset code validation
    if (!formData.resetCode) {
      newErrors.resetCode = 'Vui lòng nhập mã xác nhận';
    } else if (formData.resetCode.length < 6) {
      newErrors.resetCode = 'Mã xác nhận không hợp lệ';
    }
    
    // Password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      try {
        // Gọi API để đặt lại mật khẩu
        await authService.resetPasswordWithCode({
          email: formData.email,
          resetCode: formData.resetCode,
          newPassword: formData.newPassword
        });
        
        setIsSubmitted(true);
        
        // Chuyển đến trang đăng nhập sau 3 giây
        setTimeout(() => {
          if (onBackToLogin) {
            onBackToLogin();
          } else {
            navigate('/login');
          }
        }, 3000);
      } catch (error) {
        setErrors({
          general: error.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại.'
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
      <FormTitle>Đặt Lại Mật Khẩu</FormTitle>
      
      {isSubmitted ? (
        <>
          <SuccessMessage theme={theme}>
            Mật khẩu của bạn đã được đặt lại thành công! Đang chuyển hướng đến trang đăng nhập...
          </SuccessMessage>
          <LoginLink theme={theme}>
            <LoginButton theme={theme} onClick={onBackToLogin}>
              Quay lại đăng nhập
            </LoginButton>
          </LoginLink>
        </>
      ) : (
        <>
          {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}
          
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label theme={theme} htmlFor="email">Email</Label>
              <Input
                theme={theme}
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@gmail.com"
                readOnly={!!location.state?.email}
              />
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme} htmlFor="resetCode">Mã xác nhận</Label>
              <Input
                theme={theme}
                type="text"
                id="resetCode"
                name="resetCode"
                value={formData.resetCode}
                onChange={handleInputChange}
                placeholder="Nhập mã xác nhận từ email"
              />
              {errors.resetCode && <ErrorMessage>{errors.resetCode}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme} htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                theme={theme}
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu mới"
              />
              {errors.newPassword && <ErrorMessage>{errors.newPassword}</ErrorMessage>}
              <PasswordRequirements theme={theme}>
                <li>Ít nhất 6 ký tự</li>
                <li>Nên bao gồm chữ hoa, chữ thường và số</li>
              </PasswordRequirements>
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme} htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                theme={theme}
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Nhập lại mật khẩu mới"
              />
              {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
            </FormGroup>
            
            <SubmitButton type="submit" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Đặt Lại Mật Khẩu'}
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

export default ResetPasswordForm;