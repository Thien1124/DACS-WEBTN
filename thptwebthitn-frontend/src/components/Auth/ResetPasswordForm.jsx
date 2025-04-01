import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { Link, useNavigate, useParams } from 'react-router-dom';

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
  
  a {
    color: ${props => props.theme === 'dark' ? '#4da3ff' : '#007bff'};
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ResetPasswordForm = ({ theme }) => {
  const { token } = useParams(); // Get token from URL
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu mới';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.confirmPassword !== formData.password) {
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
        // Here you would call your API to reset the password
        // const response = await resetPassword(token, formData.password);
        
        // For demo, we'll simulate an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsSubmitted(true);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        setErrors({
          general: 'Đã xảy ra lỗi khi đặt lại mật khẩu. Vui lòng thử lại.'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Verify token validity (would normally check on component mount)
  const isTokenValid = true; // This would be determined by an API call

  if (!isTokenValid) {
    return (
      <FormContainer
        theme={theme}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <FormTitle>Liên kết không hợp lệ</FormTitle>
        <p style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
        </p>
        <LoginLink theme={theme}>
          <Link to="/forgot-password">Yêu cầu liên kết mới</Link>
        </LoginLink>
      </FormContainer>
    );
  }

  return (
    <FormContainer
      theme={theme}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <FormTitle>Đặt Lại Mật Khẩu</FormTitle>
      
      {isSubmitted ? (
        <SuccessMessage theme={theme}>
          Mật khẩu của bạn đã được đặt lại thành công! Đang chuyển hướng đến trang đăng nhập...
        </SuccessMessage>
      ) : (
        <>
          {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}
          
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label theme={theme} htmlFor="password">Mật khẩu mới</Label>
              <Input
                theme={theme}
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu mới"
              />
              {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
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
        </>
      )}
    </FormContainer>
  );
};

export default ResetPasswordForm;