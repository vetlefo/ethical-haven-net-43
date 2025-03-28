
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

interface ResultData {
  documentId: string;
  title: string;
  summary: string;
  tags: string[];
  chunksProcessed: number;
}

interface ProcessingResultProps {
  result: ResultData | null;
}

const ProcessingResult: React.FC<ProcessingResultProps> = ({ result }) => {
  if (!result) return null;
  
  return (
    <Alert className="bg-cyber-dark border-green-500/30 mt-4">
      <CheckCircle className="h-4 w-4 text-green-500" />
      <AlertDescription className="text-cyber-light">
        <div className="font-medium">Processing Complete</div>
        <div className="text-sm mt-1">
          Document ID: {result.documentId}<br />
          Title: {result.title}<br />
          Chunks Processed: {result.chunksProcessed}<br />
          Tags: {result.tags?.join(', ')}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ProcessingResult;
