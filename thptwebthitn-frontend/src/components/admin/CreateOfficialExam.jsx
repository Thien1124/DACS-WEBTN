import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaCalendarAlt, FaClock, FaGraduationCap, 
  FaBook, FaSave, FaTimes 
} from 'react-icons/fa';
import { fetchAllSubjects } from '../../redux/subjectSlice';
import { createNewExam } from '../../redux/examSlice';
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
`;

const FormCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
  border: none;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#718096' : '#cbd5e0'};
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
  border: none;
  background-color: #4299e1;
  color: white;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: #3182ce;
  }
  
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #e53e3e;
  margin-top: 0.5rem;
  font-size: 0.875rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CreateOfficialExam = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  const { items: subjects, loading: loadingSubjects } = useSelector(state => state.subjects);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    grade: '10',
    subjectId: '',
    duration: 45,
    startTime: '',
    endTime: '',
    isOfficial: true,
    isActive: false,
    maxAttempts: 1
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load subjects when component mounts
  useEffect(() => {
    dispatch(fetchAllSubjects());
  }, [dispatch]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    }
    
    if (!formData.subjectId) {
      newErrors.subjectId = 'Vui lòng chọn môn học';
    }
    
    if (!formData.duration || formData.duration < 1) {
      newErrors.duration = 'Thời gian làm bài phải lớn hơn 0';
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'Vui lòng chọn thời gian bắt đầu';
    }
    
    if (!formData.endTime) {
      newErrors.endTime = 'Vui lòng chọn thời gian kết thúc';
    }
    
    // Check if end time is after start time
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      
      if (end <= start) {
        newErrors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const result = await dispatch(createNewExam(formData)).unwrap();
        showSuccessToast('Tạo kỳ thi chính thức thành công!');
        navigate(`/admin/exams/${result.id}/questions`);
      } catch (error) {
        showErrorToast(error?.message || 'Có lỗi xảy ra khi tạo kỳ thi');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleCancel = () => {
    navigate('/admin/exams');
  };
  
  return (
    <Container>
      <Header>
        <Title>Tạo Kỳ Thi Chính Thức</Title>
        <Subtitle>Thiết lập kỳ thi chính thức với nhiều môn học</Subtitle>
      </Header>
      
      <form onSubmit={handleSubmit}>
        <FormCard theme={theme}>
          <SectionTitle theme={theme}>
            <FaCalendarAlt /> Thông tin kỳ thi
          </SectionTitle>
          
          <FormGroup>
            <Label theme={theme}>Tiêu đề kỳ thi *</Label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="VD: Kỳ thi THPT Quốc gia 2023"
              theme={theme}
            />
            {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <Label theme={theme}>Mô tả</Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả ngắn về kỳ thi"
              theme={theme}
            />
          </FormGroup>
          
          <Grid>
            <FormGroup>
              <Label theme={theme}>Khối lớp *</Label>
              <Select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                theme={theme}
              >
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
                <option value="12">Khối 12</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme}>Môn thi *</Label>
              <Select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
                theme={theme}
                disabled={loadingSubjects}
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
          </Grid>
          
          <SectionTitle theme={theme}>
            <FaClock /> Thời gian
          </SectionTitle>
          
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
              <Label theme={theme}>Số lần làm tối đa</Label>
              <Input
                type="number"
                name="maxAttempts"
                value={formData.maxAttempts}
                onChange={handleChange}
                min="1"
                theme={theme}
              />
            </FormGroup>
          </Grid>
          
          <Grid>
            <FormGroup>
              <Label theme={theme}>Thời gian bắt đầu *</Label>
              <Input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                theme={theme}
              />
              {errors.startTime && <ErrorMessage>{errors.startTime}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme}>Thời gian kết thúc *</Label>
              <Input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                theme={theme}
              />
              {errors.endTime && <ErrorMessage>{errors.endTime}</ErrorMessage>}
            </FormGroup>
          </Grid>
          
          <ButtonContainer>
            <CancelButton 
              type="button" 
              onClick={handleCancel}
              theme={theme}
            >
              <FaTimes /> Hủy bỏ
            </CancelButton>
            <SubmitButton 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang tạo...' : <><FaSave /> Tạo kỳ thi</>}
            </SubmitButton>
          </ButtonContainer>
        </FormCard>
      </form>
    </Container>
  );
};

export default CreateOfficialExam;