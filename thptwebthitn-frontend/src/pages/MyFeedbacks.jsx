import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaComment, FaCheckCircle, FaClock, FaExclamationCircle, FaBug, FaQuestionCircle, FaExclamationTriangle } from 'react-icons/fa';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Import Redux actions
import { getMyFeedbacks } from '../redux/feedbackSlice';

const MyFeedbacks = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useSelector(state => state.ui);
  
  // Lấy dữ liệu từ Redux store
  const { items: feedbacks, loading, error, pagination } = useSelector(state => state.feedback.myFeedbacks);
  
  const statusLabels = {
    0: { label: 'Chờ xử lý', color: '#ed8936', icon: <FaClock /> },
    1: { label: 'Đang xử lý', color: '#3182ce', icon: <FaComment /> },
    2: { label: 'Đã giải quyết', color: '#38a169', icon: <FaCheckCircle /> },
    3: { label: 'Đã từ chối', color: '#e53e3e', icon: <FaExclamationCircle /> }
  };
  
  const feedbackTypeLabels = {
    0: { label: 'Lỗi hệ thống', icon: <FaBug /> },
    1: { label: 'Lỗi nội dung', icon: <FaExclamationTriangle /> },
    2: { label: 'Góp ý cải thiện', icon: <FaComment /> },
    3: { label: 'Câu hỏi khác', icon: <FaQuestionCircle /> }
  };
  
  useEffect(() => {
    // Fetch danh sách phản hồi của người dùng
    dispatch(getMyFeedbacks({ 
      page: pagination.currentPage, 
      pageSize: pagination.pageSize 
    }));
  }, [dispatch, pagination.currentPage, pagination.pageSize]);
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      dispatch(getMyFeedbacks({ 
        page: newPage, 
        pageSize: pagination.pageSize 
      }));
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };
  
  if (loading) {
    return (
      <PageContainer>
        <Header>
          <Title theme={theme}>Phản hồi của tôi</Title>
        </Header>
        <LoadingContainer>
          <LoadingSpinner size="lg" />
          <LoadingText>Đang tải danh sách phản hồi...</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }
  
  if (error) {
    return (
      <PageContainer>
        <Header>
          <Title theme={theme}>Phản hồi của tôi</Title>
        </Header>
        <ErrorContainer theme={theme}>
          <ErrorMessage>{error}</ErrorMessage>
        </ErrorContainer>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <Header>
        <Title theme={theme}>Phản hồi của tôi</Title>
      </Header>
      
      {feedbacks.length === 0 ? (
        <EmptyState theme={theme}>
          <EmptyIcon />
          <EmptyMessage>Bạn chưa có phản hồi nào</EmptyMessage>
          <Link to="/exams">
            <EmptyActionButton 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Xem danh sách bài thi
            </EmptyActionButton>
          </Link>
        </EmptyState>
      ) : (
        <>
          <FeedbackList>
            {feedbacks.map(feedback => (
              <FeedbackItem 
                key={feedback.id} 
                theme={theme}
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <FeedbackHeader theme={theme}>
                  <FeedbackInfo>
                    <FeedbackType theme={theme}>
                      {feedbackTypeLabels[feedback.feedbackType]?.icon || <FaComment />}
                      {feedbackTypeLabels[feedback.feedbackType]?.label || 'Phản hồi'}
                    </FeedbackType>
                    <FeedbackDate>
                      Gửi vào: {formatDate(feedback.createdAt)}
                    </FeedbackDate>
                  </FeedbackInfo>
                  
                  <FeedbackStatus color={statusLabels[feedback.status]?.color || '#718096'}>
                    {statusLabels[feedback.status]?.icon}
                    {statusLabels[feedback.status]?.label || 'Không xác định'}
                  </FeedbackStatus>
                </FeedbackHeader>
                
                <FeedbackContent>
                  {feedback.content}
                </FeedbackContent>
                
                {feedback.questionId && (
                  <FeedbackMeta>
                    Câu hỏi: #{feedback.questionId}
                  </FeedbackMeta>
                )}
                
                <FeedbackMeta>
                  Bài thi: <strong>{feedback.testTitle || `#${feedback.testId}`}</strong>
                </FeedbackMeta>
                
                {feedback.responseContent && (
                  <FeedbackResponse theme={theme}>
                    <FeedbackResponseHeader>Phản hồi từ quản trị viên:</FeedbackResponseHeader>
                    <FeedbackResponseContent>{feedback.responseContent}</FeedbackResponseContent>
                    {feedback.respondedAt && (
                      <FeedbackResponseDate>
                        Trả lời vào: {formatDate(feedback.respondedAt)}
                      </FeedbackResponseDate>
                    )}
                  </FeedbackResponse>
                )}
              </FeedbackItem>
            ))}
          </FeedbackList>
          
          {pagination.totalPages > 1 && (
            <Pagination>
              <PaginationButton
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                whileHover={{ scale: pagination.currentPage === 1 ? 1 : 1.05 }}
                whileTap={{ scale: pagination.currentPage === 1 ? 1 : 0.95 }}
              >
                Trước
              </PaginationButton>
              
              <PaginationInfo>
                {pagination.currentPage} / {pagination.totalPages}
              </PaginationInfo>
              
              <PaginationButton
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                whileHover={{ scale: pagination.currentPage === pagination.totalPages ? 1 : 1.05 }}
                whileTap={{ scale: pagination.currentPage === pagination.totalPages ? 1 : 0.95 }}
              >
                Sau
              </PaginationButton>
            </Pagination>
          )}
        </>
      )}
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin: 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  gap: 1rem;
`;

const LoadingText = styled.p`
  font-size: 1.1rem;
  color: #718096;
`;

const ErrorContainer = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#fff5f5'};
  color: ${props => props.theme === 'dark' ? '#feb2b2' : '#c53030'};
  padding: 1.5rem;
  border-radius: 8px;
  margin: 2rem 0;
  text-align: center;
`;

const ErrorMessage = styled.p`
  font-size: 1.1rem;
  margin: 0;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  border-radius: 8px;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  gap: 1.5rem;
`;

const EmptyIcon = styled(FaComment)`
  font-size: 3rem;
  opacity: 0.5;
`;

const EmptyMessage = styled.p`
  font-size: 1.1rem;
  text-align: center;
  margin: 0;
`;

const EmptyActionButton = styled(motion.button)`
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
`;

const FeedbackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FeedbackItem = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : 'white'};
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const FeedbackHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f7fafc'};
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const FeedbackInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FeedbackType = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const FeedbackDate = styled.div`
  font-size: 0.85rem;
  color: #718096;
`;

const FeedbackStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  background-color: ${props => `${props.color}15`};
  color: ${props => props.color};
  border-radius: 999px;
`;

const FeedbackContent = styled.div`
  padding: 1.25rem;
  white-space: pre-wrap;
  line-height: 1.6;
`;

const FeedbackMeta = styled.div`
  padding: 0 1.25rem 1rem;
  font-size: 0.9rem;
  color: #718096;
`;

const FeedbackResponse = styled.div`
  margin: 0 1.25rem 1.25rem;
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f7fafc'};
  border-radius: 6px;
  border-left: 4px solid #4299e1;
`;

const FeedbackResponseHeader = styled.div`
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #4299e1;
`;

const FeedbackResponseContent = styled.div`
  white-space: pre-wrap;
  line-height: 1.6;
`;

const FeedbackResponseDate = styled.div`
  font-size: 0.85rem;
  color: #718096;
  margin-top: 0.75rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2.5rem;
  gap: 1rem;
`;

const PaginationButton = styled(motion.button)`
  background-color: ${props => props.disabled ? '#a0aec0' : '#4299e1'};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.7 : 1};
`;

const PaginationInfo = styled.div`
  font-weight: 500;
`;

export default MyFeedbacks;