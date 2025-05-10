import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { updateExam, fetchExamDetails } from '../../redux/examSlice';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import { fetchAllSubjects } from '../../redux/subjectSlice';
import { getAllSubjectsNoPaging } from '../../services/subjectService';
import { getQuestionsBySubject, getExamQuestions } from '../../services/questionService';
import { getExamDetails } from '../../services/examService';  // Thêm import
// Giữ nguyên các styled components từ CreateExam.jsx

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 1.1rem;
`;

const FormCard = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
  width: 18px;
  height: 18px;
  accent-color: #4299e1;
`;

const CheckboxLabel = styled.label`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  user-select: none;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const CancelButton = styled(Button)`
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  border: none;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#cbd5e0'};
  }
`;

const SubmitButton = styled(Button)`
  background: linear-gradient(135deg, #4285f4, #34a853);
  color: white;
  border: none;
  
  &:hover {
    background: linear-gradient(135deg, #3b78e7, #2e9549);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ErrorMessage = styled.p`
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;
// Update the component with better examId handling
const EditExam = () => {
  const params = useParams();
  const examId = params.examId || params.id; // Try both common parameter names
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useSelector(state => state.ui);
  
  console.log('URL parameters:', params);
  console.log('Extracted exam ID:', examId);
  
  // Validate examId is present and valid
  const isValidExamId = examId && !isNaN(parseInt(examId));
  
  useEffect(() => {
    if (!isValidExamId) {
      showErrorToast('Không tìm thấy ID đề thi hợp lệ trong URL');
      console.error('Invalid or missing exam ID in URL parameters');
      // Optional: Redirect after a short delay
      /*
      setTimeout(() => {
        navigate('/admin/exams');
      }, 3000);
      */
    }
  }, [examId, isValidExamId, navigate]);
  
  const { items: reduxSubjects, loading: loadingSubjects } = useSelector(state => state.subjects,state => state.exams);

  
  // State cho form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    examTypeId: 2,
    duration: 60,
    totalScore: 10,
    passScore: 5,
    maxAttempts: 1,
    difficulty: 'medium',
    startTime: '',
    endTime: '',
    isActive: true,
    showResult: true,
    showAnswers: false,
    shuffleQuestions: true,
    shuffleOptions: true,
    autoGradeShortAnswer: true,
    allowPartialGrading: true,
    accessCode: '',
    scoringConfig: '',
    questions: []
  });
  
  // States giống với CreateExam
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localSubjects, setLocalSubjects] = useState([]);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingExamData, setIsLoadingExamData] = useState(true);
  
  // State cho phần quản lý câu hỏi
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionSearchTerm, setQuestionSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  
  useEffect(() => {
  const loadExamData = async () => {
    if (!examId) {
      console.log('No examId provided');
      setIsLoadingExamData(false);
      return;
    }
    
    console.log(`Loading exam data for ID: ${examId}`);
    setIsLoadingExamData(true);
    
    try {
      console.log('Making API call to get exam data with questions');
      // Use the WithQuestions endpoint to get exam with questions in one call
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5006/api/Exam/WithQuestions/${examId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load exam: ${response.status}`);
      }
      
      const examData = await response.json();
      console.log('Exam data with questions received:', examData);
      
      if (!examData || !examData.id) {
        throw new Error('Invalid exam data received');
      }
      
      // Format dates properly if they exist
      const startTime = examData.startTime ? new Date(examData.startTime).toISOString().slice(0, 16) : '';
      const endTime = examData.endTime ? new Date(examData.endTime).toISOString().slice(0, 16) : '';
      
      setFormData({
        title: examData.title || '',
        description: examData.description || '',
        subjectId: examData.subject ? String(examData.subject.id) : '',
        examTypeId: examData.type === 'Kiểm tra 1 tiết' ? 2 : 1,
        difficulty: examData.difficulty || 'medium',
        duration: examData.duration || 60,
        totalScore: examData.totalScore || 10,
        passScore: examData.passScore || 5,
        maxAttempts: examData.maxAttempts || 1,
        startTime: startTime,
        endTime: endTime,
        isActive: examData.isActive !== false,
        showResult: examData.showResult !== false,
        showAnswers: examData.showAnswers || false,
        shuffleQuestions: examData.shuffleQuestions !== false,
        shuffleOptions: examData.shuffleOptions !== false,
        autoGradeShortAnswer: examData.autoGradeShortAnswer !== false,
        allowPartialGrading: examData.allowPartialGrading !== false,
        instructions: examData.instructions || '',
        accessCode: examData.accessCode || '',
        scoringConfig: examData.scoringConfig || JSON.stringify({
          gradingMethod: "sum",
          partialCreditMethod: "proportional",
          penaltyForWrongAnswer: 0
        })
      });
      
      // Use the questions from the response directly
      if (examData.questions && Array.isArray(examData.questions)) {
        const formattedQuestions = examData.questions.map(q => ({
          id: q.id,
          questionId: q.id,
          examQuestionId: q.examQuestionId,
          content: q.content,
          difficulty: q.difficulty || 'medium',
          score: q.score || 1,
          orderIndex: q.orderIndex || 0,
          order: q.orderIndex || 0
        }));
        
        setSelectedQuestions(formattedQuestions);
      }
      
      showSuccessToast('Đã tải dữ liệu đề thi thành công');
    } catch (error) {
      console.error('Error loading exam data:', error);
      showErrorToast('Không thể tải dữ liệu đề thi: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoadingExamData(false);
    }
  };
  
  loadExamData();
}, [examId, dispatch]);

  console.log('Rendering EditExam with loading state:', isLoadingExamData);
  
  // Tải danh sách môn học
  useEffect(() => {
    dispatch(fetchAllSubjects());
    
    const loadSubjectsDirectly = async () => {
      setIsLoadingLocal(true);
      try {
        const data = await getAllSubjectsNoPaging();
        if (data && Array.isArray(data)) {
          setLocalSubjects(data);
        } else if (data && data.items && Array.isArray(data.items)) {
          setLocalSubjects(data.items);
        } else if (data && data.data && Array.isArray(data.data)) {
          setLocalSubjects(data.data);
        }
      } catch (err) {
        console.error('Error loading subjects:', err);
        setError(`Lỗi khi tải môn học: ${err.message}`);
      } finally {
        setIsLoadingLocal(false);
      }
    };
    
    loadSubjectsDirectly();
  }, [dispatch]);
  
  // Tải câu hỏi khi chọn môn học
  useEffect(() => {
    if (formData.subjectId) {
      setIsLoadingQuestions(true);
      
      getQuestionsBySubject(formData.subjectId)
        .then(response => {
          console.log("Loaded questions for subject:", response);
          setAvailableQuestions(response.data || []);
        })
        .catch(err => {
          console.error("Failed to load questions:", err);
          showErrorToast("Không thể tải danh sách câu hỏi");
        })
        .finally(() => {
          setIsLoadingQuestions(false);
        });
    }
  }, [formData.subjectId]);
  
  // Hàm tải câu hỏi của đề thi
  const loadExamQuestions = async (id) => {
    try {
      setIsLoadingQuestions(true);
      const response = await getExamQuestions(id);
      console.log("Loaded exam questions:", response);
      
      if (response && Array.isArray(response.data)) {
        // Chuyển đổi dữ liệu câu hỏi để hiển thị trong bảng đã chọn
        const examQuestions = response.data.map(q => ({
          id: q.questionId,
          content: q.content || q.question?.content,
          difficulty: q.difficulty || q.question?.difficulty,
          score: q.score,
          // Các thông tin khác từ câu hỏi
          ...q
        }));
        
        setSelectedQuestions(examQuestions);
      }
    } catch (error) {
      console.error("Error loading exam questions:", error);
      showErrorToast("Không thể tải câu hỏi của đề thi");
    } finally {
      setIsLoadingQuestions(false);
    }
  };
  
  // Use subjects from Redux or local state
  const subjects = reduxSubjects?.length > 0 ? reduxSubjects : localSubjects;
  const isLoading = loadingSubjects || isLoadingLocal;
  
  // Các hàm xử lý form
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tên đề thi';
    }
    
    if (!formData.subjectId) {
      newErrors.subjectId = 'Vui lòng chọn môn học';
    }
    
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Thời gian làm bài phải lớn hơn 0';
    }
    
    if (!formData.passScore || formData.passScore < 0 || formData.passScore > formData.totalScore) {
      newErrors.passScore = `Điểm đạt phải từ 0 đến ${formData.totalScore}`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Add this function to the EditExam component to properly format dates
const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch (e) {
    console.error('Date formatting error:', e);
    return null;
  }
};

// Replace your current handleSubmit function with this version
const handleSubmit = (e) => {
  e.preventDefault();
  
  if (validateForm()) {
    setIsSubmitting(true);
    
    // Format questions properly using the original questionId and score
    const questionsToSubmit = selectedQuestions.map((q, index) => ({
      questionId: parseInt(q.id || q.questionId),
      order: index + 1,
      score: parseFloat(q.score || 1)
    }));
    
    // Validate that we have questions
    if (questionsToSubmit.length === 0) {
      setErrors(prev => ({...prev, questions: 'Vui lòng chọn ít nhất một câu hỏi cho đề thi'}));
      setIsSubmitting(false);
      return;
    }
    
    // Format dates properly for API
    const formattedStartTime = formData.startTime ? formatDate(formData.startTime) : null;
    const formattedEndTime = formData.endTime ? formatDate(formData.endTime) : null;

    // Create a single update request with questions included
    // Make sure the structure matches what the API expects
    const examData = {
      id: parseInt(examId),
      title: formData.title.trim(),
      description: formData.description?.trim() || '',
      subjectId: parseInt(formData.subjectId),
      examTypeId: parseInt(formData.examTypeId) || 2,
      difficulty: formData.difficulty || 'medium',
      duration: parseInt(formData.duration) || 60,
      totalScore: parseFloat(formData.totalScore) || 10,
      passScore: parseFloat(formData.passScore) || 5,
      maxAttempts: parseInt(formData.maxAttempts) || 1,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      isActive: formData.isActive === true,
      showResult: formData.showResult === true,
      showAnswers: formData.showAnswers === true,
      shuffleQuestions: formData.shuffleQuestions === true,
      shuffleOptions: formData.shuffleOptions === true,
      autoGradeShortAnswer: formData.autoGradeShortAnswer === true,
      allowPartialGrading: formData.allowPartialGrading === true,
      instructions: formData.instructions || '',
      accessCode: formData.accessCode || '',
      scoringConfig: formData.scoringConfig || JSON.stringify({
        gradingMethod: "sum",
        partialCreditMethod: "proportional",
        penaltyForWrongAnswer: 0
      }),
      questions: questionsToSubmit
    };
    
    console.log('Sending update data:', examData);
    
    // Make a single API request including questions
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5006/api/Exam/${examId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(examData)
    })
    .then(response => {
      if (!response.ok) {
        // Try to get detailed error information
        return response.json().then(errorData => {
          console.error('API Error response:', errorData);
          
          // Extract validation errors from the response
          if (errorData.errors) {
            const errorMessages = [];
            for (const field in errorData.errors) {
              errorMessages.push(`${field}: ${errorData.errors[field].join(', ')}`);
            }
            throw new Error(errorMessages.join(' | '));
          }
          
          throw new Error(`Failed to update exam: ${response.status}`);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Exam update successful:', data);
      showSuccessToast('Cập nhật đề thi thành công!');
      navigate('/admin/exams');
    })
    .catch(error => {
      console.error('Update error details:', error);
      
      if (error.name === 'SyntaxError') {
        // Handle case where the server response isn't valid JSON
        showErrorToast('Server returned an invalid response');
      } else {
        showErrorToast(error.message || 'Không thể cập nhật đề thi');
      }
    })
    .finally(() => {
      setIsSubmitting(false);
    });
  }
};
  
  const handleCancel = () => {
    navigate('/admin/exams');
  };
  
  const handleRetryLoadSubjects = () => {
    dispatch(fetchAllSubjects());
    
    const retryLoadSubjects = async () => {
      setIsLoadingLocal(true);
      setError(null);
      try {
        const data = await getAllSubjectsNoPaging();
        if (data && Array.isArray(data)) {
          setLocalSubjects(data);
        } else if (data && data.items && Array.isArray(data.items)) {
          setLocalSubjects(data.items);
        }
      } catch (err) {
        console.error('Error loading subjects directly:', err);
        setError(`Lỗi khi tải môn học: ${err.message}`);
      } finally {
        setIsLoadingLocal(false);
      }
    };
    
    retryLoadSubjects();
  };
  
  // Hiển thị loading khi đang tải dữ liệu đề thi
  if (isLoadingExamData) {
    return (
      <Container>
        <Header>
          <Title theme={theme}>Đang tải dữ liệu đề thi...</Title>
        </Header>
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <Title theme={theme}>Chỉnh sửa đề thi</Title>
        <Subtitle theme={theme}>Cập nhật thông tin và câu hỏi cho đề thi</Subtitle>
      </Header>
      
      <form onSubmit={handleSubmit}>
        <FormCard 
          theme={theme}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Grid>
            <FormGroup>
              <Label theme={theme}>Tên đề thi *</Label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Nhập tên đề thi"
                theme={theme}
              />
              {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme}>Môn học *</Label>
              {isLoading ? (
                <p>Đang tải danh sách môn học...</p>
              ) : (
                <>
                  <Select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleChange}
                    theme={theme}
                  >
                    <option value="">-- Chọn môn học --</option>
                    {subjects && subjects.length > 0 ? (
                      subjects.map(subject => (
                        <option key={subject.id} value={String(subject.id)}>
                          {subject.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Không có môn học nào</option>
                    )}
                  </Select>
                  {subjects.length === 0 && (
                    <div className="alert alert-warning mt-2">
                      <strong>Cảnh báo:</strong> Không tìm thấy môn học nào trong hệ thống.
                      <button
                        className="btn btn-sm btn-primary mt-2"
                        onClick={handleRetryLoadSubjects}
                      >
                        Thử lại
                      </button>
                    </div>
                  )}
                </>
              )}
              {errors.subjectId && <ErrorMessage>{errors.subjectId}</ErrorMessage>}
            </FormGroup>
          </Grid>
          
          <FormGroup>
            <Label theme={theme}>Mô tả đề thi</Label>
            <Textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Mô tả ngắn về đề thi"
              theme={theme}
            />
          </FormGroup>
          
          <Grid>
            <FormGroup>
              <Label theme={theme}>Thời gian làm bài (phút) *</Label>
              <Input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="1"
                theme={theme}
              />
              {errors.duration && <ErrorMessage>{errors.duration}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme}>Mức độ khó *</Label>
              <Select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                theme={theme}
              >
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </Select>
            </FormGroup>
          </Grid>
          
          <Grid>
            <FormGroup>
              <Label theme={theme}>Điểm đạt</Label>
              <Input
                type="number"
                name="passScore"
                value={formData.passScore}
                onChange={handleChange}
                min="0"
                max="10"
                step="0.1"
                theme={theme}
              />
              {errors.passScore && <ErrorMessage>{errors.passScore}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme}>Hướng dẫn làm bài</Label>
              <Input
                type="text"
                name="instructions"
                value={formData.instructions || ''}
                onChange={handleChange}
                placeholder="Hướng dẫn làm bài thi"
                theme={theme}
              />
            </FormGroup>
          </Grid>
          
          <Grid>
            <FormGroup>
              <Label theme={theme}>Thời gian bắt đầu</Label>
              <Input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                theme={theme}
              />
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme}>Thời gian kết thúc</Label>
              <Input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                theme={theme}
              />
            </FormGroup>
          </Grid>
          
          <FormGroup>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <CheckboxLabel theme={theme}>
                Kích hoạt đề thi
              </CheckboxLabel>
            </CheckboxContainer>
          </FormGroup>
          
          <FormGroup>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                name="showResult"
                checked={formData.showResult}
                onChange={handleChange}
              />
              <CheckboxLabel theme={theme}>
                Hiển thị kết quả sau khi làm bài
              </CheckboxLabel>
            </CheckboxContainer>
          </FormGroup>
          
          <FormGroup>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                name="showAnswers"
                checked={formData.showAnswers}
                onChange={handleChange}
              />
              <CheckboxLabel theme={theme}>
                Hiển thị đáp án sau khi làm bài
              </CheckboxLabel>
            </CheckboxContainer>
          </FormGroup>
          
          {/* Phần quản lý câu hỏi - giống với CreateExam */}
          <FormGroup>
            <Label theme={theme}>Câu hỏi cho đề thi *</Label>
            
            {formData.subjectId ? (
              <>
                {/* Phần tìm kiếm và lọc câu hỏi */}
                <div className="card mb-3" style={{
                  backgroundColor: theme === 'dark' ? '#2d3748' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? '#4a5568' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  padding: '1rem'
                }}>
                  <h5 style={{color: theme === 'dark' ? '#e2e8f0' : '#2d3748'}}>Danh sách câu hỏi có sẵn</h5>
                  
                  <div className="d-flex mb-3 gap-2">
                    <Input 
                      type="text"
                      placeholder="Tìm kiếm câu hỏi..."
                      value={questionSearchTerm}
                      onChange={(e) => setQuestionSearchTerm(e.target.value)}
                      theme={theme}
                      style={{flex: 2}}
                    />
                    
                    <Select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      theme={theme}
                      style={{flex: 1}}
                    >
                      <option value="">Tất cả chủ đề</option>
                      <option value="topic1">Chương 1</option>
                      <option value="topic2">Chương 2</option>
                    </Select>
                    
                    <Select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      theme={theme}
                      style={{flex: 1}}
                    >
                      <option value="">Tất cả độ khó</option>
                      <option value="easy">Dễ</option>
                      <option value="medium">Trung bình</option>
                      <option value="hard">Khó</option>
                    </Select>
                  </div>
                  
                  {isLoadingQuestions ? (
                    <div className="text-center py-3">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                      </div>
                      <p className="mt-2" style={{color: theme === 'dark' ? '#e2e8f0' : '#2d3748'}}>
                        Đang tải danh sách câu hỏi...
                      </p>
                    </div>
                  ) : availableQuestions.length > 0 ? (
                    <div style={{
                      maxHeight: '300px',
                      overflowY: 'auto',
                      border: `1px solid ${theme === 'dark' ? '#4a5568' : '#e2e8f0'}`,
                      borderRadius: '4px'
                    }}>
                      <table className="table" style={{
                        color: theme === 'dark' ? '#e2e8f0' : '#2d3748',
                        backgroundColor: theme === 'dark' ? '#1a202c' : '#ffffff',
                      }}>
                        <thead style={{
                          position: 'sticky',
                          top: 0,
                          backgroundColor: theme === 'dark' ? '#2d3748' : '#f7fafc',
                          zIndex: 10
                        }}>
                          <tr>
                            <th style={{width: '50px'}}>ID</th>
                            <th>Nội dung</th>
                            <th style={{width: '100px'}}>Độ khó</th>
                            <th style={{width: '80px'}}>Điểm</th>
                            <th style={{width: '80px'}}>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {availableQuestions
                            .filter(q => {
                              // Lọc theo từ khóa tìm kiếm
                              const matchesSearch = !questionSearchTerm || 
                                q.content?.toLowerCase().includes(questionSearchTerm.toLowerCase());
                              
                              // Lọc theo chủ đề
                              const matchesTopic = !selectedTopic || q.topicId === selectedTopic;
                              
                              // Lọc theo độ khó
                              const matchesDifficulty = !selectedDifficulty || q.difficulty === selectedDifficulty;
                              
                              return matchesSearch && matchesTopic && matchesDifficulty;
                            })
                            .map(question => {
                              // Kiểm tra câu hỏi đã được chọn chưa
                              const isSelected = selectedQuestions.some(q => q.id === question.id || q.questionId === question.id);
                              
                              return (
                                <tr key={question.id} style={{
                                  backgroundColor: isSelected ? 
                                    (theme === 'dark' ? '#2a4365' : '#ebf8ff') : 'inherit'
                                }}>
                                  <td>{question.id}</td>
                                  <td>
                                    <div style={{
                                      maxHeight: '80px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {question.content}
                                    </div>
                                  </td>
                                  <td>
                                    {question.difficulty === 'easy' ? 'Dễ' : 
                                     question.difficulty === 'medium' ? 'Trung bình' : 
                                     question.difficulty === 'hard' ? 'Khó' : question.difficulty}
                                  </td>
                                  <td>
                                    <Input
                                      type="number"
                                      min="0.1"
                                      step="0.1"
                                      defaultValue="1"
                                      style={{width: '60px', padding: '2px 5px'}}
                                      disabled={!isSelected}
                                      onChange={(e) => {
                                        const newScore = parseFloat(e.target.value);
                                        if (isSelected && !isNaN(newScore)) {
                                          setSelectedQuestions(prev => 
                                            prev.map(q => 
                                              (q.id === question.id || q.questionId === question.id) ? {...q, score: newScore} : q
                                            )
                                          );
                                        }
                                      }}
                                    />
                                  </td>
                                  <td>
                                    {isSelected ? (
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => {
                                          setSelectedQuestions(prev => 
                                            prev.filter(q => q.id !== question.id && q.questionId !== question.id)
                                          );
                                        }}
                                      >
                                        Xóa
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => {
                                          setSelectedQuestions(prev => [
                                            ...prev, 
                                            {...question, score: 1}
                                          ]);
                                        }}
                                      >
                                        Thêm
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="alert alert-info">
                      Không có câu hỏi nào cho môn học này. Vui lòng tạo câu hỏi trước.
                    </div>
                  )}
                </div>
                
                {/* Phần hiển thị câu hỏi đã chọn - giữ nguyên từ CreateExam */}
                <div className="card" style={{
                  backgroundColor: theme === 'dark' ? '#2d3748' : '#ffffff',
                  border: `1px solid ${theme === 'dark' ? '#4a5568' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  padding: '1rem'
                }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 style={{color: theme === 'dark' ? '#e2e8f0' : '#2d3748'}}>
                      Câu hỏi đã chọn ({selectedQuestions.length})
                    </h5>
                    {selectedQuestions.length > 0 && (
                      <button 
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setSelectedQuestions([])}
                      >
                        Xóa tất cả
                      </button>
                    )}
                  </div>
                  
                  {selectedQuestions.length > 0 ? (
                    <div style={{
                      maxHeight: '300px',
                      overflowY: 'auto',
                      border: `1px solid ${theme === 'dark' ? '#4a5568' : '#e2e8f0'}`,
                      borderRadius: '4px'
                    }}>
                      <table className="table" style={{
                        color: theme === 'dark' ? '#e2e8f0' : '#2d3748',
                        backgroundColor: theme === 'dark' ? '#1a202c' : '#ffffff',
                      }}>
                        <thead style={{
                          position: 'sticky',
                          top: 0,
                          backgroundColor: theme === 'dark' ? '#2d3748' : '#f7fafc',
                          zIndex: 10
                        }}>
                          <tr>
                            <th style={{width: '50px'}}>#</th>
                            <th style={{width: '50px'}}>ID</th>
                            <th>Nội dung</th>
                            <th style={{width: '100px'}}>Độ khó</th>
                            <th style={{width: '80px'}}>Điểm</th>
                            <th style={{width: '120px'}}>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedQuestions.map((question, index) => (
                            <tr key={question.id || question.questionId}>
                              <td>{index + 1}</td>
                              <td>{question.id || question.questionId}</td>
                              <td>
                                <div style={{
                                  maxHeight: '80px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {question.content}
                                </div>
                              </td>
                              <td>
                                {question.difficulty === 'easy' ? 'Dễ' : 
                                 question.difficulty === 'medium' ? 'Trung bình' : 
                                 question.difficulty === 'hard' ? 'Khó' : question.difficulty}
                              </td>
                              <td>
                                <Input
                                  type="number"
                                  min="0.1"
                                  step="0.1"
                                  value={question.score || 1}
                                  style={{width: '60px', padding: '2px 5px'}}
                                  onChange={(e) => {
                                    const newScore = parseFloat(e.target.value);
                                    if (!isNaN(newScore)) {
                                      setSelectedQuestions(prev => 
                                        prev.map((q, i) => 
                                          i === index ? {...q, score: newScore} : q
                                        )
                                      );
                                    }
                                  }}
                                />
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  {index > 0 && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() => {
                                        setSelectedQuestions(prev => {
                                          const newQuestions = [...prev];
                                          const temp = newQuestions[index];
                                          newQuestions[index] = newQuestions[index - 1];
                                          newQuestions[index - 1] = temp;
                                          return newQuestions;
                                        });
                                      }}
                                    >
                                      <i className="fa fa-arrow-up"></i>
                                    </button>
                                  )}
                                  {index < selectedQuestions.length - 1 && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-secondary"
                                      onClick={() => {
                                        setSelectedQuestions(prev => {
                                          const newQuestions = [...prev];
                                          const temp = newQuestions[index];
                                          newQuestions[index] = newQuestions[index + 1];
                                          newQuestions[index + 1] = temp;
                                          return newQuestions;
                                        });
                                      }}
                                    >
                                      <i className="fa fa-arrow-down"></i>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => {
                                      setSelectedQuestions(prev => 
                                        prev.filter((_, i) => i !== index)
                                      );
                                    }}
                                  >
                                    <i className="fa fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="alert alert-warning">
                      Chưa có câu hỏi nào được chọn. Vui lòng thêm ít nhất một câu hỏi.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="alert alert-info">
                Vui lòng chọn môn học để xem danh sách câu hỏi.
              </div>
            )}
            
            {errors.questions && <ErrorMessage>{errors.questions}</ErrorMessage>}
          </FormGroup>
          
          <ButtonContainer>
            <CancelButton 
              type="button" 
              onClick={handleCancel}
              theme={theme}
            >
              Hủy bỏ
            </CancelButton>
            <SubmitButton 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật đề thi'}
            </SubmitButton>
          </ButtonContainer>
        </FormCard>
      </form>
    </Container>
  );
};

export default EditExam;