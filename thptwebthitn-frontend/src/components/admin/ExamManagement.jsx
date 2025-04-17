import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaFileExport, 
  FaFileImport 
} from 'react-icons/fa';
import { fetchExams, removeExam } from '../../redux/examSlice1';
import LoadingSpinner from '../common/LoadingSpinner';
import { showErrorToast, showSuccessToast, showConfirmToast } from '../../utils/toastUtils';
import ConfirmModal from '../common/ConfirmModal';

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
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin: 0;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.primary 
    ? 'linear-gradient(135deg, #4285f4, #34a853)' 
    : props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.primary ? '#ffffff' : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  max-width: 500px;
  
  @media (max-width: 768px) {
    max-width: 100%;
    width: 100%;
  }
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

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: ${props => props.active ? '#4299e1' : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  border: 1px solid ${props => props.active ? '#4299e1' : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: ${props => props.active ? '600' : '400'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? '#3182ce' : props.theme === 'dark' ? '#4a556820' : '#e2e8f020'};
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
  cursor: ${props => props.sortable ? 'pointer' : 'default'};
  
  &:hover {
    background-color: ${props => props.sortable ? (props.theme === 'dark' ? '#4a556880' : '#e2e8f080') : 'transparent'};
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  background-color: ${props => props.active ? '#c6f6d5' : '#fed7d7'};
  color: ${props => props.active ? '#22543d' : '#742a2a'};
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: ${props => {
    if (props.edit) return '#4299e1';
    if (props.delete) return '#f56565';
    return '#cbd5e0';
  }};
  color: white;
  margin: 0 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    background-color: ${props => {
      if (props.edit) return '#3182ce';
      if (props.delete) return '#e53e3e';
      return '#a0aec0';
    }};
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

const ExamManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list: exams, loading, pagination } = useSelector(state => state.exams);
  const { theme } = useSelector(state => state.ui);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  useEffect(() => {
    loadExams();
  }, [dispatch, page, sortField, sortOrder, filterStatus]);
  
  const loadExams = () => {
    const params = {
      page,
      limit: 10,
      sort: sortField,
      order: sortOrder,
      status: filterStatus !== 'all' ? filterStatus : undefined,
      search: searchTerm || undefined
    };
    
    dispatch(fetchExams(params));
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);  // Reset to page 1
    loadExams();
  };
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1);  // Reset to page 1
  };
  
  const handleCreateExam = () => {
    navigate('/admin/exams/create');
  };
  
  const handleEditExam = (id) => {
    navigate(`/admin/exams/${id}/edit`);
  };
  
  const handleViewExam = (id) => {
    navigate(`/exams/${id}`);
  };
  
  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };
  
  const handleDeleteExam = () => {
    if (deleteId) {
      dispatch(removeExam(deleteId))
        .unwrap()
        .then(() => {
          showSuccessToast('Xóa đề thi thành công!');
          setShowDeleteModal(false);
          // Reload data if needed
          if (exams.length === 1 && page > 1) {
            setPage(page - 1);
          } else {
            loadExams();
          }
        })
        .catch(error => {
          showErrorToast(`Lỗi khi xóa đề thi: ${error}`);
          setShowDeleteModal(false);
        });
    }
  };
  
  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort />;
    return sortOrder === 'asc' ? '↑' : '↓';
  };
  
  return (
    <Container>
      <Header>
        <Title theme={theme}>Quản lý đề thi</Title>
        <ButtonsContainer>
          <Button theme={theme} primary onClick={handleCreateExam}>
            <FaPlus /> Thêm đề thi
          </Button>
          <Button theme={theme}>
            <FaFileImport /> Nhập Excel
          </Button>
          <Button theme={theme}>
            <FaFileExport /> Xuất Excel
          </Button>
        </ButtonsContainer>
      </Header>
      
      <FiltersRow>
        <SearchContainer>
          <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%' }}>
            <SearchInput 
              type="text"
              placeholder="Tìm theo tên đề thi"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              theme={theme}
            />
            <SearchButton type="submit">
              <FaSearch />
            </SearchButton>
          </form>
        </SearchContainer>
        
        <div>
          <FilterButton 
            theme={theme} 
            active={filterStatus === 'all'} 
            onClick={() => setFilterStatus('all')}
          >
            <FaFilter /> Tất cả
          </FilterButton>
          <FilterButton 
            theme={theme} 
            active={filterStatus === 'active'} 
            onClick={() => setFilterStatus('active')}
          >
            Kích hoạt
          </FilterButton>
          <FilterButton 
            theme={theme} 
            active={filterStatus === 'inactive'} 
            onClick={() => setFilterStatus('inactive')}
          >
            Ẩn
          </FilterButton>
        </div>
      </FiltersRow>
      
      {loading ? (
        <LoadingSpinner />
      ) : exams.length === 0 ? (
        <EmptyState theme={theme}>
          <p>Không tìm thấy đề thi nào.</p>
        </EmptyState>
      ) : (
        <>
          <Table theme={theme}>
            <TableHead theme={theme}>
              <TableRow theme={theme}>
                <TableHeader theme={theme} sortable onClick={() => handleSort('id')}>
                  ID {getSortIcon('id')}
                </TableHeader>
                <TableHeader theme={theme} sortable onClick={() => handleSort('title')}>
                  Tên đề thi {getSortIcon('title')}
                </TableHeader>
                <TableHeader theme={theme}>Môn học</TableHeader>
                <TableHeader theme={theme} sortable onClick={() => handleSort('questionCount')}>
                  Số câu hỏi {getSortIcon('questionCount')}
                </TableHeader>
                <TableHeader theme={theme} sortable onClick={() => handleSort('duration')}>
                  Thời gian (phút) {getSortIcon('duration')}
                </TableHeader>
                <TableHeader theme={theme}>Trạng thái</TableHeader>
                <TableHeader theme={theme} sortable onClick={() => handleSort('createdAt')}>
                  Ngày tạo {getSortIcon('createdAt')}
                </TableHeader>
                <TableHeader theme={theme}>Thao tác</TableHeader>
              </TableRow>
            </TableHead>
            <tbody>
              {exams.map(exam => (
                <TableRow key={exam.id} theme={theme}>
                  <TableCell theme={theme}>{exam.id}</TableCell>
                  <TableCell theme={theme}>{exam.title}</TableCell>
                  <TableCell theme={theme}>{exam.subject?.name || 'N/A'}</TableCell>
                  <TableCell theme={theme}>{exam.questionCount || exam.questions?.length || '0'}</TableCell>
                  <TableCell theme={theme}>{exam.duration}</TableCell>
                  <TableCell theme={theme}>
                    <StatusBadge active={exam.isActive}>
                      {exam.isActive ? 'Kích hoạt' : 'Ẩn'}
                    </StatusBadge>
                  </TableCell>
                  <TableCell theme={theme}>
                    {new Date(exam.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell theme={theme}>
                    <ActionButton onClick={() => handleViewExam(exam.id)}>
                      <FaEye />
                    </ActionButton>
                    <ActionButton edit onClick={() => handleEditExam(exam.id)}>
                      <FaEdit />
                    </ActionButton>
                    <ActionButton delete onClick={() => openDeleteModal(exam.id)}>
                      <FaTrash />
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
          
          {pagination && pagination.totalPages > 1 && (
            <PaginationContainer>
              <PageButton 
                theme={theme} 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                &lt;
              </PageButton>
              
              {[...Array(pagination.totalPages).keys()].map(num => (
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
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                &gt;
              </PageButton>
            </PaginationContainer>
          )}
        </>
      )}
      
      <ConfirmModal
        show={showDeleteModal}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa đề thi này? Hành động này không thể hoàn tác."
        confirmText="Xóa đề thi"
        cancelText="Hủy bỏ"
        onConfirm={handleDeleteExam}
        onCancel={() => setShowDeleteModal(false)}
      />
    </Container>
  );
};

export default ExamManagement;