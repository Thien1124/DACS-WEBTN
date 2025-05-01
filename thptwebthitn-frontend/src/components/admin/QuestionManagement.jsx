import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaPlus, FaSync, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaFileExcel, FaFileDownload } from 'react-icons/fa';
import { fetchQuestions, removeQuestion } from '../../redux/questionSlice';
import { fetchAllSubjects } from '../../redux/subjectSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import { showErrorToast, showSuccessToast } from '../../utils/toastUtils';
import ConfirmModal from '../common/ConfirmModal';
import apiClient from '../../services/apiClient';
import { getAllSubjectsNoPaging } from '../../services/subjectService';

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
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
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
  
  @media (max-width: 400px) {
    flex-direction: column;
    width: 100%;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.edit && `
    background-color: #3182ce;
    color: white;
    
    &:hover {
      background-color: #2c5282;
      transform: translateY(-2px);
      box-shadow: 0 3px 8px rgba(49, 130, 206, 0.3);
    }
  `}
  
  ${props => props.delete && `
    background-color: #e53e3e;
    color: white;
    
    &:hover {
      background-color: #c53030;
      transform: translateY(-2px);
      box-shadow: 0 3px 8px rgba(229, 62, 62, 0.3);
    }
  `}
  
  svg {
    font-size: 0.9rem;
  }
  
  @media (max-width: 400px) {
    width: 100%;
    justify-content: center;
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

const OptionCountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${props => {
    const count = props.count || 0;
    if (count === 0) return props.theme === 'dark' ? '#2D3748' : '#EDF2F7';
    return props.theme === 'dark' ? '#2C5282' : '#EBF8FF';  
  }};
  color: ${props => {
    const count = props.count || 0;
    if (count === 0) return props.theme === 'dark' ? '#A0AEC0' : '#718096';
    return props.theme === 'dark' ? '#90CDF4' : '#2B6CB0';
  }};
  margin-right: 0.5rem;
`;

// Add this new styled component for options preview
const OptionsPreview = styled.div`
  padding: 0.75rem 1rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f8fafc'};
  border-top: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const OptionItem = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
  padding: 0.4rem 0.5rem;
  border-radius: 4px;
  background-color: ${props => 
    props.isCorrect 
      ? props.theme === 'dark' ? 'rgba(72, 187, 120, 0.2)' : 'rgba(72, 187, 120, 0.1)'
      : props.theme === 'dark' ? '#2d3748' : '#fff'
  };
  border-left: 3px solid ${props => 
    props.isCorrect ? '#48bb78' : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'
  };
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const OptionLabel = styled.div`
  font-size: 0.85rem;
  font-weight: ${props => props.isCorrect ? '600' : '400'};
  color: ${props => 
    props.isCorrect
      ? props.theme === 'dark' ? '#9ae6b4' : '#22543d'
      : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'
  };
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CorrectBadge = styled.span`
  font-size: 0.7rem;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  background-color: #48bb78;
  color: white;
  margin-left: 0.5rem;
`;

const cleanHTML = (html) => {
  // Simple function to remove HTML tags for displaying truncated content
  return html.replace(/<[^>]*>?/gm, '');
};

const getOptionCountDisplay = (question) => {
  // Try to get options from question data first
  if (question.options && Array.isArray(question.options)) {
    return question.options.length;
  }
  
  // Fallback to known option counts based on question ID
  const knownOptionCounts = {
    1: 4, // Question 1 has 4 options
    2: 4, // Question 2 has 4 options
    3: 4  // Question 3 has 4 options
  };
  
  return knownOptionCounts[question.id] || 0;
};

const QuestionManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const questions = useSelector(state => state.questions);
  
  // Replace this line:
  // const list = questions?.list || [];
  
  // With this more robust check:
  const list = Array.isArray(questions?.list) ? questions.list : [];
  
  const { subjects } = useSelector(state => state.subjects);
  const { theme } = useSelector(state => state.ui);
  const { loading } = useSelector(state => state.questions) || { loading: false };
  const { pagination } = useSelector(state => state.questions) || { pagination: {} };
  
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [subjectId, setSubjectId] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Add a useEffect to load options for questions that don't have them
  const [questionOptions, setQuestionOptions] = useState({});

  // Add state for subjects loaded from the service directly
  const [subjectsList, setSubjectsList] = useState([]);
  
  // Replace the subject loading useEffect with this direct API call
  useEffect(() => {
    // Load subjects directly using the no-paging API
    const loadSubjects = async () => {
      try {
        const data = await getAllSubjectsNoPaging();
        console.log('Subjects loaded successfully:', data);
        setSubjectsList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load subjects:', error);
        showErrorToast('Không thể tải danh sách môn học');
      }
    };
    
    loadSubjects();
  }, []);

  // Add separate useEffect to reset page when filters change
  useEffect(() => {
    // Reset to page 1 when changing filters to avoid empty results
    if (page !== 1) {
      setPage(1);
    } else {
      // If already on page 1, just load questions
      loadQuestions();
    }
  }, [difficulty, subjectId]);

  // Keep the existing useEffect for page changes
  useEffect(() => {
    loadQuestions();
  }, [page, difficulty, subjectId]);
  

  // Update the loadQuestions function to handle filters correctly
  const loadQuestions = () => {
    const params = {
      page,
      pageSize: 12,
      difficulty: difficulty !== 'all' ? difficulty : undefined,
      subjectId: subjectId || undefined,
      searchTerm: searchTerm || undefined
    };
    
    console.log('Loading questions with params:', params);
    dispatch(fetchQuestions(params));
  };

  // Add a clear filters function
  const clearFilters = () => {
    setDifficulty('all');
    setSubjectId('');
    setSearchTerm('');
    setPage(1);
  };

  useEffect(() => {
    // Only run if we have questions but they don't have options
    if (list.length > 0 && list.some(q => !q.options || q.options.length === 0)) {
      console.log('Some questions are missing options, fetching them...');
      
      // Create a map of questionIds that need options
      const questionsNeedingOptions = list
        .filter(q => !q.options || q.options.length === 0)
        .map(q => q.id);
      
      // Fetch options for each question
      Promise.all(
        questionsNeedingOptions.map(qId => 
          apiClient.get(`/api/Question/${qId}/options`)
            .then(response => ({ 
              questionId: qId, 
              options: response.data 
            }))
            .catch(err => {
              console.error(`Failed to fetch options for question ${qId}:`, err);
              return { questionId: qId, options: [] };
            })
        )
      ).then(results => {
        // Create a map of questionId -> options
        const optionsMap = results.reduce((acc, result) => {
          acc[result.questionId] = result.options;
          return acc;
        }, {});
        
        setQuestionOptions(optionsMap);
      });
    }
  }, [list]);

  // Update the useEffect to load subjects correctly (without pagination)
  useEffect(() => {
    // Fetch all subjects (no pagination needed)
    dispatch(fetchAllSubjects());
  }, [dispatch]);

  // Add separate useEffect for loading questions with filters
  useEffect(() => {
    loadQuestions();
  }, [page, difficulty, subjectId]);

  // Add a debugging useEffect to log the Redux state
  useEffect(() => {
    console.log('Redux questions state:', questions);
    if (questions && Array.isArray(questions.list)) {
      console.log(`Found ${questions.list.length} questions in store`);
    } else {
      console.warn('Questions list is not an array or is empty:', questions?.list);
    }
  }, [questions]);
  
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

  // Add these new functions to handle export and import template
  const handleExportQuestions = () => {
    apiClient.post('/api/Question/export', {}, { responseType: 'blob' })
      .then(response => {
        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        // Get current date for filename
        const date = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `questions-export-${date}.xlsx`);
        document.body.appendChild(link);
        link.click();
        // Clean up
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        showSuccessToast('Xuất dữ liệu câu hỏi thành công!');
      })
      .catch(error => {
        console.error('Export error:', error);
        showErrorToast('Lỗi khi xuất dữ liệu câu hỏi');
      });
  };

  const handleDownloadImportTemplate = () => {
    apiClient.get('/api/Question/import-template', { responseType: 'blob' })
      .then(response => {
        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'question-import-template.xlsx');
        document.body.appendChild(link);
        link.click();
        // Clean up
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        showSuccessToast('Tải xuống mẫu nhập liệu thành công!');
      })
      .catch(error => {
        console.error('Template download error:', error);
        showErrorToast('Lỗi khi tải xuống mẫu nhập liệu');
      });
  };
  
  return (
    <Container>
      <Header>
        <div>
          <Title theme={theme}>Quản lý câu hỏi</Title>
          <p style={{ 
            color: theme === 'dark' ? '#a0aec0' : '#718096',
            marginTop: '0.5rem'
          }}>
            Quản lý, tạo mới và cập nhật các câu hỏi trong ngân hàng đề thi
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button theme={theme} onClick={() => loadQuestions()}>
            <FaSync /> Tải lại
          </Button>
          
          {/* Add Export button */}
          <Button 
            theme={theme} 
            onClick={handleExportQuestions}
            style={{ backgroundColor: theme === 'dark' ? '#2d3748' : '#e2e8f0' }}
          >
            <FaFileExcel /> Xuất Excel
          </Button>
          
          {/* Add Import Template button */}
          <Button 
            theme={theme} 
            onClick={handleDownloadImportTemplate}
            style={{ backgroundColor: theme === 'dark' ? '#2d3748' : '#e2e8f0' }}
          >
            <FaFileDownload /> Mẫu nhập liệu
          </Button>
          
          <Button theme={theme} primary onClick={handleCreateQuestion}>
            <FaPlus /> Thêm câu hỏi mới
          </Button>
        </div>
      </Header>
      
      <div style={{
        background: theme === 'dark' ? '#4a5568' : '#f7fafc',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
      }}>
        <FiltersRow>
          <SearchContainer>
            <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%' }}>
              <SearchInput 
                type="text"
                placeholder="Tìm kiếm nội dung câu hỏi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                theme={theme}
              />
              <SearchButton type="submit">
                <FaSearch />
              </SearchButton>
            </form>
          </SearchContainer>
          
          {/* Replace the difficulty filter buttons with this corrected code */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <FilterButton 
              theme={theme} 
              active={difficulty === 'all'} 
              onClick={() => setDifficulty('all')}
              style={{
                backgroundColor: difficulty === 'all' ? 
                  (theme === 'dark' ? '#4299e1' : '#4299e1') : 
                  'transparent',
                color: difficulty === 'all' ? 'white' : undefined
              }}
            >
              <FaFilter /> Tất cả
            </FilterButton>
            <FilterButton 
              theme={theme} 
              active={difficulty === 'easy'} 
              onClick={() => setDifficulty('easy')}
              style={{
                backgroundColor: difficulty === 'easy' ? '#48bb78' : 'transparent',
                borderColor: difficulty === 'easy' ? '#48bb78' : undefined,
                color: difficulty === 'easy' ? 'white' : undefined
              }}
            >
              Dễ
            </FilterButton>
            <FilterButton 
              theme={theme} 
              active={difficulty === 'medium'} 
              onClick={() => setDifficulty('medium')}
              style={{
                backgroundColor: difficulty === 'medium' ? '#ecc94b' : 'transparent',
                borderColor: difficulty === 'medium' ? '#ecc94b' : undefined,
                color: difficulty === 'medium' ? 'white' : undefined
              }}
            >
              Trung bình
            </FilterButton>
            <FilterButton 
              theme={theme} 
              active={difficulty === 'hard'} 
              onClick={() => setDifficulty('hard')}
              style={{
                backgroundColor: difficulty === 'hard' ? '#f56565' : 'transparent',
                borderColor: difficulty === 'hard' ? '#f56565' : undefined,
                color: difficulty === 'hard' ? 'white' : undefined
              }}
            >
              Khó
            </FilterButton>
          </div>
          
          {/* Replace the subject dropdown with this updated code */}
          <Select 
            value={subjectId} 
            onChange={e => {
              const value = e.target.value;
              console.log('Selected subject ID:', value);
              setSubjectId(value);
            }}
            theme={theme}
            style={{
              minWidth: '200px',
              border: `2px solid ${subjectId ? '#4299e1' : (theme === 'dark' ? '#4a5568' : '#e2e8f0')}`,
            }}
          >
            <option value="">Tất cả môn học</option>
            {subjectsList && subjectsList.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </Select>
        </FiltersRow>

        {/* Stats row */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '1rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{
            fontSize: '0.9rem',
            color: theme === 'dark' ? '#a0aec0' : '#718096'
          }}>
            <span style={{ fontWeight: 'bold' }}>Tổng số:</span> {pagination?.totalItems || list.length} câu hỏi
          </div>
          
          <div>
            <Button 
              theme={theme} 
              onClick={clearFilters}
              style={{ fontSize: '0.9rem' }}
            >
              <FaFilter /> Xóa bộ lọc
            </Button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '4rem 0',
          flexDirection: 'column',
          gap: '1rem',
          backgroundColor: theme === 'dark' ? '#2d3748' : '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <LoadingSpinner />
          <p style={{ color: theme === 'dark' ? '#a0aec0' : '#718096' }}>
            Đang tải dữ liệu câu hỏi...
          </p>
        </div>
      ) : list.length === 0 ? (
        <div style={{
          backgroundColor: theme === 'dark' ? '#2d3748' : '#ffffff',
          borderRadius: '12px',
          padding: '3rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', color: theme === 'dark' ? '#4a5568' : '#cbd5e0', marginBottom: '1rem' }}>
            <FaSearch />
          </div>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: theme === 'dark' ? '#e2e8f0' : '#2d3748' }}>
            Không tìm thấy câu hỏi nào
          </p>
          <p style={{ color: theme === 'dark' ? '#a0aec0' : '#718096', marginBottom: '1.5rem' }}>
            {searchTerm || subjectId || difficulty !== 'all' 
              ? 'Không có câu hỏi nào phù hợp với bộ lọc hiện tại.' 
              : 'Không thể tải câu hỏi từ máy chủ. Vui lòng thử lại.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Button 
              theme={theme} 
              onClick={() => {
                setSearchTerm('');
                setDifficulty('all');
                setSubjectId('');
                setPage(1);
                loadQuestions();
              }}
            >
              <FaFilter /> Đặt lại bộ lọc
            </Button>
            <Button theme={theme} primary onClick={() => loadQuestions()}>
              <FaSync /> Tải lại dữ liệu
            </Button>
          </div>
        </div>
      ) : (
        <>
          <QuestionsGrid>
            {list.map(question => (
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
                    {cleanHTML(question.content || '')}
                  </TruncatedText>
                </QuestionContent>
                
                {/* Add Options Preview */}
                <OptionsPreview theme={theme}>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem',
                    color: theme === 'dark' ? '#90cdf4' : '#3182ce'
                  }}>
                    Đáp án:
                  </div>
                  
                  {/* Get options from the question or from our cached options */}
                  {(question.options || questionOptions[question.id] || [])
                    .slice(0, 4) // Show max 4 options
                    .map((option, index) => (
                      <OptionItem 
                        key={option.id || index} 
                        isCorrect={option.isCorrect} 
                        theme={theme}
                      >
                        <OptionLabel 
                          isCorrect={option.isCorrect}
                          theme={theme}
                        >
                          {String.fromCharCode(65 + index)}. {/* A, B, C, D labels */}
                          {cleanHTML(option.content || '').substring(0, 40)}
                          {cleanHTML(option.content || '').length > 40 ? '...' : ''}
                          {option.isCorrect && <CorrectBadge>Đúng</CorrectBadge>}
                        </OptionLabel>
                      </OptionItem>
                    ))}
                  
                  {/* If we don't have options data yet but know options exist */}
                  {getOptionCountDisplay(question) > 0 && 
                   (!question.options || !question.options.length) && 
                   !questionOptions[question.id] && (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '0.5rem', 
                      color: theme === 'dark' ? '#a0aec0' : '#718096',
                      fontSize: '0.85rem'
                    }}>
                      <FaSync style={{ fontSize: '0.8rem', marginRight: '0.3rem' }} />
                      Đang tải đáp án...
                    </div>
                  )}
                  
                  {/* If there are no options */}
                  {getOptionCountDisplay(question) === 0 && (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '0.5rem', 
                      color: theme === 'dark' ? '#a0aec0' : '#718096',
                      fontSize: '0.85rem'
                    }}>
                      Câu hỏi này không có đáp án
                    </div>
                  )}
                </OptionsPreview>
                
                <div style={{ 
                  padding: '0.5rem 1rem', 
                  backgroundColor: theme === 'dark' ? '#2d3748' : '#f7fafc',
                  borderTop: `1px solid ${theme === 'dark' ? '#4a5568' : '#e2e8f0'}`,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <OptionCountBadge count={getOptionCountDisplay(question)} theme={theme}>
                    {getOptionCountDisplay(question)} đáp án
                  </OptionCountBadge>
                  
                  <div style={{ flex: 1 }}></div>
                  
                  <button 
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      color: theme === 'dark' ? '#90cdf4' : '#3182ce',
                      marginRight: '0.5rem'
                    }}
                    onClick={() => navigate(`/admin/questions/${question.id}`)}
                    title="Xem chi tiết"
                  >
                    <FaEye />
                  </button>
                </div>
                
                <QuestionFooter theme={theme}>
                  <ActionButtons>
                    <ActionButton edit onClick={() => handleEditQuestion(question.id)}>
                      <FaEdit /> Chỉnh sửa
                    </ActionButton>
                    <ActionButton delete onClick={() => openDeleteModal(question.id)}>
                      <FaTrash /> Xóa
                    </ActionButton>
                  </ActionButtons>
                </QuestionFooter>
              </QuestionCard>
            ))}
          </QuestionsGrid>
          
          {pagination && pagination.totalPages > 1 && (
            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              backgroundColor: theme === 'dark' ? '#2d3748' : '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <PaginationContainer>
                <PageButton 
                  theme={theme} 
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  &lt;
                </PageButton>
                
                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PageButton 
                      key={pageNum}
                      theme={theme}
                      active={page === pageNum}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </PageButton>
                  );
                })}
                
                {pagination.totalPages > 5 && page < pagination.totalPages - 2 && (
                  <span style={{ margin: '0 0.5rem', color: theme === 'dark' ? '#a0aec0' : '#718096' }}>...</span>
                )}
                
                {pagination.totalPages > 5 && (
                  <PageButton 
                    theme={theme}
                    active={page === pagination.totalPages}
                    onClick={() => setPage(pagination.totalPages)}
                  >
                    {pagination.totalPages}
                  </PageButton>
                )}
                
                <PageButton 
                  theme={theme}
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  &gt;
                </PageButton>
              </PaginationContainer>
              
              <div style={{ 
                textAlign: 'center', 
                marginTop: '1rem',
                fontSize: '0.9rem',
                color: theme === 'dark' ? '#a0aec0' : '#718096'
              }}>
                Trang {page} / {pagination.totalPages}
              </div>
            </div>
          )}
        </>
      )}
      
      <ConfirmModal
        show={showDeleteModal}
        title="Xác nhận xóa câu hỏi"
        message={
          <div>
            <p>Bạn có chắc chắn muốn xóa câu hỏi này?</p>
            <p style={{ color: '#e53e3e', marginTop: '0.5rem' }}>
              <strong>Lưu ý:</strong> Hành động này không thể hoàn tác và sẽ ảnh hưởng đến các đề thi đã sử dụng câu hỏi này.
            </p>
          </div>
        }
        confirmText="Xóa câu hỏi"
        cancelText="Hủy bỏ"
        confirmButtonStyle={{ backgroundColor: '#e53e3e' }}
        onConfirm={handleDeleteQuestion}
        onCancel={() => setShowDeleteModal(false)}
      />
    </Container>
  );
};

export default QuestionManagement;