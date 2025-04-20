import { useState, useEffect } from 'react';

/**
 * Custom hook để quản lý nhắc nhở về các kỳ thi sắp diễn ra
 * @param {number} daysThreshold - Số ngày trước khi hiển thị nhắc nhở (mặc định: 7 ngày)
 * @param {string} apiUrl - URL API để lấy dữ liệu về kỳ thi
 * @returns {Object} Dữ liệu nhắc nhở và các hàm quản lý
 */
const useExamReminders = (daysThreshold = 7, apiUrl = 'http://localhost:5006/api/Exam/upcoming') => {
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dismissedExams, setDismissedExams] = useState(() => {
    // Lấy danh sách các kỳ thi đã bỏ qua từ localStorage
    const saved = localStorage.getItem('dismissedExams');
    return saved ? JSON.parse(saved) : [];
  });

  // Lấy các kỳ thi sắp diễn ra
  const fetchUpcomingExams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Không thể kết nối đến máy chủ');
      }
      
      const data = await response.json();
      
      // Lọc các kỳ thi sắp diễn ra trong khoảng thời gian cấu hình
      // và chưa bị người dùng bỏ qua
      const now = new Date();
      const filteredExams = data
        .filter(exam => {
          const examDate = new Date(exam.examDate);
          const diffTime = examDate - now;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays > 0 && diffDays <= daysThreshold;
        })
        .filter(exam => !dismissedExams.includes(exam.id));
      
      setUpcomingExams(filteredExams);
    } catch (err) {
      console.error('Error fetching upcoming exams:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Đánh dấu một kỳ thi là đã bỏ qua (không hiển thị lại)
  const dismissExam = (examId) => {
    setDismissedExams(prev => {
      const updatedDismissed = [...prev, examId];
      localStorage.setItem('dismissedExams', JSON.stringify(updatedDismissed));
      return updatedDismissed;
    });
    
    setUpcomingExams(prev => prev.filter(exam => exam.id !== examId));
  };

  // Reset lại tất cả các kỳ thi đã bỏ qua
  const resetDismissedExams = () => {
    localStorage.removeItem('dismissedExams');
    setDismissedExams([]);
    fetchUpcomingExams();
  };

  // Cập nhật dữ liệu khi component mount
  useEffect(() => {
    fetchUpcomingExams();
    
    // Thiết lập cập nhật tự động mỗi giờ
    const intervalId = setInterval(fetchUpcomingExams, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [daysThreshold, apiUrl]);

  return {
    upcomingExams,
    loading,
    error,
    dismissExam,
    resetDismissedExams,
    refreshExams: fetchUpcomingExams
  };
};

export default useExamReminders;