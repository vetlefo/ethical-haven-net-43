
import React, { useState, useEffect } from 'react';
import Terminal from './Terminal';
import { cn } from '@/lib/utils';
import { findResearchCategory, getDefaultResponse, researchCategories } from '@/utils/researchData';

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
      }, 300);
    } else {
      // Default response for unrecognized commands
      setTimeout(() => {
        setTerminalLines(prev => [...prev, ...getDefaultResponse()]);
      }, 300);
    }
  };

  return (
    <Terminal
      lines={terminalLines}
      typingSpeed={15}
      startDelay={500}
      className={cn(className)}
      interactive={interactive}
      onCommand={handleCommand}
      promptText="research@reportcase:~"
    />
  );
};

export default MarketDataTerminal;
