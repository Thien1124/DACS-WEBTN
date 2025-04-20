import React, { useEffect, useState, useRef } from 'react';
import { Container, Card, Badge, Button, ProgressBar, Row, Col, Alert, Nav } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaArrowLeft, FaArrowRight, FaListOl, FaInfoCircle, FaCheck, FaTimes, FaTrophy } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import styled from 'styled-components';
import { formatDuration } from '../../utils/formatters';

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

const OptionItem = styled.div`
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border: 1px solid ${props => {
    if (props.isCorrectAnswer) return '#28a745';
    if (props.isSelectedIncorrect) return '#dc3545';
    return '#dee2e6';
  }};
  border-radius: 0.25rem;
  background-color: ${props => {
    if (props.isCorrectAnswer) return 'rgba(40, 167, 69, 0.1)';
    if (props.isSelectedIncorrect) return 'rgba(220, 53, 69, 0.1)';
    return 'transparent';
  }};
  display: flex;
  align-items: center;

  .option-marker {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    background-color: ${props => {
      if (props.isCorrectAnswer) return '#28a745';
      if (props.isSelectedIncorrect) return '#dc3545';
      return '#e9ecef';
    }};
    color: #fff;
  }

  .option-text {
    flex: 1;
  }

  .option-icon {
    margin-left: 10px;
    color: ${props => props.isCorrectAnswer ? '#28a745' : '#dc3545'};
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

  useEffect(() => {
    const fetchExamResult = async () => {
      try {
        setLoading(true);
        
        // Check multiple possible token storage locations
        let token = localStorage.getItem('auth_token');
        
        // If not found with 'auth_token', try other common token key names
        if (!token) {
          token = localStorage.getItem('token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('jwt') ||
                  localStorage.getItem('userToken');
          
          // Also check sessionStorage in case token is stored there
          if (!token) {
            token = sessionStorage.getItem('token') || 
                   sessionStorage.getItem('auth_token') || 
                   sessionStorage.getItem('accessToken');
          }
        }
        
        console.log('Token found?', !!token);
        
        if (!token) {
          setError('Vui lòng đăng nhập để xem kết quả bài thi.');
          setLoading(false);
          return;
        }
        
        // Validate resultId - THIS IS THE KEY FIX
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
        
        console.log('API response status:', response.status);
        console.log('API response data:', response.data);
        
        // Map API response to component's expected structure with safer property access
        const data = response.data || {};
        
        // Check if essential data exists
        if (!data.exam) {
          console.error('Missing exam data in API response');
          setError('Dữ liệu bài thi không đầy đủ.');
          setLoading(false);
          return;
        }
        
        const mappedData = {
          examTitle: data.exam?.title || 'Không có tiêu đề',
          isPassed: Boolean(data.isPassed),
          duration: data.duration || 0,
          passingScore: data.passScore || 0,
          subjectName: data.exam?.subject?.name || 'Không có môn học',
          score: Number(data.score) || 0,
          totalScore: Number(data.totalScore) || 10,
          examId: data.exam?.id,
          // Map student answers to questions with proper error handling
          questions: Array.isArray(data.studentAnswers) ? data.studentAnswers.map(answer => ({
            id: answer.questionId,
            text: answer.questionContent || 'Không có nội dung câu hỏi',
            userAnswer: answer.selectedOptionId,
            isCorrect: Boolean(answer.isCorrect),
            options: Array.isArray(answer.options) ? answer.options.map(opt => ({
              id: opt.id,
              text: opt.text || '',
              label: opt.label || String.fromCharCode(65 + (answer.options.indexOf(opt) % 26))
            })) : [],
            correctAnswerId: answer.correctOptionId,
            explanation: answer.explanation || ''
          })) : []
        };
        
        console.log('Mapped data:', mappedData);
        setResult(mappedData);
        
        // Initialize refs array for question navigation
        questionRefs.current = mappedData.questions.map(() => React.createRef());
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

  const handleQuestionSelect = (index) => {
    setCurrentQuestion(index);
    questionRefs.current[index].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  // Calculate statistics
  const calculateStats = () => {
    if (!result) return { correct: 0, incorrect: 0, unanswered: 0 };
    
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
  };

  const stats = calculateStats();

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
              <p><strong>Thời gian làm bài:</strong> {formatDuration(result.duration)}</p>
              <p><strong>Điểm đạt:</strong> {result.passingScore}</p>
              <p><strong>Môn học:</strong> {result.subjectName}</p>
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-between mb-1">
                <span>Điểm số của bạn:</span>
                <strong>{result.score.toFixed(2)}/10</strong>
              </div>
              <ProgressBar 
                now={result.score * 10} 
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
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <div className="mb-4">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link 
              active={viewMode === 'review'} 
              onClick={() => setViewMode('review')}
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
          <div className="mb-4">
            <Card bg={theme === 'dark' ? 'dark' : 'light'} className="shadow-sm">
              <Card.Body>
                <h6>Chú giải</h6>
                <div className="d-flex flex-wrap">
                  <div className="d-flex align-items-center me-3 mb-2">
                    <div style={{ width: 16, height: 16, backgroundColor: '#28a745', borderRadius: '50%', marginRight: 8 }}></div>
                    <small>Câu đúng</small>
                  </div>
                  <div className="d-flex align-items-center me-3 mb-2">
                    <div style={{ width: 16, height: 16, backgroundColor: '#dc3545', borderRadius: '50%', marginRight: 8 }}></div>
                    <small>Câu sai</small>
                  </div>
                  <div className="d-flex align-items-center mb-2">
                    <div style={{ width: 16, height: 16, backgroundColor: '#6c757d', borderRadius: '50%', marginRight: 8 }}></div>
                    <small>Chưa trả lời</small>
                  </div>
                </div>
                <h6 className="mt-3">Điều hướng câu hỏi</h6>
                <QuestionNavigator>
                  {result.questions.map((question, index) => (
                    <button 
                      key={index} 
                      className={`
                        ${question.isCorrect ? 'correct' : question.userAnswer ? 'incorrect' : 'unanswered'}
                        ${currentQuestion === index ? ' current' : ''}
                      `}
                      onClick={() => handleQuestionSelect(index)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </QuestionNavigator>
                <div className="d-flex justify-content-between mt-3">
                  <Button 
                    variant="outline-primary" 
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                  >
                    <FaArrowLeft className="me-1" /> Câu trước
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    onClick={handleNext}
                    disabled={currentQuestion === result.questions.length - 1}
                  >
                    Câu sau <FaArrowRight className="ms-1" />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
          
          {result.questions.map((question, qIndex) => {
            const isAnswered = !!question.userAnswer;
            const isCorrect = question.isCorrect;
            
            return (
              <QuestionCard 
                key={qIndex}
                ref={questionRefs.current[qIndex]}
                isCorrect={isCorrect}
                isAnswered={isAnswered && !isCorrect}
                bg={theme === 'dark' ? 'dark' : 'light'} 
                className="shadow-sm"
                id={`question-${qIndex}`}
              >
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="fw-bold">Câu {qIndex + 1}: </span>
                    <Badge bg={isCorrect ? 'success' : isAnswered ? 'danger' : 'secondary'} className="ms-2">
                      {isCorrect ? 'Đúng' : isAnswered ? 'Sai' : 'Chưa trả lời'}
                    </Badge>
                  </div>
                  <div>
                    {isCorrect ? (
                      <FaCheckCircle color="#28a745" size={20} />
                    ) : isAnswered ? (
                      <FaTimesCircle color="#dc3545" size={20} />
                    ) : (
                      <FaInfoCircle color="#6c757d" size={20} />
                    )}
                  </div>
                </Card.Header>
                <Card.Body>
                  <Card.Title dangerouslySetInnerHTML={{ __html: question.text }} />
                  
                  {question.options.map((option, oIndex) => {
                    const isSelectedOption = question.userAnswer === option.id;
                    const isCorrectAnswer = option.id === question.correctAnswerId;
                    const isSelectedIncorrect = isSelectedOption && !isCorrectAnswer;
                    
                    return (
                      <OptionItem 
                        key={option.id} 
                        isCorrectAnswer={isCorrectAnswer}
                        isSelectedIncorrect={isSelectedIncorrect}
                      >
                        <div className="option-marker">
                          {String.fromCharCode(65 + oIndex)}
                        </div>
                        <div 
                          className="option-text" 
                          dangerouslySetInnerHTML={{ __html: option.text }}
                        />
                        {isCorrectAnswer && (
                          <div className="option-icon">
                            <FaCheck size={16} />
                          </div>
                        )}
                        {isSelectedIncorrect && (
                          <div className="option-icon">
                            <FaTimes size={16} />
                          </div>
                        )}
                      </OptionItem>
                    );
                  })}
                  
                  {question.explanation && (
                    <Alert variant="info" className="mt-3">
                      <strong>Giải thích:</strong> {question.explanation}
                    </Alert>
                  )}
                </Card.Body>
              </QuestionCard>
            );
          })}
          
          <div className="d-flex justify-content-between mt-4">
            <Button variant="secondary" as={Link} to="/exam-history">
              <FaArrowLeft className="me-2" /> Quay lại lịch sử bài thi
            </Button>
          </div>
        </>
      )}
      
      {viewMode === 'summary' && (
        <Card bg={theme === 'dark' ? 'dark' : 'light'} className="shadow-sm">
          <Card.Body>
            <h5 className="mb-4">Bảng tổng kết</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th style={{ width: '10%' }}>Câu</th>
                    <th style={{ width: '60%' }}>Nội dung</th>
                    <th style={{ width: '15%' }}>Đáp án của bạn</th>
                    <th style={{ width: '15%' }}>Kết quả</th>
                  </tr>
                </thead>
                <tbody>
                  {result.questions.map((question, index) => (
                    <tr key={index} onClick={() => {
                      setViewMode('review');
                      setTimeout(() => handleQuestionSelect(index), 100);
                    }} style={{ cursor: 'pointer' }}>
                      <td className="text-center">{index + 1}</td>
                      <td>
                        <span dangerouslySetInnerHTML={{ 
                          __html: question.text.length > 100 ? 
                            question.text.substring(0, 100) + '...' : 
                            question.text 
                        }} />
                      </td>
                      <td className="text-center">
                        {question.userAnswer ? (
                          question.options.find(o => o.id === question.userAnswer)?.label || '-'
                        ) : (
                          <em className="text-muted">Không có</em>
                        )}
                      </td>
                      <td className="text-center">
                        {question.isCorrect ? (
                          <Badge bg="success">Đúng</Badge>
                        ) : question.userAnswer ? (
                          <Badge bg="danger">Sai</Badge>
                        ) : (
                          <Badge bg="secondary">Chưa trả lời</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default ExamResults;