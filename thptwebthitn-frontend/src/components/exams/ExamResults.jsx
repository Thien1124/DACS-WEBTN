import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaRedo, FaHistory, FaFileAlt, FaCheck, FaTimes, FaClock, FaChartBar, FaTrophy } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import { mockExam } from '../../data/mockExamData';
import Header from '../layout/Header'; // Import Header component

// Styled Components
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex-grow: 1;
  padding-top: 80px; // Đủ khoảng cách để không bị che bởi header
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

// Đổi tên để tránh xung đột với component Header
const ResultHeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin: 0;
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#cbd5e0' : '#4a5568'};
  margin: 0.5rem 0 0 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.primary 
    ? 'linear-gradient(135deg, #4285f4, #34a853)' 
    : props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.primary ? '#ffffff' : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 992px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ScoreCardContainer = styled.div`
  grid-column: 1 / -1;
  
  @media (min-width: 992px) {
    grid-column: auto;
  }
`;

const ScoreCard = styled(motion.div)`
  background: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ScoreCircle = styled.div`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: ${props => {
    const score = props.score;
    if (score >= 8.5) return 'linear-gradient(135deg, #48bb78, #38a169)';
    if (score >= 7) return 'linear-gradient(135deg, #4299e1, #3182ce)';
    if (score >= 5) return 'linear-gradient(135deg, #ecc94b, #d69e2e)';
    return 'linear-gradient(135deg, #f56565, #c53030)';
  }};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  position: relative;
`;

const ScoreValue = styled.div`
  font-size: 3.5rem;
  font-weight: 700;
  color: white;
  line-height: 1;
`;

const ScoreMax = styled.div`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 0.25rem;
`;

const ScoreLabel = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  margin-bottom: 1rem;
`;

const ScoreMessage = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => {
    const score = props.score;
    if (score >= 8.5) return '#48bb78';
    if (score >= 7) return '#4299e1';
    if (score >= 5) return '#ecc94b';
    return '#f56565';
  }};
  margin-bottom: 1.5rem;
`;

const ResultSection = styled.div`
  background: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
  }
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 1.5rem 1rem;
  background: ${props => props.theme === 'dark' ? '#3a4966' : '#f7fafc'};
  border-radius: 10px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.05);
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.color || (props.theme === 'dark' ? '#e2e8f0' : '#2d3748')};
`;

const StatLabel = styled.div`
  font-size: 0.95rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  margin-top: 0.5rem;
`;

// Additional styled components for ExamResult component
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .icon {
    color: ${props => props.iconColor || '#4285f4'};
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }
  
  .value {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  .label {
    font-size: 0.95rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  }
`;

const SummarySection = styled.div`
  background: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
`;

const QuestionSummaryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const QuestionSummaryItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  background: ${props => props.theme === 'dark' ? '#3a4966' : '#f7fafc'};
  border-radius: 8px;
  border-left: 4px solid ${props => props.correct ? '#48bb78' : '#f56565'};
  
  .question-number {
    font-weight: 700;
    margin-right: 1rem;
  }
  
  .question-content {
    flex-grow: 1;
  }
  
  .result-indicator {
    color: ${props => props.correct ? '#48bb78' : '#f56565'};
    font-size: 1.2rem;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.primary 
    ? 'linear-gradient(135deg, #4285f4, #34a853)' 
    : props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.primary ? '#ffffff' : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const ExamResult = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui || { theme: 'light' });
  
  const [result, setResult] = useState(null);
  
  useEffect(() => {
    // Lấy kết quả từ localStorage
    const savedResult = localStorage.getItem('lastExamResult');
    if (savedResult) {
      setResult(JSON.parse(savedResult));
    } else {
      showErrorToast('Không tìm thấy kết quả bài thi');
    }
  }, [resultId]);
  
  const formattedTimeTaken = () => {
    if (!result) return '';
    const hours = Math.floor(result.timeTaken / 60);
    const minutes = result.timeTaken % 60;
    return `${hours > 0 ? hours + 'h ' : ''}${minutes}m`;
  };
  
  const handleRetakeExam = () => {
    navigate(`/exams/${result?.examId || 1}`);
  };
  
  const handleViewDetails = () => {
    navigate('/');
  };
  
  if (!result) {
    return (
      <PageContainer>
        <Header />
        <MainContent>
          <Container>
            <div>Đang tải kết quả bài thi...</div>
          </Container>
        </MainContent>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <Header />
      <MainContent>
        <Container>
          <ResultHeaderSection>
            <div>
              <Title theme={theme}>Kết quả bài thi</Title>
              <Subtitle theme={theme}>{mockExam.title}</Subtitle>
            </div>
            <ButtonGroup>
              <Button as={Link} to="/" theme={theme}>
                <FaArrowLeft />
                Trở về Trang Chủ
              </Button>
              <Button primary onClick={handleRetakeExam}>
                <FaRedo />
                Làm lại bài thi
              </Button>
            </ButtonGroup>
          </ResultHeaderSection>
          
          <ResultsGrid>
            <ScoreCardContainer>
              <ScoreCard
                theme={theme}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <FaTrophy size={40} style={{ color: '#f59e0b', marginBottom: '1rem' }} />
                <ScoreCircle score={result.score / 10}>
                  <ScoreValue>{result.score}</ScoreValue>
                  <ScoreMax>/100</ScoreMax>
                </ScoreCircle>
                <ScoreLabel theme={theme}>Điểm của bạn</ScoreLabel>
                <ScoreMessage score={result.score / 10}>
                  {result.score >= 85 ? 'Xuất sắc!' : 
                   result.score >= 70 ? 'Giỏi!' :
                   result.score >= 50 ? 'Đạt yêu cầu' : 
                   'Cần cố gắng hơn'}
                </ScoreMessage>
              </ScoreCard>
            </ScoreCardContainer>
            
            <ResultSection theme={theme}>
              <SectionTitle theme={theme}>
                <FaChartBar />
                Thông tin chi tiết
              </SectionTitle>
              <StatGrid>
                <StatItem theme={theme}>
                  <StatValue theme={theme} color="#4285f4">{result.totalCorrect}</StatValue>
                  <StatLabel theme={theme}>Câu trả lời đúng</StatLabel>
                </StatItem>
                <StatItem theme={theme}>
                  <StatValue theme={theme} color="#ea4335">{result.totalQuestions - result.totalCorrect}</StatValue>
                  <StatLabel theme={theme}>Câu trả lời sai</StatLabel>
                </StatItem>
                <StatItem theme={theme}>
                  <StatValue theme={theme} color="#fbbc05">{formattedTimeTaken()}</StatValue>
                  <StatLabel theme={theme}>Thời gian làm bài</StatLabel>
                </StatItem>
                <StatItem theme={theme}>
                  <StatValue theme={theme} color="#34a853">
                    {Math.round((result.totalCorrect / result.totalQuestions) * 100)}%
                  </StatValue>
                  <StatLabel theme={theme}>Tỷ lệ chính xác</StatLabel>
                </StatItem>
              </StatGrid>
            </ResultSection>
            
            <ResultSection theme={theme}>
              <SectionTitle theme={theme}>
                <FaFileAlt />
                Tổng quan các câu hỏi
              </SectionTitle>
              <QuestionSummaryList>
                {result.answers.map((answer, index) => {
                  const question = mockExam.questions.find(q => q.id === answer.questionId);
                  return (
                    <QuestionSummaryItem
                      key={answer.questionId}
                      theme={theme}
                      correct={answer.isCorrect}
                    >
                      <span className="question-number">#{index + 1}</span>
                      <div className="question-content">{question?.content || `Câu hỏi ${index + 1}`}</div>
                      <div className="result-indicator">
                        {answer.isCorrect ? <FaCheck /> : <FaTimes />}
                      </div>
                    </QuestionSummaryItem>
                  );
                })}
              </QuestionSummaryList>
            </ResultSection>
          </ResultsGrid>
          
          <ActionsContainer>
            <ActionButton theme={theme} onClick={handleRetakeExam}>
              <FaRedo />
              Làm lại bài thi
            </ActionButton>
            <ActionButton primary onClick={handleViewDetails}>
              <FaChartBar />
              Trở về trang chính
            </ActionButton>
          </ActionsContainer>
        </Container>
      </MainContent>
    </PageContainer>
  );
};

export default ExamResult;