import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import SubjectTopStudentsPage from './pages/leaderboard/SubjectTopStudentsPage';
import ExamResultDetail from './components/results/ExamResultDetail';
import OfficialExamsList from './components/admin/OfficialExamsList';
import OfficialExamDetail from './components/admin/OfficialExamDetail';

//Teacher
import TeacherExamManagement from './pages/teacher/TeacherExamManagement';
import TeacherCreateExam from './pages/teacher/TeacherCreateExam';
import TeacherEditExam from './pages/teacher//TeacherEditExam';
import TeacherImportExam from './pages/teacher/TeacherImportExam';

// Layout
import AppLayout from './components/layout/AppLayout';

// Add these new imports
import AdminStatistics from './pages/admin/AdminStatistics';
import TeacherStatistics from './pages/teacher/TeacherStatistics';
import TeacherChatBox from './components/chat/TeacherChatBox';
// Pages
import HomePage from './components/Home';
import ProfilePage from './pages/profile/Profile';
import DashboardPage from './components/Dashboard/Dashboard';
import SettingsPage from './components/Settings/Settings';
import AuthPage from './pages/AuthPage';
import Unauthorized from './components/error/Unauthorized';

//Chappter
import ChapterManagement from './components/admin/ChapterManagement';
// Subject Pages
import SubjectsPage from './pages/SubjectsPage';  // Import chính xác SubjectsPage 
import SubjectDetail from './components/subjects/SubjectDetail';
import CreateSubject from './components/subjects/CreateSubject';
import EditSubject from './components/subjects/EditSubject';
import DeleteSubject from './components/subjects/DeleteSubject';
import ToggleSubjectStatus from './pages/admin/ToggleSubjectStatus';

// Exam Pages
import ExamList from './components/exams/ExamList';
import ExamInterface from './components/exams/ExamInterface';
import ExamResults from './components/exams/ExamResults';
import ExamHistory from './components/exams/ExamHistory';
import ExamManagement from './components/admin/ExamManagement';
import CreateExam from './components/admin/CreateExam';
import EditExam from './components/admin/EditExam';
import QuestionManagement from './components/admin/QuestionManagement';
import CreateQuestion from './components/admin/CreateQuestion';
import EditQuestion from './components/admin/EditQuestion';
import UserManagement from './components/admin/UserManagement';
import StudentExamList from './components/exams/StudentExamList';
import ExamsBySubject from './components/exams/ExamsBySubject';
import ExamDetails from './components/admin/ExamDetails';

import ExamQuestionsList from './components/exams/ExamQuestionsList';
// Auth Components
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import ForgotPasswordForm from './components/Auth/ForgotPasswordForm';
import ResetPasswordForm from './components/Auth/ResetPasswordForm';
import ChangePasswordForm from './components/Auth/ChangePasswordForm';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';
import TeacherRoute from './components/Auth/TeacherRoute';

import { AuthProvider } from './contexts/AuthProvider';
import ToastProvider from './components/shared/ToastProvider';
import { setAnimation } from './redux/uiSlice';
import styled from 'styled-components';

// CSS
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import './assets/styles/toast.css';
import TeacherExamStatisticsMockData from './pages/teacher/TeacherExamStatisticsMockData';

import useRoleSynchronizer from './hooks/useRoleSynchronizer';
import ExamLeaderboard from './pages/leaderboard/ExamLeaderboard';
import SubjectLeaderboard from './pages/leaderboard/SubjectLeaderboard';
import { initializeTokens } from './utils/tokenSync';
import ExamQuestions from './components/admin/ExamQuestions';

import useExamReminders from './hooks/useExamReminders';
import ExamReminderBanner from './components/reminders/ExamReminderBanner';

import CreateChapter from './components/admin/CreateChapter';
import EditChapter from './components/admin/EditChapter';

import PracticeBySubject from './components/practice/PracticeBySubject';

import PracticeExam from './components/practice/PracticeExam';

import NotificationsPage from './pages/NotificationsPage';

import { NotificationProvider } from './contexts/NotificationContext';

import MyFeedbacks from './pages/MyFeedbacks';
import TeacherCreateStructuredExam from './pages/teacher/TeacherCreateStructuredExam';

// Thêm import cho component mới
import TeacherQuestionBank from './pages/teacher/TeacherQuestionBank';

// Thêm import mới
import TeacherCreateTopicExam from './pages/teacher/TeacherCreateTopicExam';

// Import component mới
import TeacherExamStatistics from './pages/teacher/TeacherExamStatistics';

// Thêm import cho component mới
import TeacherResultAnalytics from './pages/teacher/TeacherResultAnalytics';

import NotificationBadge from './components/notifications/NotificationBadge';
import NotificationSender from './components/admin/NotificationSender';
import CreateOfficialExam from './components/admin/CreateOfficialExam';

import ImportQuestionsExcel from './components/admin/ImportQuestionsExcel';
import StudentClassManagement from './components/admin/StudentClassManagement';
import ManageExamStudents from './components/admin/ManageExamStudents';

import ChatBox from './components/chat/ChatBox';

import TeacherMaterials from './pages/teacher/TeacherMaterials';

// Trong file routes hoặc App.jsx
import About from './pages/About';  
import Contact from './pages/Contact';

// Add these imports at the top of your file with the other component imports
import StudentAnalytics from './pages/student/StudentAnalytics';
import StudentRankings from './pages/student/StudentRankings';

// Add this import near the top with other component imports
import AnalyticsCharts from './pages/analytics/AnalyticsCharts';

// Add this import near the top with other component imports
import EditOfficialExam from './components/admin/EditOfficialExam';

// Add this import at the top
import OfficialExamResults from './components/admin/OfficialExamResults';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme === 'dark' ? '#121212' : '#f7f7f7'};
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#333333'};
  transition: background-color 0.3s ease, color 0.3s ease;
`;

// Hàm tiện ích để định dạng thời gian
const formatDateTime = (date = new Date()) => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

function App() {
  const { theme, currentAnimation } = useSelector(state => state.ui);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const currentUser = 'vinhsonvlog'; // hoặc lấy từ state/localStorage

  // Sử dụng hook đồng bộ hóa
  useRoleSynchronizer();

  useEffect(() => {
    // Ensure token consistency across storage keys
    initializeTokens();
  }, []);

  useEffect(() => {
    // Auto-play animations in sequence
    const animationSequence = ['fadeIn', 'slideUp', 'pulse', 'idle'];
    let currentIndex = 0;
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    const manualLogout = sessionStorage.getItem('manual_logout');
  
    const animationInterval = setInterval(() => {
      dispatch(setAnimation(animationSequence[currentIndex]));
      currentIndex = (currentIndex + 1) % animationSequence.length;
    }, 3000);
    
    if (manualLogout === 'true') {
      console.log('Phát hiện đăng xuất thủ công, xóa dữ liệu đăng nhập');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('remember_me');
    }
    
    if ((token && !userData) || (!token && userData)) {
      console.log('Phát hiện trạng thái không nhất quán, xóa dữ liệu đăng nhập');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
    }
    
    // Lưu thông tin thời gian hiện tại
    const currentDate = formatDateTime();
    console.log(`App initialized at: ${currentDate} by user: ${currentUser}`);

    return () => clearInterval(animationInterval);
  }, [dispatch, currentUser]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user_data'));
    const userRole = localStorage.getItem('user_role');
    console.log('LocalStorage - user_data.role:', userData?.role);
    console.log('LocalStorage - user_role:', userRole);
    console.log('Redux state user role:', user?.role);
    
    // Kiểm tra nếu có sự không nhất quán
    if (userData?.role !== userRole || (user && user.role !== userData?.role)) {
      console.warn('ROLE INCONSISTENCY DETECTED!', {
        localStorageUserData: userData?.role,
        localStorageUserRole: userRole,
        reduxStateRole: user?.role
      });
    }
  }, [user]);
  
  // Thêm hook lấy thông tin về các bài thi sắp tới
  const examReminders = useExamReminders();
  const { upcomingExams, dismissExam } = examReminders || { upcomingExams: [], dismissExam: () => {} };
  
  // Kiểm tra nếu người dùng là học sinh
  const isStudent = isAuthenticated && user?.role === 'Student';

  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <AppContainer theme={theme}>
            <ToastProvider />
            
            {isStudent && upcomingExams.length > 0 && (
              <ExamReminderBanner 
                upcomingExams={upcomingExams}
                onDismiss={dismissExam}
                theme={theme}
              />
            )}
            
            <Routes>
              <Route element={<AppLayout />}>
                {/* Auth Routes - Ngoài Layout */}
                <Route path="/login" element={<AuthPage type="login" />} />
                <Route path="/register" element={<AuthPage type="register" />} />
                <Route path="/forgot-password" element={<AuthPage type="forgot-password" />} />
                <Route path="/reset-password" element={<AuthPage type="reset-password" />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                {/* Các routes bọc trong AppLayout */}
                <Route path="/" element={<HomePage />} />
                
                {/* Subject Routes */}
                <Route path="/subjects" element={<SubjectsPage />} />
                <Route path="/subjects/:subjectId" element={<SubjectDetail />} />
                <Route path="/subjects/:subjectId/exams" element={<ExamList />} />
                <Route path="/subject/create" element={
                  <ProtectedRoute roles={['Admin', 'Teacher']}>
                    <CreateSubject />
                  </ProtectedRoute>
                } />
                <Route path="/subject/edit/:id" element={
                  <ProtectedRoute roles={['Admin', 'Teacher']}>
                    <EditSubject />
                  </ProtectedRoute>
                } />
                <Route path="/subject/delete/:id" element={
                  <ProtectedRoute roles={['Admin']}>
                    <DeleteSubject />
                  </ProtectedRoute>
                } />
                <Route path="/subject/toggle-status/:id" element={
                  <ProtectedRoute roles={['Admin', 'Teacher']}>
                    <ToggleSubjectStatus />
                  </ProtectedRoute>
                } />
                
                {/* Exam Routes */}
                <Route path="/exams" element={<StudentExamList />} />
                <Route path="/exams/:examId" element={
                  <ProtectedRoute>
                    <ExamInterface />
                  </ProtectedRoute>
                } />
                <Route path="/Exam/:examId" element={<ExamInterface />} />
                <Route path="/exams/:examId/questions" element={<ExamQuestionsList />} />
                <Route path="/exam-results/:resultId" element={
                  <ProtectedRoute>
                    <ExamResults />
                  </ProtectedRoute>
                } />
                <Route path="/results/history" element={
                  <ProtectedRoute>
                    <ExamHistory />
                  </ProtectedRoute>
                } />
                <Route path="/exam-history" element={
                  <ProtectedRoute>
                    <ExamHistory />
                  </ProtectedRoute>
                } />
                <Route path="/exams/by-subject/:subjectId" element={<ExamsBySubject />} />
                
                {/* User Routes */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } />
                <Route path="/change-password" element={
                  <ProtectedRoute>
                    <ChangePasswordForm />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin/subjects/create" element={
                  <AdminRoute>
                    <CreateSubject />
                  </AdminRoute>
                } />
                <Route path="/admin/subjects/:id/edit" element={
                  <AdminRoute>
                    <EditSubject />
                  </AdminRoute>
                } />
                <Route path="/admin/exams" element={
                  <AdminRoute>
                    <ExamManagement />
                  </AdminRoute>
                } />
                <Route path="/admin/exams/create" element={
                  <AdminRoute>
                    <CreateExam />
                  </AdminRoute>
                } />
                <Route path="/teacher/exams/create" element={
                  <TeacherRoute>
                    <CreateExam />
                  </TeacherRoute>
                } />
                <Route path="/teacher/exams/:id/edit" element={
                  <TeacherRoute>
                    <EditExam />
                  </TeacherRoute>
                } />
                <Route path="/admin/exams/:id/edit" element={
                  <AdminRoute>
                    <EditExam />
                  </AdminRoute>
                } />
                <Route path="/admin/questions" element={
                  <AdminRoute>
                    <QuestionManagement />
                  </AdminRoute>
                } />
                <Route path="/admin/questions/create" element={
                  <AdminRoute>
                    <CreateQuestion />
                  </AdminRoute>
                } />
                <Route path="/admin/questions/:id/edit" element={
                  <AdminRoute>
                    <EditQuestion />
                  </AdminRoute>
                } />
                <Route path="/admin/users" element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                } />
                
                {/* Add this new route for Admin Statistics */}
                <Route path="/admin/statistics" element={
                  <AdminRoute>
                    <AdminStatistics />
                  </AdminRoute>
                } />
                
                {/* Add this in the Admin Routes section */}
                <Route path="/admin/notifications" element={
                  <AdminRoute>
                    <NotificationSender />
                  </AdminRoute>
                } />
                <Route path="/admin/official-exams" element={<OfficialExamsList />} />
                {/* Add this route in the Admin Routes section */}
                <Route path="/admin/official-exams/create" element={
                  <AdminRoute>
                    <CreateOfficialExam />
                  </AdminRoute>
                } />
                {/* Add this route in the Admin Routes section */}
                <Route path="/admin/official-exams/:id" element={
                  <AdminRoute>
                    <OfficialExamDetail />
                  </AdminRoute>
                } />
                
                <Route path="/admin/official-exams/:id/students" element={
                  <ProtectedRoute>
                    <AdminRoute>
                      <ManageExamStudents />
                    </AdminRoute>
                  </ProtectedRoute>
                } />
                {/* Add this route inside the existing routes section (around line 400 where other official exam routes are) */}
                <Route path="/admin/official-exams/edit/:id" element={
                  <AdminRoute>
                    <EditOfficialExam />
                  </AdminRoute>
                } />
                
                {/* In your Routes section, add these teacher exam management routes */}
                <Route path="/teacher/exams" element={
                  <TeacherRoute>
                    <TeacherExamManagement />
                  </TeacherRoute>
                } />
                <Route path="/teacher/exams/create" element={
                  <TeacherRoute>
                    <TeacherCreateExam />
                  </TeacherRoute>
                } />
                <Route path="/teacher/exams/:id/edit" element={
                  <TeacherRoute>
                    <TeacherEditExam />
                  </TeacherRoute>
                } />
                <Route path="/teacher/exams/import" element={
                  <TeacherRoute>
                    <TeacherImportExam />
                  </TeacherRoute>
                } />
                
                <Route path="/teacher/exams/create-structured" element={
                  <TeacherRoute>
                    <TeacherCreateStructuredExam />
                  </TeacherRoute>
                } />
                {/* Add these routes inside your Routes component */}
                <Route path="/leaderboard/exams/:examId" element={
                  <ProtectedRoute>
                    <ExamLeaderboard />
                  </ProtectedRoute>
                } />

                

                {/* Add this new route for Chapter Management */}
                <Route path="/admin/chapters" element={
                  <AdminRoute>
                    <ChapterManagement />
                  </AdminRoute>
                } />
                <Route path="/subjects/:subjectId/top-students" element={<SubjectTopStudentsPage />} />
                <Route path="/admin/exams/:examId/details" element={
                            <ProtectedRoute requiredRoles={['Admin', 'Teacher']}>
                              <ExamDetails />
                            </ProtectedRoute>
                          } />
                <Route path="/admin/exams/:examId/questions" element={<ExamQuestions />} />
                <Route path="/admin/exams/:examId/questions/create" element={<CreateQuestion />} />
                <Route path="/admin/exams/:examId/questions/:questionId/edit" element={<EditQuestion />} />

                {/* Routes quản lý chương */}
                <Route path="/admin/chapters/create" element={
                  <AdminRoute>
                    <CreateChapter />
                  </AdminRoute>
                } />
                <Route path="/admin/chapters/:chapterId/edit" element={
                  <AdminRoute>
                    <EditChapter />
                  </AdminRoute>
                } />
                

                <Route path="/admin/chapters" element={
                  <AdminRoute>
                    <ChapterManagement />
                  </AdminRoute>
                } />
                <Route path="/admin/chapters/create" element={
                  <AdminRoute>
                    <CreateChapter />
                  </AdminRoute>
                } />
                <Route path="/admin/chapters/edit" element={
                  <AdminRoute>
                    <EditChapter />
                  </AdminRoute>
                } />

                {/* Thêm route phần teacher routes nếu bạn muốn giáo viên cũng quản lý được chương */}
                <Route path="/teacher/chapters" element={
                  <TeacherRoute>
                    <ChapterManagement />
                  </TeacherRoute>
                } />
                <Route path="/teacher/chapters/create" element={
                  <TeacherRoute>
                    <CreateChapter />
                  </TeacherRoute>
                } />
                <Route path="/teacher/chapters/:chapterId/edit" element={
                  <TeacherRoute>
                    <EditChapter />
                  </TeacherRoute>
                } />
                <Route path="/exam-results/:resultId" element={<ExamResultDetail />} />
                {/* Thêm route mới */}
                <Route path="/practice" element={<PracticeBySubject />} />
                <Route path="/practice-exam" element={<PracticeExam />} />
                <Route path="/teacher/exams/create-topic" element={<TeacherCreateTopicExam />} />
                {/* Thêm route vào phần Routes trong AppLayout */}
                <Route path="/notifications" element={
                  <ProtectedRoute roles={['Student']}>
                    <NotificationsPage />
                  </ProtectedRoute>
                } />

                {/* Trong phần Routes, thêm route mới */}
                <Route path="/my-feedbacks" element={
                  <ProtectedRoute roles={['Student']}>
                    <MyFeedbacks />
                  </ProtectedRoute>
                } />


                {/* Thêm routes mới cho quản lý ngân hàng câu hỏi */}
                <Route path="/teacher/questions" element={
                  <TeacherRoute>
                    <TeacherQuestionBank />
                  </TeacherRoute>
                } />

                {/* Thêm route này vào phần Teacher Routes */}
                <Route path="/teacher/statistics" element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <TeacherRoute>
                    <TeacherExamStatisticsMockData />
                    </TeacherRoute>
                  </ProtectedRoute>
                } />

                {/* Thêm các routes sau vào phần TeacherRoute trong App.js */}
                <Route path="/teacher/analytics" element={
                  <TeacherRoute>
                    <TeacherResultAnalytics />
                  </TeacherRoute>
                } />

                <Route path="/teacher/analytics/:examId" element={
                  <TeacherRoute>
                    <TeacherResultAnalytics />
                  </TeacherRoute>
                } />

                {/* Add this route if it's not already there: */}
                <Route path="/admin/subjects/:subjectId/chapters/create" element={
                  <AdminRoute>
                    <CreateChapter />
                  </AdminRoute>
                } />

                {/* And for teacher: */}
                <Route path="/teacher/subjects/:subjectId/chapters/create" element={
                  <TeacherRoute>
                    <CreateChapter />
                  </TeacherRoute>
                } />
                <Route path="/admin/notifications" element={
                  <AdminRoute>
                    <NotificationSender />
                  </AdminRoute>
                } />

                {/* Add this route inside the Admin routes section */}
                <Route path="/admin/questions/import-excel" element={
                  <AdminRoute>
                    <ImportQuestionsExcel />
                  </AdminRoute>
                } />

                {/* Add this route inside the AdminRoute section */}
                <Route path="/admin/students/classes" element={
                  <AdminRoute>
                    <StudentClassManagement />
                  </AdminRoute>
                } />

                {/* Add this new route for Student Chat */}
                <Route path="/chat" element={
                  <ProtectedRoute roles={['Student']}>
                    <ChatBox />
                  </ProtectedRoute>
                } />

                {/* Add this new route for Teacher Materials */}
                <Route path="/teacher/materials" element={
                  <ProtectedRoute roles={['Teacher']}>
                    <TeacherMaterials />
                  </ProtectedRoute>
                } />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                {/* Student Analytics Routes */}
                <Route 
                  path="/analytics/student/:studentId" 
                  element={
                    <ProtectedRoute requiredRoles={['student', 'teacher', 'admin']}>
                      <StudentAnalytics />
                    </ProtectedRoute>
                  } 
                />

                <Route 
                  path="/student/rankings" 
                  element={
                    <ProtectedRoute requiredRoles={['student', 'teacher', 'admin']}>
                      <StudentRankings />
                    </ProtectedRoute>
                  } 
                />

                {/* Then add this route in your Routes component */}
                <Route 
                  path="/analytics/charts" 
                  element={
                    <ProtectedRoute requiredRoles={['teacher', 'admin']}>
                      <AnalyticsCharts />
                    </ProtectedRoute>
                  } 
                />
                
                <Route path="/admin/chat" element={
                  <AdminRoute>
                    <TeacherChatBox />
                  </AdminRoute>
                } />
                <Route path="/teacher/chat" element={
                  <TeacherRoute>
                    <TeacherChatBox />
                  </TeacherRoute>
                } />
                {/* Then add this route inside the Admin Routes section */}
                <Route path="/admin/official-exams/:id/results" element={
                  <AdminRoute>
                    <OfficialExamResults />
                  </AdminRoute>
                } />
                
                </Route>
              
            </Routes>
            
          </AppContainer>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;