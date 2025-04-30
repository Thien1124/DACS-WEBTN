import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorDisplay from '../common/ErrorDisplay';
import { fetchSubjectById } from '../../redux/subjectSlice';
import { 
  FaArrowLeft, 
  FaRegFileAlt, 
  FaUserAlt, 
  FaChalkboardTeacher, 
  FaGraduationCap, 
  FaBookOpen,
  FaInfoCircle,
  FaHistory,
  FaLayerGroup,
  FaBook,
  FaSync,
  FaPlus, 
  FaTimes,
  FaPencilAlt, 
  FaTrashAlt,
  FaExclamationTriangle
} from 'react-icons/fa';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import mathImage from '../../assets/images/math.png';
import physicImage from '../../assets/images/physic.png';
import chemistryImage from '../../assets/images/chemistry.png';
import biologyImage from '../../assets/images/biology.png';
import literatureImage from '../../assets/images/literature.png';
import englishImage from '../../assets/images/english.png';
import historyImage from '../../assets/images/history.png';
import geographyImage from '../../assets/images/geography.png';
import civicImage from '../../assets/images/civic.png';
import { deleteChapter } from '../../services/chapterService';

// Styled components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme === 'dark' ? '#1a1a1a' : '#f5f8fa'};
`;

const Container = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
`;

const BreadcrumbNav = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  
  a {
    color: ${props => props.theme === 'dark' ? '#4da3ff' : '#4285f4'};
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  span {
    margin: 0 0.75rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  }
`;

const NavigationRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f5f7fa'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const HistoryButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f5f7fa'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const SubjectHeader = styled(motion.div)`
  display: flex;
  margin-bottom: 2.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SubjectImage = styled.div`
  width: 320px;
  height: 220px;
  background-image: ${props => `url(${props.image || 'https://via.placeholder.com/320x220?text=Môn+học'})`};
  background-size: cover;
  background-position: center;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6));
  }
  
  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 1.5rem;
  }
`;

const GradeBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: #4285f4;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-weight: 600;
  z-index: 2;
  box-shadow: 0 2px 10px rgba(0, 133, 244, 0.4);
`;

const SubjectInfo = styled.div`
  flex: 1;
  padding-left: 2.5rem;
  
  @media (max-width: 768px) {
    padding-left: 0;
  }
`;

const SubjectTitle = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 700;
  
  span {
    background: linear-gradient(45deg, #4285f4, #34a853);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const SubjectCode = styled.div`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
`;

const SubjectDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
`;

const SubjectStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 1.5rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const StatIcon = styled.span`
  color: ${props => props.theme === 'dark' ? '#4da3ff' : '#4285f4'};
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${props => props.theme === 'dark' ? '#1a202c' : '#ebf8ff'};
  border-radius: 50%;
`;

const StatText = styled.span`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 500;
  font-size: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin: 2.5rem 0 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  position: relative;
  padding-bottom: 0.75rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(45deg, #4285f4, #34a853);
    border-radius: 3px;
  }

  svg {
    color: #4285f4;
  }
`;

const DetailSection = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 15px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#3a3a3a' : '#edf2f7'};
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const DetailLabel = styled.div`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 1rem;
  font-weight: 500;
  width: 180px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 0.5rem;
  }
`;

const DetailValue = styled.div`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1rem;
  flex: 1;
`;

const GradeTag = styled.span`
  display: inline-block;
  padding: 0.3rem 0.8rem;
  background-color: #4285f4;
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ContentBox = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 15px;
  padding: 2rem;
  margin-top: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  line-height: 1.8;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  h3 {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
    margin-bottom: 1rem;
    font-size: 1.3rem;
  }
  
  p {
    margin-bottom: 1rem;
  }
  
  ul, ol {
    margin-left: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const NoContentMessage = styled.div`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-style: italic;
  text-align: center;
  padding: 2rem;
`;

const ChaptersSection = styled.div`
  margin-top: 2rem;
  margin-bottom: 3rem;
`;

const ChaptersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ChapterCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#fff'};
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.theme === 'dark' ? '#4299e1' : '#3182ce'};
`;

const ChapterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const ChapterTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChapterDescription = styled.p`
  margin: 0.75rem 0;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
`;

const ChapterOrder = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  border-radius: 9999px;
  height: 1.5rem;
  min-width: 1.5rem;
  padding: 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  border: 1px dashed ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const ButtonsRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2.5rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(45deg, #4285f4, #34a853);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  box-shadow: 0 2px 10px rgba(0, 123, 255, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  
  p {
    margin-top: 1rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
    font-size: 1.1rem;
  }
`;

// Add these styled components after your existing styled components

const CreateButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background-color: #3182ce;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2b6cb0;
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : 'white'};
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1.25rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  
  &:hover {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  font-weight: 500;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border-radius: 5px;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border-radius: 5px;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : 'white'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1rem;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: transparent;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  }
`;

const SaveButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  border: none;
  background-color: #4285f4;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #3367d6;
  }
  
  &:disabled {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#a0aec0'};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  margin-top: 0.5rem;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  color: #38a169;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: ${props => props.theme === 'dark' ? '#1C4532' : '#F0FFF4'};
  border-radius: 5px;
  font-weight: 500;
`;

const ChapterActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionIconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
    color: ${props => props.variant === 'danger' 
      ? '#e53e3e' 
      : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
`;

const DeleteConfirmationModal = styled(ModalContainer)`
  max-width: 400px;
`;

const ConfirmationMessage = styled.p`
  margin-bottom: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
`;

const WarningIcon = styled(FaExclamationTriangle)`
  color: #e53e3e;
  font-size: 1.5rem;
  margin-right: 0.75rem;
`;

const ConfirmationHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const DangerButton = styled(SaveButton)`
  background-color: #e53e3e;
  
  &:hover {
    background-color: #c53030;
  }
`;

const SubjectDetail = () => {
  const { subjectId } = useParams(); // Make sure parameter name matches route definition
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useSelector(state => state.ui);
  const { selectedSubject, loading, error } = useSelector(state => state.subjects);
  const user = useSelector(state => state.auth.user);
  const [directSubject, setDirectSubject] = useState(null);
  const [showCreateChapterModal, setShowCreateChapterModal] = useState(false);
  const [createChapterLoading, setCreateChapterLoading] = useState(false);
  const [chapterFormData, setChapterFormData] = useState({
    name: '',
    description: '',
    orderIndex: ''
  });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showEditChapterModal, setShowEditChapterModal] = useState(false);
  const [showDeleteChapterModal, setShowDeleteChapterModal] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [editChapterLoading, setEditChapterLoading] = useState(false);
  const [deleteChapterLoading, setDeleteChapterLoading] = useState(false);

  // Move these handler functions here, before the return statement
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setChapterFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditChapterClick = (chapter) => {
    setCurrentChapter(chapter);
    setChapterFormData({
      name: chapter.name,
      description: chapter.description || '',
      orderIndex: chapter.orderIndex || ''
    });
    setFormError('');
    setSuccessMessage('');
    setShowEditChapterModal(true);
  };

  const handleDeleteChapterClick = (chapter) => {
    setCurrentChapter(chapter);
    setFormError('');
    setShowDeleteChapterModal(true);
  };

  const handleUpdateChapter = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validation
    if (!chapterFormData.name) {
      setFormError('Tên chương không được để trống');
      return;
    }
    
    setEditChapterLoading(true);
    
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5006'}/api/Chapter/${currentChapter.id}`;
      await axios.put(
        apiUrl,
        {
          name: chapterFormData.name.trim(),
          description: chapterFormData.description.trim(),
          orderIndex: chapterFormData.orderIndex ? parseInt(chapterFormData.orderIndex) : currentChapter.orderIndex,
          subjectId: parseInt(subjectId)
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      showSuccessToast('Cập nhật chương học thành công!');
      
      // Update subject data
      dispatch(fetchSubjectById(subjectId));
      
      // Close modal
      setShowEditChapterModal(false);
      
    } catch (error) {
      console.error('Error updating chapter:', error);
      setFormError(error.response?.data?.message || 'Không thể cập nhật chương học. Vui lòng thử lại.');
      showErrorToast('Không thể cập nhật chương học. Vui lòng thử lại.');
    } finally {
      setEditChapterLoading(false);
    }
  };

  const handleDeleteChapter = async () => {
    setFormError('');
    setDeleteChapterLoading(true);
    
    try {
      // Check if currentChapter and its ID exist
      if (!currentChapter || !currentChapter.id) {
        throw new Error('Không tìm thấy thông tin chương học');
      }
      
      console.log('Deleting chapter with ID:', currentChapter.id);
      
      // Use the service function instead of direct axios call
      await deleteChapter(currentChapter.id);
      
      showSuccessToast('Xóa chương học thành công!');
      
      // Update subject data
      dispatch(fetchSubjectById(subjectId));
      
      // Close modal
      setShowDeleteChapterModal(false);
      
    } catch (error) {
      console.error('Error deleting chapter:', error);
      
      // Set error message based on the caught error
      const errorMessage = error.message || 'Không thể xóa chương học. Vui lòng thử lại.';
      setFormError(errorMessage);
      showErrorToast(errorMessage);
    } finally {
      setDeleteChapterLoading(false);
    }
  };

  useEffect(() => {
    
    dispatch(fetchSubjectById(subjectId));
    
    // Set up fallback timer in case Redux fails
    const fallbackTimer = setTimeout(() => {
      if (loading || (!selectedSubject && !error)) {
        
        fetchSubjectDirectly();
      }
    }, 2000);
    
    // Cleanup timer
    return () => clearTimeout(fallbackTimer);
  }, [dispatch, subjectId]);
  
  const fetchSubjectDirectly = async () => {
    try {
      
      const token = localStorage.getItem('token');
      
      // Try multiple possible API endpoints
      const endpoints = [
        `${process.env.REACT_APP_API_URL || 'http://localhost:5006'}/api/Subject/${subjectId}`
      ];
      
      let response = null;
      
      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          response = await fetch(endpoint, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          
          if (response.ok) {
            break;
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err.message);
        }
      }
      
      if (!response || !response.ok) {
        throw new Error("Không thể kết nối đến API môn học");
      }
      
      const data = await response.json();
      
      setDirectSubject(data);
      
    } catch (err) {
      
      showErrorToast("Không thể tải thông tin môn học. Vui lòng thử lại sau.");
    }
  };

  
  // Helper function for subject image
  const getSubjectImage = () => {
    if (!selectedSubject && !directSubject) return 'https://via.placeholder.com/320x220?text=Môn+học';
    
    const subject = selectedSubject || directSubject;
    
    // Nếu có URL hình ảnh riêng, ưu tiên dùng
    if (subject.imageUrl) return subject.imageUrl;
    
    // Map các hình ảnh theo tên môn học
    const subjectBaseName = subject.name.split(' ')[0]; // Lấy tên cơ bản (ví dụ: "Toán" từ "Toán 10")
    const defaultImages = {
      'Toán': mathImage,
      'Vật': physicImage,
      'Hóa': chemistryImage,
      'Sinh': biologyImage,
      'Ngữ': literatureImage,
      'Tiếng': englishImage,
      'Lịch': historyImage,
      'Địa': geographyImage,
      'GDKT': civicImage,
    };
    
    // Tìm hình ảnh phù hợp
    for (const [key, image] of Object.entries(defaultImages)) {
      if (subject.name.includes(key)) {
        return image;
      }
    }
    
    // Fallback nếu không tìm thấy
    return `https://via.placeholder.com/320x220?text=${encodeURIComponent(subject.name)}`;
  };
  
  // Thêm hàm này trong component SubjectDetail
  const getDetailedSubjectContent = (subject) => {
    if (!subject) return null;
    
    // Lookup table chứa nội dung chi tiết cho từng môn học theo mã
    const contentByCode = {
      // TOÁN
      'MATH10': `
        <h3>Giới thiệu môn Toán lớp 10</h3>
        <p>Môn Toán lớp 10 cung cấp kiến thức cơ bản về đại số và hình học, tạo nền tảng vững chắc cho các khối kiến thức Toán học nâng cao ở các lớp tiếp theo.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Đại số:</strong> Mệnh đề, tập hợp, hàm số, phương trình bậc nhất, bậc hai, hệ phương trình, bất phương trình</li>
          <li><strong>Hình học:</strong> Véc-tơ, quan hệ song song, quan hệ vuông góc, phép dời hình</li>
          <li><strong>Lượng giác:</strong> Các hệ thức lượng giác cơ bản, công thức lượng giác</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Hình thành tư duy logic, khả năng tính toán và giải quyết vấn đề</li>
          <li>Phát triển khả năng tư duy trừu tượng, hình học không gian</li>
          <li>Xây dựng nền tảng vững chắc cho việc học tập môn Toán ở lớp 11 và 12</li>
        </ul>
      `,
      'MATH11': `
        <h3>Giới thiệu môn Toán lớp 11</h3>
        <p>Môn Toán lớp 11 mở rộng kiến thức về giải tích, đại số và hình học không gian, giúp học sinh phát triển tư duy logic và kỹ năng giải quyết vấn đề phức tạp.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Đại số và giải tích:</strong> Hàm số lượng giác, giới hạn, đạo hàm và tích phân</li>
          <li><strong>Tổ hợp - Xác suất:</strong> Quy tắc đếm, hoán vị, chỉnh hợp, tổ hợp, xác suất cơ bản</li>
          <li><strong>Hình học không gian:</strong> Phương pháp tọa độ trong không gian, thể tích khối đa diện</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Phát triển khả năng tư duy trừu tượng và không gian</li>
          <li>Nắm vững các công cụ giải tích cơ bản để giải quyết bài toán thực tế</li>
          <li>Chuẩn bị kiến thức nền tảng cho chương trình Toán lớp 12 và kỳ thi THPT Quốc gia</li>
        </ul>
      `,
      'MATH12': `
        <h3>Giới thiệu môn Toán lớp 12</h3>
        <p>Môn Toán lớp 12 hoàn thiện kiến thức toán học phổ thông, tập trung vào giải tích và số học cao cấp, chuẩn bị cho kỳ thi THPT Quốc gia và đại học.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Giải tích:</strong> Nguyên hàm, tích phân, ứng dụng tích phân, số phức</li>
          <li><strong>Hình học không gian:</strong> Khối đa diện, mặt tròn xoay, phương pháp tọa độ trong không gian</li>
          <li><strong>Thống kê và xác suất:</strong> Biến ngẫu nhiên, phân phối xác suất, đại lượng thống kê</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Nâng cao khả năng tư duy trừu tượng và khả năng phân tích</li>
          <li>Vận dụng kiến thức giải tích vào giải quyết các vấn đề thực tiễn</li>
          <li>Chuẩn bị tốt nhất cho kỳ thi THPT Quốc gia và tuyển sinh đại học</li>
        </ul>
      `,
      
      // VẬT LÝ
      'PHY10': `
        <h3>Giới thiệu môn Vật Lý lớp 10</h3>
        <p>Vật Lý lớp 10 cung cấp các kiến thức cơ bản về cơ học và nhiệt học, giúp học sinh hiểu được các quy luật vận động của vật chất.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Động học chất điểm:</strong> Chuyển động thẳng, chuyển động tròn, rơi tự do</li>
          <li><strong>Động lực học:</strong> Các định luật Newton, lực ma sát, lực hấp dẫn</li>
          <li><strong>Cơ năng:</strong> Công, công suất, năng lượng, các định luật bảo toàn</li>
          <li><strong>Chất khí:</strong> Thuyết động học phân tử, các định luật về chất khí</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Hiểu và vận dụng các định luật vật lý cơ bản</li>
          <li>Phát triển khả năng quan sát, thực nghiệm và suy luận logic</li>
          <li>Hình thành tư duy khoa học và khả năng ứng dụng vật lý vào thực tế</li>
        </ul>
      `,
      'PHY11': `
        <h3>Giới thiệu môn Vật Lý lớp 11</h3>
        <p>Vật Lý lớp 11 tập trung vào điện học, từ học và các hiện tượng dao động, sóng, giúp học sinh hiểu sâu hơn về các tương tác điện từ.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Điện tích và điện trường:</strong> Tương tác điện, định luật Coulomb, điện trường</li>
          <li><strong>Dòng điện:</strong> Định luật Ohm, mạch điện, công và công suất điện</li>
          <li><strong>Từ trường:</strong> Từ trường của dòng điện, lực từ, cảm ứng điện từ</li>
          <li><strong>Dao động và sóng:</strong> Dao động điều hòa, sóng cơ, sóng âm</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Hiểu và vận dụng các quy luật về điện, từ</li>
          <li>Phát triển khả năng phân tích và giải quyết các vấn đề về điện từ học</li>
          <li>Nắm vững kiến thức cơ bản về dao động và sóng</li>
        </ul>
      `,
      'PHY12': `
        <h3>Giới thiệu môn Vật Lý lớp 12</h3>
        <p>Vật Lý lớp 12 hoàn thiện kiến thức về vật lý hiện đại, tập trung vào quang học, vật lý hạt nhân và vật lý lượng tử, chuẩn bị cho kỳ thi THPT Quốc gia.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Sóng ánh sáng:</strong> Tán sắc ánh sáng, giao thoa, nhiễu xạ, quang học lượng tử</li>
          <li><strong>Lượng tử ánh sáng:</strong> Hiệu ứng quang điện, lưỡng tính sóng-hạt</li>
          <li><strong>Vật lý hạt nhân:</strong> Cấu tạo hạt nhân, phóng xạ, phản ứng hạt nhân</li>
          <li><strong>Vật lý thiên văn:</strong> Các bài toán về vận động của các thiên thể</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Hiểu được bản chất của các hiện tượng vật lý hiện đại</li>
          <li>Vận dụng kiến thức vào giải quyết các vấn đề thực tiễn</li>
          <li>Chuẩn bị tốt cho kỳ thi THPT Quốc gia và thi đại học</li>
        </ul>
      `,
      
      // HÓA HỌC
      'CHEM10': `
        <h3>Giới thiệu môn Hóa Học lớp 10</h3>
        <p>Hóa Học lớp 10 cung cấp các kiến thức nền tảng về cấu tạo nguyên tử, bảng tuần hoàn và liên kết hóa học, tạo cơ sở cho việc học hóa học chuyên sâu ở các lớp sau.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Cấu tạo nguyên tử:</strong> Hạt nhân, electron, nguyên tố hóa học</li>
          <li><strong>Bảng tuần hoàn:</strong> Cấu trúc bảng, quy luật biến đổi tính chất</li>
          <li><strong>Liên kết hóa học:</strong> Liên kết ion, liên kết cộng hóa trị</li>
          <li><strong>Phản ứng oxi hóa - khử:</strong> Quy luật, cân bằng phương trình</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Hiểu được cấu trúc nguyên tử và mối liên hệ với tính chất hóa học</li>
          <li>Nắm vững các quy luật trong bảng tuần hoàn</li>
          <li>Phát triển kỹ năng thực hành thí nghiệm và quan sát hiện tượng</li>
        </ul>
      `,
      'CHEM11': `
        <h3>Giới thiệu môn Hóa Học lớp 11</h3>
        <p>Hóa Học lớp 11 tập trung vào hóa học vô cơ, nghiên cứu các nhóm nguyên tố trong bảng tuần hoàn và các hợp chất vô cơ quan trọng.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Sự điện ly:</strong> Chất điện ly, độ điện ly, cân bằng ion</li>
          <li><strong>Nhóm halogen:</strong> Tính chất, ứng dụng và hợp chất</li>
          <li><strong>Oxi - Lưu huỳnh:</strong> Tính chất, ứng dụng và hợp chất</li>
          <li><strong>Nitơ - Photpho:</strong> Tính chất, ứng dụng và hợp chất</li>
          <li><strong>Kim loại:</strong> Tính chất chung, phản ứng điều chế</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Hiểu được tính chất hóa học đặc trưng của các nguyên tố</li>
          <li>Vận dụng kiến thức vào giải thích các hiện tượng trong tự nhiên</li>
          <li>Phát triển kỹ năng thực hành và an toàn phòng thí nghiệm</li>
        </ul>
      `,
      'CHEM12': `
        <h3>Giới thiệu môn Hóa Học lớp 12</h3>
        <p>Hóa Học lớp 12 tập trung vào hóa học hữu cơ, nghiên cứu về cấu trúc, tính chất và phản ứng của các hợp chất hữu cơ phổ biến.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Đại cương hữu cơ:</strong> Liên kết, đồng phân, hiệu ứng electron</li>
          <li><strong>Hiđrocacbon:</strong> Ankan, anken, ankadien, ankin, aren</li>
          <li><strong>Dẫn xuất hiđrocacbon:</strong> Rượu, andehit, axit cacboxylic, amin, amino axit</li>
          <li><strong>Polime và vật liệu:</strong> Phân loại, tổng hợp và ứng dụng</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Hiểu được đặc điểm cấu trúc và tính chất của hợp chất hữu cơ</li>
          <li>Vận dụng kiến thức hóa hữu cơ vào đời sống và sản xuất</li>
          <li>Chuẩn bị tốt cho kỳ thi THPT Quốc gia và thi đại học</li>
        </ul>
      `,
      
      // SINH HỌC
      'BIO10': `
        <h3>Giới thiệu môn Sinh Học lớp 10</h3>
        <p>Sinh Học lớp 10 cung cấp kiến thức về thế giới sống ở cấp độ tế bào và phân tử, tạo nền tảng cho việc học sinh học ở các lớp tiếp theo.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Cấu trúc tế bào:</strong> Tế bào nhân sơ, tế bào nhân thực</li>
          <li><strong>Chuyển hóa vật chất:</strong> Enzim, quang hợp, hô hấp tế bào</li>
          <li><strong>Phân bào:</strong> Nguyên phân, giảm phân và ý nghĩa</li>
          <li><strong>Di truyền phân tử:</strong> ADN, ARN, mã di truyền</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Hiểu được cấu trúc và chức năng của tế bào sống</li>
          <li>Nắm vững các quá trình chuyển hóa vật chất cơ bản</li>
          <li>Phát triển kỹ năng quan sát, thí nghiệm và phân tích</li>
        </ul>
      `,
      'BIO11': `
        <h3>Giới thiệu môn Sinh Học lớp 11</h3>
        <p>Sinh Học lớp 11 tập trung vào di truyền học và tiến hóa, giúp học sinh hiểu được các quy luật di truyền và quá trình tiến hóa của sinh giới.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Di truyền học:</strong> Định luật Mendel, di truyền liên kết, đột biến gen</li>
          <li><strong>Di truyền học quần thể:</strong> Cân bằng Hardy-Weinberg, các yếu tố tiến hóa</li>
          <li><strong>Tiến hóa:</strong> Chọn lọc tự nhiên, thích nghi, hình thành loài mới</li>
          <li><strong>Sinh thái học:</strong> Quần thể, quần xã, hệ sinh thái</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Hiểu và vận dụng các quy luật di truyền vào thực tiễn</li>
          <li>Phát triển tư duy khoa học về tiến hóa và đa dạng sinh học</li>
          <li>Nâng cao ý thức về bảo vệ môi trường và đa dạng sinh học</li>
        </ul>
      `,
      'BIO12': `
        <h3>Giới thiệu môn Sinh Học lớp 12</h3>
        <p>Sinh Học lớp 12 hoàn thiện kiến thức về sinh học phổ thông, tập trung vào công nghệ sinh học và ứng dụng, chuẩn bị cho kỳ thi THPT Quốc gia.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Di truyền ở người:</strong> Các bệnh di truyền, tư vấn di truyền</li>
          <li><strong>Công nghệ gen:</strong> Tách chiết ADN, enzim cắt giới hạn, ADN tái tổ hợp</li>
          <li><strong>Công nghệ tế bào:</strong> Nuôi cấy mô, nhân bản vô tính</li>
          <li><strong>Sinh học ứng dụng:</strong> Ứng dụng trong y học, nông nghiệp và môi trường</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Hiểu được các thành tựu hiện đại của công nghệ sinh học</li>
          <li>Vận dụng kiến thức sinh học vào đời sống và sản xuất</li>
          <li>Chuẩn bị tốt cho kỳ thi THPT Quốc gia và thi đại học</li>
        </ul>
      `,
      
      // NGỮ VĂN
      'LIT10': `
        <h3>Giới thiệu môn Ngữ Văn lớp 10</h3>
        <p>Ngữ Văn lớp 10 trang bị kiến thức về văn học dân gian và văn học trung đại Việt Nam, giúp học sinh hiểu sâu hơn về văn hóa dân tộc.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Văn học dân gian:</strong> Ca dao, tục ngữ, truyện cổ dân gian</li>
          <li><strong>Văn học trung đại:</strong> Thơ, văn xuôi từ thế kỷ X đến XVIII</li>
          <li><strong>Văn học Việt Nam đầu thế kỷ XX:</strong> Các tác phẩm tiêu biểu</li>
          <li><strong>Văn bản nghị luận:</strong> Các kỹ năng viết bài nghị luận xã hội</li>
          <li><strong>Tiếng Việt:</strong> Từ vựng, ngữ pháp tiếng Việt</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Hiểu được giá trị nhân văn trong kho tàng văn học dân tộc</li>
          <li>Phát triển kỹ năng đọc hiểu và phân tích văn bản</li>
          <li>Rèn luyện kỹ năng viết văn nghị luận và sáng tác</li>
        </ul>
      `,
      'LIT11': `
        <h3>Giới thiệu môn Ngữ Văn lớp 11</h3>
        <p>Ngữ Văn lớp 11 tập trung vào văn học Việt Nam từ đầu thế kỷ XX đến Cách mạng tháng Tám và văn học nước ngoài, giúp học sinh mở rộng hiểu biết văn hóa.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Văn học Việt Nam 1900-1945:</strong> Thơ mới, văn xuôi hiện thực</li>
          <li><strong>Văn học kháng chiến:</strong> Các tác phẩm về cuộc kháng chiến chống Pháp</li>
          <li><strong>Văn học nước ngoài:</strong> Tác phẩm tiêu biểu của văn học thế giới</li>
          <li><strong>Làm văn:</strong> Nghị luận về một đoạn thơ/bài thơ, nghị luận xã hội</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Hiểu được giá trị nhân văn và thẩm mỹ của văn học Việt Nam thời kỳ 1900-1945</li>
          <li>Nâng cao khả năng cảm thụ văn học và tư duy phê phán</li>
          <li>Phát triển kỹ năng viết văn nghị luận về văn học và xã hội</li>
        </ul>
      `,
      'LIT12': `
        <h3>Giới thiệu môn Ngữ Văn lớp 12</h3>
        <p>Ngữ Văn lớp 12 hoàn thiện kiến thức về văn học Việt Nam hiện đại và văn học nước ngoài, tập trung vào kỹ năng phân tích, đánh giá tác phẩm và chuẩn bị cho kỳ thi THPT Quốc gia.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Văn học Việt Nam 1945-1975:</strong> Văn học kháng chiến và xây dựng CNXH</li>
          <li><strong>Văn học Việt Nam từ 1975 đến nay:</strong> Các tác phẩm tiêu biểu</li>
          <li><strong>Văn học nước ngoài hiện đại:</strong> Các tác phẩm tiêu biểu</li>
          <li><strong>Làm văn:</strong> Nghị luận về một tác phẩm, tác giả văn học</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Hiểu được đặc trưng của văn học Việt Nam giai đoạn 1945 đến nay</li>
          <li>Phát triển khả năng cảm thụ văn học và tư duy phản biện</li>
          <li>Chuẩn bị tốt cho kỳ thi THPT Quốc gia và thi đại học</li>
        </ul>
      `,
      
      // TIẾNG ANH
      'ENG10': `
        <h3>Giới thiệu môn Tiếng Anh lớp 10</h3>
        <p>Tiếng Anh lớp 10 cung cấp kiến thức cơ bản về ngữ âm, từ vựng và ngữ pháp tiếng Anh, giúp học sinh phát triển bốn kỹ năng ngôn ngữ ở trình độ sơ-trung cấp.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Ngữ âm:</strong> Phát âm, trọng âm, ngữ điệu</li>
          <li><strong>Từ vựng:</strong> Chủ đề gia đình, trường học, môi trường, văn hóa</li>
          <li><strong>Ngữ pháp:</strong> Thì hiện tại, quá khứ, tương lai; cấu trúc câu cơ bản</li>
          <li><strong>Bốn kỹ năng:</strong> Nghe, nói, đọc, viết ở trình độ sơ-trung cấp</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Phát triển bốn kỹ năng ngôn ngữ ở trình độ A2-B1</li>
          <li>Xây dựng vốn từ vựng về các chủ đề quen thuộc</li>
          <li>Rèn luyện khả năng giao tiếp tiếng Anh trong các tình huống thường ngày</li>
        </ul>
      `,
      'ENG11': `
        <h3>Giới thiệu môn Tiếng Anh lớp 11</h3>
        <p>Tiếng Anh lớp 11 mở rộng vốn từ vựng, cấu trúc ngữ pháp và kỹ năng giao tiếp, giúp học sinh tiến tới trình độ trung cấp.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Từ vựng:</strong> Giáo dục, công nghệ, môi trường, xã hội</li>
          <li><strong>Ngữ pháp:</strong> Mệnh đề quan hệ, câu điều kiện, thể bị động</li>
          <li><strong>Kỹ năng nghe:</strong> Hiểu thông tin chi tiết, ý chính trong bài nghe</li>
          <li><strong>Kỹ năng nói:</strong> Thảo luận, trình bày quan điểm, mô tả</li>
          <li><strong>Kỹ năng đọc:</strong> Đọc hiểu nội dung chi tiết, suy luận</li>
          <li><strong>Kỹ năng viết:</strong> Viết đoạn văn, bài luận ngắn</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Tiến tới trình độ B1 theo khung tham chiếu châu Âu</li>
          <li>Phát triển khả năng sử dụng ngôn ngữ trong các tình huống đa dạng</li>
          <li>Củng cố ngữ pháp và mở rộng vốn từ vựng học thuật</li>
        </ul>
      `,
      'ENG12': `
        <h3>Giới thiệu môn Tiếng Anh lớp 12</h3>
        <p>Tiếng Anh lớp 12 hoàn thiện kiến thức ngữ pháp và từ vựng ở trình độ trung cấp, chuẩn bị cho kỳ thi THPT Quốc gia và học tiếp lên bậc đại học.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Từ vựng:</strong> Giáo dục đại học, nghề nghiệp, toàn cầu hóa, khoa học công nghệ</li>
          <li><strong>Ngữ pháp:</strong> Hợp nhất các cấu trúc ngữ pháp phức tạp, thành ngữ</li>
          <li><strong>Kỹ năng nghe:</strong> Nghe hiểu bài giảng, thảo luận học thuật</li>
          <li><strong>Kỹ năng nói:</strong> Thuyết trình, tranh luận, phỏng vấn</li>
          <li><strong>Kỹ năng đọc:</strong> Đọc hiểu văn bản phức tạp, suy luận</li>
          <li><strong>Kỹ năng viết:</strong> Viết bài luận, báo cáo, thư trang trọng</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Đạt trình độ B1-B2 theo khung tham chiếu châu Âu</li>
          <li>Phát triển năng lực ngôn ngữ để đáp ứng yêu cầu của kỳ thi THPT Quốc gia</li>
          <li>Chuẩn bị kỹ năng tiếng Anh học thuật cho bậc học đại học</li>
        </ul>
      `,
      
      // LỊCH SỬ
      'HIST10': `
        <h3>Giới thiệu môn Lịch Sử lớp 10</h3>
        <p>Lịch Sử lớp 10 cung cấp kiến thức về lịch sử thế giới và Việt Nam từ thời kỳ nguyên thủy đến thế kỷ XIX, giúp học sinh hiểu được quá trình phát triển của nhân loại và dân tộc.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Thời kỳ nguyên thủy và cổ đại:</strong> Xã hội nguyên thủy, các nền văn minh cổ đại</li>
          <li><strong>Thời kỳ trung đại:</strong> Phong kiến Châu Âu, Châu Á và Việt Nam</li>
          <li><strong>Cận đại:</strong> Cách mạng tư sản, chủ nghĩa tư bản, phong trào giải phóng dân tộc</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Hiểu được đặc điểm của các thời kỳ lịch sử và quy luật phát triển</li>
          <li>Phát triển tư duy lịch sử và khả năng phân tích sự kiện</li>
          <li>Trân trọng những giá trị văn hóa, lịch sử của dân tộc và nhân loại</li>
        </ul>
      `,
      'HIST11': `
        <h3>Giới thiệu môn Lịch Sử lớp 11</h3>
        <p>Lịch Sử lớp 11 tập trung vào lịch sử thế giới và Việt Nam từ đầu thế kỷ XX đến năm 1945, nghiên cứu về hai cuộc Chiến tranh thế giới và các phong trào cách mạng.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Thế giới đầu thế kỷ XX:</strong> Chủ nghĩa đế quốc, mâu thuẫn quốc tế</li>
          <li><strong>Chiến tranh thế giới thứ nhất:</strong> Nguyên nhân, diễn biến, kết quả</li>
          <li><strong>Cách mạng Tháng Mười Nga:</strong> Nguyên nhân, ý nghĩa lịch sử</li>
          <li><strong>Việt Nam 1919-1930:</strong> Phong trào dân tộc dân chủ, Đảng Cộng sản Việt Nam</li>
          <li><strong>Chiến tranh thế giới thứ hai:</strong> Nguyên nhân, diễn biến, kết quả</li>
          <li><strong>Cách mạng tháng Tám 1945:</strong> Bối cảnh, diễn biến, ý nghĩa</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Hiểu được bối cảnh và diễn biến của các sự kiện lịch sử trọng đại</li>
          <li>Phát triển khả năng phân tích nguyên nhân, hệ quả của các sự kiện lịch sử</li>
          <li>Nâng cao ý thức về độc lập dân tộc, hòa bình và tiến bộ xã hội</li>
        </ul>
      `,
      'HIST12': `
        <h3>Giới thiệu môn Lịch Sử lớp 12</h3>
        <p>Lịch Sử lớp 12 hoàn thiện kiến thức về lịch sử thế giới và Việt Nam từ năm 1945 đến nay, tập trung vào cuộc kháng chiến của dân tộc và tình hình thế giới đương đại.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Thế giới sau 1945:</strong> Trật tự hai cực, Chiến tranh lạnh</li>
          <li><strong>Kháng chiến chống Pháp (1945-1954):</strong> Diễn biến, Điện Biên Phủ</li>
          <li><strong>Việt Nam 1954-1975:</strong> Kháng chiến chống Mỹ, thống nhất đất nước</li>
          <li><strong>Việt Nam từ 1975 đến nay:</strong> Xây dựng và đổi mới đất nước</li>
          <li><strong>Thế giới đương đại:</strong> Xu thế toàn cầu hóa, các vấn đề toàn cầu</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Hiểu được diễn biến lịch sử thế giới và Việt Nam đương đại</li>
          <li>Phân tích được các vấn đề cơ bản của thế giới và Việt Nam hiện nay</li>
          <li>Chuẩn bị tốt cho kỳ thi THPT Quốc gia và thi đại học</li>
        </ul>
      `,
      
      // ĐỊA LÝ
      'GEO10': `
        <h3>Giới thiệu môn Địa Lý lớp 10</h3>
        <p>Địa Lý lớp 10 cung cấp kiến thức đại cương về các thành phần tự nhiên của Trái Đất và địa lý kinh tế - xã hội thế giới.</p>
        
        <h4>Nội dung chương trình</h4>
        <ul>
          <li><strong>Địa lý tự nhiên:</strong> Vũ trụ, Trái Đất, thạch quyển, khí quyển, thủy quyển</li>
          <li><strong>Địa lý dân cư:</strong> Sự phân bố dân cư, đô thị hóa, di cư</li>
          <li><strong>Pháp luật lao động:</strong> Hợp đồng lao động, quyền và nghĩa vụ</li>
          <li><strong>Kinh tế Việt Nam:</strong> Cơ cấu, định hướng phát triển</li>
          <li><strong>Toàn cầu hóa kinh tế:</strong> Hội nhập kinh tế quốc tế, lợi ích và thách thức</li>
          <li><strong>Công dân với khởi nghiệp:</strong> Khởi nghiệp, quản lý tài chính cá nhân</li>
        </ul>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Hiểu được các quy định pháp luật liên quan trực tiếp đến cuộc sống</li>
          <li>Nắm vững cơ cấu và định hướng phát triển của nền kinh tế Việt Nam</li>
          <li>Phát triển kỹ năng khởi nghiệp và quản lý tài chính cá nhân</li>
        </ul>
      `
    };
    
    // Lấy nội dung theo code
    const content = contentByCode[subject.code];
    
    // Nếu không tìm thấy theo code, tạo nội dung mặc định dựa trên thông tin môn học
    if (!content) {
      return `
        <h3>Giới thiệu môn ${subject.name}</h3>
        <p>${subject.description || `Môn học ${subject.name} thuộc chương trình giáo dục phổ thông, cung cấp kiến thức cơ bản và nâng cao dành cho học sinh lớp ${subject.grade || '10-12'}.`}</p>
        
        <h4>Nội dung chương trình</h4>
        <p>Chương trình môn học được thiết kế theo chuẩn kiến thức, kỹ năng của Bộ Giáo dục và Đào tạo, bao gồm các phần kiến thức cơ bản và nâng cao giúp học sinh chuẩn bị tốt cho kỳ thi THPT Quốc gia.</p>
        
        <h4>Mục tiêu học tập</h4>
        <ul>
          <li>Cung cấp kiến thức nền tảng về ${subject.name}</li>
          <li>Phát triển kỹ năng tư duy phản biện và giải quyết vấn đề</li>
          <li>Chuẩn bị cho học sinh tham gia kỳ thi THPT Quốc gia</li>
        </ul>
      `;
    }
    
    return content;
  };

  
  
  const currentTime = new Date().toLocaleString('vi-VN');
  const currentUser = user?.username || "Khách";
  
  if (loading) {
    return (
      <PageWrapper theme={theme}>
        <Header />
        <Container>
          <LoadingContainer theme={theme}>
            <LoadingSpinner size={50} />
            <p>Đang tải thông tin môn học...</p>
          </LoadingContainer>
        </Container>
        <Footer />
      </PageWrapper>
    );
  }
  
  if (error) {
    return (
      <PageWrapper theme={theme}>
        <Header />
        <Container>
          <ErrorDisplay message={error} />
          <BackButton to="/subjects" theme={theme}>
            <FaArrowLeft /> Quay lại danh sách môn học
          </BackButton>
        </Container>
        <Footer />
      </PageWrapper>
    );
  }
  
  const subjectContent = (selectedSubject || directSubject)?.content || getDetailedSubjectContent(selectedSubject || directSubject);
  
  return (
    <PageWrapper theme={theme}>
      <Header />
      <Container
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <BreadcrumbNav theme={theme}>
          <Link to="/subjects">Các môn học</Link>
          <span>›</span>
          <span>{(selectedSubject || directSubject)?.name || 'Chi tiết môn học'}</span>
        </BreadcrumbNav>
        
        <>
          <NavigationRow>
            <BackButton to="/subjects" theme={theme}>
              <FaArrowLeft /> Quay lại danh sách môn học
            </BackButton>
            {user && 
              <HistoryButton onClick={() => navigate('/exam-history')} theme={theme}>
                <FaHistory /> Xem lịch sử bài thi
              </HistoryButton>
            }
          </NavigationRow>

          <SubjectHeader
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <SubjectImage image={getSubjectImage()}>
              {(selectedSubject || directSubject)?.gradeLevel ? (
                <GradeBadge>Lớp {(selectedSubject || directSubject)?.gradeLevel}</GradeBadge>
              ) : (selectedSubject || directSubject)?.grade ? (
                <GradeBadge>Lớp {(selectedSubject || directSubject)?.grade}</GradeBadge>
              ) : null}
            </SubjectImage>
            
            <SubjectInfo>
              <SubjectTitle theme={theme}>
                <span>{(selectedSubject || directSubject)?.name || 'Đang tải thông tin môn học...'}</span>
              </SubjectTitle>
              
              {(selectedSubject || directSubject)?.code && (
                <SubjectCode theme={theme}>
                  Mã môn: {(selectedSubject || directSubject).code}
                </SubjectCode>
              )}
              
              <SubjectDescription theme={theme}>
                {(selectedSubject || directSubject)?.description || 'Đang tải mô tả môn học...'}
              </SubjectDescription>
              
              <SubjectStats>
                <StatItem>
                  <StatIcon theme={theme}>
                    <FaGraduationCap />
                  </StatIcon>
                  <StatText theme={theme}>
                    {(selectedSubject || directSubject)?.gradeLevel ? 
                      `Dành cho Lớp ${(selectedSubject || directSubject).gradeLevel}` : 
                      (selectedSubject || directSubject)?.grade ? 
                        `Dành cho Lớp ${(selectedSubject || directSubject).grade}` : 
                        'Dành cho các lớp 10-12'
                    }
                  </StatText>
                </StatItem>
                
                <StatItem>
                  <StatIcon theme={theme}>
                    <FaRegFileAlt />
                  </StatIcon>
                  <StatText theme={theme}>{(selectedSubject || directSubject)?.examsCount || 0} đề thi</StatText>
                </StatItem>
              </SubjectStats>
            </SubjectInfo>
          </SubjectHeader>
          
          <SectionTitle theme={theme}>
            <FaInfoCircle />
            Thông tin môn học
          </SectionTitle>
          
          <DetailSection theme={theme}>
            <DetailItem theme={theme}>
              <DetailLabel theme={theme}>Khối lớp</DetailLabel>
              <DetailValue theme={theme}>
                {(selectedSubject || directSubject)?.gradeLevel ? (
                  <GradeTag>Dành cho Lớp {(selectedSubject || directSubject).gradeLevel}</GradeTag>
                ) : (selectedSubject || directSubject)?.grade ? (
                  <GradeTag>Dành cho Lớp {(selectedSubject || directSubject).grade}</GradeTag>
                ) : (
                  <GradeTag>Dành cho các lớp 10-12</GradeTag>
                )}
              </DetailValue>
            </DetailItem>
            
            <DetailItem theme={theme}>
              <DetailLabel theme={theme}>Mã môn học</DetailLabel>
              <DetailValue theme={theme}>{(selectedSubject || directSubject)?.code || 'Đang tải...'}</DetailValue>
            </DetailItem>
            
            <DetailItem theme={theme}>
              <DetailLabel theme={theme}>Trạng thái</DetailLabel>
              <DetailValue theme={theme}>
                <span style={{ 
                  color: (selectedSubject || directSubject)?.isActive ? '#34a853' : '#ea4335',
                  fontWeight: 500
                }}>
                  {(selectedSubject || directSubject)?.isActive !== undefined ? 
                    ((selectedSubject || directSubject).isActive ? '● Đang hoạt động' : '● Đã khóa') : 
                    'Đang tải...'}
                </span>
              </DetailValue>
            </DetailItem>
            
            <DetailItem theme={theme}>
              <DetailLabel theme={theme}>Ngày cập nhật</DetailLabel>
              <DetailValue theme={theme}>
                {(selectedSubject || directSubject)?.updatedAt ? 
                  new Date((selectedSubject || directSubject).updatedAt).toLocaleDateString('vi-VN') : 
                  'Đang tải...'
                }
              </DetailValue>
            </DetailItem>
          </DetailSection>
          
          <SectionTitle theme={theme}>
            <FaBookOpen />
            Nội dung chương trình học
          </SectionTitle>
          
          <ContentBox theme={theme}>
            {subjectContent ? (
              <div dangerouslySetInnerHTML={{ __html: subjectContent }} />
            ) : (
              <div style={{textAlign: 'center', padding: '20px'}}>
                <LoadingSpinner size={30} />
                <p style={{marginTop: '10px'}}>Đang tải nội dung chương trình học...</p>
              </div>
            )}
          </ContentBox>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <SectionTitle theme={theme}>
              <FaLayerGroup /> Chương Học
            </SectionTitle>
            
            {user && (user.role === 'Admin' || user.role === 'Teacher') && (
              <CreateButton to={`/admin/subjects/${subjectId}/chapters/create`}>
                <FaPlus /> Tạo chương mới
              </CreateButton>
            )}
          </div>
          
          <ChaptersList>
            {(selectedSubject || directSubject)?.chapters && (selectedSubject || directSubject).chapters.length > 0 ? (
              (selectedSubject || directSubject).chapters
                .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                .map(chapter => (
                  <ChapterCard key={chapter.id} theme={theme}>
                    <ChapterHeader>
                      <ChapterTitle theme={theme}>
                        <FaBook />
                        {chapter.name}
                        <ChapterOrder theme={theme}>
                          {chapter.orderIndex || '?'}
                        </ChapterOrder>
                      </ChapterTitle>
                      
                      {user && (user.role === 'Admin' || user.role === 'Teacher') && (
                        <ChapterActions>
                          <ActionIconButton 
                            onClick={() => navigate(`/admin/chapters/${chapter.id}/edit`)} 
                            theme={theme}
                          >
                            <FaPencilAlt />
                          </ActionIconButton>
                          <ActionIconButton 
                            onClick={() => handleDeleteChapterClick(chapter)} 
                            theme={theme} 
                            variant="danger"
                          >
                            <FaTrashAlt />
                          </ActionIconButton>
                        </ChapterActions>
                      )}
                    </ChapterHeader>
                    
                    <ChapterDescription theme={theme}>
                      {chapter.description || 'Không có mô tả.'}
                    </ChapterDescription>
                    
                    {chapter.lessonsCount > 0 && (
                      <div style={{ 
                        marginTop: '0.75rem', 
                        fontSize: '0.9rem', 
                        color: theme === 'dark' ? '#a0aec0' : '#718096' 
                      }}>
                        <FaRegFileAlt style={{ marginRight: '0.5rem', display: 'inline' }} />
                        {chapter.lessonsCount} bài học
                      </div>
                    )}
                  </ChapterCard>
                ))
            ) : (
              <EmptyState theme={theme}>
                {loading ? "Đang tải danh sách chương học..." : "Môn học này chưa có chương nào."}
              </EmptyState>
            )}
          </ChaptersList>

          <ButtonsRow>
            <BackButton to="/subjects" theme={theme}>
              <FaArrowLeft /> Quay lại danh sách môn học
            </BackButton>
            
            <div>
              <ActionButton onClick={() => navigate(`/subjects/${subjectId}/exams`)}>
                <FaRegFileAlt /> Xem danh sách đề thi
              </ActionButton>
              
              {user && (user.role === 'Admin' || user.role === 'Teacher') && (
                <ActionButton 
                  onClick={() => navigate(`/subject/edit/${subjectId}`)}
                  style={{ marginLeft: '1rem' }}
                >
                  <FaChalkboardTeacher /> Chỉnh sửa môn học
                </ActionButton>
              )}
            </div>
          </ButtonsRow>
        </>
        
        <div style={{ 
          marginTop: '3rem',
          fontSize: '0.8rem',
          color: theme === 'dark' ? '#718096' : '#a0aec0',
          textAlign: 'right'
        }}>
          Truy cập vào lúc: {currentTime} | Người dùng: {currentUser}
        </div>
      </Container>
      
      <Footer />
      
      {/* Edit Chapter Modal */}
      {showEditChapterModal && currentChapter && (
        <ModalOverlay>
          <ModalContainer theme={theme}>
            <ModalHeader>
              <ModalTitle theme={theme}>Chỉnh sửa chương học</ModalTitle>
              <CloseButton onClick={() => setShowEditChapterModal(false)} theme={theme}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            
            <form onSubmit={handleUpdateChapter}>
              <FormGroup>
                <FormLabel theme={theme}>Tên chương *</FormLabel>
                <FormInput
                  type="text"
                  name="name"
                  value={chapterFormData.name}
                  onChange={handleFormChange}
                  placeholder="Nhập tên chương"
                  theme={theme}
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel theme={theme}>Mô tả</FormLabel>
                <FormTextarea
                  name="description"
                  value={chapterFormData.description}
                  onChange={handleFormChange}
                  placeholder="Mô tả về nội dung của chương"
                  theme={theme}
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel theme={theme}>Số thứ tự</FormLabel>
                <FormInput
                  type="number"
                  name="orderIndex"
                  value={chapterFormData.orderIndex}
                  onChange={handleFormChange}
                  placeholder="Thứ tự của chương (số)"
                  theme={theme}
                  min="0"
                />
              </FormGroup>
              
              {formError && <ErrorMessage>{formError}</ErrorMessage>}
              
              <ModalFooter>
                <CancelButton 
                  type="button" 
                  onClick={() => setShowEditChapterModal(false)} 
                  theme={theme}
                >
                  Hủy
                </CancelButton>
                <SaveButton 
                  type="submit"
                  theme={theme}
                  disabled={editChapterLoading}
                >
                  {editChapterLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </SaveButton>
              </ModalFooter>
            </form>
          </ModalContainer>
        </ModalOverlay>
      )}

      {/* Delete Chapter Confirmation Modal */}
      {showDeleteChapterModal && currentChapter && (
        <ModalOverlay>
          <DeleteConfirmationModal theme={theme}>
            <ModalHeader>
              <ModalTitle theme={theme}>Xóa chương học</ModalTitle>
              <CloseButton onClick={() => setShowDeleteChapterModal(false)} theme={theme}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            
            <ConfirmationHeader>
              <WarningIcon />
              <ModalTitle theme={theme}>Xác nhận xóa?</ModalTitle>
            </ConfirmationHeader>
            
            <ConfirmationMessage theme={theme}>
              Bạn có chắc chắn muốn xóa chương <strong>"{currentChapter.name}"</strong>? Tất cả các bài học bên trong chương này cũng sẽ bị xóa.
            </ConfirmationMessage>
            
            {formError && <ErrorMessage>{formError}</ErrorMessage>}
            
            <ModalFooter>
              <CancelButton 
                type="button" 
                onClick={() => setShowDeleteChapterModal(false)} 
                theme={theme}
              >
                Hủy
              </CancelButton>
              <DangerButton 
                onClick={handleDeleteChapter}
                theme={theme}
                disabled={deleteChapterLoading}
              >
                {deleteChapterLoading ? 'Đang xóa...' : 'Xóa chương'}
              </DangerButton>
            </ModalFooter>
          </DeleteConfirmationModal>
        </ModalOverlay>
      )}
    </PageWrapper>
  );
};

export default SubjectDetail;