import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const VisibilityModal = ({ show, onHide, onSubmit, examId, isPublishing = true, theme }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(examId, isPublishing);
    } catch (error) {
      console.error('Error in visibility submit:', error);
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
          {isPublishing ? (
            <>
              <FaEye className="text-primary me-2" />
              Công khai đề thi
            </>
          ) : (
            <>
              <FaEyeSlash className="text-secondary me-2" />
              Chuyển về nháp
            </>
          )}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
        {isPublishing ? (
          <div className="alert alert-info">
            <strong>Lưu ý:</strong> Khi công khai đề thi, học sinh có thể làm bài nếu đề thi đã được duyệt và trong thời gian cho phép.
          </div>
        ) : (
          <div className="alert alert-warning">
            <strong>Lưu ý:</strong> Khi chuyển về nháp, học sinh sẽ không thấy đề thi này trong danh sách bài thi.
          </div>
        )}
        
        <p>
          Bạn có chắc chắn muốn {isPublishing ? 'công khai' : 'chuyển về nháp'} đề thi này?
        </p>
      </Modal.Body>
      
      <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
        <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
          Hủy bỏ
        </Button>
        <Button 
          variant={isPublishing ? "primary" : "secondary"} 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang xử lý...' : (isPublishing ? 'Công khai' : 'Chuyển về nháp')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VisibilityModal;