import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaCheckCircle } from 'react-icons/fa';

const ApproveExamModal = ({ show, onHide, onSubmit, examId, theme }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(examId, comment);
      setComment('');
    } catch (error) {
      console.error('Error in approve submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      className={theme === 'dark' ? 'dark-modal' : ''}
    >
      <Modal.Header className={theme === 'dark' ? 'bg-dark text-light border-secondary' : ''}>
        <Modal.Title className="d-flex align-items-center">
          <FaCheckCircle className="text-success me-2" />
          Duyệt đề thi
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
        <div className="alert alert-info">
          <strong>Lưu ý:</strong> Khi duyệt đề thi, đề thi sẽ được phép hiển thị trong hệ thống 
          nếu được cấu hình là công khai.
        </div>
        
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