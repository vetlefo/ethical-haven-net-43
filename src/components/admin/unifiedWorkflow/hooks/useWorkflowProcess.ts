
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logToTerminal } from '@/utils/terminalLogger';
import { ProcessStatus } from '../Steps';
import { getSupabaseAnonKey, getEdgeFunctionUrl } from '@/utils/supabaseConfig';

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
      const apiUrl = getEdgeFunctionUrl('generate-report');
      const supabaseKey = getSupabaseAnonKey();
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey
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
        
        // Use the actual title from the original content instead of the AI-generated one
        // Extract a meaningful title from the raw content for comparative analysis reports
        if (contentType === 'competitive-intel' && rawContent.includes('Comparative Analysis')) {
          const titleMatch = rawContent.match(/# \*\*([^*]+)\*\*/);
          if (titleMatch && titleMatch[1]) {
            parsedReport.title = titleMatch[1].trim();
            logToTerminal(`Using original title from content: "${parsedReport.title}"`);
          }
        }
        
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
      
      // Use the direct fetch approach for more control over the request
      const storeUrl = getEdgeFunctionUrl('store-report');
      
      const storeResponse = await fetch(storeUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey
        },
        body: JSON.stringify(parsedReport)
      });
      
      if (!storeResponse.ok) {
        const errorText = await storeResponse.text();
        logToTerminal(`Storage error details: Status ${storeResponse.status}, Response: ${errorText}`);
        throw new Error(`Storage error: Edge Function returned a non-2xx status code`);
      }
      
      const storeData = await storeResponse.json();
      
      if (!storeData.success) {
        logToTerminal(`Storage operation failed: ${storeData.error || 'Unknown error'}`);
        throw new Error(`Storage error: ${storeData.error || 'Unknown error'}`);
      }
      
      logToTerminal(`Report stored successfully in database with ID: ${storeData.report?.id || 'unknown'}`);
      
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
        description: `Report "${parsedReport.title}" has been processed and stored successfully`,
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
