import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import QuizQuestion from './QuizQuestion';

const ResultsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
`;

const ResultsHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const ResultsTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const ResultsSubtitle = styled.p`
  font-size: 1.1rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#666'};
  margin-bottom: 1.5rem;
`;

const ScoreCard = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const ScoreTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const ScoreCircle = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: ${props => {
    const score = props.score;
    if (score >= 8) return 'linear-gradient(135deg, #28a745, #20c997)';
    if (score >= 6.5) return 'linear-gradient(135deg, #17a2b8, #20c997)';
    if (score >= 5) return 'linear-gradient(135deg, #ffc107, #fd7e14)';
    return 'linear-gradient(135deg, #dc3545, #fd7e14)';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const ScoreValue = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: white;
`;

const ScoreInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  width: 100%;
  max-width: 600px;
  margin-top: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const InfoValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const InfoLabel = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#666'};
`;

const SummaryCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const SummaryTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const QuestionsContainer = styled.div`
  margin-top: 1rem;
`;

const QuestionsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const QuestionsTitle = styled.h3`
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const Toggle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#666'};
`;

const ToggleSwitch = styled.div`
  width: 3rem;
  height: 1.5rem;
  background-color: ${props => props.isActive ? '#007bff' : props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 1.5rem;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &::after {
    content: '';
    position: absolute;
    top: 0.15rem;
    left: ${props => props.isActive ? '1.6rem' : '0.15rem'};
    width: 1.2rem;
    height: 1.2rem;
    border-radius: 50%;
    background-color: white;
    transition: left 0.2s;
  }
`;

const FeedbackContainer = styled.div`
  margin-top: 2rem;
  text-align: center;
`;

const FeedbackMessage = styled.p`
  font-size: 1.1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  margin-bottom: 1rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled(Link)`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(45deg, #007bff, #00d6ff);
  color: white;
  
  &:hover {
    background: linear-gradient(45deg, #0069d9, #00c2e6);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled(Button)`
  background-color: ${props => props.theme === 'dark' ? '#333' : '#f8f9fa'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#444' : '#e9ecef'};
  }
`;

// Helper function to format time
const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (hrs > 0) parts.push(`${hrs} giờ`);
  if (mins > 0) parts.push(`${mins} phút`);
  if (secs > 0 || (hrs === 0 && mins === 0)) parts.push(`${secs} giây`);
  
  return parts.join(' ');
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const ExamResults = ({ theme }) => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const [result, setResult] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, you would fetch the results from an API
    // For demo purposes, we'll get it from localStorage
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        // Simulate API request delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const storedResult = localStorage.getItem(`exam_result_${examId}`);
        if (storedResult) {
          const parsedResult = JSON.parse(storedResult);
          
          // Calculate score
          let correctCount = 0;
          parsedResult.questions.forEach((question, index) => {
            if (parsedResult.answers[index] === question.correctAnswer) {
              correctCount++;
            }
          });
          
          const score = (correctCount / parsedResult.questions.length) * 10;
          
          setResult({
            ...parsedResult,
            score,
            correctCount
          });
        } else {
          // If no result found, redirect to subjects page
          navigate('/subjects');
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResults();
  }, [examId, navigate]);
  
  const toggleShowAll = () => {
    setShowAll(prev => !prev);
  };
  
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p>Đang tải kết quả...</p>
      </div>
    );
  }
  
  if (!result) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Không tìm thấy kết quả</h2>
        <p>Kết quả bài thi không tồn tại hoặc đã bị xóa.</p>
        <Button as="button" onClick={() => navigate('/subjects')}>Quay lại danh sách môn học</Button>
      </div>
    );
  }
  
  const { score, correctCount, questions, answers, timeSpent, submitTime } = result;
  
  // Determine feedback message based on score
  const getFeedbackMessage = (score) => {
    if (score >= 9) return 'Xuất sắc! Bạn đã nắm vững kiến thức.';
    if (score >= 8) return 'Rất tốt! Bạn đã hiểu hầu hết các khái niệm.';
    if (score >= 7) return 'Tốt! Bạn đã có kiến thức nền tảng vững.';
    if (score >= 6) return 'Khá! Bạn đã nắm được các điểm chính.';
    if (score >= 5) return 'Đạt! Bạn cần ôn tập thêm để củng cố kiến thức.';
    return 'Bạn cần ôn tập lại kiến thức và thử lại.';
  };
  
  return (
    <ResultsContainer>
      <ResultsHeader>
        <ResultsTitle theme={theme}>Kết quả bài thi</ResultsTitle>
        <ResultsSubtitle theme={theme}>{result.examTitle}</ResultsSubtitle>
      </ResultsHeader>
      
      <ScoreCard 
        theme={theme}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ScoreTitle theme={theme}>Điểm số của bạn</ScoreTitle>
        <ScoreCircle score={score}>
          <ScoreValue>{score.toFixed(1)}</ScoreValue>
        </ScoreCircle>
        
        <ScoreInfo>
          <InfoItem>
            <InfoValue theme={theme}>{correctCount}/{questions.length}</InfoValue>
            <InfoLabel theme={theme}>Câu trả lời đúng</InfoLabel>
          </InfoItem>
          <InfoItem>
            <InfoValue theme={theme}>{formatTime(timeSpent)}</InfoValue>
            <InfoLabel theme={theme}>Thời gian làm bài</InfoLabel>
          </InfoItem>
          <InfoItem>
            <InfoValue theme={theme}>{formatDate(submitTime)}</InfoValue>
            <InfoLabel theme={theme}>Ngày hoàn thành</InfoLabel>
          </InfoItem>
        </ScoreInfo>
        
        <FeedbackContainer>
          <FeedbackMessage theme={theme}>{getFeedbackMessage(score)}</FeedbackMessage>
        </FeedbackContainer>
      </ScoreCard>
      
      <SummaryCard theme={theme}>
        <QuestionsHeader>
          <QuestionsTitle theme={theme}>Chi tiết bài làm</QuestionsTitle>
          <Toggle>
            <span>Hiển thị tất cả câu hỏi</span>
            <ToggleSwitch 
              theme={theme} 
              isActive={showAll} 
              onClick={toggleShowAll}
            />
          </Toggle>
        </QuestionsHeader>
        
        <QuestionsContainer>
          {questions.map((question, index) => {
            // If showAll is false, only show incorrect answers
            const shouldShow = showAll || answers[index] !== question.correctAnswer;
            
            if (!shouldShow) return null;
            
            return (
              <QuizQuestion
                key={index}
                theme={theme}
                question={question}
                number={index + 1}
                selectedOption={answers[index]}
                isReviewMode={true}
                correctAnswer={question.correctAnswer}
              />
            );
          })}
        </QuestionsContainer>
      </SummaryCard>
      
      <ButtonContainer>
        <SecondaryButton 
          theme={theme}
          to="/subjects"
        >
          Quay lại danh sách môn học
        </SecondaryButton>
        <PrimaryButton 
          to={`/subjects/${examId.split('-')[0]}`}
        >
          Làm bài thi khác
        </PrimaryButton>
      </ButtonContainer>
    </ResultsContainer>
  );
};

export default ExamResults;
