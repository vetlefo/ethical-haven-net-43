
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, Globe, User, Database, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFeaturedReports } from '@/services/reportService';

const Services: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [featuredReportSlug, setFeaturedReportSlug] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchFeaturedReport = async () => {
      try {
        const reports = await getFeaturedReports();
        if (reports.length > 0) {
          setFeaturedReportSlug(reports[0].slug);
        }
      } catch (error) {
        console.error("Error fetching featured report:", error);
      }
    };

    fetchFeaturedReport();
  }, []);

  const marketAnalysis = [
    {
      icon: Shield,
      title: "Germany Market Analysis",
      description: "The German compliance software market is driven by stringent data privacy (GDPR), IT security (NIS2), and supply chain due diligence (LkSG) regulations.",
      features: [
        "Market Size: $8.14 billion (2030 projection)",
        "CAGR: 12.4% (2025-2030)",
        "Key Regulations: GDPR, NIS2, LkSG, IT Security Act 2.0",
        "Competitive Intensity: Medium",
        "Key Pain Point: Regulatory complexity"
      ],
      slug: "germany-market-analysis"
    },
    {
      icon: FileText,
      title: "United Kingdom Market Analysis",
      description: "The UK maintains a strong focus on corporate governance and ESG reporting, with regulations like UK GDPR and upcoming sustainability disclosure standards.",
      features: [
        "Market Size: $10.91 billion (2030 projection)",
        "CAGR: 11.6% (2025-2030)",
        "Key Regulations: UK GDPR, TCFD, Modern Slavery Act",
        "Competitive Intensity: High",
        "Key Pain Point: Evolving ESG frameworks"
      ]
    },
    {
      icon: Database,
      title: "United States Market Analysis",
      description: "The US represents the largest single market for compliance software, driven by a complex landscape of federal and state regulations.",
      features: [
        "Market Size: $33.1 billion (2024)",
        "CAGR: 10.9% (2024-2031)",
        "Key Regulations: CCPA/CPRA, SOX, Dodd-Frank",
        "Competitive Intensity: High",
        "Key Pain Point: Managing multi-jurisdiction compliance"
      ]
    },
    {
      icon: User,
      title: "Singapore Market Analysis",
      description: "Singapore is a high-growth RegTech market, underpinned by its status as a financial hub, with the PDPA and increasing ESG regulation.",
      features: [
        "RegTech Market Size: $386.48 Million (2029)",
        "CAGR: 16.7% (2024-2029)",
        "Key Regulations: PDPA, SGX Sustainability Reporting",
        "Competitive Intensity: Medium",
        "Key Pain Point: Fast-paced regulatory changes"
      ]
    },
    {
      icon: Globe,
      title: "Indonesia Market Analysis",
      description: "Indonesia represents a very high-growth, emerging RegTech market, with a large population, rapidly digitizing economy, and growing emphasis on data privacy.",
      features: [
        "RegTech Market Size: $620.53 Million (2029)",
        "CAGR: 24.6% (2024-2029)",
        "Key Regulations: Personal Data Protection Law (PDP)",
        "Competitive Intensity: Low",
        "Key Pain Point: Need for localized solutions"
      ]
    },
    {
      icon: Lock,
      title: "African Market Analysis",
      description: "The African financial sector is seeing increased ESG reporting demands driven by international investors and developing local regulations.",
      features: [
        "GRC Market Size (MEA): $10.93B (2030)",
        "CAGR: 14.6% (2025-2030)",
        "Key Regulations: Variable by country",
        "Competitive Intensity: Medium",
        "Key Pain Point: Lack of local ESG benchmarks"
      ]
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
            Market Analysis
          </div>
          <h2 className="font-bold">
            Global <span className="gradient-text">Compliance</span> Market Insights
          </h2>
          <p className="text-cyber-light/70 max-w-2xl mx-auto text-lg">
            Our comprehensive research identifies key growth markets and regulatory drivers
            across major regions worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {marketAnalysis.map((market, index) => (
            <div 
              key={index}
              className="glass-card overflow-hidden transition-all duration-300 group hover:border-cyber-blue/40"
            >
              <div className="p-6 pb-8">
                <div className="mb-4 p-3 rounded-full bg-cyber-blue/10 inline-block">
                  <market.icon className="w-6 h-6 text-cyber-blue" />
                </div>
                <h3 className="text-xl font-medium mb-3 group-hover:text-cyber-blue transition-colors">
                  {market.title}
                </h3>
                <p className="text-cyber-light/70 mb-6">
                  {market.description}
                </p>
                <ul className="space-y-2">
                  {market.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2 text-sm text-cyber-light/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue mt-1.5"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-r from-cyber-blue/20 to-cyber-blue/10 px-6 py-4 flex justify-between items-center">
                {market.slug && featuredReportSlug === market.slug ? (
                  <Link 
                    to={`/reports/${market.slug}`} 
                    className="text-cyber-light font-medium hover:text-cyber-blue transition-colors"
                  >
                    View Full Analysis
                  </Link>
                ) : (
                  <span className="text-cyber-light font-medium">View Full Analysis</span>
                )}
                {market.slug && featuredReportSlug === market.slug ? (
                  <Link 
                    to={`/reports/${market.slug}`}
                    className="text-cyber-blue transform group-hover:translate-x-1 transition-transform"
                  >
                    →
                  </Link>
                ) : (
                  <span className="text-cyber-blue transform group-hover:translate-x-1 transition-transform">→</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-cyber-light/70 mb-6 max-w-2xl mx-auto">
            Need detailed insights on specific markets or regulatory frameworks?
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button 
              className="cyber-button"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Request Custom Research
            </button>
            
            <Link to="/reports" className="px-6 py-3 text-cyber-light/80 hover:text-cyber-blue transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Browse All Reports
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
