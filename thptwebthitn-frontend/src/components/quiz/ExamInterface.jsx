import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchExamDetails } from '../../services/api';

const ExamInterface = () => {
  const { examId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const loadExamDetails = async () => {
      const data = await fetchExamDetails(examId);
      setQuestions(data.questions);
    };
    loadExamDetails();
  }, [examId]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  return (
    <div>
      <h1>Exam Interface</h1>
      <ol>
        {questions.map((question, index) => (
          <li key={question.id}>
            <p>{question.text}</p>
            <ul>
              {question.options.map((option) => (
                <li key={option.id}>
                  <label>
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option.id}
                      checked={answers[question.id] === option.id}
                      onChange={() => handleAnswerChange(question.id, option.id)}
                    />
                    {option.text}
                  </label>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default ExamInterface;