
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Database, FileCheck, FileWarning } from 'lucide-react';

const AdminRagEmbeddings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rawContent, setRawContent] = useState('');
  const [processedContent, setProcessedContent] = useState('');
  const [isValid, setIsValid] = useState(false);

  const handleProcess = async () => {
    if (!geminiApiKey.trim()) {
      toast({
        title: 'Gemini API Key Required',
        description: 'Please enter your Gemini API key for this session',
        variant: 'destructive',
      });
      return;
    }

    if (!rawContent.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please enter the raw report content to process for RAG embeddings',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      const response = await fetch('/api/process-for-rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          geminiApiKey,
          content: rawContent
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to process content for RAG');
      }
      
      setProcessedContent(result.processedContent);
      setIsValid(true);
      
      toast({
        title: 'Content Processed',
        description: 'Raw content has been processed for RAG embeddings',
      });
      
    } catch (error) {
      console.error('Error processing content:', error);
      toast({
        title: 'Processing Error',
        description: error.message || 'Failed to process content',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContentChange = (newValue: string) => {
    setProcessedContent(newValue);
    // Check if the processed content is valid JSON
    try {
      JSON.parse(newValue);
      setIsValid(true);
    } catch (e) {
      setIsValid(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: 'Admin API Key Required',
        description: 'Please enter your admin API key',
        variant: 'destructive',
      });
      return;
    }

    if (!processedContent.trim()) {
      toast({
        title: 'No Content to Submit',
        description: 'Please process the raw content first',
        variant: 'destructive',
      });
      return;
    }

    if (!isValid) {
      toast({
        title: 'Invalid JSON',
        description: 'The processed content contains invalid JSON. Please fix it before submitting.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Parse the JSON input
      const contentData = JSON.parse(processedContent);
      
      // Submit the processed content for RAG embeddings
      const response = await fetch('/api/admin-rag-embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Admin-Key': apiKey,
        },
        body: JSON.stringify(contentData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit RAG embeddings');
      }
      
      toast({
        title: 'Success!',
        description: 'Content has been processed and added to the RAG database',
      });
      
      // Clear processed content after successful submission
      setProcessedContent('');
      setRawContent('');
      
    } catch (error) {
      console.error('Error submitting content:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit content',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full mx-auto bg-background/80 backdrop-blur-sm border-cyber-blue/30">
      <CardHeader>
        <CardTitle className="text-2xl text-cyber-light">RAG Embeddings Generator</CardTitle>
        <CardDescription className="text-cyber-light/70">
          Process raw reports into structured JSON for RAG vector embeddings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label htmlFor="geminiApiKey" className="block text-sm font-medium text-cyber-light mb-1">
            Gemini API Key (Session Only)
          </label>
          <Input
            id="geminiApiKey"
            type="password"
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            placeholder="Enter your Gemini API key for this session only"
            className="w-full"
          />
          <p className="text-xs text-cyber-light/70 mt-1">
            This key is only stored in your browser for this session and is not saved to our database.
          </p>
        </div>
        
        <div>
          <label htmlFor="rawContent" className="block text-sm font-medium text-cyber-light mb-1">
            Raw Report Content
          </label>
          <Textarea
            id="rawContent"
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            placeholder="Paste the raw report content to be processed for RAG embeddings"
            className="w-full min-h-[200px]"
          />
        </div>
        
        <Button 
          type="button" 
          onClick={handleProcess}
          className="w-full" 
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Process for RAG Embeddings
            </>
          )}
        </Button>
        
        {processedContent && (
          <>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="processedContent" className="block text-sm font-medium text-cyber-light">
                  Processed Content JSON
                </label>
                <div className="flex items-center">
                  {isValid ? (
                    <FileCheck className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <FileWarning className="h-4 w-4 text-yellow-500 mr-1" />
                  )}
                  <span className={`text-xs ${isValid ? 'text-green-500' : 'text-yellow-500'}`}>
                    {isValid ? 'Valid JSON' : 'Invalid JSON'}
                  </span>
                </div>
              </div>
              <Textarea
                id="processedContent"
                value={processedContent}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Processed content for RAG embeddings will appear here"
                className="w-full min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-cyber-light/70 mt-1">
                You can edit the processed JSON if needed before submitting.
              </p>
            </div>
            
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-cyber-light mb-1">
                Admin API Key
              </label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your admin API key to submit this content"
                className="w-full"
              />
            </div>
            
            <Button 
              type="button" 
              className="w-full" 
              disabled={isSubmitting || !isValid}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit for RAG Embeddings'
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminRagEmbeddings;
