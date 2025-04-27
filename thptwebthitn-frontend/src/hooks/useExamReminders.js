import { useState, useEffect, useCallback, useMemo } from "react";

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
    try {
      return JSON.parse(localStorage.getItem("dismissedExamReminders")) || [];
    } catch (e) {
      console.error("Error reading dismissed exams from localStorage:", e);
      return [];
    }
  });

  /**
   * Tạo mock dữ liệu kỳ thi
   * Trong thực tế, bạn nên thay thế bằng API thực tế
   */
  const mockExamsData = useMemo(() => {
    return [
      {
        id: 1,
        title: "Kiểm tra giữa kỳ môn Toán",
        examDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 ngày nữa
        subject: { name: "Toán 10" },
        duration: 45, // phút
      },
      {
        id: 2,
        title: "Thi học kỳ môn Vật lý",
        examDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 ngày nữa
        subject: { name: "Vật lý 10" },
        duration: 60, // phút
      },
    ];
  }, []);

  /**
   * Hàm fetch dữ liệu kỳ thi
   * Lọc các kỳ thi dựa theo daysThreshold và dismissedExams
   */
  const fetchUpcomingExams = useCallback(() => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const filteredExams = mockExamsData.filter((exam) => {
        const examDate = new Date(exam.examDate);
        const diffTime = examDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return (
          diffDays > 0 &&
          diffDays <= daysThreshold &&
          !dismissedExams.includes(exam.id)
        );
      });

      setUpcomingExams(filteredExams);
    } catch (err) {
      console.error("Error fetching exams:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [mockExamsData, daysThreshold, dismissedExams]);

  /**
   * Đánh dấu một kỳ thi là đã bỏ qua
   * @param {number} examId - ID của kỳ thi cần bỏ qua
   */
  const dismissExam = useCallback(
    (examId) => {
      try {
        const newDismissed = [...dismissedExams, examId];
        localStorage.setItem(
          "dismissedExamReminders",
          JSON.stringify(newDismissed)
        );
        setDismissedExams(newDismissed);
        setUpcomingExams((prev) => prev.filter((exam) => exam.id !== examId));
      } catch (err) {
        console.error("Error dismissing exam:", err);
        setError("Không thể bỏ qua kỳ thi.");
      }
    },
    [dismissedExams]
  );

  /**
   * Reset lại danh sách kỳ thi đã bỏ qua
   */
  const resetDismissedExams = useCallback(() => {
    try {
      localStorage.removeItem("dismissedExamReminders");
      setDismissedExams([]);
      fetchUpcomingExams();
    } catch (err) {
      console.error("Error resetting dismissed exams:", err);
      setError("Không thể reset danh sách kỳ thi đã bỏ qua.");
    }
  }, [fetchUpcomingExams]);

  /**
   * useEffect để fetch dữ liệu kỳ thi khi component mount
   * Tự động cập nhật mỗi giờ
   */
  useEffect(() => {
    fetchUpcomingExams();

    const intervalId = setInterval(fetchUpcomingExams, 60 * 60 * 1000); // Cập nhật mỗi giờ
    return () => clearInterval(intervalId);
  }, [fetchUpcomingExams]);

  return {
    upcomingExams,
    loading,
    error,
    dismissExam,
    resetDismissedExams,
    refreshExams: fetchUpcomingExams,
  };
};

export default useExamReminders;
