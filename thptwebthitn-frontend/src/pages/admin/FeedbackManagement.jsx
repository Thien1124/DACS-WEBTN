import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaFlag, 
  FaExclamationTriangle, 
  FaQuestionCircle, 
  FaCheck, 
  FaTimes, 
  FaFilter, 
  FaSort, 
  FaClock, 
  FaUser, 
  FaCalendarAlt,
  FaComments, 
  FaReply
} from 'react-icons/fa';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAllFeedbacks, resolveFeedback } from '../../services/feedbackServices';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

// Styled components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme === 'dark' ? '#1a1a1a' : '#f5f8fa'};
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 1.5rem auto;
  padding: 1rem;
  width: 100%;
`;

const PageTitle = styled.h1`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.75rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
  }
`;

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const FilterDropdown = styled.div`
  position: relative;
  min-width: 200px;
`;

const DropdownButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#718096' : '#e2e8f0'};
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  overflow: hidden;
`;

const DropdownItem = styled.div`
  padding: 0.75rem 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  background-color: ${props => props.selected 
    ? (props.theme === 'dark' ? '#4a5568' : '#ebf8ff')
    : 'transparent'
  };
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#ebf8ff'};
  }
  
  svg {
    margin-right: 0.75rem;
    color: ${props => props.selected 
      ? (props.theme === 'dark' ? '#90cdf4' : '#3182ce')
      : (props.theme === 'dark' ? '#a0aec0' : '#718096')
    };
  }
`;

const FeedbackGrid = styled.div`
  margin-top: 1.5rem;
`;

const EmptyState = styled.div`
  padding: 3rem 1rem;
  text-align: center;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  color: ${props => props.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
  margin-bottom: 1rem;
`;

const EmptyTitle = styled.h2`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`;

const EmptyDescription = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  max-width: 500px;
  margin: 0 auto;
`;

const FeedbackCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: hidden;
  border-left: 4px solid ${props => {
    if (props.status === 'Pending') return props.theme === 'dark' ? '#f6ad55' : '#ed8936';
    if (props.status === 'Resolved') return props.theme === 'dark' ? '#68d391' : '#48bb78';
    if (props.status === 'Rejected') return props.theme === 'dark' ? '#fc8181' : '#e53e3e';
    return props.theme === 'dark' ? '#90cdf4' : '#3182ce';
  }};
`;

const FeedbackHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const FeedbackInfo = styled.div`
  display: flex;
  align-items: center;
`;

const ExamTitle = styled.h3`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1rem;
  margin: 0;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  
  background-color: ${props => {
    if (props.status === 'Pending') return props.theme === 'dark' ? '#744210' : '#fffaf0';
    if (props.status === 'Resolved') return props.theme === 'dark' ? '#22543d' : '#f0fff4';
    if (props.status === 'InProcess') return props.theme === 'dark' ? '#2a4365' : '#ebf8ff';
    if (props.status === 'Rejected') return props.theme === 'dark' ? '#822727' : '#fff5f5';
    return props.theme === 'dark' ? '#2a4365' : '#ebf8ff';
  }};
  
  color: ${props => {
    if (props.status === 'Pending') return props.theme === 'dark' ? '#fbd38d' : '#dd6b20';
    if (props.status === 'Resolved') return props.theme === 'dark' ? '#9ae6b4' : '#38a169';
    if (props.status === 'InProcess') return props.theme === 'dark' ? '#90cdf4' : '#3182ce';
    if (props.status === 'Rejected') return props.theme === 'dark' ? '#feb2b2' : '#e53e3e';
    return props.theme === 'dark' ? '#90cdf4' : '#2b6cb0';
  }};
  
  svg {
    margin-right: 0.3rem;
  }
`;

const TypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: 0.75rem;
  
  background-color: ${props => props.theme === 'dark' ? '#2a4365' : '#ebf8ff'};
  color: ${props => props.theme === 'dark' ? '#90cdf4' : '#2b6cb0'};
  
  svg {
    margin-right: 0.3rem;
  }
`;

const FeedbackBody = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const QuestionBox = styled.div`
  padding: 0.75rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f7fafc'};
  border-radius: 6px;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
`;

const QuestionLabel = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme === 'dark' ? '#718096' : '#a0aec0'};
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.4rem;
  }
`;

const QuestionContent = styled.div`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const FeedbackContent = styled.div`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  line-height: 1.5;
`;

const FeedbackMeta = styled.div`
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f7fafc'};
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.8rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  
  svg {
    margin-right: 0.4rem;
  }
`;

const FeedbackActions = styled.div`
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const ResolveButton = styled(ActionButton)`
  background-color: ${props => props.theme === 'dark' ? '#2f855a' : '#ebfffc'};
  color: ${props => props.theme === 'dark' ? '#9ae6b4' : '#38a169'};
  
  &:hover:not(:disabled) {
    background-color: ${props => props.theme === 'dark' ? '#276749' : '#c6f6d5'};
  }
`;

const RejectButton = styled(ActionButton)`
  background-color: ${props => props.theme === 'dark' ? '#9b2c2c' : '#fff5f5'};
  color: ${props => props.theme === 'dark' ? '#feb2b2' : '#e53e3e'};
  
  &:hover:not(:disabled) {
    background-color: ${props => props.theme === 'dark' ? '#822727' : '#fed7d7'};
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 6px;
  font-size: 0.9rem;
  border: none;
  background-color: ${props => props.active 
    ? (props.theme === 'dark' ? '#4a5568' : '#3182ce')
    : (props.theme === 'dark' ? '#2d3748' : '#edf2f7')
  };
  color: ${props => props.active 
    ? (props.theme === 'dark' ? '#e2e8f0' : 'white')
    : (props.theme === 'dark' ? '#a0aec0' : '#4a5568')
  };
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active 
      ? (props.theme === 'dark' ? '#4a5568' : '#2b6cb0')
      : (props.theme === 'dark' ? '#4a5568' : '#e2e8f0')
    };
  }
`;

// Modal
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  border-radius: 10px;
  max-width: 600px;
  width: 100%;
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.75rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  
  &:hover {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
`;

const ModalBody = styled.div`
  padding: 1.25rem;
  overflow-y: auto;
`;

const ModalFooter = styled.div`
  padding: 1.25rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const CancelButton = styled.button`
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#e2e8f0'};
  }
`;

const SubmitButton = styled.button`
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  background-color: ${props => props.theme === 'dark' ? '#2b6cb0' : '#3182ce'};
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#2c5282' : '#2b6cb0'};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  font-size: 0.9rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 6px;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  min-height: 120px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme === 'dark' ? '#90cdf4' : '#3182ce'};
    box-shadow: 0 0 0 1px ${props => props.theme === 'dark' ? '#90cdf4' : '#3182ce'};
  }
`;

const FeedbackResponse = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  border-radius: 6px;
  border-left: 3px solid ${props => props.theme === 'dark' ? '#90cdf4' : '#3182ce'};
`;

const ResponseHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  
  svg {
    margin-right: 0.5rem;
  }
`;

const ResponseContent = styled.div`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  line-height: 1.5;
`;

// Add this styled component if not already present (after other styled components)
const RadioOption = styled.label`
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  }
  
  input {
    margin-right: 0.5rem;
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

// Helper function to get status icon
const getStatusIcon = (status) => {
  switch (status) {
    case 'Pending': return <FaClock />;
    case 'Resolved': return <FaCheck />;
    case 'InProcess': return <FaReply />;
    case 'Rejected': return <FaTimes />;
    default: return <FaQuestionCircle />;
  }
};

// Helper function to get type icon
const getTypeIcon = (type) => {
  switch (type) {
    case 'QuestionError': return <FaExclamationTriangle />;
    case 'ContentFeedback': return <FaComments />;
    case 'TechnicalIssue': return <FaQuestionCircle />;
    default: return <FaFlag />;
  }
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: vi });
  } catch (e) {
    return dateString;
  }
};

const FeedbackManagement = () => {
  const { theme } = useSelector(state => state.ui);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // Modal state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseContent, setResponseContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolveStatus, setResolveStatus] = useState(1);
  
  // Load feedbacks
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const response = await getAllFeedbacks(currentPage, pageSize, statusFilter);
        
        if (response.success) {
          setFeedbacks(response.data || []);
          setTotalPages(response.totalPages || 1);
        } else {
          setFeedbacks([]);
          showErrorToast('Không thể tải dữ liệu phản hồi');
        }
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        showErrorToast('Đã xảy ra lỗi khi tải dữ liệu');
        setFeedbacks([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeedbacks();
  }, [currentPage, pageSize, statusFilter]);
  
  // Handle status filter
  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
    setShowFilterDropdown(false);
  };
  
  // Open resolve modal
  const handleOpenResolveModal = (feedback) => {
    setSelectedFeedback(feedback);
    setResponseContent('');
    setResolveStatus(1);
    setShowResolveModal(true);
  };
  
  // Close resolve modal
  const handleCloseResolveModal = () => {
    setShowResolveModal(false);
    setSelectedFeedback(null);
    setResponseContent('');
  };
  
  // Handle submit response
  const handleSubmitResponse = async () => {
  if (!selectedFeedback || !responseContent.trim()) return;
  
  try {
    setIsSubmitting(true);
    
    const response = await resolveFeedback(
      selectedFeedback.examId,
      selectedFeedback.id,
      responseContent,
      resolveStatus // Use the selected status
    );
    
    if (response.success) {
      showSuccessToast(response.message || 'Phản hồi đã được xử lý thành công');
      
      // Update the local state using the returned data
      setFeedbacks(prev => prev.map(item => 
        item.id === selectedFeedback.id 
          ? response.data // Use the complete response data
          : item
      ));
      
      handleCloseResolveModal();
    } else {
      showErrorToast(response.message || 'Không thể xử lý phản hồi');
    }
  } catch (error) {
    console.error('Error resolving feedback:', error);
    showErrorToast('Đã xảy ra lỗi khi xử lý phản hồi');
  } finally {
    setIsSubmitting(false);
  }
};
  
  // Render status filter options
  const statusOptions = [
    { value: null, label: 'Tất cả trạng thái', icon: <FaFilter /> },
    { value: 0, label: 'Đang chờ xử lý', icon: <FaClock /> },
    { value: 1, label: 'Đã xử lý', icon: <FaCheck /> }
  ];
  
  // Generate page buttons
  const renderPageButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    
    // Always show first page
    buttons.push(
      <PageButton
        key={1}
        theme={theme}
        active={currentPage === 1}
        onClick={() => setCurrentPage(1)}
      >
        1
      </PageButton>
    );
    
    // Calculate range of visible pages
    let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
    
    // Adjust startPage if we have fewer pages to show
    if (endPage - startPage < maxVisiblePages - 3) {
      startPage = Math.max(2, endPage - (maxVisiblePages - 3) + 1);
    }
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      buttons.push(
        <PageButton key="ellipsis1" theme={theme} disabled>
          ...
        </PageButton>
      );
    }
    
    // Add page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <PageButton
          key={i}
          theme={theme}
          active={currentPage === i}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </PageButton>
      );
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      buttons.push(
        <PageButton key="ellipsis2" theme={theme} disabled>
          ...
        </PageButton>
      );
    }
    
    // Always show last page if more than 1 page
    if (totalPages > 1) {
      buttons.push(
        <PageButton
          key={totalPages}
          theme={theme}
          active={currentPage === totalPages}
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </PageButton>
      );
    }
    
    return buttons;
  };
  
  return (
    <PageWrapper theme={theme}>
      <Header />
      <Container>
        <PageTitle theme={theme}>
          <FaFlag />
          Quản lý phản hồi
        </PageTitle>
        
        <FilterBar theme={theme}>
          <FilterDropdown>
            <DropdownButton 
              theme={theme} 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <FaFilter />
              {statusOptions.find(option => option.value === statusFilter)?.label || 'Tất cả trạng thái'}
            </DropdownButton>
            
            <AnimatePresence>
              {showFilterDropdown && (
                <DropdownMenu
                  theme={theme}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {statusOptions.map(option => (
                    <DropdownItem 
                      key={option.value === null ? 'all' : option.value}
                      theme={theme}
                      selected={statusFilter === option.value}
                      onClick={() => handleStatusChange(option.value)}
                    >
                      {option.icon}
                      {option.label}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              )}
            </AnimatePresence>
          </FilterDropdown>
        </FilterBar>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <LoadingSpinner size={40} />
          </div>
        ) : feedbacks.length === 0 ? (
          <EmptyState theme={theme}>
            <EmptyIcon theme={theme}>
              <FaFlag />
            </EmptyIcon>
            <EmptyTitle theme={theme}>Không có phản hồi nào</EmptyTitle>
            <EmptyDescription theme={theme}>
              Hiện tại không có phản hồi nào từ học sinh cần được xử lý.
            </EmptyDescription>
          </EmptyState>
        ) : (
          <FeedbackGrid>
            {feedbacks.map(feedback => (
              <FeedbackCard 
                key={feedback.id} 
                theme={theme}
                status={feedback.status}
              >
                <FeedbackHeader theme={theme}>
                  <FeedbackInfo>
                    <ExamTitle theme={theme}>
                      {feedback.examTitle}
                    </ExamTitle>
                    <TypeBadge theme={theme}>
                      {getTypeIcon(feedback.type)}
                      {feedback.type === 'QuestionError' ? 'Lỗi câu hỏi' : 
                       feedback.type === 'ContentFeedback' ? 'Góp ý nội dung' : 
                       feedback.type === 'TechnicalIssue' ? 'Lỗi kỹ thuật' : 'Khác'}
                    </TypeBadge>
                  </FeedbackInfo>
                  <StatusBadge theme={theme} status={feedback.status}>
                    {getStatusIcon(feedback.status)}
                    {feedback.status === 'Pending' ? 'Đang chờ' : 
                     feedback.status === 'Resolved' ? 'Đã xử lý' : 
                     feedback.status === 'InProcess' ? 'Đang xử lý' :
                     feedback.status === 'Rejected' ? 'Từ chối' : feedback.status}
                  </StatusBadge>
                </FeedbackHeader>
                
                <FeedbackBody theme={theme}>
                  {feedback.questionId && (
                    <QuestionBox theme={theme}>
                      <QuestionLabel theme={theme}>
                        <FaQuestionCircle />
                        Câu hỏi liên quan:
                      </QuestionLabel>
                      <QuestionContent theme={theme}>
                        {feedback.questionContent}
                      </QuestionContent>
                    </QuestionBox>
                  )}
                  <FeedbackContent>
                    {feedback.content}
                  </FeedbackContent>
                  
                  {feedback.responseContent && (
                    <FeedbackResponse theme={theme}>
                      <ResponseHeader theme={theme}>
                        <FaReply />
                        Phản hồi của quản trị viên:
                      </ResponseHeader>
                      <ResponseContent theme={theme}>
                        {feedback.responseContent}
                      </ResponseContent>
                    </FeedbackResponse>
                  )}
                </FeedbackBody>
                
                <FeedbackMeta theme={theme}>
                  <MetaItem theme={theme}>
                    <FaUser />
                    {feedback.userName}
                  </MetaItem>
                  <MetaItem theme={theme}>
                    <FaCalendarAlt />
                    Gửi {formatDate(feedback.createdAt)}
                  </MetaItem>
                  {feedback.resolvedAt && (
                    <MetaItem theme={theme}>
                      <FaCheck />
                      Xử lý {formatDate(feedback.resolvedAt)}
                    </MetaItem>
                  )}
                </FeedbackMeta>
                
                {feedback.status === 'Pending' && (
                  <FeedbackActions>
                    <ResolveButton 
                      theme={theme}
                      onClick={() => handleOpenResolveModal(feedback)}
                    >
                      <FaCheck />
                      Xử lý phản hồi
                    </ResolveButton>
                  </FeedbackActions>
                )}
              </FeedbackCard>
            ))}
          </FeedbackGrid>
        )}
        
        {/* Pagination */}
        {!loading && feedbacks.length > 0 && totalPages > 1 && (
          <Pagination>
            <PageButton
              theme={theme}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              &lt;
            </PageButton>
            
            {renderPageButtons()}
            
            <PageButton
              theme={theme}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              &gt;
            </PageButton>
          </Pagination>
        )}
        
        {/* Resolve Modal */}
        <AnimatePresence>
          {showResolveModal && selectedFeedback && (
            <ModalOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ModalContent
                theme={theme}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ModalHeader theme={theme}>
                  <ModalTitle theme={theme}>
                    <FaReply />
                    Xử lý phản hồi
                  </ModalTitle>
                  <CloseButton theme={theme} onClick={handleCloseResolveModal}>
                    <FaTimes />
                  </CloseButton>
                </ModalHeader>
                
                <ModalBody>
                  <QuestionBox theme={theme}>
                    <QuestionLabel theme={theme}>
                      <FaComments />
                      Nội dung phản hồi:
                    </QuestionLabel>
                    <QuestionContent theme={theme}>
                      {selectedFeedback.content}
                    </QuestionContent>
                  </QuestionBox>
                  
                  <div style={{ marginTop: '1rem' }}>
                    <Label theme={theme}>Phản hồi của bạn:</Label>
                    <Textarea
                      theme={theme}
                      placeholder="Nhập nội dung phản hồi..."
                      value={responseContent}
                      onChange={(e) => setResponseContent(e.target.value)}
                    />
                  </div>

                  {/* Add this new status selection */}
                  <div style={{ marginTop: '1rem' }}>
                    <Label theme={theme}>Trạng thái:</Label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <RadioOption theme={theme}>
                        <input 
                          type="radio" 
                          name="status" 
                          value="1" 
                          checked={resolveStatus === 1} 
                          onChange={() => setResolveStatus(1)}
                        />
                        <FaCheck style={{ color: theme === 'dark' ? '#9ae6b4' : '#38a169' }} />
                        Đã xử lý
                      </RadioOption>
                      <RadioOption theme={theme}>
                        <input 
                          type="radio" 
                          name="status" 
                          value="2" 
                          checked={resolveStatus === 2} 
                          onChange={() => setResolveStatus(2)}
                        />
                        <FaReply style={{ color: theme === 'dark' ? '#90cdf4' : '#3182ce' }} />
                        Đang xử lý
                      </RadioOption>
                    </div>
                  </div>
                </ModalBody>
                
                <ModalFooter theme={theme}>
                  <CancelButton theme={theme} onClick={handleCloseResolveModal} disabled={isSubmitting}>
                    Hủy
                  </CancelButton>
                  <SubmitButton 
                    disabled={!responseContent.trim() || isSubmitting}
                    onClick={handleSubmitResponse}
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size={14} color="#ffffff" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <FaCheck />
                        Gửi phản hồi
                      </>
                    )}
                  </SubmitButton>
                </ModalFooter>
              </ModalContent>
            </ModalOverlay>
          )}
        </AnimatePresence>
      </Container>
      <Footer />
    </PageWrapper>
  );
};

export default FeedbackManagement;