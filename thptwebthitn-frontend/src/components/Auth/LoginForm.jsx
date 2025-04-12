import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { validateLoginForm } from '../../utils/validation';
import * as authService from '../../services/authService';
import { FaUser, FaLock, FaGoogle, FaFacebook, FaCheckCircle } from 'react-icons/fa';
import ForgotPasswordForm from './ForgotPasswordForm';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/toastUtils';

const FormContainer = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  padding: 2.5rem;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 450px;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  overflow: hidden;
  position: relative;
`;


const FormTitle = styled.h2`
  margin-bottom: 1.8rem;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(45deg, #4285f4, #34a853, #fbbc05, #ea4335);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 3px;
    background: linear-gradient(45deg, #4285f4, #34a853);
    border-radius: 10px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.8rem;
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 58px;
  transform: translateY(-50%);
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#aaa'};
  transition: all 0.2s;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.7rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#444'};
  font-size: 0.95rem;
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
`;

const ForgotPasswordLink = styled.div`
  text-align: right;
  font-size: 0.95rem;
  
  a {
    color: ${props => props.theme === 'dark' ? '#4da3ff' : '#4285f4'};
    font-weight: 500;
    transition: all 0.2s;
    position: relative;
    
    &:after {
      content: '';
      position: absolute;
      width: 0;
      height: 1px;
      bottom: 0;
      left: 0;
      background-color: ${props => props.theme === 'dark' ? '#4da3ff' : '#4285f4'};
      transition: width 0.3s;
    }
    
    &:hover:after {
      width: 100%;
    }
  }
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  
  &:before, &:after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${props => props.theme === 'dark' ? '#444' : '#e0e0e0'};
  }
  
  span {
    padding: 0 10px;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
    font-size: 0.9rem;
  }
`;

const SocialButtonsContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 1.5rem;
`;

const SocialButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 8px;
  background: ${props => props.theme === 'dark' ? '#333' : '#f5f5f5'};
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#e0e0e0'};
  color: ${props => props.provider === 'google' ? '#4285f4' : '#3b5998'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background: ${props => props.provider === 'google' 
      ? props.theme === 'dark' ? 'rgba(66, 133, 244, 0.15)' : 'rgba(66, 133, 244, 0.1)' 
      : props.theme === 'dark' ? 'rgba(59, 89, 152, 0.15)' : 'rgba(59, 89, 152, 0.1)'};
    transform: translateY(-2px);
  }
`;

const RememberMeContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0;
`;

// Cải thiện CheckboxContainer để đảm bảo click được
const CheckboxContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
`;

// Sửa lại HiddenCheckbox để có thể tương tác dễ dàng hơn
const HiddenCheckbox = styled.input`
  opacity: 0;
  height: 20px;
  width: 20px;
  position: absolute;
  z-index: 1;
  cursor: pointer;
`;

const StyledCheckbox = styled.div`
  display: inline-block;
  width: 18px;
  height: 18px;
  background: ${props => props.checked 
    ? 'linear-gradient(45deg, #4285f4, #34a853)' 
    : props.theme === 'dark' ? '#444' : '#e0e0e0'};
  border-radius: 3px;
  transition: all 0.2s ease;
  position: relative;
  pointer-events: none;
  
  &:after {
    content: '';
    position: absolute;
    left: 6px;
    top: 3px;
    width: 5px;
    height: 9px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    opacity: ${props => props.checked ? '1' : '0'};
    transition: opacity 0.2s ease;
  }
`;

const CheckboxLabel = styled.span`
  margin-left: 8px;
  font-size: 0.95rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#666'};
  cursor: pointer;
`;

const RegisterLink = styled.div`
  margin-top: 1.8rem;
  text-align: center;
  font-size: 0.95rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#666'};
`;

const SwitchFormButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme === 'dark' ? '#4da3ff' : '#4285f4'};
  font-weight: 600;
  cursor: pointer;
  margin-left: 5px;
  transition: all 0.2s;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 1px;
    bottom: 0;
    left: 0;
    background-color: ${props => props.theme === 'dark' ? '#4da3ff' : '#4285f4'};
    transition: width 0.3s;
  }
  
  &:hover:after {
    width: 100%;
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

// Tái cấu trúc component Checkbox để tương tác tốt hơn
const Checkbox = ({ checked, onChange, label, theme }) => (
  <CheckboxContainer onClick={() => onChange(!checked)}>
    <HiddenCheckbox 
      type="checkbox" 
      checked={checked}
      onChange={e => onChange(e.target.checked)}
    />
    <StyledCheckbox checked={checked} theme={theme} />
    <CheckboxLabel theme={theme}>{label}</CheckboxLabel>
  </CheckboxContainer>
);

const LoginForm = ({ theme, switchToRegister,onLoginSuccess }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: true
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [redirectToHome, setRedirectToHome] = useState(false);
  useEffect(() => {
    if (redirectToHome) {
      const redirectTimer = setTimeout(() => {
        navigate('/');
      }, 800); // Độ trễ 800ms để đảm bảo toast được hiển thị trước khi chuyển trang
      
      return () => clearTimeout(redirectTimer);
    }
  }, [redirectToHome, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleCheckboxChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      rememberMe: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Đang đăng nhập với:", formData);
      
      const { usernameOrEmail, password, rememberMe } = formData;
      const response = await authService.login({ 
        usernameOrEmail, 
        password, 
        rememberMe
      });
      
      dispatch({
        type: 'auth/loginSuccess',
        payload: {
          user: response.user,
          token: response.token,
          rememberMe: formData.rememberMe
        }
      });
      
      // Hiển thị thông báo thành công với toast
      showSuccessToast('Đăng nhập thành công!');
      
      // Kiểm tra nếu có URL để chuyển hướng
      const redirectUrl = sessionStorage.getItem('redirectUrl');
      if (redirectUrl) {
        sessionStorage.removeItem('redirectUrl');
        setTimeout(() => navigate(redirectUrl), 800);
      } else {
        setRedirectToHome(true);
        setTimeout(() => {
          if (onLoginSuccess && typeof onLoginSuccess === 'function') {
            onLoginSuccess();
          }
        }, 800);
      }
      
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      // Hiển thị thông báo lỗi với toast
      showErrorToast(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      
      setErrors({
        general: error.message || 'Đăng nhập thất bại. Vui lòng thử lại.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Đăng nhập với ${provider}`);
    // Hiển thị toast thông báo tính năng đang phát triển
    showInfoToast(`Đăng nhập bằng ${provider} đang được phát triển!`);
  };

  if (showForgotPassword) {
    return <ForgotPasswordForm theme={theme} onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  return (
    <FormContainer
      theme={theme}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      <FormTitle>Đăng Nhập</FormTitle>
      {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}
      
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label theme={theme} htmlFor="usernameOrEmail">Tên đăng nhập hoặc Email</Label>
          <Input
            theme={theme}
            type="text"
            id="usernameOrEmail"
            name="usernameOrEmail"
            value={formData.usernameOrEmail}
            onChange={handleInputChange}
            placeholder="Nhập tên đăng nhập hoặc email"
          />
          {/* Đảm bảo icon đúng vị trí */}
          <InputIcon theme={theme}><FaUser /></InputIcon>
          {errors.usernameOrEmail && <ErrorMessage>{errors.usernameOrEmail}</ErrorMessage>}
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
            placeholder="Nhập mật khẩu"
          />
          {/* Đảm bảo icon đúng vị trí */}
          <InputIcon theme={theme}><FaLock /></InputIcon>
          {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
        </FormGroup>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <RememberMeContainer>
            <Checkbox
              checked={formData.rememberMe}
              onChange={handleCheckboxChange}
              label="Ghi nhớ đăng nhập"
              theme={theme}
            />
          </RememberMeContainer>
          
          <ForgotPasswordLink theme={theme}>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              setShowForgotPassword(true);
            }}>Quên mật khẩu?</a>
          </ForgotPasswordLink>
        </div>
        
        <SubmitButton type="submit" disabled={isLoading}>
          <span>{isLoading ? 'Đang xử lý...' : 
             redirectToHome ? 'Đăng nhập thành công...' : 'Đăng Nhập'}</span>
        </SubmitButton>
      </form>
      
      <OrDivider theme={theme}>
        <span>HOẶC</span>
      </OrDivider>
      
      <SocialButtonsContainer>
        <SocialButton 
          theme={theme} 
          provider="google"
          onClick={() => handleSocialLogin('google')}
        >
          <FaGoogle /> Google
        </SocialButton>
        <SocialButton 
          theme={theme} 
          provider="facebook"
          onClick={() => handleSocialLogin('facebook')}
        >
          <FaFacebook /> Facebook
        </SocialButton>
      </SocialButtonsContainer>
      
      <RegisterLink theme={theme}>
        Chưa có tài khoản? 
        <SwitchFormButton 
          theme={theme}
          type="button" 
          onClick={switchToRegister}
        >
          Đăng ký
        </SwitchFormButton>
      </RegisterLink>
    </FormContainer>
  );
};

export default LoginForm;