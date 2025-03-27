import React from 'react';
import FeaturesSection from './FeaturesSection';
import Header from './Header';
import Footer from './Footer';
import GradeSection from './GradeSection';
import HeroSection from './HeroSection';

const Home = () => {
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

export default Home;