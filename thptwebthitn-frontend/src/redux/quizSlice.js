import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  questions: [
    { id: 1, question: 'What is 2 + 2?', options: ['3', '4', '5'], correctAnswer: '4' },
    // Add more questions here
  ],
  answers: {},
  score: 0,
  totalQuestions: 0,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    submitQuiz: (state, action) => {
      const { payload: answers } = action;
      let score = 0;
      state.questions.forEach(q => {
        if (answers[q.id] === q.correctAnswer) {
          score += 1;
        }
      });

      state.answers = answers;
      state.score = score;
      state.totalQuestions = state.questions.length;
    },
  },
});

export const { submitQuiz } = quizSlice.actions;
export default quizSlice.reducer;