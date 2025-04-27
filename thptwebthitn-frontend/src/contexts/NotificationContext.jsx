import React, { createContext, useState, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

// Tạo context
export const NotificationContext = createContext();

// Hook để sử dụng context
export const useNotification = () => useContext(NotificationContext);

// Provider component
export const NotificationProvider = ({ children }) => {
  const { user, token } = useSelector(state => state.auth);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Lấy danh sách thông báo từ dữ liệu hiện có và localStorage
  const generateNotifications = async () => {
    if (!user || !user.id || !token) return;
    
    try {
      setLoading(true);
      const generatedNotifications = [];
      
      // 1. Tạo thông báo từ bài thi sắp tới
      try {
        const examsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5006'}/api/Exams/upcoming`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const upcomingExams = Array.isArray(examsResponse.data) ? examsResponse.data : [];
        
        // Thêm thông báo cho mỗi bài thi sắp tới
        upcomingExams.forEach(exam => {
          const examDate = new Date(exam.startDate || exam.scheduledDate);
          const now = new Date();
          const diffTime = examDate - now;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Chỉ tạo thông báo cho bài thi trong vòng 7 ngày tới
          if (diffDays <= 7 && diffDays >= 0) {
            generatedNotifications.push({
              id: `exam_${exam.id}_upcoming`,
              type: 'exam_schedule',
              title: `Sắp đến thời gian thi: ${exam.title || 'Bài kiểm tra'} (${exam.subject?.name || 'Không xác định'})`,
              content: `Bài thi sẽ diễn ra sau ${diffDays} ngày nữa, vào ${new Date(examDate).toLocaleString('vi-VN')}`,
              createdAt: new Date().toISOString(),
              referenceId: exam.id,
              isRead: isNotificationRead(`exam_${exam.id}_upcoming`)
            });
          }
        });
      } catch (error) {
        console.error('Error fetching upcoming exams:', error);
      }
      
      // 2. Tạo thông báo từ kết quả bài thi gần đây
      try {
        const resultsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5006'}/api/Results/user/${user.id}?pageSize=5`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const recentResults = Array.isArray(resultsResponse.data) 
          ? resultsResponse.data 
          : (resultsResponse.data?.items || []);
        
        // Thêm thông báo cho mỗi kết quả bài thi gần đây (trong vòng 3 ngày)
        recentResults.forEach(result => {
          const resultDate = new Date(result.endTime || result.createdAt);
          const now = new Date();
          const diffTime = now - resultDate;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Chỉ tạo thông báo cho kết quả mới (trong vòng 3 ngày)
          if (diffDays <= 3) {
            const isPassed = result.score >= (result.passScore || result.totalScore / 2);
            
            generatedNotifications.push({
              id: `result_${result.id}`,
              type: 'exam_result',
              title: `Kết quả bài thi: ${result.examTitle || `Bài thi #${result.examId}`}`,
              content: `Bạn đã ${isPassed ? 'đạt' : 'không đạt'} với điểm số ${result.score}/${result.totalScore}`,
              createdAt: result.endTime || result.createdAt,
              referenceId: result.id,
              isRead: isNotificationRead(`result_${result.id}`)
            });
          }
        });
      } catch (error) {
        console.error('Error fetching recent results:', error);
      }
      
      // 3. Tạo thông báo nhắc nhở học tập (dựa trên thời gian không hoạt động)
      try {
        // Lấy thời gian đăng nhập gần nhất từ localStorage
        const lastActivity = localStorage.getItem('lastActivity');
        const now = new Date();
        
        if (lastActivity) {
          const lastActivityDate = new Date(lastActivity);
          const diffTime = now - lastActivityDate;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Nếu không hoạt động trong 3 ngày, tạo thông báo nhắc nhở
          if (diffDays >= 3) {
            generatedNotifications.push({
              id: `reminder_${now.getTime()}`,
              type: 'reminder',
              title: `Nhắc nhở học tập`,
              content: `Bạn đã không làm bài tập nào trong ${diffDays} ngày. Hãy tiếp tục học tập để cải thiện kết quả!`,
              createdAt: now.toISOString(),
              isRead: false
            });
          }
        }
      } catch (error) {
        console.error('Error generating study reminder:', error);
      }
      
      // Sắp xếp theo thời gian giảm dần (mới nhất lên đầu)
      generatedNotifications.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setNotifications(generatedNotifications);
      
      // Đếm số thông báo chưa đọc
      const unreadNotifications = generatedNotifications.filter(n => !n.isRead);
      setUnreadCount(unreadNotifications.length);
      
    } catch (err) {
      console.error("Error generating notifications:", err);
    } finally {
      setLoading(false);
      
      // Cập nhật thời gian hoạt động gần nhất
      localStorage.setItem('lastActivity', new Date().toISOString());
    }
  };
  
  // Kiểm tra xem thông báo đã được đọc chưa
  const isNotificationRead = (notificationId) => {
    try {
      const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      return readNotifications.includes(notificationId);
    } catch {
      return false;
    }
  };
  
  // Đánh dấu thông báo đã đọc
  const markAsRead = (notificationId) => {
    try {
      // Đọc danh sách thông báo đã đọc từ localStorage
      const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      
      // Thêm notificationId vào danh sách nếu chưa có
      if (!readNotifications.includes(notificationId)) {
        readNotifications.push(notificationId);
        localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
      }
      
      // Cập nhật state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Giảm số thông báo chưa đọc
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };
  
  // Đánh dấu tất cả đã đọc
  const markAllAsRead = () => {
    try {
      // Lưu tất cả ID thông báo vào localStorage
      const allNotificationIds = notifications.map(n => n.id);
      const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      
      // Kết hợp danh sách cũ và mới
      const uniqueIds = [...new Set([...readNotifications, ...allNotificationIds])];
      localStorage.setItem('readNotifications', JSON.stringify(uniqueIds));
      
      // Cập nhật state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Đặt số thông báo chưa đọc về 0
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };
  
  // Cập nhật thông báo khi component được mount và khi user hoặc token thay đổi
  useEffect(() => {
    if (user && token) {
      generateNotifications();
      
      // Cập nhật thông báo mỗi 5 phút
      const intervalId = setInterval(generateNotifications, 300000);
      return () => clearInterval(intervalId);
    }
  }, [user, token]);
  
  // Context value
  const value = {
    unreadCount,
    notifications,
    loading,
    generateNotifications,
    markAsRead,
    markAllAsRead
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};