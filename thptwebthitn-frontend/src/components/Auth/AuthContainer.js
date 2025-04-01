import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const AuthWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
`;

const AuthForm = styled.form`
  width: 100%;
  max-width: 400px;
  padding: 20px;
  background-color: ${props => props.theme === 'dark' ? '#242424' : '#ffffff'};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const FormTitle = styled.h2`
  text-align: center;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: ${props => props.theme === 'dark' ? '#333' : '#fff'};
  color: ${props => props.theme === 'dark' ? '#fff' : '#333'};
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
  
  &:hover {
    background-color: #3367d6;
  }
`;

const ToggleText = styled.p`
  text-align: center;
  margin-top: 15px;
  
  span {
    color: #4285f4;
    cursor: pointer;
  }
`;

function AuthContainer() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add authentication logic here
    console.log('Form submitted:', formData);
    
    // Redirect to home after authentication
    navigate('/');
  };
  
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };
  
  return (
    <AuthWrapper>
      <AuthForm onSubmit={handleSubmit}>
        <FormTitle>{isLogin ? 'Login' : 'Sign Up'}</FormTitle>
        
        <FormGroup>
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </FormGroup>
        
        {!isLogin && (
          <FormGroup>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </FormGroup>
        )}
        
        <Button type="submit">
          {isLogin ? 'Login' : 'Sign Up'}
        </Button>
        
        <ToggleText>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={toggleAuthMode}>
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </ToggleText>
      </AuthForm>
    </AuthWrapper>
  );
}

export default AuthContainer;
