import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaBookOpen, FaChalkboardTeacher, FaGraduationCap } from 'react-icons/fa';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';
const GradeCard = styled(Card)`
  transition: all 0.3s;
  cursor: pointer;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &.active {
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.3);
  }
`;

const SubjectCard = styled(Card)`
  transition: all 0.3s;
  cursor: pointer;
  margin-bottom: 1rem;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  }
  
  &.active {
    border-color: #28a745;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.3);
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${props => props.bgColor};
  color: white;
  margin-right: 15px;
  font-size: 20px;
`;

const PracticeBySubject = () => {
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  const location = useLocation();
  
  // State variables
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [questionCount, setQuestionCount] = useState(20);
  const [difficulty, setDifficulty] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [questionTypes, setQuestionTypes] = useState([0]); // Default to all types
  const [chapters, setChapters] = useState([]); // Will hold available chapters
  const [selectedChapters, setSelectedChapters] = useState([]); // Will hold selected chapter IDs
  const [topic, setTopic] = useState(''); // For topic field
  
  // Cập nhật dữ liệu môn học trong component
  const grades = [
    {
      id: 10,
      name: 'Lớp 10',
      icon: <FaBookOpen />,
      color: '#4A6FA5',
      subjects: [
        { id: 1, name: 'Toán 10', code: 'MATH10' },
        { id: 2, name: 'Vật Lý 10', code: 'PHY10' },
        { id: 3, name: 'Hóa Học 10', code: 'CHEM10' },
        { id: 10, name: 'Sinh Học 10', code: 'BIO10' },
        { id: 13, name: 'Ngữ Văn 10', code: 'LIT10' },
        { id: 16, name: 'Tiếng Anh 10', code: 'ENG10' },
        { id: 19, name: 'Lịch Sử 10', code: 'HIST10' },
        { id: 22, name: 'Địa Lý 10', code: 'GEO10' },
        { id: 25, name: 'GDKT&PL 10', code: 'GDKT&PL10' }
      ]
    },
    {
      id: 11,
      name: 'Lớp 11',
      icon: <FaChalkboardTeacher />,
      color: '#6B8E23',
      subjects: [
        { id: 4, name: 'Toán 11', code: 'MATH11' },
        { id: 5, name: 'Vật Lý 11', code: 'PHY11' },
        { id: 6, name: 'Hóa Học 11', code: 'CHEM11' },
        { id: 11, name: 'Sinh Học 11', code: 'BIO11' },
        { id: 14, name: 'Ngữ Văn 11', code: 'LIT11' },
        { id: 17, name: 'Tiếng Anh 11', code: 'ENG11' },
        { id: 20, name: 'Lịch Sử 11', code: 'HIST11' },
        { id: 23, name: 'Địa Lý 11', code: 'GEO11' },
        { id: 26, name: 'GDKT&PL 11', code: 'GDKT&PL11' }
      ]
    },
    {
      id: 12,
      name: 'Lớp 12',
      icon: <FaGraduationCap />,
      color: '#B22222',
      subjects: [
        { id: 7, name: 'Toán 12', code: 'MATH12' },
        { id: 8, name: 'Vật Lý 12', code: 'PHY12' },
        { id: 9, name: 'Hóa Học 12', code: 'CHEM12' },
        { id: 12, name: 'Sinh Học 12', code: 'BIO12' },
        { id: 15, name: 'Ngữ Văn 12', code: 'LIT12' },
        { id: 18, name: 'Tiếng Anh 12', code: 'ENG12' },
        { id: 21, name: 'Lịch Sử 12', code: 'HIST12' },
        { id: 24, name: 'Địa Lý 12', code: 'GEO12' },
        { id: 27, name: 'GDKT&PL 12', code: 'GDKT&PL12' }
      ]
    }
  ];
  
  // Effect to fetch real subjects from API if needed
  useEffect(() => {
    // Uncomment this to fetch subjects from your API instead of using hardcoded data
    /*
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5006'}/api/Subjects`);
        if (response.data && Array.isArray(response.data)) {
          setSubjects(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setSubjects(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    
    fetchSubjects();
    */
  }, []);
  
  // Effect to check for grade parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const gradeParam = params.get('grade');
    
    if (gradeParam) {
      const gradeId = parseInt(gradeParam);
      const grade = grades.find(g => g.id === gradeId);
      
      if (grade) {
        setSelectedGrade(grade);
      }
    }
  }, [location.search]);
  
  // Handle grade selection
  const handleGradeSelect = (grade) => {
    setSelectedGrade(grade);
    setSelectedSubject(null); // Reset subject when grade changes
  };
  
  // Handle subject selection
  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setSelectedChapters([]); // Reset selected chapters
    fetchChapters(subject.id);
  };
  
  // Add function to fetch chapters for a subject
  const fetchChapters = async (subjectId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await apiClient.get(`/api/Chapter`, {
        params: { 
          subjectId,
          page: 1,
          pageSize: 100,
          includeInactive: false
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      console.log('Chapter API response:', response.data);
      
      // Check if the response has the data array (matching API documentation)
      if (response.data && Array.isArray(response.data.data)) {
        setChapters(response.data.data);
        console.log(`Found ${response.data.data.length} chapters for subject ${subjectId}`);
      } else if (Array.isArray(response.data.items)) {
        // Fallback to items if that's the format your API uses
        setChapters(response.data.items);
      } else if (Array.isArray(response.data)) {
        // Last fallback - direct array
        setChapters(response.data);
      } else {
        console.error('Unexpected API response format:', response.data);
        setChapters([]);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
      toast.error('Không thể tải danh sách chương');
      setChapters([]);
    }
  };

  // Thêm hàm fetchRandomQuestions để lấy câu hỏi ngẫu nhiên
const fetchRandomQuestions = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // Tạo params cho API lấy câu hỏi ngẫu nhiên
    const params = {
      subjectId: parseInt(selectedSubject.id),
      count: parseInt(questionCount),
      levelId: difficultyToLevelId[difficulty] || 0
    };
    
    // Thêm chapterIds nếu có
    if (selectedChapters.length > 0) {
      params.chapterId = selectedChapters[0]; // API chỉ hỗ trợ 1 chapterId trong params
    }
    
    // Thêm questionType nếu có
    if (!questionTypes.includes(0) && questionTypes.length > 0) {
      params.questionType = questionTypes[0]; // API chỉ hỗ trợ 1 questionType trong params
    }
    
    // Thêm topic nếu có
    if (topic) {
      params.topic = topic;
    }
    
    console.log('Fetching random questions with params:', params);
    
    const response = await apiClient.get('/api/Question/random', {
      params: params,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    
    console.log('Random questions response:', response.data);
    
    if (Array.isArray(response.data)) {
      return response.data.map(q => q.id);
    } else if (response.data && Array.isArray(response.data.data)) {
      return response.data.data.map(q => q.id);
    } else if (response.data && Array.isArray(response.data.items)) {
      return response.data.items.map(q => q.id);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching random questions:', error);
    toast.error('Không thể lấy câu hỏi ngẫu nhiên');
    return [];
  }
};

  // Cập nhật hàm handleCreatePractice để sử dụng câu hỏi ngẫu nhiên
const handleCreatePractice = async () => {
  if (!selectedSubject) {
    toast.warning('Vui lòng chọn môn học');
    return;
  }
  
  if (selectedChapters.length === 0) {
    toast.warning('Vui lòng chọn ít nhất một chương');
    return;
  }
  
  setIsLoading(true);
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Bạn cần đăng nhập để tạo đề luyện tập');
      navigate('/login');
      return;
    }
    
    // Step 1: Fetch random questions first
    const randomQuestionIds = await fetchRandomQuestions();
    
    if (randomQuestionIds.length === 0) {
      toast.error('Không tìm thấy câu hỏi phù hợp với các tiêu chí đã chọn');
      setIsLoading(false);
      return;
    }
    
    console.log(`Fetched ${randomQuestionIds.length} random questions`);
    
    // Step 2: Create practice test with the random questions
    const payload = {
      subjectId: parseInt(selectedSubject.id),
      questionCount: randomQuestionIds.length,
      levelId: difficultyToLevelId[difficulty] || 0,
      questionTypes: questionTypes.includes(0) ? [0] : questionTypes.map(t => parseInt(t)),
      chapterIds: selectedChapters.map(id => parseInt(id)),
      topic: topic || selectedSubject.name || "Practice Test",
      // Add the random question IDs to the payload
      questionIds: randomQuestionIds
    };
    
    console.log('Creating practice test with payload:', JSON.stringify(payload, null, 2));
    
    // Try with /api prefix
    const apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5006'}/api/tests/practice`;
    console.log('Calling API at:', apiUrl);
    
    const response = await axios.post(
      apiUrl,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('API response:', response.data);
    handleSuccessResponse(response);
  } catch (error) {
    console.error('Error creating practice test:', error);
    
    // Better error reporting
    let errorMessage = 'Không thể tạo đề luyện tập';
    
    if (error.response && error.response.data) {
      console.error('Error details:', error.response.data);
      
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.Message) {
        errorMessage = error.response.data.Message;
      } else if (error.response.data.title) {
        errorMessage = error.response.data.title;
      }
    }
    
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

  // Helper function to handle successful response
  const handleSuccessResponse = (response) => {
    if (response.data?.Success === true || response.status === 200) {
      toast.success('Đã tạo đề luyện tập thành công!');
      
      if (response.data?.PracticeId || response.data?.id || 
          (response.data?.Data && response.data.Data.PracticeId)) {
        const examId = response.data.PracticeId || 
                       response.data.id || 
                       response.data.Data.PracticeId;
        navigate(`/practice-exam/${examId}`);
      } else {
        // Generic navigation if we can't find an ID
        navigate('/practice-exam');
      }
    } else {
      toast.warning('Đề thi đã được tạo nhưng không thể chuyển hướng tự động');
      navigate('/practice');
    }
  };

  // Map difficulty string to levelId
  const difficultyToLevelId = {
    'easy': 1,
    'medium': 2,
    'hard': 3,
    'mixed': 0
  };
  
  return (
    <>
      <Header />
      <Container className="py-5">
        <h1 className="text-center mb-4">Luyện đề tự do theo môn học</h1>
        <p className="text-center mb-5">Chọn lớp, môn học và tùy chỉnh đề luyện tập theo nhu cầu của bạn</p>
        
        {/* Grade Selection Section */}
        <h3 className="mb-4">Chọn khối lớp</h3>
        <Row className="mb-5">
          {grades.map((grade) => (
            <Col md={4} key={grade.id} className="mb-4">
              <GradeCard
                className={selectedGrade?.id === grade.id ? 'active' : ''}
                bg={theme === 'dark' ? 'dark' : 'light'}
                onClick={() => handleGradeSelect(grade)}
              >
                <Card.Body className="d-flex align-items-center">
                  <IconWrapper bgColor={grade.color}>
                    {grade.icon}
                  </IconWrapper>
                  <div>
                    <h5 className="mb-0">{grade.name}</h5>
                    <small className="text-muted">{grade.subjects.length} môn học</small>
                  </div>
                </Card.Body>
              </GradeCard>
            </Col>
          ))}
        </Row>
        
        {/* Subject Selection Section - Only show if grade is selected */}
        {selectedGrade && (
          <>
            <h3 className="mb-4">Chọn môn học</h3>
            <Row className="mb-5">
              <Col md={8}>
                {selectedGrade.subjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    className={selectedSubject?.id === subject.id ? 'active' : ''}
                    bg={theme === 'dark' ? 'dark' : 'light'}
                    onClick={() => handleSubjectSelect(subject)}
                  >
                    <Card.Body>
                      <h5>{subject.name}</h5>
                    </Card.Body>
                  </SubjectCard>
                ))}
              </Col>
              
              {/* Configuration Section - Only show if subject is selected */}
              <Col md={4}>
                {selectedSubject && (
                  <Card bg={theme === 'dark' ? 'dark' : 'light'}>
                    <Card.Body>
                      <h5 className="mb-4">Tùy chỉnh đề luyện tập</h5>
                      
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label>Số lượng câu hỏi</Form.Label>
                          <Form.Control
                            type="number"
                            min="5"
                            max="50"
                            value={questionCount}
                            onChange={(e) => setQuestionCount(Math.min(50, Math.max(5, parseInt(e.target.value) || 5)))}
                          />
                          <Form.Text className="text-muted">
                            Từ 5 đến 50 câu hỏi
                          </Form.Text>
                        </Form.Group>
                        
                        <Form.Group className="mb-4">
                          <Form.Label>Độ khó</Form.Label>
                          <Form.Select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                          >
                            <option value="easy">Dễ</option>
                            <option value="medium">Trung bình</option>
                            <option value="hard">Khó</option>
                            <option value="mixed">Siêu Khó</option>
                          </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Chương</Form.Label>
                          <Form.Select 
                            multiple
                            value={selectedChapters}
                            onChange={(e) => setSelectedChapters(
                              Array.from(e.target.selectedOptions, option => option.value)
                            )}
                            style={{ height: '120px' }}
                          >
                            {chapters.map(chapter => (
                              <option key={chapter.id} value={chapter.id}>
                                {chapter.name}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Text className="text-muted">
                            Giữ Ctrl (Windows) hoặc Command (Mac) để chọn nhiều chương
                          </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Chủ đề</Form.Label>
                          <Form.Control
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Nhập chủ đề (không bắt buộc)"
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Loại câu hỏi</Form.Label>
                          <div>
                            <Form.Check
                              type="checkbox"
                              id="questionType-0"
                              label="Tất cả"
                              checked={questionTypes.includes(0)}
                              onChange={() => setQuestionTypes([0])}
                            />
                            <Form.Check
                              type="checkbox"
                              id="questionType-1"
                              label="Trắc nghiệm"
                              checked={questionTypes.includes(1) && !questionTypes.includes(0)}
                              onChange={() => {
                                if (questionTypes.includes(1)) {
                                  setQuestionTypes(questionTypes.filter(t => t !== 1));
                                } else {
                                  setQuestionTypes([...questionTypes.filter(t => t !== 0), 1]);
                                }
                              }}
                            />
                            <Form.Check
                              type="checkbox"
                              id="questionType-2"
                              label="Đúng/Sai"
                              checked={questionTypes.includes(2) && !questionTypes.includes(0)}
                              onChange={() => {
                                if (questionTypes.includes(2)) {
                                  setQuestionTypes(questionTypes.filter(t => t !== 2));
                                } else {
                                  setQuestionTypes([...questionTypes.filter(t => t !== 0), 2]);
                                }
                              }}
                            />
                            <Form.Check
                              type="checkbox"
                              id="questionType-3"
                              label="Tự luận"
                              checked={questionTypes.includes(3) && !questionTypes.includes(0)}
                              onChange={() => {
                                if (questionTypes.includes(3)) {
                                  setQuestionTypes(questionTypes.filter(t => t !== 3));
                                } else {
                                  setQuestionTypes([...questionTypes.filter(t => t !== 0), 3]);
                                }
                              }}
                            />
                          </div>
                        </Form.Group>
                        
                        <Button 
                          variant="success" 
                          className="w-100"
                          onClick={handleCreatePractice}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                              />
                              Đang tạo đề...
                            </>
                          ) : (
                            'Luyện ngay'
                          )}
                        </Button>
                      </Form>
                    </Card.Body>
                  </Card>
                )}
              </Col>
            </Row>
          </>
        )}
      </Container>
      <Footer />
    </>
  );
};

export default PracticeBySubject;