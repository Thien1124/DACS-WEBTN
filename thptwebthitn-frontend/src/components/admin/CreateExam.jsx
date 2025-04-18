import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { createNewExam } from '../../redux/examSlice';
import { fetchAllSubjectsNoPaging } from '../../redux/subjectSlice';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';

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

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  min-height: 100px;
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

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
  width: 18px;
  height: 18px;
  accent-color: #4299e1;
`;

const CheckboxLabel = styled.label`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  user-select: none;
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

const SubmitButton = styled(Button)`
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ErrorMessage = styled.p`
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const CreateExam = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { theme } = useSelector(state => state.ui);
  const { items: subjectsData = [], loading: subjectsLoading } = useSelector(state => state.subjects);
  const subjects = Array.isArray(subjectsData) ? subjectsData : [];
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    duration: 60,
    difficulty: 'medium',
    isPublic: true,
    instructions: 'Hãy đọc kỹ câu hỏi và chọn đáp án đúng.',
    passingScore: 5
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    console.log('Component mounted, dispatching subject fetch action');
    dispatch(fetchAllSubjectsNoPaging());
  }, [dispatch]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tên đề thi';
    }
    
    if (!formData.subjectId) {
      newErrors.subjectId = 'Vui lòng chọn môn học';
    }
    
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Thời gian làm bài phải lớn hơn 0';
    }
    
    if (!formData.passingScore || formData.passingScore < 0 || formData.passingScore > 10) {
      newErrors.passingScore = 'Điểm đạt phải từ 0 đến 10';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      dispatch(createNewExam(formData))
        .then((result) => {
          if (result.meta.requestStatus === 'fulfilled') {
            showSuccessToast('Tạo đề thi thành công!');
            navigate('/admin/exams');
          } else if (result.meta.requestStatus === 'rejected') {
            showErrorToast(result.payload || 'Có lỗi xảy ra khi tạo đề thi');
          }
        })
        .catch((error) => {
          showErrorToast(error.message || 'Có lỗi xảy ra khi tạo đề thi');
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };
  
  const handleCancel = () => {
    navigate('/admin/exams');
  };
  
  return (
    <Container>
      <Header>
        <Title theme={theme}>Tạo đề thi mới</Title>
        <Subtitle theme={theme}>Nhập thông tin cơ bản cho đề thi</Subtitle>
      </Header>
      
      <form onSubmit={handleSubmit}>
        <FormCard 
          theme={theme}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Grid>
            <FormGroup>
              <Label theme={theme}>Tên đề thi *</Label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Nhập tên đề thi"
                theme={theme}
              />
              {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme}>Môn học * {subjectsLoading ? '(Đang tải...)' : `(${subjects.length} môn học)`}</Label>
              <Select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
                theme={theme}
              >
                <option value="">-- Chọn môn học --</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </Select>
              {errors.subjectId && <ErrorMessage>{errors.subjectId}</ErrorMessage>}
            </FormGroup>
          </Grid>
          
          <FormGroup>
            <Label theme={theme}>Mô tả đề thi</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả ngắn về đề thi"
              theme={theme}
            />
          </FormGroup>
          
          <Grid>
            <FormGroup>
              <Label theme={theme}>Thời gian làm bài (phút) *</Label>
              <Input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="1"
                theme={theme}
              />
              {errors.duration && <ErrorMessage>{errors.duration}</ErrorMessage>}
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
          
          <Grid>
            <FormGroup>
              <Label theme={theme}>Điểm đạt</Label>
              <Input
                type="number"
                name="passingScore"
                value={formData.passingScore}
                onChange={handleChange}
                min="0"
                max="10"
                step="0.1"
                theme={theme}
              />
              {errors.passingScore && <ErrorMessage>{errors.passingScore}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme}>Hướng dẫn làm bài</Label>
              <Input
                type="text"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Hướng dẫn làm bài thi"
                theme={theme}
              />
            </FormGroup>
          </Grid>
          
          <FormGroup>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
              />
              <CheckboxLabel theme={theme}>
                Công khai đề thi (học sinh có thể làm bài)
              </CheckboxLabel>
            </CheckboxContainer>
          </FormGroup>
          
          <ButtonContainer>
            <CancelButton 
              type="button" 
              onClick={handleCancel}
              theme={theme}
            >
              Hủy bỏ
            </CancelButton>
            <SubmitButton 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang tạo...' : 'Tạo đề thi'}
            </SubmitButton>
          </ButtonContainer>
        </FormCard>
      </form>
    </Container>
  );
};

export default CreateExam;