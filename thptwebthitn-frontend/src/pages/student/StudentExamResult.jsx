import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import styled from 'styled-components';
import { FaCheck, FaTimes, FaArrowLeft, FaTrophy, FaClock, FaBook, FaPercent, FaInfoCircle } from 'react-icons/fa';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';

// Styled Components
const ResultContainer = styled.div`
  max-width: 1140px;
  margin: 0 auto;
  padding: 2rem 1rem;
  background-color: ${props => props.theme === 'dark' ? '#212529' : '#f8f9fa'};
  color: ${props => props.theme === 'dark' ? '#fff' : '#212529'};
  min-height: 100vh;
`;

const ResultCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#343a40' : '#fff'};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const ResultHeader = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#212529' : '#f8f9fa'};
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#495057' : '#dee2e6'};
`;

const ExamTitle = styled.h1`
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const ExamSubtitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#adb5bd' : '#6c757d'};
  font-weight: 400;
`;

const ResultSummary = styled.div`
  background-color: ${props => props.passed ? 
    (props.theme === 'dark' ? 'rgba(40, 167, 69, 0.2)' : 'rgba(40, 167, 69, 0.1)') : 
    (props.theme === 'dark' ? 'rgba(220, 53, 69, 0.2)' : 'rgba(220, 53, 69, 0.1)')
  };
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const ScoreCircle = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: ${props => props.passed ? '#28a745' : '#dc3545'};
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const ScoreValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  line-height: 1;
`;

const ScoreTotal = styled.div`
  font-size: 1.25rem;
  margin-top: 0.25rem;
`;

const ResultMessage = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${props => props.passed ? '#28a745' : '#dc3545'};
`;

const ResultStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin: 1.5rem 0;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 120px;
`;

const StatIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#adb5bd' : '#6c757d'};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#adb5bd' : '#6c757d'};
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
`;

const BackToExamsButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  background-color: ${props => props.theme === 'dark' ? '#343a40' : '#e9ecef'};
  color: ${props => props.theme === 'dark' ? '#fff' : '#212529'};
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  margin-bottom: 1.5rem;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#495057' : '#dee2e6'};
    color: ${props => props.theme === 'dark' ? '#fff' : '#212529'};
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const QuestionsTitle = styled.h3`
  font-size: 1.25rem;
  margin: 1.5rem 0;
  padding: 0 1.5rem;
`;

const QuestionList = styled.div`
  padding: 0 1.5rem 1.5rem;
`;

const QuestionItem = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2c3034' : '#f8f9fa'};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-left: 5px solid ${props => props.isCorrect ? '#28a745' : '#dc3545'};
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const QuestionNumber = styled.div`
  font-weight: 600;
`;

const QuestionScore = styled.div`
  background-color: ${props => props.isCorrect ? '#28a745' : '#dc3545'};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
  }
`;

const QuestionContent = styled.div`
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const OptionItem = styled.div`
  display: flex;
  padding: 0.75rem;
  border-radius: 4px;
  background-color: ${props => {
    if (props.isSelected && props.isCorrect) return props.theme === 'dark' ? 'rgba(40, 167, 69, 0.2)' : 'rgba(40, 167, 69, 0.1)';
    if (props.isSelected && !props.isCorrect) return props.theme === 'dark' ? 'rgba(220, 53, 69, 0.2)' : 'rgba(220, 53, 69, 0.1)';
    if (props.isCorrect) return props.theme === 'dark' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(40, 167, 69, 0.05)';
    return props.theme === 'dark' ? '#343a40' : '#fff';
  }};
  border: 1px solid ${props => {
    if (props.isSelected && props.isCorrect) return '#28a745';
    if (props.isSelected && !props.isCorrect) return '#dc3545';
    if (props.isCorrect) return '#28a745';
    return props.theme === 'dark' ? '#495057' : '#dee2e6';
  }};
`;

const OptionLabel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${props => {
    if (props.isSelected && props.isCorrect) return '#28a745';
    if (props.isSelected && !props.isCorrect) return '#dc3545';
    if (props.isCorrect) return '#28a745';
    return props.theme === 'dark' ? '#495057' : '#e9ecef';
  }};
  color: ${props => {
    if (props.isSelected && props.isCorrect) return '#fff';
    if (props.isSelected && !props.isCorrect) return '#fff';
    if (props.isCorrect) return '#fff';
    return props.theme === 'dark' ? '#fff' : '#212529';
  }};
  margin-right: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
`;

const OptionContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const CorrectIndicator = styled.div`
  margin-left: 0.75rem;
  color: ${props => props.isCorrect ? '#28a745' : '#dc3545'};
  font-size: 1.25rem;
`;

const NoResultMessage = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#adb5bd' : '#6c757d'};
`;

// Add a new styled component for pending results message
const PendingResultMessage = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#343a40' : '#f8f9fa'};
  border: 1px solid ${props => props.theme === 'dark' ? '#495057' : '#dee2e6'};
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  margin: 2rem 0;
`;

const PendingIcon = styled.div`
  font-size: 3rem;
  color: ${props => props.theme === 'dark' ? '#6c757d' : '#6c757d'};
  margin-bottom: 1.5rem;
`;

const PendingTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#f8f9fa' : '#343a40'};
`;

const PendingText = styled.p`
  font-size: 1.1rem;
  color: ${props => props.theme === 'dark' ? '#adb5bd' : '#6c757d'};
  margin-bottom: 0.5rem;
`;

const StudentExamResult = () => {
  const { officialExamId } = useParams();
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5006';
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchExamResult();
  }, [isAuthenticated, officialExamId, navigate]);
  
  const fetchExamResult = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Không tìm thấy token xác thực');
    }
    
    try {
      // Try to get the result data
      const response = await axios.get(`${API_URL}/api/student/exams/${officialExamId}/result`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data && response.data.result) {
        console.log('API response data:', response.data);
        
        // Store the result data
        const result = response.data.result;
        
        // Make sure we have a proper structure with required fields
        setResultData({
          ...result,
          examTitle: result.examTitle || 'Kết quả bài thi',
          subjectName: result.subjectName || 'Chi tiết kết quả',
          score: result.score || 0,
          totalScore: result.totalScore || 0,
          percentageScore: result.percentageScore || 0,
          answeredQuestions: result.answeredQuestions || 0,
          correctAnswers: result.correctAnswers || 0,
          totalQuestions: result.totalQuestions || 0,
          isPassed: result.isPassed || false,
          duration: result.duration || 0,
          completedAt: result.completedAt || new Date().toISOString(),
          startedAt: result.startedAt || new Date().toISOString(),
          showAnswers: result.showAnswers === true,
          questions: result.questions || [], // Handle if questions aren't included
          // Add passScore if not present in API
          passScore: result.passScore || 0
        });
      } else {
        throw new Error('Định dạng dữ liệu không hợp lệ');
      }
    } catch (err) {
      // Check if this is a "results not released" error
      if (err.response && err.response.status === 400 && 
          err.response.data && err.response.data.message === "Kết quả bài thi chưa được công bố") {
        
        // Set result data with showAnswers = false to show the pending view
        setResultData({
          showAnswers: false,
          completedAt: new Date().toISOString() // Use current time as fallback
        });
        
        // Try to get minimal exam details
        try {
          const examDetailsResponse = await axios.get(
            `${API_URL}/api/student/exams/${officialExamId}`, 
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          
          if (examDetailsResponse.data) {
            setResultData(prevData => ({
              ...prevData,
              examTitle: examDetailsResponse.data.title,
              subjectName: examDetailsResponse.data.subjectName
            }));
          }
        } catch (detailsError) {
          console.warn('Could not fetch exam details:', detailsError);
        }
      } else {
        // Handle other errors
        console.error('Error fetching exam result:', err);
        setError('Không thể tải kết quả bài thi. Vui lòng thử lại sau.');
      }
    }
    
    // Try to get exam details with a separate API call if needed
    if (resultData && !resultData.examTitle) {
      try {
        const examDetailsResponse = await axios.get(
          `${API_URL}/api/student/exams/${officialExamId}`, 
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (examDetailsResponse.data) {
          setResultData(prevData => ({
            ...prevData,
            examTitle: examDetailsResponse.data.title,
            subjectName: examDetailsResponse.data.subjectName
          }));
        }
      } catch (detailsError) {
        console.warn('Could not fetch exam details:', detailsError);
      }
    }
  } finally {
    setLoading(false);
  }
};
  const getPassFailStatus = () => {
    if (!resultData) return false;
    return resultData.isPassed;
  };

  const getCorrectAnswersCount = () => {
    if (!resultData) return 0;
    return resultData.correctAnswers || 0;
  };
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!resultData) return <NoResultMessage theme={theme}>Không tìm thấy kết quả bài thi</NoResultMessage>;
  
  const isPassed = getPassFailStatus();
  const correctCount = getCorrectAnswersCount();
  const totalQuestions = resultData.totalQuestions || 0;
  const percentageCorrect = resultData.percentageScore || 0;
  
  // Format duration from seconds to minutes and seconds
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} phút${remainingSeconds > 0 ? ` ${remainingSeconds} giây` : ''}`;
  };
  
  // Check if results have been released
  const resultsReleased = resultData.showAnswers === true;
  
  return (
    <ResultContainer theme={theme}>
      <BackToExamsButton to="/student/assigned-exams" theme={theme}>
        <FaArrowLeft /> Trở về danh sách bài thi
      </BackToExamsButton>
      
      <ResultCard theme={theme}>
        <ResultHeader theme={theme}>
          <ExamTitle>{resultData.examTitle || 'Kết quả bài thi'}</ExamTitle>
          <ExamSubtitle theme={theme}>{resultData.subjectName || 'Chi tiết kết quả'}</ExamSubtitle>
        </ResultHeader>
        
        {!resultsReleased ? (
          <PendingResultMessage theme={theme}>
            <PendingIcon theme={theme}>
              <FaInfoCircle />
            </PendingIcon>
            <PendingTitle theme={theme}>Chưa công bố kết quả</PendingTitle>
            <PendingText theme={theme}>
              Bài thi của bạn đã được nộp thành công và đang chờ giáo viên công bố kết quả.
            </PendingText>
            <PendingText theme={theme}>
              Vui lòng kiểm tra lại sau để xem kết quả chi tiết.
            </PendingText>
            <PendingText theme={theme}>
              Thời gian nộp bài: {resultData.completedAt 
                ? new Date(resultData.completedAt).toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'N/A'}
            </PendingText>
          </PendingResultMessage>
        ) : (
          <>
            <ResultSummary passed={isPassed} theme={theme}>
              <ScoreCircle passed={isPassed}>
                <ScoreValue>{resultData.score || 0}</ScoreValue>
                <ScoreTotal>/{resultData.totalScore || 0}</ScoreTotal>
              </ScoreCircle>
              
              <ResultMessage passed={isPassed}>
                {isPassed ? 'Chúc mừng! Bạn đã đạt' : 'Bạn chưa đạt yêu cầu'}
              </ResultMessage>
              
             
              
              <ResultStats>
                <StatItem>
                  <StatIcon theme={theme}>
                    <FaCheck />
                  </StatIcon>
                  <StatLabel theme={theme}>Câu đúng</StatLabel>
                  <StatValue>{correctCount}/{totalQuestions}</StatValue>
                </StatItem>
                
                <StatItem>
                  <StatIcon theme={theme}>
                    <FaPercent />
                  </StatIcon>
                  <StatLabel theme={theme}>Tỉ lệ đúng</StatLabel>
                  <StatValue>{percentageCorrect.toFixed(1)}%</StatValue>
                </StatItem>
                
                <StatItem>
                  <StatIcon theme={theme}>
                    <FaClock />
                  </StatIcon>
                  <StatLabel theme={theme}>Thời gian làm</StatLabel>
                  <StatValue>{formatDuration(resultData.duration || 0)}</StatValue>
                </StatItem>
                
                <StatItem>
                  <StatIcon theme={theme}>
                    <FaBook />
                  </StatIcon>
                  <StatLabel theme={theme}>Thời gian bắt đầu</StatLabel>
                  <StatValue>{resultData.startedAt 
                    ? new Date(resultData.startedAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })
                    : 'N/A'}</StatValue>
                </StatItem>
              </ResultStats>
            </ResultSummary>
            
            {/* Question details section - only shown if questions data is available */}
            {resultData.questions && resultData.questions.length > 0 ? (
              <>
                <QuestionsTitle>Chi tiết các câu hỏi</QuestionsTitle>
                <QuestionList>
                  {/* Existing questions rendering code */}
                  {resultData.questions.map((question, index) => (
                    <QuestionItem key={question.examQuestionId || index} isCorrect={question.isCorrect} theme={theme}>
                      <QuestionHeader>
                        <QuestionNumber>Câu {index + 1}</QuestionNumber>
                        <QuestionScore isCorrect={question.isCorrect}>
                          {question.isCorrect ? (
                            <><FaCheck /> {question.score} điểm</>
                          ) : (
                            <><FaTimes /> 0 điểm</>
                          )}
                        </QuestionScore>
                      </QuestionHeader>
                      
                      <QuestionContent>{question.question?.content || 'Không có nội dung câu hỏi'}</QuestionContent>
                      
                      {question.question?.imagePath && (
                        <img 
                          src={question.question.imagePath} 
                          alt="Question illustration" 
                          style={{ maxWidth: '100%', marginBottom: '1rem' }} 
                        />
                      )}
                      
                      <OptionsList>
                        {question.question?.options?.map(option => {
                          const isSelected = option.id === question.selectedOptionId;
                          const isCorrect = option.isCorrect;
                          
                          return (
                            <OptionItem 
                              key={option.id} 
                              isSelected={isSelected} 
                              isCorrect={isCorrect} 
                              theme={theme}
                            >
                              <OptionLabel 
                                isSelected={isSelected} 
                                isCorrect={isCorrect} 
                                theme={theme}
                              >
                                {option.label}
                              </OptionLabel>
                              <OptionContent>
                                {option.content}
                              </OptionContent>
                              {isSelected && (
                                <CorrectIndicator isCorrect={isCorrect}>
                                  {isCorrect ? <FaCheck /> : <FaTimes />}
                                </CorrectIndicator>
                              )}
                              {!isSelected && isCorrect && (
                                <CorrectIndicator isCorrect={true}>
                                  <FaCheck />
                                </CorrectIndicator>
                              )}
                            </OptionItem>
                          );
                        })}
                      </OptionsList>
                    </QuestionItem>
                  ))}
                </QuestionList>
              </>
            ) : (
              <PendingResultMessage theme={theme}>
                <PendingIcon theme={theme}>
                  <FaInfoCircle />
                </PendingIcon>
                <PendingTitle theme={theme}>Thông tin chi tiết</PendingTitle>
                <PendingText theme={theme}>
                  Bạn đã hoàn thành bài thi với {resultData.correctAnswers}/{resultData.totalQuestions} câu đúng.
                </PendingText>
                <PendingText theme={theme}>
                  Điểm số: {resultData.score}/{resultData.totalScore} ({resultData.percentageScore}%)
                </PendingText>
                <PendingText theme={theme}>
                  Thời gian làm bài: {formatDuration(resultData.duration || 0)}
                </PendingText>
              </PendingResultMessage>
            )}
          </>
        )}
      </ResultCard>
    </ResultContainer>
  );
};

export default StudentExamResult;