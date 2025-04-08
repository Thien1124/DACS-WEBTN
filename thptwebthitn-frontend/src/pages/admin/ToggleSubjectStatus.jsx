import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { toggleSubjectStatus } from '../../services/subjectService';
import { FaToggleOn, FaToggleOff } from 'react-icons/fa';

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

const StatusCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 2rem 0;
  padding: 2rem;
  background-color: ${props => props.theme === 'dark' ? '#333' : '#f8f9fa'};
  border-radius: 10px;
  text-align: center;
`;

const StatusIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  color: ${props => props.active ? '#48bb78' : '#a0aec0'};
`;

const StatusTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const StatusDescription = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  margin-bottom: 1.5rem;
`;

const ToggleButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.active ? '#48bb78' : '#a0aec0'};
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    font-size: 1.2rem;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: ${props => props.active ? '#38a169' : '#718096'};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.secondary {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
    
    &:hover {
      background-color: ${props => props.theme === 'dark' ? '#718096' : '#cbd5e0'};
    }
  }
`;

const SuccessMessage = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2f855a' : '#f0fff4'};
  color: ${props => props.theme === 'dark' ? '#f0fff4' : '#2f855a'};
  padding: 1rem;
  border-radius: 5px;
  margin: 1.5rem 0;
  text-align: center;
`;

const ErrorMessage = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#4a2a2a' : '#fff5f5'};
  color: ${props => props.theme === 'dark' ? '#f56565' : '#e53e3e'};
  padding: 1rem;
  border-radius: 5px;
  margin: 1.5rem 0;
  text-align: center;
`;

const SubjectDetails = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: ${props => props.theme === 'dark' ? '#333' : '#f8f9fa'};
  border-radius: 8px;
`;

const DetailItem = styled.div`
  margin-bottom: 0.5rem;
  display: flex;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  width: 120px;
`;

const DetailValue = styled.span`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  flex: 1;
`;

// Thêm LoadingSpinner component để hiển thị trạng thái loading
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

const ToggleSubjectStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [subject, setSubject] = useState(null);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Lấy theme từ localStorage khi component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Cập nhật log thời gian truy cập
    console.log(`Toggle Subject Status page accessed at: 2025-04-08 06:50:32 by user: vinhsonvlog`);
    
    // Fetch subject data
    const fetchSubject = async () => {
      try {
        // Giả lập API call 
        const mockSubject = {
          id: id,
          title: 'Toán học',
          description: 'Môn học về toán và các ứng dụng thực tế',
          grade: '10',
          status: true,
          examCount: 5
        };
        
        setSubject(mockSubject);
        setActive(mockSubject.status);
        setLoading(false);
      } catch (err) {
        setError('Không thể tải thông tin môn học. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    if (id) {
      fetchSubject();
    } else {
      navigate('/subjects');
    }
  }, [id, navigate]);
  
  const handleToggle = async () => {
    try {
      setLoading(true);
      // Call API to toggle status
      await toggleSubjectStatus(id);
      
      // Update local state
      setActive(!active);
      setSuccess(`Đã ${!active ? 'bật' : 'tắt'} trạng thái môn học thành công!`);
      
      // Update subject state
      setSubject(prev => ({
        ...prev,
        status: !active
      }));
      
      setLoading(false);
    } catch (err) {
      setError('Có lỗi xảy ra khi thay đổi trạng thái môn học. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    navigate('/subjects');
  };
  
  // Format khối lớp
  const formatGrade = (grade) => {
    if (!grade) return 'N/A';
    return `Lớp ${grade}`;
  };

  return (
    <PageContainer theme={theme}>
      <Header />
      
      <ContentContainer theme={theme}>
        <PageTitle theme={theme}>Quản lý trạng thái môn học</PageTitle>
        
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage theme={theme}>{error}</ErrorMessage>
        ) : subject ? (
          <>
            <SubjectDetails theme={theme}>
              <DetailItem>
                <DetailLabel theme={theme}>Tên môn học:</DetailLabel>
                <DetailValue theme={theme}>{subject.title}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel theme={theme}>Khối lớp:</DetailLabel>
                <DetailValue theme={theme}>{formatGrade(subject.grade)}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel theme={theme}>Số đề thi:</DetailLabel>
                <DetailValue theme={theme}>{subject.examCount || 0}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel theme={theme}>Trạng thái:</DetailLabel>
                <DetailValue theme={theme}>{active ? 'Đang hoạt động' : 'Đã tắt'}</DetailValue>
              </DetailItem>
            </SubjectDetails>
            
            {success && <SuccessMessage theme={theme}>{success}</SuccessMessage>}
            
            <StatusCard theme={theme}>
              <StatusIcon active={active}>
                {active ? <FaToggleOn /> : <FaToggleOff />}
              </StatusIcon>
              <StatusTitle theme={theme}>
                {active ? 'Môn học đang hoạt động' : 'Môn học đang bị tắt'}
              </StatusTitle>
              <StatusDescription theme={theme}>
                {active 
                  ? 'Học sinh có thể xem và làm các đề thi của môn học này.'
                  : 'Môn học đang bị ẩn. Học sinh không thể xem hoặc làm các đề thi của môn học này.'}
              </StatusDescription>
              <ToggleButton 
                active={active} 
                onClick={handleToggle}
                disabled={loading}
              >
                {active ? <FaToggleOff /> : <FaToggleOn />}
                {active ? 'Tắt môn học' : 'Bật môn học'}
              </ToggleButton>
            </StatusCard>
            
            <ButtonGroup>
              <Button 
                className="secondary" 
                onClick={handleBack}
                theme={theme}
              >
                Quay lại danh sách
              </Button>
            </ButtonGroup>
          </>
        ) : (
          <p>Không tìm thấy thông tin môn học.</p>
        )}
        
      </ContentContainer>
      
      <Footer />
    </PageContainer>
  );
};

export default ToggleSubjectStatus;