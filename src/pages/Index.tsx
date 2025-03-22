
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import Features from '@/components/Features';
import RegionalCompliance from '@/components/RegionalCompliance';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';

const Index = () => {
  const [isVisible, setIsVisible] = useState({
    about: false,
    services: false,
    features: false,
    regional: false,
    contact: false,
  });

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['about', 'services', 'features', 'regional', 'contact'];
      
      sections.forEach(section => {
        const element = document.getElementById(section);
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.top < windowHeight * 0.75) {
          setIsVisible(prev => ({ ...prev, [section]: true }));
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div className="relative">
      <ParticleBackground />
      <Navbar />
      <Hero />
      <div id="about" className={`reveal-section ${isVisible.about ? 'revealed' : ''}`}>
        <About />
      </div>
      <div id="services" className={`reveal-section ${isVisible.services ? 'revealed' : ''}`}>
        <Services />
      </div>
      <div id="features" className={`reveal-section ${isVisible.features ? 'revealed' : ''}`}>
        <Features />
      </div>
      <div id="regional" className={`reveal-section ${isVisible.regional ? 'revealed' : ''}`}>
        <RegionalCompliance />
      </div>
      <div id="contact" className={`reveal-section ${isVisible.contact ? 'revealed' : ''}`}>
        <Contact />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
