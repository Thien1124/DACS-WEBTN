import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FaInfoCircle, FaSave, FaTimes, FaQuestionCircle } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import { createStructuredExam } from '../../services/testService';
import apiClient from '../../services/apiClient';
const DifficultyCard = styled(Card)`
  border-left: 4px solid ${props => {
    if (props.difficulty === 'easy') return '#48bb78';
    if (props.difficulty === 'medium') return '#f6ad55';
    return '#f56565';
  }};
  margin-bottom: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const InfoAlert = styled(Alert)`
  background-color: ${props => props.theme === 'dark' ? '#2a4365' : '#ebf8ff'};
  color: ${props => props.theme === 'dark' ? '#bee3f8' : '#2b6cb0'};
  border: none;
`;

const PageTitle = styled.h1`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 1.5rem;
`;

const SubTitle = styled.h3`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 1rem;
  font-size: 1.25rem;
`;

const TeacherCreateStructuredExam = () => {
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [questionCounts, setQuestionCounts] = useState({
    easy: 5,
    medium: 10,
    hard: 5
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    chapterId: '',
    duration: 45,
    passingScore: 5,
    difficulty: 'medium', // Add default difficulty - this was missing
    isPublic: true,
    isActive: true,
    shuffleQuestions: true,  // Add these missing options
    shuffleOptions: true,
    showResult: true,
    showAnswers: false
  });

  // 1. Add the missing examStructure state
  const [examStructure, setExamStructure] = useState([]);

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Đang tải danh sách môn học...');
        
        // Thử nhiều API endpoint khác nhau để lấy đầy đủ danh sách môn học
        const endpoints = [
          // 1. Thử endpoint lấy tất cả môn học không phân trang
          { url: `${API_URL}/api/Subject/all`, params: {} },
          // 2. Thử endpoint với pageSize lớn
          { url: `${API_URL}/api/Subject`, params: { page: 1, pageSize: 100 } },
          // 3. Thử endpoint Subject/list
          { url: `${API_URL}/api/Subject/list`, params: {} },
          // 4. Thử endpoint viết thường
          { url: `${API_URL}/api/subject`, params: { page: 1, pageSize: 100 } }
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
        
        let subjectsData = [];
        
        // Xử lý các định dạng response khác nhau
        if (response.data?.items && Array.isArray(response.data.items)) {
          console.log('Trích xuất từ response.data.items', response.data.items.length);
          subjectsData = response.data.items;
        } else if (Array.isArray(response.data)) {
          console.log('Response là một mảng trực tiếp', response.data.length);
          subjectsData = response.data;
        } else if (response.data && typeof response.data === 'object') {
          console.log('Tìm kiếm mảng trong đối tượng response');
          
          // Tìm bất kỳ thuộc tính nào là mảng trong đối tượng
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              console.log(`Tìm thấy mảng trong thuộc tính: ${key}`, response.data[key].length);
              subjectsData = response.data[key];
              break;
            }
          }
          
          // Kiểm tra thêm các đối tượng con
          if (subjectsData.length === 0) {
            for (const key in response.data) {
              if (typeof response.data[key] === 'object' && response.data[key] !== null) {
                for (const nestedKey in response.data[key]) {
                  if (Array.isArray(response.data[key][nestedKey])) {
                    console.log(`Tìm thấy mảng trong thuộc tính lồng: ${key}.${nestedKey}`, 
                      response.data[key][nestedKey].length);
                    subjectsData = response.data[key][nestedKey];
                    break;
                  }
                }
              }
            }
          }
          
          // Nếu vẫn không có dữ liệu, kiểm tra xem response.data có phải là đối tượng môn học không
          if (subjectsData.length === 0 && response.data.id && response.data.name) {
            console.log('Response là một đối tượng môn học duy nhất');
            subjectsData = [response.data];
          }
        }
        
        console.log('Dữ liệu môn học đã xử lý:', subjectsData);
        
        if (subjectsData.length === 0) {
          console.warn('Không tìm thấy dữ liệu môn học trong response:', response.data);
          showErrorToast('Không thể tải đầy đủ danh sách môn học. Vui lòng làm mới trang.');
        }
        
        setSubjects(subjectsData || []);
      } catch (err) {
        console.error('Lỗi khi tải danh sách môn học:', err);
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
          console.log(`Đang tải danh sách chương cho môn học ID: ${formData.subjectId}`);
          
          // Thử nhiều API endpoint khác nhau
          const endpoints = [
            // 1. API endpoint hiện tại với tham số query
            { 
              url: `${API_URL}/api/Chapter`, 
              params: {
                subjectId: formData.subjectId,
                page: 1,
                pageSize: 100,
                includeInactive: false
              } 
            },
            // 2. Thử với URL trực tiếp
            { 
              url: `${API_URL}/api/Chapter/by-subject/${formData.subjectId}`,
              params: {}
            },
            // 3. Thử endpoint với viết thường
            { 
              url: `${API_URL}/api/chapter`, 
              params: {
                subjectId: formData.subjectId,
                page: 1,
                pageSize: 100
              }
            },
            // 4. Thử endpoint với cấu trúc khác
            {
              url: `${API_URL}/api/subjects/${formData.subjectId}/chapters`,
              params: {}
            }
          ];
          
          let response = null;
          let error = null;
          
          // Thử từng endpoint cho đến khi thành công
          for (const endpoint of endpoints) {
            try {
              console.log(`Thử tải chương với endpoint: ${endpoint.url}`, endpoint.params);
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
          
          let chaptersData = [];
          
          // Xử lý các định dạng response khác nhau
          if (response.data?.items && Array.isArray(response.data.items)) {
            console.log('Trích xuất từ response.data.items', response.data.items.length);
            chaptersData = response.data.items;
          } else if (Array.isArray(response.data)) {
            console.log('Response là một mảng trực tiếp', response.data.length);
            chaptersData = response.data;
          } else if (response.data && typeof response.data === 'object') {
            // Tìm bất kỳ thuộc tính nào là mảng trong đối tượng
            for (const key in response.data) {
              if (Array.isArray(response.data[key])) {
                console.log(`Tìm thấy mảng trong thuộc tính: ${key}`, response.data[key].length);
                chaptersData = response.data[key];
                break;
              }
            }
            
            // Kiểm tra thêm các đối tượng con
            if (chaptersData.length === 0) {
              for (const key in response.data) {
                if (typeof response.data[key] === 'object' && response.data[key] !== null) {
                  for (const nestedKey in response.data[key]) {
                    if (Array.isArray(response.data[key][nestedKey])) {
                      console.log(`Tìm thấy mảng trong thuộc tính lồng: ${key}.${nestedKey}`, 
                        response.data[key][nestedKey].length);
                      chaptersData = response.data[key][nestedKey];
                      break;
                    }
                  }
                }
              }
            }
          }
          
          console.log('Dữ liệu chương đã xử lý:', chaptersData);
          
          setChapters(chaptersData || []);
          
          if (chaptersData.length === 0) {
            console.warn('Không tìm thấy chương nào cho môn học này.');
          }
        } catch (err) {
          console.error('Lỗi khi tải danh sách chương:', err);
          setError('Không thể tải danh sách chương. Vui lòng thử lại sau.');
          setChapters([]);
        }
      };
      
      fetchChapters();
    } else {
      setChapters([]);
    }
  }, [formData.subjectId]);

  // 2. Create useEffect to update examStructure when questionCounts change
  useEffect(() => {
    if (formData.subjectId) {
      // Convert difficulty-based counts to exam structure
      const newStructure = [
        // Easy questions section
        {
          title: "Câu hỏi mức độ Dễ",
          description: "Phần câu hỏi dễ",
          questionCount: questionCounts.easy,
          questionType: 1, // Default to single choice
          difficulty: "easy",
          topics: formData.chapterId ? [parseInt(formData.chapterId)] : [],
          scorePerQuestion: 1.0
        },
        // Medium questions section
        {
          title: "Câu hỏi mức độ Trung bình",
          description: "Phần câu hỏi trung bình",
          questionCount: questionCounts.medium,
          questionType: 1,
          difficulty: "medium",
          topics: formData.chapterId ? [parseInt(formData.chapterId)] : [],
          scorePerQuestion: 1.0
        },
        // Hard questions section
        {
          title: "Câu hỏi mức độ Khó",
          description: "Phần câu hỏi khó",
          questionCount: questionCounts.hard,
          questionType: 1,
          difficulty: "hard",
          topics: formData.chapterId ? [parseInt(formData.chapterId)] : [],
          scorePerQuestion: 1.0
        }
      ];
      
      setExamStructure(newStructure);
    }
  }, [questionCounts, formData.subjectId, formData.chapterId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleDifficultyChange = (difficulty, value) => {
    setQuestionCounts({
      ...questionCounts,
      [difficulty]: parseInt(value, 10)
    });
  };

  // 3. Fix the handleSubmit function by replacing setIsSubmitting with setSubmitting
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validate total questions
      const totalQuestions = examStructure.reduce((sum, section) => 
        sum + parseInt(section.questionCount || 0), 0);
      
      if (totalQuestions === 0) {
        throw new Error('Vui lòng thêm ít nhất một câu hỏi vào đề thi');
      }

      // Validate required fields
      if (!formData.title || !formData.subjectId || !formData.duration) {
        throw new Error('Vui lòng điền đầy đủ các trường bắt buộc (Tên đề thi, Môn học, Thời gian)');
      }

      // Filter out sections with zero questions
      const validSections = examStructure.filter(section => 
        parseInt(section.questionCount) > 0
      );

      if (validSections.length === 0) {
        throw new Error('Vui lòng thêm ít nhất một phần có câu hỏi');
      }

      // Format exam sections correctly
      const formattedSections = validSections.map(section => ({
        title: section.title || 'Phần không có tiêu đề',
        description: section.description || '',
        questionCount: parseInt(section.questionCount) || 0,
        questionType: parseInt(section.questionType) || 1,
        difficulty: section.difficulty || 'medium',
        topics: Array.isArray(section.topics) ? 
          section.topics.filter(t => t).map(t => parseInt(t)) : 
          (formData.chapterId ? [parseInt(formData.chapterId)] : []),
        scorePerQuestion: parseFloat(section.scorePerQuestion) || 1.0
      }));

      // Create the request payload with the correct format
      const examData = {
        title: formData.title,
        description: formData.description || '',
        subjectId: parseInt(formData.subjectId),
        duration: parseInt(formData.duration),
        difficulty: formData.difficulty || 'medium', // Use default if undefined
        passScore: parseFloat(formData.passingScore) || 5,
        isActive: formData.isActive === true, // Ensure boolean
        shuffleQuestions: formData.shuffleQuestions === true,
        shuffleOptions: formData.shuffleOptions === true,
        showResult: formData.showResult === true,
        showAnswers: formData.showAnswers === true,
        sections: formattedSections
      };

      console.log('Structured exam data being sent:', examData);

      // Make the API call
      const response = await apiClient.post('/api/Exams/structured', examData);
      
      if (response.status === 201 || response.status === 200) {
        showSuccessToast('Đề thi đã được tạo thành công!');
        navigate('/teacher/exams');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      console.error('Lỗi khi gọi API thay thế:', err);
      
      // Extract validation errors if available
      let errorMessage = 'Failed to create exam: ';
      if (err.response?.data?.errors) {
        const validationErrors = err.response.data.errors;
        const errorMessages = [];
        
        // Format validation errors for display
        for (const field in validationErrors) {
          errorMessages.push(`${field}: ${validationErrors[field].join(', ')}`);
        }
        
        errorMessage += errorMessages.join('; ');
      } else if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Unknown error';
      }
      
      console.error(errorMessage);
      setError(errorMessage);
      showErrorToast('Đề thi không hợp lệ. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setSubmitting(false);
    }
  };
  

  return (
    <Container>
      <PageTitle theme={theme}>Tạo đề thi theo cấu trúc độ khó</PageTitle>
      
      <InfoAlert variant="info" theme={theme}>
        <FaInfoCircle className="me-2" />
        Công cụ này sẽ tự động tạo đề thi với cấu trúc độ khó được xác định trước: 5 câu dễ, 10 câu trung bình, 5 câu khó.
        Bạn có thể điều chỉnh số lượng câu hỏi ở mỗi mức độ khó.
      </InfoAlert>
      
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Card className="mb-4" bg={theme === 'dark' ? 'dark' : 'light'}>
            <Card.Body>
              <SubTitle theme={theme}>Thông tin đề thi</SubTitle>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tiêu đề đề thi <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className={theme === 'dark' ? 'bg-dark text-white' : ''}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Môn học <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="subjectId"
                      value={formData.subjectId}
                      onChange={handleChange}
                      required
                      className={theme === 'dark' ? 'bg-dark text-white' : ''}
                    >
                      <option value="">Chọn môn học</option>
                      {Array.isArray(subjects) && subjects.length > 0 ? (
                        subjects.map(subject => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))
                      ) : (
                        <option value="">Không có môn học nào</option>
                      )}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Chương</Form.Label>
                    <Form.Select
                      name="chapterId"
                      value={formData.chapterId}
                      onChange={handleChange}
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
                    <Form.Label>Thời gian làm bài (phút) <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      required
                      min="5"
                      className={theme === 'dark' ? 'bg-dark text-white' : ''}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Mô tả đề thi</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className={theme === 'dark' ? 'bg-dark text-white' : ''}
                />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Điểm đạt <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="number"
                      name="passingScore"
                      value={formData.passingScore}
                      onChange={handleChange}
                      required
                      min="1"
                      max="10"
                      className={theme === 'dark' ? 'bg-dark text-white' : ''}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3 mt-4">
                    <Form.Check
                      type="checkbox"
                      name="isPublic"
                      id="isPublic"
                      checked={formData.isPublic}
                      onChange={handleChange}
                      label="Công khai đề thi"
                      className={theme === 'dark' ? 'text-white' : ''}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      name="isActive"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      label="Kích hoạt đề thi"
                      className={theme === 'dark' ? 'text-white' : ''}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          <Card className="mb-4" bg={theme === 'dark' ? 'dark' : 'light'}>
            <Card.Body>
              <SubTitle theme={theme}>Cấu trúc độ khó</SubTitle>
              
              <DifficultyCard theme={theme} difficulty="easy" className="p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="mb-0">Dễ</h5>
                  <Form.Group className="d-flex align-items-center">
                    <Form.Label className="mb-0 me-2">Số câu hỏi:</Form.Label>
                    <Form.Control
                      type="number"
                      value={questionCounts.easy}
                      onChange={(e) => handleDifficultyChange('easy', e.target.value)}
                      min="0"
                      style={{ width: '80px' }}
                      className={theme === 'dark' ? 'bg-dark text-white' : ''}
                    />
                  </Form.Group>
                </div>
              </DifficultyCard>
              
              <DifficultyCard theme={theme} difficulty="medium" className="p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="mb-0">Trung bình</h5>
                  <Form.Group className="d-flex align-items-center">
                    <Form.Label className="mb-0 me-2">Số câu hỏi:</Form.Label>
                    <Form.Control
                      type="number"
                      value={questionCounts.medium}
                      onChange={(e) => handleDifficultyChange('medium', e.target.value)}
                      min="0"
                      style={{ width: '80px' }}
                      className={theme === 'dark' ? 'bg-dark text-white' : ''}
                    />
                  </Form.Group>
                </div>
              </DifficultyCard>
              
              <DifficultyCard theme={theme} difficulty="hard" className="p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="mb-0">Khó</h5>
                  <Form.Group className="d-flex align-items-center">
                    <Form.Label className="mb-0 me-2">Số câu hỏi:</Form.Label>
                    <Form.Control
                      type="number"
                      value={questionCounts.hard}
                      onChange={(e) => handleDifficultyChange('hard', e.target.value)}
                      min="0"
                      style={{ width: '80px' }}
                      className={theme === 'dark' ? 'bg-dark text-white' : ''}
                    />
                  </Form.Group>
                </div>
              </DifficultyCard>
              
              <div className="d-flex align-items-center mt-3">
                <FaQuestionCircle className="me-2 text-info" />
                <span>Tổng số câu hỏi: {questionCounts.easy + questionCounts.medium + questionCounts.hard}</span>
              </div>
            </Card.Body>
          </Card>
          
          <div className="d-flex justify-content-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => navigate('/teacher/exams')}>
              <FaTimes className="me-2" /> Hủy
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={submitting}
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
            </Button>
          </div>
        </Form>
      )}
    </Container>
  );
};

export default TeacherCreateStructuredExam;