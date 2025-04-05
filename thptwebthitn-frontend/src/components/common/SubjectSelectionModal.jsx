import React, { useState } from 'react';
import { Modal, Button, Row, Col, Nav } from 'react-bootstrap';
import styled from 'styled-components';
import { motion } from 'framer-motion';
const StyledCard = styled(motion.div)`
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 100%;
  cursor: pointer;
  background: ${props => props.selected ? 'linear-gradient(45deg, #4285f4, #34a853)' : 'white'};
  color: ${props => props.selected ? 'white' : 'inherit'};
  box-shadow: ${props => props.selected 
    ? '0 8px 16px rgba(66, 133, 244, 0.3)'
    : '0 4px 6px rgba(0, 0, 0, 0.1)'};
  padding: 1.5rem;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
  }
`;

const SubjectIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  transition: transform 0.3s ease;
  
  ${StyledCard}:hover & {
    transform: scale(1.1);
  }
`;

const SubjectName = styled.h5`
  margin: 0;
  font-weight: 600;
  font-size: 1rem;
`;

const SubjectDetail = styled.p`
  font-size: 0.85rem;
  margin-top: 0.5rem;
  color: ${props => props.selected ? 'rgba(255, 255, 255, 0.9)' : '#666'};
`;

const SubjectSelectionModal = ({ show, handleClose, onSelectSubject, theme = 'light' }) => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [activeCategory, setActiveCategory] = useState('required');
  
  // Danh sách môn học THPT 2025 đầy đủ
  const subjects = [
    {
      id: 'literature',
      name: 'Ngữ văn',
      icon: '📚',
      description: 'Môn học bắt buộc'
    },
    {
      id: 'mathematics',
      name: 'Toán học',
      icon: '📐',
      description: 'Môn học bắt buộc'
    },
    {
      id: 'english',
      name: 'Ngoại ngữ',
      icon: '🔤',
      description: 'Môn học bắt buộc'
    },
    {
      id: 'history',
      name: 'Lịch sử',
      icon: '🏛️',
      description: 'Môn học bắt buộc'
    },
    {
      id: 'physics',
      name: 'Vật lí',
      icon: '⚛️',
      description: 'Khoa học tự nhiên'
    },
    {
      id: 'chemistry',
      name: 'Hóa học',
      icon: '🧪',
      description: 'Khoa học tự nhiên'
    },
    {
      id: 'biology',
      name: 'Sinh học',
      icon: '🧬',
      description: 'Khoa học tự nhiên'
    },
    {
      id: 'economics_law',
      name: 'Kinh tế và Pháp luật',
      icon: '⚖️',
      description: 'Môn học tích hợp'
    },
    {
      id: 'technology',
      name: 'Công nghệ',
      icon: '🔧',
      description: 'Môn học bổ trợ'
    },
    {
      id: 'informatics',
      name: 'Tin học',
      icon: '💻',
      description: 'Môn học bổ trợ'
    }
  ];
  const subjectCategories = [
    {
      id: 'required',
      name: 'Môn bắt buộc',
      subjects: subjects.filter(s => s.description === 'Môn học bắt buộc')
    },
    {
      id: 'science',
      name: 'Khoa học tự nhiên',
      subjects: subjects.filter(s => s.description === 'Khoa học tự nhiên')
    },
    {
      id: 'additional',
      name: 'Môn học bổ trợ',
      subjects: subjects.filter(s => s.description === 'Môn học bổ trợ')
    },
    {
      id: 'integrated',
      name: 'Môn học tích hợp',
      subjects: subjects.filter(s => s.description === 'Môn học tích hợp')
    }
  ];
  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
  };

  const handleConfirm = () => {
    if (selectedSubject) {
      onSelectSubject(selectedSubject);
      handleClose();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Chọn môn học</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Nav variant="tabs" className="mb-3">
          {subjectCategories.map(category => (
            <Nav.Item key={category.id}>
              <Nav.Link
                active={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        <Row>
          {subjectCategories
            .find(c => c.id === activeCategory)
            ?.subjects.map(subject => (
              <Col md={3} sm={6} key={subject.id} className="mb-3">
                <StyledCard // Thay SubjectCard bằng StyledCard
                  selected={selectedSubject?.id === subject.id}
                  onClick={() => handleSubjectSelect(subject)}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <SubjectIcon>{subject.icon}</SubjectIcon>
                  <SubjectName>{subject.name}</SubjectName>
                  <SubjectDetail selected={selectedSubject?.id === subject.id}>
                    {subject.description}
                  </SubjectDetail>
                </StyledCard>
              </Col>
            ))}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={!selectedSubject}
        >
          Chọn môn {selectedSubject?.name || ''}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SubjectSelectionModal;