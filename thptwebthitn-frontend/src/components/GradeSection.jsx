import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

const SectionContainer = styled.section`
  padding: 4rem 2rem;
  background-color: ${props => props.theme === 'dark' ? '#1a1e2b' : '#f8f9fa'};
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: linear-gradient(45deg, #007bff, #00d6ff);
  }
`;

const GradesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const GradeCard = styled(motion.div)`
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(145deg, #232a3d, #1e2433)' 
    : 'linear-gradient(145deg, #ffffff, #f0f0f0)'};
  border-radius: 15px;
  overflow: hidden;
  box-shadow: ${props => props.theme === 'dark'
    ? '0 10px 20px rgba(0,0,0,0.3)'
    : '0 10px 20px rgba(0,0,0,0.1)'};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%; /* Ensure all cards have the same height */
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: ${props => props.theme === 'dark'
      ? '0 15px 30px rgba(0,0,0,0.4)'
      : '0 15px 30px rgba(0,0,0,0.15)'};
  }
`;

const GradeHeader = styled.div`
  padding: 1.5rem;
  background: linear-gradient(45deg, ${props => props.gradientStart}, ${props => props.gradientEnd});
  text-align: center;
`;

const GradeNumber = styled.h3`
  font-size: 2.5rem;
  margin: 0;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
`;

const GradeContent = styled.div`
  padding: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Allow content to grow and fill space */
`;

const SubjectsList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
  flex-grow: 1; /* Make the list take up available space */
`;

const SubjectItem = styled.li`
  margin-bottom: 0.75rem;
  padding-left: 1.5rem;
  position: relative;
  
  &:before {
    content: '→';
    position: absolute;
    left: 0;
    color: #007bff;
  }
`;

const PracticeButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(45deg, #007bff, #00d6ff);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 123, 255, 0.2);
  margin-top: auto; /* Push button to the bottom of the card */
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 123, 255, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Updated grade data with the same number of subjects for each grade
const grades = [
  {
    number: 10,
    subjects: ['Toán học', 'Vật lý', 'Hóa học', 'Ngữ văn', 'Tiếng Anh'],
    gradientStart: '#1e3c72',
    gradientEnd: '#2a5298'
  },
  {
    number: 11,
    subjects: ['Toán nâng cao', 'Vật lý', 'Hóa học', 'Ngữ văn', 'Tiếng Anh'],
    gradientStart: '#6a3093',
    gradientEnd: '#a044ff'
  },
  {
    number: 12,
    subjects: ['Luyện thi đại học', 'Thực hành đề thi', 'Kỹ năng làm bài', 'Kỹ thuật viết luận', 'Lý thuyết trọng tâm'],
    gradientStart: '#11998e',
    gradientEnd: '#38ef7d'
  }
];

function GradeSection() {
  const { theme } = useSelector(state => state.ui);
  
  return (
    <SectionContainer theme={theme} id="courses">
      <SectionTitle className="hero-title">Các Lớp Học</SectionTitle>
      
      <GradesContainer>
        {grades.map((grade, index) => (
          <GradeCard 
            key={grade.number}
            theme={theme}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <GradeHeader 
              gradientStart={grade.gradientStart} 
              gradientEnd={grade.gradientEnd}
            >
              <GradeNumber>Lớp {grade.number}</GradeNumber>
            </GradeHeader>
            
            <GradeContent theme={theme}>
              <SubjectsList>
                {grade.subjects.map((subject, i) => (
                  <SubjectItem key={i}>{subject}</SubjectItem>
                ))}
              </SubjectsList>
              
              <PracticeButton>
                Luyện Ngay
              </PracticeButton>
            </GradeContent>
          </GradeCard>
        ))}
      </GradesContainer>
    </SectionContainer>
  );
}

export default GradeSection;