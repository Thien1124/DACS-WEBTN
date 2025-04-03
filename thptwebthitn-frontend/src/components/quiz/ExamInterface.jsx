import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import QuizQuestion from './QuizQuestion';
import LoadingSpinner from '../common/LoadingSpinner';
import { getExamById, startExam, submitExam } from '../../services/examService';

const ExamContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 64px);
`;

const ExamHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const ExamTitle = styled.h1`
  font-size: 1.8rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  margin: 0;
`;

const ExamInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const TimeRemaining = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 8px;
  padding: 0.6rem 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const TimeIcon = styled.span`
  color: ${props => {
    if (props.isLow) return '#e74c3c';
    return props.theme === 'dark' ? '#4da3ff' : '#007bff';
  }};
`;

const TimeText = styled.div`
  font-weight: 600;
  font-size: 1rem;
  color: ${props => {
    if (props.isLow) return '#e74c3c';
    return props.theme === 'dark' ? '#e2e8f0' : '#333';
  }};
`;

const SubmitButton = styled.button`
  background: linear-gradient(45deg, #007bff, #00d6ff);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(45deg, #0069d9, #00c2e6);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: translateY(0);
    box-shadow: none;
  }
`;

const QuestionsContainer = styled.div`
  flex: 1;
  margin-bottom: 2rem;
`;

const NavigationBar = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  padding: 1rem;
  margin-bottom: 1.5rem;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const QuestionNav = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const QuestionButton = styled.button`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  background-color: ${props => {
    if (props.isSelected) return '#007bff';
    if (props.isAnswered) return props.theme === 'dark' ? '#3a5a8c' : '#e6f0ff';
    return props.theme === 'dark' ? '#444' : '#f1f1f1';
  }};
  
  color: ${props => {
    if (props.isSelected) return 'white';
    if (props.isAnswered) return props.theme === 'dark' ? '#e2e8f0' : '#007bff';
    return props.theme === 'dark' ? '#e2e8f0' : '#555';
  }};
  
  border: 1px solid ${props => {
    if (props.isSelected) return '#007bff';
    if (props.isAnswered) return props.theme === 'dark' ? '#3a5a8c' : '#007bff';
    return props.theme === 'dark' ? '#555' : '#ddd';
  }};
  
  &:hover {
    background-color: ${props => {
      if (props.isSelected) return '#007bff';
      return props.theme === 'dark' ? '#555' : '#e9ecef';
    }};
  }
`;

const ExamFooter = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const NavButton = styled.button`
  background-color: ${props => props.theme === 'dark' ? '#333' : '#f8f9fa'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#444' : '#e9ecef'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const FinalSubmitButton = styled.button`
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: linear-gradient(45deg, #218838, #1ba87e);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const ConfirmationModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const ModalText = styled.p`
  margin-bottom: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#555'};
  line-height: 1.5;
`;

const ModalInfo = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#333' : '#f8f9fa'};
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#555'};
`;

const InfoValue = styled.span`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CancelButton = styled.button`
  background-color: ${props => props.theme === 'dark' ? '#444' : '#f1f1f1'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#555' : '#e9ecef'};
  }
  
  @media (max-width: 768px) {
    order: 2;
  }
`;

const ConfirmButton = styled.button`
  background: linear-gradient(45deg, #28a745, #20c997);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(45deg, #218838, #1ba87e);
  }
  
  @media (max-width: 768px) {
    order: 1;
    margin-bottom: 0.5rem;
  }
`;

// Helper function to format time
const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (hrs > 0) parts.push(`${hrs}h`);
  if (mins > 0) parts.push(`${mins}m`);
  if (secs > 0 || (hrs === 0 && mins === 0)) parts.push(`${secs}s`);
  
  return parts.join(' ');
};

const ExamInterface = ({ theme }) => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  
  const timerRef = useRef(null);
  
  // Fetch exam data and start session
  useEffect(() => {
    const fetchExam = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Get exam details
        const examData = await getExamById(examId);
        setExam(examData);
        
        // Start exam session
        const session = await startExam(examId);
        setSessionId(session.id);
        
        // Set time remaining
        setTimeRemaining(examData.duration * 60); // Convert minutes to seconds
        
        // Initialize answers array
        setAnswers(new Array(examData.questions.length).fill(null));
      } catch (error) {
        console.error('Error fetching exam:', error);
        setError('Không thể bắt đầu bài thi. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExam();
    
    // Clean up timer when component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [examId]);
  
  // Start timer when exam data is loaded
  useEffect(() => {
    if (timeRemaining !== null && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Auto submit exam when time is up
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeRemaining]);
  
  const handleSelectOption = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handleGoToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    window.scrollTo(0, 0);
  };
  
  const handleOpenConfirmModal = () => {
    setShowConfirmModal(true);
  };
  
  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
  };
  
  const handleSubmitExam = async () => {
    clearInterval(timerRef.current);
    
    setIsLoading(true);
    try {
      // Submit exam answers
      const timeSpent = exam.duration * 60 - timeRemaining;
      const result = await submitExam(examId, answers, timeSpent);
      
      // Navigate to results page
      navigate(`/exam-results/${result.id}`);
    } catch (error) {
      console.error('Error submitting exam:', error);
      setError('Không thể nộp bài thi. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };
  
  if (isLoading && !exam) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <LoadingSpinner text="Đang tải đề thi..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Đã xảy ra lỗi</h2>
        <p>{error}</p>
        <button 
          onClick={() => navigate('/subjects')}
          style={{ 
            padding: '0.75rem 1.5rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Quay lại danh sách môn học
        </button>
      </div>
    );
  }
  
  if (!exam) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Không tìm thấy đề thi</h2>
        <p>Đề thi yêu cầu không tồn tại hoặc đã bị xóa.</p>
        <button onClick={() => navigate('/subjects')}>Quay lại danh sách môn học</button>
      </div>
    );
  }
  
  const currentQuestion = exam.questions[currentQuestionIndex];
  const answeredCount = answers.filter(answer => answer !== null).length;
  const isLowTime = timeRemaining < 300; // Less than 5 minutes
  
  return (
    <ExamContainer>
      <ExamHeader>
        <ExamTitle theme={theme}>{exam.title}</ExamTitle>
        <ExamInfo>
          <TimeRemaining theme={theme}>
            <TimeIcon theme={theme} isLow={isLowTime}>⏱️</TimeIcon>
            <TimeText theme={theme} isLow={isLowTime}>
              {formatTime(timeRemaining)}
            </TimeText>
          </TimeRemaining>
          <SubmitButton onClick={handleOpenConfirmModal} disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Nộp bài'}
          </SubmitButton>
        </ExamInfo>
      </ExamHeader>
      
      <NavigationBar theme={theme}>
        <QuestionNav>
          {exam.questions.map((question, index) => (
            <QuestionButton
              key={index}
              theme={theme}
              isSelected={index === currentQuestionIndex}
              isAnswered={answers[index] !== null}
              onClick={() => handleGoToQuestion(index)}
            >
              {index + 1}
            </QuestionButton>
          ))}
        </QuestionNav>
      </NavigationBar>
      
      <QuestionsContainer>
        <QuizQuestion
          theme={theme}
          question={currentQuestion}
          number={currentQuestionIndex + 1}
          selectedOption={answers[currentQuestionIndex]}
          onSelectOption={handleSelectOption}
        />
      </QuestionsContainer>
      
      <ExamFooter>
        <NavButton
          theme={theme}
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          ← Câu trước
        </NavButton>
        
        {currentQuestionIndex < exam.questions.length - 1 ? (
          <NavButton
            theme={theme}
            onClick={handleNextQuestion}
          >
            Câu tiếp theo →
          </NavButton>
        ) : (
          <FinalSubmitButton
            onClick={handleOpenConfirmModal}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : '✓ Hoàn thành bài thi'}
          </FinalSubmitButton>
        )}
      </ExamFooter>
      
      <AnimatePresence>
        {showConfirmModal && (
          <ConfirmationModal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalContent
              theme={theme}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <ModalTitle theme={theme}>Xác nhận nộp bài</ModalTitle>
              <ModalText theme={theme}>
                Bạn có chắc chắn muốn nộp bài? Sau khi nộp, bạn sẽ không thể thay đổi câu trả lời.
              </ModalText>
              
              <ModalInfo theme={theme}>
                <InfoItem>
                  <InfoLabel theme={theme}>Số câu đã trả lời:</InfoLabel>
                  <InfoValue theme={theme}>{answeredCount}/{exam.questions.length}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel theme={theme}>Số câu chưa trả lời:</InfoLabel>
                  <InfoValue theme={theme}>{exam.questions.length - answeredCount}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel theme={theme}>Thời gian còn lại:</InfoLabel>
                  <InfoValue theme={theme}>{formatTime(timeRemaining)}</InfoValue>
                </InfoItem>
              </ModalInfo>
              
              <ModalActions>
                <CancelButton theme={theme} onClick={handleCloseConfirmModal}>
                  Quay lại làm bài
                </CancelButton>
                <ConfirmButton onClick={handleSubmitExam} disabled={isLoading}>
                  {isLoading ? 'Đang xử lý...' : 'Xác nhận nộp bài'}
                </ConfirmButton>
              </ModalActions>
            </ModalContent>
          </ConfirmationModal>
        )}
      </AnimatePresence>
    </ExamContainer>
  );
};

export default ExamInterface;
