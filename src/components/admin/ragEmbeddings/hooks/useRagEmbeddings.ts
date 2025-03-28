
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useRagEmbeddingsApi } from './useRagEmbeddingsApi';
import { useContentValidation } from './useContentValidation';

export const useRagEmbeddings = () => {
  // State variables
  const [apiKey, setApiKey] = useState('compliance-admin-key-2023');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rawContent, setRawContent] = useState('');
  const [processedContent, setProcessedContent] = useState('');
  const [contentType, setContentType] = useState('compliance');

  // API and validation hooks
  const { processContent, submitContent } = useRagEmbeddingsApi();
  const { isValid, handleContentChange } = useContentValidation();

  // Process content handler
  const handleProcess = async () => {
    try {
      setIsProcessing(true);
      
      const result = await processContent({
        rawContent,
        contentType
      });
      
      setProcessedContent(result);
      handleContentChange(result);
      
      toast({
        title: 'Content Processed',
        description: contentType === 'competitive-intel' 
          ? 'Competitive intelligence data has been extracted' 
          : 'Raw content has been processed for RAG embeddings',
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

  // Submit content handler
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      await submitContent({
        apiKey,
        processedContent,
        contentType
      });
      
      toast({
        title: 'Success!',
        description: contentType === 'competitive-intel'
          ? 'Competitive intelligence data has been saved to the database'
          : 'Content has been processed and added to the RAG database',
        variant: 'default',
      });
      
      // Clear content after successful submission
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

  // Content change handler that delegates to the validation hook
  const onContentChange = (newValue: string) => {
    setProcessedContent(newValue);
    handleContentChange(newValue);
  };

  return {
    apiKey,
    setApiKey,
    rawContent,
    setRawContent,
    processedContent,
    contentType,
    setContentType,
    isProcessing,
    isSubmitting,
    isValid,
    handleProcess,
    handleContentChange: onContentChange,
    handleSubmit
  };
};
