import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { fetchExamsBySubject, fetchExamsForStudents } from '../../redux/examSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaClock, FaChalkboardTeacher, FaClipboardList, FaPlay,FaHistory,FaArrowLeft} from 'react-icons/fa';
import { showErrorToast, showSuccessToast } from '../../utils/toastUtils';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;
const Button = styled(({ primary, ...rest }) => <button {...rest} />)`
  background: ${props => props.primary ? 'linear-gradient(135deg, #4285f4, #34a853)' : 'transparent'};
  color: ${props => props.primary ? 'white' : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  border: 1px solid ${props => props.primary ? 'transparent' : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 5px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    background: ${props => props.primary ? 'linear-gradient(135deg, #3b78dc, #2d9348)' : props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
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

const ExamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ExamCard = styled(motion.div)`
  background: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
`;

const ExamHeader = styled.div`
  background: linear-gradient(135deg, #4285f4, #34a853);
  color: white;
  padding: 1rem;
  position: relative;
`;

const ExamTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const ExamAuthor = styled.p`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const ExamContent = styled.div`
  padding: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const ExamInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  
  svg {
    margin-right: 0.5rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  }
`;

const ExamFooter = styled.div`
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const ExamButton = styled.button`
  background: linear-gradient(135deg, #4285f4, #34a853);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const DifficultyBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${props => {
    switch(props.difficulty?.toLowerCase()) {
      case 'easy': return '#c6f6d5';
      case 'medium': return '#fefcbf';
      case 'hard': return '#fed7d7';
      default: return '#e2e8f0';
    }
  }};
  color: ${props => {
    switch(props.difficulty?.toLowerCase()) {
      case 'easy': return '#22543d';
      case 'medium': return '#744210';
      case 'hard': return '#742a2a';
      default: return '#2d3748';
    }
  }};
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

const ExamList = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list: exams, loading, pagination } = useSelector(state => state.exams);
  const { user } = useSelector(state => state.auth);
  const { theme } = useSelector(state => state.ui);
  const [page, setPage] = useState(1);
  const [localExams, setExams] = useState([]);
  
  const [fallbackExams] = useState([
    {
      id: "demo-1",
      title: "Đề thi thử (dữ liệu offline)",
      description: "Đề thi dùng khi không kết nối được API",
      duration: 90,
      questionCount: 40,
      createdBy: "Hệ thống"
    }
  ]);
  
  const useMockData = () => {
    useEffect(() => {
      // Only use this for testing when backend is unavailable
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        setExams([
          {
            id: 1,
            title: "Đề kiểm tra Toán học THPT Quốc Gia",
            description: "Đề thi trắc nghiệm môn Toán học",
            duration: 60,
            questionCount: 40,
            subject: { name: "Toán học" },
            createdBy: "Admin",
            isActive: true,
            isPublic: true
          },
          // Add more mock exams as needed
        ]);
      }
    }, []);
  };

  useMockData();

  useEffect(() => {
    const loadExams = async () => {
      try {
        if (!subjectId) return;
        
        const params = { 
          subjectId, 
          page, 
          limit: 9 
        };
        
        console.log('Loading exams with params:', params);
        
        if (user?.role === 'Admin' || user?.role === 'Teacher') {
          await dispatch(fetchExamsBySubject(params)).unwrap();
        } else {
          await dispatch(fetchExamsForStudents(params)).unwrap();
        }
      } catch (error) {
        console.error('Error loading exams:', error);
        showErrorToast(`Không thể tải danh sách đề thi: ${error.message || 'Lỗi kết nối API'}`);
      }
    };
    
    loadExams();
  }, [dispatch, subjectId, user, page]);
  
  const handleViewHistory = () => {
    navigate('/exam-history');
  };
  
  const handleBackToSubjects = () => {
    navigate('/subjects');
  };
  const handleStartExam = (examId) => {
    try {
      // Navigate to exam interface page
      navigate(`/exams/${examId}`);
    } catch (error) {
      showErrorToast('Không thể bắt đầu bài thi. Vui lòng thử lại sau.');
    }
  };
  
  const handlePageChange = (newPage) => {
    if (newPage !== page) {
      setPage(newPage);
      // Scroll to top when changing page
      window.scrollTo(0, 0);
    }
  };
  const displayExams = localExams.length > 0 ? localExams : (exams?.length > 0 ? exams : fallbackExams);

  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <Container>
      <Header>
        <div>
          <Title theme={theme}>Danh sách đề thi</Title>
          <Subtitle theme={theme}>Chọn đề thi bạn muốn làm bài</Subtitle>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button theme={theme} onClick={handleBackToSubjects}>
            <FaArrowLeft /> Quay lại môn học
          </Button>
          <Button theme={theme} primary onClick={handleViewHistory}>
            <FaHistory /> Xem lịch sử
          </Button>
        </div>
      </Header>
      
      {exams?.length === 0 ? (
        <div>Không tìm thấy đề thi cho môn học này.</div>
      ) : (
        <>
          {/* Hiển thị danh sách đề thi */}
          <ExamsGrid>
            {displayExams.map(exam => (
              <ExamCard 
                key={exam.id} 
                theme={theme}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <ExamHeader>
                  <ExamTitle>{exam.title}</ExamTitle>
                  <ExamAuthor>Tạo bởi: {exam.createdBy || 'Admin'}</ExamAuthor>
                </ExamHeader>
                <ExamContent theme={theme}>
                  {/* Thông tin đề thi */}
                  <ExamInfo theme={theme}>
                    <FaClock />
                    <span>Thời gian: {exam.duration} phút</span>
                  </ExamInfo>
                  <ExamInfo theme={theme}>
                    <FaClipboardList />
                    <span>Số câu hỏi: {exam.questionCount || exam.questions?.length || 'N/A'}</span>
                  </ExamInfo>
                  {/* Độ khó */}
                </ExamContent>
                <ExamFooter theme={theme}>
                  <div>
                    {exam.isPublic ? 'Công khai' : 'Giới hạn'}
                  </div>
                  <ExamButton onClick={() => handleStartExam(exam.id)}>
                    <FaPlay /> Bắt đầu
                  </ExamButton>
                </ExamFooter>
              </ExamCard>
            ))}
          </ExamsGrid>
          
          {/* Phân trang */}
          {pagination && pagination.totalPages > 1 && (
            <PaginationContainer>
              <PageButton 
                theme={theme} 
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
              >
                &lt;
              </PageButton>
              
              {/* Các nút phân trang */}
              {[...Array(pagination.totalPages).keys()].map(num => (
                <PageButton 
                  key={num + 1}
                  theme={theme}
                  active={page === num + 1}
                  onClick={() => handlePageChange(num + 1)}
                >
                  {num + 1}
                </PageButton>
              ))}
              
              <PageButton 
                theme={theme}
                disabled={page === pagination.totalPages}
                onClick={() => handlePageChange(page + 1)}
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

export default ExamList;