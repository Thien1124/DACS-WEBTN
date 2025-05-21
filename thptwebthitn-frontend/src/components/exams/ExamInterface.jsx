import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
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
import { mockExam } from '../../data/mockExamData';
import apiClient from '../../services/apiClient'; // Giả sử bạn đã tạo một apiClient với axios
import FeedbackButton from '../feedback/FeedbackButton';
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
  
  // State cục bộ thay vì dùng Redux
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isTimeWarning, setIsTimeWarning] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shuffledOptionMaps, setShuffledOptionMaps] = useState({});

  // Sử dụng theme mặc định là 'light' nếu không có redux
  const theme = 'light';
  
  // Bắt đầu bài thi khi component được mount
  useEffect(() => {
    const fetchExamData = async () => {
      setLoading(true);
      try {
        // Gọi API lấy đề thi và câu hỏi thực
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5006'}/api/Exam/WithQuestions/${examId}`);
        
        if (!response.ok) {
          throw new Error(`Không thể tải đề thi. Mã lỗi: ${response.status}`);
        }
        
        const examData = await response.json();
        console.log("Dữ liệu đề thi từ API:", examData);
        
        // Kiểm tra cấu trúc dữ liệu
        if (!examData) {
          throw new Error("Không tìm thấy thông tin đề thi.");
        }
        
        // Kiểm tra danh sách câu hỏi
        if (!examData.questions || !Array.isArray(examData.questions) || examData.questions.length === 0) {
          console.warn("Đề thi không có câu hỏi hoặc danh sách câu hỏi không hợp lệ.");
        }
        
        // Thiết lập thời gian bắt đầu và kết thúc
        const examWithTiming = {
          ...examData,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + (examData.duration || 60) * 60 * 1000).toISOString()
        };
        
        setExam(examWithTiming);
        setQuestions(examData.questions || []);
        
        // Add this: Create shuffled options mapping for each question
        const optionMaps = {};
        examData.questions?.forEach(question => {
          if (question.options && Array.isArray(question.options) && question.options.length > 1) {
            // Create array of original indexes [0, 1, 2, 3] and shuffle it
            const originalIndexes = question.options.map((_, index) => index);
            const shuffledIndexes = shuffleArray(originalIndexes);
            
            // Create a mapping from original to shuffled position
            optionMaps[question.id] = shuffledIndexes;
          }
        });
        
        setShuffledOptionMaps(optionMaps);
        
        console.log("Đã tải đề thi:", examData.title);
        console.log("Số câu hỏi:", examData.questions ? examData.questions.length : 0);
        
      } catch (error) {
        console.error("Lỗi khi tải đề thi:", error);
        setError(error.message || "Đã xảy ra lỗi khi tải đề thi.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchExamData();
  }, [examId]);
  
  // Thiết lập bộ đếm thời gian
  useEffect(() => {
    if (!exam || !exam.startTime || !exam.endTime) return;
    
    const startTime = new Date(exam.startTime).getTime();
    const endTime = new Date(exam.endTime).getTime();
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
          setIsTimeWarning(true);
          showWarningToast('Còn 5 phút nữa hết giờ làm bài!');
        }
        
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [exam]);
  
  
  
  // Also update the handleSubmitExam function to check for exam before using it
  
  
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const handleAnswerSelect = (questionId, answerId) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
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
  
  // Trong ExamInterface.jsx (khoảng dòng 321)
const handleSubmitExam = async () => {
  try {
    setIsSubmitting(true);
    closeSubmitModal();
    
    // Get current time for end time
    const endTimeNow = new Date().toISOString();
    
    // Ensure we have at least empty answers for every question
    // This is critical - the API needs an answer entry for each question
    const allAnswers = questions.map(question => {
      const existingAnswer = userAnswers[question.id];
      
      return {
        questionId: question.id,
        startTime: exam.startTime,
        endTime: endTimeNow,
        selectedOptionId: existingAnswer || null,
        textAnswer: "",
        trueFalseAnswers: "{}",
        matchingAnswers: "{}"
      };
    });
    
    // Create a formatted payload matching the API requirements
    const submissionData = {
      examId: parseInt(examId),
      startTime: exam.startTime,
      endTime: endTimeNow,
      notes: "Nộp bài thi", 
      sessionId: `session_${Date.now()}`,
      deviceInfo: navigator.userAgent || "Unknown Device",
      isSubmittedManually: true,
      answers: allAnswers
    };
    
    console.log('Submitting exam data:', submissionData);
    
    // Ensure proper headers are set
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL || 'http://localhost:5006'}/api/Results`, 
      submissionData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('API response:', response);
    
    if (response.data) {
      showSuccessToast('Nộp bài thành công!');
      
      // Check different possible response structures
      const resultId = response.data.id || response.data.resultId || response.data;
      
      if (resultId) {
        navigate(`/exam-results/${resultId}`);
      } else {
        navigate('/dashboard');
      }
    } else {
      showErrorToast('Không thể lấy kết quả bài thi');
      navigate('/dashboard');
    }
  } catch (error) {
    console.error('Error submitting exam:', error);
    
    // More detailed error logging
    if (error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.title || 
                         'Có lỗi xảy ra khi nộp bài';
    showErrorToast(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};
  const handleTimeUp = useCallback(() => {
    showErrorToast('Hết thời gian làm bài!');
    // Check if exam exists before submitting
    if (exam) {
      handleSubmitExam();
    } else {
      console.error('Cannot submit exam: exam object is null');
      // Handle the case where exam is null, perhaps navigate to a different page
      navigate('/exams');
    }
  }, [exam, handleSubmitExam, navigate]);
  if (loading) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div>Đang tải đề thi...</div>
        </div>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <div>{error}</div>
      </Container>
    );
  }
  
  if (!exam || !questions) {
    return (
      <Container>
        <div>Không tìm thấy thông tin bài thi</div>
      </Container>
    );
  }
  
  // Thay thế đoạn code xử lý progressPercent với phiên bản an toàn hơn
const answeredCount = Object.keys(userAnswers).length;
const totalQuestions = questions?.length || 0;
const progressPercent = totalQuestions > 0 ? Math.min(100, (answeredCount / totalQuestions) * 100) : 0;

// Log giá trị để debug
console.log("Thông tin tiến độ:", { 
  answeredCount, 
  totalQuestions, 
  progressPercent,
  userAnswers
});

// Đảm bảo currentQuestionData luôn có giá trị hợp lệ
let currentQuestionData = questions && questions.length > 0 ? 
  questions[currentQuestion - 1] || questions[0] : null;

// Apply option shuffling if we have a valid question and shuffled mapping
if (currentQuestionData && 
    shuffledOptionMaps[currentQuestionData.id] && 
    currentQuestionData.options && 
    Array.isArray(currentQuestionData.options)) {
  
  // Create a deep copy of the current question
  currentQuestionData = {
    ...currentQuestionData,
    // Rearrange the options according to our shuffled mapping
    options: shuffledOptionMaps[currentQuestionData.id].map(
      originalIndex => currentQuestionData.options[originalIndex]
    ),
    // Also add the mapping so we can track correct answers
    _optionMapping: shuffledOptionMaps[currentQuestionData.id]
  };
}
  
  return (
    <>
    {!questions || questions.length === 0 ? (
      <Container>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <h3 className="text-yellow-700 font-medium">Thông báo</h3>
          <p className="text-yellow-600">Đề thi này chưa có câu hỏi. Vui lòng chọn đề thi khác.</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => navigate('/exams')}
          >
            Quay lại danh sách đề thi
          </button>
        </div>
      </Container>
    ) : (
      // Nội dung hiện tại của component khi có câu hỏi
      <Container>
        <Header>
          <ExamTitle theme={theme}>{exam.title}</ExamTitle>
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
            <FeedbackButton 
              testId={parseInt(examId)} 
              questionId={currentQuestionData && currentQuestionData.id ? parseInt(currentQuestionData.id) : null} 
            />
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
                  // Tìm vị trí của câu hỏi trong mảng questions
                  const index = questions.findIndex(q => q.id === parseInt(id)) + 1;
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
              <FaExclamationTriangle size={20} style={{ color: '#f59e0b', marginRight: '8px', display: 'inline' }} />
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
    )}
  </>
  );
};

// Add this helper function near the top of your component
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default ExamInterface;