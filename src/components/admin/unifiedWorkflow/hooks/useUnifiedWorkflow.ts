
import { useState } from 'react';
import { useGeminiKeyValidation } from './useGeminiKeyValidation';
import { useWorkflowProcess } from './useWorkflowProcess';
import { ProcessStatus } from '../Steps';

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
  } = useGeminiKeyValidation(''); // Reset default to empty string
  
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
    if (!isKeyValidated) {
      console.error("Cannot process: API key not validated");
      return;
    }
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
