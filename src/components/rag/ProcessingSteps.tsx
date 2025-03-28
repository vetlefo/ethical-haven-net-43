
import React from 'react';
import { Steps, Step } from '@/components/admin/unifiedWorkflow/Steps';
import { ProcessStatus } from '@/components/admin/unifiedWorkflow/Steps';

interface ProcessingStepsProps {
  currentStep: number;
  processStatus: ProcessStatus[];
}

const ProcessingSteps: React.FC<ProcessingStepsProps> = ({ 
  currentStep, 
  processStatus 
}) => {
  return (
    <Steps currentStep={currentStep}>
      <Step 
        title="AI Processing" 
        description="Process content with Gemini to extract structured data" 
        status={processStatus[0]}
      />
      <Step 
        title="Content Chunking" 
        description="Split content into manageable chunks for embedding" 
        status={processStatus[1]}
      />
      <Step 
        title="Generate Embeddings" 
        description="Create vector embeddings for each content chunk" 
        status={processStatus[2]}
      />
      <Step 
        title="Database Storage" 
        description="Store processed content and embeddings in database" 
        status={processStatus[3]}
      />
    </Steps>
  );
};

export default ProcessingSteps;
