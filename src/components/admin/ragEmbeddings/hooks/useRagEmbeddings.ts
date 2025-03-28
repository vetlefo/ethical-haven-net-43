
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export const useRagEmbeddings = () => {
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
      if (newValue.trim()) {
        JSON.parse(newValue);
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    } catch (e) {
      setIsValid(false);
    }
  };

  const handleSubmit = async () => {
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

  return {
    apiKey,
    setApiKey,
    geminiApiKey, 
    setGeminiApiKey,
    rawContent,
    setRawContent,
    processedContent,
    isProcessing,
    isSubmitting,
    isValid,
    handleProcess,
    handleContentChange,
    handleSubmit
  };
};
