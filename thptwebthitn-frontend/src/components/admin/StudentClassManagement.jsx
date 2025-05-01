import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaUsers, FaUserGraduate, FaFileExport, 
  FaCheckCircle, FaDownload, FaSearch, 
  FaFilter, FaSyncAlt, FaSortAmountDown, 
  FaSortAmountUp, FaPrint, FaEye, FaEdit,
  FaGraduationCap, FaSchool, FaIdCard, FaArrowDown 
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { fetchUsers } from '../../redux/userSlice';
import { fetchExams, fetchExamResults } from '../../redux/examSlice'; 
import { fetchClasses } from '../../redux/classSlice';
import { showSuccessToast, showErrorToast } from '../../utils/toastUtils';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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

const ActionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
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
      : props.warning
        ? '#ed8936'
        : props.theme === 'dark' ? '#2d3748' : '#e2e8f0'};
  color: ${props => props.primary || props.success || props.warning
    ? 'white' 
    : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  
  &:hover {
    background-color: ${props => props.primary 
      ? '#3182ce' 
      : props.success
        ? '#38a169'
        : props.warning
          ? '#dd6b20'
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
  flex-wrap: wrap;
  gap: 1rem;
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

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterGroup = styled.div`
  flex: 1;
  min-width: 200px;
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
  width: 100%;
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
    text-align: left;
  }
  
  th {
    background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#f7fafc'};
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
    font-weight: 600;
    cursor: pointer;
    
    &:hover {
      background-color: ${props => props.theme === 'dark' ? '#718096' : '#edf2f7'};
    }
  }
  
  td {
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
  
  tr:hover {
    background-color: ${props => props.theme === 'dark' ? 'rgba(74, 85, 104, 0.2)' : 'rgba(237, 242, 247, 0.5)'};
  }
`;

const TableHeader = styled.th`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionIcons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  background-color: ${props => 
    props.view 
      ? props.theme === 'dark' ? '#2b6cb0' : '#ebf8ff'
      : props.edit
        ? props.theme === 'dark' ? '#2f855a' : '#f0fff4'
        : props.approve
          ? props.theme === 'dark' ? '#7b341e' : '#fffaf0'
          : '#e2e8f0'
  };
  color: ${props => 
    props.view 
      ? props.theme === 'dark' ? '#ebf8ff' : '#2b6cb0'
      : props.edit
        ? props.theme === 'dark' ? '#f0fff4' : '#2f855a'
        : props.approve
          ? props.theme === 'dark' ? '#fffaf0' : '#7b341e'
          : '#4a5568'
  };
  
  &:hover {
    background-color: ${props => 
      props.view 
        ? props.theme === 'dark' ? '#3182ce' : '#bee3f8'
        : props.edit
          ? props.theme === 'dark' ? '#38a169' : '#c6f6d5'
          : props.approve
            ? props.theme === 'dark' ? '#9c4221' : '#feebc8'
            : '#cbd5e0'
    };
  }
`;

const Badge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${props => {
    if (props.status === 'approved') return props.theme === 'dark' ? '#276749' : '#C6F6D5';
    if (props.status === 'pending') return props.theme === 'dark' ? '#7B341E' : '#FEEBC8';
    if (props.status === 'failed') return props.theme === 'dark' ? '#9B2C2C' : '#FED7D7';
    return props.theme === 'dark' ? '#4a5568' : '#e2e8f0';
  }};
  color: ${props => {
    if (props.status === 'approved') return props.theme === 'dark' ? '#C6F6D5' : '#276749';
    if (props.status === 'pending') return props.theme === 'dark' ? '#FEEBC8' : '#7B341E';
    if (props.status === 'failed') return props.theme === 'dark' ? '#FED7D7' : '#9B2C2C';
    return props.theme === 'dark' ? '#e2e8f0' : '#4a5568';
  }};
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
`;

const PageInfo = styled.div`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const PageButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  background-color: ${props => props.active 
    ? '#4299e1' 
    : props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  color: ${props => props.active 
    ? 'white' 
    : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active 
      ? '#3182ce' 
      : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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

const InfoBox = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 0.375rem;
  background-color: ${props => 
    props.info
      ? props.theme === 'dark' ? 'rgba(66, 153, 225, 0.1)' : 'rgba(66, 153, 225, 0.05)'
      : props.success
        ? props.theme === 'dark' ? 'rgba(72, 187, 120, 0.1)' : 'rgba(72, 187, 120, 0.05)'
        : props.warning
          ? props.theme === 'dark' ? 'rgba(237, 137, 54, 0.1)' : 'rgba(237, 137, 54, 0.05)'
          : props.error
            ? props.theme === 'dark' ? 'rgba(245, 101, 101, 0.1)' : 'rgba(245, 101, 101, 0.05)'
            : props.theme === 'dark' ? 'rgba(74, 85, 104, 0.2)' : 'rgba(226, 232, 240, 0.5)'
  };
  border-left: 4px solid ${props => 
    props.info
      ? '#4299e1'
      : props.success
        ? '#48bb78'
        : props.warning
          ? '#ed8936'
          : props.error
            ? '#f56565'
            : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'
  };
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const StudentClassManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  
  // States
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'fullName', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    approvedGrades: 0,
    pendingGrades: 0,
    failedGrades: 0
  });
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch students, classes, and exams in parallel
        const [usersResponse, classesResponse, examsResponse] = await Promise.all([
          dispatch(fetchUsers({ role: 'Student' })).unwrap(),
          dispatch(fetchClasses()).unwrap(),
          dispatch(fetchExams()).unwrap(),
        ]);
        
        setStudents(usersResponse);
        setClasses(classesResponse);
        setExams(examsResponse);
        setFilteredStudents(usersResponse);
        
        // Calculate stats
        calculateStats(usersResponse);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        showErrorToast('Có lỗi xảy ra khi tải dữ liệu');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch]);
  
  // Update filtered students when filters change
  useEffect(() => {
    let filtered = [...students];
    
    // Filter by class
    if (selectedClass) {
      filtered = filtered.filter(student => student.class?.id === selectedClass);
    }
    
    // Filter by grade
    if (selectedGrade) {
      filtered = filtered.filter(student => student.grade === selectedGrade);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(student => 
        student.fullName?.toLowerCase().includes(term) ||
        student.studentId?.toLowerCase().includes(term) ||
        student.username?.toLowerCase().includes(term) ||
        student.email?.toLowerCase().includes(term)
      );
    }
    
    // Sort data
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
        if (!a[sortConfig.key]) return 1;
        if (!b[sortConfig.key]) return -1;
        
        const valueA = typeof a[sortConfig.key] === 'string' 
          ? a[sortConfig.key].toLowerCase() 
          : a[sortConfig.key];
          
        const valueB = typeof b[sortConfig.key] === 'string' 
          ? b[sortConfig.key].toLowerCase() 
          : b[sortConfig.key];
        
        if (valueA < valueB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredStudents(filtered);
    calculateStats(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [students, selectedClass, selectedGrade, searchTerm, sortConfig]);
  
  // Calculate statistics
  const calculateStats = (studentsData) => {
    const totalStudents = studentsData.length;
    const approvedGrades = studentsData.filter(student => student.gradesStatus === 'approved').length;
    const pendingGrades = studentsData.filter(student => student.gradesStatus === 'pending').length;
    const failedGrades = studentsData.filter(student => student.gradesStatus === 'failed').length;
    
    setStats({
      totalStudents,
      approvedGrades,
      pendingGrades,
      failedGrades
    });
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled in the useEffect
  };
  
  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Get the appropriate sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    
    return sortConfig.direction === 'asc' 
      ? <FaSortAmountUp size={12} />
      : <FaSortAmountDown size={12} />;
  };
  
  // Get current students for pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Handle class change
  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };
  
  // Handle grade change
  const handleGradeChange = (e) => {
    setSelectedGrade(e.target.value);
  };
  
  // Handle student selection
  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };
  
  // Handle select all students
  const handleSelectAll = () => {
    if (selectedStudents.length === currentStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(currentStudents.map(student => student.id));
    }
  };
  
  // Handle approve grades
  const handleApproveGrades = async () => {
    try {
      if (selectedStudents.length === 0) {
        showErrorToast('Vui lòng chọn ít nhất một học sinh');
        return;
      }
      
      // In a real app, call your API to approve grades
      // const response = await approveStudentGrades(selectedStudents);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccessToast(`Đã duyệt điểm cho ${selectedStudents.length} học sinh`);
      
      // Update local state
      const updatedStudents = students.map(student => 
        selectedStudents.includes(student.id)
          ? { ...student, gradesStatus: 'approved' }
          : student
      );
      
      setStudents(updatedStudents);
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error approving grades:', error);
      showErrorToast('Có lỗi xảy ra khi duyệt điểm');
    }
  };
  
  // Export student data to Excel
  const handleExportToExcel = () => {
    try {
      // Determine which students to export
      const studentsToExport = selectedStudents.length > 0
        ? filteredStudents.filter(student => selectedStudents.includes(student.id))
        : filteredStudents;
      
      if (studentsToExport.length === 0) {
        showErrorToast('Không có dữ liệu học sinh để xuất');
        return;
      }
      
      // Prepare data for export
      const exportData = studentsToExport.map(student => ({
        'Mã học sinh': student.studentId || '',
        'Họ và tên': student.fullName || '',
        'Lớp': student.class?.name || '',
        'Khối': student.grade || '',
        'Email': student.email || '',
        'Số điện thoại': student.phone || '',
        'Địa chỉ': student.address || '',
        'Ngày sinh': student.birthDate || '',
        'Điểm trung bình': student.averageGrade || '',
        'Trạng thái': student.gradesStatus || '',
      }));
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách học sinh');
      
      // Generate file name
      const fileName = selectedClass 
        ? `danh_sach_hs_lop_${classes.find(c => c.id === selectedClass)?.name || selectedClass}.xlsx`
        : 'danh_sach_hoc_sinh.xlsx';
      
      // Export to file
      XLSX.writeFile(workbook, fileName);
      
      showSuccessToast(`Đã xuất ${exportData.length} học sinh ra file Excel`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      showErrorToast('Có lỗi xảy ra khi xuất file Excel');
    }
  };
  
  // Handle print
  const handlePrint = () => {
    window.print();
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setSelectedClass('');
    setSelectedGrade('');
    setSearchTerm('');
    setSortConfig({ key: 'fullName', direction: 'asc' });
  };
  
  // Handle view student details
  const handleViewStudent = (studentId) => {
    navigate(`/admin/students/${studentId}`);
  };
  
  // Handle edit student
  const handleEditStudent = (studentId) => {
    navigate(`/admin/students/${studentId}/edit`);
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
          <Title theme={theme}>
            <FaSchool /> Quản lý học sinh theo lớp
          </Title>
          <Subtitle theme={theme}>Xem, duyệt và xuất thông tin học sinh theo lớp</Subtitle>
        </div>
        
        <ActionsContainer>
          <Button 
            onClick={handleExportToExcel} 
            theme={theme}
            disabled={filteredStudents.length === 0}
          >
            <FaFileExport /> Xuất Excel
          </Button>
          
          <Button 
            onClick={handlePrint} 
            theme={theme}
            disabled={filteredStudents.length === 0}
          >
            <FaPrint /> In danh sách
          </Button>
          
          <Button 
            primary 
            onClick={handleApproveGrades}
            disabled={selectedStudents.length === 0}
          >
            <FaCheckCircle /> Duyệt điểm
          </Button>
        </ActionsContainer>
      </Header>
      
      <Card theme={theme}>
        <CardHeader theme={theme}>
          <CardTitle theme={theme}>
            <FaFilter /> Lọc danh sách
          </CardTitle>
          <Button onClick={handleResetFilters} theme={theme}>
            <FaSyncAlt /> Đặt lại
          </Button>
        </CardHeader>
        <CardBody>
          <FiltersContainer>
            <FilterGroup>
              <Label theme={theme}>Lớp</Label>
              <Select 
                value={selectedClass}
                onChange={handleClassChange}
                theme={theme}
              >
                <option value="">Tất cả lớp</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </Select>
            </FilterGroup>
            
            <FilterGroup>
              <Label theme={theme}>Khối</Label>
              <Select 
                value={selectedGrade}
                onChange={handleGradeChange}
                theme={theme}
              >
                <option value="">Tất cả khối</option>
                <option value="10">Khối 10</option>
                <option value="11">Khối 11</option>
                <option value="12">Khối 12</option>
              </Select>
            </FilterGroup>
          </FiltersContainer>
          
          <SearchContainer>
            <SearchInput 
              type="text"
              placeholder="Tìm kiếm theo tên, mã học sinh, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              theme={theme}
            />
            <SearchButton onClick={handleSearch}>
              <FaSearch />
            </SearchButton>
          </SearchContainer>
          
          <StatsRow>
            <StatCard theme={theme}>
              <StatLabel theme={theme}>Tổng học sinh</StatLabel>
              <StatValue theme={theme}>{stats.totalStudents}</StatValue>
            </StatCard>
            
            <StatCard theme={theme}>
              <StatLabel theme={theme}>Đã duyệt điểm</StatLabel>
              <StatValue theme={theme}>{stats.approvedGrades}</StatValue>
            </StatCard>
            
            <StatCard theme={theme}>
              <StatLabel theme={theme}>Chưa duyệt điểm</StatLabel>
              <StatValue theme={theme}>{stats.pendingGrades}</StatValue>
            </StatCard>
          </StatsRow>
        </CardBody>
      </Card>
      
      <Card theme={theme}>
        <CardHeader theme={theme}>
          <CardTitle theme={theme}>
            <FaUserGraduate /> Danh sách học sinh
          </CardTitle>
          <div>
            {selectedStudents.length > 0 && (
              <span style={{ marginRight: '1rem', fontSize: '0.875rem' }}>
                Đã chọn {selectedStudents.length} học sinh
              </span>
            )}
          </div>
        </CardHeader>
        <CardBody>
          {filteredStudents.length > 0 ? (
            <div className="table-responsive">
              <Table theme={theme}>
                <thead>
                  <tr>
                    <th>
                      <input 
                        type="checkbox" 
                        checked={selectedStudents.length === currentStudents.length && currentStudents.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <TableHeader onClick={() => handleSort('studentId')}>
                      Mã HS {getSortIcon('studentId')}
                    </TableHeader>
                    <TableHeader onClick={() => handleSort('fullName')}>
                      Họ và tên {getSortIcon('fullName')}
                    </TableHeader>
                    <TableHeader onClick={() => handleSort('class.name')}>
                      Lớp {getSortIcon('class.name')}
                    </TableHeader>
                    <TableHeader onClick={() => handleSort('grade')}>
                      Khối {getSortIcon('grade')}
                    </TableHeader>
                    <TableHeader onClick={() => handleSort('averageGrade')}>
                      Điểm TB {getSortIcon('averageGrade')}
                    </TableHeader>
                    <TableHeader onClick={() => handleSort('gradesStatus')}>
                      Trạng thái {getSortIcon('gradesStatus')}
                    </TableHeader>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.map(student => (
                    <tr key={student.id}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleSelectStudent(student.id)}
                        />
                      </td>
                      <td>{student.studentId || 'N/A'}</td>
                      <td>{student.fullName || student.username}</td>
                      <td>{student.class?.name || 'Chưa gán'}</td>
                      <td>{student.grade || 'N/A'}</td>
                      <td>{student.averageGrade?.toFixed(1) || 'N/A'}</td>
                      <td>
                        <Badge
                          status={student.gradesStatus || 'pending'}
                          theme={theme}
                        >
                          {student.gradesStatus === 'approved' ? 'Đã duyệt' :
                           student.gradesStatus === 'pending' ? 'Chưa duyệt' :
                           student.gradesStatus === 'failed' ? 'Không đạt' : 'N/A'}
                        </Badge>
                      </td>
                      <td>
                        <ActionIcons>
                          <ActionButton 
                            view
                            theme={theme} 
                            title="Xem chi tiết"
                            onClick={() => handleViewStudent(student.id)}
                          >
                            <FaEye />
                          </ActionButton>
                          <ActionButton 
                            edit
                            theme={theme}
                            title="Chỉnh sửa"
                            onClick={() => handleEditStudent(student.id)}
                          >
                            <FaEdit />
                          </ActionButton>
                        </ActionIcons>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              <Pagination>
                <PageInfo theme={theme}>
                  Hiển thị {indexOfFirstStudent + 1}-
                  {indexOfLastStudent > filteredStudents.length 
                    ? filteredStudents.length 
                    : indexOfLastStudent} 
                  trên {filteredStudents.length} học sinh
                </PageInfo>
                
                <PageButtons>
                  <PageButton 
                    onClick={() => paginate(1)} 
                    disabled={currentPage === 1}
                    theme={theme}
                  >
                    «
                  </PageButton>
                  <PageButton 
                    onClick={() => paginate(currentPage - 1)} 
                    disabled={currentPage === 1}
                    theme={theme}
                  >
                    ‹
                  </PageButton>
                  
                  {/* Generate page numbers */}
                  {[...Array(Math.ceil(filteredStudents.length / studentsPerPage))].map((_, i) => {
                    // Show limited number of pages for better UI
                    if (
                      i === 0 || 
                      i === Math.ceil(filteredStudents.length / studentsPerPage) - 1 ||
                      (i >= currentPage - 2 && i <= currentPage + 1)
                    ) {
                      return (
                        <PageButton 
                          key={i} 
                          onClick={() => paginate(i + 1)}
                          active={currentPage === i + 1}
                          theme={theme}
                        >
                          {i + 1}
                        </PageButton>
                      );
                    } else if (
                      i === currentPage - 3 ||
                      i === currentPage + 2
                    ) {
                      return <span key={i}>...</span>;
                    }
                    return null;
                  })}
                  
                  <PageButton 
                    onClick={() => paginate(currentPage + 1)} 
                    disabled={currentPage === Math.ceil(filteredStudents.length / studentsPerPage)}
                    theme={theme}
                  >
                    ›
                  </PageButton>
                  <PageButton 
                    onClick={() => paginate(Math.ceil(filteredStudents.length / studentsPerPage))} 
                    disabled={currentPage === Math.ceil(filteredStudents.length / studentsPerPage)}
                    theme={theme}
                  >
                    »
                  </PageButton>
                </PageButtons>
              </Pagination>
            </div>
          ) : (
            <EmptyState theme={theme}>
              <FaUserGraduate size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Không tìm thấy học sinh nào phù hợp với bộ lọc hiện tại.</p>
              <Button 
                onClick={handleResetFilters}
                theme={theme}
                style={{ marginTop: '1rem' }}
              >
                <FaSyncAlt /> Đặt lại bộ lọc
              </Button>
            </EmptyState>
          )}
        </CardBody>
      </Card>
      
      <InfoBox info theme={theme}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaArrowDown />
          <strong>Hướng dẫn:</strong>
        </div>
        <ul>
          <li>Chọn học sinh bằng cách tích vào ô bên trái mỗi học sinh.</li>
          <li>Nhấn "Duyệt điểm" để duyệt điểm cho các học sinh đã chọn.</li>
          <li>Sử dụng chức năng "Xuất Excel" để xuất danh sách học sinh ra file Excel.</li>
          <li>Nhấn vào tên cột để sắp xếp dữ liệu theo cột đó.</li>
        </ul>
      </InfoBox>
    </Container>
  );
};

export default StudentClassManagement;