import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {  FaArrowLeft, FaRedo, FaHistory, FaFileAlt } from 'react-icons/fa';
import { getResultById } from '../../services/resultService';
import { showErrorToast } from '../../utils/toastUtils';

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
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

const ExamResults = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const response = await getResultById(resultId);
        setResult(response);
        setLoading(false);
      } catch (error) {
        showErrorToast('Không thể tải kết quả bài thi');
        setError('Không thể tải kết quả bài thi');
        setLoading(false);
      }
    };
    
    fetchResult();
  }, [resultId]);
  
  const getScoreMessage = (score) => {
    if (score >= 9) return 'Xuất sắc!';
    if (score >= 8) return 'Rất tốt!';
    if (score >= 7) return 'Tốt!';
    if (score >= 5) return 'Đạt yêu cầu';
    return 'Cần cố gắng hơn';
  };
  
  const handleGoBack = () => {
    navigate(`/subjects/${result?.examData?.subjectId}`);
  };
  
  const handleRetakeExam = () => {
    navigate(`/exams/${result?.examData?.id}`);
  };
  
  const handleViewHistory = () => {
    navigate('/results/history');
  };
  
  if (loading) {
    return <div>Đang tải...</div>;
  }
  
  if (error) {
    return (
      <Container>
        <div>Đã xảy ra lỗi: {error}</div>
      </Container>
    );
  }
  
  if (!result) {
    return (
      <Container>
        <div>Không tìm thấy thông tin kết quả bài thi</div>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <Title theme={theme}>Kết quả bài thi</Title>
        <ButtonGroup>
          <Button theme={theme} onClick={handleGoBack}>
            <FaArrowLeft />
            Quay lại
          </Button>
          <Button theme={theme} onClick={handleRetakeExam}>
            <FaRedo />
            Thi lại
          </Button>
          <Button theme={theme} primary onClick={handleViewHistory}>
            <FaHistory />
            Lịch sử
          </Button>
        </ButtonGroup>
      </Header>
      
      <ResultsGrid>
        <ScoreCardContainer>
          <ScoreCard
            theme={theme}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ScoreCircle score={result.score}>
              <ScoreValue>{result.score.toFixed(1)}</ScoreValue>
              <ScoreMax>/ 10</ScoreMax>
            </ScoreCircle>
            <ScoreLabel theme={theme}>Điểm số của bạn</ScoreLabel>
            <ScoreMessage score={result.score}>
              {getScoreMessage(result.score)}
            </ScoreMessage>
          </ScoreCard>
        </ScoreCardContainer>
        
        <ResultSection theme={theme}>
          <SectionTitle theme={theme}>Thống kê kết quả</SectionTitle>
          <StatGrid>
            <StatItem theme={theme}>
              <StatValue theme={theme} color="#48bb78">{result.correctAnswers}</StatValue>
              <StatLabel theme={theme}>Câu đúng</StatLabel>
            </StatItem>
            <StatItem theme={theme}>
              <StatValue theme={theme} color="#f56565">{result.incorrectAnswers}</StatValue>
              <StatLabel theme={theme}>Câu sai</StatLabel>
            </StatItem>
            <StatItem theme={theme}>
              <StatValue theme={theme} color="#ecc94b">{result.skippedAnswers}</StatValue>
              <StatLabel theme={theme}>Bỏ qua</StatLabel>
            </StatItem>
            <StatItem theme={theme}>
              <StatValue theme={theme}>{result.totalQuestions}</StatValue>
              <StatLabel theme={theme}>Tổng số câu</StatLabel>
            </StatItem>
          </StatGrid>
        </ResultSection>
        
        <ResultSection theme={theme}>
          <SectionTitle theme={theme}>Thông tin bài thi</SectionTitle>
          <div>
            <p><strong>Tên bài thi:</strong> {result.examData?.title || 'N/A'}</p>
            <p><strong>Môn học:</strong> {result.examData?.subject?.name || 'N/A'}</p>
            <p><strong>Thời gian làm bài:</strong> {result.examData?.duration || 'N/A'} phút</p>
            <p><strong>Ngày thi:</strong> {new Date(result.startTime).toLocaleString()}</p>
            <p><strong>Thời gian hoàn thành:</strong> {
              result.completionTime 
                ? `${Math.floor(result.completionTime / 60)} phút ${result.completionTime % 60} giây` 
                : 'N/A'
            }</p>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Button 
              theme={theme} 
              primary 
              as={Link} 
              to={`/exam-results/${resultId}/detail`}
            >
              <FaFileAlt />
              Xem chi tiết đáp án
            </Button>
          </div>
        </ResultSection>
      </ResultsGrid>
    </Container>
  );
};

export default ExamResults;