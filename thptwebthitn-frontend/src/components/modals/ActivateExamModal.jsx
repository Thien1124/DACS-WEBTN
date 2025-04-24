import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { FaPowerOff, FaPlay } from 'react-icons/fa';

const ActivateExamModal = ({ show, onHide, onSubmit, isActive, theme }) => {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-light' : ''}>
        <Modal.Title>
          {!isActive ? 'Kích hoạt đề thi' : 'Hủy kích hoạt đề thi'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
        <Alert variant={!isActive ? "info" : "warning"}>
          <div className="d-flex align-items-center mb-2">
            {!isActive ? (
              <><FaPlay className="me-2" /> <strong>Kích hoạt đề thi</strong></>
            ) : (
              <><FaPowerOff className="me-2" /> <strong>Hủy kích hoạt đề thi</strong></>
            )}
          </div>
          
          <p>
            {!isActive 
              ? 'Khi kích hoạt, học sinh sẽ có thể làm bài thi này nếu thời gian bắt đầu đã đến.'
              : 'Khi hủy kích hoạt, học sinh sẽ không thể bắt đầu làm bài thi này ngay cả khi đề thi đã công khai.'
            }
          </p>
        </Alert>
        
        <p>Bạn có chắc chắn muốn {!isActive ? 'kích hoạt' : 'hủy kích hoạt'} đề thi này?</p>
      </Modal.Body>
      <Modal.Footer className={theme === 'dark' ? 'bg-dark text-light' : ''}>
        <Button variant="secondary" onClick={onHide}>
          Hủy bỏ
        </Button>
        <Button 
          variant={!isActive ? "success" : "danger"} 
          onClick={onSubmit}
        >
          {!isActive ? 'Kích hoạt' : 'Hủy kích hoạt'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ActivateExamModal;