import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell } from 'react-icons/fa';
import { useNotification } from '../../contexts/NotificationContext';

const NotificationBadge = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotification();
  
  // Xử lý khi click vào biểu tượng thông báo
  const handleClick = () => {
    navigate('/notifications');
  };
  
  return (
    <BadgeContainer onClick={handleClick}>
      <FaBell size={20} />
      
      <AnimatePresence>
        {unreadCount > 0 && (
          <Badge
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </AnimatePresence>
    </BadgeContainer>
  );
};

// Styled Components
const BadgeContainer = styled.button`
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: inherit;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const Badge = styled(motion.div)`
  position: absolute;
  top: 0;
  right: 0;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background-color: #e53e3e;
  color: white;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  font-weight: bold;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
`;

export default NotificationBadge;