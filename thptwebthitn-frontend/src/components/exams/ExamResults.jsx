import React, { useEffect, useState, useRef } from 'react';
import { Container, Card, Badge, Button, ProgressBar, Row, Col, Alert, Nav, Table } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle,FaEye,FaChevronLeft,FaChevronRight, FaArrowLeft, FaArrowRight, FaListOl, FaInfoCircle, FaCheck, FaTimes, FaTrophy, FaClock, FaMinus, FaExclamationTriangle, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import styled from 'styled-components';

const QuestionCard = styled(Card)`
  margin-bottom: 1.5rem;
  border-left: 4px solid ${props => 
    props.isCorrect ? '#28a745' : 
    props.isAnswered ? '#dc3545' : '#6c757d'};
  
  .card-header {
    background-color: ${props => 
      props.isCorrect ? 'rgba(40, 167, 69, 0.1)' : 
      props.isAnswered ? 'rgba(220, 53, 69, 0.1)' : 'inherit'};
  }
`;

// Cập nhật component OptionItem để hiển thị rõ hơn
const OptionItem = styled.div`
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border: 2px solid ${props => {
    if (!props.showAnswers) return '#dee2e6';
    if (props.isCorrectAnswer) return '#28a745';
    if (props.isSelectedIncorrect) return '#dc3545';
    if (props.isSelected) return '#007bff';
    return '#dee2e6';
  }};
  border-radius: 0.25rem;
  background-color: ${props => {
    if (!props.showAnswers) return 'transparent';
    if (props.isCorrectAnswer) return 'rgba(40, 167, 69, 0.15)';
    if (props.isSelectedIncorrect) return 'rgba(220, 53, 69, 0.15)';
    if (props.isSelected) return 'rgba(0, 123, 255, 0.1)';
    return 'transparent';
  }};
  display: flex;
  align-items: center;
  transition: all 0.2s ease;

  .option-marker {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    background-color: ${props => {
      if (!props.showAnswers) return '#e9ecef';
      if (props.isCorrectAnswer) return '#28a745';
      if (props.isSelectedIncorrect) return '#dc3545';
      if (props.isSelected) return '#007bff';
      return '#e9ecef';
    }};
    color: #fff;
    font-weight: bold;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .option-text {
    flex: 1;
    color: ${props => props.theme === 'dark' ? '#fff' : '#212529'};
  }

  .option-icon {
    margin-left: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

// Thêm component mới để hiển thị kết quả dạng badge
const ResultBadge = styled(Badge)`
  font-size: 0.85rem;
  padding: 0.35em 0.65em;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-left: 10px;
`;

// Thêm component cho hiển thị giải thích
const ExplanationCard = styled(Alert)`
  margin-top: 1rem;
  border-left: 4px solid #0dcaf0;
  background-color: ${props => props.theme === 'dark' ? 'rgba(13, 202, 240, 0.15)' : 'rgba(13, 202, 240, 0.1)'};
  
  strong {
    color: #0dcaf0;
  }
`;

const QuestionNavigator = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 8px;
  margin-bottom: 1rem;
  
  button {
    height: 40px;
    width: 40px;
    padding: 0;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    border: none;
    cursor: pointer;
    border-radius: 4px;
  }
  
  .correct {
    background-color: #28a745;
  }
  
  .incorrect {
    background-color: #dc3545;
  }
  
  .unanswered {
    background-color: #6c757d;
  }
  
  .current {
    box-shadow: 0 0 0 2px #007bff;
    z-index: 1;
  }
`;

// Add a new styled component for the empty questions state
const EmptyQuestionsAlert = styled(Alert)`
  margin-top: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border-left: 5px solid #17a2b8;
  
  .alert-heading {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    
    svg {
      margin-right: 0.75rem;
      font-size: 1.5rem;
    }
  }
  
  ul {
    margin-top: 0.5rem;
    margin-bottom: 1rem;
  }
`;

// Helper function to format duration (move this to utils if not already there)
const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return 'N/A';
  
  if (typeof minutes === 'string' && minutes.includes(':')) {
    // Already formatted as HH:MM
    return minutes;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:00`;
};

const ExamResults = () => {
  const { resultId } = useParams();
  const [result, setResult] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [viewMode, setViewMode] = useState('review'); // 'review' or 'summary'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useSelector(state => state.ui);
  const navigate = useNavigate();
  const questionRefs = useRef([]);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  useEffect(() => {
    const fetchExamResult = async () => {
      try {
        setLoading(true);
        
        // Check multiple possible token storage locations
        let token = localStorage.getItem('token') || 
                  localStorage.getItem('auth_token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('jwt') ||
                  localStorage.getItem('userToken');
        
        // Also check sessionStorage in case token is stored there
        if (!token) {
          token = sessionStorage.getItem('token') || 
                 sessionStorage.getItem('auth_token') || 
                 sessionStorage.getItem('accessToken');
        }
        
        console.log('Token found?', !!token);
        
        if (!token) {
          setError('Vui lòng đăng nhập để xem kết quả bài thi.');
          setLoading(false);
          return;
        }
        
        // Validate resultId
        if (!resultId) {
          setError('ID kết quả bài thi không hợp lệ.');
          setLoading(false);
          return;
        }
        
        console.log('Attempting to fetch result with ID:', resultId);
        
        // Ensure API_URL doesn't end with a slash
        const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
        
        // Debug request details
        console.log(`Making request to: ${baseUrl}/api/Results/${resultId}`);
        
        const response = await axios.get(`${baseUrl}/api/Results/${resultId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        const data = response.data || {};
        
        // ✅ KIỂM TRA DỮ LIỆU VÀ QUYỀN HIỂN THỊ
        const hasStudentAnswers = data.studentAnswers && Array.isArray(data.studentAnswers) && data.studentAnswers.length > 0;
        
        // ✅ LOGIC ĐÚNG: KIỂM TRA QUYỀN HIỂN THỊ
        const showResult = data.exam?.showResult !== false; // Mặc định hiển thị kết quả
        const showAnswers = data.exam?.showAnswers === true; // Chỉ hiển thị đáp án khi được phép
        
        console.log('API Response Data:', data);
        console.log('Exam ShowResult:', data.exam?.showResult);
        console.log('Exam ShowAnswers:', data.exam?.showAnswers);
        console.log('Has student answers:', hasStudentAnswers);
        console.log('Final - Show result:', showResult);
        console.log('Final - Show answers:', showAnswers);
        
        const mappedData = {
          id: data.id,
          examTitle: data.exam?.title || 'Không có tiêu đề',
          examType: data.exam?.type || '',
          isPassed: Boolean(data.isPassed),
          duration: data.duration || 0,
          durationFormatted: data.durationFormatted || formatDuration(data.duration),
          passingScore: data.passScore || 0,
          subjectName: data.exam?.subject?.name || 'Không có môn học',
          subjectCode: data.exam?.subject?.code || '',
          score: Number(data.score) || 0,
          totalScore: Number(data.totalScore) || 10,
          percentageScore: Number(data.percentageScore) || 0,
          examId: data.exam?.id,
          correctAnswers: Number(data.correctAnswers) || 0,
          totalQuestions: Number(data.totalQuestions) || 0,
          answeredQuestions: Number(data.answeredQuestions) || 0,
          startedAt: data.startedAt || null,
          completedAt: data.completedAt || null,
          studentName: data.student?.fullName || '',
          
          // ✅ LOGIC CHÍNH XÁC
          hasQuestionData: hasStudentAnswers,
          showResult: showResult,
          showAnswers: showAnswers,
          
          // Map student answers
          questions: hasStudentAnswers ? data.studentAnswers.map(answer => {
            const options = Array.isArray(answer.options) ? answer.options : [];
            
            return {
              id: answer.questionId,
              text: answer.questionContent || 'Không có nội dung câu hỏi',
              userAnswer: answer.selectedOptionId || null,
              isCorrect: Boolean(answer.isCorrect),
              options: options.map((opt, index) => ({
                id: opt.id,
                text: opt.content || opt.text || '',
                label: opt.label || String.fromCharCode(65 + index),
                isCorrect: showAnswers ? Boolean(opt.isCorrect) : false // ✅ Chỉ hiển thị đáp án đúng nếu được phép
              })),
              correctAnswerId: showAnswers ? answer.correctOptionId : null, // ✅ Chỉ hiển thị nếu được phép
              explanation: showAnswers ? (answer.explanation || '') : '' // ✅ Chỉ hiển thị nếu được phép
            };
          }) : []
        };
        
        console.log('Final mapped data:', mappedData);
        setResult(mappedData);
        
        // Initialize refs array for question navigation if we have questions
        if (hasStudentAnswers) {
          questionRefs.current = new Array(mappedData.questions.length).fill(null)
            .map(() => React.createRef());
        }
      } catch (err) {
        console.error('Error fetching exam result:', err);
        
        // Detailed error handling
        if (err.response) {
          console.error('Error status:', err.response.status);
          console.error('Error data:', err.response.data);
          
          if (err.response.status === 401) {
            setError('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
          } else if (err.response.status === 403) {
            setError('Bạn không có quyền xem kết quả bài thi này.');
          } else if (err.response.status === 404) {
            setError('Không tìm thấy kết quả bài thi.');
          } else {
            setError(`Lỗi khi tải kết quả: ${err.response.status}`);
          }
        } else if (err.request) {
          console.error('No response received:', err.request);
          setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
        } else {
          setError(`Lỗi: ${err.message || 'Không xác định'}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExamResult();
  }, [resultId]);

  // Calculate statistics
  const calculateStats = () => {
    if (!result) return { correct: 0, incorrect: 0, unanswered: 0 };
    
    if (result.hasQuestionData) {
      return result.questions.reduce((stats, question) => {
        if (!question.userAnswer) {
          stats.unanswered++;
        } else if (question.isCorrect) {
          stats.correct++;
        } else {
          stats.incorrect++;
        }
        return stats;
      }, { correct: 0, incorrect: 0, unanswered: 0 });
    } else {
      return {
        correct: result.correctAnswers || 0,
        incorrect: (result.answeredQuestions || 0) - (result.correctAnswers || 0),
        unanswered: (result.totalQuestions || 0) - (result.answeredQuestions || 0)
      };
    }
  };

  const stats = calculateStats();

  // Sửa logic điều hướng câu hỏi
  const handleQuestionSelect = (index) => {
    if (index >= 0 && index < result.questions.length) {
      setCurrentQuestion(index);
      
      // Scroll tới câu hỏi được chọn
      if (questionRefs.current[index]?.current) {
        questionRefs.current[index].current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  const handleNext = () => {
    if (currentQuestion < result.questions.length - 1) {
      handleQuestionSelect(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      handleQuestionSelect(currentQuestion - 1);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!result) return <Alert variant="warning">Không tìm thấy kết quả bài thi.</Alert>;

  return (
    <Container className="py-4">
      <h2 className="mb-3">Kết quả bài thi</h2>
      
      <Card bg={theme === 'dark' ? 'dark' : 'light'} className="mb-4 shadow-sm">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">{result.examTitle}</h5>
            <Badge bg={result.isPassed ? 'success' : 'danger'}>
              {result.isPassed ? 'Đạt' : 'Không đạt'}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Thời gian làm bài:</strong> {result.durationFormatted}</p>
              <p><strong>Điểm đạt:</strong> {result.passingScore}</p>
              <p><strong>Môn học:</strong> {result.subjectName}</p>
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-between mb-1">
                <span>Điểm số của bạn:</span>
                <strong>{result.score.toFixed(2)}/{result.totalScore}</strong>
              </div>
              <ProgressBar 
                now={(result.score / result.totalScore) * 100} 
                variant={result.isPassed ? 'success' : 'danger'} 
                className="mb-3" 
              />
              <div className="d-flex flex-wrap">
                <div className="me-3 mb-2">
                  <Badge bg="success" className="me-1">{stats.correct}</Badge>
                  <small>Đúng</small>
                </div>
                <div className="me-3 mb-2">
                  <Badge bg="danger" className="me-1">{stats.incorrect}</Badge>
                  <small>Sai</small>
                </div>
                <div className="mb-2">
                  <Badge bg="secondary" className="me-1">{stats.unanswered}</Badge>
                  <small>Chưa trả lời</small>
                </div>
              </div>
              {result.examId && (
                <div className="d-flex mt-3">
                  <Button 
                    as={Link} 
                    to={`/leaderboard/exams/${result.examId}`} 
                    variant="outline-warning"
                    className="d-flex align-items-center"
                    size="sm"
                  >
                    <FaTrophy className="me-2" /> Xem bảng xếp hạng
                  </Button>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* ✅ Hiển thị thông báo nếu không được phép xem đáp án */}
      {!result.showAnswers && result.hasQuestionData && (
        <Alert variant="warning" className="mb-4">
          <div className="d-flex align-items-center">
            <FaEyeSlash className="me-2" size={20} />
            <div>
              <strong>Đề thi này chưa cho phép xem đáp án chi tiết</strong>
              <p className="mb-0 mt-1">
                Giáo viên đã thiết lập không hiển thị đáp án đúng cho bài thi này. 
                Bạn chỉ có thể xem câu trả lời của mình và kết quả đúng/sai.
              </p>
            </div>
          </div>
        </Alert>
      )}
      
      <div className="mb-4">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link 
              active={viewMode === 'review'} 
              onClick={() => setViewMode('review')}
              disabled={!result.hasQuestionData}
            >
              Chi tiết bài làm
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={viewMode === 'summary'} 
              onClick={() => setViewMode('summary')}
            >
              Tổng quan
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

      {viewMode === 'review' && (
        <>
          {/* ✅ KIỂM TRA XEM CÓ DỮ LIỆU CÂU HỎI KHÔNG */}
          {result.hasQuestionData ? (
            <>
              {/* ✅ HIỂN THỊ CẢNH BÁO NẾU KHÔNG ĐƯỢC PHÉP XEM ĐÁP ÁN */}
              {!result.showAnswers && (
                <Alert variant="warning" className="mb-4">
                  <div className="d-flex align-items-center">
                    <FaEyeSlash className="me-2" size={20} />
                    <div>
                      <strong>Đề thi này chưa cho phép xem đáp án chi tiết</strong>
                      <p className="mb-0 mt-1">
                        Giáo viên đã thiết lập không hiển thị đáp án đúng cho bài thi này. 
                        Bạn chỉ có thể xem câu trả lời của mình và kết quả đúng/sai.
                      </p>
                    </div>
                  </div>
                </Alert>
              )}
              
              {/* Navigation và questions */}
              <div className="mb-4">
                <Card bg={theme === 'dark' ? 'dark' : 'light'} className="shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0">Điều hướng câu hỏi</h6>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="showAllQuestions"
                          checked={showAllQuestions}
                          onChange={(e) => setShowAllQuestions(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="showAllQuestions">
                          Hiển thị tất cả câu hỏi
                        </label>
                      </div>
                    </div>
                    
                    <div className="d-flex flex-wrap">
                      <Badge bg="success" className="me-2 mb-2">
                        <FaCheck className="me-1" /> Đúng
                      </Badge>
                      <Badge bg="danger" className="me-2 mb-2">
                        <FaTimes className="me-1" /> Sai
                      </Badge>
                      <Badge bg="secondary" className="me-2 mb-2">
                        <FaMinus className="me-1" /> Chưa trả lời
                      </Badge>
                      <Badge bg="primary" className="me-2 mb-2">
                        <FaEye className="me-1" /> Đang xem
                      </Badge>
                    </div>
                    
                    <QuestionNavigator>
                      {result.questions.map((question, index) => (
                        <button 
                          key={index} 
                          className={`
                            ${question.isCorrect ? 'correct' : question.userAnswer ? 'incorrect' : 'unanswered'}
                            ${currentQuestion === index ? ' current' : ''}
                          `}
                          onClick={() => handleQuestionSelect(index)}
                          title={`Câu ${index + 1}: ${question.isCorrect ? 'Đúng' : question.userAnswer ? 'Sai' : 'Chưa trả lời'}`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </QuestionNavigator>
                    
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <Button 
                        variant="outline-primary" 
                        onClick={handlePrevious}
                        disabled={currentQuestion === 0}
                        size="sm"
                      >
                        <FaChevronLeft className="me-1" /> Câu trước
                      </Button>
                      
                      <div className="d-flex align-items-center gap-3">
                        <span className="fw-bold">
                          Câu {currentQuestion + 1} / {result.questions.length}
                        </span>
                      </div>
                      
                      <Button 
                        variant="outline-primary" 
                        onClick={handleNext}
                        disabled={currentQuestion === result.questions.length - 1}
                        size="sm"
                      >
                        Câu sau <FaChevronRight className="ms-1" />
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </div>
              
              {/* Questions display */}
              <div className="questions-container">
                {result.questions.map((question, qIndex) => {
                  // Nếu chế độ hiển thị tất cả HOẶC là câu hiện tại thì hiển thị
                  const shouldShow = showAllQuestions || qIndex === currentQuestion;
                  
                  if (!shouldShow) return null;
                  
                  const isAnswered = question.userAnswer !== null;
                  const isCorrect = question.isCorrect;
                  const selectedOption = question.options.find(o => o.id === question.userAnswer);
                  const correctOption = question.options.find(o => o.isCorrect);
                  
                  return (
                    <QuestionCard 
                      key={qIndex} 
                      ref={questionRefs.current[qIndex]}
                      className={qIndex === currentQuestion ? 'current-question' : ''}
                      style={{ 
                        marginBottom: showAllQuestions ? '2rem' : '0',
                        border: qIndex === currentQuestion ? '2px solid #007bff' : undefined
                      }}
                    >
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <span className="fw-bold me-2">Câu {qIndex + 1}: </span>
                          {isCorrect ? (
                            <ResultBadge bg="success">
                              <FaCheckCircle /> Đúng
                            </ResultBadge>
                          ) : isAnswered ? (
                            <ResultBadge bg="danger">
                              <FaTimesCircle /> Sai
                            </ResultBadge>
                          ) : (
                            <ResultBadge bg="secondary">
                              <FaInfoCircle /> Chưa trả lời
                            </ResultBadge>
                          )}
                        </div>
                        
                        {result.showAnswers && (
                          <div className="d-flex align-items-center">
                            {!isCorrect && isAnswered && selectedOption && (
                              <small className="me-3 text-danger">
                                Bạn chọn: {selectedOption.label}
                              </small>
                            )}
                            <small className={isCorrect ? "text-success fw-bold" : "text-primary fw-bold"}>
                              {isAnswered ? (isCorrect ? 'Chính xác!' : `Đáp án đúng: ${correctOption?.label || 'N/A'}`) : 'Bạn chưa trả lời câu này'}
                            </small>
                          </div>
                        )}
                      </Card.Header>
                      
                      <Card.Body>
                        <Card.Title 
                          className="question-text mb-4"
                          dangerouslySetInnerHTML={{ __html: question.text }} 
                        />
                        
                        <h6 className="mb-3">Các đáp án:</h6>
                        <div className="options-container mb-3">
                          {question.options.map((option, oIndex) => {
                            const isSelectedOption = question.userAnswer === option.id;
                            const isCorrectAnswer = result.showAnswers && option.isCorrect;
                            const isSelectedIncorrect = isSelectedOption && !isCorrectAnswer && result.showAnswers;
                            
                            return (
                              <OptionItem 
                                key={option.id} 
                                isCorrectAnswer={isCorrectAnswer}
                                isSelectedIncorrect={isSelectedIncorrect}
                                isSelected={isSelectedOption}
                                showAnswers={result.showAnswers}
                                theme={theme}
                              >
                                <div className="option-marker">
                                  {option.label || String.fromCharCode(65 + oIndex)}
                                </div>
                                <div 
                                  className="option-text" 
                                  dangerouslySetInnerHTML={{ __html: option.text }}
                                />
                                <div className="option-icon">
                                  {result.showAnswers && isCorrectAnswer && (
                                    <FaCheckCircle size={20} color="#28a745" />
                                  )}
                                  {result.showAnswers && isSelectedIncorrect && (
                                    <FaTimesCircle size={20} color="#dc3545" />
                                  )}
                                  {isSelectedOption && !result.showAnswers && (
                                    <FaArrowRight size={20} color="#007bff" />
                                  )}
                                </div>
                              </OptionItem>
                            );
                          })}
                        </div>
                        
                        {/* Kết quả chi tiết */}
                        {result.showAnswers && (
                          <div className="mt-3">
                            {isAnswered && (
                              <div className={`p-2 rounded mb-2 ${isCorrect ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                                <div className="d-flex align-items-center">
                                  {isCorrect ? <FaCheckCircle className="me-2" /> : <FaTimesCircle className="me-2" />}
                                  <span className="fw-bold">
                                    {isCorrect ? 'Bạn đã trả lời đúng!' : 'Bạn đã trả lời sai.'}
                                  </span>
                                </div>
                                {!isCorrect && selectedOption && (
                                  <div className="ms-4 mt-1">
                                    Bạn đã chọn: <strong>{selectedOption.label}</strong> - {selectedOption.text}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="text-success border-top pt-2">
                              <div className="d-flex align-items-center">
                                <FaCheckCircle className="me-2" />
                                <span className="fw-bold">Đáp án đúng: <strong>{correctOption?.label || 'N/A'}</strong></span>
                              </div>
                              {correctOption?.text && (
                                <div className="ms-4 mt-2 p-2 bg-light rounded" dangerouslySetInnerHTML={{ __html: correctOption.text }}></div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {!result.showAnswers && (
                          <div className="mt-3">
                            <Alert variant="info" className="mb-0">
                              <FaInfoCircle className="me-2" />
                              Đáp án đúng và giải thích không được hiển thị cho bài thi này.
                            </Alert>
                          </div>
                        )}
                        
                        {result.showAnswers && question.explanation && (
                          <ExplanationCard variant="info" className="mt-3" theme={theme}>
                            <div className="d-flex align-items-center mb-2">
                              <FaInfoCircle className="me-2 text-info" />
                              <strong>Giải thích:</strong>
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: question.explanation }} />
                          </ExplanationCard>
                        )}
                      </Card.Body>
                    </QuestionCard>
                  );
                })}
              </div>
            </>
          ) : (
            // If we don't have question data, show an informative message
            <EmptyQuestionsAlert variant="info">
              <h4 className="alert-heading">
                <FaExclamationTriangle /> Không có chi tiết câu hỏi
              </h4>
              <p>
                Chi tiết câu hỏi không khả dụng cho bài thi này. Bạn chỉ có thể xem thông tin tổng quan về kết quả.
              </p>
              <div className="mt-3">
                <Button 
                  variant="primary" 
                  onClick={() => setViewMode('summary')}
                  className="d-flex align-items-center mx-auto"
                >
                  <FaListOl className="me-2" /> Xem tổng quan kết quả
                </Button>
              </div>
            </EmptyQuestionsAlert>
          )}
          
          <div className="d-flex justify-content-between mt-4">
            <Button variant="secondary" as={Link} to="/exam-history">
              <FaArrowLeft className="me-2" /> Quay lại lịch sử bài thi
            </Button>
          </div>
        </>
      )}
      
      {viewMode === 'summary' && (
        <Card bg={theme === 'dark' ? 'dark' : 'light'} className="shadow-sm">
          <Card.Header>
            <h5 className="mb-0">Tổng quan kết quả</h5>
          </Card.Header>
          <Card.Body>
            {/* Statistics summary */}
            <Row className="text-center mb-4">
              <Col md={3}>
                <h4 className="text-primary">{stats.correct}</h4>
                <small>Câu đúng</small>
              </Col>
              <Col md={3}>
                <h4 className="text-danger">{stats.incorrect}</h4>
                <small>Câu sai</small>
              </Col>
              <Col md={3}>
                <h4 className="text-secondary">{stats.unanswered}</h4>
                <small>Chưa trả lời</small>
              </Col>
              <Col md={3}>
                <h4 className="text-success">{result.percentageScore.toFixed(1)}%</h4>
                <small>Tỷ lệ đúng</small>
              </Col>
            </Row>

            {/* ✅ CHỈ HIỂN THỊ BẢNG CHI TIẾT NẾU CÓ DỮ LIỆU */}
            {result.hasQuestionData ? (
              <>
                {/* ✅ HIỂN THỊ CẢNH BÁO NẾU KHÔNG ĐƯỢC PHÉP XEM ĐÁP ÁN */}
                {!result.showAnswers && (
                  <Alert variant="warning" className="mb-3">
                    <FaEyeSlash className="me-2" />
                    <strong>Lưu ý:</strong> Đáp án đúng không được hiển thị cho bài thi này.
                  </Alert>
                )}
                
                <div className="table-responsive">
                  <Table striped bordered hover variant={theme === 'dark' ? 'dark' : 'light'}>
                    <thead>
                      <tr>
                        <th style={{ width: '8%' }} className="text-center">STT</th>
                        <th style={{ width: '50%' }}>Nội dung câu hỏi</th>
                        <th style={{ width: '17%' }} className="text-center">Câu trả lời</th>
                        {result.showAnswers && <th style={{ width: '17%' }} className="text-center">Đáp án đúng</th>}
                        <th style={{ width: '13%' }} className="text-center">Kết quả</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.questions.map((question, index) => {
                        const selectedOption = question.options.find(o => o.id === question.userAnswer);
                        const correctOption = question.options.find(o => o.isCorrect);
                        
                        return (
                          <tr 
                            key={index} 
                            onClick={() => {
                              setViewMode('review');
                              setTimeout(() => handleQuestionSelect(index), 100);
                            }} 
                            style={{ 
                              cursor: 'pointer',
                              backgroundColor: question.isCorrect ? 'rgba(40, 167, 69, 0.05)' : 
                                              question.userAnswer ? 'rgba(220, 53, 69, 0.05)' : 
                                              'rgba(108, 117, 125, 0.05)'
                            }}
                          >
                            <td className="text-center fw-bold">{index + 1}</td>
                            <td>
                              <div 
                                style={{ maxHeight: '100px', overflow: 'hidden' }}
                                dangerouslySetInnerHTML={{ 
                                  __html: question.text.length > 150 ? question.text.substring(0, 150) + '...' : question.text 
                                }}
                              />
                            </td>
                            <td className="text-center">
                              {selectedOption ? (
                                <Badge bg={question.isCorrect ? 'success' : 'danger'}>
                                  {selectedOption.label}
                                </Badge>
                              ) : (
                                <Badge bg="secondary">Chưa trả lời</Badge>
                              )}
                            </td>
                            {result.showAnswers && (
                              <td className="text-center">
                                {correctOption ? (
                                  <Badge bg="success">{correctOption.label}</Badge>
                                ) : (
                                  <Badge bg="secondary">N/A</Badge>
                                )}
                              </td>
                            )}
                            <td className="text-center">
                              {question.isCorrect ? (
                                <Badge bg="success" pill>
                                  <FaCheck className="me-1" /> Đúng
                                </Badge>
                              ) : question.userAnswer ? (
                                <Badge bg="danger" pill>
                                  <FaTimes className="me-1" /> Sai
                                </Badge>
                              ) : (
                                <Badge bg="secondary" pill>
                                  <FaMinus className="me-1" /> Bỏ qua
                                </Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              </>
            ) : (
              <Alert variant="info" className="d-flex align-items-center">
                <FaInfoCircle size={20} className="me-3" />
                <div>
                  <p className="mb-0 fw-bold">Không có dữ liệu chi tiết câu hỏi</p>
                  <p className="mb-0 mt-1">Hệ thống chỉ lưu trữ thông tin tổng quan của bài thi này.</p>
                </div>
              </Alert>
            )}
            
            {/* ✅ CHỈ HIỂN THỊ NÚT XEM CHI TIẾT NẾU CÓ DỮ LIỆU */}
            {result.hasQuestionData && (
              <div className="mt-4 text-center">
                <Button variant="primary" onClick={() => setViewMode('review')}>
                  <FaListOl className="me-2" /> Xem chi tiết từng câu hỏi
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default ExamResults;