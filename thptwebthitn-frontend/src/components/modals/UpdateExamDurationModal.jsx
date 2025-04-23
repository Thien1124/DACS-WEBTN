import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

const UpdateExamDurationModal = ({ 
  show, 
  onHide, 
  onSubmit, 
  examId, 
  currentDuration = 60,
  theme
}) => {
  const [duration, setDuration] = useState(currentDuration);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(duration);
      onHide();
    } catch (error) {
      console.error('Error updating duration:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-light' : ''}>
        <Modal.Title>Cập nhật thời gian làm bài</Modal.Title>
      </Modal.Header>
      <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Thời gian làm bài (phút)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Nhập thời gian làm bài"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10) || 0)}
              min={1}
              required
              className={theme === 'dark' ? 'bg-secondary text-light border-dark' : ''}
            />
            <Form.Text className="text-muted">
              Thời gian hiện tại: {currentDuration} phút
            </Form.Text>
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UpdateExamDurationModal;