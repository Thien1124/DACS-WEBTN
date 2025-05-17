import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import axios from 'axios'; // Thêm import axios
import { 
  FaArrowLeft, FaEye, FaRedo, FaSearch, 
  FaSortAmountDown, FaSortAmountUp, FaExclamationTriangle
} from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';

const ExamHistory = () => {
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  const { user, token } = useSelector(state => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Thêm state để xử lý lỗi
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('startTime');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(5); // Hiển thị 5 kết quả mỗi trang
  const [totalPages, setTotalPages] = useState(1); // Thêm state để lưu tổng số trang
  
  // Add this new function to fetch detailed result data
  const fetchDetailedResultData = async (resultId) => {
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5006'}/api/Results/${resultId}`;
      const response = await axios.get(apiUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      console.log(`Detailed data for result ${resultId}:`, response.data);
      return response.data;
    } catch (err) {
      console.error(`Error fetching detailed data for result ${resultId}:`, err);
      return null;
    }
  };
  
  // Lấy dữ liệu thực từ API
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Kiểm tra xem có user không
        if (!user || !user.id) {
          setError("Vui lòng đăng nhập để xem lịch sử bài thi");
          setLoading(false);
          return;
        }
        
        // URL API endpoint đúng để lấy kết quả bài thi theo user ID
        const apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5006'}/api/Results/user/${user.id}`;
        
        // Thêm các tham số phân trang
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('pageSize', resultsPerPage);
        
        console.log(`Fetching exam results from: ${apiUrl}?${params.toString()}`);
        
        // Gọi API với token xác thực nếu có
        const response = await axios.get(`${apiUrl}?${params.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        console.log("API response:", response.data);
        
        if (response.data) {
          // Log cấu trúc response để debug
          console.log("Response structure:", Object.keys(response.data));
          
          // Chuyển đổi dữ liệu API thành định dạng mà component cần
          const formattedResults = Array.isArray(response.data) 
            ? response.data
            : response.data.items || response.data.data || [];
          
          console.log("Formatted results:", formattedResults);
          
          // Get the basic list of results first
          const processedResults = await Promise.all(formattedResults.map(async (result) => {
            console.log("Processing result item:", result);
            
            // Fetch detailed data for this result
            const detailedData = await fetchDetailedResultData(result.id);
            
            // Use detailed data if available
            const correctAnswers = detailedData?.correctAnswers !== undefined 
              ? parseInt(detailedData.correctAnswers) 
              : (result.correctAnswers !== undefined ? parseInt(result.correctAnswers) : 0);
              
            const totalQuestions = detailedData?.totalQuestions !== undefined 
              ? parseInt(detailedData.totalQuestions) 
              : (result.totalQuestions !== undefined ? parseInt(result.totalQuestions) : 0);
            
            console.log(`FINAL VALUES with detailed data - Result ${result.id}: correctAnswers=${correctAnswers}, totalQuestions=${totalQuestions}`);
            
            // Tìm tên bài thi từ exam hoặc dùng fallback
            let examTitle = 'Bài thi';
            if (result.exam && result.exam.title) {
              examTitle = result.exam.title;
            } else if (result.examTitle) {
              examTitle = result.examTitle;
            }
            
            // Tìm tên môn học
            let subjectName = 'Chưa xác định';
            if (result.exam && result.exam.subject && result.exam.subject.name) {
              subjectName = result.exam.subject.name;
            } else if (result.subjectName) {
              subjectName = result.subjectName;
            } else if (result.subject && result.subject.name) {
              subjectName = result.subject.name;
            }
            
            // Tính thời gian làm bài (chính xác đến giây)
            let completionTimeInSeconds = 0;
            if (result.completionTime !== undefined && result.completionTime !== null) {
              // Nếu completionTime là số giây hoặc phút
              completionTimeInSeconds = result.completionTime;
              // Kiểm tra nếu là phút (giá trị nhỏ), chuyển thành giây
              if (completionTimeInSeconds < 100) {
                completionTimeInSeconds *= 60;
              }
            } else if (result.startTime && result.endTime) {
              // Tính từ thời gian bắt đầu và kết thúc
              const start = new Date(result.startTime);
              const end = new Date(result.endTime);
              completionTimeInSeconds = Math.floor((end - start) / 1000);
            }

            console.log(`Result ${result.id}: completionTimeInSeconds=${completionTimeInSeconds}`);

            // Ensure we have accurate data before returning
            if (result.totalQuestions) {
              totalQuestions = parseInt(result.totalQuestions);
            }

            if (result.correctAnswer !== undefined) {
              correctAnswers = parseInt(result.correctAnswer);
            }
            
            // Only use fallback values if API doesn't provide them
            if (totalQuestions === 0 && result.exam?.questionsCount) {
              totalQuestions = result.exam.questionsCount;
            }
            
            console.log(`FINAL VALUES - Result ${result.id}: correctAnswers=${correctAnswers}, totalQuestions=${totalQuestions}`);

            // Sửa lại phần return để đảm bảo chính xác số câu đúng
            return {
              id: result.id,
              examId: result.examId || result.exam?.id,
              examTitle: examTitle,
              subjectName: subjectName,
              score: result.score || 0,
              totalScore: result.maxScore || result.totalScore || 10,
              startTime: result.startTime || result.startedAt || result.createdAt,
              endTime: result.endTime || result.completedAt,
              completionTime: result.completionTime || 0,
              completionTimeInSeconds: completionTimeInSeconds,
              
              // Use the stored API values directly
              correctAnswers: correctAnswers,
              totalQuestions: totalQuestions,
              
              isPassed: (result.score || 0) >= (result.passScore || 5)
            };
          }));
          
          console.log("Processed results:", processedResults);
          
          setResults(processedResults);
          setFilteredResults(processedResults);
          
          // Nếu API trả về tổng số trang, cập nhật state
          if (response.data.totalPages) {
            setTotalPages(response.data.totalPages);
          }
        } else {
          setResults([]);
          setFilteredResults([]);
        }
      } catch (err) {
        console.error("Error fetching exam results:", err);
        if (err.response) {
          console.error("Response status:", err.response.status);
          console.error("Response data:", err.response.data);
        }
        setError("Không thể tải lịch sử bài thi. Vui lòng thử lại sau!");
        setResults([]);
        setFilteredResults([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [user, token, currentPage, resultsPerPage]); // Thêm currentPage và resultsPerPage vào dependencies
  
  // Xử lý tìm kiếm
  const handleSearch = () => {
    const filtered = results.filter(result => 
      (result.examTitle && result.examTitle.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (result.subjectName && result.subjectName.toLowerCase().includes(searchTerm.toLowerCase()))
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
  
  // Xử lý chuyển trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Cập nhật hàm format thời gian để linh hoạt hơn
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    // Hỗ trợ nhiều định dạng thời gian
    const date = new Date(dateString);
    
    // Kiểm tra xem ngày có hợp lệ không
    if (isNaN(date.getTime())) {
      console.warn("Invalid date format:", dateString);
      return 'N/A';
    }
    
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    console.error("Error formatting date:", e, dateString);
    return 'N/A';
  }
};
  
  // Cập nhật hàm format thời gian để hiển thị cả giây
const formatTime = (minutes, seconds = 0) => {
  // Nếu nhận vào số giây (từ completionTimeInSeconds)
  if (seconds > 0) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h} giờ ${m} phút ${s} giây`;
    } else if (m > 0) {
      return `${m} phút ${s} giây`;
    } else {
      return `${s} giây`;
    }
  }
  
  // Xử lý trường hợp cũ khi nhận vào số phút
  if (!minutes) return 'N/A';
  
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} giờ ${m} phút` : `${m} phút`;
};
  
  // Tính tổng điểm và tỷ lệ đúng
  const totalScore = results.reduce((sum, result) => sum + (result.score || 0), 0);
  const averageScore = results.length > 0 ? totalScore / results.length : 0;
  const correctRate = results.length > 0 
    ? results.reduce((sum, result) => sum + ((result.correctAnswers / (result.totalQuestions || 1)) || 0), 0) / results.length * 100
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
        ) : error ? (
          // Hiển thị lỗi nếu có
          <ErrorContainer theme={theme}>
            <FaExclamationTriangle size={40} />
            <ErrorMessage>{error}</ErrorMessage>
            <Button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
            >
              <FaRedo /> Thử lại
            </Button>
          </ErrorContainer>
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
                      {result.score.toFixed(2)}/{result.totalScore}
                    </ScoreBadge>
                  </ResultCardHeader>
                  
                  <ResultCardTitle>
                    {/* Hiển thị tiêu đề bài thi với ID để đảm bảo luôn có thông tin */}
                    {result.examTitle || `Bài thi #${result.examId || result.id}`}
                  </ResultCardTitle>
                  
                  <ResultMeta>
                    <MetaItem theme={theme}>
                      <strong>Ngày làm:</strong> {formatDate(result.startTime)}
                    </MetaItem>
                    <MetaItem theme={theme}>
                      <strong>Thời gian:</strong> {
                        result.completionTimeInSeconds > 0 
                          ? formatTime(0, result.completionTimeInSeconds)
                          : typeof result.completionTime === 'number' && result.completionTime > 0
                            ? formatTime(result.completionTime) 
                            : result.endTime && result.startTime
                              ? formatTime(0, Math.floor((new Date(result.endTime) - new Date(result.startTime)) / 1000))
                              : 'N/A'
                      }
                    </MetaItem>
                    <MetaItem theme={theme}>
                      <strong>Đúng:</strong> {
                        // Make sure both values are defined before using them
                        result.correctAnswers !== undefined && result.totalQuestions !== undefined
                          ? `${result.correctAnswers}/${result.totalQuestions} câu`
                          : "N/A"
                      }
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

// Thêm styling cho hiển thị lỗi
const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  border-radius: 8px;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  gap: 1rem;
`;

const ErrorMessage = styled.p`
  font-size: 1.1rem;
  text-align: center;
  margin: 0;
`;

// Giữ nguyên các styled components hiện tại
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