import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import QuizQuestion from './QuizQuestion';

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
  
  const timerRef = useRef(null);
  
  // Fetch exam data
  useEffect(() => {
    const fetchExam = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would make an API call to fetch the exam
        // For demo purposes, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockExam = {
          id: examId,
          title: 'Đề thi Toán học - Đại số và Giải tích',
          duration: 45 * 60, // 45 minutes in seconds
          questions: [
            {
              id: 1,
              text: 'Giải phương trình: $x^2 - 5x + 6 = 0$',
              options: [
                'x = 2 hoặc x = 3',
                'x = -2 hoặc x = -3',
                'x = 2 hoặc x = -3',
                'x = -2 hoặc x = 3'
              ],
              correctAnswer: 0,
              explanation: 'Ta có: $x^2 - 5x + 6 = 0$ <br> $\\Rightarrow (x - 2)(x - 3) = 0$ <br> $\\Rightarrow x = 2$ hoặc $x = 3$'
            },
            {
              id: 2,
              text: 'Tìm giá trị lớn nhất của hàm số $f(x) = -x^2 + 4x - 3$ trên tập số thực.',
              options: [
                '1',
                '2',
                '3',
                '4'
              ],
              correctAnswer: 1,
              explanation: 'Ta có: $f(x) = -x^2 + 4x - 3$ <br> $f\'(x) = -2x + 4$ <br> Để $f\'(x) = 0$ ta có $x = 2$ <br> Vì hệ số của $x^2$ là âm nên $f(x)$ đạt giá trị lớn nhất tại $x = 2$ <br> $f(2) = -2^2 + 4 \\cdot 2 - 3 = -4 + 8 - 3 = 1$'
            },
            {
              id: 3,
              text: 'Tính giới hạn: $\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}$',
              options: [
                '0',
                '1',
                '3',
                'Không tồn tại'
              ],
              correctAnswer: 2,
              explanation: 'Ta có: $\\lim_{x \\to 0} \\frac{\\sin(3x)}{x} = \\lim_{x \\to 0} \\frac{\\sin(3x)}{3x} \\cdot 3$ <br> $= \\lim_{x \\to 0} \\frac{\\sin(3x)}{3x} \\cdot 3$ <br> $= 1 \\cdot 3 = 3$ (vì $\\lim_{t \\to 0} \\frac{\\sin t}{t} = 1$)'
            },
            {
              id: 4,
              text: 'Tính đạo hàm của hàm số $f(x) = e^{x^2}$',
              options: [
                '$f\'(x) = e^{x^2}$',
                '$f\'(x) = 2x \\cdot e^{x^2}$',
                '$f\'(x) = x^2 \\cdot e^{x^2}$',
                '$f\'(x) = 2 \\cdot e^{x^2}$'
              ],
              correctAnswer: 1,
              explanation: 'Áp dụng quy tắc chuỗi: <br> $f(x) = e^u$ với $u = x^2$ <br> $f\'(x) = e^u \\cdot u\' = e^{x^2} \\cdot 2x = 2x \\cdot e^{x^2}$'
            },
            {
              id: 5,
              text: 'Tìm nghiệm của bất phương trình: $\\frac{x-2}{x+1} > 0$',
              options: [
                '$x > 2$',
                '$x < -1$ hoặc $x > 2$',
                '$-1 < x < 2$',
                '$x < -1$ hoặc $0 < x < 2$'
              ],
              correctAnswer: 1,
              explanation: 'Ta có: $\\frac{x-2}{x+1} > 0$ <br> Điều này xảy ra khi cả tử số và mẫu số cùng dương hoặc cùng âm <br> Trường hợp 1: $x - 2 > 0$ và $x + 1 > 0$ $\\Rightarrow$ $x > 2$ và $x > -1$ $\\Rightarrow$ $x > 2$ <br> Trường hợp 2: $x - 2 < 0$ và $x + 1 < 0$ $\\Rightarrow$ $x < 2$ và $x < -1$ $\\Rightarrow$ $x < -1$ <br> Kết hợp cả hai, ta có: $x < -1$ hoặc $x > 2$'
            },
            {
              id: 6,
              text: 'Tính tích phân: $\\int_{0}^{1} (2x + 3) dx$',
              options: [
                '4',
                '5',
                '6',
                '7'
              ],
              correctAnswer: 1,
              explanation: 'Ta có: $\\int_{0}^{1} (2x + 3) dx = [x^2 + 3x]_{0}^{1}$ <br> $= (1^2 + 3 \\cdot 1) - (0^2 + 3 \\cdot 0)$ <br> $= (1 + 3) - 0 = 4$'
            },
            {
              id: 7,
              text: 'Một hình chữ nhật có chu vi 20 cm. Tìm kích thước của hình chữ nhật để diện tích đạt giá trị lớn nhất.',
              options: [
                'Dài 6 cm, rộng 4 cm',
                'Dài 7 cm, rộng 3 cm',
                'Dài 5 cm, rộng 5 cm',
                'Dài 8 cm, rộng 2 cm'
              ],
              correctAnswer: 2,
              explanation: 'Gọi chiều dài là $x$ và chiều rộng là $y$ <br> Ta có: $2(x + y) = 20$ $\\Rightarrow$ $x + y = 10$ $\\Rightarrow$ $y = 10 - x$ <br> Diện tích $S = x \\cdot y = x(10 - x) = 10x - x^2$ <br> $S\'(x) = 10 - 2x$ <br> Để $S\'(x) = 0$ $\\Rightarrow$ $x = 5$ <br> Vì $S\'\'(x) = -2 < 0$ nên $S$ đạt giá trị lớn nhất tại $x = 5$ <br> Do đó $y = 10 - 5 = 5$ <br> Vậy hình chữ nhật có kích thước $5 \\times 5$, tức là một hình vuông cạnh 5 cm.'
            },
            {
              id: 8,
              text: 'Tìm giới hạn: $\\lim_{x \\to \\infty} (1 + \\frac{1}{x})^x$',
              options: [
                '0',
                '1',
                '$e$',
                '$\\infty$'
              ],
              correctAnswer: 2,
              explanation: 'Đây là giới hạn cơ bản: $\\lim_{x \\to \\infty} (1 + \\frac{1}{x})^x = e \\approx 2.71828$'
            },
            {
              id: 9,
              text: 'Tính đạo hàm của hàm số $f(x) = \\ln(\\cos x)$ tại $x = 0$',
              options: [
                '$0$',
                '$1$',
                '$-1$',
                '$\\frac{1}{2}$'
              ],
              correctAnswer: 0,
              explanation: 'Ta có: $f(x) = \\ln(\\cos x)$ <br> $f\'(x) = \\frac{1}{\\cos x} \\cdot (-\\sin x) = -\\tan x$ <br> $f\'(0) = -\\tan 0 = 0$'
            },
            {
              id: 10,
              text: 'Xác định tập xác định của hàm số $f(x) = \\sqrt{9-x^2}$',
              options: [
                '$[-3, 3]$',
                '$(-\\infty, -3] \\cup [3, +\\infty)$',
                '$(-3, 3)$',
                '$[-3, 3)$'
              ],
              correctAnswer: 0,
              explanation: 'Để hàm số xác định, ta cần: $9 - x^2 \\geq 0$ <br> $\\Rightarrow x^2 \\leq 9$ <br> $\\Rightarrow -3 \\leq x \\leq 3$ <br> Vậy tập xác định của hàm số là $[-3, 3]$'
            }
          ]
        };
        
        setExam(mockExam);
        setTimeRemaining(mockExam.duration);
        setAnswers(new Array(mockExam.questions.length).fill(null));
      } catch (error) {
        console.error('Error fetching exam:', error);
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
  
  const handleSubmitExam = () => {
    // In a real app, you would make an API call to submit the exam answers
    // For demo purposes, we'll just navigate to a results page
    clearInterval(timerRef.current);
    
    // Create a result object to store in localStorage for demo purposes
    const result = {
      examId,
      examTitle: exam.title,
      answers,
      questions: exam.questions,
      timeSpent: exam.duration - timeRemaining,
      submitTime: new Date().toISOString()
    };
    
    // Store result in localStorage
    localStorage.setItem(`exam_result_${examId}`, JSON.stringify(result));
    
    // Navigate to results page
    navigate(`/exam-results/${examId}`);
  };
  
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <p>Đang tải đề thi...</p>
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
          <SubmitButton onClick={handleOpenConfirmModal}>
            Nộp bài
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
          >
            ✓ Hoàn thành bài thi
          </FinalSubmitButton>
        )}
      </ExamFooter>
      
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
              <ConfirmButton onClick={handleSubmitExam}>
                Xác nhận nộp bài
              </ConfirmButton>
            </ModalActions>
          </ModalContent>
        </ConfirmationModal>
      )}
    </ExamContainer>
  );
};

export default ExamInterface;
