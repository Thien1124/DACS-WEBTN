// Tạo file mock data riêng để sử dụng

export const generateMockResults = (examId, count = 30) => {
  const mockStudents = [
    'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung', 
    'Hoàng Văn Em', 'Ngô Thị Fương', 'Đỗ Văn Giang', 'Vũ Thị Hương',
    'Đặng Văn Inh', 'Bùi Thị Khánh', 'Lý Văn Lâm', 'Mai Thị Minh',
    'Phan Văn Nam', 'Trương Thị Oanh', 'Hồ Văn Phúc', 'Dương Thị Quỳnh'
  ];

  const results = [];
  
  for (let i = 0; i < count; i++) {
    const score = parseFloat((Math.random() * 10).toFixed(2));
    const duration = Math.floor(Math.random() * 3600) + 900; // 15-75 phút
    const studentIndex = Math.floor(Math.random() * mockStudents.length);
    
    const completedDate = new Date();
    completedDate.setDate(completedDate.getDate() - Math.floor(Math.random() * 30));
    
    // Tạo 40 câu trả lời cho mỗi học sinh
    const answers = [];
    for (let q = 1; q <= 40; q++) {
      const isCorrect = Math.random() > 0.4; // 60% đúng, 40% sai
      const timeSpent = Math.floor(Math.random() * 120) + 10; // 10-130 giây
      
      answers.push({
        questionId: q,
        questionContent: `Câu hỏi mẫu #${q} cho bài thi?`,
        isCorrect: isCorrect,
        selectedAnswer: isCorrect ? 'A' : ['B', 'C', 'D'][Math.floor(Math.random() * 3)],
        correctAnswer: 'A',
        timeSpent: timeSpent
      });
    }
    
    results.push({
      id: i + 1,
      examId: parseInt(examId),
      studentId: 1000 + i,
      studentName: mockStudents[studentIndex],
      score: score,
      duration: duration,
      completedDate: completedDate.toISOString(),
      startTime: completedDate.toISOString(),
      answers: answers
    });
  }
  
  return results;
};

export const generateMockExamDetails = (examId) => {
  return {
    id: examId,
    title: 'Bài kiểm tra học kỳ 1 - Môn Toán',
    description: 'Đề thi mẫu môn Toán dành cho học sinh lớp 12',
    subjectId: 1,
    subjectName: 'Toán',
    duration: 45,
    questionCount: 40,
    passScore: 5,
    isActive: true,
    isPublic: true,
    createdBy: 'GV. Nguyễn Văn A',
    createdAt: '2023-11-15T08:30:00Z'
  };
};