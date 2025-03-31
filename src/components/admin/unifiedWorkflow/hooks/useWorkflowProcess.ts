
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logToTerminal } from '@/utils/terminalLogger';
import { ProcessStatus } from '../Steps';

export const useWorkflowProcess = () => {
  const [rawContent, setRawContent] = useState('');
  const [contentType, setContentType] = useState('compliance');
  const [currentStep, setCurrentStep] = useState(0);
  const [processingStep, setProcessingStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<ProcessStatus[]>(['waiting', 'waiting', 'waiting']);

  const handleProcess = async (apiKey: string): Promise<void> => {
    if (!apiKey.trim()) {
      toast({
        title: 'Admin API Key Required',
        description: 'Please enter your admin API key',
        variant: 'destructive',
      });
      logToTerminal(`Error: Admin API key is required`);
      return;
    }

    if (!rawContent.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please enter the raw content to process',
        variant: 'destructive',
      });
      logToTerminal(`Error: No content provided for processing`);
      return;
    }

    try {
      // Get authentication token
      const authSession = await supabase.auth.getSession();
      const authToken = authSession.data.session?.access_token;
      
      if (!authToken) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to process content',
          variant: 'destructive',
        });
        logToTerminal(`Error: Authentication required for content processing`);
        return;
      }
      
      setIsProcessing(true);
      setProcessStatus(['processing', 'waiting', 'waiting']);
      setCurrentStep(1);
      setProcessingStep(0);
      
      // Step 1: Transform content
      logToTerminal(`Starting unified workflow process for ${contentType} content...`);
      logToTerminal(`Step 1: Transforming raw content...`);
      logToTerminal(`Content length: ${rawContent.length} characters`);
      logToTerminal(`Content type: ${contentType}`);
      
      // Log a small sample of the content for debugging
      if (rawContent.length > 50) {
        logToTerminal(`Content preview: ${rawContent.substring(0, 50)}...`);
      }
      
      // Create a proper stringified JSON payload
      const requestPayload = { 
        prompt: rawContent,
        contentType: contentType
      };
      
      logToTerminal(`Sending request to generate-report with payload: ${JSON.stringify(requestPayload, null, 2)}`);
      
      // Use a direct fetch call with proper headers to ensure correct content type
      const apiUrl = `https://kxvjrktpadujfcxpfuxi.supabase.co/functions/v1/generate-report`;
      const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4dmpya3RwYWR1amZjeHBmdXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTkwMzksImV4cCI6MjA1ODE5NTAzOX0.HKDNvLzo8FV1bVk-CNxV2dZ-CCV8NaIrYP_q3ciXHII';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        body: JSON.stringify(requestPayload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        logToTerminal(`Transformation error: Status ${response.status}, Response: ${errorText}`);
        throw new Error(`Transformation error: Edge Function returned a non-2xx status code`);
      }
      
      const transformData = await response.json();
      
      if (!transformData || transformData.success === false) {
        logToTerminal(`Transformation failed: ${transformData?.error || 'Unknown error'}`);
        throw new Error(transformData?.error || 'Failed to transform content');
      }
      
      const reportJson = transformData.reportJson;
      logToTerminal(`Content transformation completed successfully`);
      
      let parsedReport;
      try {
        parsedReport = JSON.parse(reportJson);
        logToTerminal(`Generated report with title: "${parsedReport.title}"`);
      } catch (parseError) {
        logToTerminal(`Error parsing report JSON: ${parseError.message}`);
        logToTerminal(`Raw JSON: ${reportJson.substring(0, 100)}...`);
        throw new Error(`Failed to parse report JSON: ${parseError.message}`);
      }
      
      // Add the is_rag_enabled flag to the report
      parsedReport.is_rag_enabled = true;
      
      // Step 2: Store the report directly
      setProcessStatus(['completed', 'processing', 'waiting']);
      setProcessingStep(1);
      setCurrentStep(2);
      
      logToTerminal(`Step 2: Storing report in database...`);
      logToTerminal(`Report has is_rag_enabled flag set to: ${parsedReport.is_rag_enabled}`);
      
      const { data: storeData, error: storeError } = await supabase.functions.invoke('store-report', {
        body: parsedReport,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (storeError) {
        logToTerminal(`Storage error: ${storeError.message}`);
        throw new Error(`Storage error: ${storeError.message}`);
      }
      
      logToTerminal(`Report stored successfully in database`);
      
      // Step 3: Process for RAG (optional)
      setProcessStatus(['completed', 'completed', 'processing']);
      setProcessingStep(2);
      setCurrentStep(3);
      
      logToTerminal(`Step 3: Processing for RAG embeddings...`);
      
      const { data: ragData, error: ragError } = await supabase.functions.invoke('process-for-rag', {
        body: {
          content: reportJson,
          contentType
        },
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (ragError) {
        logToTerminal(`Warning: RAG processing error: ${ragError.message}`);
        logToTerminal(`Report was saved successfully, but RAG embeddings failed`);
        setProcessStatus(['completed', 'completed', 'error']);
      } else {
        setProcessStatus(['completed', 'completed', 'completed']);
        logToTerminal(`RAG processing completed successfully`);
      }
      
      // Success message regardless of RAG outcome (because the report is saved)
      toast({
        title: 'Success!',
        description: `Compliance report "${parsedReport.title}" has been processed and stored successfully`,
      });
      
      // Reset form after successful submission
      setRawContent('');
      
    } catch (error) {
      console.error('Error in unified workflow:', error);
      
      const currentStatusCopy = [...processStatus];
      currentStatusCopy[processingStep] = 'error';
      setProcessStatus(currentStatusCopy);
      
      logToTerminal(`Error in unified workflow: ${error.message}`);
      
      toast({
        title: 'Process Error',
        description: error.message || 'Failed to complete the workflow',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    rawContent,
    setRawContent,
    contentType,
    setContentType,
    currentStep,
    processingStep,
    isProcessing,
    processStatus,
    handleProcess
  };
};
