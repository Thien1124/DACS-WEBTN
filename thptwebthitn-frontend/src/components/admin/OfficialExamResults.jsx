import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, FaCalendarAlt, FaUserGraduate, FaClock, 
  FaChartBar, FaGraduationCap, FaCheckCircle, FaTimesCircle,
  FaInfoCircle, FaStar, FaStopwatch, FaTrophy, FaPercent,
  FaMedal, FaChevronDown, FaChevronUp, FaChartLine
} from 'react-icons/fa';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, Legend 
} from 'recharts';
import apiClient from '../../services/apiClient';
import { showErrorToast,showSuccessToast } from '../../utils/toastUtils';
import LoadingSpinner from '../common/LoadingSpinner';

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

// Grid layout
const GridLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

// Card components
const Card = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
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

// Status badge
const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 500;
  
  ${props => {
    if (props.status === 'Đang mở') {
      return `
        background: linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%);
        color: #276749;
      `;
    } else if (props.status === 'Sắp diễn ra') {
      return `
        background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
        color: #2b6cb0;
      `;
    } else {
      return `
        background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
        color: #4a5568;
      `;
    }
  }}
`;

// Info Grid
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f7fafc'};
  padding: 1.5rem 1rem;
  border-radius: 0.5rem;
  text-align: center;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  .icon {
    font-size: 1.75rem;
    margin-bottom: 0.75rem;
    color: ${props => props.color || '#4299e1'};
  }
  
  .value {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
  
  .label {
    font-size: 0.85rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  }
`;

// Results release notice
const ResultsNotice = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background-color: ${props => props.released 
    ? (props.theme === 'dark' ? '#234e52' : '#e6fffa') 
    : (props.theme === 'dark' ? '#742a2a' : '#fff5f5')};
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  
  .message {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    svg {
      font-size: 1.25rem;
      color: ${props => props.released 
        ? (props.theme === 'dark' ? '#38b2ac' : '#319795') 
        : (props.theme === 'dark' ? '#f56565' : '#e53e3e')};
    }
    
    span {
      font-weight: 500;
      color: ${props => props.released 
        ? (props.theme === 'dark' ? '#e6fffa' : '#234e52') 
        : (props.theme === 'dark' ? '#fff5f5' : '#742a2a')};
    }
  }
`;

const ReleaseButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${props => props.released 
    ? (props.theme === 'dark' ? '#2c7a7b' : '#81e6d9') 
    : (props.theme === 'dark' ? '#c53030' : '#fc8181')};
  color: ${props => props.released 
    ? (props.theme === 'dark' ? '#e6fffa' : '#234e52') 
    : (props.theme === 'dark' ? '#fff5f5' : '#742a2a')};
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    filter: brightness(110%);
  }
`;

// Score distribution legend
const ChartLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .color {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    background-color: ${props => props.color};
  }
  
  .label {
    font-size: 0.85rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  }
`;

// Expandable student list
const StudentsSection = styled.div`
  margin-top: 1.5rem;
`;

const ExpandHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#1a202c' : '#f7fafc'};
  border-radius: 0.5rem;
  cursor: pointer;
  
  .title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  }
  
  .icon {
    transition: transform 0.3s;
    transform: ${props => props.expanded ? 'rotate(180deg)' : 'rotate(0)'};
  }
`;

const StudentsList = styled.div`
  max-height: ${props => props.expanded ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 1rem;
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
    text-align: center;
  }
`;

const Td = styled.td`
  padding: 0.75rem 1rem;
  vertical-align: middle;
  border-top: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 0.9rem;
  
  &:last-child {
    text-align: center;
  }
`;

// Empty state component
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

// Score badge
const ScoreBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.85rem;
  
  ${props => {
    const score = parseFloat(props.score);
    if (score >= props.passScore) {
      return `
        background-color: #C6F6D5;
        color: #276749;
      `;
    } else {
      return `
        background-color: #FED7D7;
        color: #9B2C2C;
      `;
    }
  }}
`;

// Completion status badge
const CompletionStatus = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 500;
  
  ${props => props.completed ? `
    background-color: #C6F6D5;
    color: #276749;
  ` : `
    background-color: #FED7D7;
    color: #9B2C2C;
  `}
`;

// Chart tooltip
const CustomTooltip = ({ active, payload, label, theme }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: theme === 'dark' ? '#2d3748' : 'white',
        border: `1px solid ${theme === 'dark' ? '#4a5568' : '#e2e8f0'}`,
        padding: '0.75rem',
        borderRadius: '0.375rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ 
          margin: 0, 
          fontWeight: 'bold', 
          color: theme === 'dark' ? '#e2e8f0' : '#2d3748'
        }}>
          {`Điểm: ${label}`}
        </p>
        <p style={{
          margin: '0.25rem 0 0',
          color: theme === 'dark' ? '#a0aec0' : '#718096'
        }}>
          {`Số học sinh: ${payload[0].value}`}
        </p>
      </div>
    );
  }

  return null;
};

// Helper functions
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getScoreBarColor = (range, passScore) => {
  const [min] = range.split('-').map(parseFloat);
  if (min >= passScore) {
    return '#48BB78'; // Green for passing scores
  } else if (min >= passScore - 1) {
    return '#ECC94B'; // Yellow for borderline scores
  } else {
    return '#F56565'; // Red for failing scores
  }
};

const OfficialExamResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useSelector(state => state.ui);
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  
  useEffect(() => {
    fetchStatistics();
  }, [id]);
  
  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/official-exams/${id}/statistics`);
      console.log('Exam statistics:', response.data);
      setStats(response.data);
      
      // Fetch students data
      const examResponse = await apiClient.get(`/api/official-exams/${id}`);
      if (examResponse.data.students) {
        setStudents(examResponse.data.students);
      }
    } catch (error) {
      console.error('Error fetching exam statistics:', error);
      showErrorToast('Không thể tải thống kê kỳ thi');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReleaseResults = async () => {
  try {
    await apiClient.post(`/api/official-exams/${id}/release-results`, {
      release: !stats.resultsReleased,
      notificationMessage: !stats.resultsReleased
        ? "Kết quả kỳ thi đã được công bố cho học sinh"
        : "Kết quả kỳ thi đã bị ẩn"
    });
    showSuccessToast(
      !stats.resultsReleased 
        ? "Đã công bố kết quả kỳ thi thành công" 
        : "Đã ẩn kết quả kỳ thi thành công"
    );
    // Refresh data
    fetchStatistics();
  } catch (error) {
    console.error('Error updating results release status:', error);
    showErrorToast('Không thể cập nhật trạng thái công bố kết quả');
  }
};
  
  const prepareDistributionData = () => {
    if (!stats || !stats.statistics || !stats.statistics.scoreDistribution) {
      return [];
    }
    
    return Object.entries(stats.statistics.scoreDistribution).map(([range, count]) => ({
      range,
      count
    }));
  };
  
  const pieData = () => {
    if (!stats || !stats.statistics) return [];
    
    return [
      { name: 'Đã hoàn thành', value: stats.statistics.completedExams },
      { name: 'Chưa làm bài', value: stats.statistics.totalStudents - stats.statistics.completedExams }
    ];
  };
  
  const passPieData = () => {
    if (!stats || !stats.statistics || stats.statistics.completedExams === 0) return [];
    
    return [
      { name: 'Đạt', value: stats.statistics.passedExams },
      { name: 'Không đạt', value: stats.statistics.completedExams - stats.statistics.passedExams }
    ];
  };
  
  if (loading) {
    return (
      <Container theme={theme}>
        <Header>
          <BackButton 
            theme={theme}
            onClick={() => navigate('/admin/official-exams')}
          >
            <FaArrowLeft /> Quay lại danh sách
          </BackButton>
        </Header>
        
        <LoadingContainer theme={theme}>
          <LoadingSpinner size={60} />
          <h3>Đang tải thống kê kỳ thi</h3>
        </LoadingContainer>
      </Container>
    );
  }
  
  if (!stats) {
    return (
      <Container theme={theme}>
        <Header>
          <BackButton 
            theme={theme}
            onClick={() => navigate('/admin/official-exams')}
          >
            <FaArrowLeft /> Quay lại danh sách
          </BackButton>
        </Header>
        
        <Card theme={theme}>
          <CardBody>
            <EmptyState theme={theme}>
              <FaChartBar />
              <h3>Không tìm thấy thông tin thống kê</h3>
              <p>Không thể tải thông tin thống kê cho kỳ thi này.</p>
            </EmptyState>
          </CardBody>
        </Card>
      </Container>
    );
  }
  
  const distributionData = prepareDistributionData();
  
  return (
    <Container theme={theme}>
      <Header>
        <BackButton 
          theme={theme}
          onClick={() => navigate('/admin/official-exams')}
        >
          <FaArrowLeft /> Quay lại danh sách
        </BackButton>
      </Header>
      
      <TitleSection>
        <Title theme={theme}>Thống kê kết quả kỳ thi</Title>
        <SubTitle theme={theme}>{stats.title}</SubTitle>
      </TitleSection>
      
      <ResultsNotice 
        theme={theme} 
        released={stats.resultsReleased}
      >
        <div className="message">
          {stats.resultsReleased ? (
            <>
              <FaCheckCircle />
              <span>Kết quả đã được công bố cho học sinh</span>
            </>
          ) : (
            <>
              <FaTimesCircle />
              <span>Kết quả chưa được công bố cho học sinh</span>
            </>
          )}
        </div>
        
        <ReleaseButton 
          theme={theme}
          released={stats.resultsReleased}
          onClick={handleReleaseResults}
        >
          {stats.resultsReleased ? 'Ẩn kết quả' : 'Công bố kết quả'}
        </ReleaseButton>
      </ResultsNotice>
      
      <Card 
        theme={theme}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CardHeader theme={theme}>
          <CardTitle theme={theme}>
            <FaInfoCircle /> Thông tin tổng quan
          </CardTitle>
          <StatusBadge status={stats.status}>
            {stats.status}
          </StatusBadge>
        </CardHeader>
        
        <CardBody>
          <InfoGrid>
            <StatCard theme={theme} color="#38B2AC">
              <FaUserGraduate className="icon" />
              <div className="value">{stats.statistics.totalStudents}</div>
              <div className="label">Tổng số học sinh</div>
            </StatCard>
            
            <StatCard theme={theme} color="#4299E1">
              <FaCheckCircle className="icon" />
              <div className="value">{stats.statistics.completedExams}</div>
              <div className="label">Đã hoàn thành</div>
            </StatCard>
            
            <StatCard theme={theme} color="#48BB78">
              <FaTrophy className="icon" />
              <div className="value">{stats.statistics.passedExams}</div>
              <div className="label">Đạt</div>
            </StatCard>
            
            <StatCard theme={theme} color="#ED8936">
              <FaPercent className="icon" />
              <div className="value">{stats.statistics.completionPercentage}%</div>
              <div className="label">Tỷ lệ hoàn thành</div>
            </StatCard>
            
            <StatCard theme={theme} color="#805AD5">
              <FaStar className="icon" />
              <div className="value">{stats.statistics.averageScore.toFixed(2)}</div>
              <div className="label">Điểm trung bình</div>
            </StatCard>
            
            <StatCard theme={theme} color="#DD6B20">
              <FaStopwatch className="icon" />
              <div className="value">{stats.statistics.averageCompletionTimeInMinutes}</div>
              <div className="label">Thời gian TB (phút)</div>
            </StatCard>
          </InfoGrid>
          
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <div style={{ flex: '1', minWidth: '250px' }}>
              <h4 style={{ 
                marginTop: '1rem', 
                color: theme === 'dark' ? '#e2e8f0' : '#2d3748',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FaChartBar /> Tiến độ làm bài
              </h4>
              
              {stats.statistics.totalStudents > 0 ? (
                <div style={{ height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#48BB78" />
                        <Cell fill="#F56565" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem 1rem',
                  color: theme === 'dark' ? '#a0aec0' : '#718096'
                }}>
                  Chưa có học sinh đăng ký
                </div>
              )}
            </div>
            
            <div style={{ flex: '1', minWidth: '250px' }}>
              <h4 style={{ 
                marginTop: '1rem', 
                color: theme === 'dark' ? '#e2e8f0' : '#2d3748',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FaMedal /> Tỷ lệ đạt
              </h4>
              
              {stats.statistics.completedExams > 0 ? (
                <div style={{ height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={passPieData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#38A169" />
                        <Cell fill="#E53E3E" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem 1rem',
                  color: theme === 'dark' ? '#a0aec0' : '#718096'
                }}>
                  Chưa có học sinh hoàn thành bài thi
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
      
      <GridLayout>
        <Card 
          theme={theme}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <CardHeader theme={theme}>
            <CardTitle theme={theme}>
              <FaChartLine /> Phân bố điểm
            </CardTitle>
          </CardHeader>
          
          <CardBody>
            {stats.statistics.completedExams > 0 ? (
              <>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={distributionData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4a5568' : '#e2e8f0'} />
                      <XAxis 
                        dataKey="range" 
                        tick={{ fill: theme === 'dark' ? '#e2e8f0' : '#4a5568' }}
                      />
                      <YAxis 
                        allowDecimals={false}
                        tick={{ fill: theme === 'dark' ? '#e2e8f0' : '#4a5568' }}
                      />
                      <Tooltip content={<CustomTooltip theme={theme} />} />
                      <Bar dataKey="count" name="Số học sinh">
                        {distributionData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getScoreBarColor(entry.range, stats.passScore)} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <ChartLegend>
                  <LegendItem color="#48BB78" theme={theme}>
                    <div className="color"></div>
                    <div className="label">Đạt yêu cầu</div>
                  </LegendItem>
                  <LegendItem color="#ECC94B" theme={theme}>
                    <div className="color"></div>
                    <div className="label">Gần đạt</div>
                  </LegendItem>
                  <LegendItem color="#F56565" theme={theme}>
                    <div className="color"></div>
                    <div className="label">Chưa đạt</div>
                  </LegendItem>
                </ChartLegend>
                
                <div style={{ 
                  marginTop: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div style={{ 
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    backgroundColor: theme === 'dark' ? '#1a202c' : '#f7fafc',
                    flex: '1',
                    minWidth: '150px',
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: theme === 'dark' ? '#a0aec0' : '#718096',
                      marginBottom: '0.25rem'
                    }}>
                      Điểm trung bình
                    </div>
                    <div style={{ 
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: theme === 'dark' ? '#e2e8f0' : '#2d3748'
                    }}>
                      {stats.statistics.averageScore.toFixed(2)}
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    backgroundColor: theme === 'dark' ? '#1a202c' : '#f7fafc',
                    flex: '1',
                    minWidth: '150px',
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: theme === 'dark' ? '#a0aec0' : '#718096',
                      marginBottom: '0.25rem'
                    }}>
                      Điểm cao nhất
                    </div>
                    <div style={{ 
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#38A169'
                    }}>
                      {stats.statistics.highestScore.toFixed(2)}
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    backgroundColor: theme === 'dark' ? '#1a202c' : '#f7fafc',
                    flex: '1',
                    minWidth: '150px',
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: theme === 'dark' ? '#a0aec0' : '#718096',
                      marginBottom: '0.25rem'
                    }}>
                      Điểm thấp nhất
                    </div>
                    <div style={{ 
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: stats.statistics.lowestScore >= stats.passScore ? '#38A169' : '#E53E3E'
                    }}>
                      {stats.statistics.lowestScore.toFixed(2)}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState theme={theme}>
                <FaChartBar />
                <h3>Chưa có dữ liệu</h3>
                <p>Chưa có học sinh nào hoàn thành bài thi để hiển thị phân bố điểm.</p>
              </EmptyState>
            )}
          </CardBody>
        </Card>
        
        <Card 
          theme={theme}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <CardHeader theme={theme}>
            <CardTitle theme={theme}>
              <FaUserGraduate /> Danh sách học sinh ({students.length})
            </CardTitle>
          </CardHeader>
          
          <CardBody>
            {students.length > 0 ? (
              <Table>
                <thead>
                  <tr>
                    <Th theme={theme}>Học sinh</Th>
                    <Th theme={theme}>Mã</Th>
                    <Th theme={theme}>Trạng thái</Th>
                    <Th theme={theme}>Điểm số</Th>
                    <Th theme={theme}>Kết quả</Th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <Td theme={theme}>{student.studentName}</Td>
                      <Td theme={theme}>{student.studentCode}</Td>
                      <Td theme={theme}>
                        {student.hasTaken ? (
                          <CompletionStatus completed>
                            <FaCheckCircle /> Đã hoàn thành
                          </CompletionStatus>
                        ) : (
                          <CompletionStatus completed={false}>
                            <FaTimesCircle /> Chưa làm bài
                          </CompletionStatus>
                        )}
                      </Td>
                      <Td theme={theme}>
                        {student.hasTaken ? (
                          <ScoreBadge 
                            score={student.score} 
                            passScore={stats.passScore}
                          >
                            {student.score}/{stats.totalScore}
                          </ScoreBadge>
                        ) : (
                          <span style={{ 
                            color: theme === 'dark' ? '#a0aec0' : '#a0aec0',
                            fontSize: '0.85rem'
                          }}>
                            -
                          </span>
                        )}
                      </Td>
                      <Td theme={theme}>
                        {student.hasTaken ? (
                          <span style={{
                            color: student.isPassed ? '#38A169' : '#E53E3E',
                            fontWeight: '500'
                          }}>
                            {student.isPassed ? 'Đạt' : 'Không đạt'}
                          </span>
                        ) : (
                          <span style={{ 
                            color: theme === 'dark' ? '#a0aec0' : '#a0aec0',
                            fontSize: '0.85rem'
                          }}>
                            -
                          </span>
                        )}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <EmptyState theme={theme}>
                <FaUserGraduate />
                <h3>Chưa có học sinh</h3>
                <p>Kỳ thi này chưa có học sinh nào được đăng ký.</p>
              </EmptyState>
            )}
          </CardBody>
        </Card>
      </GridLayout>
    </Container>
  );
};

export default OfficialExamResults;