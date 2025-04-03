import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getAllSubjects } from '../../services/subjectService';
import SubjectFilter from './SubjectFilter';
import LoadingSpinner from '../common/LoadingSpinner';

const Container = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FilterLabel = styled.label`
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#555'};
  white-space: nowrap;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 4px;
  background-color: ${props => props.theme === 'dark' ? '#333' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 4px;
  background-color: ${props => props.theme === 'dark' ? '#333' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  flex: 1;
  min-width: 250px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SubjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const SubjectCard = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }
`;

const SubjectImage = styled.div`
  height: 160px;
  background-image: ${props => `url(${props.image})`};
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6));
  }
`;

const SubjectGradeBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: rgba(0, 123, 255, 0.9);
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const SubjectContent = styled.div`
  padding: 1.25rem;
`;

const SubjectTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const SubjectDescription = styled.p`
  font-size: 0.9rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;  
  overflow: hidden;
`;

const SubjectMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#444' : '#eee'};
  padding-top: 1rem;
  margin-top: 0.5rem;
`;

const SubjectTests = styled.span`
  font-size: 0.85rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
`;

const ViewButton = styled(Link)`
  background: linear-gradient(45deg, #007bff, #00d6ff);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(45deg, #0069d9, #00c2e6);
    transform: translateY(-2px);
  }
`;

const NoResultsMessage = styled.div`
  text-align: center;
  padding: 2rem;
  width: 100%;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
  font-size: 1.1rem;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const PaginationButton = styled.button`
  background-color: ${props => props.active ? '#007bff' : props.theme === 'dark' ? '#2a2a2a' : 'white'};
  color: ${props => props.active ? 'white' : props.theme === 'dark' ? '#e2e8f0' : '#555'};
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  padding: 0.5rem 1rem;
  margin: 0 0.25rem;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active ? '#007bff' : props.theme === 'dark' ? '#333' : '#f5f5f5'};
  }
`;

const SubjectList = ({ theme }) => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [filters, setFilters] = useState({
    grade: '',
    search: '',
    sortBy: 'name'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSubjects();
  }, [filters.grade, filters.sortBy, pagination.currentPage]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (filters.search !== undefined) {
        fetchSubjects();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filters.search]);

  const fetchSubjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAllSubjects({
        ...filters,
        page: pagination.currentPage,
        limit: 12
      });
      
      setSubjects(result.data);
      setFilteredSubjects(result.data);
      setPagination({
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalItems: result.totalItems
      });
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Không thể tải danh sách môn học. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name !== 'search') {
      setPagination(prev => ({
        ...prev,
        currentPage: 1
      }));
    }
  };

  const resetFilters = () => {
    setFilters({
      grade: '',
      search: '',
      sortBy: 'name'
    });
    
    setPagination(prev => ({
      ...prev, 
      currentPage: 1
    }));
    
    // Refetch subjects with cleared filters
    fetchSubjects({ grade: '', search: '', sortBy: 'name', page: 1, limit: 12 });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  const formatGradeLabel = (grade) => {
    return `Lớp ${grade}`;
  };

  return (
    <Container
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SubjectFilter 
        filters={filters} 
        onChange={handleFilterChange}
        onClear={resetFilters}
        theme={theme} 
      />
      
      {error && (
        <div style={{ textAlign: 'center', padding: '1rem', color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <LoadingSpinner />
          <p>Đang tải danh sách môn học...</p>
        </div>
      ) : filteredSubjects.length > 0 ? (
        <>
          <SubjectsGrid>
            {filteredSubjects.map(subject => (
              <SubjectCard 
                key={subject.id} 
                theme={theme}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <SubjectImage image={subject.image}>
                  <SubjectGradeBadge>{formatGradeLabel(subject.grade)}</SubjectGradeBadge>
                </SubjectImage>
                
                <SubjectContent>
                  <SubjectTitle theme={theme}>{subject.title}</SubjectTitle>
                  <SubjectDescription theme={theme}>{subject.description}</SubjectDescription>
                  
                  <SubjectMeta theme={theme}>
                    <SubjectTests theme={theme}>{subject.testsCount} bài thi</SubjectTests>
                    <ViewButton to={`/subjects/${subject.id}`}>Xem chi tiết</ViewButton>
                  </SubjectMeta>
                </SubjectContent>
              </SubjectCard>
            ))}
          </SubjectsGrid>
          
          {pagination.totalPages > 1 && (
            <PaginationContainer>
              <PaginationButton 
                theme={theme}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                &laquo; Trước
              </PaginationButton>
              
              {[...Array(pagination.totalPages).keys()].map(pageNum => (
                <PaginationButton
                  key={pageNum + 1}
                  theme={theme}
                  active={pageNum + 1 === pagination.currentPage}
                  onClick={() => handlePageChange(pageNum + 1)}
                >
                  {pageNum + 1}
                </PaginationButton>
              ))}
              
              <PaginationButton 
                theme={theme}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Sau &raquo;
              </PaginationButton>
            </PaginationContainer>
          )}
        </>
      ) : (
        <NoResultsMessage theme={theme}>
          Không tìm thấy môn học nào phù hợp với bộ lọc đã chọn.
        </NoResultsMessage>
      )}
    </Container>
  );
};

export default SubjectList;
