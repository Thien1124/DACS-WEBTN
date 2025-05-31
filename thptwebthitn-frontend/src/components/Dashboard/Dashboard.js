import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChartLine, FaBook, FaCalendarCheck, FaTrophy, 
  FaGraduationCap, FaChartPie, FaArrowUp, FaArrowDown, 
  FaClock, FaCheckCircle, FaPlay, FaEye, FaStar, FaFire,
  FaBullseye, FaBookmark, FaBell, FaSync, FaUserCheck, // Thay FaTarget bằng FaBullseye, FaRefresh bằng FaSync
  FaAward, FaLightbulb, FaRocket, FaHeart, FaPaperPlane
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getDashboardData } from '../../services/dashboardService';

// Enhanced Styled Components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e0 100%)'
  };
  position: relative;
  overflow-x: hidden;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.theme === 'dark'
      ? 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 70%), radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 70%)'
      : 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 70%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 70%), radial-gradient(circle at 40% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 70%)'
    };
    z-index: -1;
  }
`;

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem 2rem;
  width: 100%;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const WelcomeSection = styled(motion.div)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 2.5rem;
  color: white;
  margin-bottom: 2rem;
  box-shadow: 
    0 20px 40px rgba(102, 126, 234, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: pulse 4s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.05); }
  }
`;

const WelcomeContent = styled.div`
  position: relative;
  z-index: 2;
`;

const WelcomeTitle = styled.h1`
  font-size: 2.8rem;
  margin-bottom: 0.5rem;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.5px;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.3rem;
  opacity: 0.95;
  margin-bottom: 1.5rem;
  color: #ffffff;
  font-weight: 300;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const QuickActionButton = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.8rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  color: white;
  text-decoration: none;
  font-weight: 600;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.6s;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    color: white;
    
    &::before {
      left: 100%;
    }
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
`;

const StatCard = styled(motion.div)`
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, rgba(45, 45, 45, 0.8) 0%, rgba(60, 60, 60, 0.6) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)'
  };
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => `linear-gradient(135deg, rgba(${props.iconColor}, 0.1) 0%, transparent 70%)`};
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.1);
    
    &::before {
      opacity: 1;
    }
  }
`;

const StatInfo = styled.div`
  position: relative;
  z-index: 2;
`;

const StatTitle = styled.div`
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#64748b'};
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  color: ${props => props.theme === 'dark' ? '#f8fafc' : '#1e293b'};
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: ${props => `linear-gradient(135deg, rgb(${props.gradientColors}))`};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  background: ${props => props.positive 
    ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))'
    : 'linear-gradient(90deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))'
  };
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  border: 1px solid ${props => props.positive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
`;

const StatIcon = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => `linear-gradient(135deg, rgba(${props.color}, 0.2), rgba(${props.color}, 0.1))`};
  color: ${props => `rgb(${props.color})`};
  font-size: 1.8rem;
  position: relative;
  z-index: 2;
  
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 22px;
    background: ${props => `linear-gradient(135deg, rgba(${props.color}, 0.3), rgba(${props.color}, 0.1))`};
    z-index: -1;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin: 3rem 0 1.5rem;
  color: ${props => props.theme === 'dark' ? '#f8fafc' : '#1e293b'};
  font-weight: 700;
  display: flex;
  align-items: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: -0.5rem;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    border-radius: 2px;
  }
  
  svg {
    margin-right: 12px;
    color: #3b82f6;
  }
`;

const ExamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ExamCard = styled(motion.div)`
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, rgba(45, 45, 45, 0.8) 0%, rgba(60, 60, 60, 0.6) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)'
  };
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.status === 'completed' 
      ? 'linear-gradient(90deg, #10b981, #059669)'
      : props.status === 'in-progress' 
        ? 'linear-gradient(90deg, #f59e0b, #d97706)'
        : 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
    };
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    
    .exam-icon {
      transform: rotate(10deg) scale(1.1);
    }
  }
`;

const ExamHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ExamTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: ${props => props.theme === 'dark' ? '#f8fafc' : '#1e293b'};
  font-weight: 700;
  line-height: 1.3;
`;

const ExamBadge = styled.div`
  background: ${props => 
    props.status === 'completed' ? 'linear-gradient(90deg, #10b981, #059669)' :
    props.status === 'in-progress' ? 'linear-gradient(90deg, #f59e0b, #d97706)' :
    props.status === 'failed' ? 'linear-gradient(90deg, #ef4444, #dc2626)' :
    'linear-gradient(90deg, #3b82f6, #1d4ed8)'
  };
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ExamInfo = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#64748b'};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
  
  svg {
    margin-right: 8px;
    color: #3b82f6;
  }
`;

const ExamProgress = styled.div`
  margin-top: 1.5rem;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const ProgressLabel = styled.div`
  font-size: 0.85rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#64748b'};
  font-weight: 600;
`;

const ProgressValue = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: ${props => props.theme === 'dark' ? '#f8fafc' : '#1e293b'};
`;

const ProgressBar = styled.div`
  height: 8px;
  width: 100%;
  background: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${props => props.gradient || 'linear-gradient(90deg, #3b82f6, #8b5cf6)'};
  border-radius: 4px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const ActivitySection = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-top: 3rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const ActivityFeed = styled.div`
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, rgba(45, 45, 45, 0.8) 0%, rgba(60, 60, 60, 0.6) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)'
  };
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const ActivityItem = styled(motion.div)`
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  display: flex;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    .activity-icon {
      transform: scale(1.1);
    }
  }
`;

const ActivityIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => `linear-gradient(135deg, rgba(${props.color}, 0.2), rgba(${props.color}, 0.1))`};
  color: ${props => `rgb(${props.color})`};
  margin-right: 1rem;
  flex-shrink: 0;
  transition: transform 0.3s ease;
  font-size: 1.2rem;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: ${props => props.theme === 'dark' ? '#f8fafc' : '#1e293b'};
`;

const ActivityTime = styled.div`
  font-size: 0.85rem;
  color: ${props => props.theme === 'dark' ? '#a0aec0' : '#64748b'};
  font-weight: 500;
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 3rem 2rem;
  background: ${props => props.theme === 'dark' 
    ? 'linear-gradient(135deg, rgba(45, 45, 45, 0.8) 0%, rgba(60, 60, 60, 0.6) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)'
  };
  backdrop-filter: blur(20px);
  border: 1px solid ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  .empty-icon {
    font-size: 3rem;
    color: ${props => props.theme === 'dark' ? '#64748b' : '#94a3b8'};
    margin-bottom: 1rem;
  }
  
  h3 {
    color: ${props => props.theme === 'dark' ? '#f8fafc' : '#1e293b'};
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#64748b'};
    margin-bottom: 1.5rem;
  }
`;

const ActionButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
    color: white;
  }
  
  svg {
    margin-right: 0.5rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  
  .loading-text {
    margin-top: 1rem;
    color: ${props => props.theme === 'dark' ? '#a0aec0' : '#64748b'};
    font-weight: 500;
  }
`;

const RefreshButton = styled(motion.button)`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
  z-index: 1000;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 12px 24px rgba(59, 130, 246, 0.4);
  }
`;

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);
  const { theme } = useSelector(state => state.ui);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      testsCompleted: 0,
      averageScore: 0,
      studyTime: 0,
      strengths: '',
      totalQuestions: 0,
      correctAnswers: 0
    },
    recentExams: [],
    completedExams: [],
    activities: [],
    events: []
  });

  const formatDate = () => {
    const date = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('vi-VN', options);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ GỌI API MỚI
      const data = await getDashboardData();
      
      // ✅ MAPPING DỮ LIỆU THEO CẤU TRÚC MỚI
      const mappedData = {
        stats: {
          testsCompleted: data.stats?.testsCompleted || 0,
          testsCompletedChange: data.stats?.testsCompletedChange || 0,
          averageScore: data.stats?.averageScore || 0,
          averageScoreChange: data.stats?.averageScoreChange || 0,
          studyTime: data.stats?.studyTime || 0,
          studyTimeChange: data.stats?.studyTimeChange || 0,
          strengths: data.stats?.strengths || 'Đang phân tích...',
          totalQuestions: data.stats?.totalQuestions || 0,
          correctAnswers: data.stats?.correctAnswers || 0
        },
        recentExams: (data.recentExams || []).map(exam => ({
          id: exam.id,
          title: exam.title,
          subject: exam.subject,
          duration: exam.duration,
          progress: exam.progress || 0,
          questions: exam.questions || 0,
          completed: exam.completed || 0,
          isCompleted: exam.isCompleted || false,
          startedAt: exam.startedAt
        })),
        completedExams: (data.completedExams || []).map(exam => ({
          id: exam.id,
          title: exam.title,
          subject: exam.subject,
          score: exam.score,
          totalScore: exam.totalScore,
          percentageScore: exam.percentageScore,
          isPassed: exam.isPassed,
          completedAt: exam.completedAt,
          completedDate: formatExamDate(exam.completedAt), // Helper function
          status: exam.status,
          resultId: exam.id // Để điều hướng đến kết quả
        })),
        activities: (data.activities || []).map(activity => ({
          id: activity.id,
          title: activity.title,
          time: activity.time,
          type: activity.type,
          color: activity.color || "59, 130, 246",
          description: activity.description
        })),
        events: (data.events || []).map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date: formatEventDate(event.startDate), // Helper function
          startDate: event.startDate,
          endDate: event.endDate,
          type: event.type,
          isImportant: event.isImportant
        }))
      };
      
      setDashboardData(mappedData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getActivityIcon = (type) => {
    switch(type) {
      case 'test':
        return <FaCheckCircle />;
      case 'achievement':
        return <FaTrophy />;
      case 'course':
        return <FaBook />;
      case 'streak':
        return <FaFire />;
      case 'bookmark':
        return <FaBookmark />;
      default:
        return <FaClock />;
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  // ✅ THÊM HELPER FUNCTIONS
  const formatExamDate = (dateString) => {
    if (!dateString) return 'Không xác định';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Hôm qua';
      if (diffDays < 7) return `${diffDays} ngày trước`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} tuần trước`;
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} tháng trước`;
      return `${Math.ceil(diffDays / 365)} năm trước`;
    } catch (error) {
      return 'Không xác định';
    }
  };

  const formatEventDate = (dateString) => {
    if (!dateString) return 'Không xác định';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Không xác định';
    }
  };

  if (loading) {
    return (
      <PageWrapper theme={theme}>
        <Header />
        <DashboardContainer>
          <LoadingContainer theme={theme}>
            <LoadingSpinner size={60} />
            <div className="loading-text">Đang tải dữ liệu...</div>
          </LoadingContainer>
        </DashboardContainer>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper theme={theme}>
      <Header />
      <DashboardContainer>
        <WelcomeSection
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <WelcomeContent>
            <WelcomeTitle>
              Chào mừng trở lại, {user?.fullName}! 🎉
            </WelcomeTitle>
            <WelcomeSubtitle>
              {formatDate()} - Sẵn sàng chinh phục thử thách mới?
            </WelcomeSubtitle>
            
            <QuickActions>
              <QuickActionButton to="/exams">
                <FaPlay /> Bắt đầu thi ngay
              </QuickActionButton>
              
              <QuickActionButton to="/exam-history">
                <FaEye /> Xem kết quả
              </QuickActionButton>
            </QuickActions>
          </WelcomeContent>
        </WelcomeSection>

        <StatsGrid>
          <StatCard
            theme={theme}
            iconColor="59, 130, 246"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <StatInfo>
              <StatTitle theme={theme}>Bài thi hoàn thành</StatTitle>
              <StatValue 
                theme={theme}
                gradientColors="59, 130, 246, 139, 92, 246"
              >
                {dashboardData.stats.testsCompleted}
              </StatValue>
              {dashboardData.stats.testsCompletedChange !== undefined && (
                <StatChange positive={dashboardData.stats.testsCompletedChange >= 0}>
                  {dashboardData.stats.testsCompletedChange >= 0 ? (
                    <FaArrowUp style={{ marginRight: '5px' }} />
                  ) : (
                    <FaArrowDown style={{ marginRight: '5px' }} />
                  )}
                  {Math.abs(dashboardData.stats.testsCompletedChange)}% tuần này
                </StatChange>
              )}
            </StatInfo>
            <StatIcon color="59, 130, 246">
              <FaCheckCircle />
            </StatIcon>
          </StatCard>

          <StatCard
            theme={theme}
            iconColor="16, 185, 129"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <StatInfo>
              <StatTitle theme={theme}>Điểm trung bình</StatTitle>
              <StatValue 
                theme={theme}
                gradientColors="16, 185, 129, 59, 130, 246"
              >
                {dashboardData.stats.averageScore.toFixed(1)}
              </StatValue>
              {dashboardData.stats.averageScoreChange !== undefined && (
                <StatChange positive={dashboardData.stats.averageScoreChange >= 0}>
                  {dashboardData.stats.averageScoreChange >= 0 ? (
                    <FaArrowUp style={{ marginRight: '5px' }} />
                  ) : (
                    <FaArrowDown style={{ marginRight: '5px' }} />
                  )}
                  {Math.abs(dashboardData.stats.averageScoreChange)}% so với trước
                </StatChange>
              )}
            </StatInfo>
            <StatIcon color="16, 185, 129">
              <FaChartLine />
            </StatIcon>
          </StatCard>

          <StatCard
            theme={theme}
            iconColor="245, 158, 11"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <StatInfo>
              <StatTitle theme={theme}>Tỷ lệ chính xác</StatTitle>
              <StatValue 
                theme={theme}
                gradientColors="245, 158, 11, 239, 68, 68"
              >
                {dashboardData.stats.totalQuestions > 0 
                  ? Math.round((dashboardData.stats.correctAnswers / dashboardData.stats.totalQuestions) * 100)
                  : 0}%
              </StatValue>
              <StatChange positive={true}>
                <FaTrophy style={{ marginRight: '5px' }} />
                {dashboardData.stats.correctAnswers}/{dashboardData.stats.totalQuestions} câu
              </StatChange>
            </StatInfo>
            <StatIcon color="245, 158, 11">
              <FaBullseye />
            </StatIcon>
          </StatCard>

          <StatCard
            theme={theme}
            iconColor="139, 92, 246"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <StatInfo>
              <StatTitle theme={theme}>Thế mạnh</StatTitle>
              <StatValue 
                theme={theme}
                gradientColors="139, 92, 246, 16, 185, 129"
                style={{ fontSize: '1.4rem' }}
              >
                {dashboardData.stats.strengths || 'Đang phân tích...'}
              </StatValue>
              <StatChange positive={true}>
                <FaStar style={{ marginRight: '5px' }} />
                Môn học yêu thích
              </StatChange>
            </StatInfo>
            <StatIcon color="139, 92, 246">
              <FaGraduationCap />
            </StatIcon>
          </StatCard>
        </StatsGrid>

        <SectionTitle theme={theme}>
          <FaRocket /> Bài thi đang thực hiện
        </SectionTitle>

        {dashboardData.recentExams && dashboardData.recentExams.length > 0 ? (
          <ExamGrid>
            {dashboardData.recentExams.map((exam, index) => (
              <ExamCard
                key={exam.id}
                theme={theme}
                status="in-progress"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <ExamHeader>
                  <div>
                    <ExamTitle theme={theme}>{exam.title}</ExamTitle>
                    <ExamInfo theme={theme}>
                      <FaGraduationCap /> {exam.subject}
                    </ExamInfo>
                    <ExamInfo theme={theme}>
                      <FaClock /> {exam.duration}
                    </ExamInfo>
                  </div>
                  <ExamBadge status="in-progress">Đang làm</ExamBadge>
                </ExamHeader>
                
                <ExamProgress>
                  <ProgressHeader>
                    <ProgressLabel theme={theme}>
                      Tiến độ: {exam.completed}/{exam.questions} câu
                    </ProgressLabel>
                    <ProgressValue theme={theme}>
                      {exam.progress}%
                    </ProgressValue>
                  </ProgressHeader>
                  <ProgressBar theme={theme}>
                    <ProgressFill
                      style={{ width: `${exam.progress}%` }}
                      gradient="linear-gradient(90deg, #f59e0b, #d97706)"
                      initial={{ width: 0 }}
                      animate={{ width: `${exam.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </ProgressBar>
                </ExamProgress>
              </ExamCard>
            ))}
          </ExamGrid>
        ) : (
          <EmptyState
            theme={theme}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="empty-icon">
              <FaLightbulb />
            </div>
            <h3>Chưa có bài thi nào đang thực hiện</h3>
            <p>Bắt đầu một bài thi mới để kiểm tra kiến thức của bạn!</p>
            <ActionButton to="/exams">
              <FaPlay /> Bắt đầu ngay
            </ActionButton>
          </EmptyState>
        )}

        <SectionTitle theme={theme}>
          <FaAward /> Bài thi đã hoàn thành
        </SectionTitle>

        {dashboardData.completedExams && dashboardData.completedExams.length > 0 ? (
          <ExamGrid>
            {dashboardData.completedExams.slice(0, 6).map((exam, index) => (
              <ExamCard
                key={exam.id}
                theme={theme}
                status="completed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => window.location.href = `/exam-results/${exam.resultId}`}
              >
                <ExamHeader>
                  <div>
                    <ExamTitle theme={theme}>{exam.title}</ExamTitle>
                    <ExamInfo theme={theme}>
                      <FaGraduationCap /> {exam.subject}
                    </ExamInfo>
                    <ExamInfo theme={theme}>
                      <FaClock /> {exam.completedDate}
                    </ExamInfo>
                  </div>
                  <ExamBadge status={exam.isPassed ? "completed" : "failed"}>
                    {exam.isPassed ? "Đạt" : "Chưa đạt"}
                  </ExamBadge>
                </ExamHeader>
                
                <ExamProgress>
                  <ProgressHeader>
                    <ProgressLabel theme={theme}>
                      Kết quả: {exam.score}/{exam.totalScore} điểm
                    </ProgressLabel>
                    <ProgressValue theme={theme}>
                      {Math.round((exam.score/exam.totalScore)*100)}%
                    </ProgressValue>
                  </ProgressHeader>
                  <ProgressBar theme={theme}>
                    <ProgressFill
                      style={{ width: `${Math.round((exam.score/exam.totalScore)*100)}%` }}
                      gradient={exam.isPassed 
                        ? "linear-gradient(90deg, #10b981, #059669)"
                        : "linear-gradient(90deg, #ef4444, #dc2626)"
                      }
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round((exam.score/exam.totalScore)*100)}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </ProgressBar>
                </ExamProgress>
              </ExamCard>
            ))}
          </ExamGrid>
        ) : (
          <EmptyState
            theme={theme}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="empty-icon">
              <FaHeart />
            </div>
            <h3>Chưa hoàn thành bài thi nào</h3>
            <p>Hãy bắt đầu thử thách đầu tiên của bạn!</p>
            <ActionButton to="/exams">
              <FaPaperPlane /> Khám phá bài thi
            </ActionButton>
          </EmptyState>
        )}

        <ActivitySection>
          <div>
            <SectionTitle theme={theme}>
              <FaChartPie /> Hoạt động gần đây
            </SectionTitle>
            {dashboardData.activities && dashboardData.activities.length > 0 ? (
              <ActivityFeed theme={theme}>
                <AnimatePresence>
                  {dashboardData.activities.map((activity, index) => (
                    <ActivityItem
                      key={activity.id}
                      theme={theme}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <ActivityIcon 
                        className="activity-icon"
                        color={activity.color || "59, 130, 246"}
                      >
                        {getActivityIcon(activity.type)}
                      </ActivityIcon>
                      <ActivityContent>
                        <ActivityTitle theme={theme}>
                          {activity.title}
                        </ActivityTitle>
                        <ActivityTime theme={theme}>
                          {activity.time}
                        </ActivityTime>
                      </ActivityContent>
                    </ActivityItem>
                  ))}
                </AnimatePresence>
              </ActivityFeed>
            ) : (
              <EmptyState theme={theme}>
                <div className="empty-icon">
                  <FaChartLine />
                </div>
                <h3>Chưa có hoạt động nào</h3>
                <p>Bắt đầu học tập để xem hoạt động của bạn tại đây!</p>
              </EmptyState>
            )}
          </div>

          <div>
            <SectionTitle theme={theme}>
              <FaBell /> Thông báo
            </SectionTitle>
            {dashboardData.events && dashboardData.events.length > 0 ? (
              <ActivityFeed theme={theme}>
                <AnimatePresence>
                  {dashboardData.events.map((event, index) => (
                    <ActivityItem
                      key={event.id}
                      theme={theme}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <ActivityIcon 
                        className="activity-icon"
                        color="245, 158, 11"
                      >
                        <FaCalendarCheck />
                      </ActivityIcon>
                      <ActivityContent>
                        <ActivityTitle theme={theme}>
                          {event.title}
                        </ActivityTitle>
                        <ActivityTime theme={theme}>
                          {event.date}
                        </ActivityTime>
                      </ActivityContent>
                    </ActivityItem>
                  ))}
                </AnimatePresence>
              </ActivityFeed>
            ) : (
              <EmptyState theme={theme}>
                <div className="empty-icon">
                  <FaBell />
                </div>
                <h3>Không có thông báo mới</h3>
                <p>Bạn đã cập nhật tất cả thông tin!</p>
              </EmptyState>
            )}
          </div>
        </ActivitySection>

        <RefreshButton
          onClick={handleRefresh}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <FaSync />
        </RefreshButton>
      </DashboardContainer>
    </PageWrapper>
  );
};

export default Dashboard;