import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaBell, FaCalendarAlt, FaTimesCircle, FaArrowRight } from 'react-icons/fa';

const ReminderContainer = styled.div`
  width: 100%;
  padding: 12px 20px;
  background: ${props => props.theme === 'dark' ? 'linear-gradient(90deg, #2d3748 0%, #1a365d 100%)' : 'linear-gradient(90deg, #ebf8ff 0%, #bee3f8 100%)'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2c5282'};
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: ${props => props.visible ? 'flex' : 'none'};
  align-items: center;
  justify-content: space-between;
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ReminderContent = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

const IconWrapper = styled.div`
  font-size: 1.8rem;
  margin-right: 15px;
  color: ${props => props.theme === 'dark' ? '#90cdf4' : '#3182ce'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ReminderText = styled.div`
  flex: 1;
`;

const ReminderTitle = styled.div`
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 4px;
`;

const ReminderInfo = styled.div`
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const CountdownText = styled.span`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#fc8181' : '#e53e3e'};
`;

const DateInfo = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const TimeInfo = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ReminderActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: ${props => props.isMobile ? '10px' : '0'};

  @media (max-width: 768px) {
    margin-top: 10px;
    width: 100%;
    justify-content: space-between;
  }
`;

const ViewDetailsButton = styled(Link)`
  background-color: ${props => props.theme === 'dark' ? '#4299e1' : '#3182ce'};
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#3182ce' : '#2b6cb0'};
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
`;

const ExamReminderBanner = ({ exam, theme = 'light', onClose }) => {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    // Check if we should show the reminder
    if (exam && exam.examDate) {
      setVisible(true);
      updateCountdown();
      const timer = setInterval(updateCountdown, 60000); // Update every minute
      
      return () => clearInterval(timer);
    }
    
    // Handle responsive design
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [exam]);

  const updateCountdown = () => {
    if (!exam || !exam.examDate) return;
    
    const now = new Date();
    const examDate = new Date(exam.examDate);
    const diffTime = examDate - now;
    
    if (diffTime <= 0) {
      setVisible(false);
      return;
    }
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      setCountdown(`${diffDays} ngày ${diffHours} giờ`);
    } else {
      setCountdown(`${diffHours} giờ`);
    }
  };

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose(exam.id);
  };

  // Format dates for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  if (!exam) return null;

  return (
    <ReminderContainer theme={theme} visible={visible}>
      <ReminderContent>
        <IconWrapper theme={theme}>
          <FaBell />
        </IconWrapper>
        <ReminderText>
          <ReminderTitle>Sắp đến kỳ thi: {exam.name}</ReminderTitle>
          <ReminderInfo>
            <CountdownText theme={theme}>Còn {countdown}</CountdownText>
            <DateInfo>
              <FaCalendarAlt size={14} /> {formatDate(exam.examDate)}
            </DateInfo>
            <TimeInfo>
              <span>⏱️</span> {formatTime(exam.examDate)}
            </TimeInfo>
          </ReminderInfo>
        </ReminderText>
      </ReminderContent>
      
      <ReminderActions isMobile={isMobile}>
        <ViewDetailsButton to={`/exam/${exam.id}`} theme={theme}>
          Xem chi tiết <FaArrowRight size={12} />
        </ViewDetailsButton>
        <CloseButton onClick={handleClose} theme={theme}>
          <FaTimesCircle />
        </CloseButton>
      </ReminderActions>
    </ReminderContainer>
  );
};

export default ExamReminderBanner;