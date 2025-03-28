
import { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { VisualizationDataPoint, MarketEntryDataPoint } from '@/utils/visualizationData';
import { createVisualization } from '@/utils/visualizationUtils';

interface VisualizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  visualizationType: string;
  data: VisualizationDataPoint[] | MarketEntryDataPoint[];
}

const VisualizationModal = ({
  isOpen,
  onClose,
  title,
  visualizationType,
  data
}: VisualizationModalProps) => {
  const visualizationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && visualizationRef.current) {
      // Small delay to ensure the DOM is ready
      setTimeout(() => {
        createVisualization('visualization-container', visualizationType, data);
      }, 100);
    }
  }, [isOpen, visualizationType, data]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[800px] w-[90vw] max-h-[90vh] overflow-visible bg-black/90 border-cyber-blue/30">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-cyber-light text-xl">{title}</DialogTitle>
            <DialogDescription className="text-cyber-light/70">
              Interactive visualization of market research data
            </DialogDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="text-cyber-light/70 hover:text-cyber-light hover:bg-transparent"
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        <div 
          id="visualization-container" 
          ref={visualizationRef}
          className="flex justify-center items-center min-h-[500px] w-full p-4 relative"
        />
        <div className="text-xs text-cyber-light/50 text-center mt-4">
          Source: Global Compliance Officer Survey 2024 (n=612)
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VisualizationModal;
