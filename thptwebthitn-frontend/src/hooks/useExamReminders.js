import { useState, useEffect } from 'react';

/**
 * Custom hook để quản lý nhắc nhở về các kỳ thi sắp diễn ra
 * @param {number} daysThreshold - Số ngày trước khi hiển thị nhắc nhở (mặc định: 7 ngày)
 * @returns {Object} Dữ liệu nhắc nhở và các hàm quản lý
 */
const useExamReminders = (daysThreshold = 7) => {
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dismissedExams, setDismissedExams] = useState(() => {
    return JSON.parse(localStorage.getItem('dismissedExamReminders') || '[]');
  });

  // Mô phỏng lấy dữ liệu từ API
  const fetchUpcomingExams = () => {
    try {
      setLoading(true);
      setError(null);
      
      // Dữ liệu giả (mock data) - kỳ thi sắp diễn ra
      const mockData = [
        {
          id: 1,
          title: "Kiểm tra giữa kỳ môn Toán",
          examDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 ngày nữa
          subject: { name: "Toán 10" },
          duration: 45
        },
        {
          id: 2,
          title: "Thi học kỳ môn Vật lý",
          examDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 ngày nữa
          subject: { name: "Vật lý 10" },
          duration: 60
        }
      ];
      
      // Lọc các kỳ thi sắp diễn ra trong khoảng thời gian cấu hình
      // và chưa bị người dùng bỏ qua
      const now = new Date();
      const filteredExams = mockData
        .filter(exam => {
          const examDate = new Date(exam.examDate);
          const diffTime = examDate - now;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays > 0 && diffDays <= daysThreshold;
        })
        .filter(exam => !dismissedExams.includes(exam.id));
      
      console.log("Mock upcoming exams:", filteredExams);
      setUpcomingExams(filteredExams);
    } catch (err) {
      console.error('Error with exam reminders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Đánh dấu một kỳ thi là đã bỏ qua (không hiển thị lại)
  const dismissExam = (examId) => {
    console.log("Dismissing exam:", examId);
    const newDismissed = [...dismissedExams, examId];
    localStorage.setItem('dismissedExamReminders', JSON.stringify(newDismissed));
    setDismissedExams(newDismissed);
    setUpcomingExams(prev => prev.filter(exam => exam.id !== examId));
  };

  // Reset lại tất cả các kỳ thi đã bỏ qua
  const resetDismissedExams = () => {
    localStorage.removeItem('dismissedExamReminders');
    setDismissedExams([]);
    fetchUpcomingExams();
  };

  // Cập nhật dữ liệu khi component mount
  useEffect(() => {
    fetchUpcomingExams();
    
    // Thiết lập cập nhật tự động mỗi giờ
    const intervalId = setInterval(fetchUpcomingExams, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [daysThreshold]);

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