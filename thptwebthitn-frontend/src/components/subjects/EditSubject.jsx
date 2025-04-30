import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import Header from '../layout/Header';
import Footer from '../layout/Footer';

import { showSuccessToast, showErrorToast, showWarningToast } from '../../utils/toastUtils';

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

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4A5568' : '#E2E8F0'};
  border-radius: 0.375rem;
  background-color: ${props => props.theme === 'dark' ? '#2D3748' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#E2E8F0' : '#2D3748'};
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 1px #4299e1;
  }
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-left-color: #4285f4;
  animation: spin 1s linear infinite;
  margin: 2rem auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const RetryButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${props => props.theme === 'dark' ? '#4285f4' : '#4285f4'};
  color: white;
  border: none;
  border-radius: 4px;
  margin-top: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#3367d6' : '#3367d6'};
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

// Thêm biến initialLoad ở đầu component
const EditSubject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const isMounted = useRef(true);
  // Biến này đang được sử dụng nhưng chưa khai báo
  const initialLoad = useRef(true);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    grade: ''
  });

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Sửa hàm fetchSubject để debug và hiển thị toast chính xác
  const fetchSubject = async () => {
    if (!isMounted.current) return;

    setLoading(true);
    setError('');
    
    try {
      // Log để debug endpoint
      console.log(`Fetching subject with ID: ${id} from API`);
      
      // Sử dụng URL trực tiếp để đảm bảo không có vấn đề với biến môi trường
      const response = await axios.get(`http://localhost:5006/api/Subject/${id}`);
      
      if (response.data && isMounted.current) {
        const subjectData = response.data;
        console.log('API Response Data:', subjectData);
        
        // Log để xem chính xác trường gradeLevel trong response
        console.log('Grade from API:', subjectData.gradeLevel);
        
        setFormData({
          name: subjectData.name || '',
          code: subjectData.code || '',
          description: subjectData.description || '',
          // Đảm bảo lấy đúng trường gradeLevel và chuyển thành string
          grade: subjectData.gradeLevel?.toString() || ''
        });
        
        // Force hiển thị toast khi không phải lần tải đầu hoặc khi bấm nút Thử lại
        if (!initialLoad.current) {
          showSuccessToast('Tải thông tin môn học thành công!');
        }
        
        // Đánh dấu đã tải lần đầu
        initialLoad.current = false;
      }
    } catch (err) {
      console.error('Lỗi khi tải thông tin môn học:', err);
      if (isMounted.current) {
        setError('Không thể tải thông tin môn học. Vui lòng thử lại sau.');
        // Chỉ hiển thị toast lỗi khi không phải lần tải đầu tiên hoặc khi bấm nút Thử lại
        if (!initialLoad.current) {
          showErrorToast('Không thể tải thông tin môn học');
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    if (id) {
      fetchSubject();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Sửa hàm handleSubmit để đảm bảo gửi payload đúng
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      showWarningToast('Tên môn học không được để trống');
      return;
    }
    
    if (!formData.code.trim()) {
      showWarningToast('Mã môn học không được để trống');
      return;
    }
    
    if (formData.grade) {
      const gradeValue = parseInt(formData.grade, 10);
      if (gradeValue < 10 || gradeValue > 12) {
        
        showWarningToast('Khối lớp phải có giá trị từ 10 đến 12');
        return;
      }
    }
    
    setLoading(true);
    setError(''); // Thêm dòng này để xóa lỗi cũ
    
    try {
      // Đảm bảo đúng định dạng payload cho API
      const payload = {
        id: parseInt(id, 10),
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description || '',
        gradeLevel: formData.grade ? parseInt(formData.grade, 10) : null
      };
      
      // Log chi tiết payload để debug
      console.log('Sending update payload:', payload);
      
      // Sử dụng URL cụ thể thay vì biến môi trường
      const response = await axios.put(`http://localhost:5006/api/Subject/${id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('API Response:', response.data);
      
      if (isMounted.current) {
        // Hiển thị thông báo success
        setSuccess('Cập nhật môn học thành công!');
        
        // Tạo promise và đợi toast hoàn thành trước khi redirect
        await new Promise(resolve => {
          // Hiển thị toast và đăng ký callback khi toast đóng
          showSuccessToast('Cập nhật môn học thành công!', resolve);
        });
        
        // XÓA hai đoạn setTimeout duplicate - chỉ để lại một đoạn dưới đây
        if (isMounted.current) {
          // Chuyển hướng chỉ sau khi toast hoàn thành
          navigate('/subjects');
        }
      }
    } catch (error) {
      console.error('Error updating subject:', error);
      
      // Log chi tiết lỗi để debug
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
      
      if (isMounted.current) {
        const errorMessage = error.response?.data?.message || 
                           error.response?.data?.title ||
                           'Có lỗi xảy ra khi cập nhật môn học. Vui lòng thử lại sau.';
        setError(errorMessage);
        showErrorToast(errorMessage);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    navigate('/subjects');
  };

  if (loading && !error) {
    return (
      <PageContainer theme={theme}>
        <Header />
        <ContentContainer theme={theme}>
          <PageTitle theme={theme}>Cập Nhật Môn Học</PageTitle>
          <LoadingSpinner />
          <p style={{textAlign: 'center', marginTop: '1rem'}}>Đang tải thông tin môn học...</p>
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer theme={theme}>
      <Header />
      {/* Xóa ToastContainer ở đây vì nó đã được định nghĩa ở cấp cao hơn trong ứng dụng */}
      
      <ContentContainer theme={theme}>
        <PageTitle theme={theme}>Cập Nhật Môn Học</PageTitle>
        
        {success && <SuccessMessage theme={theme}>{success}</SuccessMessage>}
        {error && (
          <ErrorMessage theme={theme}>
            {error}
            <RetryButton 
              theme={theme} 
              onClick={fetchSubject}
              disabled={loading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
              </svg>
              Thử lại
            </RetryButton>
          </ErrorMessage>
        )}
        
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
              {loading ? 'Đang xử lý...' : 'Cập nhật môn học'}
            </Button>
          </ButtonGroup>
        </form>
      </ContentContainer>
      
      <Footer />
    </PageContainer>
  );
};

export default EditSubject;