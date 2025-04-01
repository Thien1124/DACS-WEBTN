import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ProfileContainer = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  padding: 2rem;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ProfileAvatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  margin-right: 2rem;
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 1rem;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const ProfileGrade = styled.p`
  font-size: 1.2rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
  margin-bottom: 0.5rem;
`;

const ProfileEmail = styled.p`
  font-size: 1rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
`;

const SectionTitle = styled.h3`
  font-size: 1.4rem;
  margin: 2rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? '#444' : '#ddd'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme === 'dark' ? '#333' : '#f8f9fa'};
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #007bff, #00d6ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
`;

const RecentTestsList = styled.div`
  margin-top: 1.5rem;
`;

const TestItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.75rem;
  background-color: ${props => props.theme === 'dark' ? '#333' : '#f8f9fa'};
  border-radius: 6px;
  
  &:hover {
    background-color: ${props => props.theme === 'dark' ? '#3a3a3a' : '#f0f0f0'};
  }
`;

const TestInfo = styled.div``;

const TestName = styled.div`
  font-weight: 500;
  font-size: 1rem;
  margin-bottom: 0.25rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const TestDate = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
`;

const TestScore = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  color: ${props => props.score >= 8 ? '#2ecc71' : props.score >= 5 ? '#f39c12' : '#e74c3c'};
`;

const EditButton = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: linear-gradient(45deg, #007bff, #00d6ff);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(45deg, #0069d9, #00c2e6);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
  }
`;

const StudentProfile = ({ theme }) => {
  const user = useSelector(state => state.auth.user);
  const [stats, setStats] = useState({
    testsCompleted: 0,
    averageScore: 0,
    highestScore: 0,
    streak: 0
  });
  const [recentTests, setRecentTests] = useState([]);
  
  useEffect(() => {
    // In a real app, you would fetch this data from an API
    // Simulating data for demo purposes
    setStats({
      testsCompleted: 23,
      averageScore: 7.8,
      highestScore: 9.5,
      streak: 5
    });
    
    setRecentTests([
      { id: 1, name: 'Toán học - Đại số và Giải tích', date: '15/05/2023', score: 8.5 },
      { id: 2, name: 'Vật lý - Điện từ học', date: '12/05/2023', score: 7.0 },
      { id: 3, name: 'Hóa học - Hóa hữu cơ', date: '08/05/2023', score: 9.0 },
      { id: 4, name: 'Sinh học - Di truyền học', date: '02/05/2023', score: 6.5 },
      { id: 5, name: 'Tiếng Anh - Ngữ pháp nâng cao', date: '28/04/2023', score: 8.0 }
    ]);
  }, []);
  
  // Get first letter of name for avatar
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };
  
  // Format grade level display
  const formatGrade = (grade) => {
    return grade ? `Lớp ${grade}` : 'Chưa cập nhật lớp';
  };

  return (
    <ProfileContainer
      theme={theme}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ProfileHeader>
        <ProfileAvatar>
          {getInitials(user?.name)}
        </ProfileAvatar>
        <ProfileInfo>
          <ProfileName theme={theme}>{user?.name || 'Học sinh'}</ProfileName>
          <ProfileGrade theme={theme}>{formatGrade(user?.grade)}</ProfileGrade>
          <ProfileEmail theme={theme}>{user?.email || 'Email chưa cập nhật'}</ProfileEmail>
        </ProfileInfo>
      </ProfileHeader>
      
      <SectionTitle theme={theme}>Thống kê</SectionTitle>
      <StatsGrid>
        <StatCard theme={theme}>
          <StatNumber>{stats.testsCompleted}</StatNumber>
          <StatLabel theme={theme}>Bài thi đã hoàn thành</StatLabel>
        </StatCard>
        <StatCard theme={theme}>
          <StatNumber>{stats.averageScore.toFixed(1)}</StatNumber>
          <StatLabel theme={theme}>Điểm trung bình</StatLabel>
        </StatCard>
        <StatCard theme={theme}>
          <StatNumber>{stats.highestScore.toFixed(1)}</StatNumber>
          <StatLabel theme={theme}>Điểm cao nhất</StatLabel>
        </StatCard>
        <StatCard theme={theme}>
          <StatNumber>{stats.streak}</StatNumber>
          <StatLabel theme={theme}>Ngày liên tiếp học tập</StatLabel>
        </StatCard>
      </StatsGrid>
      
      <SectionTitle theme={theme}>Bài thi gần đây</SectionTitle>
      <RecentTestsList>
        {recentTests.length > 0 ? (
          recentTests.map(test => (
            <TestItem key={test.id} theme={theme}>
              <TestInfo>
                <TestName theme={theme}>{test.name}</TestName>
                <TestDate theme={theme}>{test.date}</TestDate>
              </TestInfo>
              <TestScore score={test.score}>{test.score.toFixed(1)}/10</TestScore>
            </TestItem>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: theme === 'dark' ? '#a0aec0' : '#777' }}>
            Bạn chưa hoàn thành bài thi nào.
          </p>
        )}
      </RecentTestsList>
    </ProfileContainer>
  );
};

export default StudentProfile;
