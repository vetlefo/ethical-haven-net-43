
import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export type StepStatus = 'waiting' | 'processing' | 'completed' | 'error';

export const useUnifiedWorkflow = (initialGeminiApiKey: string = '') => {
  const [apiKey, setApiKey] = useState('compliance-admin-key-2023');
  const [geminiApiKey, setGeminiApiKey] = useState(initialGeminiApiKey || '');
  const [rawContent, setRawContent] = useState('');
  const [contentType, setContentType] = useState('compliance');
  const [isKeyValidated, setIsKeyValidated] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [processingStep, setProcessingStep] = useState(0);
  const [processStatus, setProcessStatus] = useState<StepStatus[]>([
    'waiting', 'waiting', 'waiting'
  ]);

  const updateStepStatus = (step: number, status: StepStatus) => {
    setProcessStatus(prev => {
      const newStatus = [...prev];
      newStatus[step] = status;
      return newStatus;
    });
  };

  // Function to validate the Gemini API key
  const validateGeminiApiKey = useCallback(async (key: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: "Respond with only the word 'valid'" }]
          }]
        }),
      });
      
      if (!response.ok) {
        setIsKeyValidated(false);
        return false;
      }
      
      const data = await response.json();
      const isValid = !!data.candidates;
      setIsKeyValidated(isValid);
      return isValid;
    } catch (error) {
      console.error('Error validating Gemini API key:', error);
      setIsKeyValidated(false);
      return false;
    }
  }, []);

  // Validate key when it changes
  useEffect(() => {
    if (geminiApiKey) {
      validateGeminiApiKey(geminiApiKey);
    } else {
      setIsKeyValidated(false);
    }
  }, [geminiApiKey, validateGeminiApiKey]);

  // Step 1: Transform the raw content into a structured report
  const transformContent = async (): Promise<string> => {
    setProcessingStep(0);
    updateStepStatus(0, 'processing');
    
    try {
      // Use the Supabase edge function to transform the content
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          geminiApiKey,
          prompt: rawContent
        }
      });
      
      if (error) {
        console.error('Error from Supabase function:', error);
        throw new Error(error.message || 'Failed to transform content');
      }
      
      if (!data || data.success === false) {
        throw new Error(data?.error || 'Failed to transform content');
      }
      
      if (!data.reportJson) {
        throw new Error('No report data returned from the function');
      }
      
      updateStepStatus(0, 'completed');
      return data.reportJson;
    } catch (error: any) {
      console.error('Error transforming content:', error);
      updateStepStatus(0, 'error');
      throw error;
    }
  };

  // Step 2: Process the transformed content for RAG
  const processForRag = async (transformedContent: string): Promise<string> => {
    setProcessingStep(1);
    updateStepStatus(1, 'processing');
    
    try {
      const { data, error } = await supabase.functions.invoke('process-for-rag', {
        body: {
          geminiApiKey,
          content: transformedContent,
          contentType
        }
      });
      
      if (error) {
        console.error('Error from Supabase function:', error);
        throw new Error(error.message || 'Failed to process content for RAG');
      }
      
      if (!data || !data.processedContent) {
        throw new Error('No data returned from the function or missing processedContent');
      }
      
      updateStepStatus(1, 'completed');
      return data.processedContent;
    } catch (error: any) {
      console.error('Error processing for RAG:', error);
      updateStepStatus(1, 'error');
      throw error;
    }
  };

  // Step 3: Store the processed content in the database
  const storeInDatabase = async (processedContent: string): Promise<void> => {
    setProcessingStep(2);
    updateStepStatus(2, 'processing');
    
    try {
      // Parse the JSON input
      const contentData = JSON.parse(processedContent);
      
      if (contentType === 'competitive-intel') {
        const { error } = await supabase.functions.invoke('admin-competitive-intel', {
          body: contentData,
          headers: {
            'Admin-Key': apiKey,
          }
        });
        
        if (error) {
          throw new Error(error.message || 'Failed to store competitive intelligence data');
        }
      } else {
        // For RAG embeddings
        const { error } = await supabase.functions.invoke('admin-rag-embeddings', {
          body: contentData,
          headers: {
            'Admin-Key': apiKey,
          }
        });
        
        if (error) {
          throw new Error(error.message || 'Failed to store RAG embeddings');
        }
      }
      
      updateStepStatus(2, 'completed');
    } catch (error: any) {
      console.error('Error storing in database:', error);
      updateStepStatus(2, 'error');
      throw error;
    }
  };

  // Main process function that chains all steps together
  const handleProcess = async () => {
    if (!geminiApiKey.trim() || !isKeyValidated) {
      toast({
        title: 'Gemini API Key Required',
        description: 'Please enter a valid Gemini API key for this session',
        variant: 'destructive',
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: 'Admin API Key Required',
        description: 'Please enter your admin API key',
        variant: 'destructive',
      });
      return;
    }

    if (!rawContent.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please enter the raw content to process',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsProcessing(true);
      setCurrentStep(0);
      
      // Reset all statuses to waiting
      setProcessStatus(['waiting', 'waiting', 'waiting']);
      
      // Step 1: Transform
      const transformedContent = await transformContent();
      setCurrentStep(1);
      
      // Step 2: Process for RAG
      const processedContent = await processForRag(transformedContent);
      setCurrentStep(2);
      
      // Step 3: Store in database
      await storeInDatabase(processedContent);
      
      toast({
        title: 'Success!',
        description: 'Content has been processed and stored successfully',
        variant: 'default',
      });
      
    } catch (error: any) {
      console.error('Error in unified workflow:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred during processing',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
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
    isProcessing,
    processingStep,
    processStatus,
    handleProcess,
    validateGeminiApiKey,
    isKeyValidated
  };
};
