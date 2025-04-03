import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const FilterContainer = styled(motion.div)`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : '#f8f9fa'};
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterTitle = styled.h3`
  font-size: 1.2rem;
  margin: 0 0 1rem 0;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  width: 100%;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 8px;
  background: ${props => props.theme === 'dark' ? '#333' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  min-width: 200px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
  }
`;

const SelectContainer = styled.div`
  position: relative;
  min-width: 150px;
  
  &::after {
    content: '⌄';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    font-size: 1.2rem;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  }
`;

const Select = styled.select`
  appearance: none;
  width: 100%;
  padding: 0.75rem 2rem 0.75rem 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 8px;
  background: ${props => props.theme === 'dark' ? '#333' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  font-size: 1rem;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
  }
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#555'};
  font-size: 0.9rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ClearButton = styled.button`
  background: ${props => props.theme === 'dark' ? '#444' : '#f1f1f1'};
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  font-weight: 500;
  align-self: flex-end;
  
  &:hover {
    background: ${props => props.theme === 'dark' ? '#555' : '#e2e2e2'};
  }
  
  @media (max-width: 768px) {
    align-self: stretch;
  }
`;

const SubjectFilter = ({ filters, onChange, theme }) => {
  const handleClearFilters = () => {
    // Create reset event objects for each input field
    const resetGrade = { target: { name: 'grade', value: '' } };
    const resetSearch = { target: { name: 'search', value: '' } };
    const resetSortBy = { target: { name: 'sortBy', value: 'name' } };
    
    // Apply the resets through the onChange handler
    onChange(resetGrade);
    onChange(resetSearch);
    onChange(resetSortBy);
  };

  return (
    <FilterContainer 
      theme={theme}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <FilterTitle theme={theme}>Bộ lọc môn học</FilterTitle>
      
      <FilterGroup>
        <FilterLabel theme={theme} htmlFor="search">Tìm kiếm</FilterLabel>
        <SearchInput
          type="text"
          id="search"
          placeholder="Tìm kiếm môn học..."
          name="search"
          value={filters.search}
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
            value={filters.grade}
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
        <FilterLabel theme={theme} htmlFor="sortBy">Sắp xếp</FilterLabel>
        <SelectContainer theme={theme}>
          <Select
            id="sortBy"
            name="sortBy"
            value={filters.sortBy}
            onChange={onChange}
            theme={theme}
          >
            <option value="name">Theo tên A-Z</option>
            <option value="popular">Phổ biến nhất</option>
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </Select>
        </SelectContainer>
      </FilterGroup>
      
      <ClearButton theme={theme} onClick={handleClearFilters} type="button">
        Xóa bộ lọc
      </ClearButton>
    </FilterContainer>
  );
};

export default SubjectFilter;
