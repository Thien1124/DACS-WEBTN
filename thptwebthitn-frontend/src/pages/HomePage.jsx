import React from 'react';
import FeaturesSection from './home/FeaturesSection';
import Header from './layout/Header';
import Footer from './layout/Footer';
import GradeSection from './home/GradeSection';
import HeroSection from './home/HeroSection';

const HomeContainer = styled.div`
  min-height: 100vh;
`;

const HomePage = () => {
  const { theme } = useOutletContext();

  return (
    <div>
      <Header />
      <HeroSection />
      <GradeSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default HomePage;
