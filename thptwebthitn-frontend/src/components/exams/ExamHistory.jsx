import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, FaEye, FaRedo, FaSearch, 
  FaSortAmountDown, FaSortAmountUp
} from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';

// Mẫu dữ liệu cho lịch sử bài thi
const MOCK_EXAM_RESULTS = [
  {
    id: 1,
    examId: 101,
    examTitle: 'Bài kiểm tra Toán học - Đại số',
    subjectName: 'Toán',
    score: 8.5,
    totalScore: 10,
    startTime: '2024-04-10T08:30:00',
    completionTime: 45,
    correctAnswers: 17,
    totalQuestions: 20,
    isPassed: true
  },
  {
    id: 2,
    examId: 102,
    examTitle: 'Bài kiểm tra Ngữ văn - Văn học hiện đại',
    subjectName: 'Văn',
    score: 7.0,
    totalScore: 10,
    startTime: '2024-04-05T10:15:00',
    completionTime: 80,
    correctAnswers: 14,
    totalQuestions: 20,
    isPassed: true
  },
  {
    id: 3,
    examId: 103,
    examTitle: 'Bài kiểm tra Tiếng Anh - Unit 5',
    subjectName: 'Tiếng Anh',
    score: 6.5,
    totalScore: 10,
    startTime: '2024-03-28T14:00:00',
    completionTime: 40,
    correctAnswers: 13,
    totalQuestions: 20,
    isPassed: true
  },
  {
    id: 4,
    examId: 104,
    examTitle: 'Bài kiểm tra Vật lý - Điện học',
    subjectName: 'Vật lý',
    score: 5.5,
    totalScore: 10,
    startTime: '2024-03-25T09:00:00',
    completionTime: 50,
    correctAnswers: 11,
    totalQuestions: 20,
    isPassed: false
  },
  {
    id: 5,
    examId: 105,
    examTitle: 'Bài kiểm tra Hóa học - Hóa hữu cơ',
    subjectName: 'Hóa học',
    score: 9.0,
    totalScore: 10,
    startTime: '2024-03-20T13:30:00',
    completionTime: 55,
    correctAnswers: 18,
    totalQuestions: 20,
    isPassed: true
  }
];

const ExamHistory = () => {
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  const { user } = useSelector(state => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('startTime');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(5); // Hiển thị 5 kết quả mỗi trang
  
  // Lấy dữ liệu mẫu
  useEffect(() => {
    console.log("ExamHistory component mounted");
    const fetchMockResults = () => {
      setLoading(true);
      
      // Giả lập độ trễ của API
      setTimeout(() => {
        setResults(MOCK_EXAM_RESULTS);
        setFilteredResults(MOCK_EXAM_RESULTS);
        setLoading(false);
        console.log("Mock data loaded:", MOCK_EXAM_RESULTS);
      }, 800);
    };
    
    fetchMockResults();
  }, []);
  
  // Xử lý tìm kiếm
  const handleSearch = () => {
    const filtered = results.filter(result => 
      result.examTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
      result.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredResults(filtered);
    setCurrentPage(1);
  };
  
  // Xử lý sắp xếp
  const handleSort = (field) => {
    const newDirection = sortBy === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortDirection(newDirection);
    
    const sorted = [...filteredResults].sort((a, b) => {
      if (field === 'startTime') {
        return newDirection === 'asc' 
          ? new Date(a.startTime) - new Date(b.startTime)
          : new Date(b.startTime) - new Date(a.startTime);
      }
      return newDirection === 'asc'
        ? a[field] - b[field]
        : b[field] - a[field];
    });
    
    setFilteredResults(sorted);
  };
  
  // Logic phân trang
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = filteredResults.slice(indexOfFirstResult, indexOfLastResult);
  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);
  
  // Xử lý chuyển trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Format thời gian
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Format thời gian làm bài
  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h} giờ ${m} phút` : `${m} phút`;
  };
  
  // Tính tổng điểm và tỷ lệ đúng
  const totalScore = results.reduce((sum, result) => sum + result.score, 0);
  const averageScore = results.length > 0 ? totalScore / results.length : 0;
  const correctRate = results.length > 0 
    ? results.reduce((sum, result) => sum + (result.correctAnswers / result.totalQuestions), 0) / results.length * 100
    : 0;
    
  return (
    <PageContainer>
      <ContentWrapper>
        {/* Tiêu đề trang */}
        <PageTitle theme={theme}>Lịch Sử Bài Thi</PageTitle>
        <PageDescription theme={theme}>Xem lại kết quả các bài thi đã thực hiện</PageDescription>
        
        {/* Phần tìm kiếm và bộ lọc */}
        <ActionRow>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Tìm kiếm theo tên bài thi hoặc môn học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              theme={theme}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <SearchButton onClick={handleSearch}>
              <FaSearch />
            </SearchButton>
          </SearchContainer>
          
          <BackButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
          >
            <FaArrowLeft /> Quay lại
          </BackButton>
        </ActionRow>
        
        <FiltersContainer>
          <FilterButton 
            theme={theme}
            active={sortBy === 'startTime'}
            onClick={() => handleSort('startTime')}
          >
            {sortBy === 'startTime' ? (
              <>
                Thời gian {sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
              </>
            ) : 'Thời gian'}
          </FilterButton>
          
          <FilterButton 
            theme={theme}
            active={sortBy === 'score'}
            onClick={() => handleSort('score')}
          >
            {sortBy === 'score' ? (
              <>
                Điểm số {sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
              </>
            ) : 'Điểm số'}
          </FilterButton>
        </FiltersContainer>
        
        {loading ? (
          <LoadingContainer>
            <LoadingSpinner size="lg" />
          </LoadingContainer>
        ) : currentResults.length === 0 ? (
          <EmptyState theme={theme}>
            <p>Không tìm thấy kết quả bài thi nào.</p>
            <p>Bạn chưa hoàn thành bài thi nào hoặc không tìm thấy kết quả phù hợp.</p>
            <Button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchTerm('');
                setFilteredResults(results);
              }}
            >
              <FaRedo /> Đặt lại tìm kiếm
            </Button>
          </EmptyState>
        ) : (
          <>
            <ResultsGrid>
              {currentResults.map((result) => (
                <ResultCard key={result.id} theme={theme}>
                  <ResultCardHeader theme={theme}>
                    <SubjectBadge>{result.subjectName}</SubjectBadge>
                    <ScoreBadge passed={result.isPassed}>
                      {result.score}/{result.totalScore}
                    </ScoreBadge>
                  </ResultCardHeader>
                  
                  <ResultCardTitle>{result.examTitle}</ResultCardTitle>
                  
                  <ResultMeta>
                    <MetaItem theme={theme}>
                      <strong>Ngày làm:</strong> {formatDate(result.startTime)}
                    </MetaItem>
                    <MetaItem theme={theme}>
                      <strong>Thời gian:</strong> {formatTime(result.completionTime)}
                    </MetaItem>
                    <MetaItem theme={theme}>
                      <strong>Đúng:</strong> {result.correctAnswers}/{result.totalQuestions} câu
                    </MetaItem>
                  </ResultMeta>
                  
                  <ViewButton
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/exam-results/${result.id}`)}
                  >
                    <FaEye /> Xem chi tiết
                  </ViewButton>
                </ResultCard>
              ))}
            </ResultsGrid>
            
            {totalPages > 1 && (
              <Pagination>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <PaginationButton
                    key={number}
                    active={number === currentPage}
                    theme={theme}
                    onClick={() => paginate(number)}
                  >
                    {number}
                  </PaginationButton>
                ))}
              </Pagination>
            )}
          </>
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

// Các styled components
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const ContentWrapper = styled.div`
  margin-bottom: 2rem;
  border-radius: 10px;
  overflow: hidden;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

const PageDescription = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 1.2rem;
  margin-bottom: 2rem;
`;

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #3182ce;
  }
`;

const BackButton = styled(Button)`
  background-color: transparent;
  color: #4299e1;
  border: 1px solid #4299e1;
  
  &:hover {
    background-color: #ebf8ff;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  max-width: 600px;
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
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  background-color: ${props => props.active ? '#4299e1' : props.theme === 'dark' ? '#2d3748' : '#edf2f7'};
  color: ${props => props.active ? 'white' : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  border: none;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? '#3182ce' : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  border-radius: 8px;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  p {
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }
  
  button {
    margin: 1rem auto 0;
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ResultCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : 'white'};
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

const ResultCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f7fafc'};
`;

const SubjectBadge = styled.span`
  background-color: #805ad5;
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.85rem;
`;

const ScoreBadge = styled.span`
  background-color: ${props => props.passed ? '#48bb78' : '#f56565'};
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.85rem;
`;

const ResultCardTitle = styled.h3`
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
`;

const ResultMeta = styled.div`
  padding: 0 1rem 1rem;
`;

const MetaItem = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
  margin: 0.5rem 0;
  font-size: 0.9rem;
`;

const ViewButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background-color: #4299e1;
  color: white;
  border: none;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #3182ce;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  background-color: ${props => props.active 
    ? '#4299e1' 
    : props.theme === 'dark' ? '#2d3748' : '#edf2f7'};
  color: ${props => props.active 
    ? 'white' 
    : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  border: none;
  
  &:hover {
    background-color: ${props => props.active 
      ? '#3182ce' 
      : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  }
`;

export default ExamHistory;