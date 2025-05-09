import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, FaCalendarAlt, FaClock, FaEdit, 
  FaGraduationCap, FaInfoCircle, FaSave, FaAlignLeft
} from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import apiClient from '../../services/apiClient';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import LoadingSpinner from '../common/LoadingSpinner';

// Main container
const Container = styled.div`
  padding: 2rem;
  min-height: 100vh;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(180deg, #1a202c 0%, #171923 100%)' 
    : 'linear-gradient(180deg, #f7fafc 0%, #edf2f7 100%)'};
`;

// Header with navigation
const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#edf2f7'};
  }
`;

// Form card
const Card = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  max-width: 800px;
  margin: 0 auto;
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

// Form elements
const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 0.95rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 0.5rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  }
  
  &::placeholder {
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#a0aec0'};
  }
  
  &:disabled {
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
    cursor: not-allowed;
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 0.5rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  }
  
  &::placeholder {
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#a0aec0'};
  }
`;

const DatePickerWrapper = styled.div`
  position: relative;
  
  .react-datepicker-wrapper {
    width: 100%;
  }
  
  .react-datepicker__input-container input {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
    border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
    border-radius: 0.5rem;
    background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
  
  .react-datepicker {
    font-size: 0.9rem;
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
    border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  
  .react-datepicker__header {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#f7fafc'};
    border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  }
  
  .react-datepicker__current-month,
  .react-datepicker__day-name {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  }
  
  .react-datepicker__day {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
  
  .react-datepicker__day:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  }
  
  .react-datepicker__day--selected {
    background-color: #4299e1;
    color: white;
  }
  
  .react-datepicker__time-container {
    border-left: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  }
  
  .react-datepicker__time-container .react-datepicker__time {
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  }
  
  .react-datepicker__time-container .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
  
  .react-datepicker__time-container .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  }
  
  .react-datepicker__time-container .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected {
    background-color: #4299e1;
    color: white;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 0.5rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  }
`;

const FormCheckbox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  input[type="checkbox"] {
    width: 1.2rem;
    height: 1.2rem;
    cursor: pointer;
  }
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  font-size: 0.85rem;
  margin-top: 0.25rem;
`;

// Action buttons
const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background-color: #4299e1;
    color: white;
    
    &:hover {
      background-color: #3182ce;
    }
    
    &:disabled {
      background-color: #a0aec0;
      cursor: not-allowed;
    }
  }
  
  &.secondary {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
    
    &:hover {
      background-color: ${props => props.theme === 'dark' ? '#718096' : '#cbd5e0'};
    }
  }
`;

// Loading state
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  
  h3 {
    margin-top: 1.5rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
`;

const EditOfficialExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [examDetail, setExamDetail] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(),
    classroomName: '',
    isActive: true
  });
  
  // Grade options
  const gradeOptions = [
    { id: '10', name: 'Khối 10' },
    { id: '11', name: 'Khối 11' },
    { id: '12', name: 'Khối 12' }
  ];
  
  useEffect(() => {
    fetchExamDetail();
  }, [id]);
  
  const fetchExamDetail = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/official-exams/${id}`);
      setExamDetail(response.data);
      
      // Initialize form data with current values
      setFormData({
        title: response.data.title || '',
        description: response.data.description || '',
        startTime: response.data.startTime ? new Date(response.data.startTime) : new Date(),
        endTime: response.data.endTime ? new Date(response.data.endTime) : new Date(),
        classroomName: response.data.classroomName || '',
        isActive: response.data.isActive !== undefined ? response.data.isActive : true
      });
    } catch (error) {
      console.error('Error fetching exam detail:', error);
      showErrorToast('Không thể tải thông tin kỳ thi');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
    
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề không được để trống';
    }
    
    if (!formData.classroomName) {
      newErrors.classroomName = 'Vui lòng chọn khối lớp';
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
      setSubmitting(true);
      
      try {
        // Format the data for API submission
        const apiData = {
          title: formData.title.trim(),
          description: formData.description || '',
          startTime: formData.startTime.toISOString(),
          endTime: formData.endTime.toISOString(),
          classroomName: formData.classroomName,
          isActive: formData.isActive
        };
        
        await apiClient.patch(`/api/official-exams/${id}`, apiData);
        showSuccessToast('Cập nhật kỳ thi thành công');
        navigate(`/admin/official-exams/${id}`);
      } catch (error) {
        console.error('Error updating exam:', error);
        
        // Handle validation errors from API
        if (error.response?.data?.errors) {
          const apiErrors = {};
          const errorDetails = error.response.data.errors;
          
          Object.keys(errorDetails).forEach(key => {
            apiErrors[key] = errorDetails[key].join(', ');
          });
          
          setErrors(apiErrors);
        } else {
          showErrorToast('Không thể cập nhật kỳ thi');
        }
      } finally {
        setSubmitting(false);
      }
    }
  };
  
  const handleCancel = () => {
    navigate(`/admin/official-exams/${id}`);
  };
  
  if (loading) {
    return (
      <Container theme={theme}>
        <Header>
          <BackButton 
            theme={theme}
            onClick={() => navigate(`/admin/official-exams/${id}`)}
          >
            <FaArrowLeft /> Quay lại chi tiết
          </BackButton>
        </Header>
        
        <LoadingContainer theme={theme}>
          <LoadingSpinner size={60} />
          <h3>Đang tải thông tin kỳ thi</h3>
        </LoadingContainer>
      </Container>
    );
  }
  
  if (!examDetail) {
    return (
      <Container theme={theme}>
        <Header>
          <BackButton 
            theme={theme}
            onClick={() => navigate('/admin/official-exams')}
          >
            <FaArrowLeft /> Quay lại danh sách
          </BackButton>
        </Header>
        
        <Card theme={theme}>
          <CardBody>
            <p style={{ textAlign: 'center', padding: '2rem' }}>
              Không tìm thấy thông tin kỳ thi
            </p>
          </CardBody>
        </Card>
      </Container>
    );
  }
  
  return (
    <Container theme={theme}>
      <Header>
        <BackButton 
          theme={theme}
          onClick={() => navigate(`/admin/official-exams/${id}`)}
        >
          <FaArrowLeft /> Quay lại chi tiết
        </BackButton>
      </Header>
      
      <Card 
        theme={theme}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CardHeader theme={theme}>
          <CardTitle theme={theme}>
            <FaEdit /> Chỉnh sửa kỳ thi
          </CardTitle>
        </CardHeader>
        
        <CardBody>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <FormLabel theme={theme}>
                <FaInfoCircle /> Tiêu đề kỳ thi
              </FormLabel>
              <FormInput
                theme={theme}
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Nhập tiêu đề kỳ thi"
              />
              {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <FormLabel theme={theme}>
                <FaAlignLeft /> Mô tả (không bắt buộc)
              </FormLabel>
              <FormTextarea
                theme={theme}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Nhập mô tả cho kỳ thi"
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel theme={theme}>
                <FaGraduationCap /> Khối lớp
              </FormLabel>
              <FormSelect
                theme={theme}
                name="classroomName"
                value={formData.classroomName}
                onChange={handleInputChange}
              >
                <option value="">Chọn khối lớp</option>
                {gradeOptions.map(grade => (
                  <option key={grade.id} value={grade.name}>
                    {grade.name}
                  </option>
                ))}
              </FormSelect>
              {errors.classroomName && <ErrorMessage>{errors.classroomName}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <FormLabel theme={theme}>
                <FaCalendarAlt /> Thời gian bắt đầu
              </FormLabel>
              <DatePickerWrapper theme={theme}>
                <DatePicker
                  selected={formData.startTime}
                  onChange={(date) => handleDateChange(date, 'startTime')}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy HH:mm"
                  placeholderText="Chọn thời gian bắt đầu"
                />
              </DatePickerWrapper>
              {errors.startTime && <ErrorMessage>{errors.startTime}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <FormLabel theme={theme}>
                <FaClock /> Thời gian kết thúc
              </FormLabel>
              <DatePickerWrapper theme={theme}>
                <DatePicker
                  selected={formData.endTime}
                  onChange={(date) => handleDateChange(date, 'endTime')}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="dd/MM/yyyy HH:mm"
                  placeholderText="Chọn thời gian kết thúc"
                />
              </DatePickerWrapper>
              {errors.endTime && <ErrorMessage>{errors.endTime}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <FormCheckbox>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  id="isActive"
                />
                <FormLabel theme={theme} htmlFor="isActive" style={{ margin: 0 }}>
                  Kích hoạt kỳ thi
                </FormLabel>
              </FormCheckbox>
              <div style={{ fontSize: '0.85rem', color: theme === 'dark' ? '#a0aec0' : '#718096', marginTop: '0.25rem' }}>
                Kỳ thi sẽ chỉ hiển thị cho học sinh khi được kích hoạt
              </div>
            </FormGroup>
            
            <ButtonContainer>
              <Button
                type="submit"
                className="primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size={16} /> Đang lưu...
                  </>
                ) : (
                  <>
                    <FaSave /> Lưu thay đổi
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                className="secondary"
                theme={theme}
                onClick={handleCancel}
                disabled={submitting}
              >
                Hủy
              </Button>
            </ButtonContainer>
          </form>
        </CardBody>
      </Card>
    </Container>
  );
};

export default EditOfficialExam;