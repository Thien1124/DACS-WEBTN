import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../../redux/authSlice';
import * as authService from '../../services/authService';
import { FaUser, FaEnvelope, FaLock, FaIdCard, FaPhone, FaCheckCircle } from 'react-icons/fa';
import { showSuccessToast, showErrorToast, showWarningToast } from '../../utils/toastUtils';

const FormContainer = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 450px;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  overflow: hidden;
  position: relative;
  
  @media (max-width: 480px) {
    padding: 1.5rem;
    max-width: 100%;
    border-radius: 10px;
  }
`;

const FormTitle = styled.h2`
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(45deg, #4285f4, #34a853, #fbbc05, #ea4335);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 3px;
    background: linear-gradient(45deg, #4285f4, #34a853);
    border-radius: 10px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 1.2rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
  
  @media (max-width: 480px) {
    margin-bottom: 1.2rem;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 55px;
  transform: translateY(-50%);
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#aaa'};
  transition: all 0.2s;
  
  @media (max-width: 480px) {
    left: 10px;
    font-size: 0.9rem;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#444'};
  font-size: 0.95rem;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
    margin-bottom: 0.3rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 2px solid ${props => props.theme === 'dark' ? '#444' : '#e0e0e0'};
  border-radius: 8px;
  font-size: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#333' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.25);
    
    & + ${InputIcon} {
      color: #4285f4;
    }
  }
  
  &::placeholder {
    color: ${props => props.theme === 'dark' ? '#6c7280' : '#aaa'};
  }
  
  @media (max-width: 480px) {
    padding: 10px 10px 10px 35px;
    font-size: 0.9rem;
    border-radius: 6px;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(45deg, #4285f4, #34a853);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    background: linear-gradient(45deg, #fbbc05, #ea4335);
    transition: width 0.5s ease;
    z-index: 0;
  }
  
  &:hover:before {
    width: 100%;
  }
  
  span {
    position: relative;
    z-index: 1;
  }
  
  &:active {
    transform: translateY(2px);
  }
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: translateY(0);
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    font-size: 0.95rem;
    border-radius: 6px;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  
  &:before {
    content: '⚠️';
    margin-right: 6px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-top: 0.3rem;
  }
`;

const LoginLink = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.95rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#666'};
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
    margin-top: 1.2rem;
  }
`;

const SwitchFormButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme === 'dark' ? '#4da3ff' : '#4285f4'};
  font-weight: 600;
  cursor: pointer;
  margin-left: 5px;
  transition: all 0.2s;
  
  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 1px;
    bottom: 0;
    left: 0;
   transition: width 0.3s;
  }
  
  &:hover:after {
    width: 100%;
  }
`;

// Responsive container để ngăn không cho form bị thu nhỏ quá nhiều
const ResponsiveContainer = styled.div`
  width: 100%;
  padding: 0 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  
  @media (max-width: 480px) {
    padding: 0;
  }
`;
const SuccessMessage = styled.div`
    color: #2ecc71;
    background-color: ${props => props.theme === 'dark' ? '#1a2e1a' : '#efffef'};
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    text-align: center;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    
    svg {
      margin-right: 8px;
      font-size: 1.2rem;
    }
  `;
  
  const RegisterForm = ({ theme, switchToLogin,onRegisterSuccess }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phoneNumber: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [shouldSwitchToLogin, setShouldSwitchToLogin] = useState(false);
    useEffect(() => {
      if (shouldSwitchToLogin) {
        const redirectTimer = setTimeout(() => {
          switchToLogin();
        }, 800); // Độ trễ 800ms để đảm bảo toast được hiển thị trước khi chuyển form
        
        return () => clearTimeout(redirectTimer);
      }
    }, [shouldSwitchToLogin, switchToLogin]);
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Clear error when user types
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: ''
        });
      }
    };
  
    const validateForm = () => {
      // Code xác thực form giữ nguyên
      const newErrors = {};
      
      // Validate username
      if (!formData.username) {
        newErrors.username = 'Vui lòng nhập tên đăng nhập';
      }
      
      // Validate email
      if (!formData.email) {
        newErrors.email = 'Vui lòng nhập email';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email không hợp lệ';
      }
      
      // Validate fullName
      if (!formData.fullName) {
        newErrors.fullName = 'Vui lòng nhập họ tên đầy đủ';
      }
      
      // Validate phoneNumber
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
      } else if (!/^[0-9]{10,11}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
      }
      
      // Validate password
      if (!formData.password) {
        newErrors.password = 'Vui lòng nhập mật khẩu';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
      
      // Validate password confirmation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu không khớp';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (validateForm()) {
        setIsLoading(true);
        try {
          const userData = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber
          };
    
          console.log(`[${new Date().toISOString().replace('T', ' ').substring(0, 19)}] Sending registration data:`, userData);
          console.log(`Current User: vinhsonvlog`); // Log người dùng hiện tại
          
          const response = await authService.register(userData);
          console.log('Registration successful:', response);
          
          // Hiển thị thông báo thành công
          showSuccessToast('Đăng ký tài khoản thành công!',onRegisterSuccess);
          setTimeout(() => {
            if (onRegisterSuccess && typeof onRegisterSuccess === 'function') {
              onRegisterSuccess();
            } else {
              switchToLogin();
            }
          }, 800);
          // Đặt state để chuyển đến form đăng nhập
          setShouldSwitchToLogin(true);
  
        } catch (error) {
          console.error('Registration error:', error);
          showErrorToast(error.message || 'Đăng ký thất bại. Vui lòng thử lại sau.');
          
          setErrors({
            general: error.message || 'Đăng ký thất bại. Vui lòng thử lại sau.'
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        showWarningToast('Vui lòng điền đầy đủ thông tin và kiểm tra lại dữ liệu đã nhập.');
      }
    };
  
    return (
      <ResponsiveContainer>
        <FormContainer
          theme={theme}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }} 
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <FormTitle>Đăng Ký Tài Khoản</FormTitle>
          
          {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}
          
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label theme={theme} htmlFor="username">Tên đăng nhập</Label>
              <Input
                theme={theme}
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Nhập tên đăng nhập"
              />
              <InputIcon theme={theme}><FaUser /></InputIcon>
              {errors.username && <ErrorMessage>{errors.username}</ErrorMessage>}
            </FormGroup>
            
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
              />
              <InputIcon theme={theme}><FaEnvelope /></InputIcon>
              {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme} htmlFor="fullName">Họ và tên</Label>
              <Input
                theme={theme}
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Nhập họ và tên đầy đủ"
              />
              <InputIcon theme={theme}><FaIdCard /></InputIcon>
              {errors.fullName && <ErrorMessage>{errors.fullName}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme} htmlFor="phoneNumber">Số điện thoại</Label>
              <Input
                theme={theme}
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại"
              />
              <InputIcon theme={theme}><FaPhone /></InputIcon>
              {errors.phoneNumber && <ErrorMessage>{errors.phoneNumber}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme} htmlFor="password">Mật khẩu</Label>
              <Input
                theme={theme}
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Tối thiểu 6 ký tự"
              />
              <InputIcon theme={theme}><FaLock /></InputIcon>
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
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
                placeholder="Nhập lại mật khẩu"
              />
              <InputIcon theme={theme}><FaLock /></InputIcon>
              {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
            </FormGroup>
            
            <SubmitButton type="submit" disabled={isLoading}>
              <span>{isLoading ? 'Đang xử lý...' : 
               shouldSwitchToLogin ? 'Đăng ký thành công...' : 'Đăng Ký'}</span>
            </SubmitButton>
          </form>
          
          <LoginLink theme={theme}>
            Đã có tài khoản? 
            <SwitchFormButton 
              theme={theme}
              type="button" 
              onClick={switchToLogin}
              disabled={shouldSwitchToLogin}
            >
              Đăng nhập
            </SwitchFormButton>
          </LoginLink>
        </FormContainer>
      </ResponsiveContainer>
    );
  };
  
  export default RegisterForm;