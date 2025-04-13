import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const NavContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const QuestionButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  border: 2px solid ${props => {
    if (props.isActive) return '#3182ce';
    if (props.isAnswered) return '#48bb78';
    return props.theme === 'dark' ? '#4a5568' : '#e2e8f0';
  }};
  background-color: ${props => {
    if (props.isActive) return props.theme === 'dark' ? '#3182ce' : '#4299e1';
    if (props.isAnswered) return props.theme === 'dark' ? '#38a169' : '#48bb78';
    return props.theme === 'dark' ? '#2d3748' : '#ffffff';
  }};
  color: ${props => {
    if (props.isActive || props.isAnswered) return '#ffffff';
    return props.theme === 'dark' ? '#e2e8f0' : '#2d3748';
  }};
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    background-color: ${props => {
      if (props.isActive) return '#2b6cb0';
      if (props.isAnswered) return '#2f855a';
      return props.theme === 'dark' ? '#4a5568' : '#edf2f7';
    }};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const QuestionNavigation = ({ 
  totalQuestions,
  currentQuestion,
  answeredQuestions = [],
  onQuestionSelect,
  theme
}) => {
  const handleQuestionClick = (questionNumber) => {
    onQuestionSelect(questionNumber);
  };
  
  return (
    <NavContainer>
      {[...Array(totalQuestions).keys()].map(index => {
        const questionNumber = index + 1;
        const isActive = currentQuestion === questionNumber;
        const isAnswered = answeredQuestions.includes(questionNumber);
        
        return (
          <QuestionButton
            key={questionNumber}
            isActive={isActive}
            isAnswered={isAnswered}
            theme={theme}
            onClick={() => handleQuestionClick(questionNumber)}
            whileTap={{ scale: 0.95 }}
          >
            {questionNumber}
          </QuestionButton>
        );
      })}
    </NavContainer>
  );
};

export default QuestionNavigation;