import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import styled from 'styled-components';

const ModalTitle = styled.h5`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const ModalBody = styled.div`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const ConfirmModal = ({ 
  show, 
  title, 
  message, 
  confirmText = 'Xác nhận', 
  cancelText = 'Hủy bỏ', 
  onConfirm, 
  onCancel,
  theme = 'light'
}) => {
  return (
    <Modal show={show} onHide={onCancel} centered backdrop="static">
      <Modal.Header closeButton>
        <ModalTitle theme={theme}>{title}</ModalTitle>
      </Modal.Header>
      <Modal.Body>
        <ModalBody theme={theme}>{message}</ModalBody>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;