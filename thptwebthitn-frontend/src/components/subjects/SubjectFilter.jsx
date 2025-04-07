import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const FilterContainer = styled(motion.div)`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  background-color: ${props => props.theme === 'dark' ? '#2d2d2d' : 'white'};
  padding: 1.75rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1.5rem;
  }
`;

const FilterTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 1.25rem 0;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  width: 100%;
  position: relative;
  padding-bottom: 0.75rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(45deg, #4285f4, #34a853);
    border-radius: 3px;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.85rem 1.25rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#3d4852' : '#e2e8f0'};
  border-radius: 8px;
  background: ${props => props.theme === 'dark' ? '#1a202c' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  min-width: 250px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.2);
  }
`;

const SelectContainer = styled.div`
  position: relative;
  min-width: 180px;
  flex: 1;
  
  &::after {
    content: '⌄';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    font-size: 1.2rem;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Select = styled.select`
  appearance: none;
  width: 100%;
  padding: 0.85rem 2.5rem 0.85rem 1.25rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#3d4852' : '#e2e8f0'};
  border-radius: 8px;
  background: ${props => props.theme === 'dark' ? '#1a202c' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.2);
  }
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
  font-size: 0.95rem;
  font-weight: 500;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ClearButton = styled.button`
  background: ${props => props.theme === 'dark' ? '#1a202c' : '#edf2f7'};
  border: 1px solid ${props => props.theme === 'dark' ? '#3d4852' : '#e2e8f0'};
  padding: 0.85rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  font-weight: 500;
  transition: all 0.2s ease;
  align-self: flex-end;
  
  &:hover {
    background: ${props => props.theme === 'dark' ? '#2d3748' : '#e2e8f0'};
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    margin-top: 0.5rem;
  }
`;

const SubjectFilter = ({ filters, onChange, onClear, theme }) => {
  return (
    <FilterContainer 
      theme={theme}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <FilterTitle theme={theme}>Tìm kiếm môn học phù hợp</FilterTitle>
      
      <FilterGroup>
        <FilterLabel theme={theme} htmlFor="search">Tìm kiếm theo tên</FilterLabel>
        <SearchInput
          type="text"
          id="search"
          placeholder="Nhập tên môn học..."
          name="search"
          value={filters.search || ''}
          onChange={onChange}
          theme={theme}
        />
      </FilterGroup>
      
      <FilterGroup>
        <FilterLabel theme={theme} htmlFor="grade">Khối lớp</FilterLabel>
        <SelectContainer theme={theme}>
          <Select
            id="grade"
            name="grade"
            value={filters.grade || ''}
            onChange={onChange}
            theme={theme}
          >
            <option value="">Tất cả khối lớp</option>
            <option value="10">Lớp 10</option>
            <option value="11">Lớp 11</option>
            <option value="12">Lớp 12</option>
          </Select>
        </SelectContainer>
      </FilterGroup>

      <FilterGroup>
        <FilterLabel theme={theme} htmlFor="sortBy">Sắp xếp theo</FilterLabel>
        <SelectContainer theme={theme}>
          <Select
            id="sortBy"
            name="sortBy"
            value={filters.sortBy || 'name'}
            onChange={onChange}
            theme={theme}
          >
            <option value="name">Tên A-Z</option>
            <option value="popular">Phổ biến nhất</option>
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </Select>
        </SelectContainer>
      </FilterGroup>
      
      <ClearButton theme={theme} onClick={onClear} type="button">
        Xóa bộ lọc
      </ClearButton>
    </FilterContainer>
  );
};

export default SubjectFilter;