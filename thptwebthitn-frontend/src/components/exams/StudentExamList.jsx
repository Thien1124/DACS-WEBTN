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

// Thêm styled component mới cho container chứa badge và điểm
const ExamStatusContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

// Cập nhật ExamStatusBadge để phù hợp với container mới
const ExamStatusBadge = styled(Badge)`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  font-size: 0.75rem;
  font-weight: 500;
`;

// Thêm styled component mới cho điểm cao nhất
const HighestScoreBadge = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  color: #212529;
  background-color: rgba(255, 193, 7, 0.85);
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 8px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  svg {
    color: #FF8800;
  }
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

  // Tạo hàm fetchData riêng để có thể gọi lại khi cần - thêm vào trước useEffect
const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Copy nội dung từ useEffect vào đây
    try {
      // Thay đổi tham số lọc để đảm bảo hiển thị đề thi
      const examParams = new URLSearchParams();
      if (subjectFilter) examParams.append('SubjectId', subjectFilter);
      examParams.append('Page', page.toString());
      examParams.append('PageSize', pageSize.toString());
      
      // Bỏ tham số lọc quá nghiêm ngặt để test
      examParams.append('IsApproved', 'true'); // Only show approved exams
      examParams.append('ActiveOnly', 'true'); // Only show active (public) exams

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
        console.log('Fetching exam results for user:', user.id);
        
        // Thay đổi endpoint để lấy đúng kết quả thi của người dùng hiện tại
        const attemptsResponse = await axios.get(`${API_URL}/api/Results/user/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 8000 // Tăng timeout
        });
        
        console.log('User attempts response:', attemptsResponse.data);
        
        // Chuẩn bị xử lý kết quả
        let attemptsData = [];

        // Kiểm tra nhiều cấu trúc dữ liệu có thể có
        if (Array.isArray(attemptsResponse.data)) {
          attemptsData = attemptsResponse.data;
        } else if (attemptsResponse.data?.items && Array.isArray(attemptsResponse.data.items)) {
          attemptsData = attemptsResponse.data.items;
        } else if (attemptsResponse.data?.data && Array.isArray(attemptsResponse.data.data)) {
          attemptsData = attemptsResponse.data.data;
        } else if (attemptsResponse.data?.results && Array.isArray(attemptsResponse.data.results)) {
          attemptsData = attemptsResponse.data.results;
        }

        // Tạo map từ kết quả
        const attemptsMap = {};
        attemptsData.forEach(attempt => {
          // Kiểm tra các trường có thể chứa examId
          const examId = (
            attempt.examId || 
            attempt.exam?.id || 
            attempt.testId || 
            attempt.test?.id || 
            ''
          ).toString();
          
          if (!examId) {
            console.log('Skipping attempt without examId:', attempt);
            return;
          }
          
          console.log(`Adding attempt for exam ${examId}:`, attempt);
          
          if (!attemptsMap[examId]) {
            attemptsMap[examId] = [];
          }
          attemptsMap[examId].push(attempt);
        });
        
        console.log('Processed attempts map:', attemptsMap);
        setUserAttempts(attemptsMap);
      } catch (attemptErr) {
        console.error('Error fetching user attempts:', attemptErr);
        console.error('Error details:', attemptErr.response?.data || attemptErr.message);
      }
    }
  } catch (err) {
    console.error('General error in fetchData:', err);
    setError('Có lỗi xảy ra khi tải dữ liệu.');
  } finally {
    setLoading(false);
  }
};

  // Sửa useEffect để gọi hàm fetchData
useEffect(() => {
  fetchData();
}, [isAuthenticated, user, page, pageSize, searchTerm, subjectFilter, statusFilter]);

  // Get the highest score for an exam
  const getHighestScore = (examId) => {
  // Chuyển đổi examId thành chuỗi để đảm bảo khớp khi tìm kiếm
  const examIdStr = examId.toString();
  
  if (!userAttempts[examIdStr] || userAttempts[examIdStr].length === 0) {
    return null;
  }
  
  return userAttempts[examIdStr].reduce(
    (max, attempt) => attempt.score > max ? attempt.score : max, 
    userAttempts[examIdStr][0].score || 0
  );
};

  // Cải tiến hàm getExamStatus - khoảng dòng 170
const getExamStatus = (examId) => {
  if (!isAuthenticated) {
    return null;
  }
  
  // Chuyển đổi examId thành chuỗi để đảm bảo khớp khi tìm kiếm
  const examIdStr = examId.toString();
  
  // Debug log chi tiết hơn
  console.log(`Checking status for exam ${examIdStr}:`);
  console.log(`All attempts keys:`, Object.keys(userAttempts));
  console.log(`Has this exam?`, userAttempts[examIdStr] ? 'Yes' : 'No');
  
  if (!userAttempts || !userAttempts[examIdStr] || userAttempts[examIdStr].length === 0) {
    return {
      status: 'not-attempted',
      text: 'Chưa thi',
      color: 'primary',
      icon: <FaHourglassStart />
    };
  }
  
  const highestScore = getHighestScore(examIdStr);
  const attempts = userAttempts[examIdStr].length;
  
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

  // Thêm vào trước khi render danh sách đề thi - khoảng dòng 270
  // Filter exams by status if needed
  const filteredExams = exams.filter(exam => {
    // Nếu không lọc theo trạng thái, hiển thị tất cả
    if (statusFilter === 'all' || !isAuthenticated) return true;
    
    // Kiểm tra trạng thái đề thi
    const examStatus = getExamStatus(exam.id);
    const isCompleted = examStatus?.status === 'attempted';
    
    // Lọc theo yêu cầu
    if (statusFilter === 'completed' && isCompleted) return true;
    if (statusFilter === 'not-completed' && !isCompleted) return true;
    
    return false;
  });

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
              <Col lg={3}>
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
              <Col lg={1}>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => {
                    // Làm mới danh sách và dữ liệu kết quả thi
                    setPage(1);
                    setUserAttempts({});
                    fetchData(); // Đảm bảo thêm hàm fetchData riêng biệt
                  }}
                  title="Làm mới danh sách"
                >
                  <FaSync />
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
      
      {filteredExams.length === 0 ? (
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
            {filteredExams.map(exam => {
              const examStatus = getExamStatus(exam.id);
              const highestScore = examStatus?.score;
              
              return (
                <Col md={6} lg={4} className="mb-4" key={exam.id}>
                  <ExamCard 
                    bg={theme === 'dark' ? 'dark' : 'light'} 
                    className="shadow-sm"
                  >
                    {/* Hiển thị trạng thái và điểm trong một container */}
                    {isAuthenticated && (
                      <ExamStatusContainer>
                        <ExamStatusBadge bg={examStatus?.color || 'primary'}>
                          {examStatus?.icon || <FaHourglassStart />} {examStatus?.text || 'Chưa thi'}
                        </ExamStatusBadge>
                        
                        {/* Hiển thị điểm cao nhất nếu đã thi */}
                        {examStatus?.status === 'attempted' && highestScore !== null && (
                          <HighestScoreBadge>
                            <FaMedal /> Điểm cao nhất: {typeof highestScore === 'number' ? highestScore.toFixed(2) : "0.00"}
                          </HighestScoreBadge>
                        )}
                      </ExamStatusContainer>
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
                          {/* Xóa hiển thị điểm cao nhất ở đây vì đã hiển thị ở trên */}
                        </div>
                        <div>
                          <Button 
                            as={Link} 
                            to={`/leaderboard/exams/${exam.id}`} 
                            variant="outline-warning" 
                            size="sm" 
                            className="me-2"
                          >
                            <FaTrophy /> Bảng xếp hạng
                          </Button>
                          
                          {/* Thay đổi: Luôn hiển thị nút Bắt đầu, nhưng disabled nếu đã thi */}
                          <Button
                            as={examStatus?.status === 'attempted' ? 'button' : Link}
                            to={`/Exam/${exam.id}`}
                            variant="outline-primary"
                            size="sm"
                            disabled={examStatus?.status === 'attempted'}
                            onClick={e => {
                              if (examStatus?.status !== 'attempted') {
                                localStorage.setItem('currentExamId', exam.id);
                              }
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