import { demoExams, demoQuestions } from './examData';

// Các đề thi mẫu từ examData.js
export const mockExams = demoExams;

// Format lại câu hỏi từ demoQuestions để phù hợp với giao diện
export const formatQuestionsForExam = (examId) => {
  if (!demoQuestions[examId]) {
    return [];
  }

  return demoQuestions[examId].map(question => ({
    id: question.id,
    content: question.content,
    text: question.content,
    type: question.questionType,
    options: question.options.map(opt => opt.content),
    correctAnswer: question.options.findIndex(opt => opt.isCorrect),
    explanation: question.explanation,
    questionIndex: question.questionIndex
  }));
};