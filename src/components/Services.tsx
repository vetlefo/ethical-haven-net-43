
import React, { useEffect, useRef } from 'react';
import { Shield, FileText, Globe, User, Database, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const Services: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            section.classList.add('revealed');
            observer.unobserve(section);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  const services = [
    {
      icon: Shield,
      title: "Whistleblowing & Incident Reporting",
      description: "Secure, anonymous reporting channels that comply with EU Whistleblower Directive, SOX, and Dodd-Frank requirements.",
      features: ["Anonymous Reporting", "Multi-channel Submission", "Case Management", "Anti-retaliation Controls"]
    },
    {
      icon: FileText,
      title: "ESG Reporting",
      description: "Comprehensive ESG data collection, analysis, and reporting across global and regional frameworks.",
      features: ["Framework Mapping (GRI, TCFD)", "Supply Chain ESG Monitoring", "Automated Data Collection", "Stakeholder Reports"]
    },
    {
      icon: Database,
      title: "Regulatory Compliance",
      description: "Stay on top of evolving regulations across multiple jurisdictions with automated updates and controls.",
      features: ["GDPR Compliance Tools", "CCPA/CPRA Controls", "Regulatory Updates", "Compliance Dashboards"]
    },
    {
      icon: User,
      title: "HR Compliance",
      description: "Manage global workforce compliance with employment laws and regulations across jurisdictions.",
      features: ["Global Labor Law Updates", "HR Policy Management", "Training Tracking", "Documentation Controls"]
    },
    {
      icon: Globe,
      title: "Regional Compliance",
      description: "Specialized modules for region-specific regulations and reporting requirements.",
      features: ["EU Compliance", "US Regulations", "APAC Requirements", "African ESG Standards"]
    },
    {
      icon: Lock,
      title: "Data Protection & Privacy",
      description: "Comprehensive tools for managing data protection compliance across global privacy regulations.",
      features: ["Rights Management", "Consent Controls", "Data Mapping", "Breach Response"]
    }
  ];

  return (
    <section 
      id="services" 
      ref={sectionRef}
      className="py-20 px-6 bg-cyber-dark/50 relative"
    >
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-3">
          <div className="inline-block px-4 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue text-sm font-medium">
            Solutions
          </div>
          <h2 className="font-bold">
            Comprehensive <span className="gradient-text">Compliance</span> Solutions
          </h2>
          <p className="text-cyber-light/70 max-w-2xl mx-auto text-lg">
            ReportCase.com provides tailored solutions to address complex compliance 
            requirements across industries and regions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="glass-card overflow-hidden transition-all duration-300 group hover:border-cyber-blue/40"
            >
              <div className="p-6 pb-8">
                <div className="mb-4 p-3 rounded-full bg-cyber-blue/10 inline-block">
                  <service.icon className="w-6 h-6 text-cyber-blue" />
                </div>
                <h3 className="text-xl font-medium mb-3 group-hover:text-cyber-blue transition-colors">
                  {service.title}
                </h3>
                <p className="text-cyber-light/70 mb-6">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2 text-sm text-cyber-light/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-r from-cyber-blue/20 to-cyber-blue/10 px-6 py-4 flex justify-between items-center">
                <span className="text-cyber-light font-medium">Learn More</span>
                <span className="text-cyber-blue transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-cyber-light/70 mb-6 max-w-2xl mx-auto">
            Need a custom compliance solution for your specific requirements?
          </p>
          <button 
            className="cyber-button"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Request Custom Solution
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;
