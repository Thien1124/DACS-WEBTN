import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaEye, FaRedo, FaSearch } from 'react-icons/fa';
import { getUserResults } from '../../services/resultService';
import LoadingSpinner from '../common/LoadingSpinner';
import { showErrorToast } from '../../utils/toastUtils';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 1.1rem;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  max-width: 400px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px 0 0 8px;
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  
  &:hover {
    background-color: #3182ce;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.active ? '#4299e1' : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  background-color: ${props => props.active ? '#4299e1' : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? '#3182ce' : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHead = styled.thead`
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#f7fafc'};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#3a4966' : '#f7fafc'};
  }
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const TableCell = styled.td`
  padding: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const ScoreBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  background-color: ${props => {
    const score = props.score;
    if (score >= 8.5) return '#c6f6d5';
    if (score >= 7) return '#bee3f8';
    if (score >= 5) return '#fefcbf';
    return '#fed7d7';
  }};
  color: ${props => {
    const score = props.score;
    if (score >= 8.5) return '#22543d';
    if (score >= 7) return '#2c5282';
    if (score >= 5) return '#744210';
    return '#742a2a';
  }};
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: ${props => props.primary ? '#4299e1' : '#cbd5e0'};
  color: white;
  margin: 0 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.primary ? '#3182ce' : '#a0aec0'};
    transform: translateY(-2px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 0.25rem;
  border: 1px solid ${props => props.active ? '#4285f4' : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 5px;
  background-color: ${props => props.active ? '#4285f4' : 'transparent'};
  color: ${props => props.active ? '#ffffff' : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ExamHistory = () => {
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  const { user } = useSelector(state => state.auth);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const resultsPerPage = 10;
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await getUserResults(user?.id);
        setResults(response);
        setFilteredResults(response);
        setLoading(false);
      } catch (error) {
        showErrorToast('Không thể tải lịch sử bài thi');
        setLoading(false);
      }
    };
    
    if (user?.id) {
      fetchResults();
    }
  }, [user]);
  
  useEffect(() => {
    let filtered = [...results];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(result => 
        result.examData?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.examData?.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply score filter
    if (filter !== 'all') {
      switch (filter) {
        case 'passed':
          filtered = filtered.filter(result => result.score >= 5);
          break;
        case 'failed':
          filtered = filtered.filter(result => result.score < 5);
          break;
        case 'excellent':
          filtered = filtered.filter(result => result.score >= 8.5);
          break;
        default:
          break;
      }
    }
    
    setFilteredResults(filtered);
    setPage(1);  // Reset to first page when filters change
  }, [searchTerm, filter, results]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled by useEffect
  };
  
  const handleViewResult = (resultId) => {
    navigate(`/exam-results/${resultId}`);
  };
  
  const handleRetakeExam = (examId) => {
    navigate(`/exams/${examId}`);
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
  const indexOfLastResult = page * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = filteredResults.slice(indexOfFirstResult, indexOfLastResult);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <Container>
      <Header>
        <Title theme={theme}>Lịch sử làm bài</Title>
        <Subtitle theme={theme}>Xem lại các bài thi bạn đã làm trước đây</Subtitle>
      </Header>
      
      <SearchContainer>
        <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%' }}>
          <SearchInput 
            type="text"
            placeholder="Tìm theo tên bài thi hoặc môn học"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            theme={theme}
          />
          <SearchButton type="submit">
            <FaSearch />
          </SearchButton>
        </form>
      </SearchContainer>
      
      <FiltersContainer>
        <FilterButton 
          theme={theme} 
          active={filter === 'all'} 
          onClick={() => setFilter('all')}
        >
          Tất cả
        </FilterButton>
        <FilterButton 
          theme={theme} 
          active={filter === 'passed'} 
          onClick={() => setFilter('passed')}
        >
          Đạt
        </FilterButton>
        <FilterButton 
          theme={theme} 
          active={filter === 'failed'} 
          onClick={() => setFilter('failed')}
        >
          Chưa đạt
        </FilterButton>
        <FilterButton 
          theme={theme} 
          active={filter === 'excellent'} 
          onClick={() => setFilter('excellent')}
        >
          Xuất sắc
        </FilterButton>
      </FiltersContainer>
      
      {currentResults.length === 0 ? (
        <EmptyState theme={theme}>
          <p>Không tìm thấy kết quả bài thi nào.</p>
        </EmptyState>
      ) : (
        <>
          <Table theme={theme}>
            <TableHead theme={theme}>
              <TableRow theme={theme}>
                <TableHeader theme={theme}>Bài thi</TableHeader>
                <TableHeader theme={theme}>Môn học</TableHeader>
                <TableHeader theme={theme}>Điểm</TableHeader>
                <TableHeader theme={theme}>Ngày thi</TableHeader>
                <TableHeader theme={theme}>Thời gian làm</TableHeader>
                <TableHeader theme={theme}>Thao tác</TableHeader>
              </TableRow>
            </TableHead>
            <tbody>
              {currentResults.map(result => (
                <TableRow key={result.id} theme={theme}>
                  <TableCell theme={theme}>{result.examData?.title || 'N/A'}</TableCell>
                  <TableCell theme={theme}>{result.examData?.subject?.name || 'N/A'}</TableCell>
                  <TableCell theme={theme}>
                    <ScoreBadge score={result.score}>{result.score.toFixed(1)}</ScoreBadge>
                  </TableCell>
                  <TableCell theme={theme}>{new Date(result.startTime).toLocaleDateString()}</TableCell>
                  <TableCell theme={theme}>
                    {result.completionTime 
                      ? `${Math.floor(result.completionTime / 60)} phút ${result.completionTime % 60} giây` 
                      : 'N/A'}
                  </TableCell>
                  <TableCell theme={theme}>
                    <ActionButton primary onClick={() => handleViewResult(result.id)}>
                      <FaEye />
                    </ActionButton>
                    <ActionButton onClick={() => handleRetakeExam(result.examData?.id)}>
                      <FaRedo />
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
          
          {totalPages > 1 && (
            <PaginationContainer>
              <PageButton 
                theme={theme} 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                &lt;
              </PageButton>
              
              {[...Array(totalPages).keys()].map(num => (
                <PageButton 
                  key={num + 1}
                  theme={theme}
                  active={page === num + 1}
                  onClick={() => setPage(num + 1)}
                >
                  {num + 1}
                </PageButton>
              ))}
              
              <PageButton 
                theme={theme}
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                &gt;
              </PageButton>
            </PaginationContainer>
          )}
        </>
      )}
    </Container>
  );
};

export default ExamHistory;