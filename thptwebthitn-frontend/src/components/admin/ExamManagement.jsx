import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaEdit, FaEye, FaPlus, FaTrash, FaSearch, 
  FaSort, FaList, FaFileImport, FaFileExport, FaFilter, 
  FaClock, FaCheckCircle, FaTimesCircle, FaSync, FaUnlock 
} from 'react-icons/fa';
import { 
  fetchExams, 
  removeExam, 
  updateExamDuration,
  approveExam 
} from '../../redux/examSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmModal from '../common/ConfirmModal';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import ImportExamsModal from '../modals/ImportExamsModal';
import ExportResultsModal from '../modals/ExportResultsModal';
import UpdateExamDurationModal from '../modals/UpdateExamDurationModal';
import ApproveExamModal from '../modals/ApproveExamModal';
import { getExams } from "../../services/examService";
import store from '../../redux/store'; // Điều chỉnh đường dẫn nếu cần

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

const TimeActionButton = styled(ActionButton)`
  background-color: #805ad5;
  &:hover {
    background-color: #6b46c1;
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

// Add a new styled component for approval status
const ApprovalBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  background-color: ${props => props.approved ? '#c6f6d5' : '#e9d8fd'};
  color: ${props => props.approved ? '#22543d' : '#553c9a'};
`;

const ApproveButton = styled(ActionButton)`
  background-color: #48bb78;
  &:hover {
    background-color: #38a169;
  }
`;

const ExamManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  const { list: exams, loading, error } = useSelector(state => state.exams); // Thêm error từ Redux state
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [retryCount, setRetryCount] = useState(0); // Thêm state đếm số lần thử lại
  const [localLoading, setLoading] = useState(false); // Thêm local loading state
  const [localError, setLocalError] = useState(null); // Thêm local error state
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  // New state for import/export modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // New state for duration modal
  const [showDurationModal, setShowDurationModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  
  // New state for the approval modal
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [examToApprove, setExamToApprove] = useState(null);
  
  
  const loadExams = useCallback(() => {
    setLoading(true);
    setLocalError(null);
    
    // Đảm bảo page và limit luôn có giá trị
    const params = {
      page: page || 1, // Đảm bảo page luôn ít nhất là 1
      pageSize: limit || 10, // Đảm bảo pageSize luôn ít nhất là 10
      SearchTerm: searchTerm || "",
      subjectId: subjectFilter || undefined,
      activeOnly: statusFilter === 'active' ? "true" :
                  (statusFilter === 'inactive' ? "false" : undefined),
      isApproved: approvalFilter === 'approved' ? "true" :
                  (approvalFilter === 'pending' ? "false" : undefined),
    };
  
    console.log('Loading exams with params:', params);
  
    try {
      dispatch(fetchExams(params))
        .unwrap()
        .then(response => {
          console.log('Exams loaded successfully:', response);
          // Kiểm tra nếu response có totalCount > 0 nhưng data rỗng
          if (response.totalCount > 0 && (!response.data || response.data.length === 0)) {
            console.warn('API returned totalCount > 0 but empty data array. Retrying with explicit pagination...');
            // Thử lại với tham số phân trang rõ ràng
            return dispatch(fetchExams({...params, page: 1, pageSize: 20})).unwrap();
          }
          setRetryCount(0);
          setLoading(false);
          return response;
        })
        .catch(error => {
          console.error('Error during exam loading:', error);
          
          // Kiểm tra xem lỗi có phải là lỗi mạng không
          const isNetworkError = !error.response || error.code === 'ERR_NETWORK';
          const errorMessage = isNetworkError 
            ? 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và đảm bảo API server đang hoạt động.'
            : error.message || 'Lỗi không xác định khi tải đề thi.';
          
          setLocalError(errorMessage);
          showErrorToast(errorMessage);
          setLoading(false);
        });
    } catch (outerError) {
      // Xử lý lỗi ngoài cùng (hiếm gặp)
      console.error('Outer error in loadExams:', outerError);
      setLocalError('Đã xảy ra lỗi không mong muốn khi tải dữ liệu.');
      setLoading(false);
    }
  }, [dispatch, page, limit, searchTerm, statusFilter, subjectFilter, approvalFilter]);
  
  useEffect(() => {
    console.log('ExamManagement effect triggered: Loading exams');
    loadExams();
  }, [loadExams]); // Chỉ cần loadExams ở đây vì nó đã bao gồm các dependencies khác

  // Giữ lại useEffect debug này
  useEffect(() => {
    console.log('Current exams state:', exams);
    console.log('Is loading:', loading);
    console.log('Error:', error);
  }, [exams, loading, error]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    loadExams();
  };
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1);
  };
  
  const navigateToExam = (examId) => {
    navigate(`/exams/${examId}`);
  };
  
  const handleManageQuestions = (examId) => {
    navigate(`/admin/exams/${examId}/questions`);
  };
  
  const handleCreateExam = () => {
    navigate('/admin/exams/create');
  };
  
  const handleEditExam = (id) => {
    navigate(`/admin/exams/${id}/edit`);
  };
  
  const handleViewExam = (id) => {
    navigateToExam(id);
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
  
  const handleImportExams = (file) => {
    // Here you would normally call an API to process the CSV file
    // For demonstration, we'll show a success message
    showSuccessToast(`Đã nhập thành công file ${file.name}`);
    // After successful import, refresh the exams list
    loadExams();
  };
  
  const handleExportResults = (exportConfig) => {
    console.log("Export configuration:", exportConfig);
    
    // In a real app, this would make an API call to get the data
    // and then create a CSV file for download
    
    // Create sample CSV content based on the selected columns
    let csvContent = exportConfig.columns.join(',') + '\n';
    
    // Add some sample data rows
    csvContent += '001,Nguyễn Văn A,Đề thi Toán học THPT Quốc Gia,8.5,50,42,60,2023-04-10T10:30:00\n';
    csvContent += '002,Trần Thị B,Đề thi Vật lý học kỳ 1,7.5,40,30,45,2023-04-11T09:15:00\n';
    csvContent += '003,Lê Văn C,Đề thi Hóa học cơ bản,9.0,30,27,40,2023-04-12T14:20:00\n';
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'exam_results.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    showSuccessToast('Đã xuất dữ liệu thành công!');
  };
  
  const handleEditDuration = (exam) => {
    setSelectedExam(exam);
    setShowDurationModal(true);
  };
  
  const handleUpdateDuration = async (examId, duration) => {
    try {
      await dispatch(updateExamDuration({ examId, duration })).unwrap();
      showSuccessToast('Cập nhật thời gian làm bài thành công!');
      return Promise.resolve();
    } catch (error) {
      showErrorToast(`Lỗi khi cập nhật thời gian: ${error}`);
      return Promise.reject(error);
    }
  };
  
  const handleApproveClick = (exam) => {
    setExamToApprove(exam);
    setShowApproveModal(true);
  };
  
  const handleApproveExam = async (examId, comment) => {
    try {
      await dispatch(approveExam({ examId, comment })).unwrap();
      showSuccessToast('Đề thi đã được duyệt thành công!');
      loadExams();
      return Promise.resolve();
    } catch (error) {
      showErrorToast(`Không thể duyệt đề thi: ${error}`);
      return Promise.reject(error);
    }
  };
  
  // Sửa hàm getFilteredExams

const getFilteredExams = () => {
  console.log('Filtering exams, raw state received:', exams);
  
  // Xử lý nhiều trường hợp cấu trúc dữ liệu có thể có
  let examArray = [];
  
  if (Array.isArray(exams)) {
    examArray = exams;
  } else if (Array.isArray(exams?.list)) {
    examArray = exams.list;
  } else if (exams?.items && Array.isArray(exams.items)) {
    examArray = exams.items;
  }
  
  // Lọc theo trạng thái duyệt - ĐÂY LÀ NƠI CẦN SỬA
  return examArray.filter(exam => {
    // Check approval filter - Sửa đổi logic lọc đúng trường isApproved
    if (approvalFilter === 'approved' && !exam.isApproved) return false;
    if (approvalFilter === 'pending' && exam.isApproved) return false;
    
    // Các điều kiện lọc khác
    if (statusFilter === 'active' && !exam.isActive) return false;
    if (statusFilter === 'inactive' && exam.isActive) return false;
    
    // Lọc theo subject nếu có
    if (subjectFilter && exam.subject?.id !== parseInt(subjectFilter)) return false;
    
    // Lọc theo search term nếu có
    if (searchTerm && !exam.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    return true;
  });
};
  
  // Define filteredExams with the function
  const filteredExams = useMemo(() => getFilteredExams(), [exams, searchTerm, statusFilter, subjectFilter, approvalFilter]);
  
  
  
  return (
    <Container>
      <Header>
        <Title theme={theme}>Quản lý đề thi</Title>
        <ButtonsContainer>
          <Button theme={theme} primary onClick={handleCreateExam}>
            <FaPlus /> Thêm đề thi
          </Button>
          <Button theme={theme} onClick={() => setShowImportModal(true)}>
            <FaFileImport /> Nhập Excel
          </Button>
          <Button theme={theme} onClick={() => setShowExportModal(true)}>
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
            active={statusFilter === 'all'} 
            onClick={() => setStatusFilter('all')}
          >
            <FaFilter /> Tất cả
          </FilterButton>
          <FilterButton 
            theme={theme} 
            active={statusFilter === 'active'} 
            onClick={() => setStatusFilter('active')}
          >
            Kích hoạt
          </FilterButton>
          <FilterButton 
            theme={theme} 
            active={statusFilter === 'inactive'} 
            onClick={() => setStatusFilter('inactive')}
          >
            Ẩn
          </FilterButton>
        </div>
        
        {/* New approval filter buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <FilterButton 
            theme={theme}
            active={approvalFilter === 'all'} 
            onClick={() => setApprovalFilter('all')}
          >
            Tất cả đề
          </FilterButton>
          <FilterButton 
            theme={theme}
            active={approvalFilter === 'approved'} 
            onClick={() => setApprovalFilter('approved')}
          >
            <FaCheckCircle /> Đã duyệt
          </FilterButton>
          <FilterButton 
            theme={theme}
            active={approvalFilter === 'pending'} 
            onClick={() => setApprovalFilter('pending')}
          >
            <FaTimesCircle /> Chờ duyệt
          </FilterButton>
        </div>
      </FiltersRow>
      
      {loading || localLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <LoadingSpinner size="lg" />
          <p style={{ marginTop: '10px' }}>Đang tải dữ liệu đề thi...</p>
          {retryCount > 0 && (
            <p>Lần thử lại thứ {retryCount}...</p>
          )}
        </div>
      ) : filteredExams.length === 0 ? (
        <EmptyState theme={theme}>
          <FaSearch size={48} color={theme === 'dark' ? '#4a5568' : '#cbd5e0'} />
          <h3>Không tìm thấy đề thi</h3>
          <p>
            {localError || error ? (
              <>
                <strong>Lỗi:</strong> {localError || error}
              </>
            ) : (searchTerm || statusFilter !== 'all' || subjectFilter || approvalFilter !== 'all') ? (
              'Không có đề thi nào phù hợp với bộ lọc hiện tại. Hãy thử điều chỉnh bộ lọc.'
            ) : (
              'Chưa có đề thi nào trong hệ thống hoặc chưa tải được dữ liệu. Hãy thử tải lại.'
            )}
          </p>
          <Button 
            theme={theme} 
            primary 
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setSubjectFilter('');
              setApprovalFilter('all');
              // Thêm force reload với setTimeout
              setLoading(true);
              setTimeout(() => {
                loadExams();
                setLoading(false);
              }, 300);
            }}
            style={{ marginTop: '20px' }}
          >
            <FaSync /> {localError ? 'Thử lại kết nối' : 'Đặt lại bộ lọc & tải lại dữ liệu'}
          </Button>
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
                <TableHeader theme={theme}>Phê duyệt</TableHeader>
                <TableHeader theme={theme}>Thao tác</TableHeader>
              </TableRow>
            </TableHead>
            <tbody>
              {filteredExams.map(exam => (
                <TableRow key={exam.id} theme={theme}>
                  <TableCell theme={theme}>{exam.id}</TableCell>
                  <TableCell theme={theme}>{exam.title}</TableCell>
                  <TableCell theme={theme}>{exam.subject?.name || 'N/A'}</TableCell>
                  <TableCell theme={theme}>{exam.questionCount || exam.questions?.length || '0'}</TableCell>
                  <TableCell theme={theme}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {exam.duration}
                      <TimeActionButton 
                        onClick={() => handleEditDuration(exam)} 
                        title="Cập nhật thời gian làm bài"
                        style={{ marginLeft: '8px' }}
                      >
                        <FaClock size={14} />
                      </TimeActionButton>
                    </div>
                  </TableCell>
                  <TableCell theme={theme}>
                    <StatusBadge active={exam.isActive}>
                      {exam.isActive ? 'Kích hoạt' : 'Ẩn'}
                    </StatusBadge>
                  </TableCell>
                  <TableCell theme={theme}>
                    <ApprovalBadge approved={exam.isApproved}>
                      {exam.isApproved ? 
                        <><FaCheckCircle /> Đã duyệt</> : 
                        <><FaTimesCircle /> Chờ duyệt</>
                      }
                    </ApprovalBadge>
                  </TableCell>
                  <TableCell theme={theme}>
                    <ActionButton onClick={() => handleViewExam(exam.id)} title="Xem đề thi">
                      <FaEye />
                    </ActionButton>
                    <ActionButton onClick={() => handleManageQuestions(exam.id)} title="Quản lý câu hỏi" color="#805ad5">
                      <FaList />
                    </ActionButton>
                    {!exam.isApproved && (
                      <ApproveButton
                        onClick={() => handleApproveClick(exam)}
                        title="Duyệt đề thi"
                      >
                        <FaCheckCircle size={14} />
                      </ApproveButton>
                    )}
                    <ActionButton onClick={() => handleEditExam(exam.id)} title="Chỉnh sửa" color="#4299e1">
                      <FaEdit />
                    </ActionButton>
                    <ActionButton onClick={() => openDeleteModal(exam.id)} title="Xóa" color="#f56565">
                      <FaTrash />
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
          
          {filteredExams.length === 0 && (
            <EmptyState theme={theme}>
              <FaSearch size={48} color={theme === 'dark' ? '#4a5568' : '#cbd5e0'} />
              <h3>Không tìm thấy đề thi</h3>
              <p>Không có đề thi nào phù hợp với bộ lọc hiện tại.</p>
            </EmptyState>
          )}
          
          <PaginationContainer>
            <PageButton 
              theme={theme} 
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              &lt;
            </PageButton>
            
            {[...Array(5)].map((_, index) => {
              const pageNum = page - 2 + index;
              if (pageNum < 1) return null;
              return (
                <PageButton 
                  key={index}
                  theme={theme}
                  active={pageNum === page}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </PageButton>
              );
            })}
            
            <PageButton 
              theme={theme} 
              onClick={() => setPage(page + 1)}
            >
              &gt;
            </PageButton>
          </PaginationContainer>
        </>
      )}
      
      {/* Import Modal */}
      <ImportExamsModal
        show={showImportModal}
        onClose={() => setShowImportModal(false)}
        theme={theme}
        onImport={handleImportExams}
      />
      
      {/* Export Modal */}
      <ExportResultsModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        theme={theme}
        onExport={handleExportResults}
      />
      
      {/* Existing confirm modal */}
      <ConfirmModal
        show={showDeleteModal}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa đề thi này? Hành động này không thể hoàn tác."
        confirmText="Xóa đề thi"
        cancelText="Hủy bỏ"
        onConfirm={handleDeleteExam}
        onCancel={() => setShowDeleteModal(false)}
      />
      
      {/* Duration Update Modal */}
      <UpdateExamDurationModal
        show={showDurationModal}
        onClose={() => setShowDurationModal(false)}
        theme={theme}
        exam={selectedExam}
        onUpdateDuration={handleUpdateDuration}
      />
      
      {/* Approval Modal */}
      <ApproveExamModal
        show={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        theme={theme}
        exam={examToApprove}
        onApprove={handleApproveExam}
      />
    </Container>
  );
};

export default ExamManagement;