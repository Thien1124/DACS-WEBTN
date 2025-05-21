import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { FaEye, FaHistory, FaPlus, FaRegClock } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import apiClient from '../../services/apiClient';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const StatusBadge = styled(Badge)`
  font-size: 0.85em;
  padding: 0.35em 0.65em;
`;

const VerificationRequestList = () => {
  const navigate = useNavigate();
  
  const { theme } = useSelector(state => state.ui);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api/score-verification/student');
      setRequests(response.data);
    } catch (err) {
      console.error('Error fetching verification requests:', err);
      setError('Không thể tải danh sách yêu cầu xác minh. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = (request) => {
    setCurrentRequest(request);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentRequest(null);
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <StatusBadge bg="warning">Đang chờ</StatusBadge>;
      case 'approved':
        return <StatusBadge bg="success">Đã phê duyệt</StatusBadge>;
      case 'rejected':
        return <StatusBadge bg="danger">Từ chối</StatusBadge>;
      default:
        return <StatusBadge bg="secondary">{status}</StatusBadge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm:ss');
    } catch (e) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 mb-5">
        <div className="text-center my-5">
          <Spinner animation="border" variant={theme === 'dark' ? 'light' : 'primary'} />
          <p className="mt-3">Đang tải dữ liệu...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
        <Card.Header as="h5" className="d-flex justify-content-between align-items-center">
          <span>Yêu Cầu Phúc Khảo Điểm</span>
          <div>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={fetchVerificationRequests}
              className="me-2"
            >
              <FaHistory className="me-1" /> Làm mới
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => navigate('/student/exams')}
            >
              <FaPlus className="me-1" /> Tạo yêu cầu mới
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {!error && requests.length === 0 && (
            <Alert variant="info">
              Bạn chưa tạo yêu cầu phúc khảo điểm nào. Bạn có thể yêu cầu giáo viên kiểm tra lại điểm khi xem kết quả bài thi.
            </Alert>
          )}
          
          {requests.length > 0 && (
            <div className="table-responsive">
              <Table striped bordered hover variant={theme === 'dark' ? 'dark' : 'light'}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Bài thi</th>
                    <th>Điểm ban đầu</th>
                    <th>Điểm sau phúc khảo</th>
                    <th>Ngày yêu cầu</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request, index) => (
                    <tr key={request.id}>
                      <td>{index + 1}</td>
                      <td>{request.examTitle || 'N/A'}</td>
                      <td>{request.originalScore}</td>
                      <td>{request.newScore || '-'}</td>
                      <td>{formatDate(request.createdAt)}</td>
                      <td>{getStatusBadge(request.status)}</td>
                      <td>
                        <Button 
                          variant="info" 
                          size="sm" 
                          onClick={() => handleViewRequest(request)}
                        >
                          <FaEye /> Chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Detail Modal */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        size="lg"
        centered
      >
        <Modal.Header closeButton style={{
          backgroundColor: theme === 'dark' ? '#343a40' : '#f8f9fa',
          borderBottom: `1px solid ${theme === 'dark' ? '#495057' : '#dee2e6'}`
        }}>
          <Modal.Title>Chi tiết yêu cầu phúc khảo</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{
          backgroundColor: theme === 'dark' ? '#2d3238' : '#ffffff',
          color: theme === 'dark' ? '#e9ecef' : '#212529'
        }}>
          {currentRequest && (
            <>
              <h5>Thông tin bài thi</h5>
              <p><strong>Tên bài thi:</strong> {currentRequest.examTitle || 'N/A'}</p>
              <p><strong>Điểm ban đầu:</strong> {currentRequest.originalScore}</p>
              {currentRequest.newScore && (
                <p><strong>Điểm sau phúc khảo:</strong> {currentRequest.newScore}</p>
              )}
              <p><strong>Trạng thái:</strong> {getStatusBadge(currentRequest.status)}</p>
              
              <h5 className="mt-4">Lý do yêu cầu phúc khảo</h5>
              <Card className="mb-4" bg={theme === 'dark' ? 'secondary' : 'light'}>
                <Card.Body>
                  <blockquote className="mb-0">
                    <p>{currentRequest.requestReason}</p>
                    <footer className="blockquote-footer">
                      <FaRegClock className="me-1" /> 
                      {formatDate(currentRequest.createdAt)}
                    </footer>
                  </blockquote>
                </Card.Body>
              </Card>
              
              {currentRequest.teacherResponse && (
                <>
                  <h5>Phản hồi của giáo viên</h5>
                  <Card className="mb-3" bg={theme === 'dark' ? 'secondary' : 'light'}>
                    <Card.Body>
                      <blockquote className="mb-0">
                        <p>{currentRequest.teacherResponse}</p>
                        <footer className="blockquote-footer">
                          <FaRegClock className="me-1" /> 
                          {formatDate(currentRequest.updatedAt)}
                        </footer>
                      </blockquote>
                    </Card.Body>
                  </Card>
                </>
              )}
              
              {currentRequest.status.toLowerCase() === 'pending' && (
                <Alert variant="warning">
                  Yêu cầu của bạn đang được xử lý. Giáo viên sẽ phản hồi sớm.
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={{
          backgroundColor: theme === 'dark' ? '#343a40' : '#f8f9fa',
          borderTop: `1px solid ${theme === 'dark' ? '#495057' : '#dee2e6'}`
        }}>
          <Button variant="secondary" onClick={handleCloseModal}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default VerificationRequestList;