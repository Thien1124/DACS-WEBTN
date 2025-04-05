import React from 'react';
import { useOutletContext } from 'react-router-dom';
import styled from 'styled-components';
import HeroSection from '../components/home/HeroSection';
import FeaturedSubjects from '../components/home/FeaturedSubjects';

const HomeContainer = styled.div`
  min-height: 100vh;
`;

const HomePage = () => {
  const { theme } = useOutletContext();

  return (
    <HomeContainer>
      <Header />
      <HeroSection theme={theme} />
      <FeaturedSubjects theme={theme} />
      {/* You can add more sections as needed */}
    </HomeContainer>
  );
};

export default HomePage;
