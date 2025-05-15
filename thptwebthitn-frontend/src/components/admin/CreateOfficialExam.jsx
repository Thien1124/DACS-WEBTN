import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaCalendarAlt, FaClock, FaGraduationCap, 
  FaBook, FaSave, FaTimes, FaSearch, FaFilter
} from 'react-icons/fa';
import { fetchAllSubjects } from '../../redux/subjectSlice';
import { createNewExam } from '../../redux/examSlice';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import apiClient from '../../services/apiClient';

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
`;

const FormCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
  border: none;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#718096' : '#cbd5e0'};
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
  border: none;
  background-color: #4299e1;
  color: white;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: #3182ce;
  }
  
  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #e53e3e;
  margin-top: 0.5rem;
  font-size: 0.875rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
// Add these new styled components
const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FilterGroup = styled.div`
  flex: 1;
  min-width: 200px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.25rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const PageInfo = styled.div`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#e2e8f0'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StudentList = styled.div`
  margin-top: 1rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 0.25rem;
  max-height: 300px;
  overflow-y: auto;
`;

const StudentItem = styled.div`
  padding: 0.75rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  display: flex;
  align-items: center;
  background-color: ${props => props.selected 
    ? (props.theme === 'dark' ? '#4299e1' : '#ebf8ff') 
    : 'transparent'};
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#f7fafc'};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const Checkbox = styled.input`
  margin-right: 1rem;
`;

const StudentInfo = styled.div`
  flex: 1;
`;

const StudentName = styled.div`
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const StudentDetail = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 1rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const NoResultsText = styled.div`
  text-align: center;
  padding: 1rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const SelectionCount = styled.div`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const CreateOfficialExam = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  
  // State for exams data
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  
  // State for student data with pagination and filtering
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentPage, setStudentPage] = useState(1);
  const [studentPageSize, setStudentPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  
  // Add a new state for classroom selection
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  
  // Form data - add studentIds to the initialization
const [formData, setFormData] = useState({
  title: '',
  description: '',
  examId: '',
  startTime: '',
  endTime: '',
  studentIds: [] // Add this line to fix the error
});
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch exams when component mounts
  useEffect(() => {
    fetchExams();
  }, []);
  
  // Fetch students when filters change
  useEffect(() => {
    fetchStudents();
  }, [studentPage, studentPageSize, searchTerm, selectedGrade]);
  
  // Add this in the useEffect section to fetch classrooms when grade changes
  useEffect(() => {
    if (selectedGrade) {
      fetchClassrooms(selectedGrade);
    } else {
      setClassrooms([]);
      setSelectedClassroom('');
    }
  }, [selectedGrade]);
  
  const fetchExams = async () => {
    setLoadingExams(true);
    try {
      const response = await apiClient.get('/api/Exam?page=1&pageSize=50');
      
      console.log('Exam API response:', response);
      
      let examData = [];
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          examData = response.data;
        } else if (Array.isArray(response.data.data)) {
          examData = response.data.data;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          examData = response.data.items;
        }
      }
      
      if (examData.length === 0) {
        showErrorToast('Không có đề thi nào trong hệ thống');
      }
      
      setExams(examData);
    } catch (error) {
      showErrorToast('Không thể tải danh sách đề thi');
      console.error('Error fetching exams:', error);
    } finally {
      setLoadingExams(false);
    }
  };
  
  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      // Build query parameters for filtering
      const params = {
        page: studentPage,
        pageSize: studentPageSize,
        role: 'Student',
      };
      
      // Add search term if provided
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      // Add grade filter if selected
      if (selectedGrade) {
        params.grade = selectedGrade;
      }
      
      console.log('Fetching students with params:', params);
      
      const response = await apiClient.get('/api/User/list', { params });
      
      console.log('Student API response:', response);
      
      if (!response || !response.data) {
        throw new Error('Invalid response format');
      }
      
      // Extract data based on response structure
      let studentData = [];
      let totalCount = 0;
      let pages = 1;
      
      if (Array.isArray(response.data)) {
        studentData = response.data;
        totalCount = response.data.length;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        studentData = response.data.data;
        totalCount = response.data.totalCount || studentData.length;
        pages = response.data.totalPages || Math.ceil(totalCount / studentPageSize);
      } else if (response.data.items && Array.isArray(response.data.items)) {
        studentData = response.data.items;
        totalCount = response.data.totalCount || studentData.length;
        pages = response.data.totalPages || Math.ceil(totalCount / studentPageSize);
      }
      
      // Filter to only include Student roles
      studentData = studentData.filter(user => user.role === 'Student');
      
      // Apply additional grade filtering if needed (in case API filter doesn't work)
      if (selectedGrade) {
        studentData = studentData.filter(student => student.grade === selectedGrade);
      }

      setStudents(studentData);
      setTotalStudents(studentData.length);
      setTotalPages(Math.ceil(studentData.length / studentPageSize));
      
    } catch (error) {
      showErrorToast('Không thể tải danh sách học sinh');
      console.error('Error fetching students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };
  
  // Add this function to fetch classrooms based on grade
  const fetchClassrooms = async (grade) => {
    try {
      const response = await apiClient.get(`/api/classrooms?grade=${grade}`);
      let classroomData = [];
      
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          classroomData = response.data;
        } else if (Array.isArray(response.data.data)) {
          classroomData = response.data.data;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          classroomData = response.data.items;
        }
      }
      
      setClassrooms(classroomData);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      showErrorToast('Không thể tải danh sách lớp học');
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setStudentPage(1); // Reset to first page when search changes
  };
  
  const handleGradeChange = (e) => {
    setSelectedGrade(e.target.value);
    setStudentPage(1); // Reset to first page when grade filter changes
  };
  
  // Add this handler for classroom selection
  const handleClassroomChange = (e) => {
    setSelectedClassroom(e.target.value);
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setStudentPage(newPage);
    }
  };
  
  const toggleStudentSelection = (studentId) => {
    setFormData(prev => {
      const currentIds = [...prev.studentIds];
      const index = currentIds.indexOf(studentId);
      
      if (index === -1) {
        return { ...prev, studentIds: [...currentIds, studentId] };
      } else {
        currentIds.splice(index, 1);
        return { ...prev, studentIds: currentIds };
      }
    });
  };
  
  // Replace the existing validateForm function
const validateForm = () => {
  const newErrors = {};
  
  if (!formData.title.trim()) {
    newErrors.title = 'Tiêu đề không được để trống';
  }
  
  if (!formData.examId) {
    newErrors.examId = 'Vui lòng chọn đề thi';
  }
  
  if (!selectedGrade) {
    newErrors.grade = 'Vui lòng chọn khối';
  }
  
  if (!selectedClassroom) {
    newErrors.classroom = 'Vui lòng chọn lớp';
  }
  
  if (!formData.startTime) {
    newErrors.startTime = 'Vui lòng chọn thời gian bắt đầu';
  }
  
  if (!formData.endTime) {
    newErrors.endTime = 'Vui lòng chọn thời gian kết thúc';
  }
  
  // Check if end time is after start time
  if (formData.startTime && formData.endTime) {
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    
    if (end <= start) {
      newErrors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
    }
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
  
  // Replace the handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (validateForm()) {
    setIsSubmitting(true);
    
    try {
      // Transform the data for the API format
      const apiFormData = {
        title: formData.title.trim(),
        description: formData.description || "", 
        examId: parseInt(formData.examId, 10), 
        startTime: formData.startTime,
        endTime: formData.endTime,
        classroomName: selectedClassroom,
        grade: selectedGrade
      };
      
      console.log('Submitting data:', JSON.stringify(apiFormData, null, 2));
      
      const result = await apiClient.post('/api/official-exams', apiFormData);
      showSuccessToast('Tạo kỳ thi chính thức thành công!');
      navigate('/admin/official-exams');
    } catch (error) {
      console.error('API Error:', error?.response?.data);
      
      // Log detailed validation errors if available
      if (error?.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
      }
      
      showErrorToast(
        error?.response?.data?.title || 
        (error?.response?.data?.errors ? 'Lỗi dữ liệu: ' + JSON.stringify(error.response.data.errors) : null) ||
        error?.message || 
        'Có lỗi xảy ra khi tạo kỳ thi'
      );
    } finally {
      setIsSubmitting(false);
    }
  }
};
  
  const handleCancel = () => {
    navigate('/admin/official-exams');
  };
  
  // Define grade options
  const gradeOptions = [
    { id: '', name: 'Tất cả khối' },
    { id: '10', name: 'Khối 10' },
    { id: '11', name: 'Khối 11' },
    { id: '12', name: 'Khối 12' }
  ];
  
  return (
    <Container>
      <Header>
        <Title theme={theme}>Tạo Kỳ Thi Chính Thức</Title>
        <Subtitle theme={theme}>Thiết lập kỳ thi chính thức dựa trên đề thi có sẵn</Subtitle>
      </Header>
      
      <form onSubmit={handleSubmit}>
        <FormCard theme={theme}>
          <SectionTitle theme={theme}>
            <FaCalendarAlt /> Thông tin kỳ thi
          </SectionTitle>
          
          <FormGroup>
            <Label theme={theme}>Tiêu đề kỳ thi *</Label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="VD: Kỳ thi THPT Quốc gia 2025"
              theme={theme}
            />
            {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
          </FormGroup>
          
          <FormGroup>
            <Label theme={theme}>Mô tả</Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Mô tả ngắn về kỳ thi"
              theme={theme}
            />
          </FormGroup>
          
          <FormGroup>
            <Label theme={theme}>Đề thi *</Label>
            <Select
              name="examId"
              value={formData.examId}
              onChange={handleInputChange}
              theme={theme}
              disabled={loadingExams}
            >
              <option value="">
                {loadingExams ? "Đang tải..." : "-- Chọn đề thi --"}
              </option>
              {Array.isArray(exams) && exams.length > 0 ? 
                exams.map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title}
                  </option>
                )) : 
                <option disabled value="">Không có đề thi nào</option>
              }
            </Select>
            {errors.examId && <ErrorMessage>{errors.examId}</ErrorMessage>}
            {Array.isArray(exams) && exams.length === 0 && !loadingExams && (
              <ErrorMessage>
                Không có đề thi nào. Vui lòng tạo đề thi trước.
              </ErrorMessage>
            )}
          </FormGroup>
          
          <Grid>
            <FormGroup>
              <Label theme={theme}>Thời gian bắt đầu *</Label>
              <Input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                theme={theme}
              />
              {errors.startTime && <ErrorMessage>{errors.startTime}</ErrorMessage>}
            </FormGroup>
            
            <FormGroup>
              <Label theme={theme}>Thời gian kết thúc *</Label>
              <Input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                theme={theme}
              />
              {errors.endTime && <ErrorMessage>{errors.endTime}</ErrorMessage>}
            </FormGroup>
          </Grid>
          
          <SectionTitle theme={theme}>
            <FaGraduationCap /> Chọn lớp tham gia
          </SectionTitle>

          <FilterContainer>
            <FilterGroup>
              <Label theme={theme}><FaFilter /> Chọn khối *</Label>
              <Select
                value={selectedGrade}
                onChange={handleGradeChange}
                theme={theme}
              >
                <option value="">-- Chọn khối --</option>
                {gradeOptions.filter(g => g.id !== '').map(grade => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name}
                  </option>
                ))}
              </Select>
              {errors.grade && <ErrorMessage>{errors.grade}</ErrorMessage>}
            </FilterGroup>
            
            <FilterGroup>
              <Label theme={theme}><FaFilter /> Chọn lớp *</Label>
              <Select
                value={selectedClassroom}
                onChange={handleClassroomChange}
                theme={theme}
                disabled={!selectedGrade || classrooms.length === 0}
              >
                <option value="">
                  {!selectedGrade ? "Vui lòng chọn khối trước" : 
                  classrooms.length === 0 ? "Không có lớp nào" : "-- Chọn lớp --"}
                </option>
                {classrooms.map(classroom => (
                  <option key={classroom.id || classroom.name} value={classroom.id || classroom.name}>
                    {classroom.name}
                  </option>
                ))}
              </Select>
              {errors.classroom && <ErrorMessage>{errors.classroom}</ErrorMessage>}
            </FilterGroup>
          </FilterContainer>

          <FormGroup>
            <Label theme={theme}>Thông tin</Label>
            <div style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '0.25rem', backgroundColor: theme === 'dark' ? '#2d3748' : '#f7fafc' }}>
              {selectedGrade && selectedClassroom ? (
                <>
                  <p>Tất cả học sinh thuộc lớp <strong>{selectedClassroom}</strong> sẽ được tự động thêm vào kỳ thi này.</p>
                </>
              ) : (
                <p>Vui lòng chọn khối và lớp để tiếp tục.</p>
              )}
            </div>
          </FormGroup>
          
          <ButtonContainer>
            <CancelButton 
              type="button" 
              onClick={handleCancel}
              theme={theme}
            >
              <FaTimes /> Hủy bỏ
            </CancelButton>
            <SubmitButton 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang tạo...' : <><FaSave /> Tạo kỳ thi</>}
            </SubmitButton>
          </ButtonContainer>
        </FormCard>
      </form>
    </Container>
  );
};

export default CreateOfficialExam;