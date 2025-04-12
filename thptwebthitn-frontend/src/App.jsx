import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import SubjectList from './components/subjects/SubjectList';
import SubjectDetail from './components/subjects/SubjectDetail';
import ExamInterface from './components/quiz/ExamInterface';
import ExamResults from './components/quiz/ExamResults';
import RegisterForm from './components/Auth/RegisterForm';
import LoginForm from './components/Auth/LoginForm';
import ForgotPasswordForm from './components/Auth/ForgotPasswordForm';
import ResetPasswordForm from './components/Auth/ResetPasswordForm';
import ChangePasswordForm from './components/Auth/ChangePasswordForm';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

// Add fontawesome to the project
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';

// Add icons to library
library.add(fab, fas);

function App() {
  return (
    <Router>
      <Routes>
      <ToastContainer
          position="bottom-center"
          autoClose={3000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={theme === 'dark' ? 'dark' : 'light'}
          toastClassName="minimalist-toast"
        />
        <Route path="/" element={<AppLayout />}>
          {/* Public routes */}
          <Route index element={<HomePage />} />
          <Route path="/subjects" element={<SubjectList />} />
          <Route path="/subjects/:subjectId" element={<SubjectDetail />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/reset-password/:token" element={<ResetPasswordForm />} />
          
          {/* Protected routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/change-password" element={<ChangePasswordForm />} />
          <Route path="/exams/:examId" element={<ExamInterface />} />
          <Route path="/exam-results/:examId" element={<ExamResults />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          
          {/* Add other routes as needed */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
