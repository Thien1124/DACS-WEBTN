import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { 
  FaFileExcel, FaUpload, FaEye, FaCheck, 
  FaTimes, FaDownload, FaQuestionCircle, 
  FaInfoCircle, FaSave, FaArrowLeft,
  FaCog, FaExclamationTriangle, FaFilter
} from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchSubjects } from '../../redux/subjectSlice';

import apiClient from '../../services/apiClient';
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
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  margin: 0.5rem 0 0 0;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  background-color: ${props => props.primary 
    ? '#4299e1' 
    : props.success
      ? '#48bb78'
      : props.theme === 'dark' ? '#2d3748' : '#e2e8f0'};
  color: ${props => props.primary || props.success
    ? 'white' 
    : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:hover {
    background-color: ${props => props.primary 
      ? '#3182ce' 
      : props.success
        ? '#38a169'
        : props.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Card = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 0.5rem;
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

const CardTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const CardFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const UploadZone = styled.div`
  border: 2px dashed ${props => props.isDragActive 
    ? '#4299e1' 
    : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 0.5rem;
  padding: 3rem 2rem;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
  background-color: ${props => props.isDragActive 
    ? props.theme === 'dark' ? 'rgba(66, 153, 225, 0.1)' : 'rgba(66, 153, 225, 0.05)'
    : 'transparent'};
  
  &:hover {
    border-color: #4299e1;
    background-color: ${props => 
      props.theme === 'dark' ? 'rgba(66, 153, 225, 0.1)' : 'rgba(66, 153, 225, 0.05)'};
  }
`;

const UploadIcon = styled(FaFileExcel)`
  font-size: 3rem;
  color: ${props => props.theme === 'dark' ? '#90cdf4' : '#3182ce'};
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const UploadSubtext = styled.p`
  margin: 0.5rem 0 0 0;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const FileInput = styled.input`
  display: none;
`;

const InfoBox = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  border-radius: 0.375rem;
  background-color: ${props => props.theme === 'dark' ? 'rgba(66, 153, 225, 0.1)' : 'rgba(66, 153, 225, 0.05)'};
  border-left: 4px solid #4299e1;
`;

const InfoTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoList = styled.ul`
  margin: 0.5rem 0 0 0;
  padding-left: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  li {
    margin-bottom: 0.5rem;
  }
`;

const TemplateLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: #4299e1;
  font-weight: 500;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const StepContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Step = styled.div`
  flex: 1;
  padding: 1rem;
  text-align: center;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 3px;
    background-color: ${props => props.active 
      ? '#4299e1' 
      : 'transparent'};
  }
  
  @media (max-width: 768px) {
    text-align: left;
    padding: 0.5rem 0;
    
    &:after {
      bottom: 0;
    }
  }
`;

const StepNumber = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => props.active 
    ? '#4299e1' 
    : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  color: ${props => props.active 
    ? 'white' 
    : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 600;
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    margin-right: 0.5rem;
    margin-bottom: 0;
  }
`;

const StepTitle = styled.div`
  font-weight: 500;
  color: ${props => props.active 
    ? props.theme === 'dark' ? '#90cdf4' : '#3182ce'
    : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  @media (max-width: 768px) {
    display: inline;
  }
`;

const PreviewTable = styled.div`
  overflow-x: auto;
  margin-top: 1.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 0.75rem 1rem;
    border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
    text-align: left;
  }
  
  th {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#f7fafc'};
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
    font-weight: 600;
  }
  
  td {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
  
  tr:nth-child(even) {
    background-color: ${props => props.theme === 'dark' ? '#374151' : '#f7fafc'};
  }
  
  tr:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  }
`;

const ValidationBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  gap: 0.25rem;
  
  background-color: ${props => props.valid 
    ? props.theme === 'dark' ? 'rgba(72, 187, 120, 0.2)' : 'rgba(72, 187, 120, 0.1)'
    : props.theme === 'dark' ? 'rgba(245, 101, 101, 0.2)' : 'rgba(245, 101, 101, 0.1)'};
  color: ${props => props.valid 
    ? props.theme === 'dark' ? '#68d391' : '#38a169'
    : props.theme === 'dark' ? '#fc8181' : '#e53e3e'};
`;

const ValidationMessage = styled.p`
  color: ${props => props.error 
    ? props.theme === 'dark' ? '#fc8181' : '#e53e3e'
    : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-top: 0.5rem;
  font-size: 0.875rem;
`;

const ImportProgress = styled.div`
  margin-top: 1.5rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 4px;
  margin-top: 0.5rem;
  overflow: hidden;
  
  &:after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.progress}%;
    background-color: #4299e1;
    transition: width 0.3s ease;
  }
`;

const Summary = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  border-radius: 0.375rem;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#f7fafc'};
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
`;

const SummaryTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SummaryLabel = styled.span`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const SummaryValue = styled.span`
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const SummaryResult = styled.div`
  margin-top: 1rem;
  text-align: center;
  font-size: 1.125rem;
  font-weight: 500;
  color: ${props => props.success 
    ? props.theme === 'dark' ? '#68d391' : '#38a169'
    : props.theme === 'dark' ? '#fc8181' : '#e53e3e'};
  
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FormCheckbox = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
  
  input {
    margin-right: 0.5rem;
  }
  
  label {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
    user-select: none;
  }
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ImportQuestionsExcel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  const fileInputRef = useRef(null);
  
  // States for API parameters
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const [levelId, setLevelId] = useState('');
  const [overrideExisting, setOverrideExisting] = useState(true);
  const [validateOnly, setValidateOnly] = useState(false);
  const [continueOnError, setContinueOnError] = useState(true);
  const [batchSize, setBatchSize] = useState(50);
  
  // Data states
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [levels, setLevels] = useState([
    { id: 1, name: 'Nhận biết' },
    { id: 2, name: 'Thông hiểu' },
    { id: 3, name: 'Vận dụng' },
    { id: 4, name: 'Vận dụng cao' }
  ]);
  
  // Original states
  const [step, setStep] = useState(1);
  const [isDragActive, setIsDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [validationResults, setValidationResults] = useState({
    isValid: false,
    errors: [],
    validCount: 0,
    invalidCount: 0
  });
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);
  
  // Fetch subjects and chapters on mount
  useEffect(() => {
    fetchAllSubjects();
  }, []);
  
  useEffect(() => {
    if (subjectId) {
      fetchChaptersBySubject(subjectId);
    } else {
      setChapters([]);
      setChapterId('');
    }
  }, [subjectId]);
  
  // Fetch all subjects
  const fetchAllSubjects = async () => {
  try {
    const response = await apiClient.get(`/api/Subject/all`);
    // Fix: API returns subjects directly in the response.data array, not in response.data.data
    setSubjects(response.data || []);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    showErrorToast('Không thể tải danh sách môn học');
  }
};
  
  // Fetch chapters by subject
  const fetchChaptersBySubject = async (subjectId) => {
  try {
    console.log('Fetching chapters for subject ID:', subjectId);
    const response = await apiClient.get(`/api/Chapter`, {
      params: {
        subjectId: Number(subjectId), // Ensure subjectId is a number
        page: 1,
        pageSize: 100,
        includeInactive: false
      }
    });
    
    console.log('Chapter API response:', response.data);
    
    // Check different possible response structures
    let chaptersData = [];
    if (response.data?.data?.items) {
      // Standard nested response
      chaptersData = response.data.data.items;
    } else if (response.data?.items) {
      // Alternative nested structure
      chaptersData = response.data.items;
    } else if (Array.isArray(response.data)) {
      // Direct array response
      chaptersData = response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      // Array inside data property
      chaptersData = response.data.data;
    }
    
    console.log('Parsed chapters:', chaptersData);
    setChapters(chaptersData || []);
    
    // If we got chapters but chapterId is empty, select the first one by default
    if (chaptersData.length > 0 && !chapterId) {
      setChapterId(chaptersData[0].id.toString());
    }
  } catch (error) {
    console.error('Error fetching chapters:', error);
    showErrorToast('Không thể tải danh sách chương');
    setChapters([]);
  }
};
  
  // Handle file selection with better error handling
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    
    if (!['xlsx', 'xls'].includes(fileExtension)) {
      showErrorToast('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
      return;
    }
    
    setFile(selectedFile);
    
    // Read the file with better error handling
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (!workbook || workbook.SheetNames.length === 0) {
          throw new Error('File Excel không hợp lệ hoặc không có dữ liệu');
        }
        
        // Get the first worksheet
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (!jsonData || jsonData.length <= 1) {
          throw new Error('File Excel không chứa dữ liệu hoặc chỉ có tiêu đề');
        }
        
        setFileData(jsonData);
        parseExcelData(jsonData);
      } catch (error) {
        console.error('Error reading Excel file:', error);
        showErrorToast(error.message || 'Có lỗi xảy ra khi đọc file Excel');
      }
    };
    
    reader.onerror = () => {
      showErrorToast('Không thể đọc file. Vui lòng kiểm tra lại file của bạn.');
    };
    
    reader.readAsArrayBuffer(selectedFile);
  };
  
  // Parse Excel data into questions
  const parseExcelData = (data) => {
    // Skip header row and empty rows
    const rows = data.filter((row, index) => index > 0 && row.length > 0);
    
    const parsedQuestions = rows.map((row, index) => {
      return {
        index: index + 1,
        content: row[0] || '',
        optionA: row[1] || '',
        optionB: row[2] || '',
        optionC: row[3] || '',
        optionD: row[4] || '',
        correctAnswer: row[5] || '',
        explanation: row[6] || '',
        level: row[7] || ''
      };
    });
    
    setQuestions(parsedQuestions);
    validateQuestions(parsedQuestions);
    setStep(2); // Move to preview step
  };
  
  // Validate questions
  const validateQuestions = (questions) => {
    const errors = [];
    let validCount = 0;
    let invalidCount = 0;
    
    questions.forEach((question, index) => {
      const rowErrors = [];
      
      // Validate required fields
      if (!question.content) rowErrors.push('Thiếu nội dung câu hỏi');
      if (!question.optionA) rowErrors.push('Thiếu đáp án A');
      if (!question.optionB) rowErrors.push('Thiếu đáp án B');
      if (!question.correctAnswer) rowErrors.push('Thiếu đáp án đúng');
      
      // Validate correct answer is one of the options
      const validAnswers = ['A', 'B', 'C', 'D'];
      const normalizedAnswer = question.correctAnswer.toUpperCase().trim();
      if (!validAnswers.includes(normalizedAnswer)) {
        rowErrors.push('Đáp án đúng phải là một trong các giá trị: A, B, C, D');
      }
      
      // Add row errors if any
      if (rowErrors.length > 0) {
        errors.push({
          row: index + 2, // +2 because of 0-indexing and header row
          errors: rowErrors
        });
        invalidCount++;
      } else {
        validCount++;
      }
    });
    
    setValidationResults({
      isValid: errors.length === 0,
      errors,
      validCount,
      invalidCount
    });
    
    return errors.length === 0;
  };
  
  // Handle file drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };
  
  const handleDragLeave = () => {
    setIsDragActive(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Only process the first file if multiple are dropped
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };
  
  // Handle click on upload zone
  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  
  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };
  
  // Download template
  const handleDownloadTemplate = async () => {
  try {
    // Show loading toast
    const loadingToastId = showSuccessToast('Đang tải mẫu...', { autoClose: false });
    
    // Fetch the template file from API as blob
    const response = await apiClient.get('/api/Question/import-template', {
      responseType: 'blob'
    });
    
    // Create file download URL
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'mau_nhap_cau_hoi.xlsx');
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    // Close loading toast and show success
    showSuccessToast('Tải mẫu thành công');
  } catch (error) {
    console.error('Error downloading template:', error);
    showErrorToast('Không thể tải mẫu. Vui lòng thử lại sau.');
  }
};
  
  // Handle validate
  const handleValidate = async () => {
    if (!subjectId) {
      showErrorToast('Vui lòng chọn môn học');
      return;
    }
    
    if (!file) {
      showErrorToast('Vui lòng chọn file để nhập');
      return;
    }
    
    setImporting(true);
    setImportProgress(10);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(`/api/Question/import`, formData, {
        params: {
          subjectId: Number(subjectId),
          chapterId: chapterId ? Number(chapterId) : undefined,
          levelId: levelId ? Number(levelId) : undefined,
          validateOnly: true,
          overrideExisting,
          continueOnError,
          batchSize: Number(batchSize)
        },
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setImportProgress(100);
      
      // Update validation results based on API response
      const data = response.data.data;
      
      setValidationResults({
        isValid: data.errorCount === 0,
        errors: data.errors.map(err => ({ row: err.row, errors: [err.message] })),
        validCount: data.totalProcessed - data.errorCount,
        invalidCount: data.errorCount,
        warnings: data.warnings || []
      });
      
      if (data.errorCount === 0) {
        showSuccessToast('File hợp lệ, sẵn sàng để nhập');
      } else {
        showErrorToast(`Có ${data.errorCount} lỗi trong file. Vui lòng kiểm tra và sửa lại.`);
      }
    } catch (error) {
      console.error('Error validating file:', error);
      showErrorToast(error.response?.data?.message || 'Có lỗi xảy ra khi kiểm tra file');
      
      setValidationResults({
        isValid: false,
        errors: [{ row: 0, errors: [error.response?.data?.message || 'Lỗi không xác định'] }],
        validCount: 0,
        invalidCount: 1
      });
    } finally {
      setImporting(false);
    }
  };
  
  // Handle import
  const handleImport = async () => {
    if (!subjectId) {
      showErrorToast('Vui lòng chọn môn học');
      return;
    }
    
    if (!file) {
      showErrorToast('Vui lòng chọn file để nhập');
      return;
    }
    
    setImporting(true);
    setStep(3); // Move to import step
    setImportProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Setup progress tracking
      const updateProgressInterval = setInterval(() => {
        setImportProgress(prev => {
          const newProgress = prev + 5;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      const response = await apiClient.post(`/api/Question/import`, formData, {
        params: {
          subjectId: Number(subjectId),
          chapterId: chapterId ? Number(chapterId) : undefined,
          levelId: levelId ? Number(levelId) : undefined,
          validateOnly: false,
          overrideExisting,
          continueOnError,
          batchSize: Number(batchSize)
        },
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      clearInterval(updateProgressInterval);
      setImportProgress(100);
      
      const data = response.data;
      
      // Set import results
      setImportResults({
        success: data.success,
        message: data.message,
        processingTime: data.processingTime,
        data: data.data
      });
      
      if (data.success) {
        showSuccessToast(data.message);
      } else {
        showErrorToast(data.message);
      }
    } catch (error) {
      console.error('Error importing questions:', error);
      
      setImportResults({
        success: false,
        message: error.response?.data?.message || 'Có lỗi xảy ra khi nhập câu hỏi',
        data: {
          totalProcessed: 0,
          successCount: 0,
          failedCount: 0,
          errorCount: 1,
          errors: [{
            row: 0,
            message: error.response?.data?.message || 'Lỗi không xác định'
          }]
        }
      });
      
      showErrorToast(error.response?.data?.message || 'Có lỗi xảy ra khi nhập câu hỏi');
    } finally {
      setImporting(false);
    }
  };
  
  // Handle go back to questions list
  const handleGoBack = () => {
    navigate('/admin/questions');
  };
  
  // Handle restart import process
  const handleRestart = () => {
    setStep(1);
    setFile(null);
    setFileData(null);
    setQuestions([]);
    setValidationResults({
      isValid: false,
      errors: [],
      validCount: 0,
      invalidCount: 0
    });
    setImporting(false);
    setImportProgress(0);
    setImportResults(null);
  };
  
  return (
    <Container>
      <Header>
        <div>
          <Title theme={theme}>
            <FaFileExcel /> Nhập câu hỏi từ Excel
          </Title>
          <Subtitle theme={theme}>Nhập hàng loạt câu hỏi từ file Excel vào hệ thống</Subtitle>
        </div>
        <Button onClick={handleGoBack} theme={theme}>
          <FaArrowLeft /> Quay lại
        </Button>
      </Header>
      
      <StepContainer theme={theme}>
        <Step active={true}>
          <StepTitle active={true} theme={theme}>Tải lên và nhập dữ liệu</StepTitle>
        </Step>
      </StepContainer>
      
      <Card theme={theme}>
        <CardHeader theme={theme}>
          <CardTitle theme={theme}>
            <FaUpload /> Tải lên file Excel và cấu hình
          </CardTitle>
        </CardHeader>
        <CardBody>
          {/* Subject and Chapter Selection */}
          <OptionsGrid>
            <FormGroup>
              <FormLabel theme={theme}>Môn học *</FormLabel>
              <FormSelect 
                theme={theme}
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
              >
                <option value="">-- Chọn môn học --</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </FormSelect>
            </FormGroup>
            
            <FormGroup>
              <FormLabel theme={theme}>Chương/bài</FormLabel>
              <FormSelect 
                theme={theme}
                value={chapterId}
                onChange={(e) => setChapterId(e.target.value)}
                disabled={!subjectId || chapters.length === 0}
              >
                <option value="">-- Chọn chương --</option>
                {chapters.map(chapter => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.name}
                  </option>
                ))}
              </FormSelect>
            </FormGroup>
            
            <FormGroup>
              <FormLabel theme={theme}>Mức độ mặc định</FormLabel>
              <FormSelect 
                theme={theme}
                value={levelId}
                onChange={(e) => setLevelId(e.target.value)}
              >
                <option value="">-- Chọn mức độ --</option>
                {levels.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </FormSelect>
            </FormGroup>
          </OptionsGrid>
          
          {/* Advanced Options */}
          <Card theme={theme} style={{ marginBottom: '1.5rem' }}>
            <CardHeader theme={theme}>
              <CardTitle theme={theme}>
                <FaCog /> Tùy chọn nhập
              </CardTitle>
            </CardHeader>
            <CardBody>
              <OptionsGrid>
                <FormCheckbox theme={theme}>
                  <input
                    type="checkbox"
                    id="overrideExisting"
                    checked={overrideExisting}
                    onChange={(e) => setOverrideExisting(e.target.checked)}
                    aria-label="Ghi đè câu hỏi hiện có"
                  />
                  <label htmlFor="overrideExisting">Ghi đè câu hỏi hiện có</label>
                </FormCheckbox>
                
                <FormCheckbox theme={theme}>
                  <input
                    type="checkbox"
                    id="continueOnError"
                    checked={continueOnError}
                    onChange={(e) => setContinueOnError(e.target.checked)}
                  />
                  <label htmlFor="continueOnError">Tiếp tục khi gặp lỗi</label>
                </FormCheckbox>
                
                <FormGroup>
                  <FormLabel theme={theme}>Kích thước lô</FormLabel>
                  <FormSelect 
                    theme={theme}
                    value={batchSize}
                    onChange={(e) => setBatchSize(Number(e.target.value))}
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                  </FormSelect>
                </FormGroup>
              </OptionsGrid>
            </CardBody>
          </Card>
          
          {/* File Upload Zone */}
          <UploadZone 
            theme={theme}
            isDragActive={isDragActive}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
          >
            <UploadIcon theme={theme} />
            {file ? (
              <>
                <UploadText theme={theme}>
                  Đã chọn: {file.name}
                </UploadText>
                <UploadSubtext theme={theme}>
                  Click để chọn file khác
                </UploadSubtext>
              </>
            ) : (
              <>
                <UploadText theme={theme}>
                  Kéo và thả file Excel hoặc click để chọn file
                </UploadText>
                <UploadSubtext theme={theme}>
                  Hỗ trợ file .xlsx, .xls
                </UploadSubtext>
              </>
            )}
            
            <FileInput 
              type="file" 
              ref={fileInputRef}
              accept=".xlsx,.xls"
              onChange={handleFileInputChange}
            />
          </UploadZone>
          
          {/* Import Results (shown after import) */}
          {importResults && (
            <Summary theme={theme} style={{ marginTop: '1.5rem' }}>
              <SummaryTitle theme={theme}>Kết quả nhập câu hỏi</SummaryTitle>
              <SummaryRow theme={theme}>
                <SummaryLabel theme={theme}>Thời gian xử lý</SummaryLabel>
                <SummaryValue theme={theme}>{importResults.processingTime}ms</SummaryValue>
              </SummaryRow>
              <SummaryRow theme={theme}>
                <SummaryLabel theme={theme}>Tổng số câu hỏi</SummaryLabel>
                <SummaryValue theme={theme}>{importResults.data?.totalProcessed || 0}</SummaryValue>
              </SummaryRow>
              <SummaryRow theme={theme}>
                <SummaryLabel theme={theme}>Đã nhập thành công</SummaryLabel>
                <SummaryValue theme={theme}>{importResults.data?.successCount || 0}</SummaryValue>
              </SummaryRow>
              <SummaryRow theme={theme}>
                <SummaryLabel theme={theme}>Câu hỏi mới</SummaryLabel>
                <SummaryValue theme={theme}>{importResults.data?.newQuestions || 0}</SummaryValue>
              </SummaryRow>
              <SummaryRow theme={theme}>
                <SummaryLabel theme={theme}>Câu hỏi cập nhật</SummaryLabel>
                <SummaryValue theme={theme}>{importResults.data?.updatedQuestions || 0}</SummaryValue>
              </SummaryRow>
              <SummaryRow theme={theme}>
                <SummaryLabel theme={theme}>Không nhập được</SummaryLabel>
                <SummaryValue theme={theme}>{importResults.data?.failedCount || 0}</SummaryValue>
              </SummaryRow>
              <SummaryRow theme={theme}>
                <SummaryLabel theme={theme}>Cảnh báo</SummaryLabel>
                <SummaryValue theme={theme}>{importResults.data?.warningCount || 0}</SummaryValue>
              </SummaryRow>
              
              <SummaryResult success={importResults.success} theme={theme}>
                {importResults.success 
                  ? <><FaCheck /> {importResults.message}</> 
                  : <><FaTimes /> {importResults.message}</>}
              </SummaryResult>
              
              {importResults.data?.warnings && importResults.data.warnings.length > 0 && (
                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: theme === 'dark' ? 'rgba(246, 173, 85, 0.1)' : 'rgba(246, 173, 85, 0.05)', borderRadius: '0.375rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <FaExclamationTriangle style={{ color: '#ed8936' }} />
                    <span style={{ fontWeight: 500 }}>Cảnh báo:</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {importResults.data.warnings.slice(0, 10).map((warning, index) => (
                      <li key={index} style={{ color: theme === 'dark' ? '#f6ad55' : '#dd6b20', marginBottom: '0.25rem' }}>
                        Dòng {warning.row}: {warning.message}
                      </li>
                    ))}
                    {importResults.data.warnings.length > 10 && (
                      <li style={{ color: theme === 'dark' ? '#f6ad55' : '#dd6b20' }}>
                        ...và {importResults.data.warnings.length - 10} cảnh báo khác
                      </li>
                    )}
                  </ul>
                </div>
              )}
              
              {importResults.data?.errors && importResults.data.errors.length > 0 && (
                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: theme === 'dark' ? 'rgba(245, 101, 101, 0.1)' : 'rgba(245, 101, 101, 0.05)', borderRadius: '0.375rem', borderLeft: '4px solid #e53e3e' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <FaTimes style={{ color: '#e53e3e' }} />
                    <span style={{ fontWeight: 500 }}>Lỗi:</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {importResults.data.errors.map((error, index) => (
                      <li key={index} style={{ color: theme === 'dark' ? '#fc8181' : '#e53e3e', marginBottom: '0.25rem' }}>
                        Dòng {error.row}: {error.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Summary>
          )}
          
          {importing && (
            <ImportProgress style={{ marginTop: '1.5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <LoadingSpinner size={48} />
                <p style={{ marginTop: '1rem' }}>Đang nhập câu hỏi vào hệ thống...</p>
              </div>
              <ProgressBar progress={importProgress} theme={theme} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <span>0%</span>
                <span>{importProgress}%</span>
                <span>100%</span>
              </div>
            </ImportProgress>
          )}
          
          <InfoBox theme={theme}>
            <InfoTitle theme={theme}>
              <FaInfoCircle /> Hướng dẫn nhập câu hỏi
            </InfoTitle>
            <InfoList theme={theme}>
              <li>File Excel phải theo định dạng mẫu, với các cột: Nội dung câu hỏi, Đáp án A, Đáp án B, Đáp án C, Đáp án D, Đáp án đúng, Giải thích</li>
              <li>Các trường bắt buộc: Nội dung câu hỏi, Đáp án A, Đáp án B, Đáp án đúng</li>
              <li>Đáp án đúng phải là một trong các giá trị: A, B, C, D</li>
              <li>Chọn môn học bắt buộc, chương và mức độ có thể bỏ trống</li>
            </InfoList>
            <div style={{ marginTop: '1rem' }}>
              <TemplateLink href="#" onClick={handleDownloadTemplate}>
                <FaDownload /> Tải file mẫu
              </TemplateLink>
            </div>
          </InfoBox>
        </CardBody>
        <CardFooter theme={theme}>
          {!importResults ? (
            <>
              <Button theme={theme} onClick={handleGoBack}>
                <FaTimes /> Hủy
              </Button>
              <Button 
                primary 
                onClick={handleImport}
                disabled={!file || !subjectId || importing}
              >
                <FaSave /> Nhập dữ liệu
              </Button>
            </>
          ) : (
            <>
              <Button theme={theme} onClick={handleRestart}>
                <FaUpload /> Nhập file khác
              </Button>
              <Button primary onClick={handleGoBack}>
                <FaCheck /> Xong
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </Container>
  );
};

export default ImportQuestionsExcel;