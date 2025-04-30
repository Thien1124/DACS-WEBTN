import React, { createContext, useState, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

export const NotificationContext = createContext();
export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user, token } = useSelector(state => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });
  
  // Fetch notifications from API with pagination
  const fetchNotifications = async (page = 1, pageSize = 10, onlyUnread = false) => {
    if (!user || !token) return;
    
    try {
      setLoading(true);
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5006';
      const response = await axios.get(
        `${baseUrl}/api/notifications?page=${page}&pageSize=${pageSize}&onlyUnread=${onlyUnread}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (page === 1) {
        // Replace notifications for first page
        setNotifications(response.data.items || response.data);
      } else {
        // Append for pagination
        setNotifications(prev => [...prev, ...(response.data.items || response.data)]);
      }
      
      // Update pagination if available in response
      if (response.data.totalItems !== undefined) {
        setPagination({
          currentPage: page,
          totalPages: response.data.totalPages || Math.ceil(response.data.totalItems / pageSize),
          totalItems: response.data.totalItems,
          pageSize: pageSize,
        });
      }
      
      // Count unread notifications - this depends on your API response structure
      const unreadNotifications = (response.data.items || response.data).filter(n => !n.isRead);
      if (page === 1) {
        setUnreadCount(unreadNotifications.length);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    if (!token) return;
    
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5006';
      await axios.put(
        `${baseUrl}/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Decrement unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!token) return;
    
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5006';
      await axios.put(
        `${baseUrl}/api/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };
  
  // Send in-app notification
  const sendInAppNotification = async (notificationData) => {
    if (!token) return null;
    
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5006';
      const response = await axios.post(
        `${baseUrl}/api/notifications/in-app`,
        notificationData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return response.data;
    } catch (err) {
      console.error("Error sending in-app notification:", err);
      return null;
    }
  };
  
  // Send email notification
  const sendEmailNotification = async (emailData) => {
    if (!token) return null;
    
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5006';
      const response = await axios.post(
        `${baseUrl}/api/notifications/email`,
        emailData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return response.data;
    } catch (err) {
      console.error("Error sending email notification:", err);
      return null;
    }
  };
  
  // Load more notifications (pagination)
  const loadMoreNotifications = () => {
    if (pagination.currentPage < pagination.totalPages) {
      fetchNotifications(pagination.currentPage + 1, pagination.pageSize);
    }
  };
  
  // Fetch notifications on mount
  useEffect(() => {
    if (user && token) {
      fetchNotifications(1, 10);
      
      // Refresh notifications every 5 minutes
      const intervalId = setInterval(() => fetchNotifications(1, 10), 300000);
      return () => clearInterval(intervalId);
    }
  }, [user, token]);
  
  const value = {
    notifications,
    unreadCount,
    loading,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    sendInAppNotification,
    sendEmailNotification,
    loadMoreNotifications
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};