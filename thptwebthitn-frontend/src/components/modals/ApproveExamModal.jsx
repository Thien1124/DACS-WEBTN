import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const ApproveExamModal = ({ show, onHide, onSubmit, examId, theme }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(comment); // Just pass the comment, not examId
      setComment('');
    } catch (error) {
      console.error('Error in approval submission:', error);
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
        <Alert variant="info" className="d-flex align-items-start">
          <FaInfoCircle className="mt-1 me-2" size={18} />
          <div>
            <strong>Lưu ý quan trọng:</strong> 
            <ul className="mb-0 mt-1">
              <li>Khi duyệt đề thi, đề thi sẽ tự động được <strong>chuyển từ Nháp sang Công khai</strong>.</li>
              <li>Học sinh có thể xem và làm bài nếu đề thi <strong>đang trong thời gian mở</strong>.</li>
              <li>Đề thi đã duyệt không thể chỉnh sửa nội dung câu hỏi.</li>
            </ul>
          </div>
        </Alert>
        
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