import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaClock, FaExclamationTriangle, FaCheck, FaArrowLeft, 
  FaArrowRight, FaPaperPlane, FaCheckCircle, FaHome, FaFileAlt
} from 'react-icons/fa';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { 
  showSuccessToast, 
  showErrorToast, 
  showWarningToast, 
  showInfoToast 
} from '../../utils/toastUtils';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  min-height: 80vh;
  background-color: ${props => props.theme === 'dark' ? '#121212' : '#f8f9fa'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
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

const ExamInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  
  svg {
    margin-right: 0.5rem;
  }
  
  &.time-info {
    font-weight: bold;
    
    span.time-value {
      color: #f44336;
      font-size: 1.1rem;
      margin-left: 0.25rem;
    }
  }
`;

const TimerContainer = styled.div`
  display: flex;
  align-items: center;
  background-color: ${props => props.isWarning 
    ? props.theme === 'dark' ? '#4a1d1d' : '#ffeeee'
    : props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  padding: 0.5rem 1rem;
  border-radius: 10px;
  box-shadow: ${props => props.isWarning 
    ? '0 2px 8px rgba(244, 67, 54, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  color: ${props => props.isWarning ? '#f44336' : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  animation: ${props => props.isWarning ? 'pulse 1s infinite' : 'none'};
  border: ${props => props.isWarning ? '2px solid #f44336' : 'none'};
  
  @keyframes pulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.03); }
    100% { opacity: 1; transform: scale(1); }
  }
`;

const TimerIcon = styled(FaClock)`
  margin-right: 0.5rem;
`;

const TimerText = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #f44336; /* Bright red color */
  text-shadow: ${props => props.theme === 'dark' ? '0 0 2px rgba(0,0,0,0.3)' : 'none'};
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

const QuestionButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
`;

const QuestionButton = styled.button`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  border: none;
  background-color: ${props => {
    if (props.isActive) return props.theme === 'dark' ? '#4285f4' : '#4285f4';
    if (props.isAnswered) return props.theme === 'dark' ? 'rgba(52, 168, 83, 0.5)' : 'rgba(52, 168, 83, 0.3)';
    return props.theme === 'dark' ? '#4a5568' : '#edf2f7';
  }};
  color: ${props => {
    if (props.isActive) return '#ffffff';
    if (props.isAnswered) return props.theme === 'dark' ? '#ffffff' : '#1e552b';
    return props.theme === 'dark' ? '#e2e8f0' : '#2d3748';
  }};
  font-weight: ${props => (props.isActive || props.isAnswered) ? 'bold' : 'normal'};
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: ${props => {
    if (props.isActive) return '0 0 0 2px #4285f4';
    if (props.isAnswered) return '0 0 0 1px #34a853';
    return 'none';
  }};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    background-color: ${props => {
      if (props.isActive) return props.theme === 'dark' ? '#4285f4' : '#4285f4';
      if (props.isAnswered) return props.theme === 'dark' ? 'rgba(52, 168, 83, 0.7)' : 'rgba(52, 168, 83, 0.5)';
      return props.theme === 'dark' ? '#2d3748' : '#e2e8f0';
    }};
  }
`;

const QuestionCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  padding-bottom: 1rem;
`;

const QuestionTitle = styled.h3`
  font-size: 1.2rem;
  margin: 0;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const QuestionScore = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const QuestionText = styled.div`
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OptionItem = styled.div`
  display: flex;
  cursor: pointer;
  padding: 1rem;
  border-radius: 8px;
  background-color: ${props => {
    if (props.isSelected) return props.theme === 'dark' ? 'rgba(66, 133, 244, 0.2)' : 'rgba(66, 133, 244, 0.1)';
    return props.theme === 'dark' ? '#4a5568' : '#f8f9fa';
  }};
  border: 2px solid ${props => {
    if (props.isSelected) return '#4285f4';
    return props.theme === 'dark' ? '#4a5568' : '#edf2f7';
  }};
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    background-color: ${props => {
      if (props.isSelected) return props.theme === 'dark' ? 'rgba(66, 133, 244, 0.3)' : 'rgba(66, 133, 244, 0.2)';
      return props.theme === 'dark' ? '#3a4556' : '#edf2f7';
    }};
  }
`;

const OptionLabel = styled.div`
  background-color: ${props => {
    if (props.isSelected) return '#4285f4';
    return props.theme === 'dark' ? '#2d3748' : '#edf2f7';
  }};
  color: ${props => {
    if (props.isSelected) return '#ffffff';
    return props.theme === 'dark' ? '#e2e8f0' : '#2d3748';
  }};
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  margin-right: 1rem;
  flex-shrink: 0;
`;

const OptionContent = styled.div`
  flex: 1;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const StyledImage = styled.img`
  max-width: 100%;
  margin: 1rem 0;
  border-radius: 8px;
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

// Add a styled component for the success modal
const SuccessIcon = styled(FaCheckCircle)`
  font-size: 4rem;
  color: #34a853;
  margin-bottom: 1rem;
`;

const SuccessTitle = styled.h3`
  color: #34a853;
  font-weight: bold;
  margin-bottom: 1.5rem;
`;

const SuccessMessage = styled.p`
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

// Add this styled component definition with the other styled components
const WarningMessage = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: ${props => props.theme === 'dark' ? '#4a3523' : '#fff3e0'};
  border-left: 4px solid #ff9800;
  color: ${props => props.theme === 'dark' ? '#ffd180' : '#e65100'};
  border-radius: 4px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    flex-shrink: 0;
  }
`;

const StudentTakeExam = () => {
  const { officialExamId } = useParams();
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const [examData, setExamData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [isTimeWarning, setIsTimeWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [totalExamDuration, setTotalExamDuration] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [canSubmit, setCanSubmit] = useState(false);
  const [cheatingAttempted, setCheatingAttempted] = useState(false);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5006';
  const timerRef = useRef(null);
  const lowTimeWarningShown = useRef(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchExamData();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isAuthenticated, officialExamId]);
  
  // Update the fetchExamData function to correctly handle the exam timer
  const fetchExamData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }
      
      const response = await axios.get(`${API_URL}/api/student/exams/${officialExamId}/take`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data) {
        setExamData(response.data);
        
        // Initialize answers object
        const initialAnswers = {};
        response.data.questions.forEach(question => {
          initialAnswers[question.examQuestionId] = null;
        });
        setAnswers(initialAnswers);
        
        // Get times from response
        const startTime = new Date(response.data.startTime).getTime();
        const endTime = new Date(response.data.endTime).getTime();
        
        // Debug time information
        console.log("Raw time values from API:");
        console.log("- Start time (ISO):", response.data.startTime);
        console.log("- End time (ISO):", response.data.endTime);
        console.log("- Local start time:", new Date(startTime).toLocaleString('vi-VN'));
        console.log("- Local end time:", new Date(endTime).toLocaleString('vi-VN'));
        
        // SOLUTION #1: Always use the specified exam duration if available
        let examDurationInSeconds;
        
        if (response.data.exam && response.data.exam.duration) {
          // Get duration from the exam's specified duration (always correct)
          examDurationInSeconds = response.data.exam.duration * 60; // Convert minutes to seconds
          console.log(`Using exam defined duration: ${response.data.exam.duration} minutes`);
        } else {
          // SOLUTION #2: If calculating from timestamps, apply validation
          const calculatedDuration = Math.floor((endTime - startTime) / 1000);
          
          // Validate: If duration is unreasonable (> 3 hours or < 0), use a default 45 minutes
          if (calculatedDuration <= 0 || calculatedDuration > 3 * 60 * 60) {
            console.warn('Invalid calculated duration:', calculatedDuration, 'seconds');
            examDurationInSeconds = 45 * 60; // Default to 45 minutes for typical exams
            console.log('Using default 45 minutes duration instead');
          } else {
            examDurationInSeconds = calculatedDuration;
            console.log(`Calculated duration: ${Math.floor(examDurationInSeconds/60)} minutes`);
          }
        }
        
        setTotalExamDuration(examDurationInSeconds);
        
        // Track when the student started the exam
        const startedAt = Date.now();
        
        // Update timer function to check for 3/4 time requirement
        const updateTimer = () => {
          const currentTime = Date.now();
          const elapsedSinceStart = Math.floor((currentTime - startedAt) / 1000); // Time since student started
          const remainingTime = Math.max(0, examDurationInSeconds - elapsedSinceStart);
          
          setTimeRemaining(remainingTime);
          setElapsedTime(elapsedSinceStart);
          
          // Check if 3/4 of total duration has passed
          const quarterTimeThreshold = examDurationInSeconds * 0.75;
          const hasPassedThreeQuarters = elapsedSinceStart >= quarterTimeThreshold;
          setCanSubmit(hasPassedThreeQuarters);
          
          // Show warning when 5 minutes remaining
          if (remainingTime <= 300 && remainingTime > 290 && !lowTimeWarningShown.current) {
            showWarningToast('Chỉ còn 5 phút làm bài!');
            setIsTimeWarning(true);
            lowTimeWarningShown.current = true;
          }
          
          if (remainingTime <= 0) {
            clearInterval(timerRef.current);
            handleTimeUp();
          }
        };
        
        updateTimer(); // Initial call
        timerRef.current = setInterval(updateTimer, 1000);
      }
    } catch (err) {
      console.error('Error fetching exam:', err);
      setError('Không thể tải dữ liệu bài thi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTimeUp = () => {
    showWarningToast('Đã hết thời gian làm bài!');
    setShowTimeoutModal(true);
  };
  
  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    
    // For typical exams (under 3 hours), show minutes:seconds format
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      // For shorter exams, just show minutes:seconds for better readability
      return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };
  
  const handleAnswerSelect = (examQuestionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [examQuestionId]: optionId
    }));
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < examData.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
  };
  
  const handleSubmitExam = async () => {
    try {
      setSubmitting(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        showErrorToast('Không tìm thấy token xác thực');
        throw new Error('Không tìm thấy token xác thực');
      }
      
      // Include ONLY answered questions to avoid server errors
      const formattedAnswers = Object.entries(answers)
        .filter(([_, selectedOptionId]) => selectedOptionId !== null)
        .map(([examQuestionId, selectedOptionId]) => ({
          examQuestionId: parseInt(examQuestionId),
          selectedOptionId: parseInt(selectedOptionId),
          textAnswer: ""  // Empty string required by the API
        }));
      
      // Create the submission payload
      const answerData = {
        answers: formattedAnswers
      };
      
      console.log("Submitting answers:", JSON.stringify(answerData, null, 2));
      
      // Make the API request
      const response = await axios.post(
        `${API_URL}/api/student/exams/${officialExamId}/submit`, 
        answerData, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Submit response:", response.data);
      
      // Show success toast
      showSuccessToast('Nộp bài thành công!');
      
      // Show success modal instead of navigating immediately
      setShowSuccessModal(true);
      
    } catch (err) {
      // Error handling - keep this the same as before
      console.error('Error submitting exam:', err);
      
      // More specific error messages based on the error type
      if (err.response) {
        console.error("Response error data:", err.response.data);
        console.error("Response error status:", err.response.status);
        
        // Log detailed validation errors if available
        if (err.response.data && err.response.data.errors) {
          console.error("Validation errors:", JSON.stringify(err.response.data.errors, null, 2));
        }
        
        if (err.response.status === 401 || err.response.status === 403) {
          showErrorToast('Lỗi xác thực. Vui lòng đăng nhập lại và thử lại.');
        } else if (err.response.status === 500) {
          // Special handling for 500 errors
          const errorMsg = err.response.data?.message || 'Lỗi máy chủ khi xử lý bài thi';
          showErrorToast(`${errorMsg}. Vui lòng thử lại sau.`);
        } else {
          const errorDetail = err.response.data?.title || err.response.data?.detail || 'Vui lòng thử lại.';
          showErrorToast(`Lỗi khi nộp bài: ${errorDetail}`);
        }
      } else if (err.request) {
        showErrorToast('Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.');
      } else {
        showErrorToast('Không thể nộp bài thi. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };
  
  const handleForceSubmit = async () => {
    try {
      await handleSubmitExam();
    } finally {
      setShowTimeoutModal(false);
    }
  };
  
  const getAnsweredCount = () => {
    return Object.values(answers).filter(answer => answer !== null).length;
  };
  
  const getProgressPercentage = () => {
    if (!examData) return 0;
    return Math.min(100, (getAnsweredCount() / examData.questions.length) * 100);
  };
  
  // Add this check method to determine if all questions are answered
  const areAllQuestionsAnswered = () => {
    if (!examData || !examData.questions) return false;
    return examData.questions.every(q => answers[q.examQuestionId] !== null);
  };
  
  // Helper function to display time remaining until submission is allowed
  const getTimeRemainingForSubmission = () => {
    if (!canSubmit && totalExamDuration) {
      const quarterTimeThreshold = Math.ceil(totalExamDuration * 0.75);
      const timeNeeded = Math.max(0, quarterTimeThreshold - elapsedTime);
      
      // Convert to minutes and seconds for display
      const minutes = Math.floor(timeNeeded / 60);
      const seconds = timeNeeded % 60;
      
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return null;
  };
  
  useEffect(() => {
    if (!examData) return;
    
    // Function to handle tab switching (document visibility change)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !cheatingAttempted) {
        setCheatingAttempted(true);
        // Show warning toast that will be visible when they return
        toast.error('Phát hiện chuyển tab! Bài thi sẽ bị nộp tự động với điểm 0.', {
          position: "top-center",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: false,
        });
        handleCheatingSubmit();
      }
    };
    
    // Function to handle page reload/close
    const handleBeforeUnload = (e) => {
      if (!cheatingAttempted) {
        // Standard message for browser's native dialog
        e.preventDefault();
        e.returnValue = 'Nếu bạn rời khỏi trang này, bài thi sẽ bị nộp tự động với điểm 0.';
        
        // Set a flag and submit after a short delay
        setCheatingAttempted(true);
        setTimeout(() => {
          handleCheatingSubmit();
        }, 100);
        
        // This message may or may not show depending on the browser,
        // but the auto-submit will still happen
        return e.returnValue;
      }
    };
    
    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Clean up event listeners on component unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [examData, cheatingAttempted]);
  
  const handleCheatingSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Clear all answers to ensure 0 score
      const clearedAnswers = {};
      
      // Create empty submission with no answers
      const answerData = {
        answers: [],
        // Include cheating flag for the server to log
        cheatingDetected: true
      };
      
      console.log("Submitting due to cheating attempt:", JSON.stringify(answerData, null, 2));
      
      // Submit to the API
      await axios.post(
        `${API_URL}/api/student/exams/${officialExamId}/submit`, 
        answerData, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Cheating submission complete");
      
      // Will navigate away after submission if the user returns to the tab
      if (document.visibilityState === 'visible') {
        navigate('/student/assigned-exams', { 
          state: { 
            message: 'Bài thi đã bị nộp tự động với điểm 0 do phát hiện hành vi gian lận.',
            cheatingDetected: true
          } 
        });
      }
      
    } catch (err) {
      console.error('Error submitting exam due to cheating:', err);
      // If there's an error, we'll still try to navigate away if they come back
      if (document.visibilityState === 'visible') {
        navigate('/student/assigned-exams', { 
          state: { 
            message: 'Bài thi đã kết thúc do phát hiện hành vi gian lận.',
            cheatingDetected: true 
          } 
        });
      }
    }
  };
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!examData) return <ErrorAlert message="Không thể tải dữ liệu bài thi" />;
  
  const currentQuestion = examData.questions[currentQuestionIndex];
  
  return (
    <Container theme={theme}>
      <Header>
        <ExamTitle theme={theme}>{examData.officialExam.title} - {examData.exam.title}</ExamTitle>
        <TimerContainer theme={theme} isWarning={isTimeWarning}>
          <TimerIcon />
          <TimerText>{formatTime(timeRemaining)}</TimerText>
        </TimerContainer>
      </Header>
      
      
      
      <ContentContainer>
        <MainContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <QuestionCard theme={theme}>
                <QuestionHeader theme={theme}>
                  <QuestionTitle theme={theme}>
                    Câu hỏi {currentQuestionIndex + 1}/{examData.questions.length}
                  </QuestionTitle>
                  <QuestionScore theme={theme}>{currentQuestion.score} điểm</QuestionScore>
                </QuestionHeader>
                
                <QuestionText theme={theme}>{currentQuestion.question.content}</QuestionText>
                
                {currentQuestion.question.imagePath && (
                  <StyledImage src={currentQuestion.question.imagePath} alt="Question illustration" />
                )}
                
                <OptionsContainer>
                  {currentQuestion.question.options.map((option, index) => {
                    // Map index to fixed label regardless of the option's actual label
                    const fixedLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                    const fixedLabel = fixedLabels[index] || option.label;
                    
                    return (
                      <OptionItem
                        key={option.id}
                        theme={theme}
                        isSelected={answers[currentQuestion.examQuestionId] === option.id}
                        onClick={() => handleAnswerSelect(currentQuestion.examQuestionId, option.id)}
                      >
                        <OptionLabel 
                          theme={theme} 
                          isSelected={answers[currentQuestion.examQuestionId] === option.id}
                        >
                          {fixedLabel}
                        </OptionLabel>
                        <OptionContent theme={theme}>{option.content}</OptionContent>
                      </OptionItem>
                    );
                  })}
                </OptionsContainer>
              </QuestionCard>
            </motion.div>
          </AnimatePresence>
          
          <ButtonContainer>
            <NavButton 
              theme={theme}
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <FaArrowLeft /> Câu trước
            </NavButton>
            
            <SubmitButton 
              primary
              onClick={() => setShowSubmitModal(true)}
              disabled={submitting || !areAllQuestionsAnswered() || !canSubmit}
            >
              <FaPaperPlane /> Nộp bài
            </SubmitButton>
            
            <NavButton 
              theme={theme}
              iconRight
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === examData.questions.length - 1}
            >
              Câu sau <FaArrowRight />
            </NavButton>
          </ButtonContainer>
          
          {/* Add a warning message if not all questions are answered */}
          {!areAllQuestionsAnswered() && (
            <WarningMessage theme={theme}>
              <FaExclamationTriangle />
              <span>Vui lòng trả lời tất cả các câu hỏi trước khi nộp bài.</span>
            </WarningMessage>
          )}
          
          {/* Add a warning message about the time requirement */}
          {!canSubmit && (
            <WarningMessage theme={theme}>
              <FaExclamationTriangle />
              <span>Bạn phải hoàn thành ít nhất 3/4 thời gian làm bài mới được nộp bài. 
                {getTimeRemainingForSubmission() && ` Còn ${getTimeRemainingForSubmission()} nữa để đủ điều kiện nộp bài.`}
              </span>
            </WarningMessage>
          )}
        </MainContent>
        
        <Sidebar>
          <NavigationCard theme={theme}>
            <CardTitle theme={theme}>Tiến độ làm bài</CardTitle>
            <ProgressBar theme={theme}>
              <Progress value={getProgressPercentage()} />
            </ProgressBar>
            <ProgressText theme={theme}>
              Đã làm: {getAnsweredCount()}/{examData.questions.length} câu ({Math.round(getProgressPercentage())}%)
            </ProgressText>
            
            <CardTitle theme={theme}>Điều hướng câu hỏi</CardTitle>
            <QuestionButtons>
              {examData.questions.map((question, index) => (
                <QuestionButton
                  key={question.examQuestionId}
                  theme={theme}
                  isActive={index === currentQuestionIndex}
                  isAnswered={answers[question.examQuestionId] !== null}
                  onClick={() => handleQuestionSelect(index)}
                >
                  {index + 1}
                </QuestionButton>
              ))}
            </QuestionButtons>
          </NavigationCard>
        </Sidebar>
      </ContentContainer>
      
      {/* Submit Confirmation Modal */}
      <Modal show={showSubmitModal} onHide={() => setShowSubmitModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận nộp bài</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            {!canSubmit ? (
              <>
                <FaExclamationTriangle size={20} style={{ color: '#f59e0b', marginRight: '8px', display: 'inline' }} />
                <span>Bạn chưa hoàn thành 3/4 thời gian làm bài.</span>
                <div className="alert alert-warning mt-3">
                  <FaExclamationTriangle /> Vui lòng chờ thêm {getTimeRemainingForSubmission()} để đủ điều kiện nộp bài.
                </div>
              </>
            ) : !areAllQuestionsAnswered() ? (
              <>
                <FaExclamationTriangle size={20} style={{ color: '#f59e0b', marginRight: '8px', display: 'inline' }} />
                <span>Bạn chưa trả lời tất cả các câu hỏi.</span>
                <div className="alert alert-warning mt-3">
                  <FaExclamationTriangle /> Vui lòng trả lời tất cả {examData.questions.length - getAnsweredCount()} câu hỏi còn lại trước khi nộp bài.
                </div>
              </>
            ) : (
              <>
                <FaCheckCircle size={20} style={{ color: '#34a853', marginRight: '8px', display: 'inline' }} />
                <span>Bạn đã hoàn thành tất cả các câu hỏi và 3/4 thời gian làm bài. Bạn có chắc chắn muốn nộp bài?</span>
              </>
            )}
            <p style={{ marginTop: '10px' }}>
              Đã làm: <strong>{getAnsweredCount()}/{examData.questions.length}</strong> câu hỏi
            </p>
            <p>
              Thời gian đã làm: <strong>{Math.floor(elapsedTime / 60)} phút {elapsedTime % 60} giây</strong> 
              {!canSubmit ? ` (cần ít nhất ${Math.ceil(totalExamDuration * 0.75 / 60)} phút)` : ' (đã đủ thời gian)'}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
            Quay lại làm bài
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmitExam} 
            disabled={submitting || !areAllQuestionsAnswered() || !canSubmit}
          >
            {submitting ? 'Đang nộp bài...' : 'Xác nhận nộp bài'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Timeout Modal */}
      <Modal show={showTimeoutModal} backdrop="static" keyboard={false} centered>
        <Modal.Header>
          <Modal.Title>Hết thời gian làm bài</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Thời gian làm bài đã kết thúc. Hệ thống sẽ tự động nộp bài của bạn.</p>
          <p>Bạn đã trả lời {getAnsweredCount()}/{examData.questions.length} câu hỏi.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="primary" 
            onClick={handleForceSubmit} 
            disabled={submitting}
          >
            {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Success Modal */}
      <Modal 
        show={showSuccessModal} 
        backdrop="static" 
        keyboard={false} 
        centered
        size="lg"
      >
        <Modal.Body className="text-center p-5">
          <SuccessIcon />
          <SuccessTitle>Nộp bài thành công!</SuccessTitle>
          <SuccessMessage theme={theme}>
            Cảm ơn bạn đã hoàn thành bài thi. Bài làm của bạn đã được ghi nhận thành công.
            <br />
            {examData?.exam?.showResults ? 
              "Bạn có thể xem kết quả của mình ngay bây giờ." : 
              "Kết quả sẽ được công bố sau khi giáo viên chấm điểm."
            }
          </SuccessMessage>
          
          <ActionButtonsContainer>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/student/assigned-exams')}
              className="d-flex align-items-center justify-content-center"
            >
              <FaHome className="me-2" /> Về trang danh sách bài thi
            </Button>
            
            {examData?.exam?.showResults && (
              <Button
                variant="success"
                size="lg"
                onClick={() => navigate(`/student/exams/${officialExamId}/result`)}
                className="d-flex align-items-center justify-content-center"
              >
                <FaFileAlt className="me-2" /> Xem kết quả bài thi
              </Button>
            )}
          </ActionButtonsContainer>
        </Modal.Body>
      </Modal>
      
      {/* Cheating Detected Modal */}
      <Modal 
        show={cheatingAttempted && document.visibilityState === 'visible'} 
        backdrop="static" 
        keyboard={false} 
        centered
      >
        <Modal.Header>
          <Modal.Title className="text-danger">Phát hiện hành vi gian lận</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-danger">
            <FaExclamationTriangle /> Hệ thống đã phát hiện bạn chuyển sang tab/trang web khác hoặc cố gắng tải lại trang trong quá trình làm bài.
          </div>
          <p>Theo quy định, bài thi của bạn đã được nộp tự động với điểm 0.</p>
          <p>Vui lòng liên hệ giáo viên nếu bạn cho rằng đây là sự cố ngoài ý muốn.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => navigate('/student/assigned-exams')}
          >
            Quay về danh sách bài thi
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StudentTakeExam;