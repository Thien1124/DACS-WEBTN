import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter } from 'react-icons/fa';
import { fetchQuestions, removeQuestion } from '../../redux/questionSlice';
import { fetchAllSubjects } from '../../redux/subjectSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import { showErrorToast, showSuccessToast } from '../../utils/toastUtils';
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

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
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

const QuestionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const QuestionCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const QuestionHeader = styled.div`
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#f7fafc'};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const QuestionSubject = styled.span`
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#cbd5e0' : '#718096'};
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

const QuestionContent = styled.div`
  padding: 1rem;
  
  p {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
    margin-bottom: 1rem;
    font-size: 1rem;
    line-height: 1.5;
  }
`;

const QuestionFooter = styled.div`
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const QuestionInfo = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background-color: ${props => {
    if (props.edit) return '#4299e1';
    if (props.delete) return '#f56565';
    return '#cbd5e0';
  }};
  color: white;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const TruncatedText = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const cleanHTML = (html) => {
  // Simple function to remove HTML tags for displaying truncated content
  return html.replace(/<[^>]*>?/gm, '');
};

const QuestionManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list: questions, loading, pagination } = useSelector(state => state.questions);
  const { subjects } = useSelector(state => state.subjects);
  const { theme } = useSelector(state => state.ui);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [subjectId, setSubjectId] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  useEffect(() => {
    dispatch(fetchAllSubjects());
    loadQuestions();
  }, [dispatch, page, difficulty, subjectId]);
  
  const loadQuestions = () => {
    const params = {
      page,
      limit: 12,
      difficulty: difficulty !== 'all' ? difficulty : undefined,
      subjectId: subjectId || undefined,
      search: searchTerm || undefined
    };
    
    dispatch(fetchQuestions(params));
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);  // Reset to page 1
    loadQuestions();
  };
  
  const handleCreateQuestion = () => {
    navigate('/admin/questions/create');
  };
  
  const handleEditQuestion = (id) => {
    navigate(`/admin/questions/${id}/edit`);
  };
  
  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };
  
  const handleDeleteQuestion = () => {
    if (deleteId) {
      dispatch(removeQuestion(deleteId))
        .unwrap()
        .then(() => {
          showSuccessToast('Xóa câu hỏi thành công!');
          setShowDeleteModal(false);
          loadQuestions();
        })
        .catch(error => {
          showErrorToast(`Lỗi khi xóa câu hỏi: ${error}`);
          setShowDeleteModal(false);
        });
    }
  };
  
  return (
    <Container>
      <Header>
        <Title theme={theme}>Quản lý câu hỏi</Title>
        <Button theme={theme} primary onClick={handleCreateQuestion}>
          <FaPlus /> Thêm câu hỏi mới
        </Button>
      </Header>
      
      <FiltersRow>
        <SearchContainer>
          <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%' }}>
            <SearchInput 
              type="text"
              placeholder="Tìm kiếm câu hỏi"
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
            active={difficulty === 'all'} 
            onClick={() => setDifficulty('all')}
          >
            <FaFilter /> Tất cả
          </FilterButton>
          <FilterButton 
            theme={theme} 
            active={difficulty === 'easy'} 
            onClick={() => setDifficulty('easy')}
          >
            Dễ
          </FilterButton>
          <FilterButton 
            theme={theme} 
            active={difficulty === 'medium'} 
            onClick={() => setDifficulty('medium')}
          >
            Trung bình
          </FilterButton>
          <FilterButton 
            theme={theme} 
            active={difficulty === 'hard'} 
            onClick={() => setDifficulty('hard')}
          >
            Khó
          </FilterButton>
        </div>
        
        <Select 
          value={subjectId} 
          onChange={e => setSubjectId(e.target.value)}
          theme={theme}
        >
          <option value="">Tất cả môn học</option>
          {subjects?.map(subject => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </Select>
      </FiltersRow>
      
      {loading ? (
        <LoadingSpinner />
      ) : questions.length === 0 ? (
        <EmptyState theme={theme}>
          <p>Không tìm thấy câu hỏi nào.</p>
          <Button theme={theme} primary onClick={handleCreateQuestion} style={{ margin: '1rem auto', display: 'flex' }}>
            <FaPlus /> Thêm câu hỏi mới
          </Button>
        </EmptyState>
      ) : (
        <>
          <QuestionsGrid>
            {questions.map(question => (
              <QuestionCard key={question.id} theme={theme}>
                <QuestionHeader theme={theme}>
                  <QuestionSubject theme={theme}>
                    {question.subject?.name || 'Không xác định'}
                  </QuestionSubject>
                  <DifficultyBadge difficulty={question.difficulty}>
                    {question.difficulty === 'easy' ? 'Dễ' : 
                     question.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                  </DifficultyBadge>
                </QuestionHeader>
                
                <QuestionContent theme={theme}>
                  <TruncatedText theme={theme}>
                    {cleanHTML(question.content)}
                  </TruncatedText>
                </QuestionContent>
                
                <QuestionFooter theme={theme}>
                  <QuestionInfo theme={theme}>
                    {question.options?.length || 0} đáp án
                  </QuestionInfo>
                  
                  <ActionButtons>
                    <ActionButton edit onClick={() => handleEditQuestion(question.id)}>
                      <FaEdit />
                    </ActionButton>
                    <ActionButton delete onClick={() => openDeleteModal(question.id)}>
                      <FaTrash />
                    </ActionButton>
                  </ActionButtons>
                </QuestionFooter>
              </QuestionCard>
            ))}
          </QuestionsGrid>
          
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
        message="Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác và sẽ ảnh hưởng đến các đề thi đã sử dụng câu hỏi này."
        confirmText="Xóa câu hỏi"
        cancelText="Hủy bỏ"
        onConfirm={handleDeleteQuestion}
        onCancel={() => setShowDeleteModal(false)}
      />
    </Container>
  );
};

export default QuestionManagement;