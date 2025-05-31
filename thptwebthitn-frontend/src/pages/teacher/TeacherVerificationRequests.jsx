import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Spinner, Alert, 
  Tooltip, OverlayTrigger, ProgressBar, InputGroup, ButtonGroup 
} from 'react-bootstrap';
import { 
  FaCheck, FaTimes, FaEye, FaHistory, FaRegClock, FaUser, FaGraduationCap, 
  FaChartLine, FaCommentDots, FaEdit, FaInfoCircle, FaExclamationTriangle, 
  FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaEnvelope, FaSearch, FaStar
} from 'react-icons/fa';
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
  const [allRequests, setAllRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/api/score-verification/pending');
      console.log('Fetched verification requests:', response.data);
      
      // Calculate days pending for each request
      const requestsWithDays = response.data.map(request => {
        const createdDate = new Date(request.createdAt);
        const currentDate = new Date();
        const daysPending = Math.ceil((currentDate - createdDate) / (1000 * 60 * 60 * 24));
        return { ...request, daysPending };
      });
      
      setRequests(requestsWithDays);
      setAllRequests(requestsWithDays);
    } catch (err) {
      console.error('Error fetching verification requests:', err);
      setError('Không thể tải danh sách yêu cầu xác minh. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = async (request) => {
    try {
      if (request.approve === true || request.approve === false) {
        setCurrentRequest(request);
        setResponse('');
        setNewScore(request.originalScore.toString());
        setShowModal(true);
        return;
      }
      
      setLoading(true);
      const response = await apiClient.get(`/api/score-verification/${request.id}`);
      console.log('Fetched verification details:', response.data);
      
      const createdDate = new Date(response.data.createdAt);
      const currentDate = new Date();
      const daysPending = Math.ceil((currentDate - createdDate) / (1000 * 60 * 60 * 24));
      
      setCurrentRequest({
        ...response.data,
        daysPending: daysPending
      });
      setResponse(response.data.teacherResponse || '');
      setNewScore(response.data.newScore?.toString() || response.data.originalScore.toString());
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching verification details:', err);
      if (err.response?.status === 404) {
        toast.error('Không tìm thấy yêu cầu xác minh điểm này.');
      } else if (err.response?.status === 403) {
        toast.error('Bạn không có quyền xem chi tiết yêu cầu này.');
      } else {
        toast.error('Không thể tải thông tin chi tiết. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentRequest(null);
    setResponse('');
    setNewScore('');
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
        return <Badge bg="warning" className="d-flex align-items-center gap-1"><FaRegClock />Đang chờ</Badge>;
      case 'approved':
        return <Badge bg="success" className="d-flex align-items-center gap-1"><FaCheckCircle />Đã phê duyệt</Badge>;
      case 'rejected':
        return <Badge bg="danger" className="d-flex align-items-center gap-1"><FaTimesCircle />Từ chối</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (daysPending) => {
    if (daysPending > 7) {
      return <Badge bg="danger" className="d-flex align-items-center gap-1"><FaExclamationTriangle />Ưu tiên cao</Badge>;
    } else if (daysPending > 3) {
      return <Badge bg="warning" className="d-flex align-items-center gap-1"><FaInfoCircle />Ưu tiên TB</Badge>;
    } else {
      return <Badge bg="info" className="d-flex align-items-center gap-1"><FaStar />Mới</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  const getProgressValue = (daysPending) => {
    const maxDays = 14;
    return Math.min((daysPending / maxDays) * 100, 100);
  };

  const getProgressVariant = (daysPending) => {
    if (daysPending > 7) return 'danger';
    if (daysPending > 3) return 'warning';
    return 'info';
  };

  if (loading) {
    return (
      <Container className="mt-4 mb-5">
        <div className="text-center py-5">
          <div className="mb-4">
            <Spinner animation="border" variant={theme === 'dark' ? 'light' : 'primary'} style={{ width: '3rem', height: '3rem' }} />
          </div>
          <h5 className="text-muted">Đang tải dữ liệu...</h5>
          <p className="text-muted">Vui lòng chờ trong giây lát</p>
        </div>
      </Container>
    );
  }

  const filteredRequests = requests.filter(request => 
    request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.examTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container className="mt-4 mb-5">
      {/* Header Section with Gradient Background */}
      <Card 
        className="mb-4 border-0 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Card.Body className="p-4">
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex align-items-center mb-2">
                <FaChartLine className="me-3" size={32} />
                <div>
                  <h2 className="mb-0 fw-bold">Yêu Cầu Xác Minh Điểm</h2>
                  <p className="mb-0 opacity-75">Quản lý và xử lý các yêu cầu xác minh điểm từ học sinh</p>
                </div>
              </div>
            </Col>
            <Col md={4} className="text-end">
              <Button 
                variant="light" 
                size="lg"
                onClick={fetchVerificationRequests}
                className="shadow-sm"
              >
                <FaHistory className="me-2" /> Làm mới
              </Button>
            </Col>
          </Row>

          {/* Stats Cards Row */}
          <Row className="mt-4">
            <Col md={3} className="mb-3">
              <Card className="border-0 h-100" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                <Card.Body className="text-center text-white">
                  <FaGraduationCap size={40} className="mb-3 opacity-75" />
                  <h3 className="fw-bold">{requests.length}</h3>
                  <p className="mb-0">Tổng yêu cầu</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="border-0 h-100" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                <Card.Body className="text-center text-white">
                  <FaExclamationTriangle size={40} className="mb-3 opacity-75" />
                  <h3 className="fw-bold">{requests.filter(r => r.daysPending > 7).length}</h3>
                  <p className="mb-0">Ưu tiên cao</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="border-0 h-100" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                <Card.Body className="text-center text-white">
                  <FaInfoCircle size={40} className="mb-3 opacity-75" />
                  <h3 className="fw-bold">{requests.filter(r => r.daysPending > 3 && r.daysPending <= 7).length}</h3>
                  <p className="mb-0">Ưu tiên TB</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} className="mb-3">
              <Card className="border-0 h-100" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                <Card.Body className="text-center text-white">
                  <FaStar size={40} className="mb-3 opacity-75" />
                  <h3 className="fw-bold">{requests.filter(r => r.daysPending <= 3).length}</h3>
                  <p className="mb-0">Yêu cầu mới</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Main Content Card */}
      <Card className="border-0 shadow-lg" bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
        <Card.Header 
          className="border-0 py-3"
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white'
          }}
        >
          <Row className="align-items-center">
            <Col md={6}>
              <h5 className="mb-0 d-flex align-items-center">
                <FaCommentDots className="me-2" />
                Danh sách yêu cầu xác minh
              </h5>
            </Col>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white' }}>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm theo tên học sinh hoặc bài thi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                    background: 'rgba(255,255,255,0.9)', 
                    border: 'none',
                    color: '#495057'
                  }}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Header>
        
        <Card.Body className="p-0">
          {error && (
            <Alert variant="danger" className="m-4 d-flex align-items-center">
              <FaExclamationTriangle className="me-2" />
              {error}
            </Alert>
          )}
          
          {!error && requests.length === 0 && (
            <div className="text-center py-5">
              <FaGraduationCap size={80} className="text-muted mb-4 opacity-50" />
              <h4 className="text-muted">Không có yêu cầu xác minh điểm nào</h4>
              <p className="text-muted">Học sinh có thể gửi yêu cầu khi họ muốn giáo viên kiểm tra lại điểm của bài thi.</p>
            </div>
          )}
          
          {filteredRequests.length > 0 && (
            <div className="table-responsive">
              <Table hover className="mb-0" variant={theme === 'dark' ? 'dark' : 'light'}>
                <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <tr>
                    <th className="border-0 py-3">#</th>
                    <th className="border-0 py-3">
                      <FaUser className="me-1" />Học sinh
                    </th>
                    <th className="border-0 py-3">
                      <FaGraduationCap className="me-1" />Bài thi
                    </th>
                    <th className="border-0 py-3 text-center">
                      <FaChartLine className="me-1" />Điểm
                    </th>
                    <th className="border-0 py-3">
                      <FaCalendarAlt className="me-1" />Ngày gửi
                    </th>
                    <th className="border-0 py-3">
                      <FaRegClock className="me-1" />Thời gian chờ
                    </th>
                    <th className="border-0 py-3">Ưu tiên</th>
                    <th className="border-0 py-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request, index) => (
                    <tr 
                      key={request.id} 
                      style={{ 
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme === 'dark' 
                          ? 'rgba(102, 126, 234, 0.1)' 
                          : 'rgba(102, 126, 234, 0.05)';
                        e.currentTarget.style.transform = 'scale(1.01)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <td className="align-middle">
                        <Badge bg="secondary" pill style={{ minWidth: '30px' }}>
                          {index + 1}
                        </Badge>
                      </td>
                      <td className="align-middle">
                        <div>
                          <div className="fw-bold" style={{ color: '#667eea' }}>
                            {request.studentName}
                          </div>
                          <small className="text-muted">ID: {request.studentId}</small>
                        </div>
                      </td>
                      <td className="align-middle">
                        <div>
                          <div className="fw-semibold">{request.examTitle}</div>
                          <small className="text-muted">ID: {request.examId}</small>
                        </div>
                      </td>
                      <td className="align-middle text-center">
                        <Badge 
                          bg="primary" 
                          style={{ 
                            fontSize: '1rem', 
                            padding: '0.5rem 1rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none'
                          }}
                        >
                          {request.originalScore}/10
                        </Badge>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <FaCalendarAlt className="me-2 text-muted" />
                          <div>
                            <div>{formatDate(request.createdAt)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">
                        <div style={{ minWidth: '150px' }}>
                          <div className="mb-2">
                            <Badge bg={request.daysPending > 7 ? 'danger' : request.daysPending > 3 ? 'warning' : 'info'}>
                              {request.daysPending} ngày
                            </Badge>
                          </div>
                          <ProgressBar 
                            now={getProgressValue(request.daysPending)} 
                            variant={getProgressVariant(request.daysPending)}
                            style={{ height: '6px' }}
                          />
                        </div>
                      </td>
                      <td className="align-middle">
                        {getPriorityBadge(request.daysPending)}
                      </td>
                      <td className="align-middle text-center">
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Xem chi tiết yêu cầu</Tooltip>}
                        >
                          <Button 
                            variant="info" 
                            size="sm" 
                            onClick={() => handleViewRequest(request)}
                            style={{
                              background: 'linear-gradient(135deg, #17a2b8 0%, #007bff 100%)',
                              border: 'none',
                              borderRadius: '20px',
                              padding: '0.4rem 1rem'
                            }}
                          >
                            <FaEye className="me-1" /> Xem
                          </Button>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Enhanced Modal */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal}
        size="xl"
        centered
        backdrop="static"
      >
        <Modal.Header 
          closeButton 
          className="border-0"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Modal.Title className="d-flex align-items-center">
            <FaCommentDots className="me-2" />
            {currentRequest?.approve === true ? 'Duyệt yêu cầu xác minh điểm' : 
             currentRequest?.approve === false ? 'Từ chối yêu cầu xác minh điểm' : 
             'Chi tiết yêu cầu xác minh điểm'}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body 
          style={{
            backgroundColor: theme === 'dark' ? '#2d3238' : '#f8f9fa',
            color: theme === 'dark' ? '#e9ecef' : '#212529'
          }}
        >
          {currentRequest && (
            <>
              {/* Request Header */}
              <Card className="mb-4 border-0 shadow-sm" style={{ background: theme === 'dark' ? '#343a40' : 'white' }}>
                <Card.Body>
                  <Row className="align-items-center">
                    <Col md={8}>
                      <h4 className="mb-0 d-flex align-items-center" style={{ color: '#667eea' }}>
                        <FaInfoCircle className="me-2" />
                        Yêu cầu #{currentRequest.id}
                      </h4>
                    </Col>
                    <Col md={4} className="text-end">
                      <div className="d-flex flex-column align-items-end gap-2">
                        {getStatusBadge(currentRequest.status)}
                        {currentRequest.daysPending && getPriorityBadge(currentRequest.daysPending)}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Information Cards Grid */}
              <Row className="mb-4">
                <Col lg={4} className="mb-3">
                  <Card className="h-100 border-0 shadow-sm" style={{ background: theme === 'dark' ? '#343a40' : 'white' }}>
                    <Card.Header 
                      className="border-0"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                      }}
                    >
                      <FaUser className="me-2" />
                      Thông tin học sinh
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                        <strong>Họ tên:</strong>
                        <span>{currentRequest.studentName}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                        <strong>ID:</strong>
                        <span>{currentRequest.studentId}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center py-2">
                        <FaEnvelope className="text-muted" />
                        <span className="text-truncate ms-2">{currentRequest.studentEmail}</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={4} className="mb-3">
                  <Card className="h-100 border-0 shadow-sm" style={{ background: theme === 'dark' ? '#343a40' : 'white' }}>
                    <Card.Header 
                      className="border-0"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                      }}
                    >
                      <FaGraduationCap className="me-2" />
                      Thông tin bài thi
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                        <strong>Tên bài thi:</strong>
                        <span className="text-end">{currentRequest.examTitle}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                        <strong>ID bài thi:</strong>
                        <span>{currentRequest.examId}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center py-2">
                        <strong>Điểm hiện tại:</strong>
                        <Badge 
                          style={{ 
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            fontSize: '1rem',
                            padding: '0.5rem 1rem'
                          }}
                        >
                          {currentRequest.originalScore}/10
                        </Badge>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={4} className="mb-3">
                  <Card className="h-100 border-0 shadow-sm" style={{ background: theme === 'dark' ? '#343a40' : 'white' }}>
                    <Card.Header 
                      className="border-0"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                      }}
                    >
                      <FaUser className="me-2" />
                      Giáo viên phụ trách
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                        <strong>Họ tên:</strong>
                        <span>{currentRequest.teacherName}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                        <strong>ID:</strong>
                        <span>{currentRequest.teacherId}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center py-2">
                        <FaEnvelope className="text-muted" />
                        <span className="text-truncate ms-2">{currentRequest.teacherEmail}</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              {/* Request Reason */}
              <Card className="mb-4 border-0 shadow-sm" style={{ background: theme === 'dark' ? '#343a40' : 'white' }}>
                <Card.Header 
                  className="border-0"
                  style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white'
                  }}
                >
                  <FaCommentDots className="me-2" />
                  Lý do yêu cầu xác minh
                </Card.Header>
                <Card.Body>
                  <div 
                    className="p-3 rounded"
                    style={{
                      background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)',
                      borderLeft: '4px solid #f093fb'
                    }}
                  >
                    <blockquote className="mb-3">
                      <p className="fst-italic fs-5 mb-0">"{currentRequest.requestReason}"</p>
                    </blockquote>
                    <footer className="text-muted">
                      <FaRegClock className="me-1" /> 
                      Gửi lúc: {formatDate(currentRequest.createdAt)}
                      {currentRequest.daysPending && (
                        <span className="ms-2">
                          ({currentRequest.daysPending} ngày trước)
                        </span>
                      )}
                    </footer>
                  </div>
                </Card.Body>
              </Card>
              
              {/* Teacher Response (if processed) */}
              {currentRequest.status.toLowerCase() !== 'pending' && (
                <Card 
                  className="mb-4 border-0 shadow-sm"
                  style={{ 
                    background: theme === 'dark' ? '#343a40' : 'white',
                    borderLeft: `4px solid ${currentRequest.status.toLowerCase() === 'approved' ? '#00b894' : '#e17055'}`
                  }}
                >
                  <Card.Header 
                    className="border-0"
                    style={{
                      background: currentRequest.status.toLowerCase() === 'approved' 
                        ? 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)'
                        : 'linear-gradient(135deg, #e17055 0%, #d63031 100%)',
                      color: 'white'
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="d-flex align-items-center">
                        {currentRequest.status.toLowerCase() === 'approved' ? 
                          <><FaCheckCircle className="me-2" />Yêu cầu đã được phê duyệt</> : 
                          <><FaTimesCircle className="me-2" />Yêu cầu đã bị từ chối</>}
                      </span>
                      <small>{formatDate(currentRequest.updatedAt)}</small>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <blockquote className="mb-3">
                      <p className="fs-6">{currentRequest.teacherResponse}</p>
                      {currentRequest.responderName && (
                        <footer className="text-muted">
                          Phản hồi bởi: {currentRequest.responderName}
                          {currentRequest.responderId && ` (ID: ${currentRequest.responderId})`}
                        </footer>
                      )}
                    </blockquote>
                    
                    {/* Score Change Information */}
                    {currentRequest.newScore !== null && (
                      <Alert 
                        variant={currentRequest.newScore !== currentRequest.originalScore ? "warning" : "info"}
                        className="border-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 234, 167, 0.3) 0%, rgba(250, 177, 160, 0.3) 100%)',
                          borderLeft: '4px solid #ffeaa7'
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>Điểm sau khi xác minh:</strong>
                            <Badge bg="primary" className="ms-2 me-2" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                              {currentRequest.newScore}/10
                            </Badge>
                            {currentRequest.newScore !== currentRequest.originalScore ? (
                              <span className="text-warning fw-bold">
                                (Đã thay đổi từ {currentRequest.originalScore}/10)
                              </span>
                            ) : (
                              <span className="text-muted">(Không thay đổi)</span>
                            )}
                          </div>
                          {currentRequest.newScore !== currentRequest.originalScore && (
                            <Badge bg={currentRequest.newScore > currentRequest.originalScore ? "success" : "danger"} style={{ fontSize: '0.9rem' }}>
                              {currentRequest.newScore > currentRequest.originalScore ? "+" : ""}
                              {(currentRequest.newScore - currentRequest.originalScore).toFixed(1)} điểm
                            </Badge>
                          )}
                        </div>
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              )}
              
              {/* Input Forms for Pending Requests */}
              {currentRequest.status.toLowerCase() === 'pending' && (
                <Card 
                  className="border-0 shadow-sm"
                  style={{ 
                    background: theme === 'dark' ? '#343a40' : 'white',
                    borderLeft: '4px solid #ffeaa7'
                  }}
                >
                  <Card.Header 
                    className="border-0"
                    style={{
                      background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)',
                      color: '#2d3436'
                    }}
                  >
                    <FaEdit className="me-2" />
                    Xử lý yêu cầu xác minh
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Điểm sau khi xác minh</Form.Label>
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <Form.Control
                              type="number"
                              value={newScore}
                              onChange={handleNewScoreChange}
                              step="0.1"
                              min="0"
                              max="10"
                              style={{ maxWidth: '150px', textAlign: 'center', fontWeight: 'bold' }}
                            />
                            <span className="text-muted fw-bold">/10</span>
                            {newScore !== currentRequest.originalScore.toString() && (
                              <Badge 
                                bg={parseFloat(newScore) > currentRequest.originalScore ? "success" : "danger"}
                                style={{ fontSize: '0.9rem' }}
                              >
                                {parseFloat(newScore) > currentRequest.originalScore ? "+" : ""}
                                {(parseFloat(newScore) - currentRequest.originalScore).toFixed(1)} điểm
                              </Badge>
                            )}
                          </div>
                          <Form.Text className="text-muted">
                            Điểm hiện tại: {currentRequest.originalScore}/10. Chỉ thay đổi nếu cần thiết.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <div 
                          className="p-3 rounded h-100"
                          style={{
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
                          }}
                        >
                          <h6 className="text-primary fw-bold mb-3">So sánh điểm số</h6>
                          <div className="mb-3">
                            <small className="text-muted fw-semibold">Điểm gốc</small>
                            <ProgressBar now={(currentRequest.originalScore / 10) * 100} label={`${currentRequest.originalScore}/10`} style={{ height: '20px' }} />
                          </div>
                          <div>
                            <small className="text-muted fw-semibold">Điểm mới</small>
                            <ProgressBar 
                              now={newScore ? (parseFloat(newScore) / 10) * 100 : 0} 
                              label={newScore ? `${newScore}/10` : '0/10'}
                              variant={parseFloat(newScore) > currentRequest.originalScore ? "success" : parseFloat(newScore) < currentRequest.originalScore ? "danger" : "info"}
                              style={{ height: '20px' }}
                            />
                          </div>
                        </div>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Phản hồi chi tiết cho học sinh</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={response}
                        onChange={handleResponseChange}
                        placeholder="Nhập phản hồi chi tiết về yêu cầu xác minh điểm này..."
                        required
                        style={{ borderRadius: '10px' }}
                      />
                      <Form.Text className="text-muted">
                        Phản hồi này sẽ được gửi đến học sinh qua email và hiển thị trong hệ thống.
                      </Form.Text>
                    </Form.Group>

                    {/* Preview section */}
                    {response.trim() && (
                      <div className="mt-3">
                        <h6 className="text-primary fw-bold">Xem trước phản hồi:</h6>
                        <Card 
                          className="border-2"
                          style={{ 
                            borderStyle: 'dashed',
                            borderColor: '#667eea',
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                          }}
                        >
                          <Card.Body>
                            <p className="fst-italic text-muted mb-0 fs-6">"{response}"</p>
                          </Card.Body>
                        </Card>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Modal.Body>
        
        <Modal.Footer 
          className="border-0"
          style={{
            backgroundColor: theme === 'dark' ? '#2d3238' : '#f8f9fa'
          }}
        >
          <Button 
            variant="secondary" 
            onClick={handleCloseModal}
            style={{ borderRadius: '20px', padding: '0.5rem 2rem' }}
          >
            Đóng
          </Button>
          
          {currentRequest && currentRequest.status.toLowerCase() === 'pending' && (
            <Button 
              variant="success"
              onClick={handleSubmitResponse}
              disabled={submitting || !response.trim()}
              style={{
                background: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)',
                border: 'none',
                borderRadius: '20px',
                padding: '0.5rem 2rem'
              }}
            >
              {submitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <FaCheckCircle className="me-2" />
                  Phê duyệt yêu cầu
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeacherVerificationRequests;