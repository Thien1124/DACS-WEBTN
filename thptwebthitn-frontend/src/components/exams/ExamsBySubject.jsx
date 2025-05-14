import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExamsBySubject } from '../../redux/examSlice';
import { fetchSubjectById } from '../../redux/subjectSlice';
import ExamList from './ExamList';
import LoadingSpinner from '../common/LoadingSpinner';
import { Alert, Button, Card, Container, Row, Col, Pagination, Badge, Form } from 'react-bootstrap';
import { FaSync, FaTrophy, FaExclamationTriangle, FaArrowLeft, FaBug, FaFilter } from 'react-icons/fa';
import apiClient from '../../services/apiClient';
const ExamsBySubject = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { list, loading, error, totalItems, currentPage: storedPage, totalPages } = 
    useSelector(state => state.exams);
  const { currentSubject } = useSelector(state => state.subjects);
  
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  // Thay đổi filter mặc định để có thể hiển thị tất cả đề thi
  const [filters, setFilters] = useState({
    activeOnly: true, // Mặc định hiển thị đề đang hoạt động
    examTypeId: null,
    searchTerm: '',
    isOpen: true // Thêm filter isOpen để lọc theo trạng thái mở/đóng
  });

  // Thêm state cho debug info
  const [debugInfo, setDebugInfo] = useState({});
  const [localExams, setLocalExams] = useState([]);

  // Thêm đoạn code này ngay trước useEffect để debug
  useEffect(() => {
    // Thêm debug log để xem dữ liệu trong Redux store
    console.log('Current list in Redux store:', list);
  }, [list]);

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
  
  // Load exams and subject info
  useEffect(() => {
    // Load subject info
    dispatch(fetchSubjectById(subjectId));
    loadExams();
  }, [dispatch, subjectId, page, pageSize, filters]);

  const handleRetry = () => {
    loadExams();
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleFilterChange = (newFilters) => {
    setFilters({...filters, ...newFilters});
    setPage(1); // Reset to first page when filters change
  };

  const renderPagination = () => {
    // Pagination code unchanged...
    const calculatedTotalPages = totalPages || Math.ceil(totalItems / pageSize);
    
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

  const renderFilterBar = () => {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6} lg={3} className="mb-2">
              <Form.Group>
                <Form.Label>Tìm kiếm</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập từ khóa..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
                />
              </Form.Group>
            </Col>
            
            <Col md={6} lg={3} className="mb-2">
              <Form.Group>
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  value={filters.activeOnly ? "true" : "false"}
                  onChange={(e) => handleFilterChange({ 
                    activeOnly: e.target.value === "true" 
                  })}
                >
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Tất cả đề thi</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6} lg={3} className="mb-2">
              <Form.Group>
                <Form.Label>Trạng thái mở</Form.Label>
                <Form.Select
                  value={filters.isOpen === null ? "" : filters.isOpen.toString()}
                  onChange={(e) => handleFilterChange({ 
                    isOpen: e.target.value === "" ? null : e.target.value === "true" 
                  })}
                >
                  <option value="">Tất cả</option>
                  <option value="true">Đề thi đang mở</option>
                  <option value="false">Đề thi đã đóng</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6} lg={3} className="mb-2 d-flex align-items-end">
              <Button 
                variant="primary" 
                className="w-100"
                onClick={() => handleRetry()}
              >
                <FaFilter className="me-1" /> Lọc
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  if (loading && list.length === 0) {
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
          
          
          {loading && list.length > 0 && (
            <Alert variant="info" className="mt-3 mb-3">
              <LoadingSpinner size="sm" /> Đang cập nhật danh sách đề thi...
            </Alert>
          )}
        </Col>
      </Row>
      
      {renderFilterBar()}
      
      {list && list.length > 0 ? (
        <>
          <ExamList exams={list} />
          
          <div className="d-flex justify-content-center mt-4">
            {renderPagination()}
          </div>
          
          <div className="text-center text-muted mt-2">
            Hiển thị {list.length} đề thi trên tổng số {totalItems} đề thi
          </div>
        </>
      ) : (
        <Card className="text-center p-5">
          <Card.Body>
            {!error ? (
              <>
                <p className="mb-3">Không tìm thấy đề thi nào cho môn học này.</p>
                
                <p className="text-muted small mb-3">
                  Có thể vì một trong các lý do sau:
                  <br />- Môn học này chưa có đề thi
                  <br />- Đề thi chưa được duyệt bởi giáo viên
                  <br />- Đề thi đang bị khóa hoặc chưa đến thời gian mở
                  <br />- Lọc tìm kiếm không trả về kết quả nào
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