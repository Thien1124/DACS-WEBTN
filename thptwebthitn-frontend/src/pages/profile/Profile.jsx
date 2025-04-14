import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Header from '../../components/layout/Header';

import { Link } from 'react-router-dom';
import { FaEdit, FaUser, FaPhoneAlt, FaEnvelope, FaIdBadge, FaCalendarAlt, FaCrown, FaChalkboardTeacher, FaGraduationCap } from 'react-icons/fa';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${props => props.theme === 'dark' ? '#1a1a1a' : '#f5f5f5'};
`;

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 20px;
  flex: 1;
`;

const ProfileContainer = styled(motion.div)`
  background-color: ${props => props.theme === 'dark' ? '#2a2a2a' : 'white'};
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  position: relative;
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

const ProfileAvatarContainer = styled.div`
  position: relative;
  margin-right: 2rem;
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 1rem;
  }
`;

const ProfileAvatar = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4285f4, #34a853);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  font-weight: bold;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  border: 5px solid ${props => props.theme === 'dark' ? '#3d4852' : 'white'};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    justify-content: center;
    text-align: center;
  }
`;

const RoleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  background: ${props => {
    switch(props.role?.toLowerCase()) {
      case 'admin':
        return 'linear-gradient(45deg, #FF4500, #FFA500)';
      case 'giáo viên':
      case 'teacher':
        return 'linear-gradient(45deg, #4285f4, #34a853)';
      default:
        return 'linear-gradient(45deg, #3498db, #2980b9)';
    }
  }};
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  vertical-align: middle;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  
  svg {
    margin-right: 0.5rem;
    font-size: 1rem;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  margin: 0.8rem 0;
  font-size: 1.1rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#555'};
  
  svg {
    margin-right: 0.8rem;
    font-size: 1.2rem;
    color: ${props => props.theme === 'dark' ? '#4da3ff' : '#4285f4'};
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.6rem;
  margin: 2.5rem 0 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid ${props => props.theme === 'dark' ? '#3d4852' : '#e2e8f0'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100px;
    height: 2px;
    background: linear-gradient(to right, #4285f4, #34a853);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  background: ${props => props.theme === 'dark' ? '#333' : '#f8f9fa'};
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #4285f4, #34a853);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StatLabel = styled.div`
  font-size: 0.95rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
  font-weight: 500;
`;

const RecentTestsList = styled.div`
  margin-top: 1.5rem;
`;

const TestItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem;
  margin-bottom: 1rem;
  background-color: ${props => props.theme === 'dark' ? '#333' : '#f8f9fa'};
  border-radius: 10px;
  border-left: 5px solid ${props => {
    if (props.score >= 8) return '#2ecc71';
    if (props.score >= 5) return '#f39c12';
    return '#e74c3c';
  }};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    background-color: ${props => props.theme === 'dark' ? '#3a3a3a' : '#f0f0f0'};
  }
`;

const TestInfo = styled.div``;

const TestName = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
`;

const TestDate = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.4rem;
  }
`;

const TestScore = styled.div`
  font-weight: bold;
  font-size: 1.3rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  color: white;
  background-color: ${props => {
    if (props.score >= 8) return '#2ecc71';
    if (props.score >= 5) return '#f39c12';
    return '#e74c3c';
  }};
`;

const EditButton = styled(Link)`
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: linear-gradient(45deg, #4285f4, #34a853);
  color: white;
  border: none;
  border-radius: 50px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  
  &:hover {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 6px 12px rgba(66, 133, 244, 0.3);
  }
  
  svg {
    font-size: 1.2rem;
  }
`;

const NoTestsMessage = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: ${props => props.theme === 'dark' ? '#333' : '#f8f9fa'};
  border-radius: 10px;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#777'};
  font-size: 1.1rem;
  
  p {
    margin-bottom: 1rem;
  }
  
  a {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: linear-gradient(45deg, #4285f4, #34a853);
    color: white;
    border-radius: 5px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(66, 133, 244, 0.3);
    }
  }
`;

const RoleIcon = styled.div`
  margin-right: 0.5rem;
`;

// Thêm component mới để hiển thị chi tiết về vai trò
const RoleDetails = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background-color: ${props => props.theme === 'dark' ? '#333' : '#f8f9fa'};
  border-radius: 10px;
  border-left: 5px solid ${props => {
    switch(props.role?.toLowerCase()) {
      case 'admin':
        return '#FF4500';
      case 'giáo viên':
      case 'teacher':
        return '#4285f4';
      default:
        return '#3498db';
    }
  }};
`;

const RoleTitle = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  
  svg {
    margin-right: 0.5rem;
    color: ${props => {
      switch(props.role?.toLowerCase()) {
        case 'admin':
          return '#FF4500';
        case 'giáo viên':
        case 'teacher':
          return '#4285f4';
        default:
          return '#3498db';
      }
    }};
  }
`;

const RoleDescription = styled.p`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#666'};
  font-size: 0.95rem;
  line-height: 1.5;
`;

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const [theme, setTheme] = useState('light');
  const [stats, setStats] = useState({
    testsCompleted: 0,
    averageScore: 0,
    highestScore: 0,
    streak: 0
  });
  const [recentTests, setRecentTests] = useState([]);
  const [currentDate] = useState('2025-04-08 06:16:24'); // Sử dụng thời gian hiện tại
  const [currentUser] = useState('vinhsonvlog'); // Sử dụng tên đăng nhập hiện tại
  
  useEffect(() => {
    // Lấy theme từ localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    console.log(`Profile page accessed at: ${currentDate} by user: ${currentUser}`);
    
    // Trong ứng dụng thực tế, bạn sẽ gọi API để lấy thông tin này
    // Giả lập dữ liệu cho demo
    setStats({
      testsCompleted: 0,
      averageScore: 0,
      highestScore: 0,
      streak: 0
    });
    
    setRecentTests([]);
  }, [currentDate, currentUser]);
  useEffect(() => {
    if (user?.role) {
      localStorage.setItem('user_role', user.role);
    }
  }, [user?.role]);
  // Lấy ký tự đầu của tên cho avatar
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };
  
  // Format role để hiển thị
  const formatRole = (role) => {
    if (!role) return 'Học sinh';
    
    switch(role.toLowerCase()) {
      case 'admin':
        return 'Admin';
      case 'teacher':
        return 'Giáo viên';
      default:
        return 'Học sinh';
    }
  };

  // Trả về icon tương ứng với vai trò
  const getRoleIcon = (role) => {
    if (!role) return <FaGraduationCap />;
    
    switch(role.toLowerCase()) {
      case 'admin':
        return <FaCrown />;
      case 'teacher':
        return <FaChalkboardTeacher />;
      default:
        return <FaGraduationCap />;
    }
  };

  // Trả về mô tả vai trò
  const getRoleDescription = (role) => {
    if (!role) return 'Học sinh có thể làm bài tập, làm đề thi và xem kết quả học tập của mình.';
    
    switch(role.toLowerCase()) {
      case 'admin':
        return 'Admin có quyền quản lý toàn bộ hệ thống, bao gồm quản lý người dùng, môn học, đề thi và cấu hình hệ thống.';
      case 'teacher':
        return 'Giáo viên có thể tạo và quản lý đề thi, chấm điểm và theo dõi tiến độ học tập của học sinh.';
      default:
        return 'Học sinh có thể làm bài tập, làm đề thi và xem kết quả học tập của mình.';
    }
  };

  // Format thời gian đăng nhập cuối cùng từ UTC sang định dạng địa phương
  const formatLastLogin = (utcTime) => {
    if (!utcTime) return 'Chưa có thông tin';
    
    const date = new Date(utcTime);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // In src/pages/profile/Profile.jsx (line 427)
  const role = user?.role || (localStorage.getItem('user_role') || 'student');
 // This sets role to 'student' as fallback
  
  return (
    <PageWrapper theme={theme}>
      <Header />
      <PageContainer>
        <ProfileContainer
          theme={theme}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <EditButton to="/settings">
            <FaEdit />
          </EditButton>
          
          <ProfileHeader>
            <ProfileAvatarContainer>
              <ProfileAvatar theme={theme}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.fullName || 'Avatar'} />
                ) : (
                  getInitials(user?.fullName || currentUser)
                )}
              </ProfileAvatar>
            </ProfileAvatarContainer>
            
            <ProfileInfo>
              <ProfileName theme={theme}>
                {user?.fullName || currentUser}
                <RoleBadge role={role}>
                  {getRoleIcon(role)}
                  {formatRole(role)}
                </RoleBadge>
              </ProfileName>
              
              <DetailItem theme={theme}>
                <FaIdBadge />
                ID: {user?.id || 'N/A'}
              </DetailItem>
              
              <DetailItem theme={theme}>
                <FaEnvelope />
                {user?.email || `${currentUser}@example.com`}
              </DetailItem>
              
              <DetailItem theme={theme}>
                <FaPhoneAlt />
                {user?.phoneNumber || 'Chưa cập nhật số điện thoại'}
              </DetailItem>
              
              <DetailItem theme={theme}>
                <FaCalendarAlt />
                Đăng nhập cuối: {formatLastLogin(currentDate)}
              </DetailItem>
            </ProfileInfo>
          </ProfileHeader>
          
          <RoleDetails theme={theme} role={role}>
            <RoleTitle theme={theme} role={role}>
              {getRoleIcon(role)}
              Quyền hạn của {formatRole(role)}
            </RoleTitle>
            <RoleDescription theme={theme}>
              {getRoleDescription(role)}
            </RoleDescription>
          </RoleDetails>
          
          <SectionTitle theme={theme}>Thống kê học tập</SectionTitle>
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
                <TestItem key={test.id} theme={theme} score={test.score}>
                  <TestInfo>
                    <TestName theme={theme}>{test.name}</TestName>
                    <TestDate theme={theme}>
                      <FaCalendarAlt /> {test.date}
                    </TestDate>
                  </TestInfo>
                  <TestScore score={test.score}>{test.score.toFixed(1)}/10</TestScore>
                </TestItem>
              ))
            ) : (
              <NoTestsMessage theme={theme}>
                <p>Bạn chưa hoàn thành bài thi nào.</p>
                <Link to="/subjects">Bắt đầu một bài thi ngay</Link>
              </NoTestsMessage>
            )}
          </RecentTestsList>
        </ProfileContainer>
      </PageContainer>
    </PageWrapper>
  );
};

export default Profile;