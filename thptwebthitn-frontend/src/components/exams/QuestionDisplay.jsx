import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const QuestionCard = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
`;

const QuestionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
`;

const QuestionNumber = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const QuestionDifficulty = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${props => {
    switch(props.difficulty?.toLowerCase()) {
      case 'easy': return '#c6f6d5';
      case 'medium': return '#fefcbf';
      case 'hard': return '#fed7d7';
      default: return '#e2e8f0';
    }
  }};
  color: ${props => {
    switch(props.difficulty?.toLowerCase()) {
      case 'easy': return '#22543d';
      case 'medium': return '#744210';
      case 'hard': return '#742a2a';
      default: return '#2d3748';
    }
  }};
`;

const QuestionText = styled.div`
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  img {
    max-width: 100%;
    border-radius: 5px;
    margin: 1rem 0;
  }
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OptionLabel = styled.label`
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  background-color: ${props => props.isSelected 
    ? props.theme === 'dark' ? '#3182ce20' : '#ebf8ff'
    : props.theme === 'dark' ? '#4a5568' : '#f7fafc'};
  border: 2px solid ${props => props.isSelected 
    ? '#4299e1'
    : props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a556880' : '#edf2f7'};
  }
`;

const RadioInput = styled.input`
  margin-right: 1rem;
  width: 18px;
  height: 18px;
  accent-color: #4299e1;
`;

const OptionText = styled.div`
  flex: 1;
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const OptionPrefix = styled.span`
  font-weight: 600;
  min-width: 24px;
  margin-right: 0.5rem;
`;

const QuestionImage = styled.img`
  max-width: 100%;
  border-radius: 8px;
  margin: 1rem 0;
  display: block;
`;

const QuestionDisplay = ({ question, selectedOption, onAnswerSelect, theme }) => {
  const handleOptionChange = (e) => {
    if (onAnswerSelect) {
      onAnswerSelect(question.id, parseInt(e.target.value));
    }
  };
  
  // Array of option prefixes
  const prefixes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  
  if (!question) {
    return <div>Không có câu hỏi</div>;
  }
  
  return (
    <QuestionCard
      theme={theme}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <QuestionHeader theme={theme}>
        <QuestionNumber theme={theme}>Câu hỏi {question.orderNumber || '?'}</QuestionNumber>
        {question.difficulty && (
          <QuestionDifficulty difficulty={question.difficulty}>
            {question.difficulty === 'easy' ? 'Dễ' : 
             question.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
          </QuestionDifficulty>
        )}
      </QuestionHeader>
      
      <QuestionText 
        theme={theme} 
        dangerouslySetInnerHTML={{ __html: question.content }}
      />
      
      {question.imageUrl && <QuestionImage src={question.imageUrl} alt="Question visual" />}
      
      <OptionsContainer>
        {question.options && question.options.map((option, index) => (
          <OptionLabel 
            key={option.id || index} 
            theme={theme}
            isSelected={selectedOption === option.id}
          >
            <RadioInput
              type="radio"
              name={`question-${question.id}`}
              value={option.id}
              checked={selectedOption === option.id}
              onChange={handleOptionChange}
            />
            <OptionText theme={theme}>
              <OptionPrefix>{prefixes[index]}.</OptionPrefix>
              <span dangerouslySetInnerHTML={{ __html: option.content }} />
            </OptionText>
          </OptionLabel>
        ))}
      </OptionsContainer>
    </QuestionCard>
  );
};

export default QuestionDisplay;