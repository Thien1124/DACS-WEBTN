import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { FaExclamationTriangle, FaCheck, FaTimes } from 'react-icons/fa';

const ModalOverlay = styled.div`
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
`;

const ModalContainer = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
  padding: 0;
`;

const ModalHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    color: ${props => props.theme === 'dark' ? '#fc8181' : '#e53e3e'};
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const Message = styled.p`
  margin: 0;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  font-size: 16px;
  line-height: 1.5;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 5px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
`;

const CancelButton = styled(Button)`
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  border: none;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#e2e8f0'};
  }
`;

const ConfirmButton = styled(Button)`
  background-color: ${props => props.theme === 'dark' ? '#f56565' : '#e53e3e'};
  color: white;
  border: none;
  
  &:hover {
    background-color: #c53030;
  }
`;

const ConfirmModal = ({ show = true, title, message, confirmLabel, cancelLabel, onConfirm, onCancel }) => {
  const theme = useSelector(state => state.ui?.theme || 'light');
  
  // If show is false, don't render anything
  if (show === false) return null;
  
  return (
    <ModalOverlay onClick={onCancel}>
      <ModalContainer theme={theme} onClick={e => e.stopPropagation()}>
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>
            <FaExclamationTriangle />
            {title || 'Xác nhận'}
          </ModalTitle>
        </ModalHeader>
        
        <ModalBody>
          <Message theme={theme}>{message}</Message>
        </ModalBody>
        
        <ModalFooter theme={theme}>
          <CancelButton theme={theme} onClick={onCancel}>
            <FaTimes /> {cancelLabel || 'Hủy'}
          </CancelButton>
          <ConfirmButton theme={theme} onClick={onConfirm}>
            <FaCheck /> {confirmLabel || 'Xác nhận'}
          </ConfirmButton>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ConfirmModal;