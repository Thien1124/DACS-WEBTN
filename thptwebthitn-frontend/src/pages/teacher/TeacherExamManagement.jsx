import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Table, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaFileExcel, FaFileImport, FaSearch, FaChartBar } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import Pagination from '../../components/common/Pagination';

const TeacherExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const { theme } = useSelector(state => state.ui);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, [currentPage, searchTerm]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('Fetching exams with params:', {
        page: currentPage,
        pageSize,
        searchTerm
      });
      
      const response = await axios.get(`${API_URL}/api/Exam`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          page: currentPage,
          pageSize,
          searchTerm: searchTerm || undefined // Only send if not empty
        }
      });
      
      console.log('API Response:', response.data);
      
      // Handle the response data with defensive coding
      if (response.data && response.data.items && Array.isArray(response.data.items)) {
        console.log('Found items array with length:', response.data.items.length);
        setExams(response.data.items);
        setTotalPages(response.data.totalPages || Math.ceil(response.data.totalCount / pageSize) || 1);
      } else if (Array.isArray(response.data)) {
        console.log('Response is direct array with length:', response.data.length);
        setExams(response.data);
        setTotalPages(Math.ceil(response.data.length / pageSize) || 1);
      } else {
        console.warn('Unexpected API response format:', response.data);
        // Try to extract data from response if possible
        const possibleItems = findArrayInObject(response.data);
        if (possibleItems && possibleItems.length > 0) {
          console.log('Found possible items array:', possibleItems.length);
          setExams(possibleItems);
          setTotalPages(Math.ceil(possibleItems.length / pageSize) || 1);
        } else {
          setExams([]);
          setTotalPages(1);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching exams:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.title ||
                          'Không thể tải danh sách đề thi. Vui lòng thử lại sau.';
      setError(errorMessage);
      setExams([]); // Initialize as empty array to prevent undefined.length errors
    } finally {
      setLoading(false);
    }
  };

  // Helper function to find arrays in complex objects
  const findArrayInObject = (obj) => {
    if (!obj || typeof obj !== 'object') return null;
    
    // Check direct properties for arrays
    for (const key in obj) {
      if (Array.isArray(obj[key]) && obj[key].length > 0) {
        return obj[key];
      }
    }
    
    // Check nested objects recursively (one level deep)
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        for (const nestedKey in obj[key]) {
          if (Array.isArray(obj[key][nestedKey]) && obj[key][nestedKey].length > 0) {
            return obj[key][nestedKey];
          }
        }
      }
    }
    
    return null;
  };

  const handleExportExcel = () => {
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    
    // Convert exams array to worksheet format
    const worksheetData = exams.map(exam => ({
      'ID': exam.id,
      'Tiêu đề': exam.title,
      'Môn học': exam.subject.name,
      'Thời gian (phút)': exam.duration,
      'Số câu hỏi': exam.questionCount,
      'Trạng thái': exam.isActive ? 'Kích hoạt' : 'Không kích hoạt',
      'Ngày tạo': new Date(exam.createdAt).toLocaleString()
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Exams');
    
    // Generate file and trigger download
    XLSX.writeFile(workbook, 'danh-sach-de-thi.xlsx');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading && (!exams || exams.length === 0)) return <LoadingSpinner />;
  if (error) return (
    <Container className="py-4">
      <h2 className="mb-4">Quản lý đề thi</h2>
      <Card className="mb-4 text-danger border-danger">
        <Card.Body>
          <h5><i className="bi bi-exclamation-triangle-fill me-2"></i>Lỗi</h5>
          <p>{error}</p>
          <Button 
            variant="primary" 
            onClick={() => fetchExams()}
          >
            Thử lại
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );

  return (
    <Container className="py-4">
      <h2 className="mb-4">Quản lý đề thi</h2>
      
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group className="d-flex">
            <Form.Control
              type="text"
              placeholder="Tìm kiếm đề thi..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Button variant="primary" className="ms-2">
              <FaSearch />
            </Button>
          </Form.Group>
        </Col>
        <Col md={6} className="d-flex justify-content-end">
          <Link to="/teacher/exams/create">
            <Button variant="success" className="me-2">
              <FaPlus /> Thêm đề thi
            </Button>
          </Link>
          <Link to="/teacher/exams/import">
            <Button variant="info" className="me-2">
              <FaFileImport /> Nhập Excel
            </Button>
          </Link>
          <Button variant="secondary" onClick={handleExportExcel}>
            <FaFileExcel /> Xuất Excel
          </Button>
        </Col>
      </Row>
      
      <div className="d-flex mb-3 gap-2">
        <Button variant="primary" onClick={() => navigate('/teacher/exams/create')}>
          <FaPlus className="me-2" /> Tạo đề thi
        </Button>
        <Button variant="success" onClick={() => navigate('/teacher/exams/create-structured')}>
          <FaPlus className="me-2" /> Tạo đề thi theo cấu trúc
        </Button>
        {/* Thêm nút mới */}
        <Button variant="info" onClick={() => navigate('/teacher/exams/create-topic')}>
          <FaPlus className="me-2" /> Tạo đề thi theo chủ đề
        </Button>
      </div>

      <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover variant={theme === 'dark' ? 'dark' : 'light'}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tiêu đề</th>
                  <th>Môn học</th>
                  <th>Thời gian</th>
                  <th>Số câu</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {(exams && exams.length > 0) ? (
                  exams.map((exam, index) => (
                    <tr key={exam.id || index}>
                      <td>{(currentPage - 1) * pageSize + index + 1}</td>
                      <td>{exam.title || 'Không có tiêu đề'}</td>
                      <td>{exam.subject?.name || 'Không xác định'}</td>
                      <td>{exam.duration || 0} phút</td>
                      <td>{exam.questionCount || 0}</td>
                      <td>
                        <span className={`badge bg-${exam.isActive ? 'success' : 'danger'}`}>
                          {exam.isActive ? 'Kích hoạt' : 'Không kích hoạt'}
                        </span>
                      </td>
                      <td>
                        <Link to={`/teacher/exams/${exam.id}/edit`} className="btn btn-sm btn-primary me-1">
                          <FaEdit />
                        </Link>
                        <Button variant="danger" size="sm">
                          <FaTrash />
                        </Button>
                        {/* Thêm nút phân tích vào các hành động trên mỗi đề thi */}
                        <Button 
                          variant="info" 
                          size="sm"
                          onClick={() => navigate(`/teacher/analytics/${exam.id}`)}
                          title="Phân tích kết quả"
                        >
                          <FaChartBar /> Phân tích
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">Không có đề thi nào</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
          
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TeacherExamManagement;