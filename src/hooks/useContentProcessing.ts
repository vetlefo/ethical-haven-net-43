
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

      // Use direct fetch for more reliable calls to Supabase Edge Functions
      const apiUrl = `${supabase.supabaseUrl}/functions/v1/generate-report`;
      const supabaseKey = supabase.supabaseKey;
      
      const generateReportPayload = {
        prompt: rawContent,
        contentType: contentType
      };
      
      logToTerminal(`Calling 'generate-report' function...`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey
        },
        body: JSON.stringify(generateReportPayload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        logToTerminal(`Error from 'generate-report': Status ${response.status}, Response: ${errorText}`);
        throw new Error('Failed to generate initial report structure');
      }
      
      const transformData = await response.json();
      
      if (!transformData || transformData.success === false || !transformData.reportJson) {
        const errorMsg = transformData?.error || 'Report generation service returned invalid data or failed';
        logToTerminal(`'generate-report' failed: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      let parsedReport;
      try {
        parsedReport = JSON.parse(transformData.reportJson);
        
        // Extract title from raw content if this is a comparative analysis
        if (contentType === 'competitive-intel' && rawContent.includes('Comparative Analysis')) {
          const titleMatch = rawContent.match(/# \*\*([^*]+)\*\*/);
          if (titleMatch && titleMatch[1]) {
            parsedReport.title = titleMatch[1].trim();
            logToTerminal(`Using original title from content: "${parsedReport.title}"`);
          }
        }
        
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
      
      const embeddingResponse = await fetch(`${supabase.supabaseUrl}/functions/v1/process-for-rag`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey
        },
        body: JSON.stringify(processRagPayload)
      });
      
      if (!embeddingResponse.ok) {
        const errorText = await embeddingResponse.text();
        logToTerminal(`Error from 'process-for-rag': Status ${embeddingResponse.status}, Response: ${errorText}`);
        throw new Error('Failed to generate embeddings');
      }
      
      const embeddingData = await embeddingResponse.json();
      
      if (!embeddingData || embeddingData.success === false) {
         const errorMsg = embeddingData?.error || 'Embedding generation failed or returned invalid data';
         logToTerminal(`'process-for-rag' failed: ${errorMsg}`);
         throw new Error(errorMsg);
      }
      
      logToTerminal("Embeddings processed successfully");
      updateProcessStatus(2, 'completed');

      // --- Step 4: Store Report in Database ---
      logToTerminal("Step 4 - Storing report in database...");
      setProcessingStep(3); // Mark current step

      // Add RAG enabled flag to the report generated in Step 1
      parsedReport.is_rag_enabled = true;
      logToTerminal(`Adding is_rag_enabled flag: ${parsedReport.is_rag_enabled}`);

      logToTerminal(`Calling 'store-report' function...`);
      
      const storeResponse = await fetch(`${supabase.supabaseUrl}/functions/v1/store-report`, {
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
        logToTerminal(`Error from 'store-report': Status ${storeResponse.status}, Response: ${errorText}`);
        throw new Error('Failed to store report in database');
      }
      
      const storeData = await storeResponse.json();
      
      if (!storeData || storeData.success === false) {
        const errorMsg = storeData?.error || 'Storing report failed or returned invalid data';
        logToTerminal(`'store-report' failed: ${errorMsg}`);
        throw new Error(errorMsg);
      }
      
      logToTerminal(`Report stored successfully with ID: ${storeData.report?.id || 'unknown'}`);
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
