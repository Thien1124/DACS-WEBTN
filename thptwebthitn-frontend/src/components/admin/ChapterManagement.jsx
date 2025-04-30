import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaPlus, FaSort, FaSearch, FaFilter } from 'react-icons/fa';
import { getChapters, deleteChapter } from '../../services/chapterService';
import { getSubjects } from '../../services/subjectService';
import ChapterModal from '../modals/ChapterModal';
import ConfirmModal from '../common/ConfirmModal';
import LoadingSpinner from '../common/LoadingSpinner';

const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1.8rem;
  margin: 0;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  flex: 1;
  min-width: 200px;
  
  svg {
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
    margin-right: 0.5rem;
  }
  
  input {
    background: transparent;
    border: none;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
    width: 100%;
    
    &:focus {
      outline: none;
    }
  }
`;

const Select = styled.select`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 0.375rem;
  padding: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: #3182ce;
  }
`;

const AddButton = styled.button`
  background-color: #3182ce;
  color: white;
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: #2b6cb0;
  }
`;

const ChapterTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  border-radius: 0.5rem;
  overflow: hidden;
`;

const TableHead = styled.thead`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
  font-weight: 600;
`;

const TableCell = styled.td`
  padding: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

// Update the ActionButton styled component
const ActionButton = styled.button`
  background: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  color: ${props => props.theme === 'dark' 
    ? (props.delete ? '#fc8181' : '#90cdf4')
    : (props.delete ? '#e53e3e' : '#3182ce')
  };
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  margin-right: 0.75rem;
  
  &:hover {
    background: ${props => props.theme === 'dark' 
      ? (props.delete ? '#742a2a' : '#2a4365') 
      : (props.delete ? '#fed7d7' : '#bee3f8')};
  }
`;

const ActionsContainer = styled.div`
  display: flex;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
`;

const PageInfo = styled.div`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const PageButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  background: ${props => props.active 
    ? '#3182ce' 
    : props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  color: ${props => props.active 
    ? 'white' 
    : (props.theme === 'dark' ? '#e2e8f0' : '#4a5568')};
  border: none;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background: ${props => props.active 
      ? '#2b6cb0' 
      : (props.theme === 'dark' ? '#4a5568' : '#edf2f7')};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  border-radius: 0.5rem;
  border: 1px dashed ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const ChapterManagement = () => {
  const theme = useSelector(state => state.ui.theme);
  const [chapters, setChapters] = useState([]);
  const [filteredChapters, setFilteredChapters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Fetch chapters and subjects
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const chaptersResponse = await getChapters({ pageSize: 100 });
        const subjectsResponse = await getSubjects();
        
        if (chaptersResponse && Array.isArray(chaptersResponse.items)) {
          setChapters(chaptersResponse.items);
          setFilteredChapters(chaptersResponse.items);
        } else if (chaptersResponse && Array.isArray(chaptersResponse)) {
          setChapters(chaptersResponse);
          setFilteredChapters(chaptersResponse);
        } else {
          setChapters([]);
          setFilteredChapters([]);
        }
        
        if (subjectsResponse && Array.isArray(subjectsResponse.items)) {
          setSubjects(subjectsResponse.items);
        } else if (subjectsResponse && Array.isArray(subjectsResponse)) {
          setSubjects(subjectsResponse);
        } else {
          setSubjects([]);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter chapters when search term or selected subject changes
  useEffect(() => {
    let result = chapters;
    
    if (searchTerm) {
      result = result.filter(chapter => 
        chapter.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedSubject !== 'all') {
      result = result.filter(chapter => 
        chapter.subjectId === parseInt(selectedSubject)
      );
    }
    
    setFilteredChapters(result);
    setCurrentPage(1);
  }, [searchTerm, selectedSubject, chapters]);
  
  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(filteredChapters) 
    ? filteredChapters.slice(indexOfFirstItem, indexOfLastItem) 
    : [];
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Handle adding a new chapter
  const handleAddChapter = () => {
    setEditingChapter(null);
    setShowModal(true);
  };
  
  // Handle editing a chapter
  const handleEditChapter = (chapter) => {
    setEditingChapter(chapter);
    setShowModal(true);
  };
  
  // Handle deleting a chapter
  const handleDeleteChapter = (chapter) => {
    setChapterToDelete(chapter);
    setShowDeleteConfirm(true);
  };
  
  // Confirm chapter deletion
  const confirmDeleteChapter = async () => {
    if (!chapterToDelete) return;
    
    try {
      await deleteChapter(chapterToDelete.id);
      setChapters(prevChapters => 
        prevChapters.filter(ch => ch.id !== chapterToDelete.id)
      );
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Error deleting chapter:", err);
      // You might want to show an error message here
    }
  };
  
  // Handle chapter save success
  const handleChapterSaved = () => {
    setShowModal(false);
    
    // Reload chapters
    const fetchChapters = async () => {
      try {
        const response = await getChapters({ pageSize: 100 });
        if (response && Array.isArray(response.items)) {
          setChapters(response.items);
        } else if (response && Array.isArray(response)) {
          setChapters(response);
        }
      } catch (err) {
        console.error("Error reloading chapters:", err);
      }
    };
    
    fetchChapters();
  };
  
  // Get subject name by ID
  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'N/A';
  };
  
  if (loading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <div style={{ color: 'red' }}>{error}</div>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <Title theme={theme}>Quản lý chương học</Title>
        <AddButton onClick={handleAddChapter}>
          <FaPlus /> Thêm chương mới
        </AddButton>
      </Header>
      
      <FilterContainer>
        <SearchBox theme={theme}>
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên chương..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>
        
        <Select 
          theme={theme}
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="all">Tất cả môn học</option>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </Select>
      </FilterContainer>
      
      {Array.isArray(filteredChapters) && filteredChapters.length > 0 ? (
        <>
          <ChapterTable theme={theme}>
            <TableHead theme={theme}>
              <TableRow theme={theme}>
                <TableHeader theme={theme}>Tên chương</TableHeader>
                <TableHeader theme={theme}>Môn học</TableHeader>
                <TableHeader theme={theme}>Thứ tự</TableHeader>
                <TableHeader theme={theme}>Số bài học</TableHeader>
                <TableHeader theme={theme}>Thao tác</TableHeader>
              </TableRow>
            </TableHead>
            <tbody>
              {currentItems.map(chapter => (
                <TableRow key={chapter.id} theme={theme}>
                  <TableCell theme={theme}>{chapter.name}</TableCell>
                  <TableCell theme={theme}>{getSubjectName(chapter.subjectId)}</TableCell>
                  <TableCell theme={theme}>{chapter.orderIndex || 'N/A'}</TableCell>
                  <TableCell theme={theme}>{chapter.lessonsCount || 0}</TableCell>
                  <TableCell theme={theme}>
                    <ActionsContainer>
                      <ActionButton 
                        theme={theme}
                        onClick={() => handleEditChapter(chapter)}
                        title="Chỉnh sửa"
                      >
                        <FaEdit /> Sửa
                      </ActionButton>
                      <ActionButton 
                        theme={theme}
                        delete
                        onClick={() => handleDeleteChapter(chapter)}
                        title="Xóa"
                      >
                        <FaTrash /> Xóa
                      </ActionButton>
                    </ActionsContainer>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </ChapterTable>
          
          <Pagination>
            <PageInfo theme={theme}>
              Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredChapters.length)} 
              trong số {filteredChapters.length} chương
            </PageInfo>
            <PageButtons>
              <PageButton
                theme={theme}
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Trước
              </PageButton>
              
              {[...Array(Math.ceil(filteredChapters.length / itemsPerPage)).keys()].map(number => (
                <PageButton
                  key={number + 1}
                  onClick={() => paginate(number + 1)}
                  active={currentPage === number + 1}
                  theme={theme}
                >
                  {number + 1}
                </PageButton>
              ))}
              
              <PageButton
                theme={theme}
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === Math.ceil(filteredChapters.length / itemsPerPage)}
              >
                Sau
              </PageButton>
            </PageButtons>
          </Pagination>
        </>
      ) : (
        <EmptyState theme={theme}>
          {searchTerm || selectedSubject !== 'all' 
            ? 'Không tìm thấy chương nào phù hợp với bộ lọc.'
            : 'Chưa có chương nào được tạo. Hãy bấm "Thêm chương mới" để bắt đầu.'}
        </EmptyState>
      )}
      
      {/* Chapter Modal for adding/editing */}
      {showModal && (
        <ChapterModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSaved={handleChapterSaved}
          chapter={editingChapter}
          subjects={subjects}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDeleteChapter}
          title="Xác nhận xóa chương"
          message={`Bạn có chắc chắn muốn xóa chương "${chapterToDelete?.name}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          confirmButtonProps={{ colorScheme: 'red' }}
        />
      )}
    </Container>
  );
};

export default ChapterManagement;