import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup, Pagination, Badge, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaUserGraduate } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getClassrooms, deleteClassroom } from '../services/classroomService';
import ConfirmModal from '../components/common/ConfirmModal';

const ClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [deleteModalShow, setDeleteModalShow] = useState(false);
  const [classroomToDelete, setClassroomToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  const { user } = useSelector(state => state.auth);
  const userRole = user?.role;
  const isAdmin = userRole === 'Admin';

  useEffect(() => {
    fetchClassrooms();
  }, [page, gradeFilter]);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getClassrooms(page, pageSize, gradeFilter);
      setClassrooms(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (err) {
      console.error('Error fetching classrooms:', err);
      setError('Không thể tải danh sách lớp học. Vui lòng thử lại sau.');
      setClassrooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Filter classrooms client-side based on searchTerm
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleGradeFilterChange = (e) => {
    setGradeFilter(e.target.value);
    setPage(1); // Reset to first page when changing filter
  };

  const handleCreateClassroom = () => {
    navigate(`/${userRole.toLowerCase()}/classrooms/create`);
  };

  const handleViewClassroom = (classroom) => {
    navigate(`/${userRole.toLowerCase()}/classrooms/${classroom.name}`);
  };

  const handleEditClassroom = (classroom) => {
    navigate(`/${userRole.toLowerCase()}/classrooms/${classroom.name}/edit`);
  };

  const showDeleteConfirm = (classroom) => {
    setClassroomToDelete(classroom);
    setDeleteModalShow(true);
  };

  const handleDeleteConfirm = async () => {
    if (!classroomToDelete) return;
    
    try {
      setDeleting(true);
      await deleteClassroom(classroomToDelete.name);
      toast.success(`Đã xóa lớp ${classroomToDelete.name} thành công`);
      fetchClassrooms(); // Refresh the list
    } catch (err) {
      console.error(`Error deleting classroom ${classroomToDelete.name}:`, err);
      toast.error(`Không thể xóa lớp ${classroomToDelete.name}. ${err.response?.data?.message || 'Vui lòng thử lại sau.'}`);
    } finally {
      setDeleting(false);
      setDeleteModalShow(false);
      setClassroomToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalShow(false);
    setClassroomToDelete(null);
  };

  // Filter classrooms based on search term (client-side)
  const filteredClassrooms = searchTerm
    ? classrooms.filter(classroom => 
        classroom.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : classrooms;

  return (
    <Container className="py-4">
      <h2 className="mb-4">Quản lý lớp học</h2>
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={deleteModalShow}
        title="Xác nhận xóa lớp học"
        message={classroomToDelete ? 
          `Bạn có chắc chắn muốn xóa lớp ${classroomToDelete.name}? Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan đến lớp học này.` : 
          'Bạn có chắc chắn muốn xóa lớp học này?'}
        confirmLabel={deleting ? "Đang xóa..." : "Xóa lớp học"}
        cancelLabel="Hủy"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
      
      <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm lớp học..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline-primary" type="submit">
                    <FaSearch /> Tìm
                  </Button>
                </InputGroup>
              </Form>
            </Col>
            <Col md={3}>
              <Form.Select
                value={gradeFilter}
                onChange={handleGradeFilterChange}
                aria-label="Lọc theo khối"
              >
                <option value="">Tất cả khối</option>
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
                <option value="12">Khối 12</option>
              </Form.Select>
            </Col>
            <Col md={3} className="text-end">
              <Button variant="primary" onClick={handleCreateClassroom}>
                <FaPlus /> Thêm lớp học
              </Button>
            </Col>
          </Row>
          
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <>
              <Table striped bordered hover responsive variant={theme === 'dark' ? 'dark' : 'light'}>
                <thead>
                  <tr>
                    <th>Tên lớp</th>
                    <th>Khối</th>
                    <th>Số học sinh</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClassrooms.length > 0 ? (
                    filteredClassrooms.map((classroom, index) => (
                      <tr key={index}>
                        <td>{classroom.name}</td>
                        <td>{classroom.grade}</td>
                        <td>
                          <Badge bg="info">
                            <FaUserGraduate /> {classroom.studentCount || 0}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-info" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleViewClassroom(classroom)}
                          >
                            <FaEye /> Xem
                          </Button>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleEditClassroom(classroom)}
                          >
                            <FaEdit /> Sửa
                          </Button>
                          {isAdmin && (
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => showDeleteConfirm(classroom)}
                              disabled={deleting}
                            >
                              <FaTrash /> Xóa
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">Không có lớp học nào</td>
                    </tr>
                  )}
                </tbody>
              </Table>
              
              {totalCount > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <small>Hiển thị {filteredClassrooms.length} trên tổng số {totalCount} lớp học</small>
                  </div>
                  
                  {totalPages > 1 && (
                    <Pagination className="mb-0">
                      <Pagination.First onClick={() => handlePageChange(1)} disabled={page === 1} />
                      <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />
                      
                      {Array.from({ length: totalPages }, (_, i) => (
                        <Pagination.Item
                          key={i + 1}
                          active={i + 1 === page}
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </Pagination.Item>
                      ))}
                      
                      <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} />
                      <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} />
                    </Pagination>
                  )}
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ClassroomsPage;