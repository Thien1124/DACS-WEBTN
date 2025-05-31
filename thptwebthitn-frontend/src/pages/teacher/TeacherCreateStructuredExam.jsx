import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Spinner, Badge, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { 
  FaInfoCircle, FaSave, FaTimes, FaQuestionCircle, FaGraduationCap, 
  FaClock, FaTrophy, FaEye, FaRandom, FaBook, FaChartLine, FaPlus, FaMinus
} from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import apiClient from '../../services/apiClient';
import Header from '../../components/layout/Header';

const DifficultyCard = styled(Card)`
  border-left: 4px solid ${props => {
    if (props.difficulty === 'easy') return '#48bb78';
    if (props.difficulty === 'medium') return '#f6ad55';
    return '#f56565';
  }};
  margin-bottom: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  transition: all 0.3s ease;
  border-radius: 15px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  }
`;

const InfoAlert = styled(Alert)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 15px;
  backdrop-filter: blur(10px);
`;

const StyledCard = styled(Card)`
  border: none;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  background: ${props => props.theme === 'dark' ? '#2d3748' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const GradientButton = styled(Button)`
  background: linear-gradient(135deg, ${props => {
    if (props.variant === 'success') return '#48bb78 0%, #38a169 100%';
    if (props.variant === 'danger') return '#f56565 0%, #e53e3e 100%';
    return '#667eea 0%, #764ba2 100%';
  }});
  border: none;
  border-radius: 25px;
  padding: 0.75rem 2rem;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    transform: none;
  }
`;

const TeacherCreateStructuredExam = () => {
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Simplified form data matching API structure
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    examTypeId: 1,
    duration: 45,
    totalScore: 20,
    passScore: 10,
    isPublic: true,
    shuffleQuestions: true,
    showResult: true,
    showAnswers: true,
    autoGradeShortAnswer: true
  });

  // Criteria for structured exam - this will be sent to API
  const [criteria, setCriteria] = useState([
    {
      levelId: 1, // Easy
      questionType: 1, // Single choice
      chapterId: null,
      topic: "",
      count: 5,
      score: 1
    },
    {
      levelId: 2, // Medium
      questionType: 1,
      chapterId: null,
      topic: "",
      count: 10,
      score: 1
    },
    {
      levelId: 3, // Hard
      questionType: 1,
      chapterId: null,
      topic: "",
      count: 5,
      score: 1
    }
  ]);

  // Available question types
  const questionTypes = [
    { id: 1, name: 'Trắc nghiệm một đáp án' },
    { id: 2, name: 'Trắc nghiệm nhiều đáp án' },
    { id: 3, name: 'Tự luận ngắn' },
    { id: 4, name: 'Tự luận dài' }
  ];

  // Difficulty levels for display
  const difficultyLevels = [
    { id: 1, name: 'Dễ', color: '#48bb78', icon: '😊' },
    { id: 2, name: 'Trung bình', color: '#f6ad55', icon: '😐' },
    { id: 3, name: 'Khó', color: '#f56565', icon: '😰' }
  ];

  // Calculate totals
  const totalQuestions = criteria.reduce((sum, criterion) => sum + criterion.count, 0);
  const calculatedTotalScore = criteria.reduce((sum, criterion) => sum + (criterion.count * criterion.score), 0);

  // Update totalScore when criteria changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, totalScore: calculatedTotalScore }));
  }, [calculatedTotalScore]);

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const endpoints = [
          { url: `${API_URL}/api/Subject/all`, params: {} },
          { url: `${API_URL}/api/Subject`, params: { page: 1, pageSize: 100 } },
          { url: `${API_URL}/api/Subject/list`, params: {} }
        ];
        
        let response = null;
        for (const endpoint of endpoints) {
          try {
            response = await axios.get(endpoint.url, { params: endpoint.params });
            break;
          } catch (err) {
            continue;
          }
        }
        
        if (!response) {
          throw new Error('Không thể tải danh sách môn học');
        }
        
        let subjectsData = [];
        if (response.data?.items && Array.isArray(response.data.items)) {
          subjectsData = response.data.items;
        } else if (Array.isArray(response.data)) {
          subjectsData = response.data;
        }
        
        setSubjects(subjectsData || []);
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Không thể tải danh sách môn học. Vui lòng thử lại sau.');
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubjects();
  }, []);

  // Fetch chapters when subject changes
  useEffect(() => {
    if (formData.subjectId) {
      const fetchChapters = async () => {
        try {
          console.log('Fetching chapters for subject:', formData.subjectId);
          
          // Thử nhiều endpoint khác nhau
          const endpoints = [
            { 
              url: `${API_URL}/api/Chapter`, 
              params: { 
                subjectId: parseInt(formData.subjectId), 
                page: 1, 
                pageSize: 100,
                includeInactive: false 
              } 
            },
            { 
              url: `${API_URL}/api/Chapter/by-subject/${formData.subjectId}`, 
              params: {} 
            }
          ];
          
          let response = null;
          let lastError = null;
          
          for (const endpoint of endpoints) {
            try {
              console.log(`Trying endpoint: ${endpoint.url}`, endpoint.params);
              response = await axios.get(endpoint.url, { 
                params: endpoint.params,
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              console.log('Chapter API response:', response.data);
              break;
            } catch (err) {
              console.error(`Failed endpoint ${endpoint.url}:`, err);
              lastError = err;
              continue;
            }
          }
          
          if (!response) {
            throw lastError || new Error('Không thể tải danh sách chương');
          }
          
          // Xử lý nhiều cấu trúc response khác nhau
          let chaptersData = [];
          if (response.data?.data && Array.isArray(response.data.data)) {
            chaptersData = response.data.data;
          } else if (response.data?.items && Array.isArray(response.data.items)) {
            chaptersData = response.data.items;
          } else if (Array.isArray(response.data)) {
            chaptersData = response.data;
          } else {
            console.warn('Unexpected response structure:', response.data);
            chaptersData = [];
          }
          
          console.log('Processed chapters data:', chaptersData);
          setChapters(chaptersData || []);
          
          if (chaptersData.length === 0) {
            console.warn('No chapters found for subject:', formData.subjectId);
          }
        } catch (err) {
          console.error('Error fetching chapters:', err);
          setChapters([]);
          
          // Hiển thị thông báo lỗi cho user
          if (err.response?.status === 404) {
            console.warn('Chapters endpoint not found');
          } else if (err.response?.status === 401) {
            console.warn('Unauthorized - token might be expired');
          }
        }
      };
      
      fetchChapters();
    } else {
      setChapters([]);
    }
  }, [formData.subjectId]);

  // Update criteria when chapter changes
  useEffect(() => {
    if (formData.subjectId) {
      setCriteria(prev => prev.map(criterion => ({
        ...criterion,
        chapterId: formData.chapterId ? parseInt(formData.chapterId) : null
      })));
    }
  }, [formData.subjectId, formData.chapterId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCriteriaChange = (index, field, value) => {
    setCriteria(prev => prev.map((criterion, i) => 
      i === index ? { ...criterion, [field]: parseInt(value) || 0 } : criterion
    ));
  };

  const addCriterion = () => {
    setCriteria(prev => [...prev, {
      levelId: 1,
      questionType: 1,
      chapterId: formData.chapterId ? parseInt(formData.chapterId) : null,
      topic: "",
      count: 1,
      score: 1
    }]);
  };

  const removeCriterion = (index) => {
    if (criteria.length > 1) {
      setCriteria(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validation
      if (totalQuestions === 0) {
        throw new Error('Vui lòng thêm ít nhất một câu hỏi vào đề thi');
      }

      if (!formData.title || !formData.subjectId || !formData.duration) {
        throw new Error('Vui lòng điền đầy đủ các trường bắt buộc');
      }

      if (formData.passScore > formData.totalScore) {
        throw new Error('Điểm đạt không thể lớn hơn tổng điểm');
      }

      // Prepare criteria - remove null chapterId
      const cleanedCriteria = criteria
        .filter(criterion => criterion.count > 0)
        .map(criterion => {
          const cleaned = { ...criterion };
          if (cleaned.chapterId === null) {
            delete cleaned.chapterId;
          }
          return cleaned;
        });

      // Create exam data matching API structure
      const examData = {
        title: formData.title,
        description: formData.description || '',
        subjectId: parseInt(formData.subjectId),
        examTypeId: parseInt(formData.examTypeId),
        duration: parseInt(formData.duration),
        totalScore: parseInt(formData.totalScore),
        passScore: parseFloat(formData.passScore),
        isPublic: formData.isPublic,
        shuffleQuestions: formData.shuffleQuestions,
        showResult: formData.showResult,
        showAnswers: formData.showAnswers,
        autoGradeShortAnswer: formData.autoGradeShortAnswer,
        criteria: cleanedCriteria
      };

      console.log('Sending exam data:', JSON.stringify(examData, null, 2));

      const response = await apiClient.post('/api/tests/structured', examData);
      
      if (response.status === 200 || response.status === 201) {
        showSuccessToast('Đề thi đã được tạo thành công!');
        navigate('/teacher/exams');
      } else {
        throw new Error('Phản hồi không mong đợi từ máy chủ');
      }
    } catch (err) {
      console.error('Error creating structured exam:', err);
      
      let errorMessage = 'Lỗi khi tạo đề thi: ';
      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const errorMessages = [];
        for (const field in validationErrors) {
          errorMessages.push(`${field}: ${validationErrors[field].join(', ')}`);
        }
        errorMessage += errorMessages.join('; ');
      } else if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Lỗi không xác định';
      }
      
      setError(errorMessage);
      showErrorToast('Có lỗi khi tạo đề thi. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f8fa', minHeight: '100vh' }}>
        <Header />
        <Container className="mt-4 mb-5">
          <div className="text-center py-5">
            <Spinner animation="border" variant={theme === 'dark' ? 'light' : 'primary'} style={{ width: '3rem', height: '3rem' }} />
            <h5 className="text-muted mt-3">Đang tải dữ liệu...</h5>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f8fa', minHeight: '100vh' }}>
      <Header />
      
      <Container className="mt-4 mb-5">
        {/* Header Section */}
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
                  <FaGraduationCap className="me-3" size={32} />
                  <div>
                    <h2 className="mb-0 fw-bold">Tạo Đề Thi Theo Cấu Trúc</h2>
                    <p className="mb-0 opacity-75">Tạo đề thi với phân bổ câu hỏi theo độ khó</p>
                  </div>
                </div>
              </Col>
              <Col md={4} className="text-end">
                <Badge 
                  style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    backdropFilter: 'blur(10px)',
                    fontSize: '1rem',
                    padding: '0.5rem 1rem'
                  }}
                >
                  <FaQuestionCircle className="me-2" />
                  {totalQuestions} câu hỏi
                </Badge>
              </Col>
            </Row>

            {/* Quick Stats */}
            <Row className="mt-4">
              <Col md={4} className="mb-3">
                <Card className="border-0 h-100" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                  <Card.Body className="text-center text-white">
                    <FaQuestionCircle size={30} className="mb-2 opacity-75" />
                    <h4 className="fw-bold">{totalQuestions}</h4>
                    <p className="mb-0 small">Tổng câu hỏi</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-3">
                <Card className="border-0 h-100" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                  <Card.Body className="text-center text-white">
                    <FaTrophy size={30} className="mb-2 opacity-75" />
                    <h4 className="fw-bold">{formData.totalScore}</h4>
                    <p className="mb-0 small">Tổng điểm</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-3">
                <Card className="border-0 h-100" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                  <Card.Body className="text-center text-white">
                    <FaClock size={30} className="mb-2 opacity-75" />
                    <h4 className="fw-bold">{formData.duration}</h4>
                    <p className="mb-0 small">Phút</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        
        <InfoAlert>
          <div className="d-flex align-items-center">
            <FaInfoCircle className="me-3" size={24} />
            <div>
              <strong>Hướng dẫn:</strong> Công cụ này cho phép bạn tạo đề thi với cấu trúc độ khó tùy chỉnh. 
              Hệ thống sẽ tự động chọn câu hỏi dựa trên tiêu chí bạn đặt ra.
            </div>
          </div>
        </InfoAlert>
        
        {error && (
          <Alert variant="danger" className="border-0" style={{ borderRadius: '15px' }}>
            <div className="d-flex align-items-center">
              <FaTimes className="me-2" />
              {error}
            </div>
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <StyledCard className="mb-4" theme={theme}>
            <Card.Header 
              className="border-0"
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                borderRadius: '20px 20px 0 0'
              }}
            >
              <h5 className="mb-0 d-flex align-items-center">
                <FaBook className="me-2" />
                Thông tin cơ bản
              </h5>
            </Card.Header>
            <Card.Body className="p-4">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Tiêu đề đề thi <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Nhập tên đề thi..."
                      style={{ borderRadius: '10px' }}
                      className={theme === 'dark' ? 'bg-dark text-white' : ''}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Môn học <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="subjectId"
                      value={formData.subjectId}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: '10px' }}
                      className={theme === 'dark' ? 'bg-dark text-white' : ''}
                    >
                      <option value="">Chọn môn học</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Chương (tùy chọn)</Form.Label>
                    <Form.Select
                      name="chapterId"
                      value={formData.chapterId}
                      onChange={handleChange}
                      style={{ borderRadius: '10px' }}
                      className={theme === 'dark' ? 'bg-dark text-white' : ''}
                    >
                      <option value="">Tất cả các chương</option>
                      {chapters.map(chapter => (
                        <option key={chapter.id} value={chapter.id}>
                          {chapter.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Thời gian (phút) <span className="text-danger">*</span>
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        required
                        min="5"
                        max="300"
                        style={{ borderRadius: '10px 0 0 10px' }}
                        className={theme === 'dark' ? 'bg-dark text-white' : ''}
                      />
                      <InputGroup.Text style={{ borderRadius: '0 10px 10px 0' }}>
                        <FaClock />
                      </InputGroup.Text>
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Mô tả đề thi</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Nhập mô tả cho đề thi..."
                  style={{ borderRadius: '10px' }}
                  className={theme === 'dark' ? 'bg-dark text-white' : ''}
                />
              </Form.Group>
              
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">
                      Điểm đạt <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="passScore"
                      value={formData.passScore}
                      onChange={handleChange}
                      required
                      min="1"
                      max={formData.totalScore}
                      step="0.1"
                      style={{ borderRadius: '10px' }}
                      className={theme === 'dark' ? 'bg-dark text-white' : ''}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Tổng điểm</Form.Label>
                    <Form.Control
                      type="number"
                      name="totalScore"
                      value={formData.totalScore}
                      readOnly
                      style={{ borderRadius: '10px', backgroundColor: '#f8f9fa' }}
                      className={theme === 'dark' ? 'bg-dark text-white' : ''}
                    />
                    <Form.Text className="text-muted">
                      Tự động tính từ cấu trúc câu hỏi
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Loại đề thi</Form.Label>
                    <Form.Select
                      name="examTypeId"
                      value={formData.examTypeId}
                      onChange={handleChange}
                      style={{ borderRadius: '10px' }}
                      className={theme === 'dark' ? 'bg-dark text-white' : ''}
                    >
                      <option value={1}>Trắc nghiệm</option>
                      <option value={2}>Tự luận</option>
                      <option value={3}>Hỗn hợp</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Settings Checkboxes */}
              <Card className="mt-3" style={{ background: 'rgba(102, 126, 234, 0.05)', border: 'none', borderRadius: '15px' }}>
                <Card.Body>
                  <h6 className="fw-bold mb-3">Cài đặt đề thi</h6>
                  <Row>
                    <Col md={3}>
                      <Form.Check
                        type="checkbox"
                        name="isPublic"
                        id="isPublic"
                        checked={formData.isPublic}
                        onChange={handleChange}
                        label="Công khai"
                        className={theme === 'dark' ? 'text-white' : ''}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Check
                        type="checkbox"
                        name="shuffleQuestions"
                        id="shuffleQuestions"
                        checked={formData.shuffleQuestions}
                        onChange={handleChange}
                        label="Xáo trộn câu hỏi"
                        className={theme === 'dark' ? 'text-white' : ''}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Check
                        type="checkbox"
                        name="showResult"
                        id="showResult"
                        checked={formData.showResult}
                        onChange={handleChange}
                        label="Hiển thị kết quả"
                        className={theme === 'dark' ? 'text-white' : ''}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Check
                        type="checkbox"
                        name="autoGradeShortAnswer"
                        id="autoGradeShortAnswer"
                        checked={formData.autoGradeShortAnswer}
                        onChange={handleChange}
                        label="Tự động chấm"
                        className={theme === 'dark' ? 'text-white' : ''}
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Card.Body>
          </StyledCard>
          
          {/* Criteria Configuration */}
          <StyledCard className="mb-4" theme={theme}>
            <Card.Header 
              className="border-0"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '20px 20px 0 0'
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 d-flex align-items-center">
                  <FaChartLine className="me-2" />
                  Cấu trúc câu hỏi
                </h5>
                <GradientButton 
                  variant="light" 
                  size="sm"
                  onClick={addCriterion}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none' }}
                >
                  <FaPlus className="me-1" /> Thêm tiêu chí
                </GradientButton>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              {criteria.map((criterion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card 
                    className="mb-3 border-0 shadow-sm"
                    style={{
                      background: theme === 'dark' ? '#343a40' : '#f8f9fa',
                      borderRadius: '15px'
                    }}
                  >
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <Badge 
                          style={{ 
                            background: difficultyLevels.find(d => d.id === criterion.levelId)?.color || '#6c757d',
                            fontSize: '0.9rem',
                            padding: '0.4rem 0.8rem'
                          }}
                        >
                          {difficultyLevels.find(d => d.id === criterion.levelId)?.icon} Tiêu chí {index + 1}
                        </Badge>
                        {criteria.length > 1 && (
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => removeCriterion(index)}
                            style={{ borderRadius: '15px' }}
                          >
                            <FaMinus />
                          </Button>
                        )}
                      </div>
                      
                      <Row>
                        <Col md={3}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold small">Độ khó</Form.Label>
                            <Form.Select
                              value={criterion.levelId}
                              onChange={(e) => handleCriteriaChange(index, 'levelId', e.target.value)}
                              style={{ borderRadius: '10px' }}
                              className={theme === 'dark' ? 'bg-dark text-white' : ''}
                            >
                              {difficultyLevels.map(level => (
                                <option key={level.id} value={level.id}>
                                  {level.icon} {level.name}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold small">Loại câu hỏi</Form.Label>
                            <Form.Select
                              value={criterion.questionType}
                              onChange={(e) => handleCriteriaChange(index, 'questionType', e.target.value)}
                              style={{ borderRadius: '10px' }}
                              className={theme === 'dark' ? 'bg-dark text-white' : ''}
                            >
                              {questionTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                  {type.name}
                                </option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold small">Số câu hỏi</Form.Label>
                            <Form.Control
                              type="number"
                              value={criterion.count}
                              onChange={(e) => handleCriteriaChange(index, 'count', e.target.value)}
                              min="0"
                              max="100"
                              style={{ borderRadius: '10px' }}
                              className={theme === 'dark' ? 'bg-dark text-white' : ''}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-bold small">Điểm/câu</Form.Label>
                            <Form.Control
                              type="number"
                              value={criterion.score}
                              onChange={(e) => handleCriteriaChange(index, 'score', e.target.value)}
                              min="0"
                              step="0.1"
                              style={{ borderRadius: '10px' }}
                              className={theme === 'dark' ? 'bg-dark text-white' : ''}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </motion.div>
              ))}
              
              <Alert 
                variant="info" 
                className="border-0 mt-3"
                style={{ 
                  background: 'rgba(23, 162, 184, 0.1)',
                  borderRadius: '15px'
                }}
              >
                <div className="d-flex align-items-center">
                  <FaInfoCircle className="me-2" />
                  <div>
                    <strong>Tổng câu hỏi:</strong> {totalQuestions} câu | 
                    <strong className="ms-2">Tổng điểm:</strong> {formData.totalScore} điểm
                  </div>
                </div>
              </Alert>
            </Card.Body>
          </StyledCard>
          
          {/* Submit Buttons */}
          <div className="d-flex justify-content-end gap-3 mt-4">
            <GradientButton 
              variant="secondary" 
              onClick={() => navigate('/teacher/exams')}
              disabled={submitting}
            >
              <FaTimes className="me-2" /> Hủy
            </GradientButton>
            <GradientButton 
              type="submit" 
              variant="success"
              disabled={submitting || totalQuestions === 0}
            >
              {submitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <FaSave className="me-2" /> Tạo đề thi
                </>
              )}
            </GradientButton>
          </div>
        </Form>
      </Container>
    </div>
  );
};

export default TeacherCreateStructuredExam;