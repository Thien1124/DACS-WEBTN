import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Navbar from './Navbar';
import Footer from './Footer';
import { useSelector } from 'react-redux';
// Thêm imports mới
import useExamReminders from '../../hooks/useExamReminders';
import ExamReminderBanner from '../../components/reminders/ExamReminderBanner';

const MainContainer = styled.div`
  padding-top: 70px; /* Điều chỉnh kích thước này bằng hoặc lớn hơn chiều cao của header */
  min-height: calc(100vh - 70px);
  width: 100%;
  margin: 0 auto;
  transition: all 0.3s ease;
`;

const Content = styled.main`
  flex: 1;
  padding: 60px 0 20px;
  width: 100%;
`;

// Style cho banner container
const BannerContainer = styled.div`
  margin: 0 auto;
  max-width: 1200px;
  padding: 0 20px;
  margin-top: 15px;
  margin-bottom: 15px;
`;

const AppLayout = () => {
  const [theme, setTheme] = useState('light');
  const location = useLocation();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  // Lấy thông tin người dùng để kiểm tra vai trò
  const user = useSelector(state => state.auth.user);
  // Hook lấy thông báo về các bài thi sắp tới
  const { upcomingExams, dismissExam } = useExamReminders();
  
  // Kiểm tra nếu người dùng là học sinh
  const isStudent = isAuthenticated && user?.role === 'Student';
  
  // Debug log để xem tại sao banner không hiển thị
  useEffect(() => {
    console.log('Exam reminder check:', {
      isAuthenticated,
      userRole: user?.role,
      isStudent,
      upcomingExams: upcomingExams || [],
      hasUpcomingExams: upcomingExams?.length > 0
    });
  }, [isAuthenticated, user, isStudent, upcomingExams]);
  
  // Log thêm thông tin chi tiết
  useEffect(() => {
    console.log("Banner debug:", {
      upcomingExams,
      isDisplayed: isStudent && upcomingExams && upcomingExams.length > 0,
      firstExam: upcomingExams?.[0]
    });
  }, [isStudent, upcomingExams]);
  
  useEffect(() => {
    // Check if user has a saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Use system preference if no saved preference
      setTheme('dark');
    }
    
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  // Some routes might need different layouts or no layout at all
  const shouldShowNavFooter = () => {
    // Add routes that shouldn't have navbar/footer (like auth pages or exam pages)
    const routesWithoutFullLayout = ['/exams', '/login', '/register', '/forgot-password', '/reset-password'];
    
    // Check if current path is in the exclusion list
    return !routesWithoutFullLayout.some(route => location.pathname.startsWith(route));
  };
  
  return (
    <MainContainer theme={theme}>
      <Navbar theme={theme} toggleTheme={toggleTheme} isAuthenticated={isAuthenticated} />
      
      {/* Thêm banner nhắc nhở thi ở đây - ngay sau Navbar và trước Content */}
      {isStudent && upcomingExams && upcomingExams.length > 0 && (
        <BannerContainer>
          <ExamReminderBanner 
            key={`exam-reminder-${upcomingExams[0].id}`}
            exam={upcomingExams[0]} 
            theme={theme}
            onClose={(examId) => dismissExam(examId)}
          />
        </BannerContainer>
      )}
      
      <Content>{<Outlet context={{ theme }} />}</Content>
      {shouldShowNavFooter() && <Footer theme={theme} />}
    </MainContainer>
  );
};

export default AppLayout;
