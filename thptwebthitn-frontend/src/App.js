import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import { setAnimation, login } from './redux/uiSlice';
import StudentProfile from './pages/profile/StudentProfile';
import Profile from './pages/profile/Profile';
import Home from './components/Home';
import AuthContainer from './components/Auth/AuthContainer';
import Dashboard from './components/Dashboard/Dashboard';
import Settings from './components/Settings/Settings';
import { ThemeProvider } from 'styled-components';
import Navbar from './components/layout/Navbar';
import { getUserData, getToken } from './utils/auth';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ToggleSubjectStatus from './pages/admin/ToggleSubjectStatus';
import Unauthorized from './components/error/Unauthorized';
import Subjects from './pages/SubjectsPage'
import SubjectDetail from './components/subjects/SubjectDetail';
import CreateSubject from './components/subjects/CreateSubject';
import EditSubject from './components/subjects/EditSubject';
import DeleteSubject from './components/subjects/DeleteSubject';
import './assets/styles/toast.css';
import ToastProvider from './components/shared/ToastProvider';
import { AuthProvider } from './contexts/AuthProvider';

import './App.css';

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
  const dispatch = useDispatch();
  const currentUser = 'vinhsonvlog'; // hoặc lấy từ state/localStorage

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
  
  return (
    <AuthProvider>
      <AppContainer theme={theme}>
        <Router>
          <ToastProvider />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<AuthContainer />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/forgot-password" element={<AuthPage type="forgot-password" />} />
            <Route path="/reset-password" element={<AuthPage type="reset-password" />} />
            <Route path="/subjects" element={<Subjects/>} />
            <Route path="/subjects/:id" element={<SubjectDetail />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            <Route path="/api/Subject/:id/toggle-status" element={
              <ProtectedRoute role="admin">
                <ToggleSubjectStatus />
              </ProtectedRoute>
            } />
            <Route path="/subject/create" element={
              <ProtectedRoute roles={['Admin', 'Teacher']}>
                <CreateSubject />
              </ProtectedRoute>
            } />
            <Route path="/subject/edit" element={
              <ProtectedRoute roles={['Admin', 'Teacher']}>
                <EditSubject />
              </ProtectedRoute>
            } />
            <Route path="/subject/edit/:id" element={
              <ProtectedRoute roles={['Admin', 'Teacher']}>
                <EditSubject />
              </ProtectedRoute>
            } />
            <Route path="/subject/delete" element={
              <ProtectedRoute roles={['Admin']}>
                <DeleteSubject />
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
          </Routes>
        </Router>
      </AppContainer>
    </AuthProvider>
  );
}

export default App;