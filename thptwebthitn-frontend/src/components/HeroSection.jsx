import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';

const HeroContainer = styled.section`
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #1a1e2b, #121212)'
    : 'linear-gradient(135deg, #f6f9fc, #eef1f5)'};
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
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#2c3e50'};
  
  span {
    background: linear-gradient(45deg, #007bff, #00d6ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#666'};
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
  background: linear-gradient(45deg, #007bff, #00d6ff);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 123, 255, 0.2);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 123, 255, 0.3);
  }
`;

const SecondaryButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#007bff'};
  border: 2px solid ${props => props.theme === 'dark' ? '#ffffff' : '#007bff'};
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,123,255,0.1)'};
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
      ? '0 10px 30px rgba(0,0,0,0.5)' 
      : '0 10px 30px rgba(0,0,0,0.15)'};
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
  
  return (
    <HeroContainer theme={theme} id="home">
      <HeroContent>
        <HeroText>
          <HeroTitle 
            theme={theme}
            animate={animationVariants[animation]}
          >
            Học tập hiệu quả với <span>LearnDG</span>
          </HeroTitle>
          
          <HeroSubtitle 
            theme={theme}
            animate={animationVariants[animation]}
          >
            Nền tảng học trực tuyến hàng đầu với đầy đủ tài liệu, 
            bài giảng và đề thi cho học sinh từ lớp 10 đến lớp 12
          </HeroSubtitle>
          
          <ButtonGroup>
            <PrimaryButton 
              animate={animationVariants[animation]}
            >
              Bắt đầu học
            </PrimaryButton>
            
            <SecondaryButton 
              theme={theme}
              animate={animationVariants[animation]}
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
    </HeroContainer>
  );
}

export default HeroSection;