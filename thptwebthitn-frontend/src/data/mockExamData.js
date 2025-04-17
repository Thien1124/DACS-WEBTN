// Mock data cho đề thi và câu hỏi
export const mockExam = {
    id: 1,
    title: "Đề kiểm tra Toán học THPT Quốc Gia",
    description: "Đề thi trắc nghiệm môn Toán học, chuẩn bị cho kỳ thi THPT Quốc Gia",
    duration: 60, // thời gian làm bài tính bằng phút
    subject: {
      id: 1,
      name: "Toán học"
    },
    startTime: new Date(Date.now()).toISOString(),
    endTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    difficulty: "medium",
    totalQuestions: 5,
    createdBy: "Nguyễn Văn A",
    createdAt: "2023-04-10T08:30:00.000Z",
    isPublic: true,
    instructions: "Học sinh làm bài trên phiếu trả lời trắc nghiệm. Mỗi câu hỏi chỉ có một đáp án đúng.",
    questions: [
      {
        id: 1,
        order: 1,
        content: "Cho hàm số f(x) = x³ - 3x² + 3x - 1. Số nghiệm thực của phương trình f(x) = 0 là:",
        type: "single",
        difficulty: "medium",
        options: [
          { id: 1, content: "0" },
          { id: 2, content: "1" },
          { id: 3, content: "2" },
          { id: 4, content: "3" }
        ],
        correctOption: 2,
        explanation: "Hàm số f(x) = x³ - 3x² + 3x - 1 = (x-1)³, nên phương trình có nghiệm duy nhất x = 1."
      },
      {
        id: 2,
        order: 2,
        content: "Giá trị nhỏ nhất của hàm số f(x) = 2x² - 8x + 10 là:",
        type: "single",
        difficulty: "easy",
        options: [
          { id: 1, content: "2" },
          { id: 2, content: "4" },
          { id: 3, content: "6" },
          { id: 4, content: "8" }
        ],
        correctOption: 1,
        explanation: "f(x) = 2x² - 8x + 10 = 2(x² - 4x + 5) = 2(x - 2)² + 2. Giá trị nhỏ nhất đạt được tại x = 2 và bằng 2."
      },
      {
        id: 3,
        order: 3,
        content: "Đạo hàm của hàm số f(x) = 2x³ - 3x² + 4x - 5 là:",
        type: "single",
        difficulty: "medium",
        options: [
          { id: 1, content: "f'(x) = 6x² - 6x + 4" },
          { id: 2, content: "f'(x) = 6x² - 9x + 4" },
          { id: 3, content: "f'(x) = 6x² - 6x - 4" },
          { id: 4, content: "f'(x) = 6x - 6x² + 4" }
        ],
        correctOption: 1,
        explanation: "f'(x) = 6x² - 6x + 4"
      },
      {
        id: 4,
        order: 4,
        content: "Diện tích hình phẳng giới hạn bởi đường cong y = x² và đường thẳng y = 4 là:",
        type: "single",
        difficulty: "hard",
        options: [
          { id: 1, content: "16/3 (đơn vị diện tích)" },
          { id: 2, content: "8/3 (đơn vị diện tích)" },
          { id: 3, content: "4 (đơn vị diện tích)" },
          { id: 4, content: "16 (đơn vị diện tích)" }
        ],
        correctOption: 1,
        explanation: "Đường cong y = x² và đường thẳng y = 4 cắt nhau tại hai điểm có hoành độ x = -2 và x = 2. Diện tích cần tính là: S = ∫₍₋₂₎^2 (4 - x²) dx = [4x - x³/3]₍₋₂₎^2 = (8 - 8/3) - (-8 - (-8/3)) = 16/3."
      },
      {
        id: 5,
        order: 5,
        content: "Cho hình chóp S.ABC có đáy là tam giác đều ABC cạnh a, các mặt bên là tam giác đều. Thể tích của hình chóp S.ABC là:",
        type: "single",
        difficulty: "hard",
        options: [
          { id: 1, content: "a³/6" },
          { id: 2, content: "a³/3√2" },
          { id: 3, content: "a³√2/12" },
          { id: 4, content: "a³/3" }
        ],
        correctOption: 2,
        explanation: "Vì các mặt bên là tam giác đều nên chiều cao h của hình chóp bằng cạnh a. Thể tích hình chóp: V = (1/3) × S_đáy × h = (1/3) × (a²√3/4) × a = a³/3√2."
      }
    ]
  };
  
  // Mock data cho kết quả bài thi
  export const mockExamResult = {
    id: 101,
    examId: 1,
    userId: 1,
    score: 80,
    totalCorrect: 4,
    totalQuestions: 5,
    timeTaken: 65, // phút
    completedAt: "2023-04-15T10:45:00.000Z",
    answers: [
      { questionId: 1, selectedOption: 2, isCorrect: true },
      { questionId: 2, selectedOption: 1, isCorrect: true },
      { questionId: 3, selectedOption: 3, isCorrect: false },
      { questionId: 4, selectedOption: 1, isCorrect: true },
      { questionId: 5, selectedOption: 2, isCorrect: true }
    ]
  };