import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { fetchSubjectById, fetchSubjectExams } from '../../redux/subjectSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';
import Header from '../layout/Header';
import Pagination from '../common/Pagination';
import { FaRegClock, FaRegFileAlt, FaUserAlt, FaFileDownload, FaLock } from 'react-icons/fa';

// Styled components
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

const BreadcrumbNav = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  
  a {
    color: ${props => props.theme === 'dark' ? '#4da3ff' : '#4285f4'};
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  span {
    margin: 0 0.75rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  }
`;

const SubjectHeader = styled(motion.div)`
  display: flex;
  margin-bottom: 2.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SubjectImage = styled.div`
  width: 320px;
  height: 220px;
  background-image: ${props => `url(${props.image || 'https://via.placeholder.com/320x220?text=Môn+học'})`};
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6));
  }
  
  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 1.5rem;
  }
`;

const SubjectInfo = styled.div`
  flex: 1;
  padding-left: 2.5rem;
  
  @media (max-width: 768px) {
    padding-left: 0;
  }
`;

const SubjectTitle = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 700;
  
  span {
    background: linear-gradient(45deg, #4285f4, #34a853);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const SubjectDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
`;

const SubjectStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 1.5rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const StatIcon = styled.span`
  color: ${props => props.theme === 'dark' ? '#4da3ff' : '#4285f4'};
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${props => props.theme === 'dark' ? '#1a202c' : '#ebf8ff'};
  border-radius: 50%;
`;

const StatText = styled.span`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 500;
  font-size: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin: 2.5rem 0 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
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

const FilterSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  flex-wrap: wrap;
  gap: 15px;
`;

const SearchInput = styled.input`
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  background-color: ${props => props.theme === 'dark' ? '#333' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  width: 250px;
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
  }

  &::placeholder {
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#aaa'};
  }
`;

const FiltersGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const FilterSelect = styled.select`
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  background-color: ${props => props.theme === 'dark' ? '#333' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: #4285f4;
  }
`;

const ExamsTable = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ExamsHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  background-color: ${props => props.theme === 'dark' ? '#333' : '#f5f7fa'};
  padding: 15px 20px;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#444' : '#eee'};

  @media (max-width: 768px) {
    display: none;
  }
`;

const ExamRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  padding: 15px 20px;
  align-items: center;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#444' : '#eee'};
  transition: background-color 0.2s;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#333' : '#f9f9f9'};
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-gap: 10px;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
`;

const ExamTitle = styled.div`
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 10px;
  }
`;

const ExamDetail = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#666'};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 6px;
    font-size: 0.95rem;
  }

  @media (max-width: 768px) {
    &:before {
      content: attr(data-label);
      font-weight: 500;
      margin-right: 10px;
    }
  }
`;

const ExamAction = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #4285f4, #34a853);
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  font-weight: 500;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  svg {
    margin-right: 5px;
  }
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
  
  &.locked {
    background: ${props => props.theme === 'dark' ? '#444' : '#e0e0e0'};
    cursor: not-allowed;
    color: ${props => props.theme === 'dark' ? '#aaa' : '#666'};
    
    &:hover {
      transform: none;
      opacity: 1;
    }
  }
`;
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  
  p {
    margin-top: 1rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
    font-size: 1.1rem;
  }
`;

const NoExamsMessage = styled.div`
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
  }
`;
const ExamsContainer = styled.div``;


const SubjectDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  const { 
    selectedSubject, 
    examsList, 
    examsStatus, 
    examsError, 
    examsTotalPages 
  } = useSelector(state => state.subjects);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Helper function to get subject image
  const getSubjectImage = () => {
    if (!selectedSubject) return 'https://via.placeholder.com/320x220?text=Môn+học';
    
    const defaultImages = {
      'Toán': '/images/math-subject.jpg',
      'Vật Lý': '/images/physics-subject.jpg',
      'Hóa Học': '/images/chemistry-subject.jpg',
      'Sinh Học': '/images/biology-subject.jpg',
      'Văn Học': '/images/literature-subject.jpg',
      'Tiếng Anh': '/images/english-subject.jpg',
      'Lịch Sử': '/images/history-subject.jpg',
      'Địa Lý': '/images/geography-subject.jpg',
    };
    
    return selectedSubject.imageUrl || defaultImages[selectedSubject.name] || 'https://via.placeholder.com/320x220?text=Môn+học';
  };
  
  useEffect(() => {
    dispatch(fetchSubjectById(id));
  }, [dispatch, id]);
  
  useEffect(() => {
    dispatch(fetchSubjectExams({ 
      subjectId: id, 
      page: currentPage, 
      search: searchTerm,
      difficulty,
      sortBy
    }));
  }, [dispatch, id, currentPage, searchTerm, difficulty, sortBy]);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
    setCurrentPage(1);
  };
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Function to render difficulty level
  const renderDifficulty = (difficulty) => {
    const levels = {
      easy: { text: 'Dễ', color: '#34a853' },
      medium: { text: 'Trung bình', color: '#fbbc05' },
      hard: { text: 'Khó', color: '#ea4335' },
    };
    
    const level = levels[difficulty?.toLowerCase()] || { text: 'Không xác định', color: '#888' };
    
    return (
      <span style={{ color: level.color, fontWeight: 500 }}>
        {level.text}
      </span>
    );
  };
  
  if (examsStatus === 'loading' && currentPage === 1) {
    return (
      <PageWrapper theme={theme}>
        <Header />
        <Container>
          <LoadingContainer theme={theme}>
            <LoadingSpinner size={50} />
            <p>Đang tải thông tin môn học...</p>
          </LoadingContainer>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper theme={theme}>
      <Header />
      <Container
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <BreadcrumbNav theme={theme}>
          <Link to="/subjects">Các môn học</Link>
          <span>›</span>
          <span>{selectedSubject?.name || 'Chi tiết môn học'}</span>
        </BreadcrumbNav>
        
        {selectedSubject && (
          <SubjectHeader
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            
            
            <SubjectInfo>
              <SubjectTitle theme={theme}>
                <span>{selectedSubject.name}</span>
              </SubjectTitle>
              <SubjectDescription theme={theme}>
                {selectedSubject.description || 'Không có mô tả cho môn học này.'}
              </SubjectDescription>
              
              <SubjectStats>
                <StatItem>
                  <StatIcon theme={theme}>
                    <FaRegFileAlt />
                  </StatIcon>
                  <StatText theme={theme}>{selectedSubject.examCount || 0} đề thi</StatText>
                </StatItem>
                
                <StatItem>
                  <StatIcon theme={theme}>
                    <FaUserAlt />
                  </StatIcon>
                  <StatText theme={theme}>{selectedSubject.teacherCount || 0} giáo viên</StatText>
                </StatItem>
              </SubjectStats>
            </SubjectInfo>
          </SubjectHeader>
        )}
        
        <SectionTitle theme={theme}>Danh sách đề thi</SectionTitle>
        
        <FilterSection>
          <SearchInput
            type="text"
            placeholder="Tìm kiếm đề thi..."
            value={searchTerm}
            onChange={handleSearchChange}
            theme={theme}
          />
          
          <FiltersGroup>
            <FilterSelect 
              value={difficulty} 
              onChange={handleDifficultyChange}
              theme={theme}
            >
              <option value="all">Tất cả độ khó</option>
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </FilterSelect>
            
            <FilterSelect 
              value={sortBy} 
              onChange={handleSortChange}
              theme={theme}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="popular">Phổ biến nhất</option>
              <option value="attempts">Nhiều lượt thi</option>
            </FilterSelect>
          </FiltersGroup>
        </FilterSection>
        
        <ExamsContainer>
          {examsStatus === 'loading' && currentPage > 1 ? (
            <LoadingContainer theme={theme}>
              <LoadingSpinner size={40} />
              <p>Đang tải danh sách đề thi...</p>
            </LoadingContainer>
          ) : examsStatus === 'failed' ? (
            <ErrorDisplay message={examsError} />
          ) : examsList && examsList.length > 0 ? (
            <>
              <ExamsTable theme={theme}>
                <ExamsHeader theme={theme}>
                  <div>Tên đề thi</div>
                  <div>Thời gian</div>
                  <div>Độ khó</div>
                  <div>Lượt thi</div>
                  <div>Hành động</div>
                </ExamsHeader>
                
                {examsList.map((exam, index) => (
                  <ExamRow 
                    key={exam.id}
                    theme={theme}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ExamTitle theme={theme}>{exam.title}</ExamTitle>
                    
                    <ExamDetail theme={theme} data-label="Thời gian:">
                      <FaRegClock /> {exam.duration || 45} phút
                    </ExamDetail>
                    
                    <ExamDetail theme={theme} data-label="Độ khó:">
                      {renderDifficulty(exam.difficulty)}
                    </ExamDetail>
                    
                    <ExamDetail theme={theme} data-label="Lượt thi:">
                      {exam.attemptCount || 0} lượt
                    </ExamDetail>
                    
                    <div>
                      {exam.isLocked ? (
                        <ExamAction to="#" className="locked" theme={theme}>
                          <FaLock /> Đã khóa
                        </ExamAction>
                      ) : (
                        <ExamAction to={`/exams/${exam.id}`}>
                          <FaFileDownload /> Làm bài
                        </ExamAction>
                      )}
                    </div>
                  </ExamRow>
                ))}
              </ExamsTable>
              
              {examsTotalPages > 1 && (
                <Pagination 
                  currentPage={currentPage}
                  totalPages={examsTotalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <NoExamsMessage theme={theme}>
              <h3>Chưa có đề thi</h3>
              <p>Hiện tại chưa có đề thi nào cho môn học này. Vui lòng quay lại sau.</p>
            </NoExamsMessage>
          )}
        </ExamsContainer>
      </Container>
    </PageWrapper>
  );
};

// Bổ sung component LoadingContainer

export default SubjectDetail;