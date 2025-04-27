import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import TestFeedbackForm from './TestFeedbackForm';

const FeedbackModal = ({ isOpen, onClose, testId, questionId, onSuccess }) => {
  const { theme } = useSelector(state => state.ui);
  
  // Xử lý khi click vào backdrop (background)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <Backdrop
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ModalContainer
            theme={theme}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          >
            <CloseButton onClick={onClose}>
              <FaTimes />
            </CloseButton>
            
            <TestFeedbackForm 
              testId={testId} 
              questionId={questionId} 
              onClose={onClose}
              onSuccess={onSuccess}
            />
          </ModalContainer>
        </Backdrop>
      )}
    </AnimatePresence>
  );
};

// Styled Components
const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContainer = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : 'white'};
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  padding: 1.5rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #718096;
  z-index: 10;
`;

export default FeedbackModal;