import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { FaExclamationTriangle } from 'react-icons/fa';

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

const WarningIcon = styled(FaExclamationTriangle)`
  font-size: 4rem;
  color: #e53e3e;
  margin: 0 auto 1.5rem;
  display: block;
`;

const WarningMessage = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: ${props => props.theme === 'dark' ? '#4a2a2a' : '#fff5f5'};
  color: ${props => props.theme === 'dark' ? '#f56565' : '#e53e3e'};
  border-radius: 8px;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const SubjectDetails = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: ${props => props.theme === 'dark' ? '#333' : '#f8f9fa'};
  border-radius: 8px;
`;

const DetailItem = styled.div`
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: block;
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.span`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
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
  
  &.danger {
    background-color: #e53e3e;
    color: white;
    
    &:hover {
      background-color: #c53030;
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
  text-align: center;
`;

const SuccessMessage = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2f855a' : '#f0fff4'};
  color: ${props => props.theme === 'dark' ? '#f0fff4' : '#2f855a'};
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1.5rem;
  text-align: center;
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

const DeleteSubject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [subject, setSubject] = useState(null);

  useEffect(() => {
    // Lấy theme từ localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Log access information
    console.log(`Delete Subject page accessed at: 2025-04-08 10:07:31 by user: vinhsonvlog`);
    
    // Fetch subject data
    const fetchSubject = async () => {
      try {
        const response = await axios.get(`/api/Subject/${id}`);
        setSubject(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching subject:', error);
        setError('Không thể tải thông tin môn học. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    if (id) {
      fetchSubject();
    } else {
      setLoading(false);
      setError('Không tìm thấy ID môn học');
    }
  }, [id]);

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    
    try {
      await axios.delete(`/api/Subject/${id}`);
      setSuccess('Xóa môn học thành công!');
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/subjects');
      }, 2000);
    } catch (error) {
      console.error('Error deleting subject:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi xóa môn học. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/subjects');
  };

  if (loading && !error && !success) {
    return (
      <PageContainer theme={theme}>
        <Header />
        <ContentContainer theme={theme}>
          <PageTitle theme={theme}>Xóa Môn Học</PageTitle>
          <LoadingSpinner />
        </ContentContainer>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer theme={theme}>
      <Header />
      
      <ContentContainer theme={theme}>
        <PageTitle theme={theme}>Xóa Môn Học</PageTitle>
        
        {success ? (
          <SuccessMessage theme={theme}>{success}</SuccessMessage>
        ) : (
          <>
            {error && <ErrorMessage theme={theme}>{error}</ErrorMessage>}
            
            {subject && (
              <>
                <WarningIcon />
                <WarningMessage theme={theme}>
                  <p><strong>Cảnh báo:</strong> Bạn đang chuẩn bị xóa một môn học. Hành động này không thể hoàn tác!</p>
                  <p>Tất cả dữ liệu liên quan, bao gồm đề thi và kết quả của học sinh, sẽ bị xóa vĩnh viễn.</p>
                </WarningMessage>
                
                <SubjectDetails theme={theme}>
                  <DetailItem>
                    <DetailLabel theme={theme}>Tên môn học:</DetailLabel>
                    <DetailValue theme={theme}>{subject.name}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel theme={theme}>Mã môn học:</DetailLabel>
                    <DetailValue theme={theme}>{subject.code}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel theme={theme}>Mô tả:</DetailLabel>
                    <DetailValue theme={theme}>{subject.description || 'Không có mô tả'}</DetailValue>
                  </DetailItem>
                </SubjectDetails>
                
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
                    type="button"
                    className="danger"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    {loading ? 'Đang xử lý...' : 'Xác nhận xóa'}
                  </Button>
                </ButtonGroup>
              </>
            )}
          </>
        )}
      </ContentContainer>
      
      <Footer />
    </PageContainer>
  );
};

export default DeleteSubject;