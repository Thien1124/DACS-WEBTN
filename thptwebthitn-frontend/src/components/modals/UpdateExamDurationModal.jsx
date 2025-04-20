import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaClock, FaCheck, FaTimes } from 'react-icons/fa';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 450px;
  padding: 1.5rem;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  cursor: pointer;
`;

const ExamInfo = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#3a4966' : '#f7fafc'};
  border-radius: 8px;
`;

const ExamTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const ExamDetail = styled.p`
  margin: 0.25rem 0;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 0.9rem;
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

const TimeInputContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const TimeInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 5px;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
  
  &::-webkit-inner-spin-button, 
  &::-webkit-outer-spin-button { 
    -webkit-appearance: none;
    margin: 0;
  }
  
  &[type=number] {
    -moz-appearance: textfield;
  }
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const TotalTime = styled.div`
  padding: 0.75rem;
  background-color: ${props => props.theme === 'dark' ? '#3a4966' : '#edf2f7'};
  border-radius: 5px;
  font-weight: 600;
  text-align: center;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
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
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.primary 
    ? 'linear-gradient(135deg, #4285f4, #34a853)' 
    : props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.primary ? '#ffffff' : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const UpdateExamDurationModal = ({ 
  show, 
  onClose, 
  theme, 
  exam, 
  onUpdateDuration 
}) => {
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (exam && exam.duration) {
      // Convert total minutes to minutes and seconds
      const totalMinutes = exam.duration;
      setMinutes(Math.floor(totalMinutes));
      setSeconds(Math.round((totalMinutes - Math.floor(totalMinutes)) * 60));
    }
  }, [exam]);

  if (!show || !exam) return null;

  const handleMinutesChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setMinutes(value);
      validateTime(value, seconds);
    }
  };

  const handleSecondsChange = (e) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) < 60)) {
      setSeconds(value);
      validateTime(minutes, value);
    }
  };

  const validateTime = (mins, secs) => {
    const minutesNum = mins === '' ? 0 : parseInt(mins);
    const secondsNum = secs === '' ? 0 : parseInt(secs);
    
    if (minutesNum === 0 && secondsNum === 0) {
      setError('Thời gian không thể bằng 0');
    } else if (minutesNum > 300) { // maximum 5 hours
      setError('Thời gian tối đa là 300 phút (5 giờ)');
    } else {
      setError('');
    }
  };

  const getTotalMinutes = () => {
    const minutesNum = minutes === '' ? 0 : parseInt(minutes);
    const secondsNum = seconds === '' ? 0 : parseInt(seconds);
    return minutesNum + (secondsNum / 60);
  };

  const getFormattedTime = () => {
    const minutesNum = minutes === '' ? 0 : parseInt(minutes);
    const secondsNum = seconds === '' ? 0 : parseInt(seconds);
    
    if (minutesNum === 0 && secondsNum === 0) return '0 phút';
    
    let result = '';
    
    if (minutesNum > 0) {
      result += `${minutesNum} phút`;
    }
    
    if (secondsNum > 0) {
      if (result) result += ' ';
      result += `${secondsNum} giây`;
    }
    
    return result;
  };

  const handleSubmit = () => {
    if (error) return;
    
    setIsLoading(true);
    
    const totalMinutes = getTotalMinutes();
    
    // Call API to update exam duration
    onUpdateDuration(exam.id, totalMinutes)
      .then(() => {
        setIsLoading(false);
        onClose();
      })
      .catch(err => {
        setIsLoading(false);
        setError(err.message || 'Có lỗi xảy ra khi cập nhật thời gian');
      });
  };

  return (
    <ModalOverlay>
      <ModalContainer theme={theme}>
        <ModalHeader>
          <ModalTitle theme={theme}>
            <FaClock /> Cập nhật thời gian làm bài
          </ModalTitle>
          <CloseButton theme={theme} onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <ExamInfo theme={theme}>
          <ExamTitle theme={theme}>{exam.title}</ExamTitle>
          <ExamDetail theme={theme}>Môn học: {exam.subject?.name || 'Không có'}</ExamDetail>
          <ExamDetail theme={theme}>Số câu hỏi: {exam.questionCount || exam.questions?.length || '0'}</ExamDetail>
          <ExamDetail theme={theme}>
            Thời gian hiện tại: <strong>{exam.duration} phút</strong>
          </ExamDetail>
        </ExamInfo>
        
        <FormGroup>
          <Label theme={theme}>Thời gian làm bài</Label>
          <TimeInputContainer>
            <div>
              <TimeInput
                type="number"
                placeholder="Phút"
                theme={theme}
                value={minutes}
                onChange={handleMinutesChange}
                min="0"
                max="300"
              />
              <small style={{ color: theme === 'dark' ? '#a0aec0' : '#718096' }}>Phút</small>
            </div>
            <div>
              <TimeInput
                type="number"
                placeholder="Giây"
                theme={theme}
                value={seconds}
                onChange={handleSecondsChange}
                min="0"
                max="59"
              />
              <small style={{ color: theme === 'dark' ? '#a0aec0' : '#718096' }}>Giây</small>
            </div>
          </TimeInputContainer>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <TotalTime theme={theme}>
            Tổng thời gian: {getFormattedTime()}
          </TotalTime>
        </FormGroup>
        
        <ButtonGroup>
          <Button theme={theme} onClick={onClose}>
            <FaTimes /> Hủy bỏ
          </Button>
          <Button 
            theme={theme} 
            primary 
            onClick={handleSubmit} 
            disabled={isLoading || !!error || (minutes === '' && seconds === '') || (parseInt(minutes || 0) === 0 && parseInt(seconds || 0) === 0)}
          >
            {isLoading ? 'Đang cập nhật...' : <><FaCheck /> Cập nhật</>}
          </Button>
        </ButtonGroup>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default UpdateExamDurationModal;