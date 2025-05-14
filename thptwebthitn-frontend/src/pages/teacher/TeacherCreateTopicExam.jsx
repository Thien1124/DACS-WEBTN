import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useSelector } from 'react-redux';
import { FaInfoCircle, FaSave, FaArrowLeft, FaPlus, FaCheck } from 'react-icons/fa';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/toastUtils';

const TeacherCreateTopicExam = () => {
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const createMode = 'manual'; // Replace useState with constant

  const [formData, setFormData] = useState({
    subjectId: '',
    questionCount: 40,
    levelId: 0, // Default level (add this new field)
    questionTypes: [], // Array of question types (add this new field)
    chapterIds: [], // Renamed from topicIds
    topic: '', // Renamed from topicName
  });
  
  // Add this function to handle question type selection
const handleQuestionTypesChange = (typeId) => {
  setFormData(prev => {
    const types = [...prev.questionTypes];
    
    if (types.includes(typeId)) {
      // Remove type if already selected
      return {
        ...prev,
        questionTypes: types.filter(id => id !== typeId)
      };
    } else {
      // Add type if not selected
      return {
        ...prev,
        questionTypes: [...types, typeId]
      };
    }
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
  
  // Add this useEffect after the topic loading useEffect

// Fix the useEffect for fetching questions
useEffect(() => {
  const fetchQuestionsForTopics = async () => {
    // Change from formData.topicIds to formData.chapterIds
    if (formData.chapterIds.length === 0 || formData.subjectId === '') {
      setAvailableQuestions([]);
      return;
    }
    
    try {
      setLoadingQuestions(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        showErrorToast('Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn');
        return;
      }
      
      // Change from formData.topicIds to formData.chapterIds
      const chapterIds = formData.chapterIds.join(',');
      
      // Try to fetch questions from the API based on chapters
      const response = await axios.get(`${API_URL}/api/Question`, {
        params: {
          chapterIds: chapterIds,
          subjectId: formData.subjectId,
          pageSize: 100 // Get a reasonable number of questions
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Questions API response:', response.data);
      
      // Process the response to extract questions
      let questions = [];
      
      if (response.data.items && Array.isArray(response.data.items)) {
        questions = response.data.items;
      } else if (Array.isArray(response.data)) {
        questions = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Look for an array property that might contain questions
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            questions = response.data[key];
            break;
          }
        }
      }
      
      console.log(`Found ${questions.length} questions for the selected chapters`);
      setAvailableQuestions(questions);
      
      // If we've just loaded questions and are in manual mode, pre-select up to the question count
      if (questions.length > 0) {
        const initialSelection = questions
          .slice(0, Math.min(questions.length, formData.questionCount))
          .map(q => q.id);
        setSelectedQuestions(initialSelection);
      }
      
    } catch (err) {
      console.error('Error fetching questions:', err);
      showErrorToast('Không thể tải danh sách câu hỏi. Vui lòng thử lại sau.');
      setAvailableQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };
  
  fetchQuestionsForTopics();
}, [formData.chapterIds, formData.subjectId]);

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
  
  if (formData.chapterIds.length === 0) {
    showErrorToast('Vui lòng chọn ít nhất một chương');
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
    
    // Remove /api/ from the URL path
    const apiEndpoint = `${API_URL}/api/tests/practice`;
    
    // Format payload to exactly match API expectations
    const payload = {
      subjectId: parseInt(formData.subjectId),
      questionCount: parseInt(formData.questionCount),
      levelId: parseInt(formData.levelId || 0),
      questionTypes: formData.questionTypes.length > 0 ? formData.questionTypes : [0],
      chapterIds: formData.chapterIds.map(id => parseInt(id)),
      topic: formData.topic || ''
    };
    
    console.log('Sending API payload:', payload);
    console.log('API endpoint:', apiEndpoint);
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Use the practice test creation endpoint without /api/ prefix
    const response = await axios.post(apiEndpoint, payload, { headers });
    
    console.log('API response:', response.data);
    showSuccessToast('Đã tạo đề thi thành công!');
    
    // Navigate to appropriate page
    navigate('/teacher/exams');
    
  } catch (err) {
    console.error('Error creating practice test:', err);
    
    // Better error reporting
    let errorMessage = 'Không thể tạo đề thi';
    
    if (err.response) {
      console.log('Complete API Error Response:', err.response.data);
      
      if (typeof err.response.data === 'object') {
        errorMessage += ': ' + JSON.stringify(err.response.data);
      } else if (typeof err.response.data === 'string') {
        errorMessage += ': ' + err.response.data;
      }
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
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Tiêu đề đề thi *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title" // Keep for UI but won't send to API
                    value={formData.title || ''}
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
              <Form.Label>Chương *</Form.Label>
              <Form.Select
                multiple
                name="chapterIds" // Changed from topicIds
                value={formData.chapterIds} // Changed from topicIds
                onChange={handleTopicChange}
                required
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
                Giữ phím Ctrl (Windows) hoặc Command (Mac) để chọn nhiều chương
              </Form.Text>
            </Form.Group>

            {/* Thêm trường nhập Chủ đề */}
            <Form.Group className="mb-3">
              <Form.Label>Chủ đề</Form.Label>
              <Form.Control
                type="text"
                name="topic" // Changed from topicName
                value={formData.topic} // Changed from topicName
                onChange={handleChange}
                placeholder="Nhập tên chủ đề của đề thi (ví dụ: Toán Đại,Toán Hình...)"
                className={theme === 'dark' ? 'bg-dark text-white' : ''}
              />
              <Form.Text className="text-muted">
                Chủ đề giúp phân loại đề thi của bạn, ví dụ: "Toán Đại,Toán Hình"...
              </Form.Text>
            </Form.Group>

            {/* Add new field for difficulty level */}
            <Form.Group className="mb-3">
              <Form.Label>Độ khó</Form.Label>
              <Form.Select
                name="levelId"
                value={formData.levelId}
                onChange={handleChange}
                required
                className={theme === 'dark' ? 'bg-dark text-white' : ''}
              >
                <option value="0">Tất cả</option>
                <option value="1">Dễ</option>
                <option value="2">Trung bình</option>
                <option value="3">Khó</option>
              </Form.Select>
            </Form.Group>

            {/* Add new field for question types */}
            <Form.Group className="mb-3">
              <Form.Label>Loại câu hỏi</Form.Label>
              <div>
                <Form.Check
                  type="checkbox"
                  id="questionType-1"
                  label="Trắc nghiệm"
                  checked={formData.questionTypes.includes(1)}
                  onChange={() => handleQuestionTypesChange(1)}
                  className={theme === 'dark' ? 'text-white' : ''}
                />
                <Form.Check
                  type="checkbox"
                  id="questionType-2"
                  label="Đúng/Sai"
                  checked={formData.questionTypes.includes(2)}
                  onChange={() => handleQuestionTypesChange(2)}
                  className={theme === 'dark' ? 'text-white' : ''}
                />
                <Form.Check
                  type="checkbox"
                  id="questionType-3"
                  label="Tự luận"
                  checked={formData.questionTypes.includes(3)}
                  onChange={() => handleQuestionTypesChange(3)}
                  className={theme === 'dark' ? 'text-white' : ''}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phương thức tạo đề thi</Form.Label>
              <div>
                <Form.Check
                  type="radio"
                  id="createMode-manual"
                  name="createMode"
                  label="Chọn câu hỏi thủ công"
                  checked={true}
                  readOnly
                  className={theme === 'dark' ? 'text-white' : ''}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label><strong>Chọn câu hỏi cho đề thi</strong></Form.Label>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => {
                    // Update questionCount to match selection count
                    setFormData(prev => ({
                      ...prev,
                      questionCount: selectedQuestions.length
                    }));
                    showSuccessToast(`Đã cập nhật số lượng câu hỏi thành ${selectedQuestions.length}`);
                  }}
                  disabled={selectedQuestions.length === 0}
                >
                  <FaCheck className="me-1" /> Cập nhật số lượng câu hỏi ({selectedQuestions.length})
                </Button>
              </div>
              
              {loadingQuestions ? (
                <div className="text-center py-3">
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang tải danh sách câu hỏi...
                </div>
              ) : availableQuestions.length > 0 ? (
                <Card bg={theme === 'dark' ? 'dark' : 'light'} border={selectedQuestions.length !== parseInt(formData.questionCount) ? 'warning' : 'success'}>
                  <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>
                        <strong>Đã chọn: {selectedQuestions.length}</strong> / {formData.questionCount} câu hỏi yêu cầu
                      </span>
                      {selectedQuestions.length !== parseInt(formData.questionCount) && (
                        <span className="text-warning">
                          <FaInfoCircle className="me-1" /> 
                          {selectedQuestions.length < parseInt(formData.questionCount) ? 
                            `Bạn cần chọn thêm ${parseInt(formData.questionCount) - selectedQuestions.length} câu hỏi` :
                            `Bạn đã chọn nhiều hơn ${selectedQuestions.length - parseInt(formData.questionCount)} câu hỏi so với yêu cầu`}
                        </span>
                      )}
                    </div>
                  </Card.Header>
                  <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {availableQuestions.map(question => (
                      <div 
                        key={question.id} 
                        className={`border-bottom py-2 ${selectedQuestions.includes(question.id) ? 'bg-light' : ''}`}
                      >
                        <Form.Check
                          type="checkbox"
                          id={`question-${question.id}`}
                          label={
                            <div dangerouslySetInnerHTML={{ __html: question.content }} />
                          }
                          checked={selectedQuestions.includes(question.id)}
                          onChange={() => handleQuestionSelection(question.id)}
                        />
                        <small className="text-muted">
                          ID: {question.id} | Loại: {
                            question.questionType === 1 ? 'Trắc nghiệm' : 
                            question.questionType === 2 ? 'Đúng/Sai' : 'Tự luận'
                          }
                        </small>
                      </div>
                    ))}
                  </Card.Body>
                </Card>
              ) : (
                <Alert variant="warning">
                  <FaInfoCircle className="me-2" />
                  Không tìm thấy câu hỏi nào trong các chương đã chọn. 
                  Vui lòng thêm câu hỏi vào chương hoặc sử dụng chế độ tạo tự động.
                </Alert>
              )}
            </Form.Group>
            
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