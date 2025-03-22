
import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Terminal from '../Terminal';
import { VisualizationDataPoint } from '@/utils/visualizationData';

interface VisualizationAreaProps {
  visualizationContainerId: string;
  showTerminal: boolean;
  showVisualization: boolean;
  activeTab: string;
  terminalCommands: string[];
}

const VisualizationArea: React.FC<VisualizationAreaProps> = ({
  visualizationContainerId,
  showTerminal,
  showVisualization,
  activeTab,
  terminalCommands,
}) => {
  const visualizationRef = useRef<HTMLDivElement>(null);

  return (
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
            lines={terminalCommands}
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
  );
};

export default VisualizationArea;
