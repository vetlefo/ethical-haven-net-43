
import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cyber-slate px-6 text-center">
      <ParticleBackground />
      
      <div className="glass-card p-10 max-w-md animate-fade-in z-10">
        <div className="flex justify-center mb-6">
          <Shield className="h-16 w-16 text-cyber-blue animate-pulse-slow" />
        </div>
        
        <h1 className="text-4xl font-bold mb-6">404</h1>
        <div className="bg-cyber-dark/50 border border-cyber-blue/20 px-4 py-2 rounded-md mb-6 font-mono">
          <p className="text-cyber-blue">Error: <span className="text-cyber-light/80">Page not found</span></p>
        </div>
        
        <p className="text-cyber-light/80 mb-8">
          The resource you are looking for might have been removed, had its name 
          changed, or is temporarily unavailable.
        </p>
        
        <Link 
          to="/" 
          className="cyber-button flex items-center justify-center mx-auto"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
