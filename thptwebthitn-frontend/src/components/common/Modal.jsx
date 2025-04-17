import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const ModalOverlay = styled(motion.div)`
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
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0.75rem;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  transition: color 0.2s ease;
  
  &:hover {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
`;

const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef(null);
  const { theme } = useSelector(state => state.ui);
  
  // Sử dụng ESC để đóng modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);
  
  // Đóng modal khi click bên ngoài
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <ModalContainer
            ref={modalRef}
            theme={theme}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            <ModalHeader>
              <CloseButton theme={theme} onClick={onClose}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            {children}
          </ModalContainer>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default Modal;