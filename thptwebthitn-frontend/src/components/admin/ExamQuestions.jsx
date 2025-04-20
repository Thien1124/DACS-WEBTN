import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, FaPlus, FaEdit, FaTrash, 
  FaSort, FaCheck, FaSortAmountUp, FaSortAmountDown 
} from 'react-icons/fa';
import { fetchExamWithQuestions } from '../../redux/examSlice';
import { removeQuestion } from '../../redux/questionSlice';
import { createQuestion, updateQuestion } from '../../services/questionService'; // Thêm import này
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmModal from '../common/ConfirmModal';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';

const ExamQuestions = () => {
  const { examId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { theme } = useSelector(state => state.ui);
  const { currentExam, examQuestions, loading } = useSelector(state => state.exams);
  
  const [questions, setQuestions] = useState([]);
  const [sortField, setSortField] = useState('order');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  
  useEffect(() => {
    if (examId) {
      console.log('Fetching exam with ID:', examId);
      dispatch(fetchExamWithQuestions(examId));
    }
  }, [dispatch, examId]);
  
  useEffect(() => {
    console.log('Current exam data:', currentExam);
    console.log('Exam questions data:', examQuestions);
    
    // Kiểm tra cấu trúc của câu hỏi đầu tiên nếu có
    if (examQuestions && examQuestions.length > 0) {
      console.log('First question structure:', examQuestions[0]);
      sortQuestions(examQuestions, sortField, sortDirection);
    } else {
      setQuestions([]);
    }
  }, [examQuestions, sortField, sortDirection]);
  
  const sortQuestions = (questionsList, field, direction) => {
    const sortedQuestions = [...questionsList].sort((a, b) => {
      if (field === 'order') {
        return direction === 'asc' ? a.order - b.order : b.order - a.order;
      }
      return 0;
    });
    setQuestions(sortedQuestions);
  };
  
  const handleSort = (field) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };
  
  const handleAddQuestion = () => {
    navigate(`/admin/exams/${examId}/questions/create`);
  };
  
  const handleEditQuestion = (questionId) => {
    navigate(`/admin/exams/${examId}/questions/${questionId}/edit`);
  };
  
  const openDeleteModal = (question) => {
    setQuestionToDelete(question);
    setShowDeleteModal(true);
  };
  
  const handleDeleteQuestion = () => {
    if (questionToDelete) {
      dispatch(removeQuestion(questionToDelete.id))
        .unwrap()
        .then(() => {
          showSuccessToast('Xóa câu hỏi thành công!');
          dispatch(fetchExamWithQuestions(examId));
          setShowDeleteModal(false);
        })
        .catch((error) => {
          showErrorToast(`Lỗi khi xóa câu hỏi: ${error}`);
          setShowDeleteModal(false);
        });
    }
  };
  
  const getSortIcon = () => {
    return sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />;
  };
  
  if (loading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <div>
          <BackButton onClick={() => navigate('/admin/exams')}>
            <FaArrowLeft /> Quay lại danh sách đề thi
          </BackButton>
          <Title theme={theme}>
            Quản lý câu hỏi - {currentExam?.title || 'Đề thi'}
          </Title>
          <Subtitle theme={theme}>
            Tổng số: {questions.length} câu hỏi
          </Subtitle>
        </div>
        <div>
          <Button onClick={handleAddQuestion} primary>
            <FaPlus /> Thêm câu hỏi
          </Button>
        </div>
      </Header>
      
      {questions.length === 0 ? (
        <EmptyState theme={theme}>
          <p>Đề thi chưa có câu hỏi nào.</p>
          <p>Hãy thêm câu hỏi để hoàn thiện đề thi.</p>
          <Button onClick={handleAddQuestion} primary>
            <FaPlus /> Thêm câu hỏi ngay
          </Button>
        </EmptyState>
      ) : (
        <QuestionsContainer>
          <SortingHeader>
            <SortButton 
              theme={theme} 
              onClick={() => handleSort('order')}
            >
              Sắp xếp theo thứ tự {sortField === 'order' && getSortIcon()}
            </SortButton>
          </SortingHeader>
          
          {questions.map((question, index) => (
            <QuestionCard key={question.id} theme={theme}>
              <QuestionHeader theme={theme}>
                <QuestionNumber theme={theme}>Câu {question.order || index + 1}</QuestionNumber>
                <ActionButtons>
                  <ActionButton 
                    onClick={() => handleEditQuestion(question.id)}
                    title="Chỉnh sửa câu hỏi"
                  >
                    <FaEdit />
                  </ActionButton>
                  <ActionButton 
                    onClick={() => openDeleteModal(question)}
                    title="Xóa câu hỏi"
                    danger
                  >
                    <FaTrash />
                  </ActionButton>
                </ActionButtons>
              </QuestionHeader>
              
              <QuestionContent theme={theme}>
                {/* Kiểm tra các trường có thể chứa nội dung câu hỏi */}
                {question.text ? (
                  <QuestionText dangerouslySetInnerHTML={{ __html: question.text }} />
                ) : question.content ? (
                  <QuestionText dangerouslySetInnerHTML={{ __html: question.content }} />
                ) : (
                  <QuestionText>Không có nội dung câu hỏi</QuestionText>
                )}
              </QuestionContent>
              
              <OptionsContainer>
                {question.options && question.options.map((option, optIndex) => (
                  <OptionItem key={option.id}>
                    <OptionText theme={theme}>
                      {option.content}
                    </OptionText>
                    {option.isCorrect && (
                      <CorrectBadge theme={theme}>
                        <FaCheck /> Đáp án đúng
                      </CorrectBadge>
                    )}
                  </OptionItem>
                ))}
              </OptionsContainer>
            </QuestionCard>
          ))}
        </QuestionsContainer>
      )}
      
      <ConfirmModal
        show={showDeleteModal}
        title="Xác nhận xóa câu hỏi"
        message="Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác."
        confirmText="Xóa câu hỏi"
        cancelText="Hủy bỏ"
        onConfirm={handleDeleteQuestion}
        onCancel={() => setShowDeleteModal(false)}
      />
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const Subtitle = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #4299e1;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  background-color: ${props => props.primary ? '#4299e1' : '#e2e8f0'};
  color: ${props => props.primary ? 'white' : '#2d3748'};
  
  &:hover {
    background-color: ${props => props.primary ? '#3182ce' : '#cbd5e0'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  border-radius: 8px;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  p {
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }
  
  button {
    margin: 1rem auto;
  }
`;

const QuestionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SortingHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  }
`;

const QuestionCard = styled.div`
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  overflow: hidden;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : 'white'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f7fafc'};
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const QuestionNumber = styled.div`
  font-weight: bold;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.danger ? '#f56565' : '#4299e1'};
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const QuestionContent = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const QuestionText = styled.div`
  font-size: 1.1rem;
  line-height: 1.6;
`;

const OptionsContainer = styled.div`
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const OptionItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 6px;
  position: relative;
  background-color: ${props => props.isCorrect 
    ? props.theme === 'dark' ? 'rgba(72, 187, 120, 0.2)' : 'rgba(72, 187, 120, 0.1)'
    : 'transparent'
  };
  border: 1px solid ${props => props.isCorrect
    ? '#48bb78'
    : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'
  };
`;

const OptionLabel = styled.div`
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.isCorrect ? '#48bb78' : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  color: ${props => props.isCorrect || props.theme === 'dark' ? 'white' : '#4a5568'};
  border-radius: 50%;
  font-weight: 500;
  font-size: 0.9rem;
`;

const OptionText = styled.div`
  flex: 1;
`;

const CorrectBadge = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: #48bb78;
  color: white;
  font-size: 0.7rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export default ExamQuestions;