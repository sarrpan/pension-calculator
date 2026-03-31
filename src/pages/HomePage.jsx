import React from 'react';
import Hero from '../components/home/Hero/Hero';
import Features from '../components/home/Features/Features';
import Trust from '../components/home/Trust/Trust';
import CTA from '../components/home/CTA/CTA';

const HomePage = () => {
  return (
    <main>
      <Hero />
      <Features />
      <Trust />
      <CTA />
    </main>
  );
};

export default HomePage;