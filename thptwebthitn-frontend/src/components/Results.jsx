import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

const ResultsContainer = styled.div`
  padding: 2rem;
`;

const Results = () => {
  const { score, totalQuestions } = useSelector(state => state.quiz);

  return (
    <ResultsContainer>
      <h2>Kết quả thi</h2>
      <p>Điểm của bạn: {score} / {totalQuestions}</p>
    </ResultsContainer>
  );
};

export default Results;