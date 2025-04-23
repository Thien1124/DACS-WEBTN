import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExamsBySubject } from '../../redux/examSlice';
import { fetchSubjectById } from '../../redux/subjectSlice';
import ExamList from './ExamList';
import LoadingSpinner from '../common/LoadingSpinner';
import { Alert, Button, Card, Container, Row, Col, Pagination, Badge, Form } from 'react-bootstrap';
import { FaSync,FaTrophy, FaExclamationTriangle, FaArrowLeft, FaBug } from 'react-icons/fa';

// Mock data for testing UI
const mockExams = [
  {
    id: 101,
    name: "Kiểm tra chương 1: Đại số",
    title: "Kiểm tra chương 1: Đại số",
    subjectId: 1,
    subjectName: "Toán học",
    examTypeId: 1,
    examTypeName: "Kiểm tra 15 phút",
    duration: 15,
    totalQuestions: 10,
    maxScore: 10,
    isOpen: true,
    startDate: "2025-04-15T08:00:00",
    endDate: "2025-05-30T23:59:59",
    isApproved: true,
    isActive: true
  },
  {
    id: 102,
    name: "Kiểm tra giữa kỳ: Hình học",
    title: "Kiểm tra giữa kỳ: Hình học",
    subjectId: 1,
    subjectName: "Toán học",
    examTypeId: 2,
    examTypeName: "Kiểm tra 45 phút",
    duration: 45,
    totalQuestions: 20,
    maxScore: 10,
    isOpen: true,
    startDate: "2025-04-10T08:00:00",
    endDate: "2025-05-25T23:59:59",
    isApproved: true,
    isActive: true
  },
  {
    id: 103,
    name: "Đề thi cuối kỳ Toán 10",
    title: "Đề thi cuối kỳ Toán 10",
    subjectId: 1,
    subjectName: "Toán học",
    examTypeId: 3,
    examTypeName: "Thi cuối kỳ",
    duration: 90,
    totalQuestions: 40,
    maxScore: 10,
    isOpen: false,
    startDate: "2025-05-20T08:00:00",
    endDate: "2025-06-20T23:59:59",
    isApproved: true,
    isActive: true
  },
  {
    id: 201,
    name: "Kiểm tra từ vựng Unit 1",
    title: "Kiểm tra từ vựng Unit 1",
    subjectId: 2,
    subjectName: "Tiếng Anh",
    examTypeId: 1,
    examTypeName: "Kiểm tra 15 phút",
    duration: 15,
    totalQuestions: 20,
    maxScore: 10,
    isOpen: true,
    isApproved: true,
    isActive: true
  },
  {
    id: 301,
    name: "Kiểm tra chương Cơ học",
    title: "Kiểm tra chương Cơ học",
    subjectId: 3,
    subjectName: "Vật lý",
    examTypeId: 2,
    examTypeName: "Kiểm tra 45 phút",
    duration: 45,
    totalQuestions: 15,
    maxScore: 10,
    isOpen: true,
    isApproved: true,
    isActive: true
  }
];

const ExamsBySubject = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { list, loading, error, totalItems, currentPage: storedPage, totalPages } = 
    useSelector(state => state.exams);
  const { currentSubject } = useSelector(state => state.subjects);
  
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState({
    activeOnly: true,
    isOpen: null, // Changed to null to show all exams (open and closed)
    examTypeId: null,
    searchTerm: '',
    isApproved: true
  });
  
  // For debugging - toggle between real API and mock data
  const [useMockData, setUseMockData] = useState(false);
  const [showClosedExams, setShowClosedExams] = useState(false);

  // Load exams and subject info
  useEffect(() => {
    // Load subject info
    dispatch(fetchSubjectById(subjectId));
    
    // Only call API if not using mock data
    if (!useMockData) {
      loadExams();
    }
  }, [dispatch, subjectId, page, pageSize, useMockData, filters]);

  const loadExams = () => {
    console.log(`Loading exams for subject ID: ${subjectId} with filters:`, filters);
    dispatch(fetchExamsBySubject({
      subjectId: parseInt(subjectId),
      page,
      pageSize,
      ...filters
    }))
    .unwrap()
    .then(data => {
      console.log('Exams loaded successfully:', data);
    })
    .catch(err => {
      console.error('Failed to load exams:', err);
    });
  };

  const handleRetry = () => {
    if (useMockData) {
      // Just refresh the component
      setShowClosedExams(prev => !prev);
      setTimeout(() => setShowClosedExams(prev => !prev), 100);
    } else {
      loadExams();
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleFilterChange = (newFilters) => {
    setFilters({...filters, ...newFilters});
    setPage(1); // Reset to first page when filters change
  };

  // Get filtered mock data if using mock mode
  const getFilteredMockExams = () => {
    // Filter by subject ID
    let filtered = mockExams.filter(exam => exam.subjectId === parseInt(subjectId));
    
    // Apply other filters
    if (filters.activeOnly) {
      filtered = filtered.filter(exam => exam.isActive);
    }
    
    if (filters.isOpen !== null) {
      filtered = filtered.filter(exam => exam.isOpen === filters.isOpen);
    }
    
    if (filters.examTypeId) {
      filtered = filtered.filter(exam => exam.examTypeId === filters.examTypeId);
    }
    
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(exam => 
        exam.name.toLowerCase().includes(term) || 
        exam.title.toLowerCase().includes(term)
      );
    }
    
    if (filters.isApproved) {
      filtered = filtered.filter(exam => exam.isApproved);
    }
    
    return filtered;
  };

  const renderPagination = () => {
    const totalExams = useMockData ? getFilteredMockExams().length : (totalItems || 0);
    const calculatedTotalPages = Math.ceil(totalExams / pageSize);
    
    if (calculatedTotalPages <= 1) return null;
    
    const items = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(calculatedTotalPages, startPage + maxPagesToShow - 1);
    
    // Previous button
    items.push(
      <Pagination.Prev 
        key="prev"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
      />
    );
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item 
          key={i} 
          active={i === page}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    // Next button
    items.push(
      <Pagination.Next 
        key="next"
        onClick={() => handlePageChange(page + 1)}
        disabled={page === calculatedTotalPages}
      />
    );
    
    return <Pagination>{items}</Pagination>;
  };

  // Data to display (either from API or mock)
  const examsToDisplay = useMockData 
    ? getFilteredMockExams() 
    : list;

  if (!useMockData && loading && list.length === 0) {
    return (
      <Container className="py-5 text-center">
        <LoadingSpinner />
        <p className="mt-3">Đang tải danh sách đề thi...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          
          
          <h2 className="mb-3">
            {currentSubject ? `Đề thi môn: ${currentSubject.name}` : `Đề thi môn học ${subjectId}`}
          </h2>
          <Button 
    variant="outline-success"
    onClick={() => navigate(`/subjects/${subjectId}/top-students`)}
  >
    <FaTrophy className="me-1" /> Xem bảng xếp hạng
  </Button>
          
          {!useMockData && error && (
            <Alert variant="danger" className="mb-3">
              <FaExclamationTriangle className="mr-2" /> {error}
              <Button 
                variant="outline-danger" 
                size="sm" 
                className="float-end"
                onClick={handleRetry}
              >
                <FaSync /> Thử lại
              </Button>
            </Alert>
          )}
          
          {!useMockData && loading && list.length > 0 && (
            <Alert variant="info" className="mb-3">
              <LoadingSpinner size="sm" /> Đang cập nhật danh sách đề thi...
            </Alert>
          )}
        </Col>
      </Row>
      
      {examsToDisplay.length > 0 ? (
        <>
          <ExamList exams={examsToDisplay} />
          
          <div className="d-flex justify-content-center mt-4">
            {renderPagination()}
          </div>
          
          <div className="text-center text-muted mt-2">
            Hiển thị {examsToDisplay.length} đề thi
            {useMockData && <span className="text-info"> (dữ liệu mẫu)</span>}
          </div>
        </>
      ) : (
        <Card className="text-center p-5">
          <Card.Body>
            {(!error || useMockData) ? (
              <>
                <p className="mb-3">Không tìm thấy đề thi nào cho môn học này.</p>
                <p className="text-muted small mb-3">
                  Có thể vì một trong các lý do sau:
                  <br />- Môn học này chưa có đề thi
                  <br />- Đề thi chưa được duyệt bởi giáo viên
                  <br />- Đề thi đang bị khóa hoặc chưa đến thời gian mở
                </p>
              </>
            ) : (
              <p>Không thể tải danh sách đề thi. Vui lòng thử lại sau.</p>
            )}
            
            <div className="mt-3">
              <Button 
                variant="primary" 
                onClick={handleRetry}
                className="me-2"
              >
                <FaSync /> Tải lại
              </Button>
              
              <Button 
                variant="outline-secondary"
                onClick={() => navigate('/subjects')}
              >
                <FaArrowLeft /> Quay lại danh sách môn học
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default ExamsBySubject;