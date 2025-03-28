
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
      
      const parsedReport = JSON.parse(reportJson);
      TerminalStore.addLine(`Generated report with title: "${parsedReport.title}"`);
      
      // Step 2: Store the report directly (skip RAG processing for now)
      setProcessStatus(['completed', 'processing', 'waiting']);
      setProcessingStep(1);
      setCurrentStep(2);
      
      TerminalStore.addLine(`Step 2: Storing report in database...`);
      
      const { data: storeData, error: storeError } = await supabase.functions.invoke('store-report', {
        body: parsedReport
      });
      
      if (storeError) {
        TerminalStore.addLine(`Storage error: ${storeError.message}`);
        throw new Error(`Storage error: ${storeError.message}`);
      }
      
      // Step 3: Process for RAG (optional)
      setProcessStatus(['completed', 'completed', 'processing']);
      setProcessingStep(2);
      setCurrentStep(3);
      
      TerminalStore.addLine(`Step 3: Processing for RAG embeddings...`);
      
      const { data: ragData, error: ragError } = await supabase.functions.invoke('process-for-rag', {
        body: {
          content: reportJson,
          contentType
        }
      });
      
      if (ragError) {
        TerminalStore.addLine(`Warning: RAG processing error: ${ragError.message}`);
        TerminalStore.addLine(`Report was saved successfully, but RAG embeddings failed`);
        setProcessStatus(['completed', 'completed', 'error']);
      } else {
        setProcessStatus(['completed', 'completed', 'completed']);
        TerminalStore.addLine(`RAG processing completed successfully`);
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
