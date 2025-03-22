
import React, { useState, useEffect } from 'react';
import Terminal from './Terminal';
import { cn } from '@/lib/utils';
import { findResearchCategory, getDefaultResponse, researchCategories } from '@/utils/researchData';
import VisualizationModal from './VisualizationModal';
import { painPointsData } from '@/utils/visualizationData';

interface MarketDataTerminalProps {
  className?: string;
  interactive?: boolean;
}

const MarketDataTerminal: React.FC<MarketDataTerminalProps> = ({ 
  className,
  interactive = true 
}) => {
  const initialLines = [
    "Welcome to ComplianceResearch Terminal v1.0",
    "Loading research database...",
    "Loading complete.",
    "Type 'help' to see available commands."
  ];

  const [terminalLines, setTerminalLines] = useState<string[]>(initialLines);
  const [isVisModalOpen, setIsVisModalOpen] = useState(false);
  const [visModalTitle, setVisModalTitle] = useState("");
  const [visModalType, setVisModalType] = useState("");

  const handleCommand = (command: string) => {
    // Handle special command: clear
    if (command.toLowerCase().trim() === 'clear') {
      setTerminalLines([
        "Terminal cleared.",
        "Type 'help' to see available commands."
      ]);
      return;
    }

    // Look for matching research category
    const category = findResearchCategory(command);
    
    if (category) {
      const response = category.data;
      
      // Add the response with a small delay
      setTimeout(() => {
        setTerminalLines(prev => [...prev, ...response]);
        
        // If this category has a visualization, open the modal
        if (category.hasVisualization) {
          // Open the visualization modal
          if (command.includes('pain-points')) {
            setVisModalTitle("Market Pain Points Analysis");
            setVisModalType("radar");
            setIsVisModalOpen(true);
          }
        }
      }, 300);
    } else {
      // Default response for unrecognized commands
      setTimeout(() => {
        setTerminalLines(prev => [...prev, ...getDefaultResponse()]);
      }, 300);
    }
  };

  return (
    <>
      <Terminal
        lines={terminalLines}
        typingSpeed={15}
        startDelay={500}
        className={cn(className)}
        interactive={interactive}
        onCommand={handleCommand}
        promptText="research@reportcase:~"
      />
      
      <VisualizationModal
        isOpen={isVisModalOpen}
        onClose={() => setIsVisModalOpen(false)}
        title={visModalTitle}
        visualizationType={visModalType}
        data={painPointsData}
      />
    </>
  );
};

export default MarketDataTerminal;
