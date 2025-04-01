import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const QuestionContainer = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  width: 100%;
  max-width: 800px;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const QuestionNumber = styled.span`
  font-weight: 600;
  color: #007bff;
  font-size: 1.1rem;
`;

const QuestionDifficulty = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${props => {
    switch (props.difficulty) {
      case 'easy':
        return '#d4edda';
      case 'medium':
        return '#fff3cd';
      case 'hard':
        return '#f8d7da';
      default:
        return '#e2e3e5';
    }
  }};
  color: ${props => {
    switch (props.difficulty) {
      case 'easy':
        return '#155724';
      case 'medium':
        return '#856404';
      case 'hard':
        return '#721c24';
      default:
        return '#383d41';
    }
  }};
`;

const QuestionText = styled.div`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  
  img {
    max-width: 100%;
    margin: 10px 0;
    border-radius: 5px;
  }
  
  .math-formula {
    font-style: italic;
    padding: 5px;
    background-color: ${props => props.theme === 'dark' ? '#333' : '#f8f9fa'};
    border-radius: 3px;
  }
`;

const AnswersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AnswerOption = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 12px 15px;
  border-radius: 8px;
  cursor: pointer;
  background-color: ${props => {
    if (props.isRevealed) {
      if (props.isCorrect) {
        return props.theme === 'dark' ? '#1e4620' : '#d4edda';
      } else if (props.isSelected && !props.isCorrect) {
        return props.theme === 'dark' ? '#541e1e' : '#f8d7da';
      }
    }
    return props.isSelected 
      ? props.theme === 'dark' ? '#3a506b' : '#e2f0ff' 
      : props.theme === 'dark' ? '#333' : '#f8f9fa';
  }};
  border: 1px solid ${props => {
    if (props.isRevealed) {
      if (props.isCorrect) {
        return props.theme === 'dark' ? '#2a5d2a' : '#c3e6cb';
      } else if (props.isSelected && !props.isCorrect) {
        return props.theme === 'dark' ? '#742a2a' : '#f5c6cb';
      }
    }
    return props.isSelected 
      ? props.theme === 'dark' ? '#4a6282' : '#b8daff' 
      : props.theme === 'dark' ? '#444' : '#dee2e6';
  }};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => {
      if (props.isRevealed) {
        if (props.isCorrect) {
          return props.theme === 'dark' ? '#1e4620' : '#d4edda';
        } else if (props.isSelected && !props.isCorrect) {
          return props.theme === 'dark' ? '#541e1e' : '#f8d7da';
        }
      }
      return props.theme === 'dark' ? '#3a506b' : '#e2f0ff';
    }};
  }
`;

const OptionLabel = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background-color: ${props => {
    if (props.isRevealed) {
      if (props.isCorrect) {
        return props.theme === 'dark' ? '#2a5d2a' : '#28a745';
      } else if (props.isSelected && !props.isCorrect) {
        return props.theme === 'dark' ? '#742a2a' : '#dc3545';
      }
    }
    return props.theme === 'dark' ? '#4a6282' : '#007bff';
  }};
  color: white;
  font-weight: 600;
  margin-right: 12px;
  flex-shrink: 0;
`;

const OptionText = styled.span`
  color: ${props => {
    if (props.isRevealed) {
      if (props.isCorrect) {
        return props.theme === 'dark' ? '#8eff8e' : '#155724';
      } else if (props.isSelected && !props.isCorrect) {
        return props.theme === 'dark' ? '#ff8e8e' : '#721c24';
      }
    }
    return props.theme === 'dark' ? '#e2e8f0' : '#333';
  }};
  line-height: 1.5;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  margin-top: 20px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #0069d9;
  }
  
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const ExplanationBox = styled.div`
  margin-top: 20px;
  padding: 15px;
  border-radius: 5px;
  background-color: ${props => props.theme === 'dark' ? '#333' : '#f8f9fa'};
  border-left: 4px solid #007bff;
  
  h4 {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
    margin-top: 0;
    margin-bottom: 10px;
  }
  
  p {
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#6c757d'};
    margin: 0;
    line-height: 1.5;
  }
`;

const getDifficultyLabel = (difficulty) => {
  switch (difficulty) {
    case 'easy':
      return 'Dễ';
    case 'medium':
      return 'Trung bình';
    case 'hard':
      return 'Khó';
    default:
      return 'Không xác định';
  }
};

const QuestionCard = ({ 
  question, 
  number, 
  theme, 
  onAnswerSelected,
  showExplanation = false,
  isPracticeMode = false
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  
  const handleSelectAnswer = (index) => {
    if (answerRevealed && !isPracticeMode) return;
    
    setSelectedAnswer(index);
    
    if (onAnswerSelected) {
      onAnswerSelected(question.id, index);
    }
  };
  
  const handleCheckAnswer = () => {
    setAnswerRevealed(true);
  };
  
  return (
    <QuestionContainer
      theme={theme}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <QuestionHeader>
        <QuestionNumber>Câu {number}</QuestionNumber>
        <QuestionDifficulty difficulty={question.difficulty}>
          {getDifficultyLabel(question.difficulty)}
        </QuestionDifficulty>
      </QuestionHeader>
      
      <QuestionText 
        theme={theme}
        dangerouslySetInnerHTML={{ __html: question.questionText }}
      />
      
      <AnswersList>
        {question.answers.map((answer, index) => (
          <AnswerOption
            key={index}
            theme={theme}
            isSelected={selectedAnswer === index}
            isRevealed={answerRevealed}
            isCorrect={index === question.correctAnswer}
            onClick={() => handleSelectAnswer(index)}
          >
            <OptionLabel
              theme={theme}
              isSelected={selectedAnswer === index}
              isRevealed={answerRevealed}
              isCorrect={index === question.correctAnswer}
            >
              {String.fromCharCode(65 + index)}
            </OptionLabel>
            <OptionText
              theme={theme}
              isSelected={selectedAnswer === index}
              isRevealed={answerRevealed}
              isCorrect={index === question.correctAnswer}
              dangerouslySetInnerHTML={{ __html: answer }}
            />
          </AnswerOption>
        ))}
      </AnswersList>
      
      {isPracticeMode && !answerRevealed && selectedAnswer !== null && (
        <ActionButton onClick={handleCheckAnswer}>
          Kiểm tra đáp án
        </ActionButton>
      )}
      
      {answerRevealed && showExplanation && question.explanation && (
        <ExplanationBox theme={theme}>
          <h4>Giải thích:</h4>
          <p dangerouslySetInnerHTML={{ __html: question.explanation }} />
        </ExplanationBox>
      )}
    </QuestionContainer>
  );
};

export default QuestionCard;