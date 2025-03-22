import React, { useEffect, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, BarChart3, Layers, Zap, Database, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import Terminal from './Terminal';
import { createVisualization } from '@/utils/visualizationUtils';
import { painPointsData } from '@/utils/visualizationData';

const Features: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState("pain-points");
  const [showTerminal, setShowTerminal] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const visualizationRef = useRef<HTMLDivElement>(null);
  const visualizationContainerId = "tab-visualization";

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            section.classList.add('revealed');
            setShowTerminal(true);
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
    // Clean up previous visualizations when changing tabs
    if (visualizationRef.current) {
      visualizationRef.current.innerHTML = '';
    }
    
    // Reset visualization state when tab changes
    setShowVisualization(false);
    
    // Show terminal first
    setShowTerminal(true);
    
    // Then show visualization after terminal animation
    const timer = setTimeout(() => {
      setShowVisualization(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    // Only create visualization when showVisualization is true and the container exists
    if (showVisualization && visualizationRef.current) {
      // Small delay to ensure the DOM is ready
      const timer = setTimeout(() => {
        const container = document.getElementById(visualizationContainerId);
        if (container) {
          if (activeTab === "pain-points") {
            createVisualization(visualizationContainerId, 'radar', painPointsData);
          }
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [showVisualization, activeTab]);

  const getTerminalCommands = (tab: string) => {
    switch(tab) {
      case 'pain-points':
        return [
          "cd ~/research/market-analysis",
          "ls -la",
          "cat pain-points.json | jq",
          "npm run visualization --type=radar --dataset=pain-points",
          "# Generating visualization..."
        ];
      case 'entry-strategy':
        return [
          "cd ~/research/market-strategy",
          "ls -la",
          "grep -r 'Priority' ./entry-strategy.md",
          "python3 analyze.py --region=EMEA --focus=entry",
          "# Analyzing entry strategy data..."
        ];
      case 'growth-drivers':
        return [
          "cd ~/research/trends",
          "git pull origin main",
          "cat growth-factors.csv | sort -k2 -nr | head -10",
          "node generate-chart.js --data=growth-drivers",
          "# Processing growth data..."
        ];
      case 'competitive':
        return [
          "cd ~/research/competitors",
          "find . -name '*.xlsx' | xargs -I{} xlsx2csv {}",
          "curl -s api.market.io/v1/competitors | jq '.data[]'",
          "./analyze-competitors.sh --region=global",
          "# Mapping competitive landscape..."
        ];
      case 'partnership':
        return [
          "cd ~/research/partnerships",
          "git checkout strategy-branch",
          "grep -r 'EY' --include='*.md' .",
          "python3 partnership-model.py --simulate --years=5",
          "# Calculating partnership ROI..."
        ];
      case 'success-metrics':
        return [
          "cd ~/research/metrics",
          "cat KPIs.yaml",
          "./benchmark-calculator --industry=compliance --region=global",
          "node metrics-dashboard.js --interactive",
          "# Generating metrics dashboard..."
        ];
      default:
        return [
          "cd ~/research",
          "ls -la",
          "cat README.md",
          "# Loading research data..."
        ];
    }
  };

  const researchFindings = [
    {
      id: "pain-points",
      icon: AlertTriangle,
      title: "Market Pain Points",
      description: "Our research identified these critical challenges in the current compliance software landscape:",
      details: [
        "Regulatory Complexity: 87% of compliance officers struggle with the volume and complexity of regulations across jurisdictions.",
        "Data Silos & Manual Processes: Compliance data often scattered across disparate systems and managed through inefficient manual processes.",
        "User-Unfriendly Software: Existing compliance software often has complex interfaces and steep learning curves.",
        "Inadequate Localization: Lack of market-specific customization makes global compliance difficult.",
        "Limited Reporting & Analytics: Current solutions lack customizable reporting, trend analysis, and benchmarking capabilities."
      ],
      image: "https://placehold.co/600x400/0ea5e9/FFFFFF/png?text=Pain+Points+Analysis"
    },
    {
      id: "entry-strategy",
      icon: Layers,
      title: "Market Entry Strategy",
      description: "Our recommended approach for entering the global compliance software market:",
      details: [
        "Priority 1: Germany - $8.14B market (2030), 12.4% CAGR, medium competition, high regulatory complexity",
        "Priority 2: United Kingdom - $10.91B market (2030), 11.6% CAGR, high competition, strong regulatory environment",
        "Priority 3: United States - $33.1B market (2024), 10.9% CAGR, high competition, complex regulatory framework",
        "Phased rollout starting with Germany, then UK, then US",
        "Leverage strategic partnerships for market entry and client acquisition",
        "Focus on user-friendly design and seamless integration as key differentiators"
      ],
      image: "https://placehold.co/600x400/0ea5e9/FFFFFF/png?text=Market+Entry+Strategy"
    },
    {
      id: "growth-drivers",
      icon: BarChart3,
      title: "Market Growth Drivers",
      description: "Key factors driving the rapid growth in the compliance software market:",
      details: [
        "Increasing regulatory complexity and enforcement across jurisdictions",
        "Growing focus on ESG reporting and transparency",
        "Rising costs of non-compliance (fines, penalties, reputational damage)",
        "Digital transformation accelerating demand for automated compliance solutions",
        "Greater focus on whistleblower protection and corporate governance",
        "Increasing cybersecurity threats and data protection requirements"
      ],
      image: "https://placehold.co/600x400/0ea5e9/FFFFFF/png?text=Growth+Drivers"
    },
    {
      id: "competitive",
      icon: Database,
      title: "Competitive Landscape",
      description: "Analysis of the current competitive environment in key markets:",
      details: [
        "Moderately fragmented market with opportunities for differentiation",
        "Major players include NAVEX, Whistlelink, AuditBoard across various categories",
        "European market dominated by regional players with strong data privacy focus",
        "US market highly competitive with both established players and new entrants",
        "ASEAN markets relatively underserved with fewer established players",
        "Key differentiators: user experience, integration capabilities, and localization"
      ],
      image: "https://placehold.co/600x400/0ea5e9/FFFFFF/png?text=Competitive+Landscape"
    },
    {
      id: "partnership",
      icon: Globe,
      title: "Partnership Strategy",
      description: "Strategic partnership opportunities to accelerate market entry and growth:",
      details: [
        "Leverage existing relationship with EY for market entry in primary targets",
        "Collaborate to offer combined solution (technology + consulting services)",
        "Explore potential integrations with existing EY compliance offerings",
        "Utilize EY's global network for expansion into secondary markets",
        "Consider partnerships with regional players in ASEAN markets",
        "Explore collaborations with industry associations and regulatory bodies"
      ],
      image: "https://placehold.co/600x400/0ea5e9/FFFFFF/png?text=Partnership+Strategy"
    },
    {
      id: "success-metrics",
      icon: Zap,
      title: "Key Success Metrics",
      description: "Critical metrics to track for successful market entry and growth:",
      details: [
        "Market share in target markets",
        "Customer acquisition cost and lifetime value",
        "Customer satisfaction and Net Promoter Score (NPS)",
        "Regulatory compliance rates for customers",
        "Number and value of strategic partnerships",
        "Product adoption and feature utilization rates"
      ],
      image: "https://placehold.co/600x400/0ea5e9/FFFFFF/png?text=Success+Metrics"
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
            Research Insights
          </div>
          <h2 className="font-bold">
            Key <span className="gradient-text">Findings</span> & Recommendations
          </h2>
          <p className="text-cyber-light/70 max-w-2xl mx-auto text-lg">
            Our comprehensive market research reveals critical insights for successful entry
            into the global compliance software market.
          </p>
        </div>

        <Tabs 
          defaultValue="pain-points" 
          className="w-full" 
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="grid grid-cols-3 md:grid-cols-6 bg-cyber-dark/30 p-1 rounded-lg mb-8">
            {researchFindings.map((finding) => (
              <TabsTrigger 
                key={finding.id} 
                value={finding.id}
                className="data-[state=active]:bg-cyber-blue/20 data-[state=active]:text-cyber-blue"
              >
                <finding.icon className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">{finding.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {researchFindings.map((finding) => (
            <TabsContent key={finding.id} value={finding.id} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="glass-card p-8">
                  <h3 className="text-2xl font-semibold mb-4 flex items-center">
                    <finding.icon className="h-6 w-6 mr-2 text-cyber-blue" />
                    {finding.title}
                  </h3>
                  <p className="text-cyber-light/70 mb-6">
                    {finding.description}
                  </p>
                  <ul className="space-y-3">
                    {finding.details.map((detail, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-cyber-blue rounded-full mr-3 mt-1.5"></span>
                        <span className="text-cyber-light/80">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg overflow-hidden shadow-lg glass-card p-4 relative">
                  <div 
                    id={visualizationContainerId} 
                    ref={visualizationRef}
                    className={cn(
                      "min-h-[300px] flex items-center justify-center transition-opacity duration-500",
                      showVisualization ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {!showVisualization && (
                      <div className="text-cyber-blue animate-pulse">Loading visualization...</div>
                    )}
                  </div>
                  
                  {showTerminal && (
                    <div 
                      className={cn(
                        "absolute inset-x-0 bottom-0 z-10 transform transition-transform duration-500 ease-out",
                        showVisualization ? "translate-y-[70%] hover:translate-y-[0%]" : "translate-y-0"
                      )}
                    >
                      <Terminal 
                        lines={getTerminalCommands(activeTab)}
                        typingSpeed={10}
                        startDelay={100}
                        className="mb-0 rounded-b-lg bg-cyber-dark/80 backdrop-blur-sm border-t border-cyber-blue/30"
                        interactive={false}
                        promptText="researcher@reportcase:~$"
                        colors={{
                          prompt: "#0ea5e9",
                          command: "#f8fafc",
                          comment: "#8B5CF6"
                        }}
                      />
                    </div>
                  )}
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
