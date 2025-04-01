import React from 'react';
import { useOutletContext, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import StudentProfile from '../components/profile/StudentProfile';

const ProfilePageContainer = styled.div`
  padding: 4rem 1.5rem;
  min-height: 100vh;
`;

const PageTitle = styled.h1`
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
  background: linear-gradient(45deg, #007bff, #00d6ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ProfilePage = () => {
  const { theme } = useOutletContext();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <ProfilePageContainer>
      <PageTitle>Hồ Sơ Cá Nhân</PageTitle>
      <StudentProfile theme={theme} />
    </ProfilePageContainer>
  );
};

export default ProfilePage;
