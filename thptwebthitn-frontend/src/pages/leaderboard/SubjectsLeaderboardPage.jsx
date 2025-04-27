import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaTrophy, FaFilter, FaChevronDown, FaBook, FaChalkboard, 
  FaSearch, FaExclamationCircle, FaSortAmountDown
} from 'react-icons/fa';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getSubjects } from '../../services/subjectService';
import { getExamsBySubject, getExamLeaderboard } from '../../services/leaderboardService';
import { showErrorToast } from '../../utils/toastUtils';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Leaderboard from '../../components/leaderboard/Leaderboard';

// Styled components (unchanged)
const PageContainer = styled(motion.div)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme === 'dark' ? '#1a1a1a' : '#f8f9fa'};
`;

const MainContent = styled.div`
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  svg {
    color: #f39c12;
  }
`;

const PageDescription = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
  font-size: 1.1rem;
`;

const FilterContainer = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : 'white'};
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.label`
  display: flex;
  align-items: center;
  font-weight: 500;
  margin-right: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  min-width: 120px;
  
  svg {
    margin-right: 0.5rem;
  }
`;

const DropdownContainer = styled.div`
  flex: 1;
  min-width: 250px;
  position: relative;
`;

const DropdownHeader = styled.div`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 0.5rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  
  &:hover {
    border-color: #3182ce;
  }
`;

const DropdownBody = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : 'white'};
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 0.5rem;
  margin-top: 0.25rem;
  z-index: 10;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-track {
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
  }
`;

const DropdownItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  }
  
  display: flex;
  align-items: center;
`;

const SubjectIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
`;

const SubjectInfo = styled.div`
  flex: 1;
`;

const SubjectName = styled.div`
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const SubjectMeta = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const ExamList = styled.div`
  margin-bottom: 2rem;
`;

const ExamItem = styled.div`
  padding: 1rem 1.5rem;
  background-color: ${props => props.selected ? (props.theme === 'dark' ? '#3182ce1a' : '#ebf8ff') : (props.theme === 'dark' ? '#2d3748' : 'white')};
  margin-bottom: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ExamInfo = styled.div`
  flex: 1;
`;

const ExamTitle = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 0.5rem;
`;

const ExamMeta = styled.div`
  font-size: 0.85rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  display: flex;
  gap: 1rem;
`;

const ExamDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ViewButton = styled.button`
  background-color: ${props => props.theme === 'dark' ? '#3182ce' : '#3182ce'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#2c5282' : '#2c5282'};
  }
`;

const NoContent = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : 'white'};
  border-radius: 10px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  svg {
    font-size: 3rem;
    color: ${props => props.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
    margin-bottom: 1.5rem;
  }
  
  h3 {
    font-size: 1.5rem;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
    margin-bottom: 1rem;
  }
  
  p {
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
    margin-bottom: 1.5rem;
  }
`;

const LeaderboardContainer = styled.div``;

const SubjectPlaceholder = styled.div`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const BadgeCount = styled.span`
  background-color: ${props => props.theme === 'dark' ? '#3182ce' : '#3182ce'};
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.1rem 0.5rem;
  border-radius: 9999px;
  margin-left: 0.75rem;
`;

// Demo mock data để test UI khi API không hoạt động
const MOCK_SUBJECTS = [
  { id: 1, name: 'Toán', grade: 10 },
  { id: 2, name: 'Văn', grade: 10 },
  { id: 3, name: 'Anh Văn', grade: 10 },
  { id: 4, name: 'Vật Lý', grade: 10 },
  { id: 5, name: 'Hóa Học', grade: 10 }
];

const MOCK_EXAMS = {
  1: [
    { id: 1, title: 'Toán 10 - Đề thi giữa kỳ', difficulty: 'Trung bình', questionsCount: 20, attemptCount: 45, subjectId: 1 },
    { id: 2, title: 'Toán 10 - Đề thi cuối kỳ', difficulty: 'Khó', questionsCount: 25, attemptCount: 30, subjectId: 1 },
    { id: 3, title: 'Toán 10 - Ôn tập chương 1', difficulty: 'Dễ', questionsCount: 15, attemptCount: 12, subjectId: 1 }
  ]
};

const MOCK_LEADERBOARD = {
  1: {
    leaderboard: [
      {
        student: { id: 101, fullName: 'Nguyễn Văn A', grade: '10A1', school: 'THPT Chu Văn An' },
        score: 9.5,
        duration: 1800, // 30 phút
        completedAt: '2025-04-20T10:15:22Z'
      },
      {
        student: { id: 102, fullName: 'Trần Thị B', grade: '10A2', school: 'THPT Chu Văn An' },
        score: 9.0,
        duration: 1700, 
        completedAt: '2025-04-20T09:45:12Z'
      },
      {
        student: { id: 103, fullName: 'Lê Văn C', grade: '10A3', school: 'THPT Chu Văn An' },
        score: 8.5,
        duration: 1950,
        completedAt: '2025-04-20T11:20:05Z'
      },
      {
        student: { id: 104, fullName: 'Phạm Thị D', grade: '10A1', school: 'THPT Chu Văn An' },
        score: 8.0,
        duration: 1650,
        completedAt: '2025-04-20T10:30:45Z'
      },
      {
        student: { id: 105, fullName: 'Hoàng Văn E', grade: '10A2', school: 'THPT Chu Văn An' },
        score: 7.5,
        duration: 2100, 
        completedAt: '2025-04-20T09:55:18Z'
      }
    ]
  },
  2: {
    leaderboard: [
      {
        student: { id: 102, fullName: 'Trần Thị B', grade: '10A2', school: 'THPT Chu Văn An' },
        score: 9.8,
        duration: 1650, 
        completedAt: '2025-04-21T14:30:22Z'
      },
      {
        student: { id: 101, fullName: 'Nguyễn Văn A', grade: '10A1', school: 'THPT Chu Văn An' },
        score: 9.3,
        duration: 1750, 
        completedAt: '2025-04-21T13:45:12Z'
      }
    ]
  }
};

const SubjectsLeaderboardPage = () => {
  const { theme } = useSelector(state => state.ui);
  const { user } = useSelector(state => state.auth);
  
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState({
    subjects: true,
    exams: false,
    leaderboard: false
  });
  const [error, setError] = useState({
    subjects: null,
    exams: null,
    leaderboard: null
  });
  
  // Cập nhật phương thức fetchSubjects để dùng mock data
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(prev => ({ ...prev, subjects: true }));
        setError(prev => ({ ...prev, subjects: null }));
        
        // Sử dụng dữ liệu giả cho demo
        console.log('Sử dụng dữ liệu mẫu cho subjects');
        setSubjects(MOCK_SUBJECTS);
        setFilteredSubjects(MOCK_SUBJECTS);
        
        // Auto-select subject với id=1
        const defaultSubject = MOCK_SUBJECTS.find(s => s.id === 1);
        setSelectedSubject(defaultSubject);

      } catch (err) {
        console.error('Error in demo subjects:', err);
        setError(prev => ({ ...prev, subjects: 'Lỗi tải dữ liệu mẫu' }));
      } finally {
        setLoading(prev => ({ ...prev, subjects: false }));
      }
    };
    
    fetchSubjects();
  }, []);

  // Filter subjects when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSubjects(subjects);
    } else {
      const filtered = subjects.filter(subject => 
        subject.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSubjects(filtered);
    }
  }, [searchTerm, subjects]);
  
  // Cập nhật phương thức fetchExams để dùng mock data
  useEffect(() => {
    const fetchExams = async () => {
      if (!selectedSubject) return;
      
      try {
        setLoading(prev => ({ ...prev, exams: true }));
        setError(prev => ({ ...prev, exams: null }));
        setExams([]);
        setSelectedExam(null);
        setLeaderboardData(null);
        
        // Sử dụng dữ liệu giả cho demo
        console.log('Sử dụng dữ liệu mẫu cho exams, subject ID:', selectedSubject.id);
        setTimeout(() => {
          const mockExamsForSubject = MOCK_EXAMS[selectedSubject.id] || [];
          setExams(mockExamsForSubject);
          
          // Auto-select exam đầu tiên nếu có
          if (mockExamsForSubject.length > 0) {
            setSelectedExam(mockExamsForSubject[0]);
          }
        }, 500); // Tạo delay giả lập cho loading effect
        
      } catch (err) {
        console.error('Error in demo exams:', err);
        setError(prev => ({ ...prev, exams: 'Lỗi tải dữ liệu mẫu bài thi' }));
      } finally {
        setTimeout(() => {
          setLoading(prev => ({ ...prev, exams: false }));
        }, 500);
      }
    };
    
    fetchExams();
  }, [selectedSubject]);
  
  // Cập nhật phương thức fetchLeaderboard để dùng mock data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!selectedExam) return;
      
      try {
        setLoading(prev => ({ ...prev, leaderboard: true }));
        setError(prev => ({ ...prev, leaderboard: null }));
        
        // Sử dụng dữ liệu giả cho demo
        console.log('Sử dụng dữ liệu mẫu cho leaderboard, exam ID:', selectedExam.id);
        setTimeout(() => {
          const mockLeaderboardForExam = MOCK_LEADERBOARD[selectedExam.id];
          if (mockLeaderboardForExam) {
            setLeaderboardData(mockLeaderboardForExam);
          } else {
            setError(prev => ({ ...prev, leaderboard: 'Không có dữ liệu bảng xếp hạng cho bài thi này' }));
          }
        }, 800); // Tạo delay giả lập cho loading effect
        
      } catch (err) {
        console.error('Error in demo leaderboard:', err);
        setError(prev => ({ ...prev, leaderboard: 'Lỗi tải dữ liệu mẫu bảng xếp hạng' }));
      } finally {
        setTimeout(() => {
          setLoading(prev => ({ ...prev, leaderboard: false }));
        }, 800);
      }
    };
    
    fetchLeaderboard();
  }, [selectedExam]);
  
  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setIsDropdownOpen(false);
  };
  
  const handleExamSelect = (exam) => {
    setSelectedExam(exam);
  };
  
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };
  
  // Transform leaderboard data from API response to the format expected by Leaderboard component
  const transformLeaderboardData = () => {
    if (!leaderboardData || !leaderboardData.leaderboard) return [];
    
    return leaderboardData.leaderboard.map(entry => ({
      userId: entry.student?.id,
      fullName: entry.student?.fullName || 'Không xác định',
      className: `${entry.student?.grade || 'Chưa cập nhật'} - ${entry.student?.school || 'Chưa cập nhật'}`,
      score: entry.score,
      duration: entry.duration,
      completedAt: entry.completedAt
    }));
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.subject-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);
  
  const retryLoadSubjects = () => {
    setLoading(prev => ({ ...prev, subjects: true }));
    setError(prev => ({ ...prev, subjects: null }));
    
    // Call the function to fetch subjects
    const fetchSubjects = async () => {
      try {
        // Same implementation as above...
        let data;
        try {
          data = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5006'}/api/Subject/all`)
            .then(res => {
              if (!res.ok) throw new Error(`API returned status ${res.status}`);
              return res.json();
            });
        } catch (firstErr) {
          console.log('First attempt failed, trying paginated endpoint:', firstErr);
          data = await getSubjects(1, 100);
        }
        
        let subjectsArray = [];
        
        if (data && data.items && Array.isArray(data.items)) {
          subjectsArray = data.items;
        } else if (data && Array.isArray(data)) {
          subjectsArray = data;
        } else if (data && data.data && Array.isArray(data.data)) {
          subjectsArray = data.data;
        } else {
          console.warn('Unexpected API response format:', data);
          throw new Error('Định dạng dữ liệu không hợp lệ');
        }
        
        console.log('Loaded subjects:', subjectsArray.length);
        setSubjects(subjectsArray);
        setFilteredSubjects(subjectsArray);
        
        if (subjectsArray.length > 0) {
          setSelectedSubject(subjectsArray[0]);
        }
      } catch (err) {
        console.error('Error fetching subjects:', err);
        
        let errorMessage = 'Không thể tải danh sách môn học';
        
        if (err.response) {
          console.log('Error response:', err.response);
          if (err.response.status === 404) {
            errorMessage = 'API không tìm thấy (404)';
          } else if (err.response.status === 401) {
            errorMessage = 'Không có quyền truy cập';
          } else if (err.response.status === 500) {
            errorMessage = 'Lỗi máy chủ';
          }
        } else if (err.request) {
          errorMessage = 'Không nhận được phản hồi từ máy chủ';
        }
        
        setError(prev => ({ ...prev, subjects: errorMessage }));
        showErrorToast(errorMessage + '. Vui lòng thử lại sau!');
      } finally {
        setLoading(prev => ({ ...prev, subjects: false }));
      }
    };
    
    fetchSubjects();
  };
  
  return (
    <PageContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      theme={theme}
    >
      <Header />
      <MainContent>
        <PageHeader>
          <PageTitle theme={theme}>
            <FaTrophy /> Bảng xếp hạng theo môn học
          </PageTitle>
          <PageDescription theme={theme}>
            Xem bảng xếp hạng học sinh theo từng môn học và bài thi
          </PageDescription>
        </PageHeader>
        
        <FilterContainer theme={theme}>
          <FilterRow>
            <FilterLabel theme={theme}>
              <FaBook /> Chọn môn học:
            </FilterLabel>
            <DropdownContainer className="subject-dropdown">
              {loading.subjects ? (
                <DropdownHeader theme={theme} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <div>
                    <LoadingSpinner size="sm" /> Đang tải môn học...
                  </div>
                </DropdownHeader>
              ) : error.subjects ? (
                <DropdownHeader theme={theme} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <div style={{ color: '#e53e3e' }}>
                    <FaExclamationCircle style={{ marginRight: '0.5rem' }} />
                    {error.subjects}
                  </div>
                </DropdownHeader>
              ) : (
                <>
                  <DropdownHeader theme={theme} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                    {selectedSubject ? (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <SubjectIcon theme={theme} style={{ width: '24px', height: '24px' }}>
                          <FaBook style={{ fontSize: '0.8rem' }} />
                        </SubjectIcon>
                        <SubjectName theme={theme}>{selectedSubject.name}</SubjectName>
                      </div>
                    ) : (
                      <SubjectPlaceholder theme={theme}>-- Chọn môn học --</SubjectPlaceholder>
                    )}
                    <FaChevronDown style={{ fontSize: '0.8rem' }} />
                  </DropdownHeader>
                  
                  {isDropdownOpen && (
                    <DropdownBody theme={theme}>
                      <SearchInput
                        type="text"
                        placeholder="Tìm môn học..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        theme={theme}
                      />
                      
                      {filteredSubjects.length > 0 ? (
                        filteredSubjects.map(subject => (
                          <DropdownItem
                            key={subject.id}
                            onClick={() => handleSubjectSelect(subject)}
                            theme={theme}
                          >
                            <SubjectIcon theme={theme}>
                              <FaBook />
                            </SubjectIcon>
                            <SubjectInfo>
                              <SubjectName theme={theme}>{subject.name}</SubjectName>
                              <SubjectMeta theme={theme}>
                                {`Lớp ${subject.grade || 'Tất cả'}`}
                              </SubjectMeta>
                            </SubjectInfo>
                          </DropdownItem>
                        ))
                      ) : (
                        <div style={{ padding: '1rem', textAlign: 'center', color: theme === 'dark' ? '#a0aec0' : '#718096' }}>
                          Không tìm thấy môn học nào
                        </div>
                      )}
                    </DropdownBody>
                  )}
                </>
              )}
            </DropdownContainer>
          </FilterRow>
          
          {selectedSubject && (
            <FilterRow>
              <FilterLabel theme={theme}>
                <FaSortAmountDown /> Bài thi:
              </FilterLabel>
              <div style={{ flex: 1 }}>
                {loading.exams ? (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <LoadingSpinner size="sm" /> 
                    <span style={{ marginLeft: '0.5rem' }}>Đang tải bài thi...</span>
                  </div>
                ) : error.exams ? (
                  <div style={{ color: '#e53e3e' }}>
                    {error.exams}
                  </div>
                ) : exams.length === 0 ? (
                  <div style={{ color: theme === 'dark' ? '#a0aec0' : '#718096' }}>
                    Chưa có bài thi nào cho môn học này
                  </div>
                ) : (
                  <div style={{ color: theme === 'dark' ? '#e2e8f0' : '#2d3748' }}>
                    Có {exams.length} bài thi có sẵn
                    {selectedExam && <span style={{ marginLeft: '0.5rem', fontWeight: '600' }}>
                      - Đang xem: {selectedExam.title}
                    </span>}
                  </div>
                )}
              </div>
            </FilterRow>
          )}
        </FilterContainer>
        
        {selectedSubject && (
          <ExamList>
            <h2 style={{ 
              marginBottom: '1rem',
              color: theme === 'dark' ? '#e2e8f0' : '#2d3748',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <FaChalkboard /> Bài thi môn {selectedSubject.name}
            </h2>
            
            {loading.exams ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <LoadingSpinner />
              </div>
            ) : error.exams ? (
              <NoContent theme={theme}>
                <FaExclamationCircle />
                <h3>Không có bài thi nào</h3>
                <p>{error.exams}</p>
              </NoContent>
            ) : exams.length === 0 ? (
              <NoContent theme={theme}>
                <FaExclamationCircle />
                <h3>Không có bài thi nào</h3>
                <p>Hiện chưa có bài thi nào cho môn học này</p>
              </NoContent>
            ) : (
              exams.map(exam => (
                <ExamItem 
                  key={exam.id}
                  onClick={() => handleExamSelect(exam)}
                  selected={selectedExam?.id === exam.id}
                  theme={theme}
                >
                  <ExamInfo>
                    <ExamTitle theme={theme}>
                      {exam.title}
                      {exam.attemptCount > 0 && (
                        <BadgeCount theme={theme}>{exam.attemptCount}</BadgeCount>
                      )}
                    </ExamTitle>
                    <ExamMeta theme={theme}>
                      <ExamDetail>
                        <FaFilter />
                        {exam.difficulty || 'Chưa xác định'}
                      </ExamDetail>
                      <ExamDetail>
                        <FaChalkboard />
                        {exam.questionsCount || 0} câu hỏi
                      </ExamDetail>
                    </ExamMeta>
                  </ExamInfo>
                  
                  <ViewButton theme={theme} onClick={(e) => {
                    e.stopPropagation();
                    handleExamSelect(exam);
                  }}>
                    <FaTrophy /> Xem bảng xếp hạng
                  </ViewButton>
                </ExamItem>
              ))
            )}
          </ExamList>
        )}
        
        {selectedExam && (
          <LeaderboardContainer>
            {loading.leaderboard ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <LoadingSpinner />
              </div>
            ) : error.leaderboard ? (
              <NoContent theme={theme}>
                <FaExclamationCircle />
                <h3>Không có dữ liệu bảng xếp hạng</h3>
                <p>{error.leaderboard}</p>
                <Link to={`/exams/${selectedExam.id}`} style={{
                  display: 'inline-block',
                  backgroundColor: '#3182ce',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}>
                  Làm bài thi này ngay
                </Link>
              </NoContent>
            ) : leaderboardData && leaderboardData.leaderboard && leaderboardData.leaderboard.length > 0 ? (
              <Leaderboard 
                title={`Bảng xếp hạng: ${selectedExam.title}`}
                leaders={transformLeaderboardData()}
                currentUserId={user?.id}
              />
            ) : (
              <NoContent theme={theme}>
                <FaExclamationCircle />
                <h3>Chưa có dữ liệu bảng xếp hạng</h3>
                <p>Hãy làm bài thi này để trở thành người đầu tiên trong bảng xếp hạng!</p>
                <Link to={`/exams/${selectedExam.id}`} style={{
                  display: 'inline-block',
                  backgroundColor: '#3182ce',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}>
                  Làm bài thi ngay
                </Link>
              </NoContent>
            )}
          </LeaderboardContainer>
        )}
        
        {!selectedSubject && (
          <NoContent theme={theme}>
            <FaBook />
            <h3>Chọn một môn học</h3>
            <p>Hãy chọn một môn học từ dropdown để xem các bài thi và bảng xếp hạng</p>
          </NoContent>
        )}
      </MainContent>
      <Footer />
    </PageContainer>
  );
};

export default SubjectsLeaderboardPage;