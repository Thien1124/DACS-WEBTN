import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchExamWithQuestions, 
  startExamSession, 
  setUserAnswer, 
  submitExamAnswers 
} from '../../redux/examSlice';
import QuestionDisplay from './QuestionDisplay';
import QuestionNavigation from './QuestionNavigation';
import LoadingSpinner from '../common/LoadingSpinner';
import { showWarningToast, showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import { FaClock, FaExclamationTriangle, FaPaperPlane, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import ConfirmModal from '../common/ConfirmModal';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  min-height: 80vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ExamTitle = styled.h1`
  font-size: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin: 0;
`;

const TimerContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  padding: 0.5rem 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: ${props => props.isWarning ? '#e53e3e' : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  animation: ${props => props.isWarning ? 'pulse 1s infinite' : 'none'};
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }
`;

const TimerIcon = styled(FaClock)`
  margin-right: 0.5rem;
`;

const TimerText = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
`;

const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  
  @media (min-width: 992px) {
    grid-template-columns: 3fr 1fr;
  }
`;

const MainContent = styled.div`
  order: 2;
  
  @media (min-width: 992px) {
    order: 1;
  }
`;

const Sidebar = styled.div`
  order: 1;
  
  @media (min-width: 992px) {
    order: 2;
  }
`;

const NavigationCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h2`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  border-radius: 4px;
  margin-bottom: 1rem;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  width: ${props => props.value}%;
  background: linear-gradient(135deg, #4285f4, #34a853);
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const ProgressText = styled.p`
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  margin-bottom: 1rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 5px;
  background-color: ${props => props.primary 
    ? '#4285f4' 
    : props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.primary 
    ? '#ffffff'
    : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    background-color: ${props => props.primary 
      ? '#3367d6' 
      : props.theme === 'dark' ? '#2d3748' : '#e2e8f0'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    margin-right: ${props => props.iconRight ? '0' : '0.5rem'};
    margin-left: ${props => props.iconRight ? '0.5rem' : '0'};
  }
`;

const SubmitButton = styled(NavButton)`
  background: linear-gradient(135deg, #4285f4, #34a853);
  padding: 0.75rem 1.5rem;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #3367d6, #2a9d46);
  }
`;

const formatTime = (timeInSeconds) => {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0')
  ].join(':');
};

const ExamInterface = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentExam, examQuestions, userAnswers, loading, error } = useSelector(state => state.exams);
  const { theme } = useSelector(state => state.ui);
  
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isTimeWarning, setIsTimeWarning] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Bắt đầu bài thi khi component được mount
  useEffect(() => {
    if (examId) {
      dispatch(startExamSession(examId))
        .unwrap()
        .then(() => {
          dispatch(fetchExamWithQuestions(examId));
        })
        .catch(error => {
          showErrorToast('Không thể bắt đầu bài thi');
          navigate('/subjects');
        });
    }
  }, [dispatch, examId, navigate]);
  
  // Thiết lập bộ đếm thời gian
  useEffect(() => {
    if (!currentExam || !currentExam.startTime || !currentExam.endTime) return;
    
    const startTime = new Date(currentExam.startTime).getTime();
    const endTime = new Date(currentExam.endTime).getTime();
    const duration = Math.floor((endTime - startTime) / 1000);
    
    setTimeRemaining(duration);
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        
        // Cảnh báo khi còn 5 phút
        if (prev === 300) {
          showWarningToast('Còn 5 phút nữa hết giờ làm bài!');
          setIsTimeWarning(true);
        }
        
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentExam]);
  
  const handleTimeUp = useCallback(() => {
    showWarningToast('Hết thời gian làm bài!');
    handleSubmitExam();
  }, []);
  
  const handleNextQuestion = () => {
    if (currentQuestion < examQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const handleAnswerSelect = (questionId, answerId) => {
    dispatch(setUserAnswer({ questionId, answerId }));
  };
  
  const handleQuestionSelect = (questionNumber) => {
    setCurrentQuestion(questionNumber);
  };
  
  const openSubmitModal = () => {
    setIsSubmitModalOpen(true);
  };
  
  const closeSubmitModal = () => {
    setIsSubmitModalOpen(false);
  };
  
  const handleSubmitExam = useCallback(() => {
    setIsSubmitting(true);
    
    // Chuyển đổi từ đối tượng userAnswers thành mảng câu trả lời
    const answersArray = Object.keys(userAnswers).map(questionId => ({
      questionId: parseInt(questionId),
      selectedOptionId: userAnswers[questionId]
    }));
    
    dispatch(submitExamAnswers({ examId, answers: answersArray }))
      .unwrap()
      .then(result => {
        showSuccessToast('Đã nộp bài thành công!');
        navigate(`/exam-results/${result.id}`);
      })
      .catch(error => {
        showErrorToast('Không thể nộp bài. Vui lòng thử lại.');
        setIsSubmitting(false);
      });
  }, [dispatch, examId, navigate, userAnswers]);
  
  if (loading && !currentExam) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <Container>
        <div>Đã xảy ra lỗi: {error}</div>
      </Container>
    );
  }
  
  if (!currentExam || !examQuestions) {
    return (
      <Container>
        <div>Không tìm thấy thông tin bài thi</div>
      </Container>
    );
  }
  
  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = examQuestions.length;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  
  const currentQuestionData = examQuestions[currentQuestion - 1] || null;
  
  return (
    <Container>
      <Header>
        <ExamTitle theme={theme}>{currentExam.title}</ExamTitle>
        <TimerContainer theme={theme} isWarning={isTimeWarning}>
          <TimerIcon />
          <TimerText>{formatTime(timeRemaining || 0)}</TimerText>
        </TimerContainer>
      </Header>
      
      <ContentContainer>
        <MainContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentQuestionData && (
                <QuestionDisplay 
                  question={currentQuestionData}
                  selectedOption={userAnswers[currentQuestionData.id] || null}
                  onAnswerSelect={handleAnswerSelect}
                  theme={theme}
                />
              )}
            </motion.div>
          </AnimatePresence>
          
          <ButtonContainer>
            <NavButton 
              theme={theme}
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 1}
            >
              <FaArrowLeft />
              Câu trước
            </NavButton>
            
            <SubmitButton 
              primary
              onClick={openSubmitModal}
              disabled={isSubmitting}
            >
              <FaPaperPlane />
              Nộp bài
            </SubmitButton>
            
            <NavButton 
              theme={theme}
              iconRight
              onClick={handleNextQuestion}
              disabled={currentQuestion === totalQuestions}
            >
              Câu sau
              <FaArrowRight />
            </NavButton>
          </ButtonContainer>
        </MainContent>
        
        <Sidebar>
          <NavigationCard theme={theme}>
            <CardTitle theme={theme}>Tiến độ làm bài</CardTitle>
            <ProgressBar theme={theme}>
              <Progress value={progressPercent} />
            </ProgressBar>
            <ProgressText theme={theme}>
              Đã làm: {answeredCount}/{totalQuestions} câu ({Math.round(progressPercent)}%)
            </ProgressText>
            
            <CardTitle theme={theme}>Điều hướng câu hỏi</CardTitle>
            <QuestionNavigation 
              totalQuestions={totalQuestions}
              currentQuestion={currentQuestion}
              answeredQuestions={Object.keys(userAnswers).map(id => {
                // Tìm vị trí của câu hỏi trong mảng examQuestions
                const index = examQuestions.findIndex(q => q.id === parseInt(id)) + 1;
                return index;
              })}
              onQuestionSelect={handleQuestionSelect}
              theme={theme}
            />
          </NavigationCard>
        </Sidebar>
      </ContentContainer>
      
      <ConfirmModal 
        show={isSubmitModalOpen}
        title="Xác nhận nộp bài"
        message={
          <div>
            <FaExclamationTriangle size={20} style={{ color: '#f59e0b', marginRight: '8px' }} />
            <span>Bạn có chắc chắn muốn nộp bài?</span>
            <p style={{ marginTop: '10px' }}>
              Đã làm: <strong>{answeredCount}/{totalQuestions}</strong> câu hỏi
            </p>
          </div>
        }
        confirmText="Nộp bài"
        cancelText="Tiếp tục làm bài"
        onConfirm={handleSubmitExam}
        onCancel={closeSubmitModal}
      />
    </Container>
  );
};

export default ExamInterface;