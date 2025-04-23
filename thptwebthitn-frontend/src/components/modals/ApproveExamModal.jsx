import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

const ApproveExamModal = ({ show, onHide, onSubmit, examId, theme }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(examId, comment);
      onHide();
    } catch (error) {
      console.error('Error approving exam:', error);
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
        <Modal.Title>Duyệt đề thi</Modal.Title>
      </Modal.Header>
      <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Ghi chú (không bắt buộc)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Nhập ghi chú nếu cần..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={theme === 'dark' ? 'bg-secondary text-light border-dark' : ''}
            />
          </Form.Group>
          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
              Hủy bỏ
            </Button>
            <Button variant="success" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang duyệt...' : 'Xác nhận duyệt'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ApproveExamModal;