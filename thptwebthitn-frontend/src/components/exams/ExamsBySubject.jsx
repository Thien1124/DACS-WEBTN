import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { fetchExamsBySubject } from '../../redux/examSlice';
import { fetchSubjectById } from '../../redux/subjectSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaClock, FaChalkboardTeacher, FaClipboardList, FaPlay, FaArrowLeft, FaHistory } from 'react-icons/fa';

const ExamsBySubject = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const { theme } = useSelector(state => state.ui);
  
  const { list: exams, loading } = useSelector(state => state.exams);
  const { currentSubject } = useSelector(state => state.subjects);
  
  const [page, setPage] = useState(1);
  const [perPage] = useState(9);
  
  useEffect(() => {
    if (subjectId) {
      dispatch(fetchSubjectById(subjectId));
      dispatch(fetchExamsBySubject({ subjectId, page, limit: perPage }));
    }
  }, [dispatch, subjectId, page, perPage]);
  
  const handleStartExam = (examId) => {
    navigate(`/exams/${examId}`);
  };
  
  const handleBackToSubjects = () => {
    navigate('/subjects');
  };
  
  const handleViewHistory = () => {
    navigate('/exam-history');
  };
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <Container>
      <Header>
        <div>
          <Title theme={theme}>
            {currentSubject ? `Đề thi môn ${currentSubject.name}` : 'Đề thi'}
          </Title>
          <Subtitle theme={theme}>Chọn đề thi bạn muốn làm bài</Subtitle>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button theme={theme} onClick={handleBackToSubjects}>
            <FaArrowLeft /> Quay lại môn học
          </Button>
          <Button theme={theme} primary onClick={handleViewHistory}>
            <FaHistory /> Xem lịch sử
          </Button>
        </div>
      </Header>
      
      {exams?.length === 0 ? (
        <EmptyState theme={theme}>Không tìm thấy đề thi cho môn học này.</EmptyState>
      ) : (
        <>
          <ExamsGrid>
            {exams?.map(exam => (
              <ExamCard 
                key={exam.id} 
                theme={theme}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <ExamHeader>
                  <ExamTitle>{exam.title}</ExamTitle>
                  <ExamAuthor>Tạo bởi: {exam.createdBy || 'Admin'}</ExamAuthor>
                </ExamHeader>
                <ExamContent theme={theme}>
                  <ExamInfo theme={theme}>
                    <FaClock />
                    <span>Thời gian: {exam.duration} phút</span>
                  </ExamInfo>
                  <ExamInfo theme={theme}>
                    <FaClipboardList />
                    <span>Số câu hỏi: {exam.questionCount || exam.questions?.length || 'N/A'}</span>
                  </ExamInfo>
                  <ExamInfo theme={theme}>
                    <FaChalkboardTeacher />
                    <span>Độ khó: <DifficultyBadge difficulty={exam.difficulty || 'medium'}>
                      {exam.difficulty === 'easy' ? 'Dễ' : 
                       exam.difficulty === 'hard' ? 'Khó' : 'Trung bình'}
                    </DifficultyBadge></span>
                  </ExamInfo>
                </ExamContent>
                <ExamFooter theme={theme}>
                  <div>
                    {exam.isPublic ? 'Công khai' : 'Giới hạn'}
                  </div>
                  <ExamButton onClick={() => handleStartExam(exam.id)}>
                    <FaPlay /> Bắt đầu
                  </ExamButton>
                </ExamFooter>
              </ExamCard>
            ))}
          </ExamsGrid>
          
          <PaginationContainer>
            <PageButton 
              theme={theme} 
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              &lt;
            </PageButton>
            
            {[...Array(5)].map((_, index) => {
              const pageNum = page - 2 + index;
              if (pageNum < 1) return null;
              return (
                <PageButton 
                  key={index}
                  theme={theme}
                  active={pageNum === page}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </PageButton>
              )
            })}
            
            <PageButton 
              theme={theme} 
              onClick={() => handlePageChange(page + 1)}
            >
              &gt;
            </PageButton>
          </PaginationContainer>
        </>
      )}
    </Container>
  );
};

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 1.1rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  background-color: ${props => props.primary ? '#4299e1' : props.theme === 'dark' ? '#2d3748' : '#e2e8f0'};
  color: ${props => props.primary ? 'white' : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:hover {
    background-color: ${props => props.primary ? '#3182ce' : props.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
  }
`;

const ExamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ExamCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : 'white'};
`;

const ExamHeader = styled.div`
  padding: 1rem;
  background-color: #4299e1;
  color: white;
`;

const ExamTitle = styled.h3`
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
`;

const ExamAuthor = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const ExamContent = styled.div`
  padding: 1rem;
  flex-grow: 1;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : 'white'};
`;

const ExamInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  svg {
    color: #4299e1;
  }
`;

const DifficultyBadge = styled.span`
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${props => 
    props.difficulty === 'easy' ? '#48bb78' : 
    props.difficulty === 'hard' ? '#f56565' : '#ecc94b'};
  color: white;
  margin-left: 0.5rem;
`;

const ExamFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f7fafc'};
  border-top: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  
  div {
    font-size: 0.9rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  }
`;

const ExamButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background-color: #4299e1;
  color: white;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #3182ce;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  background-color: ${props => props.active 
    ? '#4299e1' 
    : props.theme === 'dark' ? '#2d3748' : '#e2e8f0'};
  color: ${props => props.active 
    ? 'white' 
    : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active 
      ? '#3182ce' 
      : props.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 1.1rem;
`;

export default ExamsBySubject;