import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5006';

export const NotificationService = {
  /**
   * Get notifications with pagination and filtering
   */
  getNotifications: async (token, page = 1, pageSize = 10, onlyUnread = false) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/notifications?page=${page}&pageSize=${pageSize}&onlyUnread=${onlyUnread}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },
  
  /**
   * Mark a notification as read
   */
  markAsRead: async (token, notificationId) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
  
  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (token) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },
  
  /**
   * Send in-app notification
   * @param {Object} data - Notification data
   * @param {number} data.userId - Single user ID (optional if userIds is provided)
   * @param {Array<number>} data.userIds - Array of user IDs (optional if userId is provided)
   * @param {string} data.title - Notification title
   * @param {string} data.content - Notification content
   * @param {number} data.type - Notification type (0: System, 1: Exam, 2: Result, 3: Warning)
   * @param {string} data.link - Optional URL to navigate to (optional)
   * @param {number} data.relatedEntityId - ID of related entity (optional)
   * @param {string} data.relatedEntityType - Type of related entity (optional)
   * @param {boolean} data.sendEmail - Whether to also send an email (optional)
   */
  sendInAppNotification: async (token, data) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/notifications/in-app`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending in-app notification:', error);
      throw error;
    }
  },
  
  /**
   * Send email notification
   * @param {Object} data - Email data
   * @param {string} data.recipients - Email address(es) to send to
   * @param {string} data.subject - Email subject
   * @param {string} data.content - Email content (HTML or text)
   * @param {string} data.template - Email template name (optional)
   * @param {Object} data.templateData - Data for template (optional)
   * @param {boolean} data.saveNotification - Whether to also save as in-app notification (optional)
   * @param {number} data.type - Notification type if saved (optional)
   * @param {number} data.relatedEntityId - ID of related entity (optional)
   * @param {string} data.relatedEntityType - Type of related entity (optional)
   * @param {string} data.link - Optional URL to include in notification (optional)
   */
  sendEmailNotification: async (token, data) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/notifications/email`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending email notification:', error);
      throw error;
    }
  }
};

export default NotificationService;