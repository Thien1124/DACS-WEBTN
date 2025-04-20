import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Table, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaFileExcel, FaFileImport, FaSearch } from 'react-icons/fa';
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
      const response = await axios.get(`${API_URL}/api/Exams/teacher`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          page: currentPage,
          pageSize,
          searchTerm
        }
      });

      setExams(response.data.items);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách đề thi. Vui lòng thử lại sau.');
      console.error('Error fetching exams:', err);
    } finally {
      setLoading(false);
    }
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

  if (loading && exams.length === 0) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

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
                {exams.length > 0 ? (
                  exams.map((exam, index) => (
                    <tr key={exam.id}>
                      <td>{(currentPage - 1) * pageSize + index + 1}</td>
                      <td>{exam.title}</td>
                      <td>{exam.subject?.name}</td>
                      <td>{exam.duration} phút</td>
                      <td>{exam.questionCount}</td>
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