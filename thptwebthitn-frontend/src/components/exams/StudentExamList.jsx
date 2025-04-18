import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { fetchExams, removeExam } from '../../redux/examSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaClock, FaChalkboardTeacher, FaClipboardList, FaPlay, FaFilter, FaSearch, FaSortAmountDown, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import Modal from '../common/Modal'; // Giả sử bạn có component Modal sẵn
import Header from '../layout/Header';


const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex-grow: 1;
  padding-top: 60px; // Đủ khoảng cách để không bị che bởi header
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const TitleContainer = styled.div``;

const Title = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 1.1rem;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #4285f4, #34a853);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1; // Đảm bảo nút không bị các phần tử khác che khuất
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, #3b78e7, #2e9549);
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  border-radius: 8px;
  padding: 0 1rem;
  flex: 1;
  max-width: 400px;
  height: 42px;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  
  svg {
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
    margin-right: 0.5rem;
  }
  
  input {
    background: transparent;
    border: none;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
    font-size: 0.95rem;
    width: 100%;
    outline: none;
  }
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const FilterSelect = styled.select`
  appearance: none;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  padding: 0.5rem 2rem 0.5rem 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  cursor: pointer;
  background-image: ${props => props.theme === 'dark' 
    ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23a0aec0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`
    : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23718096' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`
  };
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  min-width: 120px;
  height: 42px;
  margin-left: 0.5rem;
  
  &:focus {
    outline: none;
    border-color: #4285f4;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    margin-left: 0;
  }
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

const AdminActionsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 5px;
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const EditButton = styled(ActionButton)`
  background-color: #4299e1;
  
  &:hover {
    background-color: #3182ce;
  }
`;

const DeleteButton = styled(ActionButton)`
  background-color: #e53e3e;
  
  &:hover {
    background-color: #c53030;
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

const SubjectBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 5px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: #ebf4ff;
  color: #2c5282;
  margin-left: auto;
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

const NoDataMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 1.1rem;
`;

const ModalContent = styled.div`
  padding: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const ModalText = styled.p`
  margin-bottom: 1.5rem;
`;

const ModalButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const CancelButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 5px;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: transparent;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  }
`;

const ConfirmButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 5px;
  border: none;
  background-color: #e53e3e;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #c53030;
  }
`;

// Thêm nút "Bài thi" vào header
const NavItemWithExams = styled.li`
  margin: 0 1rem;
  
  @media (max-width: 768px) {
    margin: 0.5rem 0;
  }
  
  a {
    color: ${props => props.theme === 'dark' ? '#ffffff' : '#333333'};
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
    
    &:hover {
      color: #4285f4;
    }
  }
`;

const AddExamButton = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 100;
`;

const FloatingButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4285f4, #34a853);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
  }
  
  &:active {
    transform: translateY(-2px);
  }
`;

const StudentExamList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list: exams, loading, pagination } = useSelector(state => state.exams);
  const { theme } = useSelector(state => state.ui);
  const { user } = useSelector(state => state.auth);
  
  // Debug user role
  useEffect(() => {
    console.log('Current user:', user);
  }, [user]);
  
  // Kiểm tra xem người dùng có phải admin hoặc teacher không
  const isAdminOrTeacher = (() => {
    if (!user) return false;
    // Kiểm tra cả chữ hoa và thường
    const role = (user.role || '').toLowerCase();
    console.log('User role lowercase:', role);
    return role === 'admin' || role === 'teacher';
  })();
  
  console.log('Is admin or teacher:', isAdminOrTeacher);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 9,
    search: '',
    difficulty: '',
    subject: ''
  });
  
  // State cho modal xóa bài thi
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  
  useEffect(() => {
    dispatch(fetchExams(filters));
  }, [dispatch, filters]);
  
  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      search: e.target.value,
      page: 1 // Reset về trang đầu tiên khi tìm kiếm
    });
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
      page: 1 // Reset về trang đầu tiên khi thay đổi bộ lọc
    });
  };
  
  const handlePageChange = (newPage) => {
    setFilters({
      ...filters,
      page: newPage
    });
  };
  
  const handleStartExam = (examId) => {
    navigate(`/exams/${examId}`);
  };
  
  const handleCreateExam = () => {
    navigate('/admin/exams/create');
  };
  
  const handleEditExam = (examId) => {
    navigate(`/admin/exams/${examId}/edit`);
  };
  
  const handleDeleteClick = (exam) => {
    setExamToDelete(exam);
    setShowDeleteModal(true);
  };
  
  const handleDeleteConfirm = () => {
    if (examToDelete) {
      dispatch(removeExam(examToDelete.id))
        .unwrap()
        .then(() => {
          showSuccessToast('Xóa bài thi thành công!');
          setShowDeleteModal(false);
          // Refresh danh sách bài thi
          dispatch(fetchExams(filters));
        })
        .catch((error) => {
          showErrorToast(`Lỗi khi xóa bài thi: ${error}`);
        });
    }
  };
  const mockExams = [
    {
      id: 1,
      title: "Đề thi Toán học THPT Quốc Gia",
      createdBy: "Nguyễn Văn A",
      duration: 90,
      questionCount: 50,
      difficulty: "hard",
      subjectName: "Toán học",
      isPublic: true
    },
    {
      id: 2,
      title: "Đề thi Vật lý học kỳ 1",
      createdBy: "Trần Văn B",
      duration: 45,
      questionCount: 30,
      difficulty: "medium",
      subjectName: "Vật lý",
      isPublic: true
    },
    {
      id: 3,
      title: "Đề thi Hóa học cơ bản",
      createdBy: "Lê Thị C",
      duration: 60,
      questionCount: 40,
      difficulty: "easy",
      subjectName: "Hóa học",
      isPublic: false
    }
  ];
  // Sử dụng mock data nếu không có dữ liệu thực
  const displayedExams = exams?.length > 0 ? exams : mockExams;
  
  
  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setExamToDelete(null);
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <PageContainer>
      <Header />
      <MainContent>
        <Container>
          <HeaderContainer>
            <TitleContainer>
              <Title theme={theme}>Danh sách bài thi</Title>
              <Subtitle theme={theme}>Chọn bài thi phù hợp để luyện tập và nâng cao kiến thức</Subtitle>
            </TitleContainer>
            
            {/* Chỉ hiển thị nút tạo bài thi mới cho admin hoặc teacher */}
            {isAdminOrTeacher && (
              <CreateButton onClick={handleCreateExam}>
                <FaPlus />
                Tạo bài thi mới
              </CreateButton>
            )}
          </HeaderContainer>
          
          <FiltersContainer>
            {/* Phần filter không đổi */}
          </FiltersContainer>
          
          {displayedExams.length === 0 ? (
            <NoDataMessage theme={theme}>
              Không tìm thấy bài thi nào phù hợp với tiêu chí tìm kiếm.
            </NoDataMessage>
          ) : (
            <>
              <ExamsGrid>
                {displayedExams.map(exam => (
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
                      <ExamInfo theme={theme}>
                        <FaClock />
                        <span>Thời gian: {exam.duration} phút</span>
                      </ExamInfo>
                      <ExamInfo theme={theme}>
                        <FaClipboardList />
                        <span>Số câu hỏi: {exam.questionCount || exam.questions?.length || 'N/A'}</span>
                      </ExamInfo>
                      <ExamInfo theme={theme}>
                        <FaChalkboardTeacher />
                        <span>Độ khó: <DifficultyBadge difficulty={exam.difficulty}>{exam.difficulty || 'Trung bình'}</DifficultyBadge></span>
                        {exam.subjectName && <SubjectBadge>{exam.subjectName}</SubjectBadge>}
                      </ExamInfo>
                      
                      {/* Hiển thị nút Sửa và Xóa chỉ cho admin/teacher */}
                      {isAdminOrTeacher && (
                        <AdminActionsContainer>
                          <EditButton onClick={() => handleEditExam(exam.id)}>
                            <FaEdit />
                          </EditButton>
                          <DeleteButton onClick={() => handleDeleteClick(exam)}>
                            <FaTrash />
                          </DeleteButton>
                        </AdminActionsContainer>
                      )}
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
              
              {pagination && pagination.totalPages > 1 && (
                <PaginationContainer>
                  <PageButton 
                    theme={theme} 
                    disabled={pagination.currentPage === 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                  >
                    &lt;
                  </PageButton>
                  
                  {[...Array(pagination.totalPages).keys()].map(num => (
                    <PageButton 
                      key={num + 1}
                      theme={theme}
                      active={pagination.currentPage === num + 1}
                      onClick={() => handlePageChange(num + 1)}
                    >
                      {num + 1}
                    </PageButton>
                  ))}
                  
                  <PageButton 
                    theme={theme}
                    disabled={pagination.currentPage === pagination.totalPages}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                  >
                    &gt;
                  </PageButton>
                </PaginationContainer>
              )}
            </>
          )}
          
          {/* Nút tạo bài thi nổi (floating) - hiển thị khi là admin/teacher */}
          {isAdminOrTeacher && (
            <AddExamButton>
              <FloatingButton onClick={handleCreateExam}>
                <FaPlus />
              </FloatingButton>
            </AddExamButton>
          )}
          
          {/* Modal xác nhận xóa bài thi */}
          {showDeleteModal && (
            <Modal isOpen={showDeleteModal} onClose={handleCloseModal} theme={theme}>
              <ModalContent theme={theme}>
                <ModalTitle>Xác nhận xóa</ModalTitle>
                <ModalText>
                  Bạn có chắc chắn muốn xóa bài thi "{examToDelete?.title}"? 
                  Thao tác này không thể hoàn tác.
                </ModalText>
                <ModalButtonContainer>
                  <CancelButton theme={theme} onClick={handleCloseModal}>
                    Hủy bỏ
                  </CancelButton>
                  <ConfirmButton onClick={handleDeleteConfirm}>
                    Xác nhận xóa
                  </ConfirmButton>
                </ModalButtonContainer>
              </ModalContent>
            </Modal>
          )}
        </Container>
      </MainContent>
    </PageContainer>
  );
};

export default StudentExamList;