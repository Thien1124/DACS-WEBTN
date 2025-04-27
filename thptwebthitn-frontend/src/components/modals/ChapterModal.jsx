import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaBookOpen, FaSave, FaTimes } from 'react-icons/fa';
import { createChapter, updateChapter } from '../../services/chapterService';

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
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative;
  padding: 0;
`;

const ModalHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    color: ${props => props.theme === 'dark' ? '#90cdf4' : '#3182ce'};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme === 'dark' ? '#cbd5e0' : '#718096'};
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${props => props.theme === 'dark' ? '#fff' : '#1a202c'};
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 5px;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  font-size: 16px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 1px #3182ce;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 5px;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 1px #3182ce;
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  
  input {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
  
  span {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme === 'dark' ? '#fc8181' : '#e53e3e'};
  font-size: 14px;
  margin-top: 5px;
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

const SaveButton = styled(Button)`
  background-color: ${props => props.disabled ? 
    (props.theme === 'dark' ? '#4a5568' : '#cbd5e0') : 
    (props.theme === 'dark' ? '#3182ce' : '#4299e1')};
  color: white;
  border: none;
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  
  &:hover {
    background-color: ${props => props.disabled ? 
      (props.theme === 'dark' ? '#4a5568' : '#cbd5e0') : 
      '#2b6cb0'};
  }
`;

const ChapterModal = ({ show, chapter, subjectId, onClose, onSave }) => {
  const theme = useSelector(state => state.ui?.theme || 'light');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subjectId: subjectId || 0,
    orderIndex: 1,
    isActive: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (chapter) {
      setFormData({
        name: chapter.name || '',
        description: chapter.description || '',
        subjectId: chapter.subjectId || subjectId || 0,
        orderIndex: chapter.orderIndex || 1,
        isActive: chapter.isActive !== undefined ? chapter.isActive : true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        subjectId: subjectId || 0,
        orderIndex: 1,
        isActive: true
      });
    }
  }, [chapter, subjectId]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Tên chương không được để trống';
    if (!formData.subjectId) newErrors.subjectId = 'Vui lòng chọn môn học';
    if (formData.orderIndex <= 0) newErrors.orderIndex = 'Thứ tự phải lớn hơn 0';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Ensure numeric values are actually numbers
      const payload = {
        ...formData,
        subjectId: Number(formData.subjectId),
        orderIndex: Number(formData.orderIndex),
      };

      // Create or update chapter
      let result;
      if (chapter?.id) {
        result = await updateChapter(chapter.id, payload);
        toast.success('Cập nhật chương thành công');
      } else {
        result = await createChapter(payload);
        toast.success('Tạo chương mới thành công');
      }
      
      onSave && onSave(result);
      onClose && onClose();
    } catch (error) {
      console.error('Error saving chapter:', error);
      toast.error(error.message || 'Đã xảy ra lỗi khi lưu chương');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer theme={theme} onClick={e => e.stopPropagation()}>
        <ModalHeader theme={theme}>
          <ModalTitle theme={theme}>
            <FaBookOpen />
            {chapter ? 'Chỉnh sửa chương' : 'Thêm chương mới'}
          </ModalTitle>
          <CloseButton theme={theme} onClick={onClose} aria-label="Close">
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label theme={theme}>Tên chương *</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên chương"
                theme={theme}
              />
              {errors.name && <ErrorMessage theme={theme}>{errors.name}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme}>Mô tả</Label>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả về chương (không bắt buộc)"
                theme={theme}
              />
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme}>Thứ tự hiển thị *</Label>
              <Input
                type="number"
                name="orderIndex"
                value={formData.orderIndex}
                onChange={handleChange}
                min="1"
                theme={theme}
              />
              {errors.orderIndex && <ErrorMessage theme={theme}>{errors.orderIndex}</ErrorMessage>}
            </FormGroup>
            
            {chapter && (
              <FormGroup>
                <Checkbox theme={theme}>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <span>Kích hoạt chương</span>
                </Checkbox>
              </FormGroup>
            )}
          </form>
        </ModalBody>
        
        <ModalFooter theme={theme}>
          <CancelButton theme={theme} onClick={onClose}>
            <FaTimes /> Hủy
          </CancelButton>
          <SaveButton
            theme={theme}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <FaSave /> {isSubmitting ? 'Đang lưu...' : 'Lưu chương'}
          </SaveButton>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ChapterModal;