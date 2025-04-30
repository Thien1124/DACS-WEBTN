import React from 'react';
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { useNotification } from '../../contexts/NotificationContext';
import './NotificationBadge.css';

const NotificationBadge = () => {
  const { unreadCount } = useNotification();
  
  return (
    <Link to="/notifications" className="notification-badge-wrapper">
      <div className="notification-icon-wrapper">
        <FaBell className="notification-icon" />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
    </Link>
  );
};

export default NotificationBadge;