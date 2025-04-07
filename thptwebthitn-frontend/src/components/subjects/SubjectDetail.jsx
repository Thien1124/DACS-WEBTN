import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { fetchSubjectById } from '../../redux/subjectSlice';
import { getSubjectExams } from '../../services/subjectService';
import LoadingSpinner from '../common/LoadingSpinner';
import Header from '../layout/Header';

// Styled components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme === 'dark' ? '#1a1a1a' : '#f5f8fa'};
`;

const Container = styled(motion.div)`
  max-width: 1200px;
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

const SubjectHeader = styled(motion.div)`
  display: flex;
  margin-bottom: 2.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SubjectImage = styled.div`
  width: 320px;
  height: 220px;
  background-image: ${props => `url(${props.image || 'https://via.placeholder.com/320x220?text=Môn+học'})`};
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6));
  }
  
  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 1.5rem;
  }
`;

const SubjectGradeBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(45deg, #4285f4, #34a853);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
`;

const SubjectInfo = styled.div`
  flex: 1;
  padding-left: 2.5rem;
  
  @media (max-width: 768px) {
    padding-left: 0;
  }
`;

const SubjectTitle = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 700;
  
  span {
    background: linear-gradient(45deg, #4285f4, #34a853);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const SubjectDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
`;

const SubjectStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 1.5rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const StatIcon = styled.span`
  color: ${props => props.theme === 'dark' ? '#4da3ff' : '#4285f4'};
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${props => props.theme === 'dark' ? '#1a202c' : '#ebf8ff'};
  border-radius: 50%;
`;

const StatText = styled.span`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 500;
  font-size: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin: 2.5rem 0 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  position: relative;
  padding-bottom: 0.75rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(45deg, #4285f4, #34a853);
    border-radius: 3px;
  }
`;

const ExamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
  margin-top: 1.5rem;
`;

const ExamCard = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2d2d2d' : 'white'};
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
`;

const ExamContent = styled.div`
  padding: 1.5rem;
`;

const ExamTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 600;
`;

const ExamInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 0.95rem;
  margin-bottom: 1rem;
`;

const ExamDescription = styled.p`
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
  min-height: 4em;
  line-height: 1.5;
`;

const ExamMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#3d4852' : '#edf2f7'};
  padding-top: 1.25rem;
  margin-top: 0.5rem;
`;

const ExamDifficulty = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DifficultyDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => {
    if (props.level === 'easy') return '#38a169';
    if (props.level === 'medium') return '#ecc94b';
    return '#e53e3e';
  }};
`;

const DifficultyText = styled.span`
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const StartButton = styled(Link)`
  background: linear-gradient(45deg, #4285f4, #34a853);
  color: white;
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  
  svg {
    margin-left: 0.5rem;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
  }
`;

const NoExamsMessage = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: ${props => props.theme === 'dark' ? '#2d2d2d' : 'white'};
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
  margin-top: 2rem;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
  
  p {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  
  p {
    margin-top: 1rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
    font-size: 1.1rem;
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: ${props => props.theme === 'dark' ? '#3d2a2a' : '#fff5f5'};
  border-radius: 12px;
  margin: 2rem 0;
  
  h3 {
    color: ${props => props.theme === 'dark' ? '#feb2b2' : '#c53030'};
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  p {
    color: ${props => props.theme === 'dark' ? '#feb2b2' : '#c53030'};
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }
  
  a {
    display: inline-block;
    background-color: ${props => props.theme === 'dark' ? '#742a2a' : '#fff5f5'};
    color: ${props => props.theme === 'dark' ? '#feb2b2' : '#c53030'};
    border: 1px solid ${props => props.theme === 'dark' ? '#feb2b2' : '#c53030'};
    padding: 0.6rem 1.25rem;
    border-radius: 6px;
    font-size: 0.95rem;
    text-decoration: none;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: ${props => props.theme === 'dark' ? '#9b2c2c' : '#fed7d7'};
    }
  }
`;

const SubjectDetail = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentSubject: subject, loading: subjectLoading, error: subjectError } = useSelector(state => state.subjects);
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(true);
  const [examsError, setExamsError] = useState(null);
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    // Lấy theme từ localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Fetch subject details
    dispatch(fetchSubjectById(subjectId));
  }, [dispatch, subjectId]);
  
  useEffect(() => {
    const fetchExams = async () => {
      if (!subject) return;
      
      setExamsLoading(true);
      setExamsError(null);
      try {
        // Fetch subject exams
        const examsData = await getSubjectExams(subjectId);
        setExams(examsData);
      } catch (error) {
        console.error('Error fetching subject exams:', error);
        setExamsError('Không thể tải danh sách đề thi. Vui lòng thử lại sau.');
      } finally {
        setExamsLoading(false);
      }
    };
    
    fetchExams();
  }, [subject, subjectId]);
  
  const formatGradeLabel = (grade) => {
    return `Lớp ${grade}`;
  };
  
  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'Dễ';
      case 'medium':
        return 'Trung bình';
      case 'hard':
        return 'Khó';
      default:
        return 'Không xác định';
    }
  };
  
  if (subjectLoading) {
    return (
      <PageWrapper theme={theme}>
        <Header />
        <Container>
          <LoadingContainer theme={theme}>
            <LoadingSpinner size={50} />
            <p>Đang tải thông tin môn học...</p>
          </LoadingContainer>
        </Container>
      </PageWrapper>
    );
  }
  
  if (subjectError) {
    return (
      <PageWrapper theme={theme}>
        <Header />
        <Container>
          <ErrorMessage theme={theme}>
            <h3>Đã xảy ra lỗi</h3>
            <p>{subjectError}</p>
            <Link to="/subjects">Quay lại danh sách môn học</Link>
          </ErrorMessage>
        </Container>
      </PageWrapper>
    );
  }
  
  if (!subject) {
    return (
      <PageWrapper theme={theme}>
        <Header />
        <Container>
          <ErrorMessage theme={theme}>
            <h3>Không tìm thấy môn học</h3>
            <p>Môn học yêu cầu không tồn tại hoặc đã bị xóa.</p>
            <Link to="/subjects">Quay lại danh sách môn học</Link>
          </ErrorMessage>
        </Container>
      </PageWrapper>
    );
  }
  
  return (
    <PageWrapper theme={theme}>
      <Header />
      <Container
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <BreadcrumbNav theme={theme}>
          <Link to="/subjects">Các môn học</Link>
          <span>›</span>
          <span>{subject.title}</span>
        </BreadcrumbNav>
        
        <SubjectHeader
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SubjectImage image={subject.image}>
            <SubjectGradeBadge>{formatGradeLabel(subject.grade)}</SubjectGradeBadge>
          </SubjectImage>
          
          <SubjectInfo>
            <SubjectTitle theme={theme}>
              <span>{subject.title}</span>
            </SubjectTitle>
            <SubjectDescription theme={theme}>{subject.description}</SubjectDescription>
            
            <SubjectStats>
              <StatItem>
                <StatIcon theme={theme}>📝</StatIcon>
                <StatText theme={theme}>{subject.testsCount || 0} bài thi</StatText>
              </StatItem>
              <StatItem>
                <StatIcon theme={theme}>👥</StatIcon>
                <StatText theme={theme}>
                  {subject.popularity === 'high' && 'Độ phổ biến: Cao'}
                  {subject.popularity === 'medium' && 'Độ phổ biến: Trung bình'}
                  {subject.popularity === 'low' && 'Độ phổ biến: Thấp'}
                </StatText>
              </StatItem>
              <StatItem>
                <StatIcon theme={theme}>🔄</StatIcon>
                <StatText theme={theme}>Cập nhật: {subject.lastUpdated || 'Mới'}</StatText>
              </StatItem>
            </SubjectStats>
          </SubjectInfo>
        </SubjectHeader>
        
        <SectionTitle theme={theme}>
          <span>📋</span> Danh sách đề thi
        </SectionTitle>
        
        {examsLoading ? (
          <LoadingContainer theme={theme}>
            <LoadingSpinner size={40} />
            <p>Đang tải danh sách đề thi...</p>
          </LoadingContainer>
        ) : examsError ? (
          <ErrorMessage theme={theme}>
            <h3>Đã xảy ra lỗi</h3>
            <p>{examsError}</p>
          </ErrorMessage>
        ) : exams && exams.length > 0 ? (
          <ExamsGrid>
            {exams.map(exam => (
              <ExamCard 
                key={exam.id} 
                theme={theme}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <ExamContent>
                  <ExamTitle theme={theme}>{exam.title}</ExamTitle>
                  
                  <ExamInfo theme={theme}>
                    <span>{exam.questions || 0} câu hỏi</span>
                    <span>{exam.time || 45} phút</span>
                  </ExamInfo>
                  
                  <ExamDescription theme={theme}>{exam.description || 'Không có mô tả'}</ExamDescription>
                  
                  <ExamMeta theme={theme}>
                    <ExamDifficulty>
                      <DifficultyDot level={exam.difficulty} />
                      <DifficultyText theme={theme}>
                        Độ khó: {getDifficultyLabel(exam.difficulty)}
                      </DifficultyText>
                    </ExamDifficulty>
                    
                    <StartButton to={`/exams/${exam.id}`}>
                      Bắt đầu làm bài
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
                      </svg>
                    </StartButton>
                  </ExamMeta>
                </ExamContent>
              </ExamCard>
            ))}
          </ExamsGrid>
        ) : (
          <NoExamsMessage theme={theme}>
            <h3>Chưa có đề thi</h3>
            <p>Hiện tại chưa có đề thi nào cho môn học này. Vui lòng quay lại sau.</p>
          </NoExamsMessage>
        )}
      </Container>
    </PageWrapper>
  );
};

export default SubjectDetail;