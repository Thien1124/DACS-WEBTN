import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaBookOpen, FaChalkboardTeacher, FaGraduationCap } from 'react-icons/fa';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import Header from '../layout/Header';
import Footer from '../layout/Footer';

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
  };
  
  // Handle practice exam creation
  const handleCreatePractice = async () => {
    if (!selectedGrade || !selectedSubject) {
      alert('Vui lòng chọn lớp và môn học');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // You would replace this with actual API call to create practice test
      // For now, we'll simulate a delay and then navigate to a mock practice exam
      
      const practiceParams = {
        subjectId: selectedSubject.id,
        questionCount: questionCount,
        difficulty: difficulty,
        gradeLevel: selectedGrade.id
      };
      
      console.log('Creating practice test with params:', practiceParams);
      
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        // Navigate to practice exam with these parameters
        navigate('/practice-exam?params=' + btoa(JSON.stringify(practiceParams)));
      }, 1500);
      
      // Actual API call would look something like:
      /*
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5006'}/api/Practice/create`,
        practiceParams
      );
      
      if (response.data && response.data.id) {
        navigate(`/practice-exam/${response.data.id}`);
      }
      */
      
    } catch (error) {
      console.error('Error creating practice test:', error);
      setIsLoading(false);
      alert('Có lỗi xảy ra khi tạo đề luyện tập. Vui lòng thử lại sau.');
    }
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