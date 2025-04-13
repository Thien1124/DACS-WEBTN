import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaSave, FaTimes, FaPlus, FaTrash, FaUpload, FaCheck } from 'react-icons/fa';
import { createQuestion } from '../../services/questionService';
import { fetchAllSubjectsNoPaging } from '../../redux/subjectSlice';
import { showErrorToast, showSuccessToast } from '../../utils/toastUtils';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 1.1rem;
`;

const FormCard = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  min-height: 150px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const OptionsList = styled.div`
  margin-bottom: 1.5rem;
`;

const OptionItem = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? props.isCorrect ? '#2c4c3e' : '#2d3748' : props.isCorrect ? '#f0fff4' : '#ffffff'};
  position: relative;
`;

const OptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const OptionLabel = styled.div`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
`;

const OptionActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background-color: ${props => {
    if (props.remove) return '#f56565';
    if (props.correct) return props.isActive ? '#48bb78' : '#cbd5e0';
    return '#cbd5e0';
  }};
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    background-color: ${props => {
      if (props.remove) return '#e53e3e';
      if (props.correct) return props.isActive ? '#38a169' : '#a0aec0';
      return '#a0aec0';
    }};
  }
`;

const AddOptionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  border: 2px dashed ${props => props.theme === 'dark' ? '#718096' : '#cbd5e0'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a556899' : '#e2e8f0'};
  }
`;

const ErrorMessage = styled.p`
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ImageUploadContainer = styled.div`
  margin-top: 0.5rem;
`;

const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  margin-top: 0.5rem;
  display: ${props => props.src ? 'block' : 'none'};
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a556899' : '#e2e8f0'};
  }
`;

const FileInput = styled.input`
  display: none;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const CancelButton = styled(Button)`
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  border: none;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#cbd5e0'};
  }
`;

const SaveButton = styled(Button)`
  background: linear-gradient(135deg, #4285f4, #34a853);
  color: white;
  border: none;
  
  &:hover {
    background: linear-gradient(135deg, #3b78e7, #2e9549);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const CreateQuestion = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { subjects } = useSelector(state => state.subjects);
  const { theme } = useSelector(state => state.ui);
  
  const [formData, setFormData] = useState({
    content: '',
    subjectId: '',
    difficulty: 'medium',
    options: [
      { content: '', isCorrect: true },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false }
    ],
    explanation: '',
    imageUrl: null,
    imageFile: null
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  
  useEffect(() => {
    dispatch(fetchAllSubjectsNoPaging());
  }, [dispatch]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleOptionChange = (index, content) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], content };
    
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
    
    // Clear option errors
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
  
  const handleAddOption = () => {
    if (formData.options.length < 8) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, { content: '', isCorrect: false }]
      }));
    } else {
      showErrorToast('Tối đa 8 đáp án cho một câu hỏi!');
    }
  };
  
  const handleRemoveOption = (index) => {
    if (formData.options.length <= 2) {
      showErrorToast('Cần ít nhất 2 đáp án cho một câu hỏi!');
      return;
    }
    
    const newOptions = formData.options.filter((_, i) => i !== index);
    
    // If the correct option is removed, set the first option as correct
    const hasCorrect = newOptions.some(opt => opt.isCorrect);
    if (!hasCorrect) {
      newOptions[0].isCorrect = true;
    }
    
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));
    }
  };
  
  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      imageFile: null,
      imageUrl: null
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.content || formData.content.trim() === '') {
      newErrors.content = 'Vui lòng nhập nội dung câu hỏi';
    }
    
    if (!formData.subjectId) {
      newErrors.subjectId = 'Vui lòng chọn môn học';
    }
    
    // Check options
    const hasCorrectOption = formData.options.some(option => option.isCorrect);
    if (!hasCorrectOption) {
      newErrors.options = 'Vui lòng chọn ít nhất một đáp án đúng';
    }
    
    formData.options.forEach((option, index) => {
      if (!option.content.trim()) {
        newErrors[`option_${index}`] = 'Vui lòng nhập nội dung đáp án';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Format data for API
      const questionData = new FormData();
      questionData.append('content', formData.content);
      questionData.append('subjectId', formData.subjectId);
      questionData.append('difficulty', formData.difficulty);
      
      if (formData.explanation) {
        questionData.append('explanation', formData.explanation);
      }
      
      if (formData.imageFile) {
        questionData.append('image', formData.imageFile);
      }
      
      // Add options as JSON string
      questionData.append('options', JSON.stringify(formData.options));
      
      const response = await createQuestion(questionData);
      
      showSuccessToast('Tạo câu hỏi thành công!');
      navigate('/admin/questions');
    } catch (error) {
      showErrorToast(`Lỗi khi tạo câu hỏi: ${error.message || 'Vui lòng thử lại'}`);
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/admin/questions');
  };
  
  const fileInputRef = React.createRef();
  
  return (
    <Container>
      <Header>
        <Title theme={theme}>Tạo câu hỏi mới</Title>
        <Subtitle theme={theme}>Thiết kế câu hỏi và các đáp án</Subtitle>
      </Header>
      
      <form onSubmit={handleSubmit}>
        <FormCard
          theme={theme}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FormGroup>
            <Label theme={theme}>Nội dung câu hỏi *</Label>
            <TextArea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Nhập nội dung câu hỏi"
              theme={theme}
            />
            {errors.content && <ErrorMessage>{errors.content}</ErrorMessage>}
            
            <ImageUploadContainer>
              {imagePreview ? (
                <>
                  <ImagePreview src={imagePreview} alt="Preview" />
                  <Button type="button" onClick={removeImage} style={{ marginTop: '0.5rem' }}>
                    <FaTrash /> Xóa ảnh
                  </Button>
                </>
              ) : (
                <UploadButton theme={theme} type="button" onClick={() => fileInputRef.current.click()}>
                  <FaUpload /> Tải lên hình ảnh
                </UploadButton>
              )}
              <FileInput
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </ImageUploadContainer>
          </FormGroup>
          
          <Grid>
            <FormGroup>
              <Label theme={theme}>Môn học *</Label>
              <Select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
                theme={theme}
              >
                <option value="">-- Chọn môn học --</option>
                {subjects?.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </Select>
              {errors.subjectId && <ErrorMessage>{errors.subjectId}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme}>Mức độ khó *</Label>
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
          </Grid>
          
          <FormGroup>
            <Label theme={theme}>Đáp án *</Label>
            {errors.options && <ErrorMessage>{errors.options}</ErrorMessage>}
            
            <OptionsList>
              {formData.options.map((option, index) => (
                <OptionItem 
                  key={index} 
                  theme={theme} 
                  isCorrect={option.isCorrect}
                >
                  <OptionHeader>
                    <OptionLabel theme={theme}>
                      Đáp án {String.fromCharCode(65 + index)}
                      {option.isCorrect && (
                        <span style={{ marginLeft: '8px', color: '#48bb78' }}>
                          (Đúng)
                        </span>
                      )}
                    </OptionLabel>
                    <OptionActions>
                      <ActionButton
                        type="button"
                        correct
                        isActive={option.isCorrect}
                        onClick={() => handleCorrectOption(index)}
                        title="Đánh dấu là đáp án đúng"
                      >
                        <FaCheck />
                      </ActionButton>
                      <ActionButton
                        type="button"
                        remove
                        onClick={() => handleRemoveOption(index)}
                        title="Xóa đáp án"
                      >
                        <FaTrash />
                      </ActionButton>
                    </OptionActions>
                  </OptionHeader>
                  
                  <Input
                    type="text"
                    value={option.content}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Nội dung đáp án ${String.fromCharCode(65 + index)}`}
                    theme={theme}
                  />
                  {errors[`option_${index}`] && (
                    <ErrorMessage>{errors[`option_${index}`]}</ErrorMessage>
                  )}
                </OptionItem>
              ))}
            </OptionsList>
            
            <AddOptionButton 
              type="button"
              onClick={handleAddOption}
              theme={theme}
            >
              <FaPlus /> Thêm đáp án
            </AddOptionButton>
          </FormGroup>
          
          <FormGroup>
            <Label theme={theme}>Giải thích đáp án</Label>
            <TextArea
              name="explanation"
              value={formData.explanation}
              onChange={handleChange}
              placeholder="Nhập giải thích cho đáp án (tùy chọn)"
              theme={theme}
            />
          </FormGroup>
          
          <ButtonContainer>
            <CancelButton theme={theme} type="button" onClick={handleCancel}>
              <FaTimes />
              Hủy bỏ
            </CancelButton>
            <SaveButton type="submit" disabled={isSubmitting}>
              <FaSave />
              {isSubmitting ? 'Đang lưu...' : 'Lưu câu hỏi'}
            </SaveButton>
          </ButtonContainer>
        </FormCard>
      </form>
    </Container>
  );
};

export default CreateQuestion;