import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaBell, FaCalendarAlt, FaTrophy, FaInfoCircle, FaExclamationTriangle, 
  FaCheck, FaFilter, FaTrash, FaAngleDown, FaAngleUp, FaHistory
} from 'react-icons/fa';
import LoadingSpinner from '../components/common/LoadingSpinner';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  
  // Trạng thái nội bộ
  const [loading, setLoading] = useState(true);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedNotifications, setExpandedNotifications] = useState({});
  
  // Danh sách thông báo mặc định từ database
  const defaultNotifications = [
    {
      id: 'exam_notification_1',
      type: 'exam_schedule',
      title: 'Lịch thi: Kiểm tra giữa kỳ Toán học',
      content: `Bài kiểm tra kiến thức cơ bản về đạo hàm và tích phân. Thời gian: 26/04/2025 đến 29/04/2025. Thời gian làm bài: 45 phút.`,
      createdAt: new Date('2025-04-19T04:23:56').toISOString(),
      referenceId: '1', // ID của bài kiểm tra
      isRead: false,
      details: 'Mã truy cập: abc123. Cho phép làm 2 lần. Điểm đạt: 5/10.'
    },
    {
      id: 'exam_notification_2',
      type: 'exam_schedule',
      title: 'Lịch thi: Kiểm tra cuối kỳ Toán học',
      content: `Bài kiểm tra kiến thức cơ bản về đạo hàm và tích phân. Thời gian: 30/04/2025. Thời gian làm bài: 45 phút.`,
      createdAt: new Date('2025-04-21T01:33:57').toISOString(),
      referenceId: '2', // ID của bài kiểm tra
      isRead: false,
      details: 'Mã truy cập: abc123. Cho phép làm 2 lần. Điểm đạt: 5/10.'
    },
    {
      id: 'exam_result_notification_1',
      type: 'exam_result',
      title: 'Kết quả: Bài tập Đại số',
      content: `Bạn đã hoàn thành bài tập Đại số với điểm số 8/10. Kết quả: Đạt.`,
      createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
      referenceId: '101',
      isRead: false
    },
    {
      id: 'reminder_notification_1',
      type: 'reminder',
      title: 'Nhắc nhở: Bài thi sắp đến hạn',
      content: `Bài kiểm tra giữa kỳ Toán học sẽ kết thúc vào ngày 29/04/2025. Hãy hoàn thành trước khi hết hạn!`,
      createdAt: new Date().toISOString(),
      referenceId: '1',
      isRead: false
    }
  ];

  // Khởi tạo dữ liệu khi component mount
  useEffect(() => {
    // Đặt một timeout để đảm bảo không bị kẹt trong trạng thái loading
    const timer = setTimeout(() => {
      console.log("Initial setup with default notifications");
      setFilteredNotifications(defaultNotifications);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);
  
  // Xử lý filter thông báo
  const handleFilter = (filter) => {
    setActiveFilter(filter);
    
    if (filter === 'all') {
      setFilteredNotifications(defaultNotifications);
    } else if (filter === 'unread') {
      setFilteredNotifications(defaultNotifications.filter(notification => !notification.isRead));
    } else {
      // Lọc theo loại thông báo
      setFilteredNotifications(defaultNotifications.filter(notification => notification.type === filter));
    }
  };

  const toggleExpand = (id) => {
    setExpandedNotifications(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Đánh dấu là đã đọc
  const markAsRead = (notificationId) => {
    setFilteredNotifications(prev => 
      prev.map(item => 
        item.id === notificationId ? { ...item, isRead: true } : item
      )
    );
  };
  
  // Đánh dấu tất cả đã đọc
  const markAllAsRead = () => {
    setFilteredNotifications(prev => 
      prev.map(item => ({ ...item, isRead: true }))
    );
  };
  
  // Xử lý khi click vào thông báo
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Chuyển hướng dựa trên loại thông báo
    if (notification.type === 'exam_schedule' && notification.referenceId) {
      navigate(`/exams/${notification.referenceId}`);
    } else if (notification.type === 'exam_result' && notification.referenceId) {
      navigate(`/exam-results/${notification.referenceId}`);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'exam_schedule':
        return <FaCalendarAlt />;
      case 'exam_result':
        return <FaTrophy />;
      case 'reminder':
        return <FaHistory />;
      case 'system':
        return <FaInfoCircle />;
      default:
        return <FaBell />;
    }
  };
  
  if (loading) {
    return (
      <PageContainer>
        <Header>
          <Title theme={theme}>Thông Báo</Title>
        </Header>
        <LoadingContainer>
          <LoadingSpinner size="lg" />
          <LoadingText>Đang tải thông báo...</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <Header>
        <Title theme={theme}>Thông Báo</Title>
        <HeaderActions>
          {filteredNotifications.some(n => !n.isRead) && (
            <MarkAllReadButton 
              onClick={markAllAsRead}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              theme={theme}
            >
              <FaCheck /> Đánh dấu tất cả đã đọc
            </MarkAllReadButton>
          )}
        </HeaderActions>
      </Header>
      
      <NotificationFilters theme={theme}>
        <FilterButton 
          active={activeFilter === 'all'}
          onClick={() => handleFilter('all')}
          theme={theme}
        >
          <FaBell /> Tất cả
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'unread'}
          onClick={() => handleFilter('unread')}
          theme={theme}
        >
          <FaCheck /> Chưa đọc
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'exam_schedule'}
          onClick={() => handleFilter('exam_schedule')}
          theme={theme}
        >
          <FaCalendarAlt /> Lịch thi
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'exam_result'}
          onClick={() => handleFilter('exam_result')}
          theme={theme}
        >
          <FaTrophy /> Kết quả
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'reminder'}
          onClick={() => handleFilter('reminder')}
          theme={theme}
        >
          <FaHistory /> Nhắc nhở
        </FilterButton>
      </NotificationFilters>
      
      {filteredNotifications.length === 0 ? (
        <EmptyState theme={theme}>
          <FaBell size={50} style={{ opacity: 0.5 }} />
          <EmptyMessage>Không có thông báo nào{activeFilter !== 'all' ? ' trong mục này' : ''}</EmptyMessage>
        </EmptyState>
      ) : (
        <NotificationsList>
          {filteredNotifications.map(notification => (
            <NotificationItem 
              key={notification.id} 
              theme={theme}
              read={notification.isRead}
              onClick={() => handleNotificationClick(notification)}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <NotificationIconWrapper type={notification.type}>
                {getNotificationIcon(notification.type)}
              </NotificationIconWrapper>
              <NotificationMainContent>
                <NotificationHeader>
                  <NotificationTitle>{notification.title}</NotificationTitle>
                  <NotificationTime>{formatDate(notification.createdAt)}</NotificationTime>
                </NotificationHeader>
                <NotificationContent>
                  {notification.content}
                </NotificationContent>
                
                {notification.details && (
                  <>
                    {expandedNotifications[notification.id] && (
                      <NotificationDetails theme={theme}>
                        {notification.details}
                      </NotificationDetails>
                    )}
                    <ExpandButton
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(notification.id);
                      }}
                    >
                      {expandedNotifications[notification.id] ? (
                        <>Thu gọn <FaAngleUp /></>
                      ) : (
                        <>Xem thêm <FaAngleDown /></>
                      )}
                    </ExpandButton>
                  </>
                )}
              </NotificationMainContent>
              {!notification.isRead && <UnreadIndicator />}
            </NotificationItem>
          ))}
        </NotificationsList>
      )}
    </PageContainer>
  );
};

// Styled Components giữ nguyên như cũ...

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin: 0;
  font-weight: 700;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const MarkAllReadButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#cbd5e0'};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  gap: 1rem;
`;

const LoadingText = styled.p`
  font-size: 1.2rem;
  color: #4a5568;
`;

const NotificationFilters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  overflow-x: auto;
  
  @media (max-width: 768px) {
    flex-wrap: nowrap;
    padding-bottom: 0.5rem;
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background-color: ${props => props.active ? (props.theme === 'dark' ? '#4299e1' : '#bee3f8') : 'transparent'};
  color: ${props => props.active ? (props.theme === 'dark' ? 'white' : '#2b6cb0') : (props.theme === 'dark' ? '#e2e8f0' : '#4a5568')};
  border: 1px solid ${props => props.active ? (props.theme === 'dark' ? '#4299e1' : '#bee3f8') : (props.theme === 'dark' ? '#4a5568' : '#e2e8f0')};
  border-radius: 8px;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  white-space: nowrap;
  
  &:hover {
    background-color: ${props => props.active ? (props.theme === 'dark' ? '#3182ce' : '#90cdf4') : (props.theme === 'dark' ? '#4a5568' : '#edf2f7')};
  }
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NotificationItem = styled(motion.div)`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background-color: ${props => props.theme === 'dark' 
    ? (props.read ? '#2d3748' : '#283141') 
    : (props.read ? 'white' : '#f7fafc')};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const NotificationIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: ${props => {
    switch (props.type) {
      case 'exam_schedule':
        return '#ebf8ff'; // Light blue
      case 'exam_result':
        return '#fefcbf'; // Light yellow
      case 'reminder':
        return '#feebcf'; // Light orange
      case 'system':
        return '#e9f5e9'; // Light green
      default:
        return '#e9d8fd'; // Light purple
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'exam_schedule':
        return '#3182ce'; // Blue
      case 'exam_result':
        return '#d69e2e'; // Yellow
      case 'reminder':
        return '#dd6b20'; // Orange
      case 'system':
        return '#38a169'; // Green
      default:
        return '#805ad5'; // Purple
    }
  }};
  font-size: 1.2rem;
`;

const NotificationMainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NotificationHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem;
`;

const NotificationTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
`;

const NotificationTime = styled.span`
  font-size: 0.85rem;
  color: #718096;
`;

const NotificationContent = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const UnreadIndicator = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #4299e1;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  border-radius: 8px;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  gap: 1.5rem;
`;

const EmptyMessage = styled.p`
  font-size: 1.1rem;
  text-align: center;
  margin: 0;
`;

const NotificationDetails = styled.p`
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  line-height: 1.5;
  padding: 0.75rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f7fafc'};
  border-radius: 6px;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #4299e1;
  padding: 0.25rem;
  margin-top: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
`;

export default NotificationsPage;