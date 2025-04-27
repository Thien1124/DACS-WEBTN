import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Badge, Row, Col, Button, Accordion, ProgressBar, Spinner, Alert } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle, FaClock, FaMedal, FaArrowLeft, FaChartPie, FaPrint, FaDownload } from 'react-icons/fa';
import axios from 'axios';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

// Styled Components
const ResultCard = styled(Card)`
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const ScoreBadge = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => {
    if (props.score >= 8) return 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)';
    if (props.score >= 6.5) return 'linear-gradient(135deg, #2196F3 0%, #03A9F4 100%)';
    if (props.score >= 5) return 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)';
    return 'linear-gradient(135deg, #F44336 0%, #FF5722 100%)';
  }};
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const ScoreValue = styled.div`
  font-size: 2.5rem;
  line-height: 1;
`;

const ScoreLabel = styled.div`
  font-size: 1rem;
  opacity: 0.9;
`;

const QuestionCard = styled(Card)`
  margin-bottom: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  &.correct {
    border-left: 4px solid #4CAF50;
  }
  
  &.incorrect {
    border-left: 4px solid #F44336;
  }
`;

const ExplanationBlock = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#343a40' : '#f8f9fa'};
  border-radius: 8px;
  border-left: 4px solid #2196F3;
`;

const TimingInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.95rem;
`;

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ExamResultDetail = () => {
  const { resultId } = useParams();
  const { theme } = useSelector(state => state.ui) || { theme: 'light' };
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchResultDetail = async () => {
      try {
        setLoading(true);
        
        // Gọi API để lấy thông tin chi tiết kết quả thi
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5006'}/api/Results/${resultId}`
        );
        
        console.log('Result detail:', response.data);
        setResult(response.data);
      } catch (error) {
        console.error('Error fetching result details:', error);
        setError('Không thể tải thông tin kết quả thi. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchResultDetail();
  }, [resultId]);
  
  // Format thời gian từ chuỗi ISO
  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  // Tính thời gian làm bài (phút)
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    
    return `${diffMins} phút`;
  };
  
  if (loading) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center">
          <Spinner animation="border" role="status" variant="primary" className="mb-3" />
          <h3>Đang tải kết quả bài thi...</h3>
        </Container>
        <Footer />
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <Header />
        <Container className="py-5">
          <Alert variant="danger">{error}</Alert>
          <Button as={Link} to="/dashboard" variant="primary">
            <FaArrowLeft className="me-2" /> Quay lại Dashboard
          </Button>
        </Container>
        <Footer />
      </>
    );
  }
  
  if (!result) {
    return (
      <>
        <Header />
        <Container className="py-5">
          <Alert variant="warning">Không tìm thấy kết quả bài thi.</Alert>
          <Button as={Link} to="/dashboard" variant="primary">
            <FaArrowLeft className="me-2" /> Quay lại Dashboard
          </Button>
        </Container>
        <Footer />
      </>
    );
  }
  
  // Thông tin từ kết quả
  const {
    examTitle,
    subjectName,
    score,
    totalQuestions,
    correctAnswers,
    startTime,
    endTime,
    questions
  } = result;
  
  const duration = calculateDuration(startTime, endTime);
  const formattedStartTime = formatDateTime(startTime);
  const formattedEndTime = formatDateTime(endTime);
  
  // Tính tỷ lệ đúng cho progress bar
  const correctPercentage = Math.round((correctAnswers / totalQuestions) * 100);
  
  return (
    <>
      <Header />
      <Container className="py-5">
        <Button as={Link} to="/dashboard" variant="outline-primary" className="mb-4">
          <FaArrowLeft className="me-2" /> Quay lại Dashboard
        </Button>
        
        <h1 className="mb-4">Kết quả bài thi</h1>
        
        {/* Thẻ hiển thị thông tin cơ bản của bài thi */}
        <ResultCard bg={theme === 'dark' ? 'dark' : 'light'}>
          <Card.Header>
            <h3>{examTitle}</h3>
            <Badge bg="info">{subjectName}</Badge>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4} className="text-center mb-4 mb-md-0">
                <ScoreBadge score={score}>
                  <ScoreValue>{score.toFixed(2)}</ScoreValue>
                  <ScoreLabel>Điểm</ScoreLabel>
                </ScoreBadge>
              </Col>
              <Col md={8}>
                <div className="mb-3">
                  <h5>Kết quả</h5>
                  <p className="mb-2">
                    Số câu đúng: {correctAnswers}/{totalQuestions} ({correctPercentage}%)
                  </p>
                  <ProgressBar 
                    now={correctPercentage} 
                    variant={
                      correctPercentage >= 80 ? "success" :
                      correctPercentage >= 65 ? "info" :
                      correctPercentage >= 50 ? "warning" : "danger"
                    }
                    className="mb-3"
                  />
                </div>
                
                <div>
                  <h5>Thông tin thời gian</h5>
                  <TimingInfo>
                    <FaClock /> <strong>Bắt đầu:</strong> {formattedStartTime}
                  </TimingInfo>
                  <TimingInfo>
                    <FaClock /> <strong>Kết thúc:</strong> {formattedEndTime}
                  </TimingInfo>
                  <TimingInfo>
                    <FaClock /> <strong>Thời gian làm bài:</strong> {duration}
                  </TimingInfo>
                </div>
              </Col>
            </Row>
          </Card.Body>
          <Card.Footer className="d-flex justify-content-end">
            <Button variant="outline-secondary" className="me-2">
              <FaPrint className="me-2" /> In kết quả
            </Button>
            <Button variant="outline-primary">
              <FaDownload className="me-2" /> Tải PDF
            </Button>
          </Card.Footer>
        </ResultCard>
        
        {/* Phần phân tích kết quả */}
        <Card bg={theme === 'dark' ? 'dark' : 'light'} className="mb-4">
          <Card.Header>
            <h4><FaChartPie className="me-2" /> Phân tích kết quả</h4>
          </Card.Header>
          <Card.Body>
            <ChartsContainer>
              <Card>
                <Card.Body>
                  <h5 className="mb-3">Số câu đúng theo loại</h5>
                  <p className="text-center text-muted">
                    Biểu đồ phân tích câu đúng theo loại câu hỏi sẽ hiển thị tại đây
                  </p>
                </Card.Body>
              </Card>
              <Card>
                <Card.Body>
                  <h5 className="mb-3">Thời gian làm bài theo câu hỏi</h5>
                  <p className="text-center text-muted">
                    Biểu đồ phân tích thời gian làm bài theo từng câu hỏi sẽ hiển thị tại đây
                  </p>
                </Card.Body>
              </Card>
            </ChartsContainer>
          </Card.Body>
        </Card>
        
        {/* Chi tiết từng câu hỏi */}
        <h3 className="mb-4">Chi tiết câu hỏi</h3>
        
        <Accordion defaultActiveKey="0">
          {questions && questions.map((question, index) => {
            const isCorrect = question.isCorrect;
            
            return (
              <Accordion.Item key={index} eventKey={index.toString()}>
                <Accordion.Header>
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <div>
                      <span className="me-2">Câu {index + 1}:</span>
                      {isCorrect ? (
                        <Badge bg="success" className="me-2">Đúng</Badge>
                      ) : (
                        <Badge bg="danger" className="me-2">Sai</Badge>
                      )}
                      <span>{question.questionText?.substring(0, 100)}...</span>
                    </div>
                    <div>
                      {isCorrect ? (
                        <FaCheckCircle color="#4CAF50" size={20} />
                      ) : (
                        <FaTimesCircle color="#F44336" size={20} />
                      )}
                    </div>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <div dangerouslySetInnerHTML={{ __html: question.questionText }} />
                  
                  {question.options && question.options.map((option, optIdx) => (
                    <div 
                      key={optIdx} 
                      className={`
                        p-2 my-1 rounded
                        ${option.isCorrect ? 'bg-success bg-opacity-25' : ''}
                        ${option.id === question.selectedOptionId ? (option.isCorrect ? 'bg-success bg-opacity-25' : 'bg-danger bg-opacity-25') : ''}
                      `}
                    >
                      <div className="d-flex align-items-center">
                        <div className="me-2" style={{ width: '20px', textAlign: 'center' }}>
                          {option.id === question.selectedOptionId && <strong>✓</strong>}
                          {option.isCorrect && ' ★'}
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: option.text }} />
                      </div>
                    </div>
                  ))}
                  
                  {question.explanation && (
                    <ExplanationBlock theme={theme}>
                      <h5>Giải thích:</h5>
                      <div dangerouslySetInnerHTML={{ __html: question.explanation }} />
                    </ExplanationBlock>
                  )}
                  
                  <div className="mt-3 text-muted">
                    <small>
                      <strong>Thời gian làm câu này:</strong> {question.timeSpent || 'Không có dữ liệu'} giây
                    </small>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </Container>
      <Footer />
    </>
  );
};

export default ExamResultDetail;