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
  max-width: 700px;
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

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const SelectWrapper = styled.div`
  flex: 1;
  min-width: 150px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#555'};
  font-size: 0.9rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  background-color: ${props => props.theme === 'dark' ? '#333' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #00bcd4;
    box-shadow: 0 0 0 2px rgba(0, 188, 212, 0.25);
  }
`;

const ExamList = styled.div`
  margin-top: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
  
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

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
  
  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 1rem;
    color: ${props => props.theme === 'dark' ? '#666' : '#ccc'};
  }
  
  h3 {
    margin-bottom: 0.5rem;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#555'};
  }
  
  p {
    font-size: 0.9rem;
  }
`;

const ExamListModal = ({ isOpen, onClose, theme }) => {
  const [filters, setFilters] = useState({
    grade: '',
    subject: ''
  });
  
  // Available grades for filter dropdown
  const grades = [
    { value: '10', label: 'Lớp 10' },
    { value: '11', label: 'Lớp 11' },
    { value: '12', label: 'Lớp 12' }
  ];
  
  // Available subjects for filter dropdown
  const subjects = [
    { value: 'toan', label: 'Toán học' },
    { value: 'ly', label: 'Vật lý' },
    { value: 'hoa', label: 'Hóa học' },
    { value: 'van', label: 'Ngữ văn' },
    { value: 'anh', label: 'Tiếng Anh' },
    { value: 'sinh', label: 'Sinh học' },
    { value: 'su', label: 'Lịch sử' },
    { value: 'dia', label: 'Địa lý' }
  ];
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
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
                Danh sách đề thi
              </ModalTitle>
              <CloseButton theme={theme} onClick={onClose}>✕</CloseButton>
            </ModalHeader>
            
            <FilterSection>
              <SelectWrapper>
                <Label theme={theme} htmlFor="grade">Chọn lớp</Label>
                <Select 
                  theme={theme} 
                  id="grade" 
                  name="grade"
                  value={filters.grade} 
                  onChange={handleFilterChange}
                >
                  <option value="">Tất cả các lớp</option>
                  {grades.map(grade => (
                    <option key={grade.value} value={grade.value}>
                      {grade.label}
                    </option>
                  ))}
                </Select>
              </SelectWrapper>
              
              <SelectWrapper>
                <Label theme={theme} htmlFor="subject">Chọn môn học</Label>
                <Select 
                  theme={theme} 
                  id="subject" 
                  name="subject"
                  value={filters.subject} 
                  onChange={handleFilterChange}
                >
                  <option value="">Tất cả các môn</option>
                  {subjects.map(subject => (
                    <option key={subject.value} value={subject.value}>
                      {subject.label}
                    </option>
                  ))}
                </Select>
              </SelectWrapper>
            </FilterSection>
            
            <ExamList theme={theme}>
              <EmptyState theme={theme}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3>Chưa có đề thi nào</h3>
                <p>Hệ thống đang được cập nhật đề thi từ backend. Vui lòng quay lại sau!</p>
              </EmptyState>
            </ExamList>
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default ExamListModal;