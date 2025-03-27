
import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { VisualizationDataPoint } from '@/utils/visualizationData';

interface VisualizationAreaProps {
  visualizationContainerId: string;
  showVisualization: boolean;
  activeTab: string;
}

const VisualizationArea: React.FC<VisualizationAreaProps> = ({
  visualizationContainerId,
  showVisualization,
  activeTab,
}) => {
  const visualizationRef = useRef<HTMLDivElement>(null);

  return (
    <div className="rounded-lg overflow-hidden shadow-lg glass-card p-4 relative h-full flex flex-col">
      {!showVisualization && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-cyber-dark/80 backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-3">
            <div className="h-5 w-5 border-2 border-cyber-blue border-t-transparent rounded-full animate-spin"></div>
            <div className="text-cyber-blue text-sm font-mono">
              <span className="inline-block">Loading visualization</span>
              <span className="inline-block animate-pulse">...</span>
            </div>
            <div className="text-cyber-light/50 text-xs font-mono mt-2">
              cd ./research/market-analysis
            </div>
          </div>
        </div>
      )}
      
      <div 
        id={visualizationContainerId} 
        ref={visualizationRef}
        className={cn(
          "min-h-[300px] flex items-center justify-center transition-opacity duration-500 flex-grow",
          showVisualization ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
};

export default VisualizationArea;
