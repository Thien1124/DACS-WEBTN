import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { getQuestions } from '../../services/questionService';
import { renderTextWithMath } from '../../utils/mathRenderer';
import LoadingSpinner from '../common/LoadingSpinner';

const Container = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  margin: 0;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : '#f8f9fa'};
  border-radius: 8px;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 0.6rem 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 4px;
  background-color: ${props => props.theme === 'dark' ? '#333' : '#fff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const Select = styled.select`
  padding: 0.6rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 4px;
  background-color: ${props => props.theme === 'dark' ? '#333' : '#fff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const QuestionsList = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const QuestionCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : '#fff'};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#333' : '#f8f9fa'};
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#444' : '#eee'};
`;

const QuestionNumber = styled.span`
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const QuestionBadge = styled.span`
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${props => {
    switch (props.difficulty) {
      case 'easy': return props.theme === 'dark' ? '#143926' : '#d4edda';
      case 'medium': return props.theme === 'dark' ? '#3e2e15' : '#fff3cd';
      case 'hard': return props.theme === 'dark' ? '#3e2329' : '#f8d7da';
      default: return props.theme === 'dark' ? '#333' : '#f8f9fa';
    }
  }};
  color: ${props => {
    switch (props.difficulty) {
      case 'easy': return props.theme === 'dark' ? '#28a745' : '#155724';
      case 'medium': return props.theme === 'dark' ? '#ffc107' : '#856404';
      case 'hard': return props.theme === 'dark' ? '#dc3545' : '#721c24';
      default: return props.theme === 'dark' ? '#e2e8f0' : '#333';
    }
  }};
`;

const QuestionContent = styled.div`
  padding: 1.5rem;
`;

const QuestionText = styled.div`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  font-size: 1.1rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`;

const OptionsList = styled.div`
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const OptionItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
`;

const OptionMarker = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.isCorrect
    ? (props.theme === 'dark' ? '#143926' : '#d4edda')
    : (props.theme === 'dark' ? '#333' : '#f8f9fa')
  };
  border: 1px solid ${props => props.isCorrect
    ? (props.theme === 'dark' ? '#28a745' : '#28a745')
    : (props.theme === 'dark' ? '#444' : '#ddd')
  };
  color: ${props => props.isCorrect
    ? (props.theme === 'dark' ? '#28a745' : '#155724')
    : (props.theme === 'dark' ? '#e2e8f0' : '#333')
  };
  font-weight: 600;
  font-size: 0.8rem;
`;

const OptionText = styled.div`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  font-size: 1rem;
  line-height: 1.5;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  background-color: ${props => props.active 
    ? '#007bff' 
    : props.theme === 'dark' ? '#333' : '#fff'
  };
  color: ${props => props.active 
    ? '#fff' 
    : props.theme === 'dark' ? '#e2e8f0' : '#333'
  };
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 3rem 0;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
`;

const QuestionBank = ({ subject, theme }) => {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    difficulty: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  // Fetch questions when filters or subject changes
  useEffect(() => {
    const fetchQuestionsData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Add subject ID to filters if provided
        const queryFilters = { ...filters };
        if (subject?.id) {
          queryFilters.subject = subject.id;
        }
        
        const result = await getQuestions(queryFilters);
        setQuestions(result.data || []);
        setPagination({
          currentPage: result.currentPage || 1,
          totalPages: result.totalPages || 1,
          totalItems: result.totalItems || 0
        });
      } catch (error) {
        console.error("Error fetching questions:", error);
        setError(error.message || 'Failed to load questions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestionsData();
  }, [filters, subject]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      // Reset page when changing filters
      ...(name !== 'page' && { page: 1 })
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return 'Không xác định';
    }
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Header>
        <Title theme={theme}>Ngân hàng câu hỏi</Title>
      </Header>

      <FiltersContainer theme={theme}>
        <SearchInput
          type="text"
          placeholder="Tìm kiếm câu hỏi..."
          name="search"
          value={filters.search}
          onChange={handleFilterChange}
          theme={theme}
        />

        <Select
          name="difficulty"
          value={filters.difficulty}
          onChange={handleFilterChange}
          theme={theme}
        >
          <option value="">Tất cả độ khó</option>
          <option value="easy">Dễ</option>
          <option value="medium">Trung bình</option>
          <option value="hard">Khó</option>
        </Select>
      </FiltersContainer>

      {isLoading ? (
        <div style={{ padding: '2rem 0' }}>
          <LoadingSpinner text="Đang tải câu hỏi..." />
        </div>
      ) : error ? (
        <NoResults theme={theme}>Đã xảy ra lỗi: {error}</NoResults>
      ) : questions.length === 0 ? (
        <NoResults theme={theme}>Không tìm thấy câu hỏi phù hợp.</NoResults>
      ) : (
        <>
          <QuestionsList>
            {questions.map((question, index) => (
              <QuestionCard key={question.id} theme={theme}>
                <QuestionHeader theme={theme}>
                  <QuestionNumber theme={theme}>
                    Câu hỏi {(filters.page - 1) * filters.limit + index + 1}
                  </QuestionNumber>
                  <QuestionBadge 
                    theme={theme} 
                    difficulty={question.difficulty}
                  >
                    {getDifficultyLabel(question.difficulty)}
                  </QuestionBadge>
                </QuestionHeader>

                <QuestionContent>
                  <QuestionText theme={theme}>
                    {renderTextWithMath(question.text)}
                  </QuestionText>

                  <OptionsList>
                    {question.options.map((option, optIndex) => (
                      <OptionItem key={optIndex}>
                        <OptionMarker 
                          theme={theme} 
                          isCorrect={optIndex === question.correctAnswer}
                        >
                          {String.fromCharCode(65 + optIndex)}
                        </OptionMarker>
                        <OptionText theme={theme}>
                          {renderTextWithMath(option)}
                        </OptionText>
                      </OptionItem>
                    ))}
                  </OptionsList>

                  {question.explanation && (
                    <div style={{ 
                      backgroundColor: theme === 'dark' ? '#333' : '#f8f9fa', 
                      padding: '1rem', 
                      borderRadius: '4px',
                      marginTop: '1rem',
                      borderLeft: '4px solid #007bff'
                    }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: theme === 'dark' ? '#4da3ff' : '#007bff',
                        marginBottom: '0.5rem' 
                      }}>
                        Giải thích:
                      </div>
                      <div 
                        style={{ color: theme === 'dark' ? '#e2e8f0' : '#333' }}
                        dangerouslySetInnerHTML={{ __html: question.explanation }}
                      />
                    </div>
                  )}
                </QuestionContent>
              </QuestionCard>
            ))}
          </QuestionsList>

          {pagination.totalPages > 1 && (
            <Pagination>
              <PageButton 
                theme={theme}
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1}
              >
                &laquo;
              </PageButton>
              
              <PageButton 
                theme={theme}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                &lsaquo;
              </PageButton>
              
              {/* Show limited page numbers with ellipsis */}
              {[...Array(pagination.totalPages).keys()].map(page => {
                const pageNum = page + 1;
                
                // Show first page, last page, current page and ones around current page
                if (
                  pageNum === 1 || 
                  pageNum === pagination.totalPages ||
                  (pageNum >= pagination.currentPage - 1 && 
                   pageNum <= pagination.currentPage + 1)
                ) {
                  return (
                    <PageButton
                      key={pageNum}
                      theme={theme}
                      active={pageNum === pagination.currentPage}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </PageButton>
                  );
                }
                
                // Show ellipsis
                if (
                  (pageNum === 2 && pagination.currentPage > 3) ||
                  (pageNum === pagination.totalPages - 1 && 
                   pagination.currentPage < pagination.totalPages - 2)
                ) {
                  return <span key={pageNum}>...</span>;
                }
                
                return null;
              })}
              
              <PageButton 
                theme={theme}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                &rsaquo;
              </PageButton>
              
              <PageButton 
                theme={theme}
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                &raquo;
              </PageButton>
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

export default QuestionBank;
