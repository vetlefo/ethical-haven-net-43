import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logToTerminal } from '@/utils/terminalLogger';
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

      // --- Step 1: Process with Gemini (Generate Report) ---
      logToTerminal("Step 1 - Generating initial report structure...");
      setProcessingStep(0); // Mark current step for error reporting

      const authSession = await supabase.auth.getSession();
      const authToken = authSession.data.session?.access_token;
      if (!authToken) {
        throw new Error('Authentication required. Please log in again.');
      }

      logToTerminal(`Content type: ${contentType}, Content length: ${rawContent.length} characters`);
      if (rawContent.length > 50) {
        logToTerminal(`Content preview: ${rawContent.substring(0, 50)}...`);
      }

      const generateReportPayload = {
        prompt: rawContent,
        contentType: contentType
      };
      logToTerminal(`Calling 'generate-report' function...`);
      const { data: transformData, error: transformError } = await supabase.functions.invoke('generate-report', {
        body: generateReportPayload,
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (transformError) {
        logToTerminal(`Error from 'generate-report': ${transformError.message}`);
        throw new Error(transformError.message || 'Failed to generate initial report');
      }
      if (!transformData || transformData.success === false || !transformData.reportJson) {
        const errorMsg = transformData?.error || 'Report generation service returned invalid data or failed';
        logToTerminal(`'generate-report' failed: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      let parsedReport;
      try {
        parsedReport = JSON.parse(transformData.reportJson);
        logToTerminal(`Successfully parsed generated report: ${parsedReport.title || '(No Title)'}`);
      } catch (e: any) {
        logToTerminal(`Failed to parse report JSON from 'generate-report': ${e.message}`);
        logToTerminal(`Raw JSON preview: ${transformData.reportJson.substring(0, 100)}...`);
        throw new Error(`Failed to parse generated report JSON: ${e.message}`);
      }
      updateProcessStatus(0, 'completed');

      // --- Step 2: Chunk the content ---
      logToTerminal("Step 2 - Chunking content...");
      setProcessingStep(1); // Mark current step

      const paragraphs = rawContent.split(/\n\s*\n/);
      const chunks = paragraphs.map((p, i) => ({
        text: p.trim(),
        position: i,
        chunkId: `chunk-${i + 1}`
      })).filter(chunk => chunk.text.length > 0);
      logToTerminal(`Created ${chunks.length} chunks from content`);
      updateProcessStatus(1, 'completed');

      // --- Step 3: Generate embeddings ---
      logToTerminal("Step 3 - Generating embeddings...");
      setProcessingStep(2); // Mark current step

      const processRagPayload = {
        content: JSON.stringify(chunks), // Assuming process-for-rag expects stringified chunks
        contentType,
        generateEmbeddings: true // Explicitly request embeddings
      };
      logToTerminal(`Calling 'process-for-rag' function...`);
      const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('process-for-rag', {
        body: processRagPayload,
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (embeddingError) {
        logToTerminal(`Error from 'process-for-rag': ${embeddingError.message}`);
        // Decide if this is critical - for now, let's make it blocking
        throw new Error(embeddingError.message || 'Failed to generate embeddings');
      }
      // Assuming process-for-rag returns { success: boolean, processedContent?: string, error?: string }
      // And processedContent contains the RAG structure with embeddings
      if (!embeddingData || embeddingData.success === false || !embeddingData.processedContent) {
         const errorMsg = embeddingData?.error || 'Embedding generation failed or returned invalid data';
         logToTerminal(`'process-for-rag' failed: ${errorMsg}`);
         throw new Error(errorMsg);
      }
      // We might need to parse embeddingData.processedContent if we need the embeddings later
      logToTerminal("Embeddings processed successfully (or function call succeeded)");
      updateProcessStatus(2, 'completed');

      // --- Step 4: Store Report in Database ---
      logToTerminal("Step 4 - Storing report in database...");
      setProcessingStep(3); // Mark current step

      // Add RAG enabled flag to the report generated in Step 1
      parsedReport.is_rag_enabled = true;
      logToTerminal(`Adding is_rag_enabled flag: ${parsedReport.is_rag_enabled}`);

      logToTerminal(`Calling 'store-report' function...`);
      const { data: storeData, error: storeError } = await supabase.functions.invoke('store-report', {
        body: parsedReport, // Send the report object generated in Step 1
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (storeError) {
        logToTerminal(`Error from 'store-report': ${storeError.message}`);
        throw new Error(storeError.message || 'Failed to store report');
      }
      // Assuming store-report returns { success: boolean, report?: { id: string }, error?: string }
      if (!storeData || storeData.success === false || !storeData.report || !storeData.report.id) {
        const errorMsg = storeData?.error || 'Storing report failed or returned invalid data';
        logToTerminal(`'store-report' failed: ${errorMsg}`);
        throw new Error(errorMsg);
      }
      logToTerminal(`Report stored successfully with ID: ${storeData.report.id}`);
      updateProcessStatus(3, 'completed');

      // --- Process Complete ---
      setResult({
        documentId: storeData.report.id,
        title: parsedReport.title || 'Processed Document',
        summary: parsedReport.summary || 'No summary available.',
        tags: parsedReport.tags || [],
        chunksProcessed: chunks.length
      });

      toast({
        title: 'Processing Complete',
        description: `Document processed successfully with ${chunks.length} chunks`,
      });

      // Reset the form
      setRawContent('');
      // Keep results displayed, don't call resetProcessing() here
      // resetProcessing(); // Call this explicitly if needed via a button

    } catch (error: any) { // Catch any error from the try block
      console.error('Error processing content:', error);
      updateProcessStatus(processingStep, 'error'); // Mark the step where error occurred
      toast({
        title: 'Processing Error',
        description: error.message || 'An unknown error occurred during processing',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false); // Ensure loading state is always reset
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
