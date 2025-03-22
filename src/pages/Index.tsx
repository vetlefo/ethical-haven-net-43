
import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import ThreeDBackground from '@/components/ThreeDBackground';

const Index = () => {
  useEffect(() => {
    const handleReveal = () => {
      const sections = document.querySelectorAll('.reveal-section');
      
      sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (sectionTop < windowHeight * 0.75) {
          section.classList.add('revealed');
        }
      });
    };
    
    window.addEventListener('scroll', handleReveal);
    handleReveal(); // Initial check
    
    return () => window.removeEventListener('scroll', handleReveal);
  }, []);
  
  return (
    <div className="relative">
      <ParticleBackground />
      <ThreeDBackground />
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
