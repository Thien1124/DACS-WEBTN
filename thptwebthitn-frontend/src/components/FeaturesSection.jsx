import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { useSelector } from 'react-redux';

const FeaturesContainer = styled.section`
  padding: 6rem 2rem;
  background-color: ${props => props.theme === 'dark' ? '#0c0c14' : '#ffffff'};
`;

const SectionTitle = styled(motion.h2)`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#333333'};
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCard = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#1a1a2e' : '#f9f9f9'};
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, ${props => props.theme === 'dark' ? '0.3' : '0.1'});
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const FeatureIcon = styled(motion.div)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1.5rem;
  background: ${props => props.gradient};
  color: white;
  font-size: 2rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#333333'};
`;

const FeatureDescription = styled.p`
  color: ${props => props.theme === 'dark' ? '#b3b3b3' : '#666666'};
  line-height: 1.6;
`;

const features = [
  {
    icon: '📚',
    title: 'Đề thi phong phú',
    description: 'Cung cấp đa dạng các đề thi từ nhiều môn học khác nhau, bao gồm Toán, Lý, Hóa, Sinh, Văn, Sử, Địa.',
    gradient: 'linear-gradient(135deg, #ff7e5f, #feb47b)'
  },
  {
    icon: '🚀',
    title: 'Truy cập dễ dàng',
    description: 'Học sinh có thể truy cập đề thi và làm bài kiểm tra bất cứ lúc nào, từ bất kỳ thiết bị nào.',
    gradient: 'linear-gradient(135deg, #43cea2, #185a9d)'
  },
  {
    icon: '🏆',
    title: 'Chấm điểm tự động',
    description: 'Hệ thống tự động chấm điểm và cung cấp kết quả nhanh chóng, chính xác.',
    gradient: 'linear-gradient(135deg, #834d9b, #d04ed6)'
  }
];

function FeaturesSection({ animation }) {
  const { theme } = useSelector(state => state.ui);
  
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.3,
        duration: 0.8,
      }
    }),
    hover: {
      y: -10,
      boxShadow: theme === 'dark' 
        ? '0 10px 25px rgba(0, 0, 0, 0.5)' 
        : '0 10px 25px rgba(0, 0, 0, 0.2)',
      transition: { duration: 0.3 }
    }
  };

  const iconVariants = {
    pulse: {
      scale: [1, 1.1, 1],
      transition: { duration: 1.5, repeat: Infinity }
    }
  };
  
  return (
    <FeaturesContainer theme={theme}>
      <SectionTitle
        theme={theme}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        Tại sao chọn ExamDG?
      </SectionTitle>
      
      <FeaturesGrid>
        {features.map((feature, i) => (
          <FeatureCard
            key={i}
            theme={theme}
            custom={i}
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            viewport={{ once: true, margin: "-100px" }}
            variants={cardVariants}
          >
            <FeatureIcon 
              gradient={feature.gradient}
              variants={iconVariants}
              animate={animation === 'pulse' ? 'pulse' : ''}
            >
              {feature.icon}
            </FeatureIcon>
            <FeatureTitle theme={theme}>{feature.title}</FeatureTitle>
            <FeatureDescription theme={theme}>{feature.description}</FeatureDescription>
          </FeatureCard>
        ))}
      </FeaturesGrid>
    </FeaturesContainer>
  );
}

export default FeaturesSection;