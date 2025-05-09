import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, FaSearch, FaFilter, FaUserGraduate, 
  FaCheckCircle, FaTimesCircle, FaPlus, FaCheck,
  FaTrash, FaFileExport, FaSave, FaTimes, FaSyncAlt
} from 'react-icons/fa';
import apiClient from '../../services/apiClient';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmModal from '../common/ConfirmModal';

// Main container
const Container = styled.div`
  padding: 2rem;
  min-height: 100vh;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(180deg, #1a202c 0%, #171923 100%)' 
    : 'linear-gradient(180deg, #f7fafc 0%, #edf2f7 100%)'};
`;

// Header with navigation
const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: transparent;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#edf2f7'};
  }
`;

// Title section
const TitleSection = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 0.5rem;
`;

const SubTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  margin-top: 0;
`;

// Card components
const Card = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

// Badge for counts
const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1.5rem;
  padding: 0 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  margin-left: 0.5rem;
`;

// Tabs
const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  margin-bottom: 1.5rem;
`;

const Tab = styled.button`
  padding: 1rem 1.5rem;
  background-color: transparent;
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#4299e1' : 'transparent'};
  color: ${props => props.active 
    ? props.theme === 'dark' ? '#4299e1' : '#3182ce' 
    : props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${props => props.theme === 'dark' ? '#4299e1' : '#3182ce'};
  }
`;

// Search and filter components
const SearchBar = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 0.5rem 0 0 0.5rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 0 0.5rem 0.5rem 0;
  cursor: pointer;
  
  &:hover {
    background-color: #3182ce;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FilterLabel = styled.span`
  font-size: 0.95rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#4a5568'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 0.375rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 0.95rem;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

// Table components
const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

const Th = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#f7fafc'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.025em;
  
  &:first-child {
    border-top-left-radius: 0.5rem;
  }
  
  &:last-child {
    border-top-right-radius: 0.5rem;
  }
`;

const Td = styled.td`
  padding: 0.75rem 1rem;
  vertical-align: middle;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 0.9rem;
`;

// Checkbox for selection
const Checkbox = styled.div`
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid ${props => props.checked ? '#4299e1' : props.theme === 'dark' ? '#718096' : '#cbd5e0'};
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: ${props => props.checked ? '#4299e1' : 'transparent'};
  transition: all 0.2s ease;
  
  svg {
    color: white;
    font-size: 0.75rem;
    opacity: ${props => props.checked ? 1 : 0};
    transition: opacity 0.2s ease;
  }
`;

// Student status badge
const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 500;
  background-color: ${props => props.active 
    ? props.theme === 'dark' ? 'rgba(72, 187, 120, 0.2)' : '#C6F6D5' 
    : props.theme === 'dark' ? 'rgba(229, 62, 62, 0.2)' : '#FED7D7'};
  color: ${props => props.active 
    ? props.theme === 'dark' ? '#68D391' : '#276749' 
    : props.theme === 'dark' ? '#FC8181' : '#9B2C2C'};
`;

// Button components
const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: #4299e1;
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: #3182ce;
  }
`;

const DangerButton = styled(Button)`
  background-color: #F56565;
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: #E53E3E;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  border: none;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#e2e8f0'};
  }
`;

const SuccessButton = styled(Button)`
  background-color: #48BB78;
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: #38A169;
  }
`;

// Pagination
const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
`;

const PageInfo = styled.div`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 0.95rem;
`;

const PageButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid ${props => props.active 
    ? '#4299e1' 
    : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 0.375rem;
  background-color: ${props => props.active 
    ? '#4299e1' 
    : 'transparent'};
  color: ${props => props.active 
    ? 'white' 
    : props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active 
      ? '#3182ce' 
      : props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  }
`;

// Action buttons container
const ActionButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  padding-top: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

// Selected students summary
const SelectionSummary = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f7fafc'};
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid #4299e1;
`;

const SummaryText = styled.div`
  font-size: 0.95rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Empty state
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  
  svg {
    font-size: 3rem;
    color: ${props => props.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
    margin-bottom: 1.5rem;
  }
  
  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
    margin-bottom: 0.75rem;
  }
  
  p {
    font-size: 1rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
    max-width: 500px;
    margin-bottom: 1.5rem;
  }
`;

// Loading state
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  
  h3 {
    margin-top: 1.5rem;
    font-size: 1.25rem;
    font-weight: 600;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
`;

const ManageExamStudents = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  
  // States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [examData, setExamData] = useState(null);
  const [activeTab, setActiveTab] = useState('assigned');
  const [students, setStudents] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  
  // Pagination and filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  
  // Initial data loading
  useEffect(() => {
    fetchExamData();
  }, [id]);
  
  // Update student list when tab, filters or page changes
  useEffect(() => {
    if (activeTab === 'assigned') {
      fetchAssignedStudents();
    } else {
      fetchAvailableStudents();
    }
  }, [activeTab, page, gradeFilter]);
  
  // Fetch exam details
  const fetchExamData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/official-exams/${id}`);
      console.log("Exam data:", response.data);
      setExamData(response.data);
      
      // Get students associated with this exam
      try {
        const studentsResponse = await apiClient.get(`/api/official-exams/${id}/students`);
        console.log("Students response:", studentsResponse.data);
        
        // If students are returned as a simple array
        if (Array.isArray(studentsResponse.data)) {
          setAssignedStudents(studentsResponse.data);
        } 
        // If students are in a nested property
        else if (studentsResponse.data && Array.isArray(studentsResponse.data.items)) {
          setAssignedStudents(studentsResponse.data.items);
        }
        // If students are directly in the exam data
        else if (response.data && Array.isArray(response.data.students)) {
          setAssignedStudents(response.data.students);
        }
        else {
          setAssignedStudents([]);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        // Try to use students from exam data as fallback
        if (response.data && Array.isArray(response.data.students)) {
          setAssignedStudents(response.data.students);
        } else {
          setAssignedStudents([]);
        }
      }
    } catch (error) {
      console.error('Error fetching exam data:', error);
      showErrorToast('Không thể tải thông tin kỳ thi');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch assigned students with pagination and filters
const fetchAssignedStudents = async () => {
  setLoading(true);
  try {
    if (assignedStudents && assignedStudents.length > 0) {
      let filteredStudents = [...assignedStudents];
      
      // Apply search filter if provided
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredStudents = filteredStudents.filter(student => 
          (student.studentName && student.studentName.toLowerCase().includes(searchLower)) ||
          (student.fullName && student.fullName.toLowerCase().includes(searchLower)) ||
          (student.studentCode && student.studentCode.toLowerCase().includes(searchLower)) ||
          (student.username && student.username.toLowerCase().includes(searchLower))
        );
      }
      
      // Get full student data to access grade information
      try {
        // Fetch all users to get grade information
        const userResponse = await apiClient.get('/api/User/list?pageSize=100');
        const userData = userResponse.data.data || [];
        
        // Create a map of users by ID for quick lookup
        const userMap = {};
        userData.forEach(user => {
          userMap[user.id] = user;
        });
        
        // Enhance student data with grade information from user data
        filteredStudents = filteredStudents.map(student => {
          const userId = student.studentId; // This is the ID that maps to the user table
          const userInfo = userMap[userId];
          
          return {
            ...student,
            grade: userInfo ? userInfo.grade : "Chưa xác định"
          };
        });
        
        console.log("Enhanced student data with grades:", filteredStudents);
      } catch (error) {
        console.error("Error fetching user data for grades:", error);
      }
      
      // Apply grade filter if provided
      if (gradeFilter) {
        filteredStudents = filteredStudents.filter(student => 
          student.grade && student.grade.toString() === gradeFilter
        );
      }
      
      // Implement simple pagination
      const startIndex = (page - 1) * 10;
      const endIndex = startIndex + 10;
      const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
      
      setStudents(paginatedStudents);
      setTotalPages(Math.ceil(filteredStudents.length / 10) || 1);
    } else {
      // As a fallback, try to fetch assigned students from the API
      try {
        const response = await apiClient.get(`/api/official-exams/${id}/students`);
        setAssignedStudents(response.data || []);
        
        // Apply the same filtering and pagination logic
        let filteredStudents = response.data || [];
        
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          filteredStudents = filteredStudents.filter(student => 
            (student.fullName && student.fullName.toLowerCase().includes(searchLower)) ||
            (student.studentCode && student.studentCode.toLowerCase().includes(searchLower))
          );
        }
        
        if (gradeFilter) {
          filteredStudents = filteredStudents.filter(student => 
            student.grade && student.grade.toString() === gradeFilter
          );
        }
        
        const startIndex = (page - 1) * 10;
        const endIndex = startIndex + 10;
        const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
        
        setStudents(paginatedStudents);
        setTotalPages(Math.ceil(filteredStudents.length / 10) || 1);
      } catch (error) {
        console.error('Error fetching exam students:', error);
        setStudents([]);
        setTotalPages(1);
      }
    }
  } catch (error) {
    console.error('Error processing assigned students:', error);
    showErrorToast('Không thể tải danh sách học sinh đã phân công');
    setStudents([]);
    setTotalPages(1);
  } finally {
    setLoading(false);
  }
};
  
  // Fetch available students (not assigned to this exam)
const fetchAvailableStudents = async () => {
  setLoading(true);
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('pageSize', 100); // Get more to ensure we have enough after filtering
    if (searchTerm) params.append('search', searchTerm);
    if (gradeFilter) params.append('grade', gradeFilter);
    
    // Get users
    const response = await apiClient.get(`/api/User/list?${params}`);
    console.log("User list response:", response.data);
    
    // Handle the data structure correctly - may be nested in 'data'
    const userData = response.data.data || response.data;
    
    if (Array.isArray(userData)) {
      // Filter for student role
      const allStudents = userData.filter(user => 
        user.role === 'Student'
      );
      console.log("Filtered students:", allStudents);
      
      // *** FIX: Use studentId (from assigned) to compare with id (from user list) ***
      // Get the userIds of students already assigned to this exam
      const assignedUserIds = new Set();
      assignedStudents.forEach(student => {
        // Add both studentId and id to handle different API response formats
        if (student.studentId) assignedUserIds.add(student.studentId);
        if (student.id) assignedUserIds.add(student.id);
      });
      
      console.log("Assigned User IDs:", Array.from(assignedUserIds));
      
      // Filter out students that are already assigned to this exam
      const availableStudentsList = allStudents.filter(user => {
        // Check if this user's ID is in the assigned users set
        return !assignedUserIds.has(user.id);
      });
      
      console.log("Available students:", availableStudentsList);
      
      // Apply client-side search if API doesn't support it
      let filteredStudents = availableStudentsList;
      if (searchTerm && !params.has('search')) {
        const searchLower = searchTerm.toLowerCase();
        filteredStudents = filteredStudents.filter(student => 
          (student.fullName && student.fullName.toLowerCase().includes(searchLower)) ||
          (student.username && student.username.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply client-side grade filter if API doesn't support it
      if (gradeFilter && !params.has('grade')) {
        filteredStudents = filteredStudents.filter(student => 
          student.grade && student.grade.toString() === gradeFilter
        );
      }
      
      // Apply pagination client-side
      const startIndex = (page - 1) * 10;
      const endIndex = startIndex + 10;
      const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
      
      setStudents(paginatedStudents);
      setTotalPages(Math.ceil(filteredStudents.length / 10) || 1);
    } else {
      console.error("Invalid or unexpected API response format:", response.data);
      setStudents([]);
      setTotalPages(1);
    }
  } catch (error) {
    console.error('Error fetching available students:', error);
    showErrorToast('Không thể tải danh sách học sinh khả dụng');
    setStudents([]); 
  } finally {
    setLoading(false);
  }
};
  
  // Handle student selection
  const handleSelectStudent = (student) => {
    if (selectedStudents.some(s => s.id === student.id)) {
      setSelectedStudents(selectedStudents.filter(s => s.id !== student.id));
    } else {
      setSelectedStudents([...selectedStudents, student]);
    }
  };
  
  // Handle select all students
  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents([...students]);
    }
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (activeTab === 'assigned') {
      fetchAssignedStudents();
    } else {
      fetchAvailableStudents();
    }
  };
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedStudents([]);
    setPage(1);
  };
  
  // Assign students to the exam
  const handleAssignStudents = async () => {
    if (selectedStudents.length === 0) return;
    
    setSubmitting(true);
    try {
      await apiClient.post(`/api/official-exams/${id}/students`, {
        studentIds: selectedStudents.map(student => student.id)
      });
      
      showSuccessToast(`Đã phân công ${selectedStudents.length} học sinh vào kỳ thi thành công`);
      setSelectedStudents([]);
      fetchExamData();
      handleTabChange('assigned');
    } catch (error) {
      console.error('Error assigning students:', error);
      showErrorToast('Không thể phân công học sinh vào kỳ thi');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Remove students from the exam
  const handleRemoveStudents = async () => {
    if (selectedStudents.length === 0) return;
    
    setSubmitting(true);
    try {
      await apiClient.delete(`/api/official-exams/${id}/students`, {
        data: {
          studentIds: selectedStudents.map(student => student.id)
        }
      });
      
      showSuccessToast(`Đã xóa ${selectedStudents.length} học sinh khỏi kỳ thi thành công`);
      setSelectedStudents([]);
      fetchExamData();
    } catch (error) {
      console.error('Error removing students:', error);
      showErrorToast('Không thể xóa học sinh khỏi kỳ thi');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Confirm remove students
  const confirmRemoveStudents = () => {
    setConfirmAction(() => handleRemoveStudents);
    setShowConfirmDialog(true);
  };
  
  // Render loading state
  if (loading && !examData) {
    return (
      <Container theme={theme}>
        <Header>
          <BackButton 
            theme={theme}
            onClick={() => navigate(`/admin/official-exams/${id}`)}
          >
            <FaArrowLeft /> Quay lại kỳ thi
          </BackButton>
        </Header>
        
        <LoadingContainer theme={theme}>
          <LoadingSpinner size={60} />
          <h3>Đang tải thông tin...</h3>
        </LoadingContainer>
      </Container>
    );
  }
  
  return (
    <Container theme={theme}>
      <Header>
        <BackButton 
          theme={theme}
          onClick={() => navigate(`/admin/official-exams/${id}`)}
        >
          <FaArrowLeft /> Quay lại kỳ thi
        </BackButton>
      </Header>
      
      <TitleSection>
        <Title theme={theme}>Quản lý danh sách học sinh</Title>
        <SubTitle theme={theme}>{examData?.title}</SubTitle>
      </TitleSection>
      
      <Card 
        theme={theme}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CardHeader theme={theme}>
          <CardTitle theme={theme}>
            <FaUserGraduate /> 
            {activeTab === 'assigned' 
              ? `Học sinh đã phân công (${assignedStudents.length})` 
              : 'Thêm học sinh vào kỳ thi'}
          </CardTitle>
        </CardHeader>
        
        <CardBody>
          <TabsContainer theme={theme}>
            <Tab 
              theme={theme} 
              active={activeTab === 'assigned'} 
              onClick={() => handleTabChange('assigned')}
            >
              Đã phân công <Badge theme={theme}>{assignedStudents.length}</Badge>
            </Tab>
            <Tab 
              theme={theme} 
              active={activeTab === 'available'} 
              onClick={() => handleTabChange('available')}
            >
              Thêm học sinh mới
            </Tab>
          </TabsContainer>
          
          <form onSubmit={handleSearch}>
            <SearchBar>
              <SearchInput 
                theme={theme}
                type="text"
                placeholder="Tìm kiếm học sinh theo tên hoặc mã học sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchButton type="submit">
                <FaSearch />
              </SearchButton>
            </SearchBar>
          </form>
          
          <FiltersContainer>
            <FilterGroup>
              <FilterLabel theme={theme}>
                <FaFilter /> Khối:
              </FilterLabel>
              <FilterSelect 
                theme={theme}
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
                <option value="12">Khối 12</option>
              </FilterSelect>
            </FilterGroup>
            
            <SecondaryButton 
              theme={theme}
              onClick={() => {
                setSearchTerm('');
                setGradeFilter('');
                setPage(1);
                if (activeTab === 'assigned') {
                  fetchAssignedStudents();
                } else {
                  fetchAvailableStudents();
                }
              }}
            >
              <FaSyncAlt /> Đặt lại bộ lọc
            </SecondaryButton>
          </FiltersContainer>
          
          {selectedStudents.length > 0 && (
            <SelectionSummary theme={theme}>
              <SummaryText theme={theme}>
                <FaCheckCircle /> Đã chọn {selectedStudents.length} học sinh
              </SummaryText>
              <SecondaryButton 
                theme={theme}
                onClick={() => setSelectedStudents([])}
              >
                <FaTimes /> Bỏ chọn tất cả
              </SecondaryButton>
            </SelectionSummary>
          )}
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <LoadingSpinner size={40} />
              <p>Đang tải danh sách học sinh...</p>
            </div>
          ) : students.length === 0 ? (
            <EmptyState theme={theme}>
              <FaUserGraduate />
              <h3>
                {activeTab === 'assigned' 
                  ? 'Chưa có học sinh nào được phân công' 
                  : 'Không tìm thấy học sinh khả dụng'}
              </h3>
              <p>
                {activeTab === 'assigned' 
                  ? 'Hãy chuyển sang tab "Thêm học sinh mới" để phân công học sinh vào kỳ thi.' 
                  : 'Tất cả học sinh đã được phân công hoặc không có học sinh nào phù hợp với bộ lọc.'}
              </p>
              {activeTab === 'assigned' && (
                <PrimaryButton onClick={() => handleTabChange('available')}>
                  <FaPlus /> Thêm học sinh mới
                </PrimaryButton>
              )}
            </EmptyState>
          ) : (
            <>
              <Table>
                <thead>
                  <tr>
                    <Th theme={theme} style={{ width: '40px' }}>
                      <Checkbox 
                        theme={theme}
                        checked={selectedStudents.length === students.length && students.length > 0}
                        onClick={handleSelectAll}
                      >
                        <FaCheck />
                      </Checkbox>
                    </Th>
                    <Th theme={theme}>Học sinh</Th>
                    <Th theme={theme}>Mã học sinh</Th>
                    <Th theme={theme}>Khối</Th>
                    {activeTab === 'assigned' && (
                      <Th theme={theme}>Trạng thái</Th>
                    )}
                  </tr>
                </thead>
                <tbody>
  {students.map(student => {
    console.log("Rendering student:", student); // Keep this debug log
    return (
      <tr key={student.id}>
        <Td theme={theme}>
          <Checkbox 
            theme={theme}
            checked={selectedStudents.some(s => s.id === student.id)}
            onClick={() => handleSelectStudent(student)}
          >
            <FaCheck />
          </Checkbox>
        </Td>
        <Td theme={theme}>{student.studentName || student.fullName || "Không có tên"}</Td>
        <Td theme={theme}>{student.studentCode || student.username || "Không có mã"}</Td>
        <Td theme={theme}>
          {student.grade === "N/A" ? "Chưa xác định" : 
           `Khối ${student.grade}` || "Chưa xác định"}
        </Td>
        {activeTab === 'assigned' && (
          <Td theme={theme}>
            <StatusBadge theme={theme} active={student.hasTaken}>
              {student.hasTaken ? (
                <><FaCheckCircle /> Đã làm bài</>
              ) : (
                <><FaTimesCircle /> Chưa làm bài</>
              )}
            </StatusBadge>
          </Td>
        )}
      </tr>
    );
  })}
</tbody>
              </Table>
              
              <Pagination>
                <PageInfo theme={theme}>
                  Trang {page} / {totalPages}
                </PageInfo>
                <PageButtons>
                  <PageButton 
                    theme={theme}
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    &laquo;
                  </PageButton>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Create array of page numbers centered around current page
                    const pageNumber = Math.min(
                      Math.max(page - 2, 1) + i,
                      totalPages
                    );
                    return pageNumber <= totalPages ? (
                      <PageButton
                        key={pageNumber}
                        theme={theme}
                        active={pageNumber === page}
                        onClick={() => setPage(pageNumber)}
                      >
                        {pageNumber}
                      </PageButton>
                    ) : null;
                  })}
                  <PageButton
                    theme={theme}
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    &raquo;
                  </PageButton>
                </PageButtons>
              </Pagination>
            </>
          )}
          
          <ActionButtonsContainer theme={theme}>
            <ButtonGroup>
              {activeTab === 'assigned' ? (
                <DangerButton 
                  disabled={selectedStudents.length === 0 || submitting}
                  onClick={confirmRemoveStudents}
                >
                  <FaTrash /> Xóa khỏi kỳ thi
                </DangerButton>
              ) : (
                <Button onClick={() => handleTabChange('assigned')}>
                  <FaArrowLeft /> Quay lại danh sách
                </Button>
              )}
            </ButtonGroup>
            
            <ButtonGroup>
              <SecondaryButton
                theme={theme}
                onClick={() => navigate(`/admin/official-exams/${id}`)}
              >
                <FaArrowLeft /> Quay lại kỳ thi
              </SecondaryButton>
              
              {activeTab === 'available' && (
                <SuccessButton 
                  disabled={selectedStudents.length === 0 || submitting}
                  onClick={handleAssignStudents}
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size={16} color="white" /> Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FaPlus /> Phân công học sinh ({selectedStudents.length})
                    </>
                  )}
                </SuccessButton>
              )}
            </ButtonGroup>
          </ActionButtonsContainer>
        </CardBody>
      </Card>
      
      {showConfirmDialog && (
        <ConfirmModal
          title="Xác nhận thao tác"
          message={`Bạn có chắc chắn muốn xóa ${selectedStudents.length} học sinh đã chọn khỏi kỳ thi này?`}
          confirmLabel="Xác nhận"
          cancelLabel="Hủy"
          onConfirm={() => {
            setShowConfirmDialog(false);
            if (confirmAction) confirmAction();
          }}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}
    </Container>
  );
};

export default ManageExamStudents;