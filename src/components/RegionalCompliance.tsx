
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
      description: 'Europe is a high-growth, high-regulation market for compliance software, driven by the EU Whistleblower Directive, GDPR, NIS2, and the upcoming EU AI Act. Germany is a key market, with the LkSG adding further complexity.',
      regulations: [
        { name: 'EU Whistleblower Directive', description: 'Mandatory internal reporting channels for organizations with 50+ employees' },
        { name: 'General Data Protection Regulation (GDPR)', description: 'Comprehensive data protection and privacy framework' },
        { name: 'NIS2 Directive', description: 'Strengthened cybersecurity requirements across sectors' },
        { name: 'German Supply Chain Due Diligence Act (LkSG)', description: 'Human rights and environmental due diligence in supply chains' },
        { name: 'EU AI Act (Upcoming)', description: 'Risk-based approach to AI regulation' }
      ],
      marketData: [
        { name: 'Market Size (Germany)', data: '$8.14B by 2030' },
        { name: 'Growth Rate (Germany)', data: '12.4% CAGR (2025-2030)' },
        { name: 'European GRC Market', data: 'Projected $27.08B by 2033' },
        { name: 'Competitive Intensity', data: 'Medium' },
        { name: 'Key Competitors', data: 'SAP GRC, NAVEX Global, MetricStream' }
      ]
    },
    {
      id: 'united-kingdom',
      name: 'United Kingdom',
      description: 'Despite Brexit, the UK maintains a stringent regulatory environment, with a strong focus on ESG reporting and corporate governance.',
      regulations: [
        { name: 'UK GDPR', description: 'UK version of the GDPR post-Brexit' },
        { name: 'Public Interest Disclosure Act 1998', description: 'Whistleblower protection legislation' },
        { name: 'Task Force on Climate-related Financial Disclosures (TCFD)', description: 'Climate risk disclosure requirements' },
        { name: 'UK Sustainability Disclosure Standards (Upcoming)', description: 'Standardized ESG reporting framework' },
        { name: 'Modern Slavery Act', description: 'Supply chain transparency requirements' }
      ],
      marketData: [
        { name: 'Market Size', data: '$10.91B by 2030' },
        { name: 'Growth Rate', data: '11.6% CAGR (2025-2030)' },
        { name: 'Competitive Intensity', data: 'High' },
        { name: 'Key Competitors', data: 'Fidelity National Information Services, Genpact, IBM, Microsoft, Oracle' },
        { name: 'Partnership Potential', data: 'High with EY' }
      ]
    },
    {
      id: 'united-states',
      name: 'United States',
      description: 'The US is the largest compliance software market, with a complex regulatory framework at both the federal and state levels.',
      regulations: [
        { name: 'California Consumer Privacy Act (CCPA)/California Privacy Rights Act (CPRA)', description: 'Comprehensive privacy legislation in California' },
        { name: 'Sarbanes-Oxley Act (SOX)', description: 'Corporate governance and financial disclosure requirements' },
        { name: 'Dodd-Frank Act', description: 'Financial regulation with whistleblower provisions' },
        { name: 'State-level labor laws', description: 'Various state-specific employment regulations' },
        { name: 'SEC climate disclosure rules (Emerging)', description: 'Enhanced climate risk disclosure requirements' }
      ],
      marketData: [
        { name: 'Market Size', data: '$33.1B (2024)' },
        { name: 'Growth Rate', data: '10.9% CAGR (2024-2031)' },
        { name: 'Competitive Intensity', data: 'High' },
        { name: 'Key Competitors', data: 'NAVEX, OneTrust, Workiva, IBM, Microsoft' },
        { name: 'Partnership Potential', data: 'High with EY' }
      ]
    },
    {
      id: 'asia-pacific',
      name: 'Asia-Pacific',
      description: 'The Asia-Pacific region exhibits high growth potential, particularly in the RegTech sector, driven by evolving data privacy laws and increasing ESG awareness.',
      regulations: [
        { name: 'Singapore: Personal Data Protection Act (PDPA)', description: 'Comprehensive data protection framework' },
        { name: 'Indonesia: Personal Data Protection Law (PDP Law)', description: 'New data privacy legislation' },
        { name: 'Vietnam: Personal Data Protection Decree (PDPD)', description: 'Data protection requirements' },
        { name: 'Philippines: Data Privacy Act of 2012', description: 'Data privacy and protection framework' },
        { name: 'Thailand: Personal Data Protection Act (PDPA)', description: 'GDPR-inspired data protection law' }
      ],
      marketData: [
        { name: 'Singapore RegTech CAGR', data: '16.7% (2024-2029)' },
        { name: 'Indonesia RegTech CAGR', data: '24.6% (2024-2029)' },
        { name: 'Vietnam RegTech CAGR', data: '22.0% (2024-2029)' },
        { name: 'Philippines RegTech CAGR', data: '19.7% (2024-2029)' },
        { name: 'Thailand RegTech CAGR', data: '16.4% (2024-2029)' }
      ]
    },
    {
      id: 'africa',
      name: 'Africa',
      description: 'African financial institutions face increasing pressure to adopt ESG reporting, driven by international investors and emerging local regulations.',
      regulations: [
        { name: 'South Africa: Johannesburg Stock Exchange Sustainability Reporting Directive', description: 'ESG reporting for listed companies' },
        { name: 'Kenya: Central Bank guidance on climate risk', description: 'Financed emissions reporting' },
        { name: 'Nigeria: Sustainable Banking Principles', description: 'Sustainability requirements for banks' },
        { name: 'Rwanda: Mandatory climate risk management guidelines', description: 'Climate risk assessment and reporting' }
      ],
      marketData: [
        { name: 'MEA GRC Market Size', data: '$10.93B by 2030' },
        { name: 'Growth Rate', data: '14.6% CAGR (2025-2030)' },
        { name: 'Competitive Intensity', data: 'Medium' },
        { name: 'Key Competitors', data: 'Varies by country; mix of global and regional players' },
        { name: 'Partnership Opportunities', data: 'EY and potentially African Development Bank' }
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
            Regional Insights
          </div>
          <h2 className="font-bold">
            Regional <span className="gradient-text">Market</span> Analysis
          </h2>
          <p className="text-cyber-light/70 max-w-2xl mx-auto text-lg">
            Our research provides deep insights into regional compliance markets,
            regulations, and growth opportunities across the globe.
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
                Key Regulations
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
                Market Data
              </h4>
              
              <div className="space-y-4">
                {activeRegionData.marketData.map((data, index) => (
                  <div key={index} className="p-4 bg-cyber-dark/30 rounded-lg border border-cyber-light/10">
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium text-cyber-blue">{data.name}</h5>
                      <span className="text-sm px-2 py-1 bg-cyber-blue/20 text-cyber-blue rounded-full">
                        {data.data}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-amber-950/20 border border-amber-600/30 rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-cyber-light/80">
                  Our research shows significant growth opportunities in {activeRegionData.name}, 
                  with evolving regulatory frameworks driving demand for comprehensive compliance solutions.
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
