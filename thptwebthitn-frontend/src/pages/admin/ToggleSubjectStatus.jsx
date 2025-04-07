import styled from 'styled-components';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { fetchSubjectById } from '../redux/subjectSlice';
import { toggleSubjectStatusThunk } from 'toggleSubjectStatus';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Header from '../components/layout/Header';

// Styled Components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme === 'dark' ? '#1a1a1a' : '#f5f8fa'};
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
`;

const BreadcrumbNav = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  
  a {
    color: ${props => props.theme === 'dark' ? '#4da3ff' : '#4285f4'};
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  span {
    margin: 0 0.75rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  }
`;

const Card = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2d2d2d' : 'white'};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const CardHeader = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#3d4852' : '#edf2f7'};
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const SubjectInfo = styled.div`
  margin-bottom: 2rem;
`;

const SubjectTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const SubjectDescription = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  margin-bottom: 1rem;
`;

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  
  span {
    font-weight: 500;
    margin-right: 0.5rem;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
`;

const StatusBadge = styled.div`
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 500;
  background-color: ${props => props.isActive ? 
    (props.theme === 'dark' ? '#2a4d4a' : '#e6fffa') : 
    (props.theme === 'dark' ? '#4a2a2a' : '#fff5f5')
  };
  color: ${props => props.isActive ? 
    (props.theme === 'dark' ? '#4fd1c5' : '#38a169') : 
    (props.theme === 'dark' ? '#f56565' : '#e53e3e')
  };
`;

const ToggleButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#4285f4'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#3367d6'};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const CancelButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#718096' : '#cbd5e0'};
    transform: translateY(-2px);
  }
`;

const MetaInfo = styled.div`
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#3d4852' : '#edf2f7'};
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#718096' : '#a0aec0'};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#4a2a2a' : '#fff5f5'};
  color: ${props => props.theme === 'dark' ? '#f56565' : '#e53e3e'};
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const SuccessMessage = styled.div`
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#2a4d4a' : '#e6fffa'};
  color: ${props => props.theme === 'dark' ? '#4fd1c5' : '#38a169'};
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const ToggleContainer = styled.div`
  // ... styling
`;

const ToggleSubjectStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentSubject: subject, loading } = useSelector(state => state.subjects);
  const [theme, setTheme] = useState('light');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const currentUser = 'vinhsonvlog';

  useEffect(() => {
    // Lấy theme từ localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Fetch subject details
    if (id) {
      dispatch(fetchSubjectById(id));
    }
  }, [dispatch, id]);

  const handleToggleStatus = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);
      
      // Use the thunk to toggle subject status
      const resultAction = await dispatch(toggleSubjectStatusThunk(id));
      
      if (toggleSubjectStatusThunk.fulfilled.match(resultAction)) {
        setSuccess(`Trạng thái môn học "${subject.title}" đã được thay đổi thành công thành ${resultAction.payload.status ? 'kích hoạt' : 'vô hiệu hóa'}.`);
        // Refetch the subject to update UI
        dispatch(fetchSubjectById(id));
      } else {
        throw new Error(resultAction.payload || 'Không thể thay đổi trạng thái môn học');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi thay đổi trạng thái môn học');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper theme={theme}>
        <Header />
        <Container>
          <LoadingContainer>
            <LoadingSpinner size={40} />
          </LoadingContainer>
        </Container>
      </PageWrapper>
    );
  }

  if (!subject) {
    return (
      <PageWrapper theme={theme}>
        <Header />
        <Container>
          <Card theme={theme}>
            <ErrorMessage theme={theme}>
              Không tìm thấy môn học với ID: {id}
            </ErrorMessage>
            <CancelButton to="/subjects" theme={theme}>
              Quay lại danh sách môn học
            </CancelButton>
          </Card>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper theme={theme}>
      <Header />
      <Container>
        <BreadcrumbNav theme={theme}>
          <Link to="/subjects">Môn học</Link>
          <span>›</span>
          <Link to={`/subjects/${id}`}>{subject.title}</Link>
          <span>›</span>
          <span>Thay đổi trạng thái</span>
        </BreadcrumbNav>
        
        <Card
          theme={theme}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CardHeader theme={theme}>
            <PageTitle theme={theme}>Thay đổi trạng thái môn học</PageTitle>
          </CardHeader>
          
          {error && (
            <ErrorMessage theme={theme}>{error}</ErrorMessage>
          )}
          
          {success && (
            <SuccessMessage theme={theme}>{success}</SuccessMessage>
          )}
          
          <SubjectInfo>
            <SubjectTitle theme={theme}>{subject.title}</SubjectTitle>
            <SubjectDescription theme={theme}>{subject.description}</SubjectDescription>
          </SubjectInfo>
          
          <StatusInfo theme={theme}>
            <span>Trạng thái hiện tại:</span>
            <StatusBadge isActive={subject.status} theme={theme}>
              {subject.status ? 'Đang kích hoạt' : 'Đã vô hiệu hóa'}
            </StatusBadge>
          </StatusInfo>
          
          <ButtonGroup>
            <ToggleButton 
              onClick={handleToggleStatus} 
              disabled={isSubmitting}
              theme={theme}
            >
              {isSubmitting ? 'Đang xử lý...' : `${subject.status ? 'Vô hiệu hóa' : 'Kích hoạt'} môn học`}
            </ToggleButton>
            
            <CancelButton to="/subjects" theme={theme}>
              Hủy bỏ
            </CancelButton>
          </ButtonGroup>
          
          <MetaInfo theme={theme}>
            <div>Cập nhật lần cuối: {currentDate}</div>
            <div>Người thực hiện: {currentUser}</div>
          </MetaInfo>
        </Card>
      </Container>
    </PageWrapper>
  );
};

export default ToggleSubjectStatus;