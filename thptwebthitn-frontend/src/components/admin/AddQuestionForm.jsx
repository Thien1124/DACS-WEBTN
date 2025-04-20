import React, { useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { FaCheck, FaTrash, FaSave } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';

const AddQuestionForm = ({ onSubmit, onCancel }) => {
  const { theme } = useSelector(state => state.ui);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    content: '',
    options: [
      { content: '', isCorrect: true },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false }
    ],
    difficulty: 'medium'
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index].content = value;
    
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
    
    // Clear option error when user types
    if (errors[`option_${index}`]) {
      setErrors(prev => ({ ...prev, [`option_${index}`]: '' }));
    }
  };
  
  const handleCorrectOption = (index) => {
    const newOptions = formData.options.map((option, i) => ({
      ...option,
      isCorrect: i === index
    }));
    
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validate content
    if (!formData.content.trim()) {
      newErrors.content = 'Vui lòng nhập nội dung câu hỏi';
    }
    
    // Validate options
    let hasEmptyOption = false;
    formData.options.forEach((option, index) => {
      if (!option.content.trim()) {
        newErrors[`option_${index}`] = 'Vui lòng nhập đáp án';
        hasEmptyOption = true;
      }
    });
    
    if (hasEmptyOption) {
      newErrors.options = 'Vui lòng nhập đầy đủ các đáp án';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      showSuccessToast('Thêm câu hỏi thành công!');
    } catch (error) {
      showErrorToast(`Lỗi khi thêm câu hỏi: ${error.message || 'Vui lòng thử lại'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer theme={theme}>
      <FormHeader>
        <FormTitle theme={theme}>Thêm câu hỏi mới</FormTitle>
      </FormHeader>
      
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label theme={theme}>Nội dung câu hỏi *</Label>
          <TextArea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Nhập nội dung câu hỏi"
            theme={theme}
            rows={4}
          />
          {errors.content && <ErrorMessage>{errors.content}</ErrorMessage>}
        </FormGroup>
        
        <OptionsContainer>
          <Label theme={theme}>Đáp án *</Label>
          {errors.options && <ErrorMessage>{errors.options}</ErrorMessage>}
          
          {formData.options.map((option, index) => (
            <OptionRow key={index} theme={theme}>
              <RadioContainer>
                <RadioInput
                  type="radio"
                  name="correctOption"
                  checked={option.isCorrect}
                  onChange={() => handleCorrectOption(index)}
                  id={`option_${index}`}
                />
                <RadioLabel htmlFor={`option_${index}`} theme={theme}>
                  {option.isCorrect && <FaCheck />}
                </RadioLabel>
              </RadioContainer>
              
              <OptionInput
                type="text"
                value={option.content}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Đáp án ${index + 1}`}
                theme={theme}
              />
              
              {errors[`option_${index}`] && (
                <OptionError>{errors[`option_${index}`]}</OptionError>
              )}
            </OptionRow>
          ))}
        </OptionsContainer>
        
        <FormGroup>
          <Label theme={theme}>Độ khó</Label>
          <Select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            theme={theme}
          >
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </Select>
        </FormGroup>
        
        <ButtonGroup>
          <CancelButton 
            type="button" 
            onClick={onCancel}
            theme={theme}
          >
            <FaTrash /> Hủy bỏ
          </CancelButton>
          <SubmitButton 
            type="submit" 
            disabled={isSubmitting}
          >
            <FaSave /> {isSubmitting ? 'Đang lưu...' : 'Lưu câu hỏi'}
          </SubmitButton>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};

// Styled Components
const FormContainer = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const FormHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const FormTitle = styled.h2`
  font-size: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin: 0;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 4px;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 4px;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
  }
`;

const OptionsContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const OptionRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f7fafc'};
`;

const RadioContainer = styled.div`
  margin-right: 1rem;
  position: relative;
`;

const RadioInput = styled.input`
  opacity: 0;
  position: absolute;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${props => props.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
  cursor: pointer;
  color: #fff;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  }
  
  ${RadioInput}:checked + & {
    background-color: #4285f4;
    border-color: #4285f4;
  }
`;

const OptionInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 4px;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
  }
`;

const OptionError = styled.div`
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  margin-left: 0.5rem;
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }
`;

const CancelButton = styled(Button)`
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  border: none;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#cbd5e0'};
  }
`;

const SubmitButton = styled(Button)`
  background-color: #4285f4;
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: #3367d6;
  }
`;

export default AddQuestionForm;