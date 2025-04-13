import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { fetchExamsBySubject, fetchExamsForStudents } from '../../redux/examSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaClock, FaChalkboardTeacher, FaClipboardList, FaPlay } from 'react-icons/fa';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
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

const ExamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ExamCard = styled(motion.div)`
  background: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
`;

const ExamHeader = styled.div`
  background: linear-gradient(135deg, #4285f4, #34a853);
  color: white;
  padding: 1rem;
  position: relative;
`;

const ExamTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const ExamAuthor = styled.p`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const ExamContent = styled.div`
  padding: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const ExamInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  
  svg {
    margin-right: 0.5rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  }
`;

const ExamFooter = styled.div`
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const ExamButton = styled.button`
  background: linear-gradient(135deg, #4285f4, #34a853);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const DifficultyBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${props => {
    switch(props.difficulty?.toLowerCase()) {
      case 'easy': return '#c6f6d5';
      case 'medium': return '#fefcbf';
      case 'hard': return '#fed7d7';
      default: return '#e2e8f0';
    }
  }};
  color: ${props => {
    switch(props.difficulty?.toLowerCase()) {
      case 'easy': return '#22543d';
      case 'medium': return '#744210';
      case 'hard': return '#742a2a';
      default: return '#2d3748';
    }
  }};
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 0.25rem;
  border: 1px solid ${props => props.active ? '#4285f4' : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 5px;
  background-color: ${props => props.active ? '#4285f4' : 'transparent'};
  color: ${props => props.active ? '#ffffff' : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ExamList = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list: exams, loading, pagination } = useSelector(state => state.exams);
  const { user } = useSelector(state => state.auth);
  const { theme } = useSelector(state => state.ui);
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    if (subjectId) {
      if (user?.role === 'Admin' || user?.role === 'Teacher') {
        dispatch(fetchExamsBySubject(subjectId));
      } else {
        dispatch(fetchExamsForStudents(subjectId));
      }
    }
  }, [dispatch, subjectId, user, page]);
  
  const handleStartExam = (examId) => {
    navigate(`/exams/${examId}`);
  };
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <Container>
      <Header>
        <Title theme={theme}>Danh sách đề thi</Title>
        <Subtitle theme={theme}>Chọn đề thi bạn muốn làm bài</Subtitle>
      </Header>
      
      {exams?.length === 0 ? (
        <div>Không tìm thấy đề thi cho môn học này.</div>
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
                    <span>Độ khó: <DifficultyBadge difficulty={exam.difficulty}>{exam.difficulty || 'Trung bình'}</DifficultyBadge></span>
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
          
          {pagination && pagination.totalPages > 1 && (
            <PaginationContainer>
              <PageButton 
                theme={theme} 
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
              >
                &lt;
              </PageButton>
              
              {[...Array(pagination.totalPages).keys()].map(num => (
                <PageButton 
                  key={num + 1}
                  theme={theme}
                  active={page === num + 1}
                  onClick={() => handlePageChange(num + 1)}
                >
                  {num + 1}
                </PageButton>
              ))}
              
              <PageButton 
                theme={theme}
                disabled={page === pagination.totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                &gt;
              </PageButton>
            </PaginationContainer>
          )}
        </>
      )}
    </Container>
  );
};

export default ExamList;