
import React, { useState, useEffect } from 'react';
import { Menu, X, FileText, ChevronRight, BarChart3, BookOpen, Presentation, Target, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMobileMenuOpen(false);
      document.body.style.overflow = 'auto';
    }
  };

  const navLinks = [
    { name: 'Executive Summary', id: 'about', icon: BookOpen },
    { name: 'Market Analysis', id: 'services', icon: BarChart3 },
    { name: 'Key Findings', id: 'features', icon: Search },
    { name: 'Regional Insights', id: 'regional', icon: Target },
    { name: 'Action Plan', id: 'contact', icon: Presentation },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6 md:px-12',
        isScrolled 
          ? 'bg-cyber-slate/90 backdrop-blur-md shadow-md' 
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-cyber-blue animate-pulse-slow" />
            <span className="text-xl font-semibold">
              Report<span className="text-cyber-blue">Case</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-cyber-light/80 hover:text-cyber-blue transition-colors relative group flex items-center space-x-1.5"
              >
                <link.icon className="h-4 w-4 text-cyber-blue" />
                <span>{link.name}</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyber-blue transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
            <button 
              className="cyber-button flex items-center"
              onClick={() => scrollToSection('contact')}
            >
              Request Proposal
              <ChevronRight className="ml-1 h-4 w-4 inline" />
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            className="md:hidden text-cyber-light hover:text-cyber-blue"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-0 bg-cyber-dark/95 z-50 pt-24 px-6 flex flex-col transition-transform duration-300 ease-in-out md:hidden backdrop-blur-lg',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col space-y-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="text-xl text-cyber-light hover:text-cyber-blue transition-colors flex items-center space-x-3"
            >
              <link.icon className="h-5 w-5 text-cyber-blue" />
              <span>{link.name}</span>
            </button>
          ))}
          <button
            className="cyber-button w-full mt-8 text-center flex items-center justify-center"
            onClick={() => scrollToSection('contact')}
          >
            <span>Request Proposal</span>
            <ChevronRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
