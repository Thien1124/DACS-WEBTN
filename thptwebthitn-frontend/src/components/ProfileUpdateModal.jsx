import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 450px; /* Reduced max-width */
  max-height: 90vh; /* Limit height to prevent overflow */
  overflow-y: auto; /* Add scrolling if content overflows */
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 5px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme === 'dark' ? '#333' : '#f1f1f1'};
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme === 'dark' ? '#666' : '#c1c1c1'};
    border-radius: 10px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem; /* Reduced margin */
  padding-bottom: 0.75rem; /* Reduced padding */
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#444' : '#eaeaea'};
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem; /* Reduced font size */
  background: linear-gradient(45deg, #00bcd4, #009688);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem; /* Reduced font size */
  cursor: pointer;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
  padding: 0; /* Remove padding */
  
  &:hover {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 0.75rem; /* Reduced margin */
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.25rem; /* Reduced margin */
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#555'};
  font-size: 0.85rem; /* Reduced font size */
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem; /* Reduced padding */
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 6px; /* Reduced border radius */
  font-size: 0.9rem; /* Reduced font size */
  background-color: ${props => props.theme === 'dark' ? '#333' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  
  &:focus {
    outline: none;
    border-color: #00bcd4;
    box-shadow: 0 0 0 2px rgba(0, 188, 212, 0.25);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem; /* Reduced padding */
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 6px; /* Reduced border radius */
  font-size: 0.9rem; /* Reduced font size */
  background-color: ${props => props.theme === 'dark' ? '#333' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  
  &:focus {
    outline: none;
    border-color: #00bcd4;
    box-shadow: 0 0 0 2px rgba(0, 188, 212, 0.25);
  }
`;

const ProfileImageUpload = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem; /* Reduced margin */
`;

const ProfileImagePreview = styled.img`
  width: 60px; /* Reduced size */
  height: 60px; /* Reduced size */
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
`;

const ImageUploadButton = styled.label`
  padding: 0.4rem 0.8rem; /* Reduced padding */
  background: ${props => props.theme === 'dark' ? '#444' : '#f0f0f0'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem; /* Reduced font size */
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme === 'dark' ? '#555' : '#e0e0e0'};
  }
  
  input {
    display: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.75rem; /* Reduced font size */
  margin-top: 0.25rem; /* Reduced margin */
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.6rem; /* Reduced padding */
  background: linear-gradient(45deg, #00bcd4, #009688);
  color: white;
  border: none;
  border-radius: 6px; /* Reduced border radius */
  font-weight: 600;
  font-size: 0.9rem; /* Reduced font size */
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.75rem; /* Reduced margin */
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 150, 136, 0.3);
  }
`;

const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem; /* Reduced gap */
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileUpdateModal = ({ isOpen, onClose, userData, theme, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    grade: userData?.grade || '',
    school: userData?.school || '',
    address: userData?.address || '',
    birthdate: userData?.birthdate || '',
    profileImage: userData?.profileImage || 'https://vgrow.co/wp-content/uploads/2021/12/unnamed-2.png'
  });
  
  const [errors, setErrors] = useState({});
  
  const grades = ["10", "11", "12"];
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload this file to a server
      // For now, we'll just create a local URL
      const imageUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        profileImage: imageUrl
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }
    
    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Updated profile data:', formData);
      onSubmit(formData);
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContent
            theme={theme}
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>
                Cập nhật thông tin
              </ModalTitle>
              <CloseButton theme={theme} onClick={onClose}>✕</CloseButton>
            </ModalHeader>
            
            <form onSubmit={handleSubmit}>
              <ProfileImageUpload>
                <ProfileImagePreview 
                  src={formData.profileImage} 
                  alt="Profile"
                  theme={theme}
                />
                <div>
                  <Label theme={theme} htmlFor="profileImage">Ảnh đại diện</Label>
                  <ImageUploadButton theme={theme}>
                    Thay đổi ảnh
                    <input 
                      type="file" 
                      id="profileImage"
                      accept="image/*" 
                      onChange={handleImageChange} 
                    />
                  </ImageUploadButton>
                </div>
              </ProfileImageUpload>
              
              <FormGroup>
                <Label theme={theme} htmlFor="name">Họ và tên *</Label>
                <Input
                  theme={theme}
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
              </FormGroup>
              
              <TwoColumnLayout>
                <FormGroup>
                  <Label theme={theme} htmlFor="email">Email *</Label>
                  <Input
                    theme={theme}
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                </FormGroup>
                
                <FormGroup>
                  <Label theme={theme} htmlFor="phone">Số điện thoại</Label>
                  <Input
                    theme={theme}
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                  {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
                </FormGroup>
              </TwoColumnLayout>
              
              <TwoColumnLayout>
                <FormGroup>
                  <Label theme={theme} htmlFor="birthdate">Ngày sinh</Label>
                  <Input
                    theme={theme}
                    type="date"
                    id="birthdate"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label theme={theme} htmlFor="grade">Lớp</Label>
                  <Select
                    theme={theme}
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                  >
                    <option value="">Chọn lớp</option>
                    {grades.map(grade => (
                      <option key={grade} value={grade}>
                        Lớp {grade}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              </TwoColumnLayout>
              
              <FormGroup>
                <Label theme={theme} htmlFor="school">Trường học</Label>
                <Input
                  theme={theme}
                  type="text"
                  id="school"
                  name="school"
                  value={formData.school}
                  onChange={handleInputChange}
                />
              </FormGroup>
              
              <FormGroup>
                <Label theme={theme} htmlFor="address">Địa chỉ</Label>
                <Input
                  theme={theme}
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </FormGroup>
              
              <SubmitButton type="submit">
                Lưu thông tin
              </SubmitButton>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default ProfileUpdateModal;