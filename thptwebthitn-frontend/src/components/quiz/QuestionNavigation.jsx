import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const NavContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
`;

const QuestionButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid ${props => props.isActive ? '#007bff' : props.isAnswered ? '#28a745' : '#dee2e6'};
  background: ${props => props.isActive ? '#007bff' : props.isAnswered ? '#28a745' : 'transparent'};
  color: ${props => (props.isActive || props.isAnswered) ? 'white' : props.theme === 'dark' ? '#e2e8f0' : '#333'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const QuestionNavigation = ({ 
  totalQuestions, 
  currentQuestion, 
  answeredQuestions,
  onQuestionSelect,
  theme 
}) => {
  return (
    <NavContainer>
      {Array.from({ length: totalQuestions }, (_, index) => (
        <QuestionButton
          key={index}
          isActive={currentQuestion === index + 1}
          isAnswered={answeredQuestions.includes(index + 1)}
          onClick={() => onQuestionSelect(index + 1)}
          theme={theme}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {index + 1}
        </QuestionButton>
      ))}
    </NavContainer>
  );
};

export default QuestionNavigation;
