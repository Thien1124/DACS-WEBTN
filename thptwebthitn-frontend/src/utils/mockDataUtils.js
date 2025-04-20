export const loadMockExam = (examId) => {
  try {
    const mockExamsData = localStorage.getItem('mockExams');
    
    if (!mockExamsData) {
      return { error: "Không thể tải đề thi. Dữ liệu mẫu không tồn tại." };
    }
    
    let mockExams = [];
    try {
      mockExams = JSON.parse(mockExamsData);
      
      if (!Array.isArray(mockExams)) {
        return { error: "Dữ liệu mockExams không phải là mảng." };
      }
    } catch (parseError) {
      return { error: "Lỗi khi phân tích dữ liệu từ localStorage." };
    }
    
    const foundExam = mockExams.find(exam => String(exam.id) === String(examId));
    
    if (!foundExam) {
      return { error: "Không tìm thấy đề thi yêu cầu. Vui lòng quay lại trang danh sách đề thi." };
    }
    
    // Thêm thông tin timing
    const examWithTiming = {
      ...foundExam,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + foundExam.duration * 60 * 1000).toISOString()
    };
    
    return { exam: examWithTiming, error: null };
  } catch (error) {
    return { error: "Đã xảy ra lỗi khi tải dữ liệu đề thi." };
  }
};