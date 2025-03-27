import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

const GradeSectionContainer = styled.section`
  padding: 5rem 0;
  background-image: linear-gradient(135deg, #ffffff, #f0f2f5);
  
  ${props => props.theme === 'dark' && `
    background-image: linear-gradient(135deg, #1a1a1a, #2d2d2d);
  `}
`;

const GradeCardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin-top: 3rem;
`;

const GradeCard = styled(motion.div)`
  background: ${props => props.variant === 'grade10' 
    ? 'linear-gradient(135deg, #4CC9F0, #4361EE)' 
    : props.variant === 'grade11' 
    ? 'linear-gradient(135deg, #F72585, #7209B7)' 
    : 'linear-gradient(135deg, #FFBE0B, #FB5607)'};
  color: white;
  border-radius: 16px;
  padding: 2.5rem;
  width: 300px;
  height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  }
`;

const GradeTitle = styled.h3`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 800;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
`;

const GradeDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const SubjectsList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin-bottom: 2rem;
`;

const Subject = styled.li`
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  
  &:before {
    content: "✓";
    color: white;
    font-weight: bold;
    margin-right: 10px;
  }
`;

const PracticeButton = styled(motion.button)`
  background: white;
  color: ${props => props.variant === 'grade10' ? '#4361EE' : props.variant === 'grade11' ? '#7209B7' : '#FB5607'};
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  align-self: center;
  width: 100%;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  }
`;

const GradeLevels = ({ animation }) => {
  const { theme } = useSelector(state => state.ui);
  
  const getAnimationProps = () => {
    switch(animation) {
      case 'fadeIn':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.8 }
        };
      case 'slideUp':
        return {
          initial: { y: 50, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { duration: 0.8 }
        };
      case 'pulse':
        return {
          animate: { scale: [1, 1.02, 1] },
          transition: { duration: 2, repeat: Infinity }
        };
      default:
        return {};
    }
  };
  
  const gradeInfo = [
    {
      grade: "Lớp 10",
      variant: "grade10",
      description: "Bắt đầu chuẩn bị cho hành trình THPT với những kiến thức nền tảng vững chắc",
      subjects: ["Toán học", "Vật lý", "Hóa học", "Sinh học", "Ngữ văn"]
    },
    {
      grade: "Lớp 11",
      variant: "grade11",
      description: "Tiếp tục hành trình với những kiến thức chuyên sâu và rèn luyện kỹ năng",
      subjects: ["Toán học", "Vật lý", "Hóa học", "Sinh học", "Ngữ văn"]
    },
    {
      grade: "Lớp 12",
      variant: "grade12",
      description: "Ôn luyện toàn diện, sẵn sàng cho kỳ thi THPT Quốc gia",
      subjects: ["Toán học", "Vật lý", "Hóa học", "Sinh học", "Ngữ văn"]
    }
  ];

  const animationProps = getAnimationProps();
  
  return (
    <GradeSectionContainer theme={theme}>
      <div className="container">
        <motion.h2 
          className="section-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Chương Trình Học Các Lớp
        </motion.h2>
        
        <GradeCardsContainer>
          {gradeInfo.map((info, index) => (
            <GradeCard 
              key={index} 
              variant={info.variant}
              {...animationProps}
              transition={{
                ...animationProps.transition,
                delay: index * 0.2
              }}
            >
              <div>
                <GradeTitle>{info.grade}</GradeTitle>
                <GradeDescription>{info.description}</GradeDescription>
                
                <SubjectsList>
                  {info.subjects.map((subject, idx) => (
                    <Subject key={idx}>{subject}</Subject>
                  ))}
                </SubjectsList>
              </div>
              
              <PracticeButton
                variant={info.variant}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Luyện Ngay
              </PracticeButton>
            </GradeCard>
          ))}
        </GradeCardsContainer>
      </div>
    </GradeSectionContainer>
  );
};

export default GradeLevels;