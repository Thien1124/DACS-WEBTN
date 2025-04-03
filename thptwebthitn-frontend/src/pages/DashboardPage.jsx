import React from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const DashboardContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 1rem;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  padding: 1.5rem;
  background: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  h3 {
    font-size: 1.8rem;
    color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
    margin-bottom: 0.5rem;
  }

  p {
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#718096'};
    font-size: 0.9rem;
  }
`;

const RecentActivity = styled.div`
  background: ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ActivityTitle = styled.h2`
  font-size: 1.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#2d3748'};
  margin-bottom: 1rem;
`;

const ActivityList = styled.div`
  display: grid;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  padding: 1rem;
  background: ${props => props.theme === 'dark' ? '#374151' : '#f8fafc'};
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DashboardPage = () => {
  const { theme } = useSelector(state => state.ui);
  const user = useSelector(state => state.auth.user);

  return (
    <DashboardContainer>
      <Header>
        <Title theme={theme}>Bảng điều khiển</Title>
      </Header>

      <StatsContainer>
        <StatCard 
          theme={theme}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h3>15</h3>
          <p>Bài thi đã hoàn thành</p>
        </StatCard>

        <StatCard
          theme={theme}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h3>7.5</h3>
          <p>Điểm trung bình</p>
        </StatCard>

        <StatCard
          theme={theme}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h3>5</h3>
          <p>Ngày liên tiếp học tập</p>
        </StatCard>
      </StatsContainer>

      <RecentActivity theme={theme}>
        <ActivityTitle theme={theme}>Hoạt động gần đây</ActivityTitle>
        <ActivityList>
          {[1,2,3].map(i => (
            <ActivityItem key={i} theme={theme}>
              <div>
                <strong>Bài thi Toán học #{i}</strong>
                <p>Hoàn thành với điểm số 8.5</p>
              </div>
              <span>2 giờ trước</span>
            </ActivityItem>
          ))}
        </ActivityList>
      </RecentActivity>
    </DashboardContainer>
  );
};

export default DashboardPage;
