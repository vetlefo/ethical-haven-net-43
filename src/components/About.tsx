
import React, { useEffect, useRef } from 'react';
import { Shield, Lock, Terminal, Server, Database } from 'lucide-react';
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
      title: "Penetration Testing",
      description: "Authorized simulated attacks to identify security vulnerabilities before malicious actors can exploit them."
    },
    {
      icon: Lock,
      title: "Security Audits",
      description: "Comprehensive assessment of your security controls, policies, and infrastructure to ensure robust protection."
    },
    {
      icon: Terminal,
      title: "Vulnerability Assessment",
      description: "Systematic review of security weaknesses in your systems and applications with actionable remediation plans."
    },
    {
      icon: Server,
      title: "Network Security",
      description: "Protection against unauthorized access, misuse, and modification of your network resources and communications."
    },
    {
      icon: Database,
      title: "Data Protection",
      description: "Implementing strategies to safeguard sensitive information from breaches and unauthorized access."
    }
  ];

  return (
    <section 
      id="about" 
      ref={sectionRef}
      className="py-20 px-6 relative reveal-section"
    >
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-3">
          <div className="inline-block px-4 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue text-sm font-medium">
            About
          </div>
          <h2 className="font-bold">
            Expert <span className="gradient-text">Cybersecurity</span> Solutions
          </h2>
          <p className="text-cyber-light/70 max-w-2xl mx-auto text-lg">
            With over a decade of experience in ethical hacking and cybersecurity, 
            I provide specialized services tailored to protect your organization's 
            most valuable digital assets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
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
            <h3 className="text-2xl font-semibold mb-4">Why Choose My Services?</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="text-cyber-blue/90 mt-1">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-lg">Certified Professional</p>
                  <p className="text-cyber-light/70">Holding CISSP, CEH, and OSCP certifications with continuous education in emerging threats.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="text-cyber-blue/90 mt-1">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-lg">Tailored Solutions</p>
                  <p className="text-cyber-light/70">Security strategies customized to your specific industry requirements and threat landscape.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="text-cyber-blue/90 mt-1">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-lg">Comprehensive Approach</p>
                  <p className="text-cyber-light/70">End-to-end security assessment covering technology, processes, and human factors.</p>
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
              <div className="text-green-400">{">"} Security audit completed</div>
              <div className="text-cyber-light/80">Analyzing results...</div>
              <div className="mt-2 text-cyber-light/80">Found:</div>
              <div className="text-red-400">- 3 Critical vulnerabilities</div>
              <div className="text-yellow-400">- 7 Medium risks</div>
              <div className="text-blue-400">- 12 Low severity issues</div>
              <div className="mt-2 text-cyber-light/80">Recommendation:</div>
              <div className="text-green-400">{">"} Immediate remediation plan activated</div>
              <div className="typing-container mt-2 w-full">
                Securing your digital assets...
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
