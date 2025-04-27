import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import FeedbackModal from './FeedbackModal';

// Đảm bảo testId và questionId luôn có giá trị hợp lệ
const FeedbackButton = ({ testId, questionId = null }) => {
  // Chuyển đổi IDs sang số nếu chúng là chuỗi
  const parsedTestId = testId ? parseInt(testId) : null;
  const parsedQuestionId = questionId ? parseInt(questionId) : null;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleOpenModal = () => {
    if (!parsedTestId) {
      toast.error('Không thể gửi phản hồi: ID bài thi không hợp lệ');
      return;
    }
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handleFeedbackSuccess = () => {
    console.log('Feedback submitted successfully');
    // Có thể thêm xử lý bổ sung ở đây
  };
  
  return (
    <>
      <Button
        onClick={handleOpenModal}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaExclamationTriangle /> Báo lỗi
      </Button>
      
      {parsedTestId && (
        <FeedbackModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          testId={parsedTestId}
          questionId={parsedQuestionId}
          onSuccess={handleFeedbackSuccess}
        />
      )}
    </>
  );
};

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f56565;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background-color: #e53e3e;
  }
`;

export default FeedbackButton;