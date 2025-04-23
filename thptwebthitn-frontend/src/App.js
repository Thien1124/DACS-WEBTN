import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import SubjectTopStudentsPage from './pages/leaderboard/SubjectTopStudentsPage';


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

// Context & Providers
import { AuthProvider } from './contexts/AuthProvider';
import ToastProvider from './components/shared/ToastProvider';

// Actions
import { setAnimation } from './redux/uiSlice';

import styled from 'styled-components';

// CSS
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import './assets/styles/toast.css';

// Thêm import
import useRoleSynchronizer from './hooks/useRoleSynchronizer';

// Add these imports
import ExamLeaderboard from './pages/leaderboard/ExamLeaderboard';
import SubjectLeaderboard from './pages/leaderboard/SubjectLeaderboard';

import { initializeTokens } from './utils/tokenSync';

import ExamQuestions from './components/admin/ExamQuestions';

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
  const { user } = useSelector(state => state.auth);
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
  
  return (
    <Router>
      <AuthProvider>
        <AppContainer theme={theme}>
          <ToastProvider />
          
          <Routes>
            {/* Auth Routes - Ngoài Layout */}
            <Route path="/login" element={<AuthPage type="login" />} />
            <Route path="/register" element={<AuthPage type="register" />} />
            <Route path="/forgot-password" element={<AuthPage type="forgot-password" />} />
            <Route path="/reset-password" element={<AuthPage type="reset-password" />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Các routes bọc trong AppLayout */}
            <Route element={<AppLayout />}>
              {/* Home Page */}
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
              
              {/* Add this new route for Teacher Statistics */}
              <Route path="/teacher/statistics" element={
                <TeacherRoute>
                  <TeacherStatistics />
                </TeacherRoute>
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

              {/* Add these routes inside your Routes component */}
              <Route path="/leaderboard/exams/:examId" element={
                <ProtectedRoute>
                  <ExamLeaderboard />
                </ProtectedRoute>
              } />

              <Route path="/leaderboard/subjects" element={
                <ProtectedRoute>
                  <SubjectLeaderboard />
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
            </Route>
          </Routes>
          
        </AppContainer>
      </AuthProvider>
    </Router>
  );
}

export default App;