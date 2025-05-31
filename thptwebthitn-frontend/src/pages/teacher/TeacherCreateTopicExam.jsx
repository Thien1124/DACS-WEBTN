import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useSelector } from 'react-redux';
import { FaInfoCircle, FaSave, FaArrowLeft } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';

const TeacherCreateTopicExam = () => {
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);

  const createMode = 'manual'; // Replace useState with constant

  const [formData, setFormData] = useState({
    title: '', // Thêm field title
    subjectId: '',
    questionCount: 40,
    levelId: 1, 
    questionTypes: [1], // API expects array, default to [1] for single choice
    chapterIds: [], 
    topic: '',
    // Remove these fields as they're not part of the API
    // duration, passingScore, isPublic, shuffleQuestions, showResult, showAnswers
  });
  
  // Add this function to handle question type selection
const handleQuestionTypesChange = (typeId) => {
  setFormData(prev => {
    let newTypes = [...prev.questionTypes];
    
    // Handle "All types" option (0)
    if (typeId === 0) {
      return {
        ...prev,
        questionTypes: newTypes.includes(0) ? [] : [0]
      };
    }
    
    // Remove "All types" if specific type is selected
    newTypes = newTypes.filter(id => id !== 0);
    
    if (newTypes.includes(typeId)) {
      // Remove type if already selected
      newTypes = newTypes.filter(id => id !== typeId);
    } else {
      // Add type if not selected
      newTypes.push(typeId);
    }
    
    // If no specific types selected, default to "All types"
    if (newTypes.length === 0) {
      newTypes = [0];
    }
    
    return {
      ...prev,
      questionTypes: newTypes
    };
  });
};

  // Lấy danh sách môn học khi component khởi tạo
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const endpoints = [
          { url: `${API_URL}/api/Subject/all`, params: {} },
          { url: `${API_URL}/api/Subject`, params: { page: 1, pageSize: 100 } }
        ];
        
        let response = null;
        for (const endpoint of endpoints) {
          try {
            response = await axios.get(endpoint.url, { params: endpoint.params });
            console.log(`Thành công với endpoint: ${endpoint.url}`, response.data);
            break;
          } catch (err) {
            console.log(`Thất bại với endpoint ${endpoint.url}:`, err.message);
          }
        }
        
        if (!response) {
          throw new Error('Không thể kết nối đến server');
        }
        
        let subjectsData = [];
        
        if (response.data?.items && Array.isArray(response.data.items)) {
          subjectsData = response.data.items;
        } else if (Array.isArray(response.data)) {
          subjectsData = response.data;
        } else if (response.data && typeof response.data === 'object') {
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              subjectsData = response.data[key];
              break;
            }
          }
        }
        
        setSubjects(subjectsData);
      } catch (err) {
        console.error('Failed to fetch subjects:', err);
        setError('Không thể tải danh sách môn học. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubjects();
  }, []);
  
  // Lấy danh sách chủ đề khi môn học thay đổi
  useEffect(() => {
    if (formData.subjectId) {
      const fetchTopics = async () => {
        try {
          setIsLoadingTopics(true);
          
          // Thử nhiều API endpoint khác nhau với Chapter thay vì Topic
          const endpoints = [
            { url: `${API_URL}/api/Chapter`, params: { subjectId: formData.subjectId } }
          ];
          
          let response = null;
          let error = null;
          
          // Thử từng endpoint cho đến khi thành công
          for (const endpoint of endpoints) {
            try {
              console.log(`Thử với endpoint: ${endpoint.url}`, endpoint.params);
              response = await axios.get(endpoint.url, { params: endpoint.params });
              console.log(`Thành công với endpoint: ${endpoint.url}`, response.data);
              break; // Thoát vòng lặp nếu thành công
            } catch (err) {
              console.log(`Thất bại với endpoint ${endpoint.url}:`, err.message);
              error = err;
              // Tiếp tục với endpoint khác
            }
          }
          
          if (!response && error) {
            throw error;
          }
          
          let topicsData = [];
          
          // Xử lý các định dạng response khác nhau
          if (response.data?.items && Array.isArray(response.data.items)) {
            topicsData = response.data.items;
          } else if (Array.isArray(response.data)) {
            topicsData = response.data;
          } else if (response.data && typeof response.data === 'object') {
            for (const key in response.data) {
              if (Array.isArray(response.data[key])) {
                topicsData = response.data[key];
                break;
              }
            }
          }
          
          console.log('Dữ liệu chương/chủ đề đã xử lý:', topicsData);
          setTopics(topicsData);
          
          // Reset selected topics when subject changes
          setFormData(prev => ({...prev, topicIds: []}));
        } catch (err) {
          console.error('Lỗi khi tải danh sách chủ đề:', err);
          showErrorToast('Không thể tải danh sách chủ đề. Vui lòng thử lại sau.');
          setTopics([]);
        } finally {
          setIsLoadingTopics(false);
        }
      };
      
      fetchTopics();
    } else {
      setTopics([]);
    }
  }, [formData.subjectId]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Update the topic selection handler for chapterIds
const handleTopicChange = (e) => {
  const value = Array.from(e.target.selectedOptions, option => parseInt(option.value));
  setFormData({
    ...formData,
    chapterIds: value // Changed from topicIds
  });
};
  
  // Cập nhật hàm handleSubmit

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validation
  if (!formData.title.trim()) {
    showErrorToast('Vui lòng nhập tiêu đề đề thi');
    return;
  }
  
  if (!formData.subjectId) {
    showErrorToast('Vui lòng chọn môn học');
    return;
  }
  
  if (formData.questionCount < 1 || formData.questionCount > 100) {
    showErrorToast('Số lượng câu hỏi phải từ 1 đến 100');
    return;
  }
  
  try {
    setSubmitting(true);
    setError(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      showErrorToast('Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn');
      navigate('/login');
      return;
    }
    
    // Prepare payload exactly matching API schema
    const payload = {
      title: formData.title.trim(),
      subjectId: parseInt(formData.subjectId),
      questionCount: parseInt(formData.questionCount),
      levelId: parseInt(formData.levelId),
      questionTypes: formData.questionTypes.map(type => parseInt(type)),
      chapterIds: formData.chapterIds.length > 0 ? formData.chapterIds.map(id => parseInt(id)) : [],
      topic: formData.topic.trim() || ""
    };
    
    console.log('🚀 Sending API payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(`${API_URL}/api/tests/practice`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ API response:', response.data);
    
    // Check for success response
    if (response.data?.success === true || response.status === 200 || response.status === 201) {
      // Show success message with details
      const practiceData = response.data?.data;
      let successMessage = response.data?.message || 'Đã tạo đề ôn tập thành công!';
      
      if (practiceData) {
        successMessage += ` (${practiceData.questionCount} câu hỏi, ${practiceData.totalScore} điểm)`;
      }
      
      showSuccessToast(successMessage);
      
      // Always navigate to teacher exams management page
      navigate('/teacher/exams', { 
        state: { 
          message: 'Đề thi đã được tạo thành công!',
          newPracticeId: practiceData?.practiceId 
        }
      });
      
    } else {
      throw new Error(response.data?.message || 'Tạo đề ôn tập thất bại');
    }
    
  } catch (err) {
    console.error('❌ Error creating practice test:', err);
    
    let errorMessage = 'Không thể tạo đề ôn tập';
    
    if (err.response?.status === 400) {
      errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
    } else if (err.response?.status === 401) {
      errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
      // Redirect to login if unauthorized
      navigate('/login');
      return;
    } else if (err.response?.status === 404) {
      errorMessage = 'Không tìm thấy dữ liệu. Vui lòng kiểm tra lại môn học và chương.';
    } else if (err.response?.status === 500) {
      errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.response?.data?.title) {
      errorMessage = err.response.data.title;
    } else if (err.response?.data?.errors) {
      const errors = err.response.data.errors;
      errorMessage += ': ' + Object.values(errors).flat().join(', ');
    } else if (err.message) {
      errorMessage += ': ' + err.message;
    }
    
    setError(errorMessage);
    showErrorToast(errorMessage);
    
  } finally {
    setSubmitting(false);
  }
};
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Tạo đề thi theo chủ đề</h2>
        <Button variant="outline-secondary" onClick={() => navigate('/teacher/exams')}>
          <FaArrowLeft /> Quay lại
        </Button>
      </div>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          <FaInfoCircle className="me-2" /> {error}
        </Alert>
      )}
      
      <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
        <Card.Header as="h5">Thông tin đề thi</Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Tiêu đề đề thi *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Nhập tiêu đề cho đề ôn tập (ví dụ: Ôn tập Toán 10 - Chương 1)"
                    required
                    className={theme === 'dark' ? 'bg-dark text-white' : ''}
                  />
                  <Form.Text className="text-muted">
                    Tiêu đề giúp bạn dễ dàng nhận biết và quản lý đề thi
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Môn học *</Form.Label>
                  <Form.Select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleChange}
                    required
                    className={theme === 'dark' ? 'bg-dark text-white' : ''}
                  >
                    <option value="">-- Chọn môn học --</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số lượng câu hỏi *</Form.Label>
                  <Form.Control
                    type="number"
                    name="questionCount"
                    value={formData.questionCount}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    required
                    className={theme === 'dark' ? 'bg-dark text-white' : ''}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Chương</Form.Label>
              <Form.Select
                multiple
                name="chapterIds"
                value={formData.chapterIds}
                onChange={handleTopicChange}
                className={theme === 'dark' ? 'bg-dark text-white' : ''}
                style={{ height: '150px' }}
                disabled={isLoadingTopics || topics.length === 0}
              >
                {isLoadingTopics ? (
                  <option>Đang tải danh sách chương...</option>
                ) : topics.length > 0 ? (
                  topics.map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Không có chương nào hoặc chưa chọn môn học</option>
                )}
              </Form.Select>
              <Form.Text className="text-muted">
                Giữ phím Ctrl (Windows) hoặc Command (Mac) để chọn nhiều chương. Để trống nếu muốn lấy từ tất cả các chương.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Độ khó</Form.Label>
              <Form.Select
                name="levelId"
                value={formData.levelId}
                onChange={handleChange}
                className={theme === 'dark' ? 'bg-dark text-white' : ''}
              >
                <option value="1">Dễ</option>
                <option value="2">Trung bình</option>
                <option value="3">Khó</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Loại câu hỏi</Form.Label>
              <div>
                <Form.Check
                  type="checkbox"
                  id="questionType-0"
                  label="Tất cả loại câu hỏi"
                  checked={formData.questionTypes.includes(0)}
                  onChange={() => handleQuestionTypesChange(0)}
                  className={theme === 'dark' ? 'text-white' : ''}
                />
                <Form.Check
                  type="checkbox"
                  id="questionType-1"
                  label="Trắc nghiệm một đáp án"
                  checked={formData.questionTypes.includes(1)}
                  onChange={() => handleQuestionTypesChange(1)}
                  disabled={formData.questionTypes.includes(0)}
                  className={theme === 'dark' ? 'text-white' : ''}
                />
                <Form.Check
                  type="checkbox"
                  id="questionType-2"
                  label="Trắc nghiệm nhiều đáp án / Đúng-sai"
                  checked={formData.questionTypes.includes(2)}
                  onChange={() => handleQuestionTypesChange(2)}
                  disabled={formData.questionTypes.includes(0)}
                  className={theme === 'dark' ? 'text-white' : ''}
                />
                <Form.Check
                  type="checkbox"
                  id="questionType-3"
                  label="Tự luận ngắn"
                  checked={formData.questionTypes.includes(3)}
                  onChange={() => handleQuestionTypesChange(3)}
                  disabled={formData.questionTypes.includes(0)}
                  className={theme === 'dark' ? 'text-white' : ''}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Chủ đề (tùy chọn)</Form.Label>
              <Form.Control
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="Nhập chủ đề cụ thể (ví dụ: Đạo hàm, Tích phân...)"
                className={theme === 'dark' ? 'bg-dark text-white' : ''}
              />
              <Form.Text className="text-muted">
                Để trống nếu muốn lấy câu hỏi từ tất cả các chủ đề trong chương đã chọn.
              </Form.Text>
            </Form.Group>

            <div className="mt-4 d-flex justify-content-end">
              <Button
                variant="secondary"
                className="me-2"
                onClick={() => navigate('/teacher/exams')}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" /> Tạo đề ôn tập
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      
      <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'} className="mt-4">
        <Card.Header as="h5">
          <FaInfoCircle className="me-2" /> Hướng dẫn
        </Card.Header>
        <Card.Body>
          <ul>
            <li>Chọn môn học rồi chọn các chủ đề bạn muốn đưa vào đề thi</li>
            <li>Hệ thống sẽ tự động tạo đề thi bao gồm các câu hỏi từ các chủ đề đã chọn</li>
            <li>Bạn có thể chọn nhiều chủ đề để tạo đề thi đa dạng (ví dụ: Toán hình học + Toán đại số)</li>
            <li>Số lượng câu hỏi sẽ được phân bổ đều giữa các chủ đề đã chọn</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TeacherCreateTopicExam;