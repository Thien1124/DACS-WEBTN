import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/layout/Header';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { 
  FaEdit, FaPhoneAlt, FaEnvelope, FaIdBadge, FaCalendarAlt, FaCrown, 
  FaChalkboardTeacher, FaGraduationCap, FaCamera, FaTrophy, FaFire,
  FaMedal, FaClock, FaChartLine, FaBookOpen, FaAward, FaBolt,
  FaUser, FaUsers, FaLock, FaEye, FaCog, FaHeart, FaStar,
  FaGamepad, FaLightbulb, FaRocket, FaGem, FaSpinner
} from 'react-icons/fa';
import { uploadAvatar } from '../../services/userService';
import { updateAvatar } from '../../redux/authSlice';
import { getDashboardData } from '../../services/dashboardService';

// Styled components giữ nguyên từ code cũ...
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
`;

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 2rem auto;
  padding: 0 20px;
  flex: 1;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ProfileContainer = styled(motion.div)`
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
  };
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  position: relative;
  border: 1px solid ${props => props.theme === 'dark' ? '#404040' : '#e2e8f0'};
`;

const AchievementCard = styled(motion.div)`
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
  };
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid ${props => props.theme === 'dark' ? '#404040' : '#e2e8f0'};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: ${props => props.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
  padding: 1.5rem;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%);
    pointer-events: none;
  }
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
  font-weight: 500;
`;

const ActivityTimeline = styled.div`
  position: relative;
  padding-left: 2rem;
  
  &::before {
    content: '';
    position: absolute;
    left: 1rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${props => props.theme === 'dark' ? '#4a5568' : '#cbd5e0'};
  }
`;

const TimelineItem = styled(motion.div)`
  position: relative;
  margin-bottom: 1.5rem;
  background: ${props => props.theme === 'dark' ? '#374151' : '#ffffff'};
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border-left: 4px solid ${props => props.color || '#667eea'};
  
  &::before {
    content: '';
    position: absolute;
    left: -2.5rem;
    top: 1rem;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.color || '#667eea'};
    border: 3px solid ${props => props.theme === 'dark' ? '#2d3748' : '#ffffff'};
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
`;

const ActionButton = styled(motion.button)`
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)'
  };
  border: 1px solid ${props => props.theme === 'dark' ? '#4a5568' : '#e2e8f0'};
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#4a5568'};
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    background: ${props => props.theme === 'dark' 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };
    color: white;
  }
  
  svg {
    font-size: 1.3rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#666'};
  
  svg {
    margin-right: 0.5rem;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Giữ lại các styled components khác từ code cũ...
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
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border: 5px solid ${props => props.theme === 'dark' ? '#3d4852' : 'white'};
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 50%;
    background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
    z-index: -1;
    animation: rotate 3s linear infinite;
    opacity: 0.7;
  }
  
  @keyframes rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AvatarUploadOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
  
  &:hover {
    opacity: 1;
  }
  
  svg {
    font-size: 2rem;
  }
`;

const AvatarWrapper = styled.div`
  position: relative;
  cursor: pointer;
`;

const AvatarUploadInput = styled.input`
  display: none;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#e2e8f0' : '#333'};
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
  
  @media (max-width: 768px) {
    justify-content: center;
    text-align: center;
    font-size: 2rem;
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
  padding: 0.5rem 1rem;
  border-radius: 25px;
  vertical-align: middle;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  
  svg {
    margin-right: 0.5rem;
    font-size: 1rem;
  }
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  margin: 1rem 0;
  font-size: 1.1rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#555'};
  padding: 0.8rem;
  background: ${props => props.theme === 'dark' ? '#374151' : '#f8fafc'};
  border-radius: 10px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateX(5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  svg {
    margin-right: 1rem;
    font-size: 1.3rem;
    color: ${props => props.theme === 'dark' ? '#4da3ff' : '#4285f4'};
  }
`;

const EditButton = styled(Link)`
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: linear-gradient(45deg, #4285f4, #34a853);
  color: white;
  border: none;
  border-radius: 50px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  box-shadow: 0 8px 20px rgba(66, 133, 244, 0.3);
  
  &:hover {
    transform: scale(1.1) rotate(10deg);
    box-shadow: 0 12px 30px rgba(66, 133, 244, 0.4);
  }
  
  svg {
    font-size: 1.3rem;
  }
`;

const RoleDetails = styled.div`
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: ${props => props.theme === 'dark' ? '#374151' : '#f8fafc'};
  border-radius: 15px;
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
  line-height: 1.6;
`;

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const [theme, setTheme] = useState('light');
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [tempAvatar, setTempAvatar] = useState(() => {
    const userId = user?.id || localStorage.getItem('user_id');
    return userId ? localStorage.getItem(`tempAvatar_${userId}`) : null;
  });
  
  // ✅ THAY ĐỔI: Sử dụng dữ liệu từ API Dashboard
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);
  
  // ✅ FETCH DỮ LIỆU TỪ API
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Không thể tải dữ liệu profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);
  
  // Helper functions
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };
  
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

  // ✅ HÀM CHUYỂN ĐỔI ACTIVITY TYPE THÀNH ICON
  const getActivityIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'test':
        return FaBookOpen;
      case 'achievement':
        return FaTrophy;
      case 'course':
        return FaGraduationCap;
      default:
        return FaBookOpen;
    }
  };

  const role = user?.role || (localStorage.getItem('user_role') || 'student');

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      
      const userId = user?.id || localStorage.getItem('user_id');
      if (userId) {
        localStorage.setItem(`tempAvatar_${userId}`, reader.result);
        setTempAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
    
    try {
      setUploading(true);
      
      const result = await uploadAvatar(file);
      
      if (result.success && result.avatarUrl) {
        const avatarFullUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5006'}${result.avatarUrl}`;
        setPreviewImage(avatarFullUrl);
        
        dispatch(updateAvatar(result.avatarUrl));
        setTempAvatar(null);
        
        try {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          userData.avatarUrl = result.avatarUrl;
          userData.avatar = result.avatarUrl;
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (e) {
          console.error('Error updating localStorage:', e);
        }
        
        toast.success('Cập nhật ảnh đại diện thành công!');
      } else {
        toast.warning(result.message || 'Không thể lưu ảnh lên máy chủ.');
      }
    } catch (err) {
      console.error('Lỗi khi xử lý ảnh đại diện:', err);
      toast.error('Có lỗi xảy ra khi xử lý ảnh đại diện.');
    } finally {
      setUploading(false);
    }
  };

  // ✅ LOADING STATE
  if (loading) {
    return (
      <PageWrapper theme={theme}>
        <Header />
        <PageContainer>
          <LoadingContainer theme={theme}>
            <FaSpinner />
            Đang tải dữ liệu profile...
          </LoadingContainer>
        </PageContainer>
      </PageWrapper>
    );
  }

  // ✅ ERROR STATE
  if (error) {
    return (
      <PageWrapper theme={theme}>
        <Header />
        <PageContainer>
          <ProfileContainer theme={theme}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h3 style={{ color: theme === 'dark' ? '#ef4444' : '#dc2626', marginBottom: '1rem' }}>
                Có lỗi xảy ra
              </h3>
              <p style={{ color: theme === 'dark' ? '#a0aec0' : '#666' }}>
                {error}
              </p>
            </div>
          </ProfileContainer>
        </PageContainer>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper theme={theme}>
      <Header />
      <PageContainer>
        <ContentGrid>
          <MainContent>
            {/* Profile Card */}
            <ProfileContainer
              theme={theme}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <EditButton to="/settings">
                <FaEdit />
              </EditButton>
              
              <ProfileHeader>
                <ProfileAvatarContainer>
                  <AvatarWrapper onClick={handleAvatarClick}>
                    <ProfileAvatar theme={theme}>
                      {previewImage ? (
                        <img src={previewImage} alt={user?.fullName || 'Avatar'} />
                      ) : user?.avatar || user?.avatarUrl ? (
                        <img 
                          src={`${process.env.REACT_APP_API_URL || 'http://localhost:5006'}${user.avatar || user.avatarUrl}`} 
                          alt={user.fullName || 'Avatar'} 
                        />
                      ) : tempAvatar ? (
                        <img src={tempAvatar} alt={user?.fullName || 'Avatar'} />
                      ) : (
                        getInitials(user?.fullName || 'Người dùng')
                      )}
                    </ProfileAvatar>
                    <AvatarUploadOverlay>
                      {uploading ? (
                        <div className="spinner-border spinner-border-sm text-light" role="status">
                          <span className="visually-hidden">Đang tải...</span>
                        </div>
                      ) : (
                        <FaCamera />
                      )}
                    </AvatarUploadOverlay>
                  </AvatarWrapper>
                  <AvatarUploadInput 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*"
                  />
                  <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.9rem', color: theme === 'dark' ? '#a0aec0' : '#666' }}>
                    Nhấn vào ảnh để thay đổi
                  </div>
                </ProfileAvatarContainer>
                
                <ProfileInfo>
                  <ProfileName theme={theme}>
                    {user?.fullName || 'Người dùng'}
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
                    {user?.email}
                  </DetailItem>
                  
                  <DetailItem theme={theme}>
                    <FaPhoneAlt />
                    {user?.phoneNumber || 'Chưa cập nhật số điện thoại'}
                  </DetailItem>
                  
                  <DetailItem theme={theme}>
                    <FaCalendarAlt />
                    Đăng nhập cuối: {user?.lastLoginDate ? formatLastLogin(user.lastLoginDate) : 'Chưa có thông tin'}
                  </DetailItem>
                  
                  {/* ✅ HIỂN THỊ MÔÔN MẠNH TỪ API */}
                  {dashboardData?.stats?.strengths && (
                    <DetailItem theme={theme}>
                      <FaTrophy />
                      Môn mạnh: {dashboardData.stats.strengths}
                    </DetailItem>
                  )}
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
            </ProfileContainer>

            {/* ✅ STATS GRID - SỬ DỤNG DỮ LIỆU TỪ API */}
            {dashboardData?.stats && (
              <ProfileContainer theme={theme}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaChartLine /> Thống kê học tập
                </h3>
                
                <StatsGrid>
                  <StatCard
                    gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <StatNumber>
                      <FaBookOpen />
                      {dashboardData.stats.testsCompleted}
                    </StatNumber>
                    <StatLabel>Bài thi đã hoàn thành</StatLabel>
                  </StatCard>

                  <StatCard
                    gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <StatNumber>
                      <FaTrophy />
                      {dashboardData.stats.averageScore}%
                    </StatNumber>
                    <StatLabel>Điểm trung bình</StatLabel>
                  </StatCard>

                  <StatCard
                    gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <StatNumber>
                      <FaFire />
                      {Math.round(dashboardData.stats.studyTime / 60)} {/* Convert phút thành giờ */}
                    </StatNumber>
                    <StatLabel>Giờ học tập</StatLabel>
                  </StatCard>

                  <StatCard
                    gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <StatNumber>
                      <FaLightbulb />
                      {dashboardData.stats.correctAnswers}/{dashboardData.stats.totalQuestions}
                    </StatNumber>
                    <StatLabel>Câu trả lời đúng</StatLabel>
                  </StatCard>
                </StatsGrid>
              </ProfileContainer>
            )}
          </MainContent>

          <Sidebar>
            {/* Quick Actions */}
            <AchievementCard theme={theme}>
              <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaRocket /> Thao tác nhanh
              </h4>
              
              <QuickActions>
                <ActionButton
                  theme={theme}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  as={Link}
                  to="/exams"
                >
                  <FaGamepad />
                  Làm bài thi
                </ActionButton>

                <ActionButton
                  theme={theme}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  as={Link}
                  to="/exam-history"
                >
                  <FaChartLine />
                  Lịch sử thi
                </ActionButton>


                <ActionButton
                  theme={theme}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  as={Link}
                  to="/settings"
                >
                  <FaCog />
                  Cài đặt
                </ActionButton>
              </QuickActions>
            </AchievementCard>

            {/* ✅ RECENT ACTIVITIES - SỬ DỤNG DỮ LIỆU TỪ API */}
            {dashboardData?.activities && dashboardData.activities.length > 0 && (
              <AchievementCard theme={theme}>
                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaClock /> Hoạt động gần đây
                </h4>
                
                <ActivityTimeline theme={theme}>
                  {dashboardData.activities.slice(0, 5).map((activity, index) => {
                    const IconComponent = getActivityIcon(activity.type);
                    const activityColor = activity.color 
                      ? `rgb(${activity.color})` 
                      : '#667eea';
                    
                    return (
                      <TimelineItem
                        key={activity.id}
                        theme={theme}
                        color={activityColor}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <IconComponent style={{ marginRight: '0.5rem', color: activityColor }} />
                          <strong style={{ fontSize: '0.9rem' }}>{activity.title}</strong>
                        </div>
                        <p style={{ margin: '0.25rem 0', fontSize: '0.8rem', opacity: 0.8 }}>
                          {activity.description}
                        </p>
                        <small style={{ opacity: 0.6 }}>{activity.time}</small>
                      </TimelineItem>
                    );
                  })}
                </ActivityTimeline>
              </AchievementCard>
            )}
          </Sidebar>
        </ContentGrid>
      </PageContainer>
    </PageWrapper>
  );
};

export default Profile;