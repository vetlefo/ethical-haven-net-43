
import React, { useEffect, useRef } from 'react';
import { Shield, Globe, FileText, User, Database, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const About: React.FC = () => {
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

  const expertise = [
    {
      icon: Shield,
      title: "Whistleblower Protection",
      description: "Secure channels for confidential and anonymous reporting, compliant with EU Whistleblower Directive and US regulations."
    },
    {
      icon: FileText,
      title: "ESG Reporting",
      description: "Comprehensive tools for environmental, social, and governance reporting across global frameworks and regional standards."
    },
    {
      icon: Globe,
      title: "Multi-Jurisdictional Compliance",
      description: "Stay compliant with regulations across Europe, US, Asia, and Africa with region-specific controls and guidance."
    },
    {
      icon: User,
      title: "HR Compliance",
      description: "Manage global workforce compliance with employment laws, including data protection and labor regulations."
    },
    {
      icon: Database,
      title: "Data Protection",
      description: "GDPR, CCPA/CPRA, and international data privacy compliance with robust security controls and user rights management."
    }
  ];

  return (
    <section 
      id="about" 
      ref={sectionRef}
      className="py-20 px-6 relative"
    >
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-3">
          <div className="inline-block px-4 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue text-sm font-medium">
            About ReportCase.com
          </div>
          <h2 className="font-bold">
            International <span className="gradient-text">Compliance</span> Platform
          </h2>
          <p className="text-cyber-light/70 max-w-2xl mx-auto text-lg">
            ReportCase.com provides a comprehensive solution for organizations to manage compliance 
            across multiple jurisdictions, from whistleblowing to ESG reporting and data protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-12">
          {expertise.map((item, index) => (
            <div 
              key={index}
              className="glass-card p-6 transition-all duration-300 hover:border-cyber-blue/40 hover:-translate-y-1"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="mb-4 p-3 rounded-full bg-cyber-blue/10 inline-block">
                <item.icon className="w-6 h-6 text-cyber-blue" />
              </div>
              <h3 className="text-xl font-medium mb-3">{item.title}</h3>
              <p className="text-cyber-light/70">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 glass-card p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h3 className="text-2xl font-semibold mb-4">Why Choose ReportCase.com?</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="text-cyber-blue/90 mt-1">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-lg">Regulatory Expertise</p>
                  <p className="text-cyber-light/70">Built by compliance experts with deep understanding of global regulatory requirements and frameworks.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="text-cyber-blue/90 mt-1">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-lg">Security & Privacy by Design</p>
                  <p className="text-cyber-light/70">End-to-end encryption and robust data protection measures ensure sensitive information remains secure.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="text-cyber-blue/90 mt-1">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-lg">Global Reach, Local Expertise</p>
                  <p className="text-cyber-light/70">Localized to support regional regulations while providing a unified global compliance view.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="bg-cyber-dark p-6 rounded-lg border border-cyber-blue/20">
            <div className="mb-4 flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
            </div>
            <div className="font-mono text-sm sm:text-base overflow-hidden">
              <div className="text-green-400">{">"} Compliance scan initiated</div>
              <div className="text-cyber-light/80">Analyzing regulatory frameworks...</div>
              <div className="mt-2 text-cyber-light/80">Detected:</div>
              <div className="text-blue-400">- EU Whistleblower Directive</div>
              <div className="text-yellow-400">- GDPR requirements</div>
              <div className="text-purple-400">- ESG reporting standards</div>
              <div className="mt-2 text-cyber-light/80">Action:</div>
              <div className="text-green-400">{">"} Configuring compliance controls</div>
              <div className="typing-container mt-2 w-full">
                Ensuring complete regulatory coverage...
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
