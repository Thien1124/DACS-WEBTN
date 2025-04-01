import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const QuestionContainer = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid #007bff;
`;

const QuestionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const QuestionNumber = styled.div`
  background: linear-gradient(45deg, #007bff, #00d6ff);
  color: white;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 0.75rem;
  flex-shrink: 0;
`;

const QuestionText = styled.div`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  font-size: 1.1rem;
  font-weight: 500;
  line-height: 1.5;
`;

const QuestionImage = styled.img`
  max-width: 100%;
  margin: 1rem 0;
  border-radius: 8px;
  display: ${props => props.src ? 'block' : 'none'};
`;

const OptionsContainer = styled.div`
  margin-top: 1.25rem;
`;

const OptionItem = styled.div`
  position: relative;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  background-color: ${props => {
    if (props.isReview) {
      if (props.isCorrect) return props.theme === 'dark' ? '#1a462a' : '#d4edda';
      if (props.isSelected && !props.isCorrect) return props.theme === 'dark' ? '#462a2a' : '#f8d7da';
      return props.theme === 'dark' ? '#333' : '#f8f9fa';
    }
    return props.isSelected 
      ? (props.theme === 'dark' ? '#2c4369' : '#e6f0ff') 
      : (props.theme === 'dark' ? '#333' : '#f8f9fa');
  }};
  border: 1px solid ${props => {
    if (props.isReview) {
      if (props.isCorrect) return props.theme === 'dark' ? '#2e8b57' : '#28a745';
      if (props.isSelected && !props.isCorrect) return props.theme === 'dark' ? '#8b2e2e' : '#dc3545';
      return props.theme === 'dark' ? '#444' : '#dee2e6';
    }
    return props.isSelected 
      ? (props.theme === 'dark' ? '#3a5a8c' : '#007bff') 
      : (props.theme === 'dark' ? '#444' : '#dee2e6');
  }};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.isReview 
      ? (props.theme === 'dark' ? props.isSelected ? (props.isCorrect ? '#1a462a' : '#462a2a') : '#3a3a3a' : props.isSelected ? (props.isCorrect ? '#d4edda' : '#f8d7da') : '#f0f0f0') 
      : (props.theme === 'dark' ? '#3a3a3a' : '#f0f0f0')};
  }
`;

const OptionContent = styled.div`
  display: flex;
  align-items: center;
`;

const OptionLabel = styled.div`
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 0.75rem;
  flex-shrink: 0;
  color: ${props => props.isSelected ? 'white' : props.theme === 'dark' ? '#e2e8f0' : '#555'};
  background-color: ${props => props.isSelected ? '#007bff' : props.theme === 'dark' ? '#444' : '#e9ecef'};
`;

const OptionText = styled.div`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  font-size: 1rem;
  line-height: 1.4;
`;

const ExplanationContainer = styled.div`
  margin-top: 1.25rem;
  padding: 1rem;
  border-radius: 8px;
  background-color: ${props => props.theme === 'dark' ? '#2c3445' : '#f0f7ff'};
  border-left: 4px solid #007bff;
`;

const ExplanationTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#4da3ff' : '#007bff'};
`;

const ExplanationContent = styled.div`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  font-size: 0.95rem;
  line-height: 1.5;
`;

const CorrectIcon = styled.span`
  position: absolute;
  right: 1rem;
  top: 1rem;
  color: ${props => props.theme === 'dark' ? '#2ecc71' : '#28a745'};
  font-size: 1.2rem;
`;

const IncorrectIcon = styled.span`
  position: absolute;
  right: 1rem;
  top: 1rem;
  color: ${props => props.theme === 'dark' ? '#e74c3c' : '#dc3545'};
  font-size: 1.2rem;
`;

const QuizQuestion = ({ 
  theme, 
  question, 
  number, 
  onSelectOption,
  selectedOption,
  isReviewMode = false,
  correctAnswer = null
}) => {
  const handleOptionClick = (optionIndex) => {
    if (!isReviewMode) {
      onSelectOption(optionIndex);
    }
  };

  const getOptionLabel = (index) => {
    return String.fromCharCode(65 + index); // A, B, C, D...
  };

  return (
    <QuestionContainer
      theme={theme}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <QuestionHeader>
        <QuestionNumber>{number}</QuestionNumber>
        <QuestionText theme={theme} dangerouslySetInnerHTML={{ __html: question.text }} />
      </QuestionHeader>
      
      {question.image && <QuestionImage src={question.image} alt="Question" />}
      
      <OptionsContainer>
        {question.options.map((option, index) => (
          <OptionItem
            key={index}
            theme={theme}
            isSelected={selectedOption === index}
            isReview={isReviewMode}
            isCorrect={isReviewMode && correctAnswer === index}
            onClick={() => handleOptionClick(index)}
          >
            <OptionContent>
              <OptionLabel 
                theme={theme} 
                isSelected={selectedOption === index}
              >
                {getOptionLabel(index)}
              </OptionLabel>
              <OptionText theme={theme} dangerouslySetInnerHTML={{ __html: option }} />
            </OptionContent>
            
            {isReviewMode && correctAnswer === index && (
              <CorrectIcon theme={theme}>✓</CorrectIcon>
            )}
            
            {isReviewMode && selectedOption === index && selectedOption !== correctAnswer && (
              <IncorrectIcon theme={theme}>✗</IncorrectIcon>
            )}
          </OptionItem>
        ))}
      </OptionsContainer>
      
      {isReviewMode && question.explanation && (
        <ExplanationContainer theme={theme}>
          <ExplanationTitle theme={theme}>Giải thích:</ExplanationTitle>
          <ExplanationContent theme={theme} dangerouslySetInnerHTML={{ __html: question.explanation }} />
        </ExplanationContainer>
      )}
    </QuestionContainer>
  );
};

export default QuizQuestion;
