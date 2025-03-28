
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TerminalStore } from '@/pages/Admin';
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
      TerminalStore.addLine(`Error: Admin API key is required`);
      return;
    }

    if (!rawContent.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please enter the raw content to process',
        variant: 'destructive',
      });
      TerminalStore.addLine(`Error: No content provided for processing`);
      return;
    }

    try {
      setIsProcessing(true);
      setProcessStatus(['processing', 'waiting', 'waiting']);
      setCurrentStep(1);
      setProcessingStep(0);
      
      // Step 1: Transform content
      TerminalStore.addLine(`Starting unified workflow process for ${contentType} content...`);
      TerminalStore.addLine(`Step 1: Transforming raw content...`);
      
      const { data: transformData, error: transformError } = await supabase.functions.invoke('generate-report', {
        body: {
          content: rawContent,
          contentType
        }
      });
      
      if (transformError) {
        throw new Error(`Transformation error: ${transformError.message}`);
      }
      
      if (!transformData || transformData.success === false) {
        throw new Error(transformData?.error || 'Failed to transform content');
      }
      
      const reportJson = transformData.reportJson;
      TerminalStore.addLine(`Content transformation completed successfully`);
      TerminalStore.addLine(`Generated report JSON structure: ${Object.keys(JSON.parse(reportJson)).join(', ')}`);
      
      // Step 2: Process for RAG
      setProcessStatus(['completed', 'processing', 'waiting']);
      setProcessingStep(1);
      setCurrentStep(2);
      
      TerminalStore.addLine(`Step 2: Processing for RAG embeddings...`);
      
      const { data: ragData, error: ragError } = await supabase.functions.invoke('process-for-rag', {
        body: {
          content: reportJson,
          contentType
        }
      });
      
      if (ragError) {
        TerminalStore.addLine(`RAG processing error: ${ragError.message}`);
        throw new Error(`RAG processing error: ${ragError.message}`);
      }
      
      if (!ragData || !ragData.processedContent) {
        TerminalStore.addLine(`Error: No processed content returned from RAG function`);
        throw new Error('Failed to process content for RAG');
      }
      
      const processedContent = ragData.processedContent;
      TerminalStore.addLine(`RAG processing completed successfully`);
      
      // Log what's in the processed content
      try {
        const contentData = JSON.parse(processedContent);
        if (Array.isArray(contentData)) {
          TerminalStore.addLine(`Processed ${contentData.length} items for database insertion`);
        } else {
          TerminalStore.addLine(`Generated a document with ID: ${contentData.document_id || 'unknown'}`);
        }
      } catch (e) {
        TerminalStore.addLine(`Warning: Could not parse processed content as JSON`);
      }
      
      // Step 3: Store in database
      setProcessStatus(['completed', 'completed', 'processing']);
      setProcessingStep(2);
      setCurrentStep(3);
      
      TerminalStore.addLine(`Step 3: Storing content in database...`);
      
      const contentData = JSON.parse(processedContent);
      let storeFunction = 'admin-rag-embeddings';
      
      if (contentType === 'competitive-intel') {
        storeFunction = 'admin-competitive-intel';
        TerminalStore.addLine(`Using ${storeFunction} function to store competitive intelligence data...`);
      } else {
        TerminalStore.addLine(`Using ${storeFunction} function to store RAG embeddings...`);
      }
      
      const { data: storeData, error: storeError } = await supabase.functions.invoke(storeFunction, {
        body: contentData,
        headers: {
          'Admin-Key': apiKey,
        }
      });
      
      if (storeError) {
        TerminalStore.addLine(`Storage error: ${storeError.message}`);
        TerminalStore.addLine(`Check that your admin API key is correct and the database is accessible`);
        throw new Error(`Storage error: ${storeError.message}`);
      }
      
      // Log the response from the store function
      if (storeData) {
        TerminalStore.addLine(`Database response: ${JSON.stringify(storeData)}`);
      }
      
      setProcessStatus(['completed', 'completed', 'completed']);
      TerminalStore.addLine(`Content stored successfully in the database`);
      TerminalStore.addLine(`Unified workflow process completed successfully`);
      
      toast({
        title: 'Success!',
        description: `${contentType === 'competitive-intel' ? 'Competitive intelligence' : 'Compliance report'} processed and stored successfully`,
      });
      
      // Reset form after successful submission
      setRawContent('');
      
    } catch (error) {
      console.error('Error in unified workflow:', error);
      
      const currentStatusCopy = [...processStatus];
      currentStatusCopy[processingStep] = 'error';
      setProcessStatus(currentStatusCopy);
      
      TerminalStore.addLine(`Error in unified workflow: ${error.message}`);
      
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
