import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { createChapter } from '../../services/chapterService';
import { getSubjects } from '../../services/subjectService';
import { FaSave, FaTimes } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';

const Container = styled.div`
  padding: 2rem;
`;

const PageTitle = styled.h1`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 2rem;
`;

const Form = styled.form`
  background: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 1px #3182ce;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 1px #3182ce;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 1px #3182ce;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SaveButton = styled(Button)`
  background-color: #3182ce;
  color: white;
  border: none;
  
  &:hover {
    background-color: #2b6cb0;
  }
  
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  border: none;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#718096' : '#cbd5e0'};
  }
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  margin-top: 0.5rem;
`;

const CreateChapter = () => {
  const theme = useSelector(state => state.ui.theme);
  const navigate = useNavigate();
  const { subjectId } = useParams(); // Nếu route có params subjectId
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    orderIndex: 1,
    subjectId: subjectId || ''
  });
  
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Load danh sách môn học
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await getSubjects();
        if (response && Array.isArray(response.items)) {
          setSubjects(response.items);
        } else if (response && Array.isArray(response)) {
          setSubjects(response);
        } else {
          setSubjects([]);
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
        setError('Không thể tải danh sách môn học');
      }
    };
    
    fetchSubjects();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'orderIndex' || name === 'subjectId' 
        ? parseInt(value) || value
        : value
    }));
  };
  
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Vui lòng nhập tên chương');
      return false;
    }
    
    if (!formData.subjectId) {
      setError('Vui lòng chọn môn học');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await createChapter({
        name: formData.name.trim(),
        description: formData.description.trim(),
        orderIndex: parseInt(formData.orderIndex) || 1,
        subjectId: parseInt(formData.subjectId)
      });
      
      // Redirect sau khi tạo thành công
      navigate(subjectId 
        ? `/admin/subjects/${subjectId}/chapters` 
        : '/admin/chapters'
      );
    } catch (err) {
      console.error('Error creating chapter:', err);
      setError(err.response?.data?.message || 'Không thể tạo chương. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container>
      <PageTitle theme={theme}>Thêm chương mới</PageTitle>
      
      <Form theme={theme} onSubmit={handleSubmit}>
        <FormGroup>
          <Label theme={theme} htmlFor="subjectId">Môn học *</Label>
          <Select
            theme={theme}
            id="subjectId"
            name="subjectId"
            value={formData.subjectId}
            onChange={handleChange}
            disabled={!!subjectId}
            required
          >
            <option value="">-- Chọn môn học --</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </Select>
          {formSubmitted && !formData.subjectId && (
            <ErrorMessage>Vui lòng chọn môn học</ErrorMessage>
          )}
        </FormGroup>
        
        <FormGroup>
          <Label theme={theme} htmlFor="name">Tên chương *</Label>
          <Input
            theme={theme}
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập tên chương"
            required
          />
          {formSubmitted && !formData.name.trim() && (
            <ErrorMessage>Vui lòng nhập tên chương</ErrorMessage>
          )}
        </FormGroup>
        
        <FormGroup>
          <Label theme={theme} htmlFor="description">Mô tả</Label>
          <TextArea
            theme={theme}
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Nhập mô tả chương (tùy chọn)"
          />
        </FormGroup>
        
        <FormGroup>
          <Label theme={theme} htmlFor="orderIndex">Thứ tự</Label>
          <Input
            theme={theme}
            id="orderIndex"
            name="orderIndex"
            type="number"
            min="1"
            value={formData.orderIndex}
            onChange={handleChange}
            placeholder="Vị trí hiển thị của chương"
          />
        </FormGroup>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <ButtonGroup>
          <CancelButton
            theme={theme}
            type="button"
            onClick={() => navigate(subjectId 
              ? `/admin/subjects/${subjectId}/chapters` 
              : '/admin/chapters'
            )}
          >
            <FaTimes /> Hủy
          </CancelButton>
          <SaveButton
            type="submit"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size={18} /> : <FaSave />} 
            {loading ? 'Đang lưu...' : 'Lưu'}
          </SaveButton>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

export default CreateChapter;