import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import ExamListModal from '../modals/ExamListModal'; // Updated path to the ExamListModal component

const HeroContainer = styled.section`
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #1e3c72, #2a5298)'
    : 'linear-gradient(135deg, #e0f7fa, #80deea)'};
  padding: 2rem;
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const HeroText = styled.div`
  @media (max-width: 992px) {
    order: 2;
  }
`;

const HeroTitle = styled(motion.h1)`
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#00796b'};
  
  span {
    background: linear-gradient(45deg, #00bcd4, #009688);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: ${props => props.theme === 'dark' ? '#b0bec5' : '#00796b'};
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 992px) {
    justify-content: center;
  }
`;

const PrimaryButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(45deg, #00bcd4, #009688);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 188, 212, 0.2);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 150, 136, 0.3);
  }
`;

const SecondaryButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#00bcd4'};
  border: 2px solid ${props => props.theme === 'dark' ? '#ffffff' : '#00bcd4'};
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,188,212,0.1)'};
    transform: translateY(-3px);
  }
`;

const HeroImage = styled(motion.div)`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    box-shadow: ${props => props.theme === 'dark' 
      ? '0 10px 30px rgba(0, 0, 0, 0.5)' 
      : '0 10px 30px rgba(0, 0, 0, 0.15)'};
  }
  
  @media (max-width: 992px) {
    order: 1;
  }
`;

const animationVariants = {
  fadeIn: {
    opacity: [0, 1],
    transition: { duration: 1 }
  },
  slideUp: {
    opacity: [0, 1],
    y: [50, 0],
    transition: { duration: 1 }
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: { duration: 1, repeat: Infinity, repeatDelay: 0.5 }
  },
  idle: {}
};

function HeroSection({ animation = 'idle' }) {
  const { theme } = useSelector(state => state.ui);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  
  const handleStartExam = () => {
    setIsExamModalOpen(true);
  };
  
  const handleCloseExamModal = () => {
    setIsExamModalOpen(false);
  };
  
  const handleLearnMore = () => {
    // Scroll to the about section
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <HeroContainer theme={theme} id="home">
      <HeroContent>
        <HeroText>
          <HeroTitle 
            theme={theme}
            animate={animationVariants[animation]}
          >
            Nền tảng <span>thi trắc nghiệm</span> trực tuyến
          </HeroTitle>
          
          <HeroSubtitle 
            theme={theme}
            animate={animationVariants[animation]}
          >
            Nền tảng thi trắc nghiệm trực tuyến hàng đầu cho học sinh trung học phổ thông với đầy đủ các đề thi và bài kiểm tra.
          </HeroSubtitle>
          
          <ButtonGroup>
            <PrimaryButton 
              animate={animationVariants[animation]}
              onClick={handleStartExam}
            >
              Bắt đầu thi
            </PrimaryButton>
            
            <SecondaryButton 
              theme={theme}
              animate={animationVariants[animation]}
              onClick={handleLearnMore}
            >
              Tìm hiểu thêm
            </SecondaryButton>
          </ButtonGroup>
        </HeroText>
        
        <HeroImage 
          theme={theme}
          animate={animationVariants[animation]}
        >
          <img 
            src="https://img.freepik.com/free-vector/students-watching-webinar-computer-studying-online_74855-15522.jpg" 
            alt="Học sinh đang học trực tuyến" 
          />
        </HeroImage>
      </HeroContent>
      
      {/* Exam List Modal */}
      <ExamListModal
        isOpen={isExamModalOpen}
        onClose={handleCloseExamModal}
        theme={theme}
      />
    </HeroContainer>
  );
}

export default HeroSection;