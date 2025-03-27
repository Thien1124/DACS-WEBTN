import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { setAnimation } from './redux/uiSlice'; 
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import GradeSection from './components/GradeSection'; 
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: ${props => props.theme === 'dark' ? '#121212' : '#f7f7f7'};
  color: ${props => props.theme === 'dark' ? '#ffffff' : '#333333'};
  transition: background-color 0.3s ease, color 0.3s ease;
`;

function App() {
  const { theme, currentAnimation } = useSelector(state => state.ui);
  const dispatch = useDispatch();

  useEffect(() => {
    // Auto-play animations in sequence
    const animationSequence = ['fadeIn', 'slideUp', 'pulse', 'idle'];
    let currentIndex = 0;
    
    const animationInterval = setInterval(() => {
      dispatch(setAnimation(animationSequence[currentIndex]));
      currentIndex = (currentIndex + 1) % animationSequence.length;
    }, 3000);
    
    return () => clearInterval(animationInterval);
  }, [dispatch]);

  return (
    <AppContainer theme={theme}>
      <Header />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <HeroSection animation={currentAnimation} />
        <GradeSection /> {/* Add this component here */}
        <FeaturesSection animation={currentAnimation} />
      </motion.main>
      <Footer />
    </AppContainer>
  );
}

export default App;