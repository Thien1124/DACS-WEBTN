import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchSubjects, setFilters, resetFilters, setPagination } from '../redux/subjectSlice';
import SubjectFilter from '../components/subjects/SubjectFilter';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Header from '../components/layout/Header';

// Styled Components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme === 'dark' ? '#1a1a1a' : '#f5f8fa'};
`;

const Container = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
`;

const PageTitle = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 700;
  
  span {
    background: linear-gradient(45deg, #4285f4, #34a853);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const PageDescription = styled.p`
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
  max-width: 800px;
  line-height: 1.6;
`;

const SubjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const SubjectCard = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2d2d2d' : 'white'};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
`;

const SubjectImage = styled.div`
  height: 180px;
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
    background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5));
  }
`;

const SubjectGradeBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: linear-gradient(45deg, #4285f4, #34a853);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
`;

const SubjectContent = styled.div`
  padding: 1.5rem;
`;

const SubjectTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 600;
`;

const SubjectDescription = styled.p`
  font-size: 0.95rem;
  margin-bottom: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  line-height: 1.5;
  min-height: 4.5em;
`;

const SubjectMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#3d4852' : '#edf2f7'};
  padding-top: 1.25rem;
  margin-top: 0.5rem;
`;

const SubjectStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SubjectTests = styled.span`
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    color: ${props => props.theme === 'dark' ? '#4da3ff' : '#4285f4'};
  }
`;

const SubjectPopularity = styled.span`
  font-size: 0.85rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const ViewButton = styled(Link)`
  background: linear-gradient(45deg, #4285f4, #34a853);
  color: white;
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  
  svg {
    margin-left: 0.5rem;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
  }
`;

const NoResultsMessage = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: ${props => props.theme === 'dark' ? '#2d2d2d' : 'white'};
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
  margin-top: 2rem;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
  
  p {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }
  
  button {
    background: linear-gradient(45deg, #4285f4, #34a853);
    color: white;
    border: none;
    padding: 0.6rem 1.25rem;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(66, 133, 244, 0.3);
    }
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 3rem;
`;

const PaginationButton = styled.button`
  background-color: ${props => props.active ? 
    'linear-gradient(45deg, #4285f4, #34a853)' : 
    props.theme === 'dark' ? '#2d2d2d' : 'white'};
  color: ${props => props.active ? 'white' : props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  border: 1px solid ${props => props.theme === 'dark' ? '#3d4852' : '#edf2f7'};
  padding: 0.6rem 1.25rem;
  margin: 0 0.25rem;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active ? 
      'linear-gradient(45deg, #4285f4, #34a853)' : 
      props.theme === 'dark' ? '#3d4852' : '#edf2f7'};
    transform: translateY(-2px);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  
  p {
    margin-top: 1rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
    font-size: 1.1rem;
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: ${props => props.theme === 'dark' ? '#3d2a2a' : '#fff5f5'};
  border-radius: 12px;
  margin: 2rem 0;
  
  h3 {
    color: ${props => props.theme === 'dark' ? '#feb2b2' : '#c53030'};
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  p {
    color: ${props => props.theme === 'dark' ? '#feb2b2' : '#c53030'};
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
  }
  
  button {
    background-color: ${props => props.theme === 'dark' ? '#742a2a' : '#fff5f5'};
    color: ${props => props.theme === 'dark' ? '#feb2b2' : '#c53030'};
    border: 1px solid ${props => props.theme === 'dark' ? '#feb2b2' : '#c53030'};
    padding: 0.6rem 1.25rem;
    border-radius: 6px;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: ${props => props.theme === 'dark' ? '#9b2c2c' : '#fed7d7'};
    }
  }
`;

const SubjectsPage = () => {
  const dispatch = useDispatch();
  const { 
    items: subjects,
    loading,
    error,
    pagination,
    filters 
  } = useSelector(state => state.subjects);
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    // Lấy theme từ localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Fetch subjects on component mount
    dispatch(fetchSubjects({ ...filters, page: pagination.currentPage }));
  }, [dispatch]);
  
  // Fetch subjects when filters or pagination change
  useEffect(() => {
    dispatch(fetchSubjects({ ...filters, page: pagination.currentPage }));
  }, [filters, pagination.currentPage, dispatch]);
  
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
  
  const handleRefresh = () => {
    dispatch(fetchSubjects({ ...filters, page: pagination.currentPage }));
  };
  
  const formatGradeLabel = (grade) => {
    return `Lớp ${grade}`;
  };
  
  return (
    <PageWrapper theme={theme}>
      <Header />
      <Container
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PageTitle theme={theme}>
          Khám phá <span>Môn học</span>
        </PageTitle>
        <PageDescription theme={theme}>
          Tìm hiểu và luyện tập các môn học với kho đề thi phong phú. Chọn môn học bạn quan tâm để bắt đầu hành trình học tập của mình.
        </PageDescription>
        
        <SubjectFilter 
          filters={filters} 
          onChange={handleFilterChange}
          onClear={handleResetFilters}
          theme={theme} 
        />
        
        {error && (
          <ErrorMessage theme={theme}>
            <h3>Đã xảy ra lỗi</h3>
            <p>{error}</p>
            <button onClick={handleRefresh}>Thử lại</button>
          </ErrorMessage>
        )}
        
        {loading ? (
          <LoadingContainer theme={theme}>
            <LoadingSpinner size={50} />
            <p>Đang tải danh sách môn học...</p>
          </LoadingContainer>
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
                  <SubjectImage image={subject.image || 'https://via.placeholder.com/300x180?text=Môn+học'}>
                    <SubjectGradeBadge>{formatGradeLabel(subject.grade)}</SubjectGradeBadge>
                  </SubjectImage>
                  
                  <SubjectContent>
                    <SubjectTitle theme={theme}>{subject.title}</SubjectTitle>
                    <SubjectDescription theme={theme}>{subject.description}</SubjectDescription>
                    
                    <SubjectMeta theme={theme}>
                      <SubjectStats>
                        <SubjectTests theme={theme}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                            <path d="M8.646 6.646a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L10.293 9 8.646 7.354a.5.5 0 0 1 0-.708zm-1.292 0a.5.5 0 0 0-.708 0l-2 2a.5.5 0 0 0 0 .708l2 2a.5.5 0 0 0 .708-.708L5.707 9l1.647-1.646a.5.5 0 0 0 0-.708z"/>
                          </svg>
                          {subject.testsCount || 0} bài thi
                        </SubjectTests>
                        <SubjectPopularity theme={theme}>
                          {subject.popularity === 'high' && '⭐⭐⭐ Phổ biến'}
                          {subject.popularity === 'medium' && '⭐⭐ Trung bình'}
                          {subject.popularity === 'low' && '⭐ Ít phổ biến'}
                        </SubjectPopularity>
                      </SubjectStats>
                      <ViewButton to={`/subjects/${subject.id}`}>
                        Xem chi tiết
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
                        </svg>
                      </ViewButton>
                    </SubjectMeta>
                  </SubjectContent>
                </SubjectCard>
              ))}
            </SubjectsGrid>
            
            {pagination && pagination.totalPages > 1 && (
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
            <h3>Không tìm thấy môn học</h3>
            <p>Không tìm thấy môn học nào phù hợp với bộ lọc đã chọn.</p>
            <button onClick={handleResetFilters}>Xóa bộ lọc</button>
          </NoResultsMessage>
        )}
      </Container>
    </PageWrapper>
  );
};

export default SubjectsPage;