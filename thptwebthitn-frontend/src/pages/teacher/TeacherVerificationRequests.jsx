import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { FaCheck, FaTimes, FaEye, FaHistory, FaRegClock } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import apiClient from '../../services/apiClient';
import { toast } from 'react-toastify';

const TeacherVerificationRequests = () => {
  const { theme } = useSelector(state => state.ui);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [response, setResponse] = useState('');
  const [newScore, setNewScore] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  // Add this state variable with your other useState declarations
const [allRequests, setAllRequests] = useState([]);
  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  const fetchVerificationRequests = async () => {
  try {
    setLoading(true);
    setError(null);
    
    // Use the pending API endpoint instead to focus on requests that need attention
    const response = await apiClient.get('/api/score-verification/pending');
    setRequests(response.data);
    
    // Also fetch all verification requests for the table below
    const allResponse = await apiClient.get('/api/score-verification/teacher');
    setAllRequests(allResponse.data);
  } catch (err) {
    console.error('Error fetching verification requests:', err);
    setError('Không thể tải danh sách yêu cầu xác minh. Vui lòng thử lại sau.');
  } finally {
    setLoading(false);
  }
};

  const handleViewRequest = (request) => {
    setCurrentRequest(request);
    setResponse('');
    setNewScore(request.originalScore.toString());
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentRequest(null);
  };

  const handleResponseChange = (e) => {
    setResponse(e.target.value);
  };

  const handleNewScoreChange = (e) => {
    setNewScore(e.target.value);
  };

  const handleSubmitResponse = async () => {
    if (!response.trim()) {
      toast.error('Vui lòng nhập phản hồi cho học sinh');
      return;
    }

    try {
      setSubmitting(true);
      
      const payload = {
        verificationId: currentRequest.id,
        response: response.trim(),
        newScore: newScore !== currentRequest.originalScore.toString() ? parseFloat(newScore) : null
      };
      
      await apiClient.post(`/api/score-verification/respond/${currentRequest.id}`, payload);
      
      toast.success('Đã gửi phản hồi thành công');
      handleCloseModal();
      fetchVerificationRequests();
    } catch (err) {
      console.error('Error submitting response:', err);
      toast.error(err.response?.data?.message || 'Đã xảy ra lỗi khi gửi phản hồi');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge bg="warning">Đang chờ</Badge>;
      case 'approved':
        return <Badge bg="success">Đã phê duyệt</Badge>;
      case 'rejected':
        return <Badge bg="danger">Từ chối</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
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
          <span>Yêu Cầu Xác Minh Điểm</span>
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={fetchVerificationRequests}
          >
            <FaHistory className="me-1" /> Làm mới
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {!error && requests.length === 0 && (
            <Alert variant="info">
              Không có yêu cầu xác minh điểm nào. Học sinh có thể gửi yêu cầu khi họ muốn giáo viên kiểm tra lại điểm của bài thi.
            </Alert>
          )}
          
          {requests.length > 0 && (
            <div className="table-responsive">
              <Table striped bordered hover variant={theme === 'dark' ? 'dark' : 'light'}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Học sinh</th>
                    <th>Bài thi</th>
                    <th>Điểm hiện tại</th>
                    <th>Ngày yêu cầu</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request, index) => (
                    <tr key={request.id}>
                      <td>{index + 1}</td>
                      <td>{request.studentName || 'N/A'}</td>
                      <td>{request.examTitle || 'N/A'}</td>
                      <td>{request.originalScore}</td>
                      <td>{formatDate(request.createdAt)}</td>
                      <td>{getStatusBadge(request.status)}</td>
                      <td>
                        <Button 
                          variant="info" 
                          size="sm" 
                          onClick={() => handleViewRequest(request)}
                          className="me-1"
                        >
                          <FaEye /> Xem
                        </Button>
                        
                        {request.status.toLowerCase() === 'pending' && (
                          <>
                            <Button 
                              variant="success" 
                              size="sm" 
                              onClick={() => handleViewRequest({...request, approve: true})}
                              className="me-1"
                            >
                              <FaCheck /> Duyệt
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => handleViewRequest({...request, approve: false})}
                            >
                              <FaTimes /> Từ chối
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Response Modal */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton style={{
          backgroundColor: theme === 'dark' ? '#343a40' : '#f8f9fa',
          borderBottom: `1px solid ${theme === 'dark' ? '#495057' : '#dee2e6'}`
        }}>
          <Modal.Title>
            {currentRequest?.approve === true ? 'Duyệt yêu cầu xác minh điểm' : 
             currentRequest?.approve === false ? 'Từ chối yêu cầu xác minh điểm' : 
             'Chi tiết yêu cầu xác minh điểm'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{
          backgroundColor: theme === 'dark' ? '#2d3238' : '#ffffff',
          color: theme === 'dark' ? '#e9ecef' : '#212529'
        }}>
          {currentRequest && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Thông tin học sinh</h5>
                  <p><strong>Họ tên:</strong> {currentRequest.studentName || 'N/A'}</p>
                  <p><strong>Mã học sinh:</strong> {currentRequest.studentCode || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <h5>Thông tin bài thi</h5>
                  <p><strong>Tên bài thi:</strong> {currentRequest.examTitle || 'N/A'}</p>
                  <p><strong>Điểm hiện tại:</strong> {currentRequest.originalScore}</p>
                </Col>
              </Row>
              
              <h5>Lý do yêu cầu xác minh</h5>
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
              
              {currentRequest.status.toLowerCase() !== 'pending' && (
                <>
                  <h5>Phản hồi của giáo viên</h5>
                  <Card className="mb-4" bg={theme === 'dark' ? 'secondary' : 'light'}>
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
                  
                  {currentRequest.newScore && (
                    <Alert variant="info">
                      <strong>Điểm sau khi xác minh:</strong> {currentRequest.newScore}
                      {currentRequest.newScore !== currentRequest.originalScore && (
                        <span> (đã thay đổi từ {currentRequest.originalScore})</span>
                      )}
                    </Alert>
                  )}
                </>
              )}
              
              {currentRequest.status.toLowerCase() === 'pending' && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Điểm sau khi xác minh</Form.Label>
                    <Form.Control
                      type="number"
                      value={newScore}
                      onChange={handleNewScoreChange}
                      step="0.1"
                      min="0"
                      max="10"
                    />
                    <Form.Text className="text-muted">
                      Để trống hoặc giữ nguyên điểm hiện tại nếu không thay đổi điểm
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Phản hồi của giáo viên</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      value={response}
                      onChange={handleResponseChange}
                      placeholder="Nhập phản hồi chi tiết về yêu cầu xác minh điểm này..."
                      required
                    />
                    <Form.Text className="text-muted">
                      Phản hồi này sẽ được gửi đến học sinh qua email
                    </Form.Text>
                  </Form.Group>
                </>
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
          
          {currentRequest && currentRequest.status.toLowerCase() === 'pending' && (
            <Button 
              variant={currentRequest.approve === false ? "danger" : "success"}
              onClick={handleSubmitResponse}
              disabled={submitting || !response.trim()}
            >
              {submitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-1" />
                  Đang xử lý...
                </>
              ) : currentRequest.approve === false ? (
                "Từ chối yêu cầu"
              ) : (
                "Phê duyệt"
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeacherVerificationRequests;