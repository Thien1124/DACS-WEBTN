import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, FaSearch, FaFilter, FaCalendarAlt, FaGraduationCap,
  FaClock, FaEdit, FaTrash, FaEye, FaUserGraduate, FaChartBar
} from 'react-icons/fa';
import apiClient from '../../services/apiClient';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmModal from '../common/ConfirmModal';

// Main container with a subtle gradient background
const Container = styled.div`
  padding: 2rem;
  min-height: 100vh;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(180deg, #1a202c 0%, #171923 100%)' 
    : 'linear-gradient(180deg, #f7fafc 0%, #edf2f7 100%)'};
`;

// Animated header with subtle shadow
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#2d3748' : '#e2e8f0'};
`;

const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin: 0;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -0.5rem;
    width: 50px;
    height: 4px;
    background: linear-gradient(90deg, #4299e1, #63b3ed);
    border-radius: 2px;
  }
`;

// Button with improved hover effect
const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(to right, #4299e1, #3182ce);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(66, 153, 225, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(66, 153, 225, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Redesigned filters section
const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  padding: 1.25rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 300px;
  position: relative;
  
  svg {
    position: absolute;
    left: 0.75rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#a0aec0'};
  }
  
  input {
    flex: 1;
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
    border-radius: 0.5rem;
    background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
    font-size: 0.95rem;
    
    &:focus {
      outline: none;
      border-color: #4299e1;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
    }
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  label {
    font-size: 0.95rem;
    font-weight: 500;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 0.5rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  min-width: 180px;
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  }
`;

// Redesigned card with smooth corners and better shadow
const Card = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  margin-bottom: 2rem;
`;

// Modern table design
const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.9rem;
  table-layout: fixed;
`;

const Th = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#f7fafc'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.025em;
  
  &:first-child {
    border-top-left-radius: 0.5rem;
    width: 25%;
  }
  
  &:nth-child(2) {
    width: 20%;
  }
  
  &:nth-child(3), &:nth-child(4), &:nth-child(5) {
    width: 12%;
  }
  
  &:last-child {
    border-top-right-radius: 0.5rem;
    width: 19%;
  }
`;

const Td = styled.td`
  padding: 0.75rem 1rem;
  vertical-align: middle;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 0.9rem;
  
  &.title {
    font-weight: 600;
  }
  
  &.time {
    div {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.25rem;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      svg {
        color: ${props => props.theme === 'dark' ? '#90cdf4' : '#4299e1'};
      }
    }
  }
`;


const TitleCell = styled.div`
  display: flex;
  flex-direction: column;
  
  span.main {
    font-weight: 600;
    margin-bottom: 0.1rem;
  }
  
  span.subtitle {
    font-size: 0.8rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  }
`;
const ExamRow = styled(motion.tr)`
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#363f53' : '#f7fafc'};
  }
`;

// Improved status badges with gradient backgrounds
const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
  
  ${props => {
    if (props.status === 'upcoming') {
      return `
        background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
        color: #2b6cb0;
      `;
    } else if (props.status === 'active') {
      return `
        background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
        color: #276749;
      `;
    } else if (props.status === 'completed') {
      return `
        background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
        color: #4a5568;
      `;
    }
  }}
`;

// Redesigned action buttons with tooltips
const ActionButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 0.375rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.375rem 0.5rem;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  border: none;
  border-radius: 0.375rem;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  min-width: 80px;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &.edit {
    background-color: #ebf8ff;
    color: #3182ce;
    
    &:hover {
      background-color: #bee3f8;
    }
  }
  
  &.delete {
    background-color: #fff5f5;
    color: #e53e3e;
    
    &:hover {
      background-color: #fed7d7;
    }
  }
  
  &.view {
    background-color: #f0fff4;
    color: #38a169;
    
    &:hover {
      background-color: #c6f6d5;
    }
  }
  
  &.results {
    background-color: #faf5ff;
    color: #805ad5;
    
    &:hover {
      background-color: #e9d8fd;
    }
  }
`;


// Redesigned empty state with animation
const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  
  svg {
    margin-bottom: 1.5rem;
    color: ${props => props.theme === 'dark' ? '#4299e1' : '#4299e1'};
    opacity: 0.8;
  }
  
  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
  
  p {
    font-size: 1rem;
    max-width: 500px;
    margin: 0 auto;
  }
`;

// Improved pagination
const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#f7fafc'};
  border-bottom-left-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
`;

const PageInfo = styled.span`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  font-size: 0.95rem;
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 1rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 0.5rem;
  font-weight: 500;
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

// Helper functions
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getExamStatus = (startTime, endTime) => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'active';
  return 'completed';
};

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

const emptyStateVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

const OfficialExamsList = () => {
  const { theme } = useSelector(state => state.ui);
  const navigate = useNavigate();
  
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  
  // Fetch exams when component mounts or filters change
  useEffect(() => {
    fetchExams();
  }, [page, pageSize, searchTerm, statusFilter]);
  
  const fetchExams = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      };
      
      const response = await apiClient.get('/api/official-exams', { params });
      
      console.log('Official exams response:', response);
      
      let examData = [];
      let totalItems = 0;
      let pages = 1;
      
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          examData = response.data;
          totalItems = examData.length;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          examData = response.data.data;
          totalItems = response.data.totalCount || examData.length;
          pages = response.data.totalPages || Math.ceil(totalItems / pageSize);
        } else if (response.data.items && Array.isArray(response.data.items)) {
          examData = response.data.items;
          totalItems = response.data.totalCount || examData.length;
          pages = response.data.totalPages || Math.ceil(totalItems / pageSize);
        }
      }
      
      setExams(examData);
      setTotalCount(totalItems);
      setTotalPages(pages);
    } catch (error) {
      console.error('Error fetching official exams:', error);
      showErrorToast('Không thể tải danh sách kỳ thi');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateExam = () => {
    navigate('/admin/official-exams/create');
  };
  
  const handleEditExam = (examId) => {
    navigate(`/admin/official-exams/edit/${examId}`);
  };
  
  const handleViewExam = (examId) => {
    navigate(`/admin/official-exams/${examId}`);
  };
  
  const handleViewResults = (examId) => {
    navigate(`/admin/official-exams/${examId}/results`);
  };
  
  const handleDeleteClick = (exam) => {
    setExamToDelete(exam);
    setShowConfirmDialog(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!examToDelete) return;
    
    try {
      await apiClient.delete(`/api/official-exams/${examToDelete.id}`);
      showSuccessToast('Xóa kỳ thi thành công');
      fetchExams(); // Reload the list
    } catch (error) {
      console.error('Error deleting exam:', error);
      showErrorToast('Không thể xóa kỳ thi');
    } finally {
      setShowConfirmDialog(false);
      setExamToDelete(null);
    }
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when search changes
  };
  
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1); // Reset to first page when filter changes
  };
  
  return (
    <Container theme={theme}>
      <Header>
        <Title theme={theme}>Kỳ Thi Chính Thức</Title>
        <CreateButton onClick={handleCreateExam}>
          <FaPlus /> Tạo kỳ thi mới
        </CreateButton>
      </Header>
      
      <FiltersContainer theme={theme}>
        <SearchInput theme={theme}>
          <FaSearch />
          <input 
            type="text" 
            placeholder="Tìm kiếm kỳ thi..." 
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </SearchInput>
        
        <FilterGroup theme={theme}>
          <label>
            <FaFilter /> Trạng thái:
          </label>
          <Select 
            theme={theme}
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="upcoming">Sắp diễn ra</option>
            <option value="active">Đang diễn ra</option>
            <option value="completed">Đã kết thúc</option>
          </Select>
        </FilterGroup>
      </FiltersContainer>
      
      <AnimatePresence>
        <Card 
          theme={theme}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          {loading ? (
            <EmptyState 
              theme={theme}
              variants={emptyStateVariants}
              initial="hidden"
              animate="visible"
            >
              <LoadingSpinner size={60} />
              <h3>Đang tải danh sách kỳ thi</h3>
              <p>Vui lòng đợi trong giây lát...</p>
            </EmptyState>
          ) : exams.length === 0 ? (
            <EmptyState 
              theme={theme}
              variants={emptyStateVariants}
              initial="hidden"
              animate="visible"
            >
              <FaCalendarAlt size={60} />
              <h3>Chưa có kỳ thi nào</h3>
              <p>Hãy tạo kỳ thi đầu tiên bằng cách nhấn nút "Tạo kỳ thi mới" ở trên.</p>
              <div style={{ marginTop: '1.5rem' }}>
                <CreateButton onClick={handleCreateExam}>
                  <FaPlus /> Tạo kỳ thi đầu tiên
                </CreateButton>
              </div>
            </EmptyState>
          ) : (
            <>
              <Table>
                <thead>
                  <tr>
                    <Th theme={theme}>Kỳ thi</Th>
                    <Th theme={theme}>Thời gian</Th>
                    <Th theme={theme}>Lớp</Th>
                    <Th theme={theme}>Học sinh</Th>
                    <Th theme={theme}>Trạng thái</Th>
                    <Th theme={theme}>Thao tác</Th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {exams.map((exam, index) => {
                      const status = getExamStatus(exam.startTime, exam.endTime);
                      
                      return (
                        <ExamRow 
                          key={exam.id}
                          theme={theme}
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: index * 0.05 }}
                        >
                          <Td theme={theme} className="title">
                            <TitleCell theme={theme}>
                              <span className="main">{exam.title}</span>
                              <span className="subtitle">Đề: {exam.examTitle || exam.examId}</span>
                            </TitleCell>
                          </Td>
                          <Td theme={theme} className="time">
                            <div><FaCalendarAlt /> {formatDateTime(exam.startTime)}</div>
                            <div><FaClock /> {formatDateTime(exam.endTime)}</div>
                          </Td>
                          <Td theme={theme}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <FaGraduationCap />
                              {exam.classroomName || `Khối ${exam.classroomId}`}
                            </div>
                          </Td>
                          <Td theme={theme}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <FaUserGraduate />
                              {exam.assignedStudentsCount > 0 ? 
                                `${exam.assignedStudentsCount} học sinh` : 
                                "Chưa có học sinh"}
                            </div>
                          </Td>
                          <Td theme={theme}>
                            <StatusBadge status={status}>
                              {status === 'upcoming' && (
                                <>
                                  <span>•</span> Sắp diễn ra
                                </>
                              )}
                              {status === 'active' && (
                                <>
                                  <span>•</span> Đang diễn ra
                                </>
                              )}
                              {status === 'completed' && (
                                <>
                                  <span>•</span> Đã kết thúc
                                </>
                              )}
                            </StatusBadge>
                          </Td>
                          <Td theme={theme}>
                            <ActionButtonsContainer>
                                <ActionButton 
                                className="view" 
                                theme={theme}
                                onClick={() => handleViewExam(exam.id)}
                                >
                                <FaEye /> <span>Xem</span>
                                </ActionButton>
                                
                                <ActionButton 
                                className="results" 
                                theme={theme}
                                onClick={() => handleViewResults(exam.id)}
                                >
                                <FaChartBar /> <span>Kết quả</span>
                                </ActionButton>
                                
                                <ActionButton 
                                className="edit" 
                                theme={theme}
                                onClick={() => handleEditExam(exam.id)}
                                >
                                <FaEdit /> <span>Sửa</span>
                                </ActionButton>
                                
                                <ActionButton 
                                className="delete" 
                                theme={theme}
                                onClick={() => handleDeleteClick(exam)}
                                >
                                <FaTrash /> <span>Xóa</span>
                                </ActionButton>
                            </ActionButtonsContainer>
                            </Td>
                        </ExamRow>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </Table>
              
              <Pagination theme={theme}>
                <PageButton 
                  theme={theme}
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  ← Trang trước
                </PageButton>
                
                <PageInfo theme={theme}>
                  Trang {page} / {totalPages} • {totalCount} kỳ thi
                </PageInfo>
                
                <PageButton 
                  theme={theme}
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  Trang sau →
                </PageButton>
              </Pagination>
            </>
          )}
        </Card>
      </AnimatePresence>
      
      {showConfirmDialog && (
        <ConfirmModal
          title="Xác nhận xóa"
          message={`Bạn có chắc chắn muốn xóa kỳ thi "${examToDelete?.title}"?`}
          confirmLabel="Xóa"
          cancelLabel="Hủy"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}
    </Container>
  );
};

export default OfficialExamsList;