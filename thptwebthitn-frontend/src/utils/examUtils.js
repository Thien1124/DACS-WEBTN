export const storeExamData = (examId, examData, questions) => {
  try {
    // Lưu thông tin chi tiết của đề thi 
    localStorage.setItem('currentExamId', examId);
    localStorage.setItem('currentExam', JSON.stringify({
      ...examData,
      questions: questions || []
    }));
    
    console.log(`✅ Đã lưu đề thi ID: ${examId} với ${questions ? questions.length : 0} câu hỏi`);
    return true;
  } catch (error) {
    console.error('⚠️ Lỗi khi lưu dữ liệu đề thi:', error);
    return false;
  }
};

export const getStoredExam = () => {
  try {
    const examData = localStorage.getItem('currentExam');
    return examData ? JSON.parse(examData) : null;
  } catch (error) {
    console.error('⚠️ Lỗi khi đọc dữ liệu đề thi:', error);
    return null;
  }
};

export const getStoredQuestions = (examId) => {
  try {
    const mockQuestions = JSON.parse(localStorage.getItem('mockQuestions') || '{}');
    return mockQuestions[examId] || null;
  } catch (error) {
    console.error('Lỗi khi đọc câu hỏi đề thi:', error);
    return null;
  }
};