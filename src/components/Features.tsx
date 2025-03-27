
import React, { useEffect, useRef, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { createVisualization } from '@/utils/visualizationUtils';
import { painPointsData } from '@/utils/visualizationData';
import { researchFindings } from '@/utils/researchFindings';
import ResearchHeader from './research/ResearchHeader';
import ResearchCard from './research/ResearchCard';
import VisualizationArea from './research/VisualizationArea';

const Features: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState("pain-points");
  const [showVisualization, setShowVisualization] = useState(false);
  const visualizationContainerId = "tab-visualization";

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
    // Reset visualization state when tab changes
    setShowVisualization(false);
    
    // Show visualization after a short delay to simulate loading
    const timer = setTimeout(() => {
      setShowVisualization(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    // Only create visualization when showVisualization is true
    if (showVisualization) {
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

  return (
    <section 
      id="features" 
      ref={sectionRef}
      className="py-20 px-6 relative"
    >
      <div className="container mx-auto">
        <ResearchHeader />

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch h-full">
                <ResearchCard finding={finding} />
                <VisualizationArea 
                  visualizationContainerId={visualizationContainerId}
                  showVisualization={showVisualization}
                  activeTab={activeTab}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default Features;
