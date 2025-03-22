
import React, { useEffect, useRef } from 'react';
import { Shield, Search, Lock, AlertTriangle, FileWarning, Wifi } from 'lucide-react';
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
      title: "Web Application Security",
      description: "Comprehensive assessments to identify and remediate vulnerabilities in your web applications and APIs.",
      features: ["OWASP Top 10 Protection", "API Security Testing", "Secure Code Review"]
    },
    {
      icon: Wifi,
      title: "Network Security Testing",
      description: "Thorough evaluation of network infrastructure to identify and address security weaknesses.",
      features: ["Firewall Configuration Audit", "VPN Security", "Network Segmentation Review"]
    },
    {
      icon: Search,
      title: "Penetration Testing",
      description: "Authorized simulated attacks to identify exploitable vulnerabilities in your systems.",
      features: ["External Penetration Tests", "Internal Network Testing", "Wireless Security Assessment"]
    },
    {
      icon: AlertTriangle,
      title: "Red Team Operations",
      description: "Advanced adversary simulation to test your defenses against sophisticated attack scenarios.",
      features: ["Social Engineering Tests", "Physical Security Testing", "Advanced Persistence Testing"]
    },
    {
      icon: FileWarning,
      title: "Security Documentation",
      description: "Creation and review of security policies, procedures and compliance documentation.",
      features: ["Policy Development", "Compliance Gap Analysis", "Security Training Materials"]
    },
    {
      icon: Lock,
      title: "Incident Response",
      description: "Expert assistance in responding to and recovering from security incidents and breaches.",
      features: ["Breach Investigation", "Evidence Collection", "Recovery Planning"]
    }
  ];

  return (
    <section 
      id="services" 
      ref={sectionRef}
      className="py-20 px-6 bg-cyber-dark/50 relative reveal-section"
    >
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-3">
          <div className="inline-block px-4 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue text-sm font-medium">
            Services
          </div>
          <h2 className="font-bold">
            Comprehensive <span className="gradient-text">Security</span> Solutions
          </h2>
          <p className="text-cyber-light/70 max-w-2xl mx-auto text-lg">
            I provide a full range of cybersecurity services designed to protect your
            organization from evolving digital threats and ensure your systems remain secure.
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
            Need a custom security solution for your specific requirements?
          </p>
          <button 
            className="cyber-button"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Request Custom Service
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;
