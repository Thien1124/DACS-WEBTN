import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import MathJax from 'react-mathjax';

const QuestionContainer = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#444' : '#eee'};
  padding-bottom: 0.75rem;
`;

const QuestionNumber = styled.span`
  font-weight: 600;
  font-size: 1.1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const QuestionText = styled.div`
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const OptionsContainer = styled.div`
  display: grid;
  gap: 1rem;
`;

const OptionItem = styled.div`
  position: relative;
  cursor: ${props => props.isReviewMode ? 'default' : 'pointer'};
`;

const OptionLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid ${props => {
    if (props.isReviewMode) {
      if (props.isCorrect) return '#28a745';
      if (props.isSelected && !props.isCorrect) return '#dc3545';
      return props.theme === 'dark' ? '#444' : '#ddd';
    }
    return props.isSelected ? '#007bff' : props.theme === 'dark' ? '#444' : '#ddd';
  }};
  background-color: ${props => {
    if (props.isReviewMode) {
      if (props.isCorrect) return props.theme === 'dark' ? '#143926' : '#d4edda';
      if (props.isSelected && !props.isCorrect) return props.theme === 'dark' ? '#3e2329' : '#f8d7da';
      return props.theme === 'dark' ? '#333' : '#f8f9fa';
    }
    return props.isSelected ? (props.theme === 'dark' ? '#173d69' : '#e6f3ff') : props.theme === 'dark' ? '#333' : '#f8f9fa';
  }};
  transition: all 0.2s ease;
  cursor: ${props => props.isReviewMode ? 'default' : 'pointer'};
  
  &:hover {
    background-color: ${props => {
      if (props.isReviewMode) {
        if (props.isCorrect) return props.theme === 'dark' ? '#143926' : '#d4edda';
        if (props.isSelected && !props.isCorrect) return props.theme === 'dark' ? '#3e2329' : '#f8d7da';
        return props.theme === 'dark' ? '#333' : '#f8f9fa';
      }
      return props.isSelected ? (props.theme === 'dark' ? '#173d69' : '#e6f3ff') : props.theme === 'dark' ? '#383838' : '#f0f0f0';
    }};
  }
`;

const OptionInput = styled.input`
  position: absolute;
  opacity: 0;
  cursor: pointer;
`;

const OptionCircle = styled.div`
  width: 24px;
  height: 24px;
  min-width: 24px;
  border-radius: 50%;
  border: 2px solid ${props => {
    if (props.isReviewMode) {
      if (props.isCorrect) return '#28a745';
      if (props.isSelected && !props.isCorrect) return '#dc3545';
      return props.theme === 'dark' ? '#666' : '#aaa';
    }
    return props.isSelected ? '#007bff' : props.theme === 'dark' ? '#666' : '#aaa';
  }};
  position: relative;
  margin-top: 1px;
  
  &::after {
    content: '';
    position: absolute;
    display: ${props => props.isSelected ? 'block' : 'none'};
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${props => {
      if (props.isReviewMode) {
        if (props.isCorrect) return '#28a745';
        return props.isSelected ? '#dc3545' : 'transparent';
      }
      return '#007bff';
    }};
  }
`;

const OptionText = styled.span`
  color: ${props => {
    if (props.isReviewMode) {
      if (props.isCorrect) return props.theme === 'dark' ? '#28a745' : '#155724';
      if (props.isSelected && !props.isCorrect) return props.theme === 'dark' ? '#dc3545' : '#721c24';
      return props.theme === 'dark' ? '#e2e8f0' : '#333';
    }
    return props.theme === 'dark' ? '#e2e8f0' : '#333';
  }};
  font-size: 1rem;
  line-height: 1.5;
  flex: 1;
`;

const ExplanationContainer = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  background-color: ${props => props.theme === 'dark' ? '#333' : '#f8f9fa'};
  border-left: 4px solid #007bff;
`;

const ExplanationTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#4da3ff' : '#007bff'};
`;

const ExplanationText = styled.div`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  font-size: 0.95rem;
  line-height: 1.6;
`;

const PerformanceIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  background-color: ${props => props.theme === 'dark' ? '#333' : '#f1f1f1'};
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#666'};
`;

function QuizQuestion({ 
  question, 
  number, 
  selectedOption, 
  onSelectOption,
  isReviewMode = false,
  correctAnswer,
  theme
}) {
  // Function to render mathematical equations in question text and options
  const renderWithMathJax = (text) => {
    // Check if text has any math expressions
    if (!text || !text.includes('$')) {
      return text;
    }

    return (
      <MathJax.Provider>
        <MathJax.Node formula={text} />
      </MathJax.Provider>
    );
  };

  return (
    <QuestionContainer
      theme={theme}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <QuestionHeader theme={theme}>
        <QuestionNumber theme={theme}>Câu {number}</QuestionNumber>
        {isReviewMode && selectedOption !== null && (
          <PerformanceIndicator theme={theme}>
            {selectedOption === correctAnswer ? (
              <>
                <span style={{ color: "#28a745" }}>✓</span> Đúng
              </>
            ) : (
              <>
                <span style={{ color: "#dc3545" }}>✗</span> Sai
              </>
            )}
          </PerformanceIndicator>
        )}
      </QuestionHeader>

      <QuestionText theme={theme}>
        {renderWithMathJax(question.text)}
      </QuestionText>

      <OptionsContainer>
        {question.options.map((option, index) => (
          <OptionItem 
            key={index} 
            isReviewMode={isReviewMode}
            onClick={() => !isReviewMode && onSelectOption(index)}
          >
            <OptionInput 
              type="radio" 
              name={`question-${number}`} 
              value={index} 
              checked={selectedOption === index} 
              onChange={() => !isReviewMode && onSelectOption(index)}
              disabled={isReviewMode}
            />
            <OptionLabel 
              theme={theme}
              isSelected={selectedOption === index}
              isReviewMode={isReviewMode}
              isCorrect={isReviewMode && index === correctAnswer}
            >
              <OptionCircle 
                theme={theme}
                isSelected={selectedOption === index}
                isReviewMode={isReviewMode}
                isCorrect={isReviewMode && index === correctAnswer}
              />
              <OptionText 
                theme={theme}
                isSelected={selectedOption === index}
                isReviewMode={isReviewMode}
                isCorrect={isReviewMode && index === correctAnswer}
              >
                {renderWithMathJax(option)}
              </OptionText>
            </OptionLabel>
          </OptionItem>
        ))}
      </OptionsContainer>

      {isReviewMode && question.explanation && (
        <ExplanationContainer theme={theme}>
          <ExplanationTitle theme={theme}>Giải thích:</ExplanationTitle>
          <ExplanationText 
            theme={theme}
            dangerouslySetInnerHTML={{ __html: question.explanation }}
          />
        </ExplanationContainer>
      )}
    </QuestionContainer>
  );
}

export default QuizQuestion;
