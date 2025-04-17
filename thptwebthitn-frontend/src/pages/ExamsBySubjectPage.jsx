import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaClock, FaGraduationCap, FaFilter, FaSearch, FaSort, FaSortAmountDown } from 'react-icons/fa';
import { MdDifficulty } from 'react-icons/md';
import { useSelector, useDispatch } from 'react-redux';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchExamsBySubject } from '../redux/examSlice';
import { getSubjectById } from '../services/subjectService';
import { showErrorToast } from '../utils/toastUtils';

const Container = styled(motion.div)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  width: 100%;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  margin-bottom: 0.5rem;
`;

const SubjectInfo = styled.div`
  padding: 1.5rem;
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
`;

const SubjectInfoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const SubjectImage = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-image: ${props => `url(${props.image})`};
  background-size: cover;
  background-position: center;
  border: 3px solid ${props => props.theme === 'dark' ? '#444' : '#eee'};
`;

const SubjectTitleGroup = styled.div`
  flex: 1;
`;

const SubjectTitle = styled.h2`
  font-size: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  margin-bottom: 0.25rem;
`;

const SubjectMeta = styled.div`
  display: flex;
  gap: 1rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
  font-size: 0.9rem;
`;

const SubjectDescription = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
  line-height: 1.6;
`;

const FiltersBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
  
  svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#aaa'};
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  border-radius: 8px;
  background-color: ${props => props.theme === 'dark' ? '#333' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
  }
`;

const FiltersGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background-color: ${props => props.active 
    ? (props.theme === 'dark' ? '#1a365d' : '#ebf8ff') 
    : (props.theme === 'dark' ? '#333' : 'white')};
  border: 1px solid ${props => props.active 
    ? (props.theme === 'dark' ? '#2b6cb0' : '#bee3f8') 
    : (props.theme === 'dark' ? '#444' : '#ddd')};
  color: ${props => props.active 
    ? (props.theme === 'dark' ? '#63b3ed' : '#3182ce') 
    : (props.theme === 'dark' ? '#e2e8f0' : '#333')};
  cursor: pointer;
  white-space: nowrap;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#3a3a3a' : '#f8f9fa'};
  }
`;

const ExamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ExamCard = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const ExamHeader = styled.div`
  height: 140px;
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

const DifficultyBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: ${props => {
    switch(props.difficulty?.toLowerCase()) {
      case 'easy': return '#48bb78';
      case 'medium': return '#ecc94b';
      case 'hard': return '#e53e3e';
      default: return '#4299e1';
    }
  }};
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const ExamContent = styled.div`
  padding: 1.25rem;
`;

const ExamTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  line-height: 1.4;
  min-height: 2.8em;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ExamMetaData = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
  font-size: 0.9rem;
  
  svg {
    color: ${props => props.theme === 'dark' ? '#63b3ed' : '#3182ce'};
  }
`;

const ExamDescription = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
  font-size: 0.9rem;
  line-height: 1.5;
  min-height: 4.5em;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const StartExamButton = styled(Link)`
  background: linear-gradient(45deg, #007bff, #00d6ff);
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  text-align: center;
  
  &:hover {
    background: linear-gradient(45deg, #0069d9, #00c2e6);
    transform: translateY(-2px);
  }
`;

const NoExamsMessage = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 10px;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
  grid-column: 1 / -1;
  
  h3 {
    margin-bottom: 1rem;
    font-size: 1.3rem;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  }
  
  p {
    margin-bottom: 2rem;
  }
  
  a {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background-color: #007bff;
    color: white;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: #0069d9;
    }
  }
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

// Hàm chuyển đổi độ khó thành text tiếng Việt
const getDifficultyLabel = (difficulty) => {
  switch(difficulty?.toLowerCase()) {
    case 'easy': return 'Dễ';
    case 'medium': return 'Trung bình';
    case 'hard': return 'Khó';
    default: return 'Chưa xác định';
  }
};

// Thời gian hiện tại để ghi log
const currentTime = "2025-04-12 15:24:32";
const currentUser = "vinhsonvlog";

const ExamsBySubjectPage = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Lấy theme từ redux store
  const theme = useSelector(state => state.ui?.theme) || 'light';
  
  // Local state
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subjectLoading, setSubjectLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    difficulty: '',
    sort: 'newest'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 9
  });
  
  // Fetch từ redux store
  const { items: exams, loading: examLoading, error } = useSelector(state => state.exam);
  
  // Fetch subject info when component mounts
  useEffect(() => {
    const fetchSubject = async () => {
      try {
        console.log(`[${currentTime}] User ${currentUser} loading subject ${subjectId}`);
        setSubjectLoading(true);
        
        // Fetch subject details
        const subjectData = await getSubjectById(subjectId);
        setSubject(subjectData);
      } catch (error) {
        console.error(`[${currentTime}] Error loading subject data:`, error);
        showErrorToast('Không thể tải thông tin môn học. Vui lòng thử lại sau.');
      } finally {
        setSubjectLoading(false);
      }
    };
    
    if (subjectId) {
      fetchSubject();
    }
  }, [subjectId]);
  
  // Fetch exams when filters or pagination changes
  useEffect(() => {
    setLoading(true);
    
    const fetchExams = async () => {
      try {
        await dispatch(fetchExamsBySubject({
          subjectId,
          page: pagination.currentPage,
          limit: pagination.pageSize,
          search: searchTerm,
          difficulty: filters.difficulty,
          sort: filters.sort
        }));
      } finally {
        setLoading(false);
      }
    };
    
    const timerId = setTimeout(() => {
      fetchExams();
    }, 500); // Debounce search
    
    return () => clearTimeout(timerId);
  }, [dispatch, subjectId, pagination.currentPage, filters, searchTerm]);
  
  // For demo purposes, let's create some sample exams if real data is not available
  const sampleExams = [
    {
      id: 1,
      title: 'Kiểm tra học kỳ 1 - Đề số 1',
      description: 'Đề kiểm tra học kỳ 1, bao gồm toàn bộ kiến thức từ tuần 1 đến tuần 15.',
      difficulty: 'medium',
      timeLimit: 90,
      questionCount: 40,
      image: 'https://placehold.co/800x400/4299e1/ffffff?text=Exam+1'
    },
    {
      id: 2,
      title: 'Kiểm tra chương 3 - Đề số 2',
      description: 'Đề kiểm tra chương 3, tập trung vào phần lý thuyết và bài tập cơ bản.',
      difficulty: 'easy',
      timeLimit: 45,
      questionCount: 25,
      image: 'https://placehold.co/800x400/48bb78/ffffff?text=Exam+2'
    },
    {
      id: 3,
      title: 'Đề thi thử cuối kỳ - Nâng cao',
      description: 'Đề thi thử cuối kỳ với độ khó cao, dành cho học sinh giỏi chuẩn bị thi HSG.',
      difficulty: 'hard',
      timeLimit: 120,
      questionCount: 50,
      image: 'https://placehold.co/800x400/e53e3e/ffffff?text=Exam+3'
    },
    // Thêm các đề thi mẫu khác...
  ];
  
  // Function to handle search input
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };
  
  // Function to toggle difficulty filter
  const handleDifficultyFilter = (difficulty) => {
    setFilters(prev => ({
      ...prev,
      difficulty: prev.difficulty === difficulty ? '' : difficulty
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };
  
  // Function to handle sort change
  const handleSortChange = (sort) => {
    setFilters(prev => ({ ...prev, sort }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };
  
  // Function to handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, currentPage: page }));
  };
  
  // Display loading spinner while data is being fetched
  if (subjectLoading) {
    return (
      <Container>
        <Header />
        <MainContent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <LoadingSpinner size="large" />
            <span style={{ marginLeft: '1rem' }}>Đang tải dữ liệu...</span>
          </div>
        </MainContent>
        <Footer />
      </Container>
    );
  }
  
  // Display error message if there was an error
  if (error) {
    return (
      <Container>
        <Header />
        <MainContent>
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <h2 style={{ color: 'red', marginBottom: '1rem' }}>Lỗi khi tải dữ liệu</h2>
            <p>{error}</p>
            <button 
              onClick={() => navigate('/subjects')}
              style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
            >
              Quay lại danh sách môn học
            </button>
          </div>
        </MainContent>
        <Footer />
      </Container>
    );
  }
  
  // Combine real exams with sample ones for demo
  const displayExams = exams.length > 0 ? exams : sampleExams;
  
  return (
    <Container
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Header />
      <MainContent>
        <PageHeader>
          <PageTitle theme={theme}>Đề thi {subject?.title || 'Môn học'}</PageTitle>
        </PageHeader>
        
        <SubjectInfo theme={theme}>
          <SubjectInfoHeader>
            <SubjectImage 
              image={subject?.image || `https://placehold.co/400x400/4299e1/ffffff?text=${encodeURIComponent(subject?.title || 'Subject')}`}
              theme={theme}
            />
            <SubjectTitleGroup>
              <SubjectTitle theme={theme}>{subject?.title || 'Tên môn học'}</SubjectTitle>
              <SubjectMeta theme={theme}>
                <span>Khối: {subject?.grade || 'N/A'}</span>
                <span>•</span>
                <span>Số đề thi: {displayExams.length || 0}</span>
              </SubjectMeta>
            </SubjectTitleGroup>
          </SubjectInfoHeader>
          
          <SubjectDescription theme={theme}>
            {subject?.description || 'Không có mô tả cho môn học này.'}
          </SubjectDescription>
        </SubjectInfo>
        
        <FiltersBar>
          <SearchBox theme={theme}>
            <FaSearch />
            <SearchInput
              type="text"
              placeholder="Tìm kiếm đề thi..."
              value={searchTerm}
              onChange={handleSearch}
              theme={theme}
            />
          </SearchBox>
          
          <FiltersGroup>
            <FilterButton
              theme={theme}
              active={filters.difficulty === 'easy'}
              onClick={() => handleDifficultyFilter('easy')}
            >
              <MdDifficulty />
              Dễ
            </FilterButton>
            
            <FilterButton
              theme={theme}
              active={filters.difficulty === 'medium'}
              onClick={() => handleDifficultyFilter('medium')}
            >
              <MdDifficulty />
              Trung bình
            </FilterButton>
            
            <FilterButton
              theme={theme}
              active={filters.difficulty === 'hard'}
              onClick={() => handleDifficultyFilter('hard')}
            >
              <MdDifficulty />
              Khó
            </FilterButton>
            
            <FilterButton
              theme={theme}
              active={filters.sort === 'newest'}
              onClick={() => handleSortChange('newest')}
            >
              <FaSortAmountDown />
              Mới nhất
            </FilterButton>
          </FiltersGroup>
        </FiltersBar>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem 0' }}>
            <LoadingSpinner />
            <span style={{ marginLeft: '1rem' }}>Đang tải đề thi...</span>
          </div>
        ) : displayExams.length > 0 ? (
          <>
            <ExamsGrid>
              {displayExams.map(exam => (
                <ExamCard 
                  key={exam.id}
                  theme={theme}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <ExamHeader 
                    image={exam.image || `https://placehold.co/800x400/4299e1/ffffff?text=${encodeURIComponent(subject?.title || 'Exam')}`}
                  >
                    <DifficultyBadge difficulty={exam.difficulty}>
                      {getDifficultyLabel(exam.difficulty)}
                    </DifficultyBadge>
                  </ExamHeader>
                  
                  <ExamContent>
                    <ExamTitle theme={theme}>{exam.title}</ExamTitle>
                    
                    <ExamMetaData>
                      <MetaItem theme={theme}>
                        <FaClock />
                        <span>{exam.timeLimit} phút</span>
                      </MetaItem>
                      
                      <MetaItem theme={theme}>
                        <FaGraduationCap />
                        <span>{exam.questionCount || exam.totalQuestions || 0} câu hỏi</span>
                      </MetaItem>
                    </ExamMetaData>
                    
                    <ExamDescription theme={theme}>
                      {exam.description || 'Không có mô tả cho đề thi này.'}
                    </ExamDescription>
                    
                    <ButtonsContainer>
                      <StartExamButton to={`/exams/${exam.id}/start`}>
                        Làm bài thi
                      </StartExamButton>
                    </ButtonsContainer>
                  </ExamContent>
                </ExamCard>
              ))}
            </ExamsGrid>
            
            {pagination.totalPages > 1 && (
              <PaginationContainer>
                <PaginationButton
                  theme={theme}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  &laquo; Trước
                </PaginationButton>
                
                {[...Array(pagination.totalPages).keys()].map(page => (
                  <PaginationButton
                    key={page + 1}
                    theme={theme}
                    active={page + 1 === pagination.currentPage}
                    onClick={() => handlePageChange(page + 1)}
                  >
                    {page + 1}
                  </PaginationButton>
                ))}
                
                <PaginationButton
                  theme={theme}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Tiếp &raquo;
                </PaginationButton>
              </PaginationContainer>
            )}
          </>
        ) : (
          <NoExamsMessage theme={theme}>
            <h3>Không tìm thấy đề thi nào</h3>
            <p>Không có đề thi nào phù hợp với bộ lọc đã chọn hoặc môn học này chưa có đề thi.</p>
            <Link to="/subjects">Quay lại danh sách môn học</Link>
          </NoExamsMessage>
        )}
      </MainContent>
      <Footer />
    </Container>
  );
};

export default ExamsBySubjectPage;