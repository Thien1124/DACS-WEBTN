import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Button, Table, Badge, Alert, Spinner } from 'react-bootstrap';
import { FaEdit, FaTrash, FaArrowLeft, FaUserGraduate, FaFileImport } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getClassroomByName, deleteClassroom } from '../../services/classroomService';
import ImportStudentsModal from './ImportStudentsModal';
import ConfirmModal from '../common/ConfirmModal';

const ClassroomDetail = () => {
  const { name } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  const { user } = useSelector(state => state.auth);
  const isAdmin = user?.role === 'Admin';
  const userRole = user?.role;

  useEffect(() => {
    fetchClassroomDetails();
  }, [name]);

  const fetchClassroomDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClassroomByName(name);
      setClassroom(data);
      
      // Set students from recentStudents in the API response
      if (data.recentStudents) {
      const filteredStudents = data.recentStudents.filter(student => 
        !(student.username && student.username.toUpperCase().includes("CLASS"))
      );
      setStudents(filteredStudents);
    }
    } catch (err) {
      console.error('Error fetching classroom details:', err);
      setError('Không thể tải thông tin lớp học. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/${userRole.toLowerCase()}/classrooms/${name}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteClassroom(name);
      toast.success(`Đã xóa lớp ${name} thành công`);
      navigate(`/${userRole.toLowerCase()}/classrooms`);
    } catch (err) {
      console.error('Error deleting classroom:', err);
      toast.error(`Không thể xóa lớp ${name}. ${err.response?.data?.message || 'Vui lòng thử lại sau.'}`);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleBack = () => {
    navigate(`/${userRole.toLowerCase()}/classrooms`);
  };
  
  const handleImportSuccess = () => {
    toast.success('Nhập danh sách học sinh thành công!');
    fetchClassroomDetails(); // Refresh to show new students
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={handleBack}>
          <FaArrowLeft /> Quay lại danh sách lớp học
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Button variant="secondary" className="mb-3" onClick={handleBack}>
        <FaArrowLeft /> Quay lại danh sách lớp học
      </Button>
      
      <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="mb-4">
        <Card.Header as="h4">
          Thông tin lớp {classroom?.name}
          <Badge bg="info" className="ms-2">Khối {classroom?.grade}</Badge>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <table className="table">
                <tbody>
                  <tr>
                    <th style={{ width: '150px' }}>Tên lớp:</th>
                    <td>{classroom?.name}</td>
                  </tr>
                  <tr>
                    <th>Khối:</th>
                    <td>{classroom?.grade}</td>
                  </tr>
                  <tr>
                    <th>Mô tả:</th>
                    <td>{classroom?.description || 'Không có mô tả'}</td>
                  </tr>
                  <tr>
                    <th>Số học sinh:</th>
                    <td>
                      <Badge bg="success">
                        <FaUserGraduate /> {classroom?.studentCount || 0} học sinh
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Col>
            <Col md={4} className="d-flex justify-content-end align-items-start">
              <Button 
                variant="primary" 
                className="me-2" 
                onClick={handleEdit}
              >
                <FaEdit /> Chỉnh sửa
              </Button>
              {isAdmin && (
                <Button 
                  variant="danger" 
                  onClick={handleDelete} 
                  disabled={deleting}
                >
                  <FaTrash /> {deleting ? 'Đang xóa...' : 'Xóa lớp'}
                </Button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FaUserGraduate /> Danh sách học sinh
          </h5>
          <Button 
            variant="success" 
            size="sm" 
            onClick={() => setShowImportModal(true)}
          >
            <FaFileImport className="me-1" /> Nhập từ Excel
          </Button>
        </Card.Header>
        <Card.Body>
          {students && students.length > 0 ? (
            <Table striped bordered hover responsive variant={theme === 'dark' ? 'dark' : 'light'}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Họ tên</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id || index}>
                    <td>{student.id || 'N/A'}</td>
                    <td>{student.username || 'N/A'}</td>
                    <td>{student.fullName || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info">Không có học sinh nào trong lớp này</Alert>
          )}
        </Card.Body>
      </Card>
      
      {/* Import Students Modal */}
      <ImportStudentsModal
        show={showImportModal}
        onHide={() => setShowImportModal(false)}
        classroom={name}
        onSuccess={handleImportSuccess}
      />
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        title="Xác nhận xóa lớp học"
        message={`Bạn có chắc chắn muốn xóa lớp ${name}? Hành động này không thể hoàn tác.`}
        confirmLabel={deleting ? "Đang xóa..." : "Xóa lớp học"}
        cancelLabel="Hủy"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </Container>
  );
};

export default ClassroomDetail;