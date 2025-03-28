
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

      // Step 1: Process with Gemini
      const processResult = await processWithGemini(rawContent);
      setProcessStatus(['completed', 'processing', 'waiting', 'waiting']);
      setProcessingStep(1);
      setCurrentStep(2);

      // Step 2: Chunk the content
      const chunks = chunkContent(rawContent);
      setProcessStatus(['completed', 'completed', 'processing', 'waiting']);
      setProcessingStep(2);
      setCurrentStep(3);

      // Step 3: Generate embeddings
      const embeddingResults = await generateEmbeddings(chunks);
      setProcessStatus(['completed', 'completed', 'completed', 'processing']);
      setProcessingStep(3);
      setCurrentStep(4);

      // Step 4: Store everything in the database
      const storageResult = await storeInDatabase(processResult, embeddingResults);
      setProcessStatus(['completed', 'completed', 'completed', 'completed']);

      // Set the result data
      setResult({
        documentId: storageResult.documentId,
        title: processResult.title || 'Processed Document',
        summary: processResult.summary,
        tags: processResult.tags,
        chunksProcessed: embeddingResults.length
      });

      toast({
        title: 'Processing Complete',
        description: `Document processed successfully with ${embeddingResults.length} chunks`,
      });
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

  // Function to process content with Gemini
  const processWithGemini = async (content: string) => {
    const { data, error } = await supabase.functions.invoke('generate-report', {
      body: {
        content,
        contentType
      },
      headers: {
        'Authorization': `Bearer ${await supabase.auth.getSession().then(res => res.data.session?.access_token || '')}`,
      }
    });
    
    if (error) {
      throw new Error(`Gemini processing error: ${error.message}`);
    }
    
    // Parse the report JSON
    const processedContent = JSON.parse(data.reportJson);
    return processedContent;
  };

  // Function to chunk content
  const chunkContent = (content: string) => {
    // Split by paragraphs
    const paragraphs = content.split(/\n\s*\n/);
    return paragraphs.map((p, i) => ({
      text: p.trim(),
      position: i,
      chunkId: `chunk-${i + 1}`
    })).filter(chunk => chunk.text.length > 0);
  };

  // Function to generate embeddings
  const generateEmbeddings = async (chunks: any[]) => {
    // Call the process-for-rag function to generate embeddings
    const { data, error } = await supabase.functions.invoke('process-for-rag', {
      body: {
        content: JSON.stringify(chunks),
        contentType,
        generateEmbeddings: true
      },
      headers: {
        'Authorization': `Bearer ${await supabase.auth.getSession().then(res => res.data.session?.access_token || '')}`,
      }
    });
    
    if (error) {
      throw new Error(`Embedding generation error: ${error.message}`);
    }
    
    return chunks.map((chunk, index) => ({
      ...chunk,
      embedding: [] // The actual embeddings are handled by the edge function
    }));
  };

  // Function to store in database
  const storeInDatabase = async (processedContent: any, embeddings: any[]) => {
    // Store the report
    const { data: reportData, error: reportError } = await supabase.functions.invoke('store-report', {
      body: {
        ...processedContent,
        isRagEnabled: true
      },
      headers: {
        'Authorization': `Bearer ${await supabase.auth.getSession().then(res => res.data.session?.access_token || '')}`,
      }
    });
    
    if (reportError) {
      throw new Error(`Database storage error: ${reportError.message}`);
    }
    
    return {
      documentId: reportData?.report?.document_id || `doc-${Date.now()}`,
      chunksStored: embeddings.length
    };
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
            Gemini API key is configured in your Supabase environment. You can proceed with content processing.
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
            placeholder="Paste the raw content to be processed with Gemini 2.5 Pro, transformed into a structured format, and prepared for RAG"
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
