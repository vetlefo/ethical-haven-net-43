
import React, { useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Globe, Database, BarChart3, Layers, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const Features: React.FC = () => {
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

  const features = [
    {
      id: "security",
      icon: Lock,
      title: "Security & Privacy",
      description: "Enterprise-grade security with end-to-end encryption, access controls, and comprehensive audit trails.",
      details: [
        "End-to-end encryption for sensitive data",
        "Role-based access controls",
        "Comprehensive audit logging",
        "Data anonymization capabilities",
        "Secure data residency options",
        "Intrusion detection systems"
      ],
      image: "https://placehold.co/600x400/0ea5e9/FFFFFF/png?text=Security+Features"
    },
    {
      id: "integration",
      icon: Layers,
      title: "Seamless Integration",
      description: "Connect with existing business systems like HRIS, ERP, and CRM to streamline compliance processes.",
      details: [
        "API-first architecture",
        "Pre-built connectors for major systems",
        "Customizable data mapping",
        "Automated data synchronization",
        "Real-time updates across systems",
        "No-code integration options"
      ],
      image: "https://placehold.co/600x400/0ea5e9/FFFFFF/png?text=Integration+Features"
    },
    {
      id: "customization",
      icon: Globe,
      title: "Global Customization",
      description: "Tailor the platform to your specific regional requirements with flexible configuration options.",
      details: [
        "Multi-language support",
        "Region-specific compliance modules",
        "Customizable workflows and forms",
        "Branding and white-labeling options",
        "Configurable dashboards and reports",
        "Flexible deployment options"
      ],
      image: "https://placehold.co/600x400/0ea5e9/FFFFFF/png?text=Customization+Features"
    },
    {
      id: "analytics",
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Gain insights from compliance data with powerful analytics and reporting capabilities.",
      details: [
        "Real-time compliance dashboards",
        "Predictive risk analytics",
        "Trend analysis and benchmarking",
        "Custom report generation",
        "Data visualization tools",
        "Executive summary reporting"
      ],
      image: "https://placehold.co/600x400/0ea5e9/FFFFFF/png?text=Analytics+Features"
    },
    {
      id: "data",
      icon: Database,
      title: "Data Management",
      description: "Comprehensive tools for managing compliance data across your organization.",
      details: [
        "Centralized data repository",
        "Data quality controls",
        "Automated data collection",
        "Retention policy management",
        "Data minimization tools",
        "Data subject request management"
      ],
      image: "https://placehold.co/600x400/0ea5e9/FFFFFF/png?text=Data+Management"
    },
    {
      id: "performance",
      icon: Zap,
      title: "High Performance",
      description: "Fast, reliable platform designed to handle enterprise-scale compliance requirements.",
      details: [
        "Scalable cloud architecture",
        "High availability design",
        "Performance optimization",
        "Global content delivery",
        "Real-time processing",
        "Automated scaling"
      ],
      image: "https://placehold.co/600x400/0ea5e9/FFFFFF/png?text=Performance+Features"
    }
  ];

  return (
    <section 
      id="features" 
      ref={sectionRef}
      className="py-20 px-6 relative"
    >
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-3">
          <div className="inline-block px-4 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue text-sm font-medium">
            Platform
          </div>
          <h2 className="font-bold">
            Key <span className="gradient-text">Features</span> & Capabilities
          </h2>
          <p className="text-cyber-light/70 max-w-2xl mx-auto text-lg">
            ReportCase.com delivers enterprise-grade compliance capabilities with security,
            flexibility, and performance at its core.
          </p>
        </div>

        <Tabs defaultValue="security" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 bg-cyber-dark/30 p-1 rounded-lg mb-8">
            {features.map((feature) => (
              <TabsTrigger 
                key={feature.id} 
                value={feature.id}
                className="data-[state=active]:bg-cyber-blue/20 data-[state=active]:text-cyber-blue"
              >
                <feature.icon className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">{feature.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {features.map((feature) => (
            <TabsContent key={feature.id} value={feature.id} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="glass-card p-8">
                  <h3 className="text-2xl font-semibold mb-4 flex items-center">
                    <feature.icon className="h-6 w-6 mr-2 text-cyber-blue" />
                    {feature.title}
                  </h3>
                  <p className="text-cyber-light/70 mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.details.map((detail, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-cyber-blue rounded-full mr-3"></span>
                        <span className="text-cyber-light/80">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-auto" 
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default Features;
