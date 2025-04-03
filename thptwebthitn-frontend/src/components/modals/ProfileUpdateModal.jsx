import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(5px);
`;

const ModalContent = styled(motion.div)`
  background: ${props => props.theme === 'dark' ? '#2d3748' : 'white'};
  border-radius: 15px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #00bcd4, #2196f3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  font-weight: 500;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 10px;
  background: ${props => props.theme === 'dark' ? '#2d3748' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #00bcd4;
    box-shadow: 0 0 0 3px rgba(0, 188, 212, 0.2);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#718096' : '#a0aec0'};
  transition: all 0.3s ease;

  ${Input}:focus + & {
    color: #00bcd4;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const SaveButton = styled(Button)`
  background: linear-gradient(45deg, #00bcd4, #2196f3);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 188, 212, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const CancelButton = styled(Button)`
  background: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};

  &:hover {
    background: ${props => props.theme === 'dark' ? '#2d3748' : '#cbd5e0'};
  }
`;

const ProfileUpdateModal = ({ show, handleClose, userData, theme, updateProfile }) => {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phoneNumber: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        email: userData.email || '',
        fullName: userData.name || userData.fullName || '', 
        phoneNumber: userData.phone || userData.phoneNumber || ''
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Validate the form data
      if (!formData.fullName || !formData.email) {
        throw new Error('Vui lòng điền đầy đủ họ tên và email');
      }

      // Create the update data object
      const updatedData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim()
      };

      console.log('Submitting update:', updatedData);
      await updateProfile(updatedData);
      handleClose();
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ModalContent
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <ModalHeader>
              <ModalTitle>Cập nhật thông tin cá nhân</ModalTitle>
            </ModalHeader>
            {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Họ và tên</Label>
                <InputWrapper>
                  <InputIcon><FaUser /></InputIcon>
                  <Input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </InputWrapper>
              </FormGroup>
              
              <FormGroup>
                <Label>Email</Label>
                <InputWrapper>
                  <InputIcon><FaEnvelope /></InputIcon>
                  <Input
                    type="email"
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </InputWrapper>
              </FormGroup>
              
              <FormGroup>
                <Label>Số điện thoại</Label>
                <InputWrapper>
                  <InputIcon><FaPhone /></InputIcon>
                  <Input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                  />
                </InputWrapper>
              </FormGroup>
              
              <ButtonGroup>
                <CancelButton onClick={handleClose}>Hủy</CancelButton>
                <SaveButton type="submit" disabled={isLoading}>
                  {isLoading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                </SaveButton>
              </ButtonGroup>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default ProfileUpdateModal;
