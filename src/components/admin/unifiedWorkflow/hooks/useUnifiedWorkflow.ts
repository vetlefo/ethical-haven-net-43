
import { useState } from 'react';
import { useWorkflowProcess } from './useWorkflowProcess';
import { ProcessStatus } from '../Steps';

export type { ProcessStatus } from '../Steps';

export const useUnifiedWorkflow = () => {
  const [apiKey, setApiKey] = useState('compliance-admin-key-2023');
  
  // Use the workflow process hook
  const {
    rawContent,
    setRawContent,
    contentType,
    setContentType,
    currentStep,
    processingStep,
    isProcessing,
    processStatus,
    handleProcess
  } = useWorkflowProcess();
  
  // Handle process with current state values
  const processContent = async () => {
    await handleProcess(apiKey);
  };

  return {
    apiKey,
    setApiKey,
    rawContent,
    setRawContent,
    contentType,
    setContentType,
    currentStep,
    processingStep,
    isProcessing,
    processStatus,
    handleProcess: processContent
  };
};
