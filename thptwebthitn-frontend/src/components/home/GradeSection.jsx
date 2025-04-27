import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaBookOpen, FaChalkboardTeacher, FaGraduationCap, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 2.5rem;
  font-weight: 600;
`;

const GradeCard = styled(Card)`
  height: 100%;
  transition: all 0.3s;
  cursor: pointer;
  overflow: hidden;
  border: none;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
    
    .card-img-overlay {
      background-color: rgba(0, 0, 0, 0.6);
    }
    
    .btn {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .card-img-overlay {
    background-color: rgba(0, 0, 0, 0.4);
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .btn {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s;
  }
  
  .subject-list {
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
`;

const IconBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.bgColor};
  color: white;
  margin-right: 10px;
`;

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  transition: all 0.3s;
  
  &:hover {
    transform: translateX(5px);
  }
`;

const GradeSection = () => {
  const navigate = useNavigate();
  
  // Data for grade levels with subjects and images
  const grades = [
    {
      id: 10,
      name: 'Lớp 10',
      icon: <FaBookOpen />,
      color: '#4A6FA5',
      image: 'https://images.unsplash.com/photo-1504275107627-0c2ba7a43dba?auto=format&fit=crop&w=500&q=80',
      subjects: ['Toán học', 'Vật lý', 'Hóa học', 'Ngữ văn', 'Tiếng Anh']
    },
    {
      id: 11,
      name: 'Lớp 11',
      icon: <FaChalkboardTeacher />,
      color: '#6B8E23',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=500&q=80',
      subjects: ['Toán nâng cao', 'Vật lý', 'Hóa học', 'Ngữ văn', 'Tiếng Anh']
    },
    {
      id: 12,
      name: 'Lớp 12',
      icon: <FaGraduationCap />,
      color: '#B22222',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=500&q=80',
      subjects: ['Luyện thi đại học', 'Thực hành đề thi', 'Kỹ năng làm bài', 'Kỹ thuật viết luận', 'Lý thuyết trọng tâm']
    }
  ];
  
  const handleGradeSelect = (gradeId) => {
    // Chuyển người dùng đến trang practice với tham số grade đã chọn
    navigate(`/practice?grade=${gradeId}`);
  };
  
  return (
    <Container className="my-5 py-4">
      <SectionTitle>Luyện đề theo lớp</SectionTitle>
      
      <Row>
        {grades.map((grade) => (
          <Col key={grade.id} md={4} className="mb-4">
            <GradeCard className="text-white">
              <Card.Img src={grade.image} alt={grade.name} style={{ height: '250px', objectFit: 'cover' }} />
              <Card.ImgOverlay>
                <div>
                  <div className="d-flex align-items-center mb-2">
                    <IconBadge bgColor={grade.color}>
                      {grade.icon}
                    </IconBadge>
                    <h3 className="card-title mb-0">{grade.name}</h3>
                  </div>
                  <div className="subject-list">
                    {grade.subjects.map((subject, idx) => (
                      <div key={idx}>{subject}</div>
                    ))}
                  </div>
                </div>
                <StyledButton 
                  variant="light" 
                  className="w-100"
                  onClick={() => handleGradeSelect(grade.id)}
                >
                  Luyện Ngay <FaArrowRight />
                </StyledButton>
              </Card.ImgOverlay>
            </GradeCard>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default GradeSection;