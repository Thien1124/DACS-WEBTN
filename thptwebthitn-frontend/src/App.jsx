import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import SubjectList from './components/subjects/SubjectList';
import SubjectDetail from './components/subjects/SubjectDetail';
import ExamInterface from './components/quiz/ExamInterface';
import ExamResults from './components/quiz/ExamResults';
import RegisterForm from './components/auth/RegisterForm';
import LoginForm from './components/auth/LoginForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import ChangePasswordForm from './components/auth/ChangePasswordForm';
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
        <Route path="/" element={<AppLayout />}>
          {/* Public routes */}
          <Route index element={<HomePage />} />
          <Route path="subjects" element={<SubjectList />} />
          <Route path="subjects/:subjectId" element={<SubjectDetail />} />
          
          {/* Auth routes */}
          <Route path="login" element={<LoginForm />} />
          <Route path="register" element={<RegisterForm />} />
          <Route path="forgot-password" element={<ForgotPasswordForm />} />
          <Route path="reset-password/:token" element={<ResetPasswordForm />} />
          
          {/* Protected routes */}
          <Route path="profile" element={<ProfilePage />} />
          <Route path="change-password" element={<ChangePasswordForm />} />
          <Route path="exams/:examId" element={<ExamInterface />} />
          <Route path="exam-results/:examId" element={<ExamResults />} />
          
          {/* Add other routes as needed */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
