import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaChartLine, FaBook, FaCalendarCheck, FaTrophy, 
  FaGraduationCap, FaChartPie, FaArrowUp, FaArrowDown, 
  FaClock, FaCheckCircle
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getDashboardData } from '../../services/dashboardService';

// Styled Components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme === 'dark' ? '#1a1a1a' : '#f5f8fa'};
`;

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
`;

const WelcomeSection = styled(motion.div)`
  background: linear-gradient(135deg, #4285f4, #34a853);
  border-radius: 12px;
  padding: 2rem;
  color: white;
  margin-bottom: 2rem;
  box-shadow: 0 10px 20px rgba(66, 133, 244, 0.15);
`;
// Cập nhật component WelcomeTitle với màu sắc tương phản cao hơn
const WelcomeTitle = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.5px;
`;



const WelcomeSubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 1.5rem;
  color: #ffffff;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2d2d2d' : 'white'};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatInfo = styled.div``;

const StatTitle = styled.div`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${props => props.positive ? '#38a169' : '#e53e3e'};
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => `rgba(${props.color}, 0.1)`};
  color: ${props => `rgb(${props.color})`};
  font-size: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin: 2rem 0 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 600;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 10px;
  }
`;

const RecentExamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ExamCard = styled(Link)`
  text-decoration: none;
  background-color: ${props => props.theme === 'dark' ? '#2d2d2d' : 'white'};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
  }
`;

const ExamTitle = styled.h3`
  font-size: 1.15rem;
  margin-bottom: 0.75rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  font-weight: 600;
`;

const ExamInfo = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  
  svg {
    margin-right: 8px;
  }
`;

const ExamProgress = styled.div`
  margin-top: 1rem;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const ProgressBar = styled.div`
  height: 8px;
  width: 100%;
  background-color: ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.progress}%;
  background: linear-gradient(90deg, #4285f4, #34a853);
  border-radius: 4px;
`;

const ActivitySection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const ActivityFeed = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d2d2d' : 'white'};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const ActivityItem = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  display: flex;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => `rgba(${props.color}, 0.1)`};
  color: ${props => `rgb(${props.color})`};
  margin-right: 1rem;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const ActivityTime = styled.div`
  font-size: 0.85rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const UpcomingEvents = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#2d2d2d' : 'white'};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const EventItem = styled.div`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#edf2f7'};
  
  &:last-child {
    border-bottom: none;
  }
`;

const EventDate = styled.div`
  font-size: 0.85rem;
  font-weight: 500;
  color: #4285f4;
  margin-bottom: 0.5rem;
`;

const EventTitle = styled.div`
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: ${props => props.theme === 'dark' ? '#2d2d2d' : 'white'};
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const ErrorMessage = styled.div`
  background-color: ${props => props.theme === 'dark' ? '#3d2a2a' : '#fff5f5'};
  color: ${props => props.theme === 'dark' ? '#feb2b2' : '#c53030'};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-weight: 500;
`;

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      testsCompleted: 0,
      averageScore: 0,
      studyTime: 0,
      strengths: ''
    },
    recentExams: [],
    activities: [],
    events: []
  });
  
  // Format date function
  const formatDate = () => {
    const date = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('vi-VN', options);
  };
  
  // Fetch dashboard data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call API to get dashboard data
      const data = await getDashboardData();
      setDashboardData(data);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      //setError('Không thể tải dữ liệu bảng điều khiển. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Lấy theme từ localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Fetch dashboard data
    fetchData();
  }, []);
  
  // Get activity icon based on type
  const getActivityIcon = (type) => {
    switch(type) {
      case 'test':
        return <FaCheckCircle />;
      case 'achievement':
        return <FaTrophy />;
      case 'course':
        return <FaBook />;
      case 'streak':
        return <FaCalendarCheck />;
      default:
        return <FaClock />;
    }
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchData();
  };
  
  if (loading) {
    return (
      <PageWrapper theme={theme}>
        <Header />
        <DashboardContainer>
          <LoadingContainer>
            <LoadingSpinner size={50} />
          </LoadingContainer>
        </DashboardContainer>
      </PageWrapper>
    );
  }
  
  return (
    <PageWrapper theme={theme}>
      <Header />
      <DashboardContainer>
        {error && <ErrorMessage theme={theme}>{error}</ErrorMessage>}
        
        <WelcomeSection
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <WelcomeTitle>Xin chào, {user?.fullName}!</WelcomeTitle>
          <WelcomeSubtitle>Hôm nay là {formatDate()}. Đây là bảng điều khiển học tập của bạn.</WelcomeSubtitle>
          
        </WelcomeSection>
        
        <StatsGrid>
          <StatCard
            theme={theme}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <StatInfo>
              <StatTitle theme={theme}>Bài thi đã hoàn thành</StatTitle>
              <StatValue theme={theme}>{dashboardData.stats.testsCompleted}</StatValue>
              {dashboardData.stats.testsCompletedChange !== undefined && (
                <StatChange positive={dashboardData.stats.testsCompletedChange >= 0}>
                  {dashboardData.stats.testsCompletedChange >= 0 ? (
                    <FaArrowUp style={{ marginRight: '5px' }} />
                  ) : (
                    <FaArrowDown style={{ marginRight: '5px' }} />
                  )}
                  {Math.abs(dashboardData.stats.testsCompletedChange)}% so với tháng trước
                </StatChange>
              )}
            </StatInfo>
            <StatIcon color="66, 133, 244">
              <FaCheckCircle />
            </StatIcon>
          </StatCard>
          
          <StatCard
            theme={theme}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <StatInfo>
              <StatTitle theme={theme}>Điểm trung bình</StatTitle>
              <StatValue theme={theme}>{dashboardData.stats.averageScore.toFixed(1)}</StatValue>
              {dashboardData.stats.averageScoreChange !== undefined && (
                <StatChange positive={dashboardData.stats.averageScoreChange >= 0}>
                  {dashboardData.stats.averageScoreChange >= 0 ? (
                    <FaArrowUp style={{ marginRight: '5px' }} />
                  ) : (
                    <FaArrowDown style={{ marginRight: '5px' }} />
                  )}
                  {Math.abs(dashboardData.stats.averageScoreChange)}% so với tháng trước
                </StatChange>
              )}
            </StatInfo>
            <StatIcon color="234, 67, 53">
              <FaChartLine />
            </StatIcon>
          </StatCard>
          
          <StatCard
            theme={theme}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <StatInfo>
              <StatTitle theme={theme}>Thời gian học (giờ)</StatTitle>
              <StatValue theme={theme}>{dashboardData.stats.studyTime}</StatValue>
              {dashboardData.stats.studyTimeChange !== undefined && (
                <StatChange positive={dashboardData.stats.studyTimeChange >= 0}>
                  {dashboardData.stats.studyTimeChange >= 0 ? (
                    <FaArrowUp style={{ marginRight: '5px' }} />
                  ) : (
                    <FaArrowDown style={{ marginRight: '5px' }} />
                  )}
                  {Math.abs(dashboardData.stats.studyTimeChange)}% so với tháng trước
                </StatChange>
              )}
            </StatInfo>
            <StatIcon color="52, 168, 83">
              <FaClock />
            </StatIcon>
          </StatCard>
          
          <StatCard
            theme={theme}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <StatInfo>
              <StatTitle theme={theme}>Thế mạnh của bạn</StatTitle>
              <StatValue theme={theme} style={{ fontSize: '1.2rem' }}>
                {dashboardData.stats.strengths || 'Chưa xác định'}
              </StatValue>
            </StatInfo>
            <StatIcon color="251, 188, 5">
              <FaGraduationCap />
            </StatIcon>
          </StatCard>
        </StatsGrid>
        
        <SectionTitle theme={theme}>
          <FaBook /> Bài thi đang làm
        </SectionTitle>
        
        {dashboardData.recentExams && dashboardData.recentExams.length > 0 ? (
          <RecentExamsGrid>
            {dashboardData.recentExams.map(exam => (
              <ExamCard key={exam.id} to={`/exams/${exam.id}`} theme={theme}>
                <ExamTitle theme={theme}>{exam.title}</ExamTitle>
                <ExamInfo theme={theme}>
                  <FaGraduationCap /> {exam.subject}
                </ExamInfo>
                <ExamInfo theme={theme}>
                  <FaClock /> {exam.duration}
                </ExamInfo>
                <ExamProgress>
                  <ProgressLabel theme={theme}>
                    <span>Tiến độ: {exam.completed}/{exam.questions} câu hỏi</span>
                    <span>{exam.progress}%</span>
                  </ProgressLabel>
                  <ProgressBar theme={theme}>
                    <ProgressFill progress={exam.progress} />
                  </ProgressBar>
                </ExamProgress>
              </ExamCard>
            ))}
          </RecentExamsGrid>
        ) : (
          <EmptyState theme={theme}>
            <p>Bạn chưa có bài thi nào đang làm.</p>
            <Link to="/exams" style={{ display: 'inline-block', marginTop: '1rem', color: '#4285f4', textDecoration: 'none' }}>
              Bắt đầu làm bài thi ngay
            </Link>
          </EmptyState>
        )}
        
        <ActivitySection>
          <div>
            <SectionTitle theme={theme}>
              <FaChartLine /> Hoạt động gần đây
            </SectionTitle>
            {dashboardData.activities && dashboardData.activities.length > 0 ? (
              <ActivityFeed theme={theme}>
                {dashboardData.activities.map(activity => (
                  <ActivityItem key={activity.id} theme={theme}>
                    <ActivityIcon color={activity.color || "66, 133, 244"}>
                      {getActivityIcon(activity.type)}
                    </ActivityIcon>
                    <ActivityContent>
                      <ActivityTitle theme={theme}>{activity.title}</ActivityTitle>
                      <ActivityTime theme={theme}>{activity.time}</ActivityTime>
                    </ActivityContent>
                  </ActivityItem>
                ))}
              </ActivityFeed>
            ) : (
              <EmptyState theme={theme}>
                <p>Chưa có hoạt động nào gần đây.</p>
              </EmptyState>
            )}
          </div>
          
          <div>
            <SectionTitle theme={theme}>
              <FaCalendarCheck /> Sự kiện sắp tới
            </SectionTitle>
            {dashboardData.events && dashboardData.events.length > 0 ? (
              <UpcomingEvents theme={theme}>
                {dashboardData.events.map(event => (
                  <EventItem key={event.id} theme={theme}>
                    <EventDate>{event.date}</EventDate>
                    <EventTitle theme={theme}>{event.title}</EventTitle>
                  </EventItem>
                ))}
              </UpcomingEvents>
            ) : (
              <EmptyState theme={theme}>
                <p>Không có sự kiện nào sắp tới.</p>
              </EmptyState>
            )}
          </div>
        </ActivitySection>
      </DashboardContainer>
    </PageWrapper>
  );
};

export default Dashboard;