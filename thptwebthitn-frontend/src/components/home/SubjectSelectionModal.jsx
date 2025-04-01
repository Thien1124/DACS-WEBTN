import React, { useState } from 'react';
import { Modal, Button, Row, Col, Card } from 'react-bootstrap';

const SubjectSelectionModal = ({ show, handleClose, onSelectSubject }) => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  const subjects = [
    { id: 'mathematics', name: 'Toán học', icon: '📐' },
    { id: 'physics', name: 'Vật lý', icon: '⚛️' },
    { id: 'chemistry', name: 'Hóa học', icon: '🧪' },
    { id: 'biology', name: 'Sinh học', icon: '🧬' },
    { id: 'literature', name: 'Ngữ văn', icon: '📚' },
    { id: 'history', name: 'Lịch sử', icon: '🏛️' },
    { id: 'geography', name: 'Địa lý', icon: '🌏' },
    { id: 'english', name: 'Tiếng Anh', icon: '🔤' }
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
        <Row>
          {subjects.map((subject) => (
            <Col md={3} sm={6} key={subject.id} className="mb-3">
              <Card 
                className={`h-100 text-center cursor-pointer ${selectedSubject?.id === subject.id ? 'border-primary' : ''}`}
                onClick={() => handleSubjectSelect(subject)}
                style={{ cursor: 'pointer' }}
              >
                <Card.Body>
                  <div className="fs-1 mb-2">{subject.icon}</div>
                  <Card.Title>{subject.name}</Card.Title>
                </Card.Body>
              </Card>
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
