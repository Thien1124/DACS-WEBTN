import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExamWithQuestions } from '../../redux/examSlice'; // Sử dụng action mới
import styled from 'styled-components';
import { motion } from 'framer-motion'; // Thêm import này
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import LoadingSpinner from '../common/LoadingSpinner';

// Styled components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 0.5rem;
`;

const ExamTitle = styled.h2`
  font-size: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 0.5rem;
`;

const ExamInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.primary ? 
    'linear-gradient(135deg, #4285f4, #34a853)' : 
    props.theme === 'dark' ? '#2d3748' : '#f8f9fa'};
  color: ${props => props.primary ? '#ffffff' : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  border: 1px solid ${props => props.primary ? 
    'transparent' : 
    props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    background: ${props => props.primary ? 
      'linear-gradient(135deg, #3b78dc, #2d9348)' : 
      props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  }
`;

const QuestionCount = styled.div`
  margin: 1rem 0;
  font-size: 1rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const QuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const QuestionCard = styled(motion.div)`
  background: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  background: ${props => props.expanded ? 
    props.theme === 'dark' ? '#3e4c63' : '#f7fafc' : 
    props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-bottom: ${props => props.expanded ? 
    `1px solid ${props.theme === 'dark' ? '#4a5568' : '#e2e8f0'}` : 'none'};
`;

const QuestionNumber = styled.div`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const DifficultyBadge = styled.span`
  background-color: ${props => {
    switch (props.difficulty) {
      case 'easy': return '#48BB78';
      case 'medium': return '#F6AD55';
      case 'hard': return '#F56565';
      default: return '#A0AEC0';
    }
  }};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 1rem;
`;

const QuestionType = styled.span`
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  margin-right: 1rem;
`;

const QuestionText = styled.div`
  padding: 1.5rem 1.5rem 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  line-height: 1.6;
  
  img {
    max-width: 100%;
    height: auto;
    margin: 1rem 0;
    border-radius: 4px;
  }
  
  p {
    margin-bottom: 1rem;
  }
  
  ul, ol {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const AnswersList = styled.div`
  padding: 0 1.5rem 1.5rem;
`;

const AnswerItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background-color: ${props => props.isCorrect ? 
    props.theme === 'dark' ? 'rgba(72, 187, 120, 0.2)' : 'rgba(72, 187, 120, 0.1)' : 
    'transparent'};
  border: 1px solid ${props => props.isCorrect ? 
    props.theme === 'dark' ? 'rgba(72, 187, 120, 0.5)' : 'rgba(72, 187, 120, 0.3)' : 
    props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const AnswerLetter = styled.div`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: ${props => props.isCorrect ? 
    '#48BB78' : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  color: ${props => props.isCorrect ? 
    'white' : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 600;
  margin-right: 1rem;
  flex-shrink: 0;
`;

const AnswerText = styled.div`
  flex: 1;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  p {
    margin: 0;
  }
  
  img {
    max-width: 100%;
    height: auto;
    margin-top: 0.5rem;
    border-radius: 4px;
  }
`;

const CorrectIcon = styled(FaCheckCircle)`
  color: #48BB78;
  margin-left: auto;
  font-size: 1.25rem;
  flex-shrink: 0;
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

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.color || '#4285f4'};
  color: white;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  border-radius: 8px;
  margin: 2rem 0;
`;

// Thêm đoạn này sau các styled components và trước component ExamQuestionsList

// Dữ liệu mẫu cho đề thi
const sampleExamDetail = {
  id: 1,
  title: "Đề thi học kỳ 1 - Toán lớp 12",
  subjectId: 1,
  subjectName: "Toán học",
  duration: 60,
  description: "Đề thi học kỳ 1 môn Toán dành cho học sinh lớp 12",
  isPublic: true,
  createdBy: "Admin",
  questions: [
    {
      id: 1,
      text: "Cho hàm số f(x) = x³ - 3x² + 3x - 1. Tìm giá trị lớn nhất của hàm số trên đoạn [0, 2].",
      type: "singleChoice",
      difficulty: "medium",
      answers: [
        { id: 1, text: "f(0) = -1", isCorrect: false },
        { id: 2, text: "f(1) = 0", isCorrect: false },
        { id: 3, text: "f(2) = 3", isCorrect: true },
        { id: 4, text: "f(3) = 8", isCorrect: false }
      ]
    },
    {
      id: 2,
      text: "Cho hình chóp S.ABC có đáy ABC là tam giác đều cạnh a, SA vuông góc với đáy và SA = a. Tính thể tích khối chóp S.ABC.",
      type: "singleChoice",
      difficulty: "hard",
      answers: [
        { id: 5, text: "V = a³/3", isCorrect: false },
        { id: 6, text: "V = a³/6", isCorrect: false },
        { id: 7, text: "V = a³√3/12", isCorrect: false },
        { id: 8, text: "V = a³√3/6", isCorrect: true }
      ]
    },
    {
      id: 3,
      text: "Đạo hàm của hàm số f(x) = e^x là:",
      type: "singleChoice",
      difficulty: "easy",
      answers: [
        { id: 9, text: "f'(x) = e^x", isCorrect: true },
        { id: 10, text: "f'(x) = xe^(x-1)", isCorrect: false },
        { id: 11, text: "f'(x) = e^(x+1)", isCorrect: false },
        { id: 12, text: "f'(x) = xe^x", isCorrect: false }
      ]
    }
  ]
};

const ExamQuestionsList = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Thêm state để lưu trữ dữ liệu mẫu:
  const [examDetail, setExamDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Không cần destructure examDetail từ Redux store
  const { loading: reduxLoading, error } = useSelector(state => state.exams);
  const { theme } = useSelector(state => state.ui);
  
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  
  useEffect(() => {
    if (examId) {
      console.log('Fetching exam questions for ID:', examId);
      dispatch(fetchExamWithQuestions(examId));
    }
  }, [dispatch, examId]);

  // Log để debug
  useEffect(() => {
    console.log('Exam Detail State:', examDetail);
  }, [examDetail]);
  
  useEffect(() => {
    // Sau 1 giây, set dữ liệu mẫu và tắt loading
    const timer = setTimeout(() => {
      setExamDetail(sampleExamDetail);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const toggleQuestion = (id) => {
    setExpandedQuestionId(expandedQuestionId === id ? null : id);
  };
  
  const handleBackToExam = () => {
    navigate(`/exams/by-subject/${examDetail?.subjectId || ''}`);
  };
  
  if (isLoading) {
    return (
      <>
        <Header />
        <Container>
          <LoadingSpinner />
          <p>Đang tải dữ liệu đề thi...</p>
        </Container>
        <Footer />
      </>
    );
  }

  // Kiểm tra cấu trúc nested khác nhau
  const questions = examDetail?.questions || 
                  examDetail?.questionList || 
                  examDetail?.examQuestions?.map(eq => eq.question) || 
                  [];
  console.log(`Found ${questions.length} questions`);
  
  return (
    <>
      <Header />
      <Container>
        <HeaderSection>
          <div>
            <PageTitle theme={theme}>Danh sách câu hỏi</PageTitle>
            <ExamTitle theme={theme}>{examDetail?.title || 'Đề thi'}</ExamTitle>
            <ExamInfo theme={theme}>
              <InfoItem>
                <span>Môn học:</span>
                <strong>{examDetail?.subjectName || '-'}</strong>
              </InfoItem>
              <InfoItem>
                <span>Thời gian:</span>
                <strong>{examDetail?.duration || 0} phút</strong>
              </InfoItem>
              <InfoItem>
                <span>Số câu hỏi:</span>
                <strong>{questions.length}</strong>
              </InfoItem>
            </ExamInfo>
          </div>
          
          <Button theme={theme} onClick={handleBackToExam}>
            <FaArrowLeft /> Quay lại đề thi
          </Button>
        </HeaderSection>
        
        {error ? (
          <div>Lỗi: {error}</div>
        ) : questions.length === 0 ? (
          <div>Không có câu hỏi nào trong đề thi này.</div>
        ) : (
          <QuestionList>
            {questions.map((question, index) => (
              <QuestionCard key={question.id} theme={theme}>
                <QuestionHeader 
                  theme={theme} 
                  expanded={expandedQuestionId === question.id}
                  onClick={() => toggleQuestion(question.id)}
                >
                  <QuestionNumber theme={theme}>
                    Câu {index + 1}
                  </QuestionNumber>
                  {expandedQuestionId === question.id ? '▼' : '▶'}
                </QuestionHeader>
                
                {expandedQuestionId === question.id && (
                  <>
                    <QuestionText theme={theme}>
                      {question.text}
                    </QuestionText>
                    
                    <AnswersList>
                      {question.answers?.map((answer, ansIndex) => (
                        <AnswerItem 
                          key={answer.id || ansIndex} 
                          theme={theme}
                          isCorrect={answer.isCorrect}
                        >
                          <AnswerLetter 
                            theme={theme}
                            isCorrect={answer.isCorrect}
                          >
                            {String.fromCharCode(65 + ansIndex)}
                          </AnswerLetter>
                          
                          <AnswerText theme={theme}>
                            {answer.text}
                          </AnswerText>
                          
                          {answer.isCorrect && <FaCheckCircle style={{color: '#48BB78'}} />}
                        </AnswerItem>
                      ))}
                    </AnswersList>
                  </>
                )}
              </QuestionCard>
            ))}
          </QuestionList>
        )}
      </Container>
      <Footer />
    </>
  );
};

export default ExamQuestionsList;