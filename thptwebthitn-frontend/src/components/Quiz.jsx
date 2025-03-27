import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { submitQuiz } from '../redux/quizSlice';

const QuizContainer = styled.div`
  padding: 2rem;
`;

const QuestionContainer = styled.div`
  margin-bottom: 2rem;
`;

const Timer = styled.div`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const Quiz = () => {
  const dispatch = useDispatch();
  const { questions } = useSelector(state => state.quiz);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);

    if (timeLeft <= 0) {
      clearInterval(timer);
      handleSubmit();
    }

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleSubmit = () => {
    dispatch(submitQuiz(answers));
  };

  return (
    <QuizContainer>
      <Timer>Time left: {Math.floor(timeLeft / 60)}:{timeLeft % 60}</Timer>
      {questions.map(q => (
        <QuestionContainer key={q.id}>
          <h3>{q.question}</h3>
          {q.options.map(o => (
            <label key={o}>
              <input
                type="radio"
                name={q.id}
                value={o}
                onChange={() => handleChange(q.id, o)}
              />
              {o}
            </label>
          ))}
        </QuestionContainer>
      ))}
      <button onClick={handleSubmit}>Submit</button>
    </QuizContainer>
  );
};

export default Quiz;