
import React, { useEffect, useRef, useState } from 'react';
import { Globe, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const RegionalCompliance: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeRegion, setActiveRegion] = useState('europe');

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

  const regions = [
    {
      id: 'europe',
      name: 'Europe',
      description: 'Comprehensive compliance with EU regulations, including GDPR and the EU Whistleblower Directive.',
      regulations: [
        { name: 'EU Whistleblower Directive', description: 'Full implementation support for organizations of all sizes' },
        { name: 'GDPR Compliance', description: 'Complete data protection compliance with rights management' },
        { name: 'Corporate Sustainability Reporting Directive', description: 'ESG reporting aligned with CSRD requirements' },
        { name: 'NIS2 Directive', description: 'Cybersecurity risk management and reporting' },
      ],
      upcomingChanges: [
        { name: 'EU AI Act', date: 'Q3 2024', description: 'New requirements for AI systems and risk management' },
        { name: 'Corporate Sustainability Due Diligence Directive', date: 'Q1 2025', description: 'Enhanced supply chain due diligence' },
      ]
    },
    {
      id: 'north-america',
      name: 'North America',
      description: 'Tailored support for US and Canadian regulatory requirements, including SOX, Dodd-Frank, and CCPA/CPRA.',
      regulations: [
        { name: 'SOX Compliance', description: 'Financial reporting and audit controls for public companies' },
        { name: 'Dodd-Frank Whistleblower Provisions', description: 'Support for SEC whistleblower requirements' },
        { name: 'CCPA/CPRA', description: 'California privacy law compliance with consumer rights management' },
        { name: 'State-level Privacy Laws', description: 'Coverage for various state privacy regulations (VCDPA, CPA, etc.)' },
      ],
      upcomingChanges: [
        { name: 'Federal Privacy Legislation', date: 'Pending', description: 'Monitoring developments in federal privacy law' },
        { name: 'SEC Climate Disclosure Rules', date: 'Q4 2024', description: 'Enhanced climate risk disclosure requirements' },
      ]
    },
    {
      id: 'asia-pacific',
      name: 'Asia-Pacific',
      description: 'Specialized support for APAC regulations across Singapore, Indonesia, Vietnam, Thailand, and the Philippines.',
      regulations: [
        { name: 'Singapore PDPA', description: 'Personal data protection compliance for Singaporean operations' },
        { name: 'Indonesia OJK Sustainability Reports', description: 'ESG reporting for Indonesian financial institutions' },
        { name: 'Vietnam Circular No. 155', description: 'Environmental disclosure requirements for Vietnamese entities' },
        { name: 'Thailand SEC Corporate Governance Code', description: 'Corporate governance and ESG reporting in Thailand' },
      ],
      upcomingChanges: [
        { name: 'Singapore Mandatory Climate Reporting', date: 'Q2 2025', description: 'ISSB-aligned climate disclosures' },
        { name: 'Philippines SEC GRI Requirements', date: 'Ongoing', description: 'Expanded sustainability reporting obligations' },
      ]
    },
    {
      id: 'africa',
      name: 'Africa',
      description: 'Customized solutions for African financial institutions and organizations with regional compliance needs.',
      regulations: [
        { name: 'South Africa JSE Sustainability Reporting Directive', description: 'ESG reporting for JSE-listed companies' },
        { name: 'Nigeria Sustainable Banking Principles', description: 'Sustainability requirements for Nigerian banks' },
        { name: 'Rwanda Climate Risk Management', description: 'Climate risk assessment and reporting requirements' },
        { name: 'Kenya Central Bank Climate Framework', description: 'Financed emissions reporting for Kenyan institutions' },
      ],
      upcomingChanges: [
        { name: 'Pan-African ESG Standards', date: 'In development', description: 'Harmonized regional ESG reporting standards' },
        { name: 'Kenya Mandatory Climate Reporting', date: 'January 2027', description: 'Mandatory reporting for financial sector' },
      ]
    }
  ];

  const activeRegionData = regions.find(r => r.id === activeRegion) || regions[0];

  return (
    <section 
      id="regional" 
      ref={sectionRef}
      className="py-20 px-6 bg-cyber-dark/50 relative"
    >
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-3">
          <div className="inline-block px-4 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue text-sm font-medium">
            Global Coverage
          </div>
          <h2 className="font-bold">
            Regional <span className="gradient-text">Compliance</span> Expertise
          </h2>
          <p className="text-cyber-light/70 max-w-2xl mx-auto text-lg">
            Our platform provides tailored solutions for regional compliance requirements across the globe,
            with specialized features for each jurisdiction.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {regions.map((region) => (
            <button
              key={region.id}
              onClick={() => setActiveRegion(region.id)}
              className={cn(
                "px-5 py-3 rounded-full transition-all flex items-center gap-2",
                activeRegion === region.id
                  ? "bg-cyber-blue text-cyber-dark font-medium"
                  : "bg-cyber-dark/50 text-cyber-light/70 hover:bg-cyber-dark/70"
              )}
            >
              <Globe className="h-4 w-4" />
              {region.name}
            </button>
          ))}
        </div>

        <div className="glass-card p-8">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold mb-2">{activeRegionData.name}</h3>
            <p className="text-cyber-light/70">{activeRegionData.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h4 className="text-xl font-medium mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-cyber-blue" />
                Key Regulations Supported
              </h4>
              
              <div className="space-y-4">
                {activeRegionData.regulations.map((regulation, index) => (
                  <div key={index} className="p-4 bg-cyber-dark/30 rounded-lg border border-cyber-light/10">
                    <h5 className="font-medium text-cyber-blue mb-1">{regulation.name}</h5>
                    <p className="text-sm text-cyber-light/70">{regulation.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-xl font-medium mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-cyber-blue" />
                Upcoming Regulatory Changes
              </h4>
              
              <div className="space-y-4">
                {activeRegionData.upcomingChanges.map((change, index) => (
                  <div key={index} className="p-4 bg-cyber-dark/30 rounded-lg border border-cyber-light/10">
                    <div className="flex justify-between items-center mb-1">
                      <h5 className="font-medium text-cyber-blue">{change.name}</h5>
                      <span className="text-xs px-2 py-1 bg-cyber-blue/20 text-cyber-blue rounded-full">
                        {change.date}
                      </span>
                    </div>
                    <p className="text-sm text-cyber-light/70">{change.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-amber-950/20 border border-amber-600/30 rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-cyber-light/80">
                  Our compliance experts continuously monitor regulatory changes in {activeRegionData.name} to ensure 
                  the platform remains up-to-date with the latest requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegionalCompliance;
