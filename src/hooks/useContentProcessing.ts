
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TerminalStore } from '@/pages/Admin';
import { ProcessStatus } from '@/components/admin/unifiedWorkflow/Steps';

export type ResultData = {
  documentId: string;
  title: string;
  summary: string;
  tags: string[];
  chunksProcessed: number;
} | null;

export const useContentProcessing = () => {
  const [rawContent, setRawContent] = useState('');
  const [contentType, setContentType] = useState('compliance');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [processingStep, setProcessingStep] = useState(0);
  const [processStatus, setProcessStatus] = useState<ProcessStatus[]>([
    'waiting', 'waiting', 'waiting', 'waiting'
  ]);
  const [result, setResult] = useState<ResultData>(null);

  const logTerminal = (message: string) => {
    if (TerminalStore && TerminalStore.addLine) {
      TerminalStore.addLine(`RAG Processor: ${message}`);
    }
  };

  const resetProcessing = () => {
    setCurrentStep(0);
    setProcessingStep(0);
    setProcessStatus(['waiting', 'waiting', 'waiting', 'waiting']);
    setResult(null);
  };

  const updateProcessStatus = (step: number, status: ProcessStatus) => {
    const newStatus = [...processStatus];
    newStatus[step] = status;
    setProcessStatus(newStatus);
  };

  const handleProcess = async () => {
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
      setCurrentStep(1);
      setProcessingStep(0);
      setProcessStatus(['processing', 'waiting', 'waiting', 'waiting']);
      setResult(null);

      // Step 1: Process with Gemini
      logTerminal("Step 1 - Processing with Gemini...");
      
      const authSession = await supabase.auth.getSession();
      const authToken = authSession.data.session?.access_token;
      
      if (!authToken) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      logTerminal(`Content type: ${contentType}, Content length: ${rawContent.length} characters`);
      
      if (rawContent.length > 50) {
        logTerminal(`Content preview: ${rawContent.substring(0, 50)}...`);
      }
      
      // Create payload in the format the edge function expects
      const requestPayload = { 
        prompt: rawContent,
        contentType: contentType
      };
      
      console.log("Sending request with payload:", requestPayload);
      logTerminal(`Sending request with payload: ${JSON.stringify(requestPayload)}`);
      
      // Use direct fetch to ensure proper formatting
      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/generate-report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'apikey': supabase.supabaseKey
        },
        body: JSON.stringify(requestPayload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        logTerminal(`Generate-report function error: Status ${response.status}, Response: ${errorText}`);
        throw new Error(`Gemini processing error: Status ${response.status}`);
      }
      
      const transformData = await response.json();
      
      if (!transformData || !transformData.reportJson) {
        logTerminal(`No data returned from the processing service`);
        throw new Error('No data returned from the processing service');
      }
      
      // Parse the report JSON
      let parsedReport;
      try {
        parsedReport = JSON.parse(transformData.reportJson);
        console.log("Successfully parsed report JSON:", parsedReport.title);
        logTerminal(`Successfully parsed report JSON: ${parsedReport.title}`);
      } catch (e) {
        console.error("Error parsing report JSON:", e);
        console.log("Raw report JSON:", transformData.reportJson.substring(0, 100) + "...");
        logTerminal(`Failed to parse report JSON: ${e.message}`);
        logTerminal(`Raw JSON preview: ${transformData.reportJson.substring(0, 100)}...`);
        throw new Error(`Failed to parse report JSON: ${e.message}`);
      }
      
      updateProcessStatus(0, 'completed');
      setProcessingStep(1);
      setCurrentStep(2);

      // Step 2: Chunk the content
      logTerminal("Step 2 - Chunking content...");
      
      const paragraphs = rawContent.split(/\n\s*\n/);
      const chunks = paragraphs.map((p, i) => ({
        text: p.trim(),
        position: i,
        chunkId: `chunk-${i + 1}`
      })).filter(chunk => chunk.text.length > 0);
      
      console.log(`Created ${chunks.length} chunks from content`);
      logTerminal(`Created ${chunks.length} chunks from content`);
      
      updateProcessStatus(1, 'completed');
      setProcessingStep(2);
      setCurrentStep(3);

      // Step 3: Generate embeddings
      logTerminal("Step 3 - Generating embeddings...");
      
      const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('process-for-rag', {
        body: {
          content: JSON.stringify(chunks),
          contentType,
          generateEmbeddings: true
        },
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (embeddingError) {
        console.warn("Warning: Embedding generation error:", embeddingError);
        logTerminal(`Warning: Embedding generation error: ${embeddingError.message}`);
        logTerminal("Continuing with the process even though embeddings failed");
      } else {
        logTerminal("Embeddings processed successfully");
      }
      
      updateProcessStatus(2, 'completed');
      setProcessingStep(3);
      setCurrentStep(4);

      // Step 4: Store everything in the database - add RAG flag
      logTerminal("Step 4 - Storing in database...");
      
      // Make sure the is_rag_enabled flag is set
      parsedReport.is_rag_enabled = true;
      logTerminal(`Adding is_rag_enabled flag: ${parsedReport.is_rag_enabled}`);
      
      const { data: storeData, error: storeError } = await supabase.functions.invoke('store-report', {
        body: parsedReport,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (storeError) {
        logTerminal(`Database storage error: ${storeError.message}`);
        throw new Error(`Database storage error: ${storeError.message}`);
      }
      
      if (!storeData || !storeData.report) {
        logTerminal(`Failed to store report in database - no report ID returned`);
        throw new Error('Failed to store report in database');
      }
      
      console.log("Report stored successfully:", storeData.report.id);
      logTerminal(`Report stored successfully with ID: ${storeData.report.id}`);
      
      updateProcessStatus(3, 'completed');

      // Set the result data
      setResult({
        documentId: storeData.report.id,
        title: parsedReport.title || 'Processed Document',
        summary: parsedReport.summary,
        tags: parsedReport.tags,
        chunksProcessed: chunks.length
      });

      toast({
        title: 'Processing Complete',
        description: `Document processed successfully with ${chunks.length} chunks`,
      });
      
      // Reset the form after successful processing
      setRawContent('');
      resetProcessing();
      
    } catch (error) {
      console.error('Error processing content:', error);
      
      // Update the status to show where the error occurred
      updateProcessStatus(processingStep, 'error');
      
      toast({
        title: 'Processing Error',
        description: error.message || 'Failed to process content',
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
    isProcessing,
    currentStep,
    processingStep,
    processStatus,
    result,
    handleProcess,
  };
};
