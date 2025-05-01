import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaSearch, FaUserGraduate, FaClipboardList, 
  FaUserPlus, FaUserMinus, FaSave, FaTimes, 
  FaFilter, FaSync, FaArrowLeft
} from 'react-icons/fa';
import { fetchExams } from '../../redux/examSlice';
import { fetchUsers } from '../../redux/userSlice';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import LoadingSpinner from '../common/LoadingSpinner';

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
    : props.theme === 'dark' ? '#2d3748' : '#e2e8f0'};
  color: ${props => props.primary 
    ? 'white' 
    : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:hover {
    background-color: ${props => props.primary 
      ? '#3182ce' 
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

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
  }
`;

const SearchContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-right: none;
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#ffffff'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  cursor: pointer;
  
  &:hover {
    background-color: #3182ce;
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  background-color: ${props => props.active 
    ? '#4299e1' 
    : props.theme === 'dark' ? '#2d3748' : '#e2e8f0'};
  color: ${props => props.active 
    ? 'white' 
    : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: ${props => props.active 
      ? '#3182ce' 
      : props.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const StudentsList = styled.div`
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 0.375rem;
  max-height: 500px;
  overflow-y: auto;
`;

const StudentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#f7fafc'};
  }
`;

const StudentInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StudentName = styled.span`
  font-weight: 500;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const StudentEmail = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background-color: ${props => props.add 
    ? '#48bb78' 
    : props.remove 
      ? '#f56565' 
      : '#4299e1'};
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.add 
      ? '#38a169' 
      : props.remove 
        ? '#e53e3e' 
        : '#3182ce'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const BadgeCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  margin-left: 0.5rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const StatsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 0.375rem;
  padding: 1rem;
  flex: 1;
  min-width: 200px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const StatLabel = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const StatValue = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-top: 0.5rem;
`;

const AssignStudentsToExam = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  
  // States
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [studentFilter, setStudentFilter] = useState('all');
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch exams and students on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Replace these with actual API calls
        const examsResponse = await dispatch(fetchExams()).unwrap();
        const studentsResponse = await dispatch(fetchUsers({role: 'Student'})).unwrap();
        
        // Filter only official exams
        const officialExams = examsResponse.filter(exam => exam.isOfficial);
        setExams(officialExams);
        
        // Filter only student users
        setStudents(studentsResponse);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        showErrorToast('Có lỗi xảy ra khi tải dữ liệu');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch]);
  
  // Update available students when selected exam changes
  useEffect(() => {
    if (selectedExam && students.length > 0) {
      // Here you would typically fetch the students already assigned to this exam
      // For now, we'll use a mock implementation
      const mockAssignedStudentIds = [];
      
      const assigned = students.filter(student => 
        mockAssignedStudentIds.includes(student.id)
      );
      
      const available = students.filter(student => 
        !mockAssignedStudentIds.includes(student.id)
      );
      
      setAssignedStudents(assigned);
      setAvailableStudents(available);
    } else {
      setAssignedStudents([]);
      setAvailableStudents(students);
    }
  }, [selectedExam, students]);
  
  // Filter available students based on search term and filter
  const filteredAvailableStudents = availableStudents.filter(student => {
    const matchesSearch = 
      student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (studentFilter === 'all') return matchesSearch;
    if (studentFilter === 'class10') return matchesSearch && student.grade === '10';
    if (studentFilter === 'class11') return matchesSearch && student.grade === '11';
    if (studentFilter === 'class12') return matchesSearch && student.grade === '12';
    
    return matchesSearch;
  });
  
  // Handle exam selection
  const handleExamChange = (e) => {
    setSelectedExam(e.target.value);
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled by the filter above
  };
  
  // Handle adding a student to the assigned list
  const handleAssignStudent = (student) => {
    setAssignedStudents([...assignedStudents, student]);
    setAvailableStudents(availableStudents.filter(s => s.id !== student.id));
  };
  
  // Handle removing a student from the assigned list
  const handleRemoveStudent = (student) => {
    setAvailableStudents([...availableStudents, student]);
    setAssignedStudents(assignedStudents.filter(s => s.id !== student.id));
  };
  
  // Handle saving assignments
  const handleSaveAssignments = async () => {
    if (!selectedExam) {
      showErrorToast('Vui lòng chọn kỳ thi');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Here you would call your API to save the assignments
      // const response = await assignStudentsToExam(selectedExam, assignedStudents.map(s => s.id));
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccessToast('Phân công học sinh thành công');
      
      // Optionally navigate back
      // navigate('/admin/exams');
    } catch (error) {
      console.error('Error saving assignments:', error);
      showErrorToast('Có lỗi xảy ra khi lưu phân công');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle navigating back
  const handleGoBack = () => {
    navigate('/admin/exams');
  };
  
  if (loading) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <LoadingSpinner size={50} />
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <Header>
        <div>
          <Title theme={theme}>Phân công học sinh vào kỳ thi</Title>
          <Subtitle theme={theme}>Quản lý danh sách học sinh tham gia kỳ thi chính thức</Subtitle>
        </div>
        <Button onClick={handleGoBack}>
          <FaArrowLeft /> Quay lại
        </Button>
      </Header>
      
      <Card theme={theme}>
        <CardHeader theme={theme}>
          <CardTitle theme={theme}>
            <FaClipboardList /> Thông tin kỳ thi
          </CardTitle>
        </CardHeader>
        <CardBody>
          <FormGroup>
            <Label theme={theme}>Chọn kỳ thi*</Label>
            <Select 
              value={selectedExam} 
              onChange={handleExamChange}
              theme={theme}
            >
              <option value="">-- Chọn kỳ thi --</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.title} ({exam.subject?.name || 'Không có môn học'})
                </option>
              ))}
            </Select>
          </FormGroup>
          
          {selectedExam && (
            <StatsRow>
              <StatCard theme={theme}>
                <StatLabel theme={theme}>Tổng số học sinh đã gán</StatLabel>
                <StatValue theme={theme}>{assignedStudents.length}</StatValue>
              </StatCard>
              <StatCard theme={theme}>
                <StatLabel theme={theme}>Học sinh chưa được gán</StatLabel>
                <StatValue theme={theme}>{availableStudents.length}</StatValue>
              </StatCard>
            </StatsRow>
          )}
        </CardBody>
      </Card>
      
      {selectedExam && (
        <Grid>
          <Card theme={theme}>
            <CardHeader theme={theme}>
              <CardTitle theme={theme}>
                <FaUserGraduate /> Học sinh chưa gán
                <BadgeCount theme={theme}>{filteredAvailableStudents.length}</BadgeCount>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <SearchContainer>
                <SearchInput 
                  type="text"
                  placeholder="Tìm kiếm học sinh..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  theme={theme}
                />
                <SearchButton onClick={handleSearch}>
                  <FaSearch />
                </SearchButton>
              </SearchContainer>
              
              <FilterRow>
                <FilterButton 
                  theme={theme}
                  active={studentFilter === 'all'}
                  onClick={() => setStudentFilter('all')}
                >
                  <FaFilter /> Tất cả
                </FilterButton>
                <FilterButton 
                  theme={theme}
                  active={studentFilter === 'class10'}
                  onClick={() => setStudentFilter('class10')}
                >
                  Khối 10
                </FilterButton>
                <FilterButton 
                  theme={theme}
                  active={studentFilter === 'class11'}
                  onClick={() => setStudentFilter('class11')}
                >
                  Khối 11
                </FilterButton>
                <FilterButton 
                  theme={theme}
                  active={studentFilter === 'class12'}
                  onClick={() => setStudentFilter('class12')}
                >
                  Khối 12
                </FilterButton>
              </FilterRow>
              
              <StudentsList theme={theme}>
                {filteredAvailableStudents.length === 0 ? (
                  <EmptyState theme={theme}>
                    Không có học sinh nào phù hợp với bộ lọc.
                  </EmptyState>
                ) : (
                  filteredAvailableStudents.map(student => (
                    <StudentItem key={student.id} theme={theme}>
                      <StudentInfo>
                        <StudentName theme={theme}>{student.fullName || student.username}</StudentName>
                        <StudentEmail theme={theme}>{student.email || 'Không có email'}</StudentEmail>
                      </StudentInfo>
                      <ActionButton 
                        add 
                        onClick={() => handleAssignStudent(student)}
                        title="Gán học sinh này vào kỳ thi"
                      >
                        <FaUserPlus />
                      </ActionButton>
                    </StudentItem>
                  ))
                )}
              </StudentsList>
            </CardBody>
          </Card>
          
          <Card theme={theme}>
            <CardHeader theme={theme}>
              <CardTitle theme={theme}>
                <FaUserGraduate /> Học sinh đã gán
                <BadgeCount theme={theme}>{assignedStudents.length}</BadgeCount>
              </CardTitle>
            </CardHeader>
            <CardBody>
              <StudentsList theme={theme}>
                {assignedStudents.length === 0 ? (
                  <EmptyState theme={theme}>
                    Chưa có học sinh nào được gán vào kỳ thi này.
                  </EmptyState>
                ) : (
                  assignedStudents.map(student => (
                    <StudentItem key={student.id} theme={theme}>
                      <StudentInfo>
                        <StudentName theme={theme}>{student.fullName || student.username}</StudentName>
                        <StudentEmail theme={theme}>{student.email || 'Không có email'}</StudentEmail>
                      </StudentInfo>
                      <ActionButton 
                        remove 
                        onClick={() => handleRemoveStudent(student)}
                        title="Loại bỏ khỏi kỳ thi"
                      >
                        <FaUserMinus />
                      </ActionButton>
                    </StudentItem>
                  ))
                )}
              </StudentsList>
            </CardBody>
            <CardFooter theme={theme}>
              <Button onClick={handleGoBack}>
                <FaTimes /> Hủy bỏ
              </Button>
              <Button 
                primary 
                onClick={handleSaveAssignments}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size={16} color="white" /> Đang lưu...
                  </>
                ) : (
                  <>
                    <FaSave /> Lưu phân công
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </Grid>
      )}
    </Container>
  );
};

export default AssignStudentsToExam;