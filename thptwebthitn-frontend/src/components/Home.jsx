import React from 'react';
import FeaturesSection from './home/FeaturesSection';
import Header from './layout/Header';
import Footer from './layout/Footer';
import GradeSection from './home/GradeSection';
import HeroSection from './home/HeroSection';

const Home = () => {
  return (
    <div>
      <Header />
      <HeroSection />
      <GradeSection />
      <FeaturesSection />
    </div>
  );
};

export default Home;
