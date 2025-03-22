
import React, { useEffect, useState } from 'react';
import MarketDataTerminal from './MarketDataTerminal';
import { ChevronDown, Shield, Lock, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const scrollToNextSection = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
      <div 
        className={cn(
          "container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-all duration-1000",
          isVisible ? "opacity-100" : "opacity-0 translate-y-10"
        )}
      >
        <div className="order-2 lg:order-1">
          <div className="space-y-6">
            <div className="inline-block px-4 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue text-sm font-medium mb-2 animate-fade-in">
              Interactive Compliance Research Terminal
            </div>
            
            <h1 className="font-bold leading-tight animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Global <br />
              <span className="gradient-text animate-pulse-slow">Compliance Insights</span>
            </h1>
            
            <p className="text-cyber-light/80 text-lg md:text-xl max-w-lg animate-slide-up" style={{ animationDelay: '0.4s' }}>
              Comprehensive market research on international compliance software opportunities across Europe, US, Asia, and Africa.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <button
                className="cyber-button"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Request Full Research
              </button>
              
              <button
                className="px-6 py-3 text-cyber-light/80 hover:text-cyber-blue transition-colors"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Market Analysis
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-6 animate-slide-up" style={{ animationDelay: '0.8s' }}>
              <div className="flex items-center gap-2">
                <Shield className="text-cyber-blue h-5 w-5" />
                <span className="text-sm">$50B+ Global Market</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="text-cyber-blue h-5 w-5" />
                <span className="text-sm">10-24% CAGR</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="text-cyber-blue h-5 w-5" />
                <span className="text-sm">20+ Key Markets</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="order-1 lg:order-2 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="relative">
            <MarketDataTerminal
              className="w-full max-w-xl mx-auto lg:ml-auto shadow-lg"
              interactive={true}
            />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-cyber-light/60 bg-cyber-slate/80 px-3 py-1 rounded-full">
              Try typing "market", "growth", "regulations", "competitors", "roi" or "help"
            </div>
          </div>
        </div>
      </div>
      
      <button 
        onClick={scrollToNextSection}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
        aria-label="Scroll to next section"
      >
        <ChevronDown className="w-8 h-8 text-cyber-blue" />
      </button>
    </section>
  );
};

export default Hero;
