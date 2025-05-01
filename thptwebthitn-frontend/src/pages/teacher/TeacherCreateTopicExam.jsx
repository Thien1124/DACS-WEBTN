import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useSelector } from 'react-redux';
import { FaInfoCircle, FaSave, FaArrowLeft, FaPlus } from 'react-icons/fa';
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
  const [createMode, setCreateMode] = useState('auto');
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    topicIds: [],
    duration: 45,
    questionCount: 40,
    passingScore: 5,
    isPublic: true,
    shuffleQuestions: true,
    showResult: true,
    showAnswers: false
  });
  
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
  
  const handleTopicChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({
      ...formData,
      topicIds: value
    });
  };
  
  const handleQuestionSelection = (questionId) => {
    setSelectedQuestions(prevSelected => {
      if (prevSelected.includes(questionId)) {
        return prevSelected.filter(id => id !== questionId);
      } else {
        return [...prevSelected, questionId];
      }
    });
  };
  
  // Cập nhật hàm handleSubmit

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (formData.topicIds.length === 0) {
    showErrorToast('Vui lòng chọn ít nhất một chương/chủ đề');
    return;
  }
  
  if (createMode === 'manual' && selectedQuestions.length === 0) {
    showErrorToast('Vui lòng chọn ít nhất một câu hỏi');
    return;
  }
  
  try {
    setSubmitting(true);
    setError(null);
    
    // Lấy token xác thực từ localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      showErrorToast('Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn');
      navigate('/login');
      return;
    }
    
    // Chuẩn bị dữ liệu để gửi đi
    const examData = {
      title: formData.title,
      description: formData.description,
      subjectId: parseInt(formData.subjectId),
      questionCount: parseInt(formData.questionCount),
      duration: parseInt(formData.duration),
      passScore: parseFloat(formData.passingScore),
      isPublic: formData.isPublic,
      isActive: formData.isPublic, // Thêm trường isActive
      shuffleQuestions: formData.shuffleQuestions,
      showResult: formData.showResult,
      showAnswers: formData.showAnswers,
      chapters: formData.topicIds.map(id => parseInt(id)),
      chapterIds: formData.topicIds.map(id => parseInt(id)),
      questionIds: createMode === 'manual' ? selectedQuestions : [], // Thêm mảng rỗng để API biết là tạo đề thi mới
      
      // Thêm các thông tin khác có thể cần thiết
      testType: createMode === 'auto' ? 'ChapterBased' : 'Manual',
      generationStrategy: createMode === 'auto' ? 'ByChapter' : 'Manual',
      gradingMethod: 'sum'
    };
    
    console.log('Sending exam data:', examData);
    
    // Các header cho API request
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Replace the API call section with this fixed version:
    try {
      console.log('Creating exam with proper validation payload');
      
      // Fix #1: Format all fields to match API expectations
      const payload = {
        title: formData.title.trim(), // Ensure title isn't empty
        description: formData.description || '',
        subjectId: parseInt(formData.subjectId),
        duration: parseInt(formData.duration),
        passScore: parseFloat(formData.passingScore) || 5,
        totalScore: 10, // Add missing required field
        maxAttempts: 1, // Add missing required field
        
        // Fix #2: Make sure boolean values are explicitly true/false
        isActive: formData.isPublic === true,
        shuffleQuestions: formData.shuffleQuestions === true,
        shuffleOptions: formData.shuffleQuestions === true, // Use same as shuffle questions
        showResult: formData.showResult === true,
        showAnswers: formData.showAnswers === true,
        
        // Fix #3: Include all required fields for standard exam API
        difficulty: "medium",
        examTypeId: 1,
        
        // Fix #4: Properly format question-related fields
        questionIds: [], // Empty array to indicate auto-generation
        
        // Add topic/chapter information
        chapterIds: formData.topicIds.map(id => parseInt(id)),
        questionCount: parseInt(formData.questionCount),
        
        // Add the missing required fields from the error message
        questions: [], // Empty array to satisfy validation
        accessCode: "", // Empty string for access code
        scoringConfig: JSON.stringify({  // Add scoring configuration
          gradingMethod: "sum",
          partialCreditMethod: "proportional",
          penaltyForWrongAnswer: 0
        })
      };
      
      console.log('Sending improved exam payload:', payload);
      
      // Fix #5: Properly handle authorization with token
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Use the standard exam creation endpoint
      const response = await axios.post(`${API_URL}/api/Exam`, payload, { headers });
      
      console.log('API response:', response.data);
      showSuccessToast('Đã tạo đề thi thành công!');
      
      // Navigate to the appropriate page
      if (response.data && response.data.id) {
        navigate(`/teacher/exams/${response.data.id}`);
      } else {
        navigate('/teacher/exams');
      }
    } catch (err) {
      console.error('Error with exam creation:', err);
      
      // Extract detailed validation errors
      let errorMessage = 'Không thể tạo đề thi: ';
      
      if (err.response?.data) {
        console.log('Complete API Error Response:', JSON.stringify(err.response.data, null, 2));
        
        if (err.response.data.title) {
          errorMessage += err.response.data.title;
        } else if (err.response.data.errors) {
          // Format and display each validation error
          const errorDetails = [];
          for (const field in err.response.data.errors) {
            errorDetails.push(`${field}: ${err.response.data.errors[field]}`);
          }
          errorMessage += errorDetails.join('; ');
        } else if (typeof err.response.data === 'string') {
          errorMessage += err.response.data;
        } else {
          errorMessage += JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        errorMessage += err.message;
      }
      
      console.error(errorMessage);
      setError(errorMessage);
      showErrorToast('Tạo đề thi thất bại. Chi tiết lỗi đã được hiển thị bên dưới.');
    }
    
  } catch (err) {
    console.error('Lỗi khi tạo đề thi:', err);
    
    let errorMessage = 'Không thể tạo đề thi. Vui lòng thử lại sau.';
    
    // Xử lý message từ lỗi API
    if (err.response?.data) {
      if (err.response.data.Message) {
        errorMessage = err.response.data.Message;
      }
      
      // Hiển thị chi tiết lỗi validation
      if (err.response.data.ValidationErrors) {
        const validationErrors = Object.values(err.response.data.ValidationErrors);
        if (validationErrors.length > 0) {
          errorMessage += ': ' + validationErrors.join(', ');
        }
      }
    }
    
    setError(errorMessage);
    showErrorToast('Tạo đề thi thất bại: ' + errorMessage);
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
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Tiêu đề đề thi *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Nhập tiêu đề đề thi"
                    required
                    className={theme === 'dark' ? 'bg-dark text-white' : ''}
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
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
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Mô tả đề thi</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả cho đề thi"
                className={theme === 'dark' ? 'bg-dark text-white' : ''}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Chủ đề *</Form.Label>
              <Form.Select
                multiple
                name="topicIds"
                value={formData.topicIds}
                onChange={handleTopicChange}
                required
                className={theme === 'dark' ? 'bg-dark text-white' : ''}
                style={{ height: '150px' }}
                disabled={isLoadingTopics || topics.length === 0}
              >
                {isLoadingTopics ? (
                  <option>Đang tải danh sách chủ đề...</option>
                ) : topics.length > 0 ? (
                  topics.map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Không có chủ đề nào hoặc chưa chọn môn học</option>
                )}
              </Form.Select>
              <Form.Text className="text-muted">
                Giữ phím Ctrl (Windows) hoặc Command (Mac) để chọn nhiều chủ đề
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phương thức tạo đề thi</Form.Label>
              <div>
                <Form.Check
                  type="radio"
                  id="createMode-auto"
                  name="createMode"
                  label="Tự động tạo đề thi từ câu hỏi trong các chương được chọn"
                  checked={createMode === 'auto'}
                  onChange={() => setCreateMode('auto')}
                  className={theme === 'dark' ? 'text-white' : ''}
                />
                <Form.Check
                  type="radio"
                  id="createMode-manual"
                  name="createMode"
                  label="Chọn câu hỏi thủ công"
                  checked={createMode === 'manual'}
                  onChange={() => setCreateMode('manual')}
                  className={theme === 'dark' ? 'text-white' : ''}
                />
              </div>
            </Form.Group>

            {createMode === 'manual' && (
              <Form.Group className="mb-3">
                <Form.Label>Chọn câu hỏi cho đề thi</Form.Label>
                {loadingQuestions ? (
                  <div className="text-center py-3">
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang tải danh sách câu hỏi...
                  </div>
                ) : availableQuestions.length > 0 ? (
                  <Card>
                    <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <div className="mb-2">
                        <strong>Đã chọn: {selectedQuestions.length}</strong> / {formData.questionCount} câu hỏi
                      </div>
                      {availableQuestions.map(question => (
                        <div key={question.id} className="border-bottom py-2">
                          <Form.Check
                            type="checkbox"
                            id={`question-${question.id}`}
                            label={question.content}
                            checked={selectedQuestions.includes(question.id)}
                            onChange={() => handleQuestionSelection(question.id)}
                          />
                          <small className="text-muted">
                            Loại: {question.questionType === 1 ? 'Trắc nghiệm' : 
                                   question.questionType === 2 ? 'Đúng/Sai' : 'Tự luận'}
                          </small>
                        </div>
                      ))}
                    </Card.Body>
                  </Card>
                ) : (
                  <Alert variant="warning">
                    Không tìm thấy câu hỏi nào trong các chương đã chọn. 
                    Vui lòng thêm câu hỏi vào chương hoặc sử dụng chế độ tạo tự động.
                  </Alert>
                )}
              </Form.Group>
            )}
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Thời gian làm bài (phút) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min="1"
                    max="180"
                    required
                    className={theme === 'dark' ? 'bg-dark text-white' : ''}
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Số lượng câu hỏi *</Form.Label>
                  <Form.Control
                    type="number"
                    name="questionCount"
                    value={formData.questionCount}
                    onChange={handleChange}
                    min="1"
                    required
                    className={theme === 'dark' ? 'bg-dark text-white' : ''}
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Điểm đậu *</Form.Label>
                  <Form.Control
                    type="number"
                    name="passingScore"
                    value={formData.passingScore}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    required
                    className={theme === 'dark' ? 'bg-dark text-white' : ''}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row className="mb-3">
              <Col md={3}>
                <Form.Check
                  type="switch"
                  id="isPublic"
                  name="isPublic"
                  label="Công khai"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className={theme === 'dark' ? 'text-white' : ''}
                />
              </Col>
              
              <Col md={3}>
                <Form.Check
                  type="switch"
                  id="shuffleQuestions"
                  name="shuffleQuestions"
                  label="Xáo trộn câu hỏi"
                  checked={formData.shuffleQuestions}
                  onChange={handleChange}
                  className={theme === 'dark' ? 'text-white' : ''}
                />
              </Col>
              
              <Col md={3}>
                <Form.Check
                  type="switch"
                  id="showResult"
                  name="showResult"
                  label="Hiển thị kết quả"
                  checked={formData.showResult}
                  onChange={handleChange}
                  className={theme === 'dark' ? 'text-white' : ''}
                />
              </Col>
              
              <Col md={3}>
                <Form.Check
                  type="switch"
                  id="showAnswers"
                  name="showAnswers"
                  label="Hiển thị đáp án"
                  checked={formData.showAnswers}
                  onChange={handleChange}
                  className={theme === 'dark' ? 'text-white' : ''}
                />
              </Col>
            </Row>
            
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
                    <FaSave className="me-2" /> Tạo đề thi
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