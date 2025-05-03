import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNotification } from '../contexts/NotificationContext';
import styled from 'styled-components';
import { 
  FaRegBell, FaCheckCircle, FaExclamationTriangle,
  FaInfoCircle, FaCalendarAlt, FaChevronDown, FaCheck
} from 'react-icons/fa';
import NotificationService from '../services/NotificationService';
// Styled Components
const NotificationsContainer = styled.div`
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin: 0;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background-color: ${props => props.disabled ? '#ccc' : 'var(--primary-color, #3182ce)'};
  color: white;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.theme === 'dark' ? '#4299e1' : '#2b6cb0'};
  }
`;

const FilterSection = styled.div`
  margin-bottom: 1.5rem;
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background-color: ${props => props.active 
    ? 'var(--primary-color, #3182ce)' 
    : props.theme === 'dark' ? '#333' : '#f0f0f0'};
  color: ${props => props.active 
    ? 'white' 
    : props.theme === 'dark' ? '#e2e8f0' : '#333'};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.active 
      ? 'var(--primary-color, #3182ce)' 
      : props.theme === 'dark' ? '#444' : '#e2e2e2'};
  }
`;

const LoadingSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--primary-color, #3182ce);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#666'};
`;

const EmptyNotifications = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#888'};
`;

const EmptyIcon = styled(FaRegBell)`
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const NotificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NotificationItem = styled.div`
  padding: 16px;
  border-radius: 8px;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : 'white'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, ${props => props.theme === 'dark' ? '0.3' : '0.1'});
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  border-left: ${props => props.unread ? '4px solid var(--primary-color, #3182ce)' : 'none'};
  background-color: ${props => props.unread 
    ? props.theme === 'dark' ? 'rgba(49, 130, 206, 0.15)' : 'rgba(49, 130, 206, 0.05)'
    : props.theme === 'dark' ? '#2d3748' : 'white'};

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, ${props => props.theme === 'dark' ? '0.4' : '0.15'});
  }
`;

const NotificationContent = styled.div`
  display: flex;
  gap: 12px;
`;

const NotificationDetails = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h3`
  margin: 0 0 6px;
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const NotificationMessage = styled.p`
  margin: 0 0 8px;
  line-height: 1.5;
  color: ${props => props.theme === 'dark' ? '#cbd5e0' : '#666'};
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: ${props => props.expanded ? 'unset' : '2'};
  -webkit-box-orient: vertical;
`;

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 0;
  color: var(--primary-color, #3182ce);
  cursor: pointer;
  font-size: 0.85rem;
  margin-bottom: 8px;
  
  svg {
    transform: ${props => props.expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
    transition: transform 0.2s;
  }
`;

const NotificationTime = styled.span`
  font-size: 0.8rem;
  color: ${props => props.theme === 'dark' ? '#718096' : '#999'};
`;

const UnreadIndicator = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--primary-color, #3182ce);
  position: absolute;
  top: 16px;
  right: 16px;
`;

const IconWrapper = styled.span`
  font-size: 1.5rem;
  min-width: 24px;
  color: ${props => {
    switch (props.type) {
      case 0: return '#3498db'; // System
      case 1: return '#2ecc71'; // Exam
      case 2: return '#9b59b6'; // Result
      case 3: return '#e74c3c'; // Warning
      default: return 'inherit';
    }
  }};
`;

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  const { token } = useSelector(state => state.auth); // Get token from Redux
  
  // Replace useNotification hook with local state
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [expandedNotifications, setExpandedNotifications] = useState({});
  
  // Add these functions to replace the ones from the context
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await NotificationService.getNotifications(token);
      console.log('Fetched notifications:', response);
      
      // Extract notifications correctly from the API response
      let notificationsData = [];
      
      if (response) {
        // Check for the exact structure from your API
        if (response.data && response.data.notifications) {
          // This matches your API response structure
          notificationsData = response.data.notifications;
        } else if (response.notifications) {
          notificationsData = response.notifications;
        } else if (response.items) {
          notificationsData = response.items;
        } else if (Array.isArray(response)) {
          notificationsData = response;
        }
      }
      
      console.log('Extracted notifications:', notificationsData);
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };
  
  const markAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(token, notificationId);
      // Update local state after successful API call
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true } 
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead(token);
      // Update local state after successful API call
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, [token]);
  
  // Safely check if there are unread notifications
  const hasUnreadNotifications = Array.isArray(notifications) && 
    notifications.some(notification => !notification.isRead);
  
  useEffect(() => {
    if (!Array.isArray(notifications)) {
      setFilteredNotifications([]);
      return;
    }
    
    if (activeFilter === 'all') {
      setFilteredNotifications(notifications);
    } else if (activeFilter === 'unread') {
      setFilteredNotifications(notifications.filter(notification => !notification.isRead));
    } else {
      // Assuming activeFilter is a number as string (type ID)
      const typeId = parseInt(activeFilter);
      setFilteredNotifications(
        notifications.filter(notification => notification.type === typeId)
      );
    }
  }, [notifications, activeFilter]);
  
  const toggleExpand = (id) => {
    setExpandedNotifications(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Navigate based on link if available
    if (notification.link) {
      navigate(notification.link);
    }
    
    // Or navigate based on type and related entity
    else if (notification.relatedEntityId && notification.relatedEntityType) {
      switch (notification.relatedEntityType.toLowerCase()) {
        case 'exam':
          navigate(`/exams/${notification.relatedEntityId}`);
          break;
        case 'result':
          navigate(`/exam-results/${notification.relatedEntityId}`);
          break;
        default:
          // Do nothing
          break;
      }
    }
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 0: // System
        return <FaInfoCircle />;
      case 1: // Exam
        return <FaCalendarAlt />;
      case 2: // Result
        return <FaCheckCircle />;
      case 3: // Warning
        return <FaExclamationTriangle />;
      default:
        return <FaRegBell />;
    }
  };
  
  return (
    <NotificationsContainer theme={theme}>
      <Header>
        <Title theme={theme}>Thông báo</Title>
        <ActionButton 
          theme={theme}
          onClick={markAllAsRead}
          disabled={!hasUnreadNotifications}
        >
          <FaCheck /> Đánh dấu tất cả đã đọc
        </ActionButton>
      </Header>
      
      <FilterSection>
        <FilterTabs>
          <FilterButton 
            theme={theme}
            active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
          >
            Tất cả
          </FilterButton>
          <FilterButton 
            theme={theme}
            active={activeFilter === 'unread'}
            onClick={() => setActiveFilter('unread')}
          >
            Chưa đọc
          </FilterButton>
          <FilterButton 
            theme={theme}
            active={activeFilter === '1'}
            onClick={() => setActiveFilter('1')}
          >
            Kỳ thi
          </FilterButton>
          <FilterButton 
            theme={theme}
            active={activeFilter === '2'}
            onClick={() => setActiveFilter('2')}
          >
            Kết quả
          </FilterButton>
          <FilterButton 
            theme={theme}
            active={activeFilter === '0'}
            onClick={() => setActiveFilter('0')}
          >
            Hệ thống
          </FilterButton>
        </FilterTabs>
      </FilterSection>
      
      {loading ? (
        <LoadingSection>
          <LoadingSpinner />
          <LoadingText theme={theme}>Đang tải thông báo...</LoadingText>
        </LoadingSection>
      ) : (
        <>
          {!Array.isArray(filteredNotifications) || filteredNotifications.length === 0 ? (
            <EmptyNotifications theme={theme}>
              <EmptyIcon />
              <p>Không có thông báo {activeFilter !== 'all' ? 'phù hợp' : ''}</p>
            </EmptyNotifications>
          ) : (
            <NotificationsList>
              {filteredNotifications.map(notification => (
                <NotificationItem 
                  key={notification.id}
                  theme={theme}
                  unread={!notification.isRead}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <NotificationContent>
                    <IconWrapper type={notification.type}>
                      {getNotificationIcon(notification.type)}
                    </IconWrapper>
                    <NotificationDetails>
                      <NotificationTitle theme={theme}>
                        {notification.title}
                      </NotificationTitle>
                      <NotificationMessage 
                        theme={theme}
                        expanded={expandedNotifications[notification.id]}
                      >
                        {notification.content}
                      </NotificationMessage>
                      
                      {notification.content && notification.content.length > 100 && (
                        <ExpandButton 
                          expanded={expandedNotifications[notification.id]}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(notification.id);
                          }}
                        >
                          {expandedNotifications[notification.id] ? 'Thu gọn' : 'Xem thêm'}
                          <FaChevronDown />
                        </ExpandButton>
                      )}
                      
                      <NotificationTime theme={theme}>
                        {notification.createdAt ? new Date(notification.createdAt).toLocaleString('vi-VN') : 'N/A'}
                      </NotificationTime>
                    </NotificationDetails>
                  </NotificationContent>
                  
                  {!notification.isRead && <UnreadIndicator />}
                </NotificationItem>
              ))}
            </NotificationsList>
          )}
        </>
      )}
    </NotificationsContainer>
  );
};

export default NotificationsPage;