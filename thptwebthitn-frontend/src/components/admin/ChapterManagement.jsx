import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { 
  FaEdit, FaPlus, FaTrash, FaSearch, 
  FaSort, FaFilter, FaBook
} from 'react-icons/fa';
import { 
  fetchChapters, 
  removeChapter, 
  addChapter,
  editChapter
} from '../../redux/chapterSlice';
import { fetchSubjects } from '../../redux/subjectSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmModal from '../common/ConfirmModal';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';

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

const SelectFilter = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
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

const Modal = styled.div`
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  padding: 2rem;
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h2`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-top: 0;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const ChapterManagement = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector(state => state.ui);
  const { list: chapters, loading, totalPages } = useSelector(state => state.chapters);
  const { list: subjects } = useSelector(state => state.subjects);
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subjectId: '',
    order: 1
  });
  
  const loadChapters = () => {
    const params = {
      page,
      limit,
      search: searchTerm,
      subjectId: selectedSubject || undefined,
      sortBy: sortField,
      sortOrder
    };
    
    dispatch(fetchChapters(params));
  };
  
  useEffect(() => {
    loadChapters();
  }, [page, limit, sortField, sortOrder, selectedSubject]);
  
  useEffect(() => {
    // Load subjects for filter dropdown
    dispatch(fetchSubjects());
  }, []);
  
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    loadChapters();
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
  
  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };
  
  const handleDeleteChapter = () => {
    if (deleteId) {
      dispatch(removeChapter(deleteId))
        .unwrap()
        .then(() => {
          showSuccessToast('Xóa chương thành công!');
          setShowDeleteModal(false);
          if (chapters.length === 1 && page > 1) {
            setPage(page - 1);
          } else {
            loadChapters();
          }
        })
        .catch(error => {
          showErrorToast(`Lỗi khi xóa chương: ${error}`);
          setShowDeleteModal(false);
        });
    }
  };
  
  const openChapterModal = (chapter = null) => {
    if (chapter) {
      setEditingChapter(chapter);
      setFormData({
        name: chapter.name,
        description: chapter.description || '',
        subjectId: chapter.subjectId,
        order: chapter.order || 1
      });
    } else {
      setEditingChapter(null);
      setFormData({
        name: '',
        description: '',
        subjectId: selectedSubject || '',
        order: 1
      });
    }
    setShowChapterModal(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmitChapter = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showErrorToast('Vui lòng nhập tên chương!');
      return;
    }
    
    if (!formData.subjectId) {
      showErrorToast('Vui lòng chọn môn học!');
      return;
    }
    
    if (editingChapter) {
      // Update existing chapter
      dispatch(editChapter({ id: editingChapter.id, chapterData: formData }))
        .unwrap()
        .then(() => {
          showSuccessToast('Cập nhật chương thành công!');
          setShowChapterModal(false);
          loadChapters();
        })
        .catch(error => {
          showErrorToast(`Lỗi khi cập nhật chương: ${error}`);
        });
    } else {
      // Create new chapter
      dispatch(addChapter(formData))
        .unwrap()
        .then(() => {
          showSuccessToast('Tạo chương mới thành công!');
          setShowChapterModal(false);
          loadChapters();
        })
        .catch(error => {
          showErrorToast(`Lỗi khi tạo chương: ${error}`);
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
        <Title theme={theme}>Quản lý chương</Title>
        <ButtonsContainer>
          <Button theme={theme} primary onClick={() => openChapterModal()}>
            <FaPlus /> Thêm chương mới
          </Button>
        </ButtonsContainer>
      </Header>
      
      <FiltersRow>
        <SearchContainer>
          <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%' }}>
            <SearchInput 
              type="text"
              placeholder="Tìm theo tên chương"
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
          <SelectFilter 
            theme={theme}
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả môn học</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </SelectFilter>
        </div>
      </FiltersRow>
      
      {loading ? (
        <LoadingSpinner />
      ) : chapters.length === 0 ? (
        <EmptyState theme={theme}>
          <FaBook size={48} color={theme === 'dark' ? '#4a5568' : '#cbd5e0'} />
          <p>Không tìm thấy chương nào.</p>
          <Button theme={theme} primary onClick={() => openChapterModal()}>
            <FaPlus /> Thêm chương mới
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
                <TableHeader theme={theme} sortable onClick={() => handleSort('name')}>
                  Tên chương {getSortIcon('name')}
                </TableHeader>
                <TableHeader theme={theme}>Môn học</TableHeader>
                <TableHeader theme={theme} sortable onClick={() => handleSort('order')}>
                  Thứ tự {getSortIcon('order')}
                </TableHeader>
                <TableHeader theme={theme}>Thao tác</TableHeader>
              </TableRow>
            </TableHead>
            <tbody>
              {chapters.map(chapter => (
                <TableRow key={chapter.id} theme={theme}>
                  <TableCell theme={theme}>{chapter.id}</TableCell>
                  <TableCell theme={theme}>{chapter.name}</TableCell>
                  <TableCell theme={theme}>
                    {subjects.find(s => s.id === chapter.subjectId)?.name || 'N/A'}
                  </TableCell>
                  <TableCell theme={theme}>{chapter.order}</TableCell>
                  <TableCell theme={theme}>
                    <ActionButton 
                      edit 
                      onClick={() => openChapterModal(chapter)} 
                      title="Chỉnh sửa"
                    >
                      <FaEdit />
                    </ActionButton>
                    <ActionButton 
                      delete 
                      onClick={() => openDeleteModal(chapter.id)} 
                      title="Xóa"
                    >
                      <FaTrash />
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
          
          <PaginationContainer>
            <PageButton 
              theme={theme} 
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              &lt;
            </PageButton>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = page - 2 + i;
              if (pageNum < 1 || pageNum > totalPages) return null;
              return (
                <PageButton 
                  key={i}
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
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              &gt;
            </PageButton>
          </PaginationContainer>
        </>
      )}
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa chương này? Hành động này không thể hoàn tác."
        confirmText="Xóa chương"
        cancelText="Hủy bỏ"
        onConfirm={handleDeleteChapter}
        onCancel={() => setShowDeleteModal(false)}
      />
      
      {/* Chapter Create/Edit Modal */}
      <Modal show={showChapterModal}>
        <ModalContent theme={theme}>
          <ModalTitle theme={theme}>
            {editingChapter ? 'Chỉnh sửa chương' : 'Thêm chương mới'}
          </ModalTitle>
          
          <form onSubmit={handleSubmitChapter}>
            <FormGroup>
              <Label theme={theme}>Tên chương *</Label>
              <Input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                theme={theme}
                required
                placeholder="Nhập tên chương"
              />
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme}>Mô tả</Label>
              <Textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                theme={theme}
                placeholder="Nhập mô tả chương (tùy chọn)"
              />
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme}>Môn học *</Label>
              <SelectFilter 
                name="subjectId"
                value={formData.subjectId}
                onChange={handleInputChange}
                theme={theme}
                required
              >
                <option value="">Chọn môn học</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </SelectFilter>
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme}>Thứ tự</Label>
              <Input 
                type="number" 
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                min="1"
                theme={theme}
                placeholder="Thứ tự hiển thị"
              />
            </FormGroup>
            
            <ButtonGroup>
              <Button 
                type="button"
                theme={theme} 
                onClick={() => setShowChapterModal(false)}
              >
                Hủy bỏ
              </Button>
              <Button type="submit" theme={theme} primary>
                {editingChapter ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </ButtonGroup>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ChapterManagement;