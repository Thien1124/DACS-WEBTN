import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, InputGroup, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaArrowRight, FaMedal, FaCheckCircle, FaHourglassStart, FaTrophy, FaSync } from 'react-icons/fa';
import axios from 'axios';
import { API_URL, API_ENDPOINTS } from '../../config/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const ExamStatusBadge = styled(Badge)`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const ScoreBadge = styled(Badge)`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  padding: 5px 8px;
`;

const ExamCard = styled(Card)`
  height: 100%;
  transition: transform 0.2s;
  position: relative;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .card-body {
    display: flex;
    flex-direction: column;
  }

  .exam-title {
    font-weight: 600;
    margin-bottom: 8px;
    padding-right: 60px;
  }

  .exam-details {
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

const StudentExamList = () => {
  const [exams, setExams] = useState([]);
  const [userAttempts, setUserAttempts] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { theme } = useSelector(state => state.ui);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error state
        
        // Fetch exams with proper parameters
        try {
          // Thay đổi tham số lọc để đảm bảo hiển thị đề thi
          const examParams = new URLSearchParams();
          if (subjectFilter) examParams.append('SubjectId', subjectFilter);
          examParams.append('Page', page.toString());
          examParams.append('PageSize', pageSize.toString());
          
          // Bỏ tham số lọc quá nghiêm ngặt để test
          // examParams.append('ActiveOnly', 'true');
          // examParams.append('IsOpen', 'true');
          
          if (searchTerm) examParams.append('SearchTerm', searchTerm);
  
          // Kiểm tra API URL đầy đủ
          const apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5006'}/api/Exam`;
          console.log(`Requesting exams from: ${apiUrl}?${examParams.toString()}`);
          
          const examsResponse = await axios.get(`${apiUrl}?${examParams.toString()}`, {
            timeout: 10000 // Tăng timeout lên 10 giây
          });
          
          console.log("Exams API response:", examsResponse);
          
          // Kiểm tra cấu trúc dữ liệu trả về
          if (examsResponse.data && typeof examsResponse.data === 'object') {
            console.log("API response structure:", Object.keys(examsResponse.data));
            
            // Xác định đúng cấu trúc của response
            let examsArray = [];
            if (Array.isArray(examsResponse.data)) {
              examsArray = examsResponse.data;
              setTotalPages(1);
            } else if (examsResponse.data.data && Array.isArray(examsResponse.data.data)) {
              examsArray = examsResponse.data.data;
              setTotalPages(examsResponse.data.totalPages || 1);
            } else if (examsResponse.data.items && Array.isArray(examsResponse.data.items)) {
              examsArray = examsResponse.data.items;
              setTotalPages(examsResponse.data.totalPages || 1);
            }
            
            console.log(`Found ${examsArray.length} exams in response`);
            setExams(examsArray);
          } else {
            console.error("Unexpected API response format:", examsResponse.data);
            setExams([]);
            setTotalPages(1);
          }
        } catch (examsError) {
          console.error('Error fetching exams:', examsError);
          console.error('Error details:', examsError.response || examsError.message);
          setError('Không thể tải danh sách đề thi. Vui lòng thử lại sau.');
        }
        
        // Fetch subjects
        try {
          console.log(`Requesting subjects from: ${API_URL}${API_ENDPOINTS.SUBJECTS}`);
          const subjectsResponse = await axios.get(`${API_URL}${API_ENDPOINTS.SUBJECTS}`);
          
          // Ensure we always set an array
          const responseData = subjectsResponse.data;
          setSubjects(
            Array.isArray(responseData) ? responseData :
            responseData?.items ? responseData.items :
            responseData?.data ? responseData.data :
            []
          );
        } catch (subjectErr) {
          console.error('Error fetching subjects:', subjectErr);
          setError('Không thể tải danh sách môn học.');
        }
        
        // If user is authenticated, fetch their exam attempts
        if (isAuthenticated && user) {
          try {
            const token = localStorage.getItem('token');
            const attemptsResponse = await axios.get(`${API_URL}${API_ENDPOINTS.EXAM_RESULTS}`, {
              headers: { 'Authorization': `Bearer ${token}` },
              timeout: 5000
            });
            
            // Create a map of examId -> array of attempts
            const attemptsMap = {};
            attemptsResponse.data.forEach(attempt => {
              if (!attemptsMap[attempt.examId]) {
                attemptsMap[attempt.examId] = [];
              }
              attemptsMap[attempt.examId].push(attempt);
            });
            
            setUserAttempts(attemptsMap);
          } catch (attemptErr) {
            console.error('Error fetching user attempts:', attemptErr);
          }
        }
      } catch (err) {
        console.error('General error in fetchData:', err);
        setError('Có lỗi xảy ra khi tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, user, page, pageSize, searchTerm, subjectFilter]); 

  // Get the highest score for an exam
  const getHighestScore = (examId) => {
    if (!userAttempts[examId] || userAttempts[examId].length === 0) {
      return null;
    }
    
    return userAttempts[examId].reduce(
      (max, attempt) => attempt.score > max ? attempt.score : max, 
      userAttempts[examId][0].score
    );
  };

  // Get status for an exam
  const getExamStatus = (examId) => {
    if (!isAuthenticated) {
      return null;
    }
    
    if (!userAttempts[examId] || userAttempts[examId].length === 0) {
      return {
        status: 'not-attempted',
        text: 'Chưa thi',
        color: 'primary',
        icon: <FaHourglassStart />
      };
    }
    
    const highestScore = getHighestScore(examId);
    const attempts = userAttempts[examId].length;
    
    return {
      status: 'attempted',
      text: `Đã thi${attempts > 1 ? ` (${attempts} lần)` : ''}`,
      color: 'success',
      icon: <FaCheckCircle />,
      score: highestScore
    };
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handle search form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <Container className="py-4">
      <h2 className="mb-4">Danh sách đề thi</h2>
      
      <Card className="mb-4 shadow-sm" bg={theme === 'dark' ? 'dark' : 'light'}>
        <Card.Body>
          <Form onSubmit={handleSearchSubmit}>
            <Row>
              <Col md={6} lg={4} className="mb-3 mb-md-0">
                <InputGroup>
                  <Form.Control
                    placeholder="Tìm kiếm đề thi..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <Button variant="primary" type="submit">
                    <FaSearch />
                  </Button>
                </InputGroup>
              </Col>
              <Col md={6} lg={4} className="mb-3 mb-lg-0">
                <Form.Select
                  value={subjectFilter}
                  onChange={e => {
                    setSubjectFilter(e.target.value);
                    setPage(1); // Reset to first page when changing filter
                  }}
                >
                  <option value="">Tất cả môn học</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col lg={4}>
                {isAuthenticated && (
                  <Form.Select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="completed">Đã thi</option>
                    <option value="not-completed">Chưa thi</option>
                  </Form.Select>
                )}
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
      
      {exams.length === 0 ? (
        <Card bg={theme === 'dark' ? 'dark' : 'light'} className="shadow-sm">
          <Card.Body className="text-center py-5">
            <h5 className="mb-3">Không tìm thấy đề thi nào phù hợp</h5>
            <p className="text-muted">Vui lòng thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc.</p>
            <Button 
              variant="primary" 
              onClick={() => {
                setSearchTerm('');
                setSubjectFilter('');
                setPage(1);
              }}
            >
              Xóa bộ lọc
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <Row>
            {exams.map(exam => {
              const examStatus = getExamStatus(exam.id);
              const highestScore = examStatus?.score;
              
              return (
                <Col md={6} lg={4} className="mb-4" key={exam.id}>
                  <ExamCard 
                    bg={theme === 'dark' ? 'dark' : 'light'} 
                    className="shadow-sm"
                  >
                    {isAuthenticated && examStatus && (
                      <ExamStatusBadge bg={examStatus.color}>
                        {examStatus.icon} {examStatus.text}
                      </ExamStatusBadge>
                    )}
                    
                    <Card.Body>
                      <h5 className="exam-title">{exam.title}</h5>
                      <div className="text-muted mb-3">
                        <div>Môn: {exam.subject?.name}</div>
                        <div>Thời gian: {exam.duration} phút</div>
                        <div>Số câu hỏi: {exam.questionCount || "Chưa xác định"}</div>
                      </div>
                      
                      <div className="exam-details">
                        <div>
                          {isAuthenticated && highestScore !== null && highestScore !== undefined && (
                            <ScoreBadge bg="warning" text="dark">
                              <FaMedal /> Điểm cao nhất: {typeof highestScore === 'number' ? highestScore.toFixed(2) : "0.00"}
                            </ScoreBadge>
                          )}
                        </div>
                        <div>
                          <Button as={Link} to={`/leaderboard/exams/${exam.id}`} variant="outline-warning" size="sm" className="me-2">
                            <FaTrophy /> Bảng xếp hạng
                          </Button>
                          <Button
                            as={Link}
                            to={`/Exam/${exam.id}`}
                            variant="outline-primary"
                            size="sm"
                            onClick={e => {
                              localStorage.setItem('currentExamId', exam.id);
                            }}
                          >
                            Bắt đầu <FaArrowRight className="ms-1" />
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </ExamCard>
                </Col>
              );
            })}
          </Row>
          
          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Button
                variant="outline-primary"
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Trang trước
              </Button>
              <div className="mx-3 d-flex align-items-center">
                Trang {page} / {totalPages}
              </div>
              <Button
                variant="outline-primary"
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Trang sau
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default StudentExamList;