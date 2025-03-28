import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#444' : '#eaeaea'};
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.75rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const GradeHighlight = styled.span`
  background: linear-gradient(45deg, ${props => props.gradientStart}, ${props => props.gradientEnd});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
  
  &:hover {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  }
`;

const SubjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme === 'dark' ? '#333' : '#f1f1f1'};
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme === 'dark' ? '#666' : '#c1c1c1'};
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme === 'dark' ? '#888' : '#a8a8a8'};
  }
`;

const SubjectCard = styled.div`
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' 
    ? props.selected ? 'rgba(0, 123, 255, 0.2)' : 'rgba(40, 44, 52, 0.6)' 
    : props.selected ? 'rgba(0, 123, 255, 0.1)' : 'rgba(240, 240, 240, 0.6)'};
  border: 2px solid ${props => props.selected ? '#007bff' : 'transparent'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${props => props.selected 
      ? `linear-gradient(45deg, ${props.gradientStart}, ${props.gradientEnd})` 
      : 'transparent'};
    transition: all 0.2s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const SubjectTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const SubjectDescription = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#666'};
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.theme === 'dark' ? '#4a4a4a' : '#e4e4e4'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#666'};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#5a5a5a' : '#d4d4d4'};
  }
`;

const StartButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(45deg, ${props => props.gradientStart}, ${props => props.gradientEnd});
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Add more detailed descriptions for each subject
const subjectDetails = {
  'Toán học': 'Giải tích, đại số và hình học cơ bản.',
  'Toán nâng cao': 'Giải tích, đại số và hình học nâng cao.',
  'Luyện thi đại học': 'Ôn tập toàn diện các môn thi THPT Quốc gia.',
  'Vật lý': 'Cơ học, nhiệt học, điện từ học và quang học.',
  'Hóa học': 'Hóa đại cương, hóa vô cơ và hóa hữu cơ.',
  'Ngữ văn': 'Văn học Việt Nam và nước ngoài, kỹ năng làm văn.',
  'Tiếng Anh': 'Ngữ pháp, từ vựng và các kỹ năng ngôn ngữ.',
  'Thực hành đề thi': 'Làm quen với cấu trúc đề thi và thời gian.',
  'Kỹ năng làm bài': 'Phương pháp giải nhanh và hiệu quả.',
  'Kỹ thuật viết luận': 'Cách trình bày bài văn nghị luận, phân tích.',
  'Lý thuyết trọng tâm': 'Tổng hợp kiến thức cốt lõi các môn học.'
};

const SubjectSelectionModal = ({ isOpen, onClose, gradeInfo, theme }) => {
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
  };
  
  const handleStartPractice = () => {
    if (selectedSubject) {
      // In a real app, you would navigate to the practice page for the selected subject
      alert(`Bắt đầu luyện tập ${selectedSubject} cho Lớp ${gradeInfo.number}!`);
      onClose();
    } else {
      alert('Vui lòng chọn một môn học để bắt đầu!');
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContent
            theme={theme}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle>
                Chọn môn học cho <GradeHighlight
                  gradientStart={gradeInfo.gradientStart}
                  gradientEnd={gradeInfo.gradientEnd}
                >
                  Lớp {gradeInfo.number}
                </GradeHighlight>
              </ModalTitle>
              <CloseButton theme={theme} onClick={onClose}>✕</CloseButton>
            </ModalHeader>
            
            <SubjectsGrid theme={theme}>
              {gradeInfo.subjects.map((subject, index) => (
                <SubjectCard
                  key={index}
                  theme={theme}
                  selected={selectedSubject === subject}
                  gradientStart={gradeInfo.gradientStart}
                  gradientEnd={gradeInfo.gradientEnd}
                  onClick={() => handleSelectSubject(subject)}
                >
                  <SubjectTitle theme={theme}>
                    {subject}
                  </SubjectTitle>
                  <SubjectDescription theme={theme}>
                    {subjectDetails[subject] || 'Luyện tập và nâng cao kỹ năng.'}
                  </SubjectDescription>
                </SubjectCard>
              ))}
            </SubjectsGrid>
            
            <ButtonRow>
              <CancelButton theme={theme} onClick={onClose}>
                Hủy
              </CancelButton>
              <StartButton 
                gradientStart={gradeInfo.gradientStart}
                gradientEnd={gradeInfo.gradientEnd}
                onClick={handleStartPractice}
              >
                Bắt đầu luyện tập
              </StartButton>
            </ButtonRow>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default SubjectSelectionModal;