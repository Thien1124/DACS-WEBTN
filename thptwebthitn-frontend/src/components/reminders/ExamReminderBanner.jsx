import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaBook, FaTimes, FaArrowRight, FaBell, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(229, 62, 62, 0); }
  100% { box-shadow: 0 0 0 0 rgba(229, 62, 62, 0); }
`;

const slideIn = keyframes`
  from { transform: translateY(-100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const BannerContainer = styled.div`
  position: relative;
  background: ${props => props.theme === 'dark' ? '#2D3748' : '#fff'};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16);
  display: flex;
  flex-direction: column;
  animation: ${slideIn} 0.5s ease-out forwards;
  overflow: hidden;
  border: 1px solid ${props => props.theme === 'dark' ? '#4A5568' : '#E2E8F0'};
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background: linear-gradient(to bottom, #E53E3E, #F56565);
  }

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const BannerHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const IconContainer = styled.div`
  background: #FED7D7;
  color: #E53E3E;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  animation: ${pulse} 2s infinite;
`;

const BannerTitle = styled.h3`
  color: ${props => props.theme === 'dark' ? '#F7FAFC' : '#1A202C'};
  margin: 0;
  font-size: 1.2rem;
  flex: 1;
  font-weight: 600;
`;

const BannerContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-left: 57px; // Align with title (icon width + margin)
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.theme === 'dark' ? '#CBD5E0' : '#4A5568'};
  font-size: 0.95rem;
  background: ${props => props.theme === 'dark' ? '#3a3f4b' : '#F7FAFC'};
  padding: 8px 15px;
  border-radius: 6px;
  
  svg {
    margin-right: 8px;
    color: ${props => props.emphasis ? '#E53E3E' : props.theme === 'dark' ? '#90CDF4' : '#4299E1'};
  }
  
  span {
    font-weight: ${props => props.emphasis ? '600' : '400'};
    color: ${props => props.emphasis && (props.theme === 'dark' ? '#FEB2B2' : '#E53E3E')};
  }
`;

const CountdownContainer = styled.div`
  background: ${props => props.theme === 'dark' ? '#2D3748' : '#FEF5F5'};
  border: 1px solid ${props => props.theme === 'dark' ? '#4A5568' : '#FED7D7'};
  border-radius: 8px;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  margin-top: 12px;
  margin-left: 57px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const CountdownLabel = styled.span`
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#E2E8F0' : '#4A5568'};
  margin-right: 10px;
`;

const CountdownValue = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const CountdownUnit = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  span:first-child {
    font-size: 1.2rem;
    font-weight: 700;
    color: ${props => props.theme === 'dark' ? '#FEB2B2' : '#E53E3E'};
  }
  
  span:last-child {
    font-size: 0.7rem;
    color: ${props => props.theme === 'dark' ? '#A0AEC0' : '#718096'};
    text-transform: uppercase;
  }
`;

const BannerActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
  gap: 10px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 600;
  font-size: 0.9rem;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  svg {
    margin-left: 6px;
  }
`;

const ViewDetailsButton = styled(ActionButton)`
  background: ${props => props.theme === 'dark' ? '#4299E1' : '#3182CE'};
  color: white;
  
  &:hover {
    background: ${props => props.theme === 'dark' ? '#2B6CB0' : '#2B6CB0'};
  }
`;

const DismissButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  color: ${props => props.theme === 'dark' ? '#A0AEC0' : '#718096'};
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme === 'dark' ? '#4A5568' : '#EDF2F7'};
    color: ${props => props.theme === 'dark' ? '#F7FAFC' : '#1A202C'};
  }
`;

const ExamReminderBanner = ({ upcomingExams, theme = 'light', onDismiss }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  // Sử dụng useMemo để tránh tạo mới exam mỗi lần render
  const exam = useMemo(() => {
    return upcomingExams && upcomingExams.length > 0 ? upcomingExams[currentIndex % upcomingExams.length] : null;
  }, [upcomingExams, currentIndex]);
  
  // Sử dụng useMemo để tránh tạo mới examDate mỗi lần render
  const examDateString = useMemo(() => {
    if (!exam) return '';
    return exam.examDate || exam.startTime || '';
  }, [exam]);
  
  // Các hàm điều hướng dùng useCallback để tránh tạo mới function
  const nextExam = useCallback(() => {
    if (!upcomingExams || upcomingExams.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % upcomingExams.length);
  }, [upcomingExams]);
  
  const prevExam = useCallback(() => {
    if (!upcomingExams || upcomingExams.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + upcomingExams.length) % upcomingExams.length);
  }, [upcomingExams]);
  
  // Hàm định dạng ngày tháng
  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return 'Không xác định';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Không xác định';
      
      return new Intl.DateTimeFormat('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Không xác định';
    }
  }, []);
  
  // Hàm định dạng thời gian
  const formatTime = useCallback((dateStr) => {
    if (!dateStr) return 'Không xác định';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Không xác định';
      
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Không xác định';
    }
  }, []);
  
  // Hàm xử lý bỏ qua thông báo
  const handleDismiss = useCallback(() => {
    if (exam && onDismiss) {
      onDismiss(exam.id);
    }
  }, [exam, onDismiss]);
  
  // useEffect được cải tiến để tránh vòng lặp vô hạn
  useEffect(() => {
    // Thoát ngay nếu không có exam hoặc không có ngày hợp lệ
    if (!examDateString) return;
    
    const targetDate = new Date(examDateString);
    if (isNaN(targetDate.getTime())) return;
    
    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate - now;
      
      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      // Chỉ cập nhật nếu có thay đổi thực sự để tránh re-render không cần thiết
      setCountdown(prev => {
        if (prev.days !== days || prev.hours !== hours || 
            prev.minutes !== minutes || prev.seconds !== seconds) {
          return { days, hours, minutes, seconds };
        }
        return prev;
      });
    };
    
    // Cập nhật ban đầu
    updateCountdown();
    
    // Tạo interval
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [examDateString]); // Chỉ phụ thuộc vào chuỗi ngày, không phụ thuộc vào đối tượng Date
  
  // Kiểm tra trường hợp không có dữ liệu
  if (!upcomingExams || upcomingExams.length === 0 || !exam) {
    return null;
  }
  
  return (
    <BannerContainer theme={theme}>
      <DismissButton theme={theme} onClick={handleDismiss}>
        <FaTimes size={16} />
      </DismissButton>
      
      <BannerHeader>
        <IconContainer>
          <FaBell size={20} />
        </IconContainer>
        <BannerTitle theme={theme}>
          Sắp tới kỳ thi: {exam.title || 'Không có tiêu đề'}
          {upcomingExams.length > 1 && (
            <span style={{ fontSize: '0.8rem', marginLeft: '10px', fontWeight: 'normal' }}>
              ({currentIndex + 1}/{upcomingExams.length})
            </span>
          )}
        </BannerTitle>
      </BannerHeader>
      
      <BannerContent>
        <InfoItem theme={theme}>
          <FaCalendarAlt size={16} />
          <span>{formatDate(examDateString)}</span>
        </InfoItem>
        
        <InfoItem theme={theme}>
          <FaClock size={16} />
          <span>{formatTime(examDateString)} ({exam.duration || 'N/A'} phút)</span>
        </InfoItem>
        
        <InfoItem theme={theme}>
          <FaBook size={16} />
          <span>{exam.subject?.name || exam.subjectName || 'Toán học'}</span>
        </InfoItem>
      </BannerContent>
      
      <CountdownContainer theme={theme}>
        <CountdownLabel theme={theme}>Thời gian còn lại:</CountdownLabel>
        <CountdownValue>
          <CountdownUnit theme={theme}>
            <span>{countdown.days}</span>
            <span>ngày</span>
          </CountdownUnit>
          <CountdownUnit theme={theme}>
            <span>{countdown.hours}</span>
            <span>giờ</span>
          </CountdownUnit>
          <CountdownUnit theme={theme}>
            <span>{countdown.minutes}</span>
            <span>phút</span>
          </CountdownUnit>
          <CountdownUnit theme={theme}>
            <span>{countdown.seconds}</span>
            <span>giây</span>
          </CountdownUnit>
        </CountdownValue>
      </CountdownContainer>
      
      <BannerActions>
        {upcomingExams.length > 1 && (
          <>
            <button 
              onClick={prevExam}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: theme === 'dark' ? '#90CDF4' : '#3182CE'
              }}
            >
              <FaChevronLeft />
            </button>
            <button 
              onClick={nextExam}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                marginRight: 'auto',
                color: theme === 'dark' ? '#90CDF4' : '#3182CE'
              }}
            >
              <FaChevronRight />
            </button>
          </>
        )}
        <ViewDetailsButton to={`/exams/${exam.id}`} theme={theme}>
          Xem chi tiết <FaArrowRight size={14} />
        </ViewDetailsButton>
      </BannerActions>
    </BannerContainer>
  );
};

export default ExamReminderBanner;