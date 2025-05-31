import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { createNewExam } from '../../redux/examSlice';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import { getSubjects } from '../../services/subjectService';
import { fetchAllSubjects } from '../../redux/subjectSlice';
import { getAllSubjectsNoPaging } from '../../services/subjectService';
import { getQuestionsBySubject } from '../../services/questionService';

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

const CreateExam = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { theme } = useSelector(state => state.ui);
  const { items: reduxSubjects, loading } = useSelector(state => state.subjects);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    examTypeId: 2, // Default exam type
    duration: 60,
    totalScore: 10,
    passScore: 5, // Đảm bảo tên trường nhất quán
    maxAttempts: 1,
    difficulty: 'medium', // Added difficulty field
    //startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Tomorrow
    //endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Two weeks from now
    isActive: false,
    showResult: true,
    showAnswers: true,
    shuffleQuestions: true,
    shuffleOptions: true,
    autoGradeShortAnswer: true,
    allowPartialGrading: true,
    accessCode: '',
    scoringConfig: JSON.stringify({
      gradingMethod: "sum",
      partialCreditMethod: "proportional",
      penaltyForWrongAnswer: 0
    }),
    questions: []
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localSubjects, setLocalSubjects] = useState([]);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const [error, setError] = useState(null);
  
  // State cho phần quản lý câu hỏi
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionSearchTerm, setQuestionSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  
  // Thêm state tạo nháp
  const [isDraft, setIsDraft] = useState(false);
  
  // Thêm state mới cho random selection
  const [randomConfig, setRandomConfig] = useState({
    questionCount: 20,
    scorePerQuestion: 0.5,
    includeDifficulty: 'all'
  });

  const [isRandomMode, setIsRandomMode] = useState(false);
  
  useEffect(() => {
    // Method 1: Redux
    dispatch(fetchAllSubjects());
    
    // Method 2: Direct API call as backup
    const loadSubjectsDirectly = async () => {
      setIsLoadingLocal(true);
      setError(null);
      try {
        const data = await getAllSubjectsNoPaging();
        console.log('Directly loaded subjects:', data);
        
        // Handle different response formats
        if (data && Array.isArray(data)) {
          setLocalSubjects(data);
        } else if (data && data.items && Array.isArray(data.items)) {
          setLocalSubjects(data.items); 
        } else if (data && data.data && Array.isArray(data.data)) {
          // Add this case to handle your actual API response structure
          setLocalSubjects(data.data);
          console.log('Loaded subjects from data array:', data.data);
        } else {
          console.warn('Unexpected response format from API:', data);
          setError('Định dạng dữ liệu không hợp lệ');
          setLocalSubjects([]);
        }
      } catch (err) {
        console.error('Error loading subjects directly:', err);
        setError(`Lỗi khi tải môn học: ${err.message || 'Lỗi không xác định'}`);
        setLocalSubjects([]);
      } finally {
        setIsLoadingLocal(false);
      }
    };
    
    loadSubjectsDirectly();
  }, [dispatch]);
  
  // Use subjects from Redux or local state
  const subjects = reduxSubjects?.length > 0 ? reduxSubjects : localSubjects;
  const isLoading = loading || isLoadingLocal;
  
  // Debug info
  console.log('Redux subjects:', reduxSubjects);
  console.log('Local subjects:', localSubjects);
  console.log('Using subjects:', subjects);
  
  // Function to retry loading subjects
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
        } else {
          setError('Định dạng dữ liệu không hợp lệ');
          setLocalSubjects([]);
        }
      } catch (err) {
        console.error('Error loading subjects directly:', err);
        setError(`Lỗi khi tải môn học: ${err.message || 'Lỗi không xác định'}`);
        setLocalSubjects([]);
      } finally {
        setIsLoadingLocal(false);
      }
    };
    
    retryLoadSubjects();
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const processedValue = name === 'subjectId' ? Number(value) : value;
  
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Sửa lại phần validation
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
    
    // Sửa từ passingScore thành passScore
    if (!formData.passScore || formData.passScore < 0 || formData.passScore > formData.totalScore) {
      newErrors.passScore = `Điểm đạt phải từ 0 đến ${formData.totalScore}`;
    }
    
    if (!formData.totalScore || formData.totalScore <= 0) {
      newErrors.totalScore = 'Tổng điểm phải lớn hơn 0';
    }
    
    if (!formData.maxAttempts || formData.maxAttempts <= 0) {
      newErrors.maxAttempts = 'Số lần làm bài phải lớn hơn 0';
    }
    
    // Xóa validation cho startTime và endTime vì không có trong form
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Nếu không phải nháp, yêu cầu phải có câu hỏi
      if (!isDraft && selectedQuestions.length === 0) {
        showErrorToast("Đề thi phải có ít nhất một câu hỏi");
        setErrors(prev => ({...prev, questions: "Vui lòng thêm ít nhất một câu hỏi"}));
        return;
      }
      
      setIsSubmitting(true);
      
      // Tạo câu hỏi giả nếu là nháp và không có câu hỏi nào
      const questionsToSubmit = selectedQuestions.length > 0 
        ? selectedQuestions.map((q, index) => ({
            questionId: q.id,
            order: index + 1,
            score: q.score || 1
          }))
        : [{ questionId: 1, order: 1, score: 1 }]; // Câu hỏi giả cho nháp
      
      const examData = {
        ...formData,
        subjectId: Number(formData.subjectId),
        passScore: formData.passScore || 5, // Chắc chắn có passScore
        questions: questionsToSubmit,
        isDraft: isDraft, // Thêm trường này nếu backend hỗ trợ
        // If it's a draft, force isActive to false
        isActive: isDraft ? false : formData.isActive
      };
      
      console.log('Creating exam with visibility:', examData.isActive ? 'Public' : 'Private');
      
      dispatch(createNewExam(examData))
        .then((result) => {
          if (result.meta.requestStatus === 'fulfilled') {
            if (isDraft) {
              showSuccessToast('Đã tạo đề thi nháp thành công!');
              navigate(`/admin/exams/${result.payload.id}/edit`);
            } else {
              showSuccessToast('Tạo đề thi thành công!');
              navigate('/admin/exams');
            }
          } else if (result.meta.requestStatus === 'rejected') {
            showErrorToast(result.payload || 'Có lỗi xảy ra khi tạo đề thi');
          }
        })
        .catch((error) => {
          showErrorToast(error.message || 'Có lỗi xảy ra khi tạo đề thi');
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    }
  };
  
  const handleCancel = () => {
    navigate('/admin/exams');
  };
  
  useEffect(() => {
    if (formData.subjectId) {
      setIsLoadingQuestions(true);
      
      getQuestionsBySubject(formData.subjectId)
        .then(response => {
          console.log("Loaded questions:", response);
          setAvailableQuestions(response.data || []);
        })
        .catch(err => {
          console.error("Failed to load questions:", err);
          showErrorToast("Không thể tải danh sách câu hỏi");
        })
        .finally(() => {
          setIsLoadingQuestions(false);
        });
    } else {
      setAvailableQuestions([]);
    }
  }, [formData.subjectId]);
  
  // Function để random câu hỏi
  const handleRandomSelect = () => {
    if (!formData.subjectId) {
      showErrorToast("Vui lòng chọn môn học trước");
      return;
    }

    if (availableQuestions.length === 0) {
      showErrorToast("Không có câu hỏi nào để chọn");
      return;
    }

    const { questionCount, scorePerQuestion, includeDifficulty } = randomConfig;

    // Lọc câu hỏi theo điều kiện
    let filteredQuestions = availableQuestions.filter(q => {
      // Lọc theo độ khó
      if (includeDifficulty !== 'all' && q.difficulty !== includeDifficulty) {
        return false;
      }
      
      // Loại bỏ những câu đã được chọn
      return !selectedQuestions.some(selected => selected.id === q.id);
    });

    if (filteredQuestions.length === 0) {
      showErrorToast("Không có câu hỏi phù hợp với điều kiện lọc");
      return;
    }

    // Random câu hỏi
    const actualCount = Math.min(questionCount, filteredQuestions.length);
    const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
    const randomQuestions = shuffled.slice(0, actualCount);

    // Thêm vào danh sách đã chọn với điểm số
    const questionsWithScore = randomQuestions.map(q => ({
      ...q,
      score: scorePerQuestion
    }));

    setSelectedQuestions(prev => [...prev, ...questionsWithScore]);
    
    showSuccessToast(`Đã thêm ${actualCount} câu hỏi ngẫu nhiên`);
    
    // Tự động tính lại tổng điểm
    const newTotalScore = (selectedQuestions.length + actualCount) * scorePerQuestion;
    setFormData(prev => ({
      ...prev,
      totalScore: Math.round(newTotalScore * 10) / 10 // Làm tròn 1 chữ số thập phân
    }));
  };

  // Function để tính toán và cập nhật tổng điểm tự động
  const updateTotalScore = () => {
    const totalScore = selectedQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
    setFormData(prev => ({
      ...prev,
      totalScore: Math.round(totalScore * 10) / 10
    }));
  };
  
  // Update tổng điểm khi selectedQuestions thay đổi
  useEffect(() => {
    updateTotalScore();
  }, [selectedQuestions]);
  
  // Thêm logic để tự động cập nhật giới hạn điểm đạt khi tổng điểm thay đổi
  useEffect(() => {
    // Nếu điểm đạt lớn hơn tổng điểm, tự động điều chỉnh
    if (formData.passScore > formData.totalScore) {
      setFormData(prev => ({
        ...prev,
        passScore: Math.floor(formData.totalScore / 2) // Đặt bằng 50% tổng điểm
      }));
    }
  }, [formData.totalScore]);
  
  return (
    <Container>
      <Header>
        <Title theme={theme}>Tạo đề thi mới</Title>
        <Subtitle theme={theme}>Nhập thông tin cơ bản cho đề thi</Subtitle>
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
                <p>Loading subjects...</p>
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
                      <div>Redux subjects: {JSON.stringify(reduxSubjects?.length)}</div>
                      <div>Local subjects: {JSON.stringify(localSubjects?.length)}</div>
                      <div>Error: {error}</div>
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
              value={formData.description}
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
                name="passScore"  // Đảm bảo name khớp với state
                value={formData.passScore}
                onChange={handleChange}
                min="0"
                max={formData.totalScore} // Giới hạn theo tổng điểm
                step="0.1"
                theme={theme}
                placeholder={`Từ 0 đến ${formData.totalScore}`}
              />
              {errors.passScore && <ErrorMessage>{errors.passScore}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme}>Hướng dẫn làm bài</Label>
              <Input
                type="text"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Hướng dẫn làm bài thi"
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
                Công khai đề thi (học sinh có thể làm bài)
              </CheckboxLabel>
            </CheckboxContainer>
          </FormGroup>
          
          {/* Phần quản lý câu hỏi */}
          <FormGroup>
            <Label theme={theme}>Câu hỏi cho đề thi *</Label>
            
            {formData.subjectId ? (
              <>
                {/* Toggle Random Mode */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 style={{color: theme === 'dark' ? '#e2e8f0' : '#2d3748', margin: 0}}>
                    Quản lý câu hỏi
                  </h5>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="randomModeSwitch"
                      checked={isRandomMode}
                      onChange={(e) => setIsRandomMode(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="randomModeSwitch" style={{
                      color: theme === 'dark' ? '#e2e8f0' : '#2d3748'
                    }}>
                      Chế độ chọn nhanh
                    </label>
                  </div>
                </div>

                {/* Random Selection Panel */}
                {isRandomMode && (
                  <div className="card mb-3" style={{
                    backgroundColor: theme === 'dark' ? '#1a365d' : '#e6f3ff',
                    border: `1px solid ${theme === 'dark' ? '#2c5282' : '#bee3f8'}`,
                    borderRadius: '8px',
                    padding: '1rem'
                  }}>
                    <h6 style={{color: theme === 'dark' ? '#e2e8f0' : '#2d3748', marginBottom: '1rem'}}>
                      🎲 Chọn ngẫu nhiên câu hỏi
                    </h6>
                    
                    <div className="row g-3">
                      <div className="col-md-4">
                        <Label theme={theme}>Số lượng câu hỏi</Label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={randomConfig.questionCount}
                          onChange={(e) => setRandomConfig(prev => ({
                            ...prev,
                            questionCount: parseInt(e.target.value) || 1
                          }))}
                          theme={theme}
                          placeholder="Ví dụ: 50"
                        />
                      </div>
                      
                      <div className="col-md-3">
                        <Label theme={theme}>Điểm mỗi câu</Label>
                        <Input
                          type="number"
                          min="0.1"
                          max="10"
                          step="0.1"
                          value={randomConfig.scorePerQuestion}
                          onChange={(e) => setRandomConfig(prev => ({
                            ...prev,
                            scorePerQuestion: parseFloat(e.target.value) || 0.1
                          }))}
                          theme={theme}
                          placeholder="Ví dụ: 0.2"
                        />
                      </div>
                      
                      <div className="col-md-3">
                        <Label theme={theme}>Độ khó</Label>
                        <Select
                          value={randomConfig.includeDifficulty}
                          onChange={(e) => setRandomConfig(prev => ({
                            ...prev,
                            includeDifficulty: e.target.value
                          }))}
                          theme={theme}
                        >
                          <option value="all">Tất cả</option>
                          <option value="easy">Dễ</option>
                          <option value="medium">Trung bình</option>
                          <option value="hard">Khó</option>
                        </Select>
                      </div>
                      
                      <div className="col-md-2 d-flex align-items-end">
                        <button
                          type="button"
                          className="btn btn-primary w-100"
                          onClick={handleRandomSelect}
                          disabled={availableQuestions.length === 0}
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            fontWeight: '600'
                          }}
                        >
                          <i className="fas fa-dice me-2"></i>
                          Chọn ngẫu nhiên
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-3 rounded" style={{
                      backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                    }}>
                      <div className="row">
                        <div className="col-md-6">
                          <small style={{color: theme === 'dark' ? '#cbd5e0' : '#4a5568'}}>
                            💡 <strong>Dự kiến:</strong> {randomConfig.questionCount} câu × {randomConfig.scorePerQuestion} điểm = <strong>{(randomConfig.questionCount * randomConfig.scorePerQuestion).toFixed(1)} điểm</strong>
                          </small>
                        </div>
                        <div className="col-md-6">
                          <small style={{color: theme === 'dark' ? '#cbd5e0' : '#4a5568'}}>
                            📊 <strong>Có sẵn:</strong> {availableQuestions.length} câu | <strong>Đã chọn:</strong> {selectedQuestions.length} câu
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Existing question search and filter panel - chỉ hiển thị khi không ở random mode */}
                {!isRandomMode && (
                  <div className="card mb-3" style={{
                    backgroundColor: theme === 'dark' ? '#2d3748' : '#ffffff',
                    border: `1px solid ${theme === 'dark' ? '#4a5568' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    padding: '1rem'
                  }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 style={{color: theme === 'dark' ? '#e2e8f0' : '#2d3748', margin: 0}}>
                        📚 Danh sách câu hỏi có sẵn ({availableQuestions.length})
                      </h6>
                      {selectedQuestions.length > 0 && (
                        <span className="badge bg-success">
                          Đã chọn: {selectedQuestions.length} câu
                        </span>
                      )}
                    </div>
                    
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
                        {/* Table hiển thị câu hỏi như cũ */}
                        <table className="table table-hover" style={{
                          color: theme === 'dark' ? '#e2e8f0' : '#2d3748',
                          backgroundColor: theme === 'dark' ? '#1a202c' : '#ffffff',
                          marginBottom: 0
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
                                const matchesSearch = !questionSearchTerm || 
                                  q.content?.toLowerCase().includes(questionSearchTerm.toLowerCase());
                                const matchesTopic = !selectedTopic || q.topicId === selectedTopic;
                                const matchesDifficulty = !selectedDifficulty || q.difficulty === selectedDifficulty;
                                return matchesSearch && matchesTopic && matchesDifficulty;
                              })
                              .map(question => {
                                const isSelected = selectedQuestions.some(q => q.id === question.id);
                                
                                return (
                                  <tr key={question.id} style={{
                                    backgroundColor: isSelected ? 
                                      (theme === 'dark' ? '#2a4365' : '#ebf8ff') : 'inherit'
                                  }}>
                                    <td>{question.id}</td>
                                    <td>
                                      <div style={{
                                        maxHeight: '60px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}>
                                        {question.content}
                                      </div>
                                    </td>
                                    <td>
                                      <span className={`badge ${
                                        question.difficulty === 'easy' ? 'bg-success' :
                                        question.difficulty === 'medium' ? 'bg-warning' : 'bg-danger'
                                      }`}>
                                        {question.difficulty === 'easy' ? 'Dễ' : 
                                         question.difficulty === 'medium' ? 'TB' : 'Khó'}
                                      </span>
                                    </td>
                                    <td>
                                      {isSelected ? (
                                        <Input
                                          type="number"
                                          min="0.1"
                                          step="0.1"
                                          value={selectedQuestions.find(q => q.id === question.id)?.score || 1}
                                          style={{width: '70px', padding: '4px'}}
                                          onChange={(e) => {
                                            const newScore = parseFloat(e.target.value);
                                            if (!isNaN(newScore)) {
                                              setSelectedQuestions(prev => 
                                                prev.map(q => 
                                                  q.id === question.id ? {...q, score: newScore} : q
                                                )
                                              );
                                            }
                                          }}
                                        />
                                      ) : (
                                        <span className="text-muted">--</span>
                                      )}
                                    </td>
                                    <td>
                                      {isSelected ? (
                                        <button
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={() => {
                                            setSelectedQuestions(prev => 
                                              prev.filter(q => q.id !== question.id)
                                            );
                                          }}
                                        >
                                          <i className="fas fa-times me-1"></i>
                                          Bỏ chọn
                                        </button>
                                      ) : (
                                        <button
                                          className="btn btn-sm btn-outline-primary"
                                          onClick={() => {
                                            setSelectedQuestions(prev => [
                                              ...prev, 
                                              {...question, score: 1}
                                            ]);
                                          }}
                                        >
                                          <i className="fas fa-plus me-1"></i>
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
                        <i className="fas fa-info-circle me-2"></i>
                        Không có câu hỏi nào cho môn học này. Vui lòng tạo câu hỏi trước khi tạo đề thi.
                      </div>
                    )}
                  </div>
                )}
                
                {/* Phần hiển thị câu hỏi đã chọn */}
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
                      <table className="table table-sm" style={{
                        color: theme === 'dark' ? '#e2e8f0' : '#2d3748',
                        backgroundColor: theme === 'dark' ? '#1a202c' : '#ffffff',
                        marginBottom: 0
                      }}>
                        <thead style={{
                          position: 'sticky',
                          top: 0,
                          backgroundColor: theme === 'dark' ? '#2d3748' : '#f7fafc',
                          zIndex: 10
                        }}>
                          <tr>
                            <th style={{width: '40px'}}>#</th>
                            <th style={{width: '50px'}}>ID</th>
                            <th>Nội dung</th>
                            <th style={{width: '80px'}}>Độ khó</th>
                            <th style={{width: '80px'}}>Điểm</th>
                            <th style={{width: '80px'}}>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedQuestions.map((question, index) => (
                            <tr key={question.id}>
                              <td className="fw-bold text-primary">{index + 1}</td>
                              <td>{question.id}</td>
                              <td>
                                <div style={{
                                  maxHeight: '50px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {question.content}
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${
                                  question.difficulty === 'easy' ? 'bg-success' :
                                  question.difficulty === 'medium' ? 'bg-warning' : 'bg-danger'
                                }`}>
                                  {question.difficulty === 'easy' ? 'Dễ' : 
                                   question.difficulty === 'medium' ? 'TB' : 'Khó'}
                                </span>
                              </td>
                              <td>
                                <Input
                                  type="number"
                                  min="0.1"
                                  step="0.1"
                                  value={question.score || 1}
                                  style={{width: '70px', padding: '4px'}}
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
                                <div className="btn-group">
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => {
                                      setSelectedQuestions(prev => 
                                        prev.filter((_, i) => i !== index)
                                      );
                                    }}
                                    title="Xóa câu hỏi"
                                  >
                                    <i className="fas fa-trash me-1"></i>
                                    Xóa
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
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Chưa có câu hỏi nào được chọn. {isRandomMode ? 'Sử dụng chế độ chọn nhanh ở trên hoặc' : 'Vui lòng'} thêm ít nhất một câu hỏi để tạo đề thi.
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
          
          <FormGroup>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                checked={isDraft}
                onChange={() => setIsDraft(!isDraft)}
              />
              <CheckboxLabel theme={theme}>
                Tạo đề thi nháp (có thể thêm câu hỏi sau)
              </CheckboxLabel>
            </CheckboxContainer>
          </FormGroup>
          
          <ButtonContainer>
            <CancelButton 
              type="button" 
              onClick={handleCancel}
              theme={theme}
            >
              <i className="fas fa-times me-2"></i>
              Hủy bỏ
            </CancelButton>
            <SubmitButton 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  Đang tạo...
                </>
              ) : (
                <>
                  <i className="fas fa-check me-2"></i>
                  {isDraft ? 'Tạo đề thi nháp' : 'Tạo đề thi'}
                </>
              )}
            </SubmitButton>
          </ButtonContainer>
        </FormCard>
      </form>
    </Container>
  );
};

export default CreateExam;