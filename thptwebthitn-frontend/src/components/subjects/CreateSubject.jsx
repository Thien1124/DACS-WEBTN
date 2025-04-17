import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { createSubject } from '../../services/subjectService'; // Import service function

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme === 'dark' ? '#1a1a1a' : '#f5f8fa'};
`;

const ContentContainer = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 2rem auto;
  padding: 2rem;
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 5px;
  font-size: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#2d2d2d' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme === 'dark' ? '#4da3ff' : '#4285f4'};
    box-shadow: 0 0 0 2px ${props => props.theme === 'dark' ? 'rgba(77, 163, 255, 0.2)' : 'rgba(66, 133, 244, 0.2)'};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 5px;
  font-size: 1rem;
  min-height: 150px;
  resize: vertical;
  background-color: ${props => props.theme === 'dark' ? '#2d2d2d' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme === 'dark' ? '#4da3ff' : '#4285f4'};
    box-shadow: 0 0 0 2px ${props => props.theme === 'dark' ? 'rgba(77, 163, 255, 0.2)' : 'rgba(66, 133, 244, 0.2)'};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 5px;
  font-size: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#2d2d2d' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme === 'dark' ? '#4da3ff' : '#4285f4'};
    box-shadow: 0 0 0 2px ${props => props.theme === 'dark' ? 'rgba(77, 163, 255, 0.2)' : 'rgba(66, 133, 244, 0.2)'};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background-color: ${props => props.theme === 'dark' ? '#4285f4' : '#4285f4'};
    color: white;
    
    &:hover {
      background-color: ${props => props.theme === 'dark' ? '#3367d6' : '#3367d6'};
    }
  }
  
  &.secondary {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
    
    &:hover {
      background-color: ${props => props.theme === 'dark' ? '#718096' : '#cbd5e0'};
    }
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme === 'dark' ? '#f56565' : '#e53e3e'};
  margin-top: 0.5rem;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2f855a' : '#f0fff4'};
  color: ${props => props.theme === 'dark' ? '#f0fff4' : '#2f855a'};
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1.5rem;
  text-align: center;
`;

// Debug panel
const DebugPanel = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: ${props => props.theme === 'dark' ? '#333' : '#f8f9fa'};
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#e0e0e0'};
  border-radius: 5px;
  font-family: monospace;
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const CreateSubject = ({ theme: propTheme }) => {
  const navigate = useNavigate();
  // Use theme from props or get from localStorage
  const [theme, setTheme] = useState(propTheme || 'light');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    grade: ''
  });

  // Updated time and user
  const currentTime = "2025-04-08 10:21:31";
  const currentUser = "vinhsonvlog";

  // Component did mount effect
  useEffect(() => {
    // Set theme
    if (!propTheme) {
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);
    } else {
      setTheme(propTheme);
    }
    
    // Log component mounting
    console.log(`CreateSubject component mounted at: ${currentTime} by user: ${currentUser}`, { 
      theme: propTheme || 'from localStorage', 
      location: window.location.pathname 
    });
  }, [propTheme]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Trong hàm handleSubmit của CreateSubject.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate form
  if (!formData.name.trim()) {
    setError('Tên môn học không được để trống');
    return;
  }
  
  if (!formData.code.trim()) {
    setError('Mã môn học không được để trống');
    return;
  }
  
  setLoading(true);
  setError('');
  
  try {
    console.log(`[${currentTime}] Submitting form data:`, formData);
    
    // Gọi API để tạo môn học
    const result = await createSubject(formData);
    console.log(`[${currentTime}] API response:`, result);
    
    setSuccess('Tạo môn học thành công!');
    
    // Reset form sau khi thành công
    setFormData({
      name: '',
      code: '',
      description: ''
    });
    
    // Redirect after a short delay - với force reload để đảm bảo lấy dữ liệu mới
    setTimeout(() => {
      window.location.href = '/subjects'; // Sử dụng href thay vì navigate để reload trang
    }, 2000);
  } catch (error) {
    console.error(`[${currentTime}] Error creating subject:`, error);
    setError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo môn học. Vui lòng thử lại sau.');
  } finally {
    setLoading(false);
  }
};

  const handleCancel = () => {
    navigate('/subjects');
  };

  return (
    <PageContainer theme={theme}>
      <Header />
      
      <ContentContainer theme={theme}>
        <PageTitle theme={theme}>Tạo Môn Học Mới</PageTitle>
        
        {success && <SuccessMessage theme={theme}>{success}</SuccessMessage>}
        {error && <ErrorMessage theme={theme}>{error}</ErrorMessage>}
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label theme={theme}>Tên môn học *</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên môn học"
              theme={theme}
              disabled={loading}
            />
          </FormGroup>
          
          <FormGroup>
            <Label theme={theme}>Mã môn học *</Label>
            <Input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Nhập mã môn học (ví dụ: MATH10)"
              theme={theme}
              disabled={loading}
            />
          </FormGroup>
          <FormGroup>
            <Label theme={theme}>Khối lớp</Label>
            <Select
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              theme={theme}
              disabled={loading}
            >
              <option value="">-- Chọn khối lớp --</option>
              <option value="10">Lớp 10</option>
              <option value="11">Lớp 11</option>
              <option value="12">Lớp 12</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label theme={theme}>Mô tả</Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả về môn học"
              theme={theme}
              disabled={loading}
            />
          </FormGroup>
          
          <ButtonGroup>
            <Button
              type="button"
              className="secondary"
              onClick={handleCancel}
              theme={theme}
              disabled={loading}
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              className="primary"
              theme={theme}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Tạo môn học'}
            </Button>
          </ButtonGroup>
        </form>
       
      </ContentContainer>
      
      <Footer />
    </PageContainer>
  );
};

export default CreateSubject;