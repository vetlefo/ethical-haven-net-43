
import { useState } from 'react';
import { useGeminiKeyValidation } from './useGeminiKeyValidation';
import { useWorkflowProcess } from './useWorkflowProcess';

export type { ProcessStatus } from '../Steps';

export const useUnifiedWorkflow = (initialGeminiApiKey: string) => {
  const [apiKey, setApiKey] = useState('compliance-admin-key-2023');
  
  // Use the key validation hook
  const {
    geminiApiKey,
    setGeminiApiKey,
    isKeyValidated,
    validateGeminiApiKey,
    validationInProgress
  } = useGeminiKeyValidation(initialGeminiApiKey);
  
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
    await handleProcess(apiKey, geminiApiKey);
  };

  return {
    apiKey,
    setApiKey,
    geminiApiKey,
    setGeminiApiKey,
    rawContent,
    setRawContent,
    contentType,
    setContentType,
    currentStep,
    processingStep,
    isProcessing,
    processStatus,
    handleProcess: processContent,
    validateGeminiApiKey,
    isKeyValidated,
    validationInProgress
  };
};
