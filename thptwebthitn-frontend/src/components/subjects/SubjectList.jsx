import React, { useEffect } from 'react';  // Loại bỏ useState vì đang dùng Redux
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SubjectFilter from './SubjectFilter';
import LoadingSpinner from '../common/LoadingSpinner';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubjects, setFilters, resetFilters, setPagination } from '../../redux/subjectSlice';

const Container = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
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

const SubjectList = () => {
  const dispatch = useDispatch();
  const { 
    items: subjects,
    loading,
    error,
    pagination,
    filters 
  } = useSelector(state => state.subjects);
  const { theme } = useSelector(state => state.ui);

  useEffect(() => {
    dispatch(fetchSubjects({ ...filters, page: pagination.currentPage }));
  }, [dispatch, filters.grade, filters.sortBy, pagination.currentPage]);

  useEffect(() => {
    // Debounce search input to avoid too many requests
    const delayDebounceFn = setTimeout(() => {
      if (filters.search !== undefined) {
        dispatch(fetchSubjects({ ...filters, page: pagination.currentPage }));
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [dispatch, filters.search, pagination.currentPage]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(setFilters({ [name]: value }));
    dispatch(setPagination({ currentPage: 1 }));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    dispatch(setPagination({ currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    dispatch(setPagination({ currentPage: newPage }));
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
        onClear={handleResetFilters}
        theme={theme} 
      />
      
      {error && (
        <div style={{ textAlign: 'center', padding: '1rem', color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <LoadingSpinner />
          <p>Đang tải danh sách môn học...</p>
        </div>
      ) : subjects && subjects.length > 0 ? (
        <>
          <SubjectsGrid>
            {subjects.map(subject => (
              <SubjectCard 
                key={subject.id} 
                theme={theme}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <SubjectImage image={subject.image || '/images/default-subject.jpg'}>
                  <SubjectGradeBadge>{formatGradeLabel(subject.grade)}</SubjectGradeBadge>
                </SubjectImage>
                
                <SubjectContent>
                  <SubjectTitle theme={theme}>{subject.name}</SubjectTitle>
                  <SubjectDescription theme={theme}>{subject.description || 'Không có mô tả'}</SubjectDescription>
                  
                  <SubjectMeta theme={theme}>
                    <SubjectTests theme={theme}>{subject.examsCount || 0} bài thi</SubjectTests>
                    <ViewButton to={`/subjects/${subject.id}/exams`}>Xem đề thi</ViewButton>
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