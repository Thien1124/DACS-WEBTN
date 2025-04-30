import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import apiClient from '../../services/apiClient';
import { toast } from 'react-toastify';
import { getAllSubjectsNoPaging } from '../../services/subjectService';

// Reusing the same styled components from CreateQuestion.jsx
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: #343a40;
    font-weight: 600;
  }
  
  p {
    color: #6c757d;
    font-size: 1.1rem;
  }
`;

const StyledCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-color: #fff;
  background-clip: border-box;
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
  }
`;

const StyledCardHeader = styled.div`
  padding: 1.25rem 1.5rem;
  margin-bottom: 0;
  background-color: #fff;
  border-bottom: 1px solid #e9ecef;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  font-weight: 600;
  color: #343a40;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledCardBody = styled.div`
  flex: 1 1 auto;
  min-height: 1px;
  padding: 1.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.05);
  
  p {
    margin-top: 1rem;
    color: #4a5568;
    font-size: 1.1rem;
  }
`;

const StyledInput = styled.input`
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  transition: all 0.2s ease-in-out;
  
  &:focus {
    color: #495057;
    background-color: #fff;
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
  }
  
  ${props => props.isInvalid && `
    border-color: #dc3545;
    &:focus {
      box-shadow: 0 0 0 0.2rem rgba(220,53,69,0.25);
    }
  `}
`;

const StyledTextArea = styled.textarea`
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  transition: all 0.2s ease-in-out;
  
  &:focus {
    color: #495057;
    background-color: #fff;
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
  }
`;

const StyledSelect = styled.select`
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 16px 12px;
  transition: all 0.2s ease-in-out;
  
  &:focus {
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
  }
  
  ${props => props.isInvalid && `
    border-color: #dc3545;
    &:focus {
      box-shadow: 0 0 0 0.2rem rgba(220,53,69,0.25);
    }
  `}
`;

const StyledLabel = styled.label`
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
  color: #343a40;
  font-size: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const StyledButton = styled.button`
  display: inline-block;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.375rem;
  transition: all 0.15s ease-in-out;
  
  &:focus {
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
  }
  
  ${props => props.primary && `
    color: #fff;
    background-color: #007bff;
    border-color: #007bff;
    &:hover {
      background-color: #0069d9;
      border-color: #0062cc;
    }
  `}
  
  ${props => props.secondary && `
    color: #fff;
    background-color: #6c757d;
    border-color: #6c757d;
    &:hover {
      background-color: #5a6268;
      border-color: #545b62;
    }
  `}
  
  ${props => props.outline && `
    background-color: transparent;
    border-color: ${props.outline === 'primary' ? '#007bff' : '#6c757d'};
    color: ${props.outline === 'primary' ? '#007bff' : '#6c757d'};
    &:hover {
      background-color: ${props.outline === 'primary' ? '#007bff' : '#6c757d'};
      color: white;
    }
  `}
  
  ${props => props.small && `
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    line-height: 1.5;
    border-radius: 0.25rem;
  `}
  
  ${props => props.disabled && `
    opacity: 0.65;
    pointer-events: none;
  `}
`;

const OptionCard = styled(StyledCard)`
  margin-bottom: 1.5rem;
  border-left: ${props => props.isCorrect ? '4px solid #28a745' : '4px solid transparent'};
  
  &:hover {
    border-left: ${props => props.isCorrect ? '4px solid #28a745' : '4px solid #e9ecef'};
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
`;

const StyledSpinner = styled.span`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 0.2em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-border 0.75s linear infinite;
  margin-right: 0.5rem;
  
  @keyframes spinner-border {
    to { transform: rotate(360deg); }
  }
`;

const InvalidFeedback = styled.div`
  width: 100%;
  margin-top: 0.5rem;
  font-size: 85%;
  color: #dc3545;
`;

const StyledAlert = styled.div`
  position: relative;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  border: 0;
  border-radius: 0.375rem;
  
  ${props => props.danger && `
    color: #721c24;
    background-color: #f8d7da;
    border-left: 4px solid #dc3545;
  `}
  
  ${props => props.warning && `
    color: #856404;
    background-color: #fff3cd;
    border-left: 4px solid #ffc107;
  `}
  
  ${props => props.success && `
    color: #155724;
    background-color: #d4edda;
    border-left: 4px solid #28a745;
  `}
`;

const StyledBadge = styled.span`
  display: inline-block;
  padding: 0.35em 0.65em;
  font-size: 85%;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.375rem;
  
  ${props => props.success && `
    color: #fff;
    background-color: #28a745;
  `}
  
  ${props => props.primary && `
    color: #fff;
    background-color: #007bff;
  `}
  
  ${props => props.secondary && `
    color: #fff;
    background-color: #6c757d;
  `}
`;

const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-right: -0.75rem;
  margin-left: -0.75rem;
`;


const FormCol = styled.div`
  position: relative;
  width: 100%;
  padding-right: 0.75rem;
  padding-left: 0.75rem;
  
  @media (min-width: 768px) {
    flex: 0 0 ${props => props.md ? `${(props.md / 12) * 100}%` : '100%'};
    max-width: ${props => props.md ? `${(props.md / 12) * 100}%` : '100%'};
  }
`;

const StyledCheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.15s ease-in-out;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  input {
    margin-right: 0.75rem;
    margin-top: 0.25rem;
  }
  
  .label-content {
    flex: 1;
    
    .form-check-label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.25rem;
    }
    
    small {
      display: block;
      color: #6c757d;
    }
  }
`;
const StyledRange = styled.input.attrs({ type: 'range' })`
  -webkit-appearance: none;
  width: 100%;
  height: 0.5rem;
  border-radius: 0.25rem;
  background: #e9ecef;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background: #007bff;
    cursor: pointer;
    transition: background 0.15s ease-in-out;
    
    &:hover {
      background: #0069d9;
    }
  }
  
  &::-moz-range-thumb {
    width: 1.25rem;
    height: 1.25rem;
    border: 0;
    border-radius: 50%;
    background: #007bff;
    cursor: pointer;
    transition: background 0.15s ease-in-out;
    
    &:hover {
      background: #0069d9;
    }
  }
`;

const RangeValueDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  
  .current-value {
    color: #007bff;
    font-weight: 500;
  }
`;

// Define your components with the styled components
const Card = StyledCard;
const CardHeader = StyledCardHeader;
const CardBody = StyledCardBody;
const Button = StyledButton;
const Spinner = StyledSpinner;

// The actual component implementation starts here
const EditQuestion = () => {
  // Get parameters from URL
  const params = useParams();
  const navigate = useNavigate();
  
  // Extract parameters with fallbacks to different URL parameter formats
  const urlQuestionId = params.questionId || params.id;
  const examId = params.examId;
  
  // Convert to a number if possible
  const questionId = urlQuestionId ? (isNaN(Number(urlQuestionId)) ? urlQuestionId : Number(urlQuestionId)) : null;
  
  console.log('URL Params:', params);
  console.log('Question ID from URL:', urlQuestionId, 'Converted ID:', questionId);
  
  // Debug info
  const [debugInfo, setDebugInfo] = useState({
    apiStatus: 'pending',
    attempts: 0,
    lastError: null,
    urlParams: params
  });
  
  // Immediately set initial loading state to false
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false); // Changed from true to false
  const [questionLoadError, setQuestionLoadError] = useState(null);
  
  const [subjects, setSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [subjectsError, setSubjectsError] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  
  // State for loading the question being edited
  
  const [questionLevels] = useState([
    { id: 1, name: "Dễ" },
    { id: 2, name: "Trung bình" },
    { id: 3, name: "Khó" }
  ]);

  // Form data - initialized with empty defaults, will be populated when question data is loaded
  const [questionData, setQuestionData] = useState({
    content: '',
    explanation: '',
    subjectId: '',
    chapterId: '',
    questionLevelId: '2',
    questionType: '1', 
    tags: '',
    suggestedTime: 60,
    defaultScore: 1,
    isActive: true,
    scoringConfig: '',
    shortAnswerConfig: '',
    options: [
      { 
        content: '', 
        isCorrect: true, 
        orderIndex: 1,
        label: 'A',
        explanation: '',
        matchingValue: '',
        isPartOfTrueFalseGroup: false,
        groupId: 0,
        scorePercentage: 100
      },
      { 
        content: '', 
        isCorrect: false, 
        orderIndex: 2,
        label: 'B',
        explanation: '',
        matchingValue: '',
        isPartOfTrueFalseGroup: false,
        groupId: 0,
        scorePercentage: 0
      },
      { 
        content: '', 
        isCorrect: false, 
        orderIndex: 3,
        label: 'C',
        explanation: '',
        matchingValue: '',
        isPartOfTrueFalseGroup: false,
        groupId: 0,
        scorePercentage: 0
      },
      { 
        content: '', 
        isCorrect: false, 
        orderIndex: 4,
        label: 'D',
        explanation: '',
        matchingValue: '',
        isPartOfTrueFalseGroup: false,
        groupId: 0,
        scorePercentage: 0
      }
    ]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [showScoringConfig, setShowScoringConfig] = useState(false);
  const [showShortAnswerConfig, setShowShortAnswerConfig] = useState(false);
  
  // Initialize with proper configs
  const [scoringConfig, setScoringConfig] = useState({
    "1_correct": 0.25,
    "2_correct": 0.50,
    "3_correct": 0.75,
    "4_correct": 1.00
  });
  
  const [shortAnswerConfig, setShortAnswerConfig] = useState({
    "case_sensitive": false,
    "exact_match": false,
    "partial_credit": true,
    "partial_credit_percent": 50,
    "allow_similar": true,
    "similarity_threshold": 80
  });
  
  // Define processQuestionData BEFORE it's used in any useEffect hooks
  const processQuestionData = (data) => {
    if (!data) {
      setQuestionLoadError('Không nhận được dữ liệu');
      return;
    }
    
    console.log('Processing question data:', data);
    
    try {
      // Process scoring config
      try {
        if (data.scoringConfig) {
          const config = typeof data.scoringConfig === 'string' 
            ? JSON.parse(data.scoringConfig)
            : data.scoringConfig;
          setScoringConfig(config);
        }
      } catch (e) {
        console.error('Error parsing scoring config:', e);
      }
      
      // Process short answer config
      try {
        if (data.shortAnswerConfig) {
          const config = typeof data.shortAnswerConfig === 'string'
            ? JSON.parse(data.shortAnswerConfig)
            : data.shortAnswerConfig;
          setShortAnswerConfig(config);
        }
      } catch (e) {
        console.error('Error parsing short answer config:', e);
      }
      
      // Process options
      const processedOptions = Array.isArray(data.options) 
        ? data.options.map((opt, idx) => ({
            id: opt.id,
            content: opt.content || '',
            isCorrect: opt.isCorrect === true,
            orderIndex: opt.orderIndex || (idx + 1),
            label: opt.label || String.fromCharCode(65 + idx),
            explanation: opt.explanation || '',
            matchingValue: opt.matchingValue || '',
            isPartOfTrueFalseGroup: opt.isPartOfTrueFalseGroup === true,
            groupId: opt.groupId || 0,
            scorePercentage: parseInt(opt.scorePercentage || (opt.isCorrect ? 100 : 0), 10)
          }))
        : [];
      
      // Set question data
      setQuestionData({
        id: data.id,
        content: data.content || '',
        explanation: data.explanation || '',
        subjectId: data.subjectId?.toString() || '',
        chapterId: data.chapterId?.toString() || '',
        questionLevelId: data.questionLevelId?.toString() || '2',
        questionType: data.questionType?.toString() || '1',
        tags: data.tags || '',
        suggestedTime: data.suggestedTime || 60,
        defaultScore: data.defaultScore || 1,
        isActive: data.isActive !== false,
        scoringConfig: data.scoringConfig || '',
        shortAnswerConfig: data.shortAnswerConfig || '',
        options: processedOptions.length > 0 ? processedOptions : [
          { 
            content: '', 
            isCorrect: true, 
            orderIndex: 1,
            label: 'A',
            explanation: '',
            matchingValue: '',
            isPartOfTrueFalseGroup: false,
            groupId: 0,
            scorePercentage: 100
          },
          { 
            content: '', 
            isCorrect: false, 
            orderIndex: 2,
            label: 'B',
            explanation: '',
            matchingValue: '',
            isPartOfTrueFalseGroup: false,
            groupId: 0,
            scorePercentage: 0
          }
        ]
      });
      
      // Set visibility for config sections
      const questionType = parseInt(data.questionType || '1', 10);
      setShowScoringConfig(questionType === 2);
      setShowShortAnswerConfig(questionType === 3);
      
      // Update debug info
      setDebugInfo(prev => ({
        ...prev,
        apiStatus: 'success',
        lastSuccessTime: new Date().toISOString(),
      }));
      
      toast.success('Đã tải câu hỏi thành công!');
    } catch (error) {
      console.error('Error processing question data:', error);
      setQuestionLoadError(`Lỗi xử lý dữ liệu: ${error.message}`);
      
      setDebugInfo(prev => ({
        ...prev,
        apiStatus: 'error',
        lastError: error.message,
      }));
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  // Try all possible API endpoints to get question data
  const tryMultipleEndpoints = async () => {
    setIsLoadingQuestion(true);
    setQuestionLoadError(null);
    
    setDebugInfo(prev => ({
      ...prev,
      attempts: prev.attempts + 1,
      apiStatus: 'loading',
    }));
    
    if (!questionId) {
      setQuestionLoadError('Không có ID câu hỏi');
      setIsLoadingQuestion(false);
      return;
    }
    
    // Log the questionId to check if it's valid
    console.log(`Attempting to load question ID: ${questionId}`);
    
    // Define multiple endpoints to try
    const endpoints = [
      `/api/Question/${questionId}`,
      `/api/Questions/${questionId}`,
      `/api/question/${questionId}`,
      `/api/questions/${questionId}`,
      `/api/v1/Question/${questionId}`,
    ];
    
    let succeeded = false;
    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const response = await apiClient.get(endpoint);
        
        if (response.data) {
          console.log(`Success with endpoint: ${endpoint}`, response.data);
          processQuestionData(response.data);
          succeeded = true;
          break;
        }
      } catch (error) {
        console.error(`Failed with endpoint ${endpoint}:`, error);
        lastError = error;
      }
    }
    
    if (!succeeded) {
      console.error('All endpoints failed:', lastError);
      setQuestionLoadError(`Không thể tải câu hỏi từ bất kỳ API nào: ${lastError?.message || 'Unknown error'}`);
      setIsLoadingQuestion(false);
      
      setDebugInfo(prev => ({
        ...prev,
        apiStatus: 'error',
        lastError: lastError?.message,
      }));
    }
  };

  // Load question data on component mount
  useEffect(() => {
    tryMultipleEndpoints();
  }, [questionId]);

  // Load subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoadingSubjects(true);
        setSubjectsError(null);
        
        console.log('Fetching subjects...');
        const data = await getAllSubjectsNoPaging();
        console.log('Subjects API response:', data);
        
        // Handle different response formats
        let subjectsArray = [];
        
        if (Array.isArray(data)) {
          subjectsArray = data;
        } else if (data && Array.isArray(data.data)) {
          subjectsArray = data.data;
        } else if (data && Array.isArray(data.items)) {
          subjectsArray = data.items;
        }
        
        console.log(`Processed ${subjectsArray.length} subjects`);
        
        if (subjectsArray.length > 0) {
          setSubjects(subjectsArray);
          
          if (!questionData.subjectId) {
            setQuestionData(prev => ({
              ...prev,
              subjectId: subjectsArray[0].id.toString()
            }));
          }
        } else {
          setSubjectsError('Không lấy được danh sách môn học');
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
        setSubjectsError('Không tải được danh sách môn học');
      } finally {
        setIsLoadingSubjects(false);
      }
    };
    
    fetchSubjects();
  }, []);

  // Load chapters when subject changes
  useEffect(() => {
    const fetchChapters = async () => {
      if (!questionData.subjectId) {
        setChapters([]);
        return;
      }

      try {
        setIsLoadingChapters(true);
        
        console.log(`Đang tải danh sách chương cho môn học ID: ${questionData.subjectId}`);
        
        // Try multiple API endpoint patterns
        const endpoints = [
          { url: `/api/Chapter/BySubject/${questionData.subjectId}`, params: {} },
          { 
            url: `/api/Chapter`, 
            params: {
              subjectId: questionData.subjectId,
              page: 1,
              pageSize: 100,
              includeInactive: false
            } 
          },
          { url: `/api/Chapter/by-subject/${questionData.subjectId}`, params: {} },
          { url: `/api/chapter/by-subject/${questionData.subjectId}`, params: {} },
          { url: `/api/subjects/${questionData.subjectId}/chapters`, params: {} }
        ];
        
        let response = null;
        let error = null;
        
        // Try each endpoint until success
        for (const endpoint of endpoints) {
          try {
            console.log(`Thử tải chương với endpoint: ${endpoint.url}`, endpoint.params);
            response = await apiClient.get(endpoint.url, { params: endpoint.params });
            console.log(`Thành công với endpoint: ${endpoint.url}`, response.data);
            break; // Exit the loop on success
          } catch (err) {
            console.log(`Thất bại với endpoint ${endpoint.url}:`, err.message);
            error = err;
            // Continue to the next endpoint
          }
        }
        
        if (!response && error) {
          throw error;
        }
        
        let chaptersData = [];
        
        // Process different response formats
        if (response.data?.items && Array.isArray(response.data.items)) {
          console.log('Trích xuất từ response.data.items', response.data.items.length);
          chaptersData = response.data.items;
        } else if (Array.isArray(response.data)) {
          console.log('Response là một mảng trực tiếp', response.data.length);
          chaptersData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          console.log('Trích xuất từ response.data.data', response.data.data.length);
          chaptersData = response.data.data;
        } else if (response.data && typeof response.data === 'object') {
          // Find any property that is an array within the object
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              console.log(`Tìm thấy mảng trong thuộc tính: ${key}`, response.data[key].length);
              chaptersData = response.data[key];
              break;
            }
          }
        }
        
        console.log('Dữ liệu chương đã xử lý:', chaptersData);
        setChapters(chaptersData || []);
        
        if (chaptersData.length === 0) {
          console.warn('Không tìm thấy chương nào cho môn học này.');
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách chương:', error);
        setChapters([]);
      } finally {
        setIsLoadingChapters(false);
      }
    };

    fetchChapters();
  }, [questionData.subjectId]);

  // Handle question type change
  useEffect(() => {
    const type = parseInt(questionData.questionType);
    let updatedOptions = [...questionData.options];

    if (type === 1) {
      // For single-choice, ensure we have 4 options with one correct
      updatedOptions = questionData.options.map((opt, idx) => ({
        ...opt,
        isCorrect: idx === 0 ? true : opt.isCorrect, // Preserve existing correct options, default to first if none
        isPartOfTrueFalseGroup: false,
        groupId: 0
      }));
      
      // If no option is marked as correct, make the first one correct
      if (!updatedOptions.some(opt => opt.isCorrect)) {
        updatedOptions[0].isCorrect = true;
        updatedOptions[0].scorePercentage = 100;
      }
      
      // Ensure we have at least 4 options
      while (updatedOptions.length < 4) {
        updatedOptions.push({
          content: '',
          isCorrect: false,
          orderIndex: updatedOptions.length + 1,
          label: String.fromCharCode(65 + updatedOptions.length), // A, B, C, D...
          explanation: '',
          matchingValue: '',
          isPartOfTrueFalseGroup: false,
          groupId: 0,
          scorePercentage: 0
        });
      }
      
      setShowScoringConfig(false);
      setShowShortAnswerConfig(false);
    } else if (type === 2) {
      // For true/false items, set appropriate values
      updatedOptions = questionData.options.map((opt, idx) => ({
        ...opt,
        isPartOfTrueFalseGroup: true,
        groupId: idx + 1, // Each statement gets its own group ID
        scorePercentage: opt.isCorrect ? 25 : 0 // Equal distribution for correct statements
      }));
      
      setShowScoringConfig(true);
      setShowShortAnswerConfig(false);
    } else if (type === 3) {
      // For short answer
      updatedOptions = questionData.options.map(opt => ({
        ...opt,
        isPartOfTrueFalseGroup: false,
        groupId: 0,
        scorePercentage: opt.isCorrect ? (opt.scorePercentage || 100) : 0
      }));
      
      setShowScoringConfig(false);
      setShowShortAnswerConfig(true);
    }

    setQuestionData(prev => ({
      ...prev,
      options: updatedOptions
    }));
  }, [questionData.questionType]);

  // Form input handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuestionData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...questionData.options];
    updatedOptions[index][field] = value;
    
    // If changing isCorrect in single-choice question
    if (field === 'isCorrect' && value === true && questionData.questionType === '1') {
      // Make all other options not correct
      updatedOptions.forEach((opt, idx) => {
        if (idx !== index) {
          opt.isCorrect = false;
          opt.scorePercentage = 0;
        } else {
          opt.scorePercentage = 100;
        }
      });
    }
    
    // For true/false questions, update scorePercentage
    if (questionData.questionType === '2' && field === 'isCorrect') {
      const correctCount = updatedOptions.filter(opt => opt.isCorrect).length;
      
      if (correctCount > 0) {
        // Distribute points evenly
        const pointsPerCorrect = 100 / correctCount;
        updatedOptions.forEach(opt => {
          if (opt.isCorrect) {
            opt.scorePercentage = pointsPerCorrect;
          } else {
            opt.scorePercentage = 0;
          }
        });
      }
    }
    
    // For short answer with score percentage
    if (questionData.questionType === '3' && field === 'scorePercentage') {
      updatedOptions[index].scorePercentage = parseInt(value, 10);
    }
    
    setQuestionData(prev => ({
      ...prev,
      options: updatedOptions
    }));
    
    // Clear option errors
    if (errors.options) {
      setErrors(prev => ({ ...prev, options: '' }));
    }
  };

  const addOption = () => {
    const newOptions = [...questionData.options];
    const newIndex = newOptions.length;
    
    newOptions.push({
      content: '',
      isCorrect: false,
      orderIndex: newIndex + 1,
      label: newIndex < 26 ? String.fromCharCode(65 + newIndex) : `Đáp án ${newIndex + 1}`,
      explanation: '',
      matchingValue: '',
      isPartOfTrueFalseGroup: questionData.questionType === '2',
      groupId: questionData.questionType === '2' ? 1 : 0,
      scorePercentage: 0
    });
    
    setQuestionData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const removeOption = (index) => {
    // Don't allow less than 2 options for multiple choice
    if (questionData.questionType === '1' && questionData.options.length <= 2) {
      toast.warning('Cần ít nhất 2 đáp án cho câu hỏi trắc nghiệm');
      return;
    }
    
    const updatedOptions = questionData.options.filter((_, idx) => idx !== index);
    
    // If we removed the correct option for single-choice, make the first option correct
    if (questionData.questionType === '1' && questionData.options[index].isCorrect) {
      updatedOptions[0].isCorrect = true;
      updatedOptions[0].scorePercentage = 100;
    }
    
    // Update labels and order indexes
    updatedOptions.forEach((opt, idx) => {
      opt.orderIndex = idx + 1;
      if (questionData.questionType === '1') {
        opt.label = String.fromCharCode(65 + idx);
      }
    });
    
    setQuestionData(prev => ({
      ...prev,
      options: updatedOptions
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!questionData.content.trim()) newErrors.content = 'Nội dung câu hỏi là bắt buộc';
    if (!questionData.subjectId) newErrors.subjectId = 'Vui lòng chọn môn học';
    if (!questionData.questionLevelId) newErrors.questionLevelId = 'Vui lòng chọn mức độ';
    
    // Options validation
    const type = parseInt(questionData.questionType);
    
    if (questionData.options.length === 0) {
      newErrors.options = 'Cần ít nhất một đáp án';
    } else if (type === 1) {
      // Single-choice requires at least 2 options and exactly 1 correct
      if (questionData.options.length < 2) {
        newErrors.options = 'Cần ít nhất 2 đáp án cho câu hỏi trắc nghiệm';
      }
      
      const correctCount = questionData.options.filter(opt => opt.isCorrect).length;
      if (correctCount !== 1) {
        newErrors.options = 'Câu hỏi trắc nghiệm một đáp án phải có đúng một đáp án đúng';
      }
      
      // Check for empty option content
      if (questionData.options.some(opt => !opt.content.trim())) {
        newErrors.options = 'Tất cả đáp án phải có nội dung';
      }
    } else if (type === 2) {
      // True-false items
      if (questionData.options.some(opt => !opt.content.trim())) {
        newErrors.options = 'Tất cả mệnh đề phải có nội dung';
      }
    } else if (type === 3) {
      // Short answer needs at least one correct answer
      const correctCount = questionData.options.filter(opt => opt.isCorrect).length;
      if (correctCount === 0) {
        newErrors.options = 'Câu hỏi tự luận cần ít nhất một đáp án đúng';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại biểu mẫu');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const questionType = parseInt(questionData.questionType, 10);
      
      const payload = {
        id: parseInt(questionId, 10),
        model: "Question",
        content: questionData.content,
        explanation: questionData.explanation || '',
        subjectId: parseInt(questionData.subjectId, 10),
        chapterId: questionData.chapterId ? parseInt(questionData.chapterId, 10) : null,
        questionLevelId: parseInt(questionData.questionLevelId, 10),
        questionType: parseInt(questionData.questionType, 10), 
        tags: questionData.tags || '',
        suggestedTime: parseInt(questionData.suggestedTime, 10) || 60,
        defaultScore: parseFloat(questionData.defaultScore) || 1,
        isActive: questionData.isActive === true,
        // Thêm các trường bắt buộc theo lỗi API
        scoringConfig: JSON.stringify(scoringConfig),
        shortAnswerConfig: JSON.stringify(shortAnswerConfig),
        options: questionData.options.map((opt, idx) => ({
          id: opt.id, 
          content: opt.content,
          isCorrect: opt.isCorrect, 
          orderIndex: idx + 1,
          label: parseInt(questionData.questionType) === 1 ? String.fromCharCode(65 + idx) : opt.label || '',
          explanation: opt.explanation || '',
          matchingValue: opt.matchingValue || '',
          isPartOfTrueFalseGroup: parseInt(questionData.questionType) === 2,
          groupId: parseInt(questionData.questionType) === 2 ? idx + 1 : 0,
          scorePercentage: parseInt(opt.scorePercentage || (opt.isCorrect ? 100 : 0), 10)
        }))
      };
      
      console.log('Sending update payload:', payload);
      
      // Log request details for debugging
      console.log(`PUT request to: /api/Question/${questionId}`);
      
      // Use PUT to update
      const response = await apiClient.put(`/api/Question/${questionId}`, payload);
      console.log('Update response:', response);
      
      toast.success('Cập nhật câu hỏi thành công!');
      
      // Navigate back
      if (examId) {
        navigate(`/admin/exams/${examId}/questions`);
      } else {
        navigate('/admin/questions');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      
      let errorMessage = 'Không thể cập nhật câu hỏi.';
      
      if (error.response) {
        console.log('Error response data:', error.response.data);
        
        // Handle structured validation errors
        if (error.response.data && error.response.data.errors) {
          const validationErrors = error.response.data.errors;
          const errorMessages = [];
          
          for (const field in validationErrors) {
            errorMessages.push(`${field}: ${validationErrors[field].join(', ')}`);
          }
          
          errorMessage = `Lỗi validation: ${errorMessages.join('; ')}`;
        } else if (error.response.data && error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else {
          errorMessage = `Lỗi ${error.response.status}: ${error.response.statusText}`;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScoringConfigChange = (field, value) => {
    setScoringConfig(prev => ({
      ...prev,
      [field]: parseFloat(value)
    }));
  };

  const handleShortAnswerConfigChange = (field, value) => {
    const processedValue = typeof value === 'boolean' ? value : 
                          field.includes('threshold') || field.includes('percent') ? 
                          parseInt(value, 10) : value;
                          
    setShortAnswerConfig(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  const handleCancel = () => {
    // Quay lại trang trước
    if (examId) {
      navigate(`/admin/exams/${examId}/questions`);
    } else {
      navigate('/admin/questions');
    }
  };

  // Render error state for question loading
  if (questionLoadError) {
    return (
      <PageContainer>
        <PageHeader>
          <h1>Chỉnh Sửa Câu Hỏi</h1>
          {examId && <p>Chỉnh sửa câu hỏi trong đề thi ID: {examId}</p>}
        </PageHeader>
        
        <StyledAlert danger>
          <p>{questionLoadError}</p>
          <Button 
            outline="primary"
            small 
            onClick={tryMultipleEndpoints}
          >
            Tải lại câu hỏi
          </Button>
        </StyledAlert>
        
        <FormActions>
          <Button 
            type="button" 
            secondary
            onClick={handleCancel}
          >
            <i className="fas fa-arrow-left mr-1"></i> Quay lại
          </Button>
        </FormActions>
      </PageContainer>
    );
  }

  // Update the error display to include this initialization option
  if (questionLoadError) {
    return (
      <PageContainer>
        <PageHeader>
          <h1>Chỉnh Sửa Câu Hỏi</h1>
          <p>ID: {questionId}{examId && ` | Đề thi ID: ${examId}`}</p>
        </PageHeader>
        
        <StyledAlert danger>
          <h4>Không thể tải câu hỏi</h4>
          <p>{questionLoadError}</p>
          <div>
            <Button 
              outline="primary" 
              onClick={tryMultipleEndpoints}
              style={{marginRight: "10px"}}
            >
              <i className="fas fa-sync-alt mr-1"></i> Thử lại
            </Button>
            
            
            <Button 
              outline="danger"
              onClick={() => navigate('/admin/questions')}
            >
              <i className="fas fa-arrow-left mr-1"></i> Quay lại danh sách
            </Button>
          </div>
        </StyledAlert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <h1>Chỉnh Sửa Câu Hỏi</h1>
        <p>ID: {questionId}{examId && ` | Đề thi ID: ${examId}`}</p>
      </PageHeader>
      
      {isLoadingSubjects ? (
        <LoadingContainer>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p>Đang tải danh sách môn học...</p>
        </LoadingContainer>
      )  : (
        <>
          <form onSubmit={handleUpdateQuestion}>
            <Card>
              <CardHeader>
                <StyledLabel htmlFor="questionType" className="form-label mb-0">Loại câu hỏi *</StyledLabel>
              </CardHeader>
              <CardBody>
                <FormGroup>
                  <StyledSelect 
                    id="questionType"
                    name="questionType"
                    value={questionData.questionType}
                    onChange={handleInputChange}
                    isInvalid={errors.questionType}
                    required
                  >
                    <option value="1">Một đáp án (trắc nghiệm a,b,c,d)</option>
                    <option value="2">Đúng-sai nhiều ý</option>
                    <option value="3">Trả lời ngắn</option>
                  </StyledSelect>
                  {errors.questionType && <InvalidFeedback>{errors.questionType}</InvalidFeedback>}
                </FormGroup>
                
                {/* Advanced Settings for different question types */}
                {showScoringConfig && (
                  <div className="p-3 mb-4 bg-light rounded">
                    <h5 className="mb-3">Cấu hình điểm cho câu hỏi đúng-sai nhiều ý</h5>
                    <small className="text-muted d-block mb-3">Điểm cho mỗi cấp độ đúng</small>
                    
                    <FormRow>
                      <FormCol md={3}>
                        <FormGroup>
                          <StyledLabel htmlFor="1_correct">Điểm khi đúng 1 mệnh đề</StyledLabel>
                          <div className="input-group">
                            <StyledInput
                              type="number"
                              id="1_correct"
                              value={scoringConfig["1_correct"]}
                              onChange={(e) => handleScoringConfigChange("1_correct", e.target.value)}
                              min="0"
                              max="1"
                              step="0.05"
                            />
                            <span className="input-group-text">/ 1.0</span>
                          </div>
                        </FormGroup>
                      </FormCol>
                      
                      <FormCol md={3}>
                        <FormGroup>
                          <StyledLabel htmlFor="2_correct">Điểm khi đúng 2 mệnh đề</StyledLabel>
                          <div className="input-group">
                            <StyledInput
                              type="number"
                              id="2_correct"
                              value={scoringConfig["2_correct"]}
                              onChange={(e) => handleScoringConfigChange("2_correct", e.target.value)}
                              min="0"
                              max="1"
                              step="0.05"
                            />
                            <span className="input-group-text">/ 1.0</span>
                          </div>
                        </FormGroup>
                      </FormCol>
                      
                      <FormCol md={3}>
                        <FormGroup>
                          <StyledLabel htmlFor="3_correct">Điểm khi đúng 3 mệnh đề</StyledLabel>
                          <div className="input-group">
                            <StyledInput
                              type="number"
                              id="3_correct"
                              value={scoringConfig["3_correct"]}
                              onChange={(e) => handleScoringConfigChange("3_correct", e.target.value)}
                              min="0"
                              max="1"
                              step="0.05"
                            />
                            <span className="input-group-text">/ 1.0</span>
                          </div>
                        </FormGroup>
                      </FormCol>
                      
                      <FormCol md={3}>
                        <FormGroup>
                          <StyledLabel htmlFor="4_correct">Điểm khi đúng 4 mệnh đề</StyledLabel>
                          <div className="input-group">
                            <StyledInput
                              type="number"
                              id="4_correct"
                              value={scoringConfig["4_correct"]}
                              onChange={(e) => handleScoringConfigChange("4_correct", e.target.value)}
                              min="0"
                              max="1"
                              step="0.05"
                            />
                            <span className="input-group-text">/ 1.0</span>
                          </div>
                        </FormGroup>
                      </FormCol>
                    </FormRow>
                  </div>
                )}

                {/* Short Answer Configuration */}
                {showShortAnswerConfig && (
                  <div className="p-3 mb-4 bg-light rounded">
                    <h5 className="mb-2">Cấu hình chấm điểm cho câu trả lời ngắn</h5>
                    <small className="text-muted d-block mb-3">Thiết lập cách đánh giá câu trả lời</small>
                    
                    <FormRow>
                      <FormCol md={4}>
                        <StyledCheckboxLabel>
                          <input
                            type="checkbox"
                            id="case_sensitive"
                            checked={shortAnswerConfig.case_sensitive}
                            onChange={(e) => handleShortAnswerConfigChange("case_sensitive", e.target.checked)}
                          />
                          <div className="label-content">
                            <span className="form-check-label">Phân biệt chữ hoa/thường</span>
                            <small>Nếu bật, "Hà Nội" và "hà nội" được xem là khác nhau</small>
                          </div>
                        </StyledCheckboxLabel>
                      </FormCol>
                      
                      <FormCol md={4}>
                        <StyledCheckboxLabel>
                          <input
                            type="checkbox"
                            id="exact_match"
                            checked={shortAnswerConfig.exact_match}
                            onChange={(e) => handleShortAnswerConfigChange("exact_match", e.target.checked)}
                          />
                          <div className="label-content">
                            <span className="form-check-label">Khớp chính xác</span>
                            <small>Chỉ đúng khi câu trả lời khớp hoàn toàn với đáp án</small>
                          </div>
                        </StyledCheckboxLabel>
                      </FormCol>
                      
                      <FormCol md={4}>
                        <StyledCheckboxLabel>
                          <input
                            type="checkbox"
                            id="partial_credit"
                            checked={shortAnswerConfig.partial_credit}
                            onChange={(e) => handleShortAnswerConfigChange("partial_credit", e.target.checked)}
                          />
                          <div className="label-content">
                            <span className="form-check-label">Cho điểm một phần</span>
                            <small>Cho phép tính điểm một phần dựa trên mức độ khớp</small>
                          </div>
                        </StyledCheckboxLabel>
                      </FormCol>
                    </FormRow>

                    {shortAnswerConfig.partial_credit && (
                      <FormRow className="mt-2">
                        <FormCol md={6}>
                          <FormGroup>
                            <StyledLabel htmlFor="partial_credit_percent">Phần trăm điểm tối thiểu (%)</StyledLabel>
                            <StyledRange
                              id="partial_credit_percent"
                              min="0"
                              max="100"
                              value={shortAnswerConfig.partial_credit_percent}
                              onChange={(e) => handleShortAnswerConfigChange("partial_credit_percent", e.target.value)}
                            />
                            <RangeValueDisplay>
                              <span>0%</span>
                              <span className="current-value">{shortAnswerConfig.partial_credit_percent}%</span>
                              <span>100%</span>
                            </RangeValueDisplay>
                          </FormGroup>
                        </FormCol>
                      </FormRow>
                    )}

                    <FormRow className="mt-3">
                      <FormCol md={6}>
                        <StyledCheckboxLabel>
                          <input
                            type="checkbox"
                            id="allow_similar"
                            checked={shortAnswerConfig.allow_similar}
                            onChange={(e) => handleShortAnswerConfigChange("allow_similar", e.target.checked)}
                          />
                          <div className="label-content">
                            <span className="form-check-label">Chấp nhận câu trả lời tương tự</span>
                            <small>Cho phép câu trả lời gần đúng (dựa trên ngưỡng tương đồng)</small>
                          </div>
                        </StyledCheckboxLabel>
                      </FormCol>
                      
                      {shortAnswerConfig.allow_similar && (
                        <FormCol md={6}>
                          <FormGroup>
                            <StyledLabel htmlFor="similarity_threshold">Ngưỡng tương đồng (%)</StyledLabel>
                            <StyledRange
                              id="similarity_threshold"
                              min="0"
                              max="100"
                              value={shortAnswerConfig.similarity_threshold}
                              onChange={(e) => handleShortAnswerConfigChange("similarity_threshold", e.target.value)}
                            />
                            <RangeValueDisplay>
                              <span>0%</span>
                              <span className="current-value">{shortAnswerConfig.similarity_threshold}%</span>
                              <span>100%</span>
                            </RangeValueDisplay>
                          </FormGroup>
                        </FormCol>
                      )}
                    </FormRow>
                  </div>
                )}
                
                {/* Question Content */}
                <FormGroup>
                  <StyledLabel htmlFor="content">Nội dung câu hỏi *</StyledLabel>
                  <StyledTextArea 
                    id="content"
                    name="content"
                    value={questionData.content}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Nhập nội dung câu hỏi"
                    required
                  ></StyledTextArea>
                  {errors.content && <InvalidFeedback>{errors.content}</InvalidFeedback>}
                </FormGroup>
                
                {/* Question Explanation */}
                <FormGroup>
                  <StyledLabel htmlFor="explanation">Giải thích câu hỏi</StyledLabel>
                  <StyledTextArea 
                    id="explanation"
                    name="explanation"
                    value={questionData.explanation}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Nhập giải thích cho câu hỏi (hiển thị sau khi làm bài)"
                  ></StyledTextArea>
                </FormGroup>
                
                {/* Subject and Chapter Selection */}
                <FormRow>
                  <FormCol md={6}>
                    <FormGroup>
                      <StyledLabel htmlFor="subjectId">Môn học *</StyledLabel>
                      <StyledSelect 
                        id="subjectId"
                        name="subjectId"
                        value={questionData.subjectId}
                        onChange={handleInputChange}
                        isInvalid={errors.subjectId}
                        required
                      >
                        <option value="">-- Chọn môn học --</option>
                        {subjects.map(subject => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </StyledSelect>
                      {errors.subjectId && <InvalidFeedback>{errors.subjectId}</InvalidFeedback>}
                    </FormGroup>
                  </FormCol>
                  <FormCol md={6}>
                    <FormGroup>
                      <StyledLabel htmlFor="chapterId">Chương</StyledLabel>
                      <StyledSelect 
                        id="chapterId"
                        name="chapterId"
                        value={questionData.chapterId}
                        onChange={handleInputChange}
                        disabled={isLoadingChapters || chapters.length === 0}
                        >
                        <option value="">-- Chọn chương --</option>
                        {chapters.map(chapter => (
                          <option key={chapter.id} value={chapter.id}>
                            {chapter.name}
                          </option>
                        ))}
                      </StyledSelect>
                    </FormGroup>
                  </FormCol>
                </FormRow>

                {/* Question Level and Tags */}
                <FormRow>
                  <FormCol md={6}>
                    <FormGroup>
                      <StyledLabel htmlFor="questionLevelId">Mức độ *</StyledLabel>
                      <StyledSelect 
                        id="questionLevelId"
                        name="questionLevelId"
                        value={questionData.questionLevelId}
                        onChange={handleInputChange}
                        isInvalid={errors.questionLevelId}
                        required
                      >
                        <option value="">-- Chọn mức độ --</option>
                        {questionLevels.map(level => (
                          <option key={level.id} value={level.id}>
                            {level.name}
                          </option>
                        ))}
                      </StyledSelect>
                      {errors.questionLevelId && <InvalidFeedback>{errors.questionLevelId}</InvalidFeedback>}
                    </FormGroup>
                  </FormCol>
                  <FormCol md={6}>
                    <FormGroup>
                      <StyledLabel htmlFor="tags">Thẻ đánh dấu</StyledLabel>
                      <StyledInput 
                        type="text"
                        id="tags"
                        name="tags"
                        value={questionData.tags}
                        onChange={handleInputChange}
                        placeholder="Thẻ đánh dấu (phân cách bởi dấu phẩy)"
                      />
                    </FormGroup>
                  </FormCol>
                </FormRow>

                {/* Score and Time Settings */}
                <FormRow>
                  <FormCol md={6}>
                    <FormGroup>
                      <StyledLabel htmlFor="defaultScore">Điểm mặc định</StyledLabel>
                      <StyledInput 
                        type="number"
                        id="defaultScore"
                        name="defaultScore"
                        value={questionData.defaultScore}
                        onChange={handleInputChange}
                        min="0.25"
                        step="0.25"
                      />
                    </FormGroup>
                  </FormCol>
                  <FormCol md={6}>
                    <FormGroup>
                      <StyledLabel htmlFor="suggestedTime">Thời gian đề xuất (giây)</StyledLabel>
                      <StyledInput 
                        type="number"
                        id="suggestedTime"
                        name="suggestedTime"
                        value={questionData.suggestedTime}
                        onChange={handleInputChange}
                        min="10"
                        step="5"
                      />
                    </FormGroup>
                  </FormCol>
                </FormRow>

                {/* Active Status */}
                <FormGroup>
                  <StyledCheckboxLabel>
                    <input 
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={questionData.isActive}
                      onChange={handleInputChange}
                    />
                    <div className="label-content">
                      <span className="form-check-label">Câu hỏi đang hoạt động</span>
                      <small>Chỉ câu hỏi đang hoạt động mới có thể được thêm vào đề thi</small>
                    </div>
                  </StyledCheckboxLabel>
                </FormGroup>
              </CardBody>
            </Card>
            
            {/* Options Section */}
            <Card>
              <CardHeader>
                <h4 className="mb-0">
                  Đáp án *
                  {questionData.questionType === '2' && (
                    <small className="ml-2 text-muted">(Chọn đúng/sai cho từng mệnh đề)</small>
                  )}
                </h4>
                <Button 
                  type="button"
                  small
                  outline="primary"
                  onClick={addOption}
                >
                  <i className="fas fa-plus mr-1"></i> 
                  {questionData.questionType === '2' ? 'Thêm mệnh đề' : 'Thêm đáp án'}
                </Button>
              </CardHeader>
              <CardBody>
                {errors.options && (
                  <StyledAlert danger>
                    <i className="fas fa-exclamation-circle mr-2"></i> {errors.options}
                  </StyledAlert>
                )}
                
                {questionData.options.map((option, index) => (
                  <OptionCard key={index} isCorrect={option.isCorrect}>
                    <CardBody>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          {questionData.questionType === '1' ? (
                            <StyledBadge className={option.isCorrect ? 'bg-success' : 'bg-secondary'}>
                              {option.label}
                            </StyledBadge>
                          ) : (
                            <StyledBadge primary>
                              {questionData.questionType === '2' ? `Mệnh đề ${index + 1}` : `Đáp án ${index + 1}`}
                            </StyledBadge>
                          )}
                          {option.isCorrect && (
                            <StyledBadge success className="ml-2">
                              <i className="fas fa-check mr-1"></i> Đúng
                            </StyledBadge>
                          )}
                        </div>
                        <Button 
                          type="button"
                          small
                          outline="danger"
                          onClick={() => removeOption(index)}
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </div>
                      
                      {/* Option Content */}
                      <FormGroup>
                        <StyledInput
                          type="text"
                          placeholder={`Nhập nội dung ${questionData.questionType === '2' ? 'mệnh đề' : 'đáp án'}`}
                          value={option.content}
                          onChange={(e) => handleOptionChange(index, 'content', e.target.value)}
                          required
                        />
                      </FormGroup>
                      
                      <FormRow>
                        <FormCol md={6}>
                          <StyledCheckboxLabel>
                            <input
                              type="checkbox"
                              checked={option.isCorrect}
                              onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                            />
                            <div className="label-content">
                              <span className="form-check-label">
                                {questionData.questionType === '2' ? 'Mệnh đề đúng' : 'Đáp án đúng'}
                              </span>
                            </div>
                          </StyledCheckboxLabel>
                        </FormCol>

                        {/* For short answer, show score percentage */}
                        {questionData.questionType === '3' && option.isCorrect && (
                        <FormGroup className="mt-2 p-3 bg-light rounded">
                          <StyledLabel>Tỷ lệ điểm cho đáp án này (%)</StyledLabel>
                          <StyledRange
                            type="range"
                            min="0"
                            max="100"
                            value={option.scorePercentage || 100}
                            onChange={(e) => handleOptionChange(index, 'scorePercentage', e.target.value)}
                          />
                          <RangeValueDisplay>
                            <span>0%</span>
                            <span className="current-value">{option.scorePercentage || 100}%</span>
                            <span>100%</span>
                          </RangeValueDisplay>
                          <small className="text-muted">
                            Điểm phần trăm cho đáp án này khi người dùng nhập đúng (100% = đáp án hoàn toàn đúng)
                          </small>
                        </FormGroup>
                      )}
                      </FormRow>
                      
                      {/* Option explanation */}
                      <FormGroup>
                        <StyledLabel>Giải thích đáp án</StyledLabel>
                        <StyledTextArea 
                          value={option.explanation || ''}
                          onChange={(e) => handleOptionChange(index, 'explanation', e.target.value)}
                          rows="2"
                          placeholder="Nhập giải thích cho đáp án này (tùy chọn)"
                        />
                      </FormGroup>
                    </CardBody>
                  </OptionCard>
                ))}
              </CardBody>
            </Card>
            
            {/* Form Actions */}
            <FormActions>
              <Button 
                type="button" 
                secondary
                onClick={handleCancel}
              >
                <i className="fas fa-arrow-left mr-1"></i> Quay lại
              </Button>
              <Button 
                type="submit" 
                primary
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner aria-hidden="true"></Spinner>
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save mr-1"></i> Cập nhật câu hỏi
                  </>
                )}
              </Button>
            </FormActions>
          </form>
        </>
      )}
    </PageContainer>
  );
};



export default EditQuestion;