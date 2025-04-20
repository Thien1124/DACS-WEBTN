import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { 
  FaBookOpen, FaChartBar, FaUsers, FaCheckCircle, 
  FaSearch, FaPrint, FaFileExport, FaFilter, FaSortAmountDown 
} from 'react-icons/fa';
import { fetchExamStats } from '../../redux/statsSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 8px;
  background: ${props => props.primary 
    ? 'linear-gradient(135deg, #4285f4, #34a853)' 
    : props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.primary ? '#ffffff' : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  max-width: 500px;
  
  @media (max-width: 768px) {
    max-width: 100%;
    width: 100%;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px 0 0 8px;
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  
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
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  
  &:hover {
    background-color: #3182ce;
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: ${props => props.active ? '#4299e1' : 'transparent'};
  color: ${props => props.active ? 'white' : props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  border: 1px solid ${props => props.active ? '#4299e1' : props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: ${props => props.active ? '600' : '400'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? '#3182ce' : props.theme === 'dark' ? '#4a556820' : '#e2e8f020'};
  }
`;

const StatisticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => {
    switch(props.type) {
      case 'exams': return 'linear-gradient(135deg, #4285f4, #34a853)';
      case 'attempts': return 'linear-gradient(135deg, #ea4335, #fbbc05)';
      case 'average': return 'linear-gradient(135deg, #805ad5, #3182ce)';
      default: return 'linear-gradient(135deg, #4285f4, #34a853)';
    }
  }};
  color: white;
`;

const StatTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const StatFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${props => props.positive ? '#48bb78' : props.negative ? '#f56565' : '#a0aec0'};
`;

const ChartSection = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
  height: 400px;
`;

const ChartTitle = styled.h2`
  font-size: 1.25rem;
  margin: 0 0 1.5rem 0;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-top: 2rem;
`;

const TableHead = styled.thead`
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#f7fafc'};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#3a4966' : '#f7fafc'};
  }
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  cursor: ${props => props.sortable ? 'pointer' : 'default'};
  
  &:hover {
    background-color: ${props => props.sortable ? (props.theme === 'dark' ? '#4a556880' : '#e2e8f080') : 'transparent'};
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const ExamStatistics = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector(state => state.ui);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(false);
  
  // This would normally come from the Redux store
  const [stats, setStats] = useState({
    totalExams: 0,
    totalAttempts: 0,
    averageScore: 0,
    subjectStats: []
  });
  
  useEffect(() => {
    loadStats();
  }, [timeRange]);
  
  const loadStats = async () => {
    setLoading(true);
    
    // In a real app, we'd dispatch an action to fetch stats from the API
    // For now, we'll use mock data
    setTimeout(() => {
      const mockStats = {
        totalExams: 127,
        totalAttempts: 3542,
        averageScore: 7.6,
        subjectStats: [
          { 
            id: 1, 
            name: 'Toán học', 
            totalExams: 42, 
            totalAttempts: 1243, 
            averageScore: 7.2,
            previousAverageScore: 6.9,
            change: 4.3
          },
          { 
            id: 2, 
            name: 'Vật lý', 
            totalExams: 28, 
            totalAttempts: 856, 
            averageScore: 7.4,
            previousAverageScore: 7.6,
            change: -2.6
          },
          { 
            id: 3, 
            name: 'Hóa học', 
            totalExams: 21, 
            totalAttempts: 652, 
            averageScore: 8.1,
            previousAverageScore: 7.8,
            change: 3.8
          },
          { 
            id: 4, 
            name: 'Sinh học', 
            totalExams: 18, 
            totalAttempts: 432, 
            averageScore: 7.8,
            previousAverageScore: 7.5,
            change: 4.0
          },
          { 
            id: 5, 
            name: 'Ngữ văn', 
            totalExams: 16, 
            totalAttempts: 359, 
            averageScore: 8.3,
            previousAverageScore: 8.2,
            change: 1.2
          },
        ]
      };
      
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  };
  
  const handleExportData = () => {
    // Create CSV content
    let csvContent = "Môn học,Số đề thi,Lượt thi,Điểm trung bình\n";
    
    stats.subjectStats.forEach(subject => {
      csvContent += `${subject.name},${subject.totalExams},${subject.totalAttempts},${subject.averageScore}\n`;
    });
    
    // Create a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'thong_ke_de_thi_theo_mon.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handlePrint = () => {
    window.print();
  };
  
  const filteredSubjects = stats.subjectStats.filter(subject => 
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'week': return 'tuần qua';
      case 'month': return 'tháng qua';
      case 'quarter': return 'quý vừa qua';
      case 'year': return 'năm qua';
      default: return 'tháng qua';
    }
  };
  
  // Prepare chart data
  const chartData = stats.subjectStats.map(subject => ({
    name: subject.name,
    'Số đề thi': subject.totalExams,
    'Lượt thi': subject.totalAttempts / 20, // Scaled down for visualization
    'Điểm TB': subject.averageScore,
  }));
  
  return (
    <Container>
      <Header>
        <Title theme={theme}>Thống kê đề thi theo môn học</Title>
        <ButtonsContainer>
          <Button theme={theme} onClick={handleExportData}>
            <FaFileExport /> Xuất Excel
          </Button>
          <Button theme={theme} onClick={handlePrint}>
            <FaPrint /> In báo cáo
          </Button>
        </ButtonsContainer>
      </Header>
      
      <FiltersRow>
        <SearchContainer>
          <SearchInput 
            theme={theme}
            placeholder="Tìm kiếm theo môn học..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <SearchButton>
            <FaSearch />
          </SearchButton>
        </SearchContainer>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <FilterButton 
            theme={theme}
            active={timeRange === 'week'} 
            onClick={() => setTimeRange('week')}
          >
            Tuần này
          </FilterButton>
          <FilterButton 
            theme={theme}
            active={timeRange === 'month'} 
            onClick={() => setTimeRange('month')}
          >
            Tháng này
          </FilterButton>
          <FilterButton 
            theme={theme}
            active={timeRange === 'quarter'} 
            onClick={() => setTimeRange('quarter')}
          >
            Quý này
          </FilterButton>
          <FilterButton 
            theme={theme}
            active={timeRange === 'year'} 
            onClick={() => setTimeRange('year')}
          >
            Năm nay
          </FilterButton>
        </div>
      </FiltersRow>
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <StatisticsGrid>
            <StatCard theme={theme}>
              <StatHeader>
                <IconContainer type="exams">
                  <FaBookOpen size={24} />
                </IconContainer>
                <StatTitle theme={theme}>Tổng số đề thi</StatTitle>
              </StatHeader>
              <StatValue theme={theme}>{stats.totalExams}</StatValue>
              <StatFooter positive>
                <FaChartBar /> <span>+8% so với {getTimeRangeLabel()}</span>
              </StatFooter>
            </StatCard>
            
            <StatCard theme={theme}>
              <StatHeader>
                <IconContainer type="attempts">
                  <FaUsers size={24} />
                </IconContainer>
                <StatTitle theme={theme}>Tổng lượt thi</StatTitle>
              </StatHeader>
              <StatValue theme={theme}>{stats.totalAttempts.toLocaleString()}</StatValue>
              <StatFooter positive>
                <FaChartBar /> <span>+12% so với {getTimeRangeLabel()}</span>
              </StatFooter>
            </StatCard>
            
            <StatCard theme={theme}>
              <StatHeader>
                <IconContainer type="average">
                  <FaCheckCircle size={24} />
                </IconContainer>
                <StatTitle theme={theme}>Điểm trung bình</StatTitle>
              </StatHeader>
              <StatValue theme={theme}>{stats.averageScore}</StatValue>
              <StatFooter positive>
                <FaChartBar /> <span>+0.4 điểm so với {getTimeRangeLabel()}</span>
              </StatFooter>
            </StatCard>
          </StatisticsGrid>
          
          <ChartSection theme={theme}>
            <ChartTitle theme={theme}>Biểu đồ thống kê theo môn học</ChartTitle>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4a5568' : '#e2e8f0'} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: theme === 'dark' ? '#e2e8f0' : '#2d3748' }} 
                />
                <YAxis tick={{ fill: theme === 'dark' ? '#e2e8f0' : '#2d3748' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#4a5568' : '#ffffff',
                    color: theme === 'dark' ? '#e2e8f0' : '#2d3748',
                    border: `1px solid ${theme === 'dark' ? '#2d3748' : '#e2e8f0'}`
                  }} 
                />
                <Legend wrapperStyle={{ color: theme === 'dark' ? '#e2e8f0' : '#2d3748' }} />
                <Bar dataKey="Số đề thi" fill="#4285f4" />
                <Bar dataKey="Lượt thi" fill="#ea4335" />
                <Bar dataKey="Điểm TB" fill="#805ad5" />
              </BarChart>
            </ResponsiveContainer>
          </ChartSection>
          
          <Table theme={theme}>
            <TableHead theme={theme}>
              <TableRow theme={theme}>
                <TableHeader theme={theme} sortable>Môn học</TableHeader>
                <TableHeader theme={theme} sortable>Số đề thi</TableHeader>
                <TableHeader theme={theme} sortable>Lượt thi</TableHeader>
                <TableHeader theme={theme} sortable>Điểm trung bình</TableHeader>
                <TableHeader theme={theme}>Biến động</TableHeader>
              </TableRow>
            </TableHead>
            <tbody>
              {filteredSubjects.map(subject => (
                <TableRow key={subject.id} theme={theme}>
                  <TableCell theme={theme}><strong>{subject.name}</strong></TableCell>
                  <TableCell theme={theme}>{subject.totalExams}</TableCell>
                  <TableCell theme={theme}>{subject.totalAttempts.toLocaleString()}</TableCell>
                  <TableCell theme={theme}>{subject.averageScore}</TableCell>
                  <TableCell theme={theme}>
                    <div style={{ 
                      color: subject.change > 0 ? '#48bb78' : '#f56565',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      {subject.change > 0 ? '↑' : '↓'} {Math.abs(subject.change)}%
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
          
          {filteredSubjects.length === 0 && (
            <EmptyState theme={theme}>
              <FaSearch size={48} color={theme === 'dark' ? '#4a5568' : '#cbd5e0'} />
              <h3>Không tìm thấy dữ liệu</h3>
              <p>Không có dữ liệu thống kê nào phù hợp với bộ lọc hiện tại.</p>
            </EmptyState>
          )}
        </>
      )}
    </Container>
  );
};

export default ExamStatistics;