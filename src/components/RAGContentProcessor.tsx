
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Steps, Step } from '@/components/admin/unifiedWorkflow/Steps';
import { ProcessStatus } from '@/components/admin/unifiedWorkflow/Steps';

const RAGContentProcessor: React.FC = () => {
  // State for the UI
  const [rawContent, setRawContent] = useState('');
  const [contentType, setContentType] = useState('compliance');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [processingStep, setProcessingStep] = useState(0);
  const [processStatus, setProcessStatus] = useState<ProcessStatus[]>(['waiting', 'waiting', 'waiting', 'waiting']);
  const [result, setResult] = useState<any>(null);

  // Handle the content processing
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
      console.log("Step 1: Processing with Gemini...");
      const authToken = await supabase.auth.getSession().then(res => res.data.session?.access_token || '');
      if (!authToken) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const { data: transformData, error: transformError } = await supabase.functions.invoke('generate-report', {
        body: {
          content: rawContent,
          contentType
        },
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });
      
      if (transformError) {
        throw new Error(`Gemini processing error: ${transformError.message}`);
      }
      
      if (!transformData || !transformData.reportJson) {
        throw new Error('No data returned from the processing service');
      }
      
      // Parse the report JSON
      let parsedReport;
      try {
        parsedReport = JSON.parse(transformData.reportJson);
        console.log("Successfully parsed report JSON:", parsedReport.title);
      } catch (e) {
        console.error("Error parsing report JSON:", e);
        console.log("Raw report JSON:", transformData.reportJson.substring(0, 100) + "...");
        throw new Error(`Failed to parse report JSON: ${e.message}`);
      }
      
      setProcessStatus(['completed', 'processing', 'waiting', 'waiting']);
      setProcessingStep(1);
      setCurrentStep(2);

      // Step 2: Chunk the content
      console.log("Step 2: Chunking content...");
      const paragraphs = rawContent.split(/\n\s*\n/);
      const chunks = paragraphs.map((p, i) => ({
        text: p.trim(),
        position: i,
        chunkId: `chunk-${i + 1}`
      })).filter(chunk => chunk.text.length > 0);
      
      console.log(`Created ${chunks.length} chunks from content`);
      
      setProcessStatus(['completed', 'completed', 'processing', 'waiting']);
      setProcessingStep(2);
      setCurrentStep(3);

      // Step 3: Generate embeddings
      console.log("Step 3: Generating embeddings...");
      const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('process-for-rag', {
        body: {
          content: JSON.stringify(chunks),
          contentType,
          generateEmbeddings: true
        },
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });
      
      if (embeddingError) {
        console.warn("Warning: Embedding generation error:", embeddingError);
        // Continue with the process even if embeddings fail
      }
      
      console.log("Embeddings processed");
      
      setProcessStatus(['completed', 'completed', 'completed', 'processing']);
      setProcessingStep(3);
      setCurrentStep(4);

      // Step 4: Store everything in the database - add RAG flag
      console.log("Step 4: Storing in database...");
      parsedReport.is_rag_enabled = true;
      
      const { data: storeData, error: storeError } = await supabase.functions.invoke('store-report', {
        body: parsedReport,
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });
      
      if (storeError) {
        throw new Error(`Database storage error: ${storeError.message}`);
      }
      
      if (!storeData || !storeData.report) {
        throw new Error('Failed to store report in database');
      }
      
      console.log("Report stored successfully:", storeData.report.id);
      setProcessStatus(['completed', 'completed', 'completed', 'completed']);

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
      setCurrentStep(0);
      
    } catch (error) {
      console.error('Error processing content:', error);
      
      // Update the status to show where the error occurred
      const newStatus = [...processStatus];
      newStatus[processingStep] = 'error';
      setProcessStatus(newStatus);
      
      toast({
        title: 'Processing Error',
        description: error.message || 'Failed to process content',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full mx-auto bg-black/90 border-cyber-blue/30">
      <CardHeader>
        <CardTitle className="text-2xl text-cyber-light">RAG Content Processor</CardTitle>
        <CardDescription className="text-cyber-light/70">
          Transform raw content with AI, generate embeddings, and store in the knowledge base
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-cyber-light">
        <Alert className="bg-cyber-dark border-cyber-blue">
          <AlertCircle className="h-4 w-4 text-cyber-blue" />
          <AlertDescription className="text-cyber-light">
            All processing is done securely with your admin credentials. This creates a RAG-enabled report that will be stored in your database.
          </AlertDescription>
        </Alert>
        
        <div>
          <label htmlFor="contentType" className="block text-sm font-medium text-cyber-light mb-1">
            Content Type
          </label>
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger className="w-full bg-cyber-slate border-cyber-blue/30">
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent className="bg-cyber-slate text-cyber-light">
              <SelectItem value="compliance">Compliance Report</SelectItem>
              <SelectItem value="competitive-intel">Competitive Intelligence</SelectItem>
              <SelectItem value="general">General Content</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-cyber-light/70 mt-1">
            Select the type of content to apply the appropriate processing model and schema.
          </p>
        </div>
        
        <div>
          <label htmlFor="rawContent" className="block text-sm font-medium text-cyber-light mb-1">
            Raw Content
          </label>
          <Textarea
            id="rawContent"
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            placeholder="Paste the raw content to be processed with Gemini, transformed into a structured format, and prepared for RAG"
            className="w-full min-h-[300px] bg-cyber-slate border-cyber-blue/30 text-cyber-light"
          />
        </div>
        
        <Steps currentStep={currentStep}>
          <Step 
            title="AI Processing" 
            description="Process content with Gemini to extract structured data" 
            status={processStatus[0]}
          />
          <Step 
            title="Content Chunking" 
            description="Split content into manageable chunks for embedding" 
            status={processStatus[1]}
          />
          <Step 
            title="Generate Embeddings" 
            description="Create vector embeddings for each content chunk" 
            status={processStatus[2]}
          />
          <Step 
            title="Database Storage" 
            description="Store processed content and embeddings in database" 
            status={processStatus[3]}
          />
        </Steps>
        
        {result && (
          <Alert className="bg-cyber-dark border-green-500/30 mt-4">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-cyber-light">
              <div className="font-medium">Processing Complete</div>
              <div className="text-sm mt-1">
                Document ID: {result.documentId}<br />
                Title: {result.title}<br />
                Chunks Processed: {result.chunksProcessed}<br />
                Tags: {result.tags?.join(', ')}
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          type="button" 
          onClick={handleProcess}
          className="w-full bg-cyber-blue hover:bg-cyber-blue/80" 
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {processingStep === 0 && "Processing with Gemini..."}
              {processingStep === 1 && "Chunking Content..."}
              {processingStep === 2 && "Generating Embeddings..."}
              {processingStep === 3 && "Storing in Database..."}
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Process Content
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RAGContentProcessor;
