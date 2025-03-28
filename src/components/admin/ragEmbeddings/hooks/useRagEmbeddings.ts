
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TerminalStore } from '@/pages/Admin';

export const useRagEmbeddings = () => {
  const [apiKey, setApiKey] = useState('compliance-admin-key-2023');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rawContent, setRawContent] = useState('');
  const [processedContent, setProcessedContent] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [contentType, setContentType] = useState('compliance');

  const handleProcess = async () => {
    if (!geminiApiKey.trim()) {
      toast({
        title: 'Gemini API Key Required',
        description: 'Please enter your Gemini API key for this session',
        variant: 'destructive',
      });
      TerminalStore.addLine(`Error: Gemini API key is required for RAG processing`);
      return;
    }

    if (!rawContent.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please enter the raw report content to process',
        variant: 'destructive',
      });
      TerminalStore.addLine(`Error: No content provided for RAG processing`);
      return;
    }

    try {
      setIsProcessing(true);
      TerminalStore.addLine(`Starting ${contentType} content processing for RAG...`);
      
      // Use the Supabase client to invoke the edge function directly
      TerminalStore.addLine(`Calling process-for-rag function...`);
      const { data, error } = await supabase.functions.invoke('process-for-rag', {
        body: {
          geminiApiKey,
          content: rawContent,
          contentType
        }
      });
      
      if (error) {
        console.error('Error from Supabase function:', error);
        TerminalStore.addLine(`Error from Supabase function: ${error.message}`);
        throw new Error(error.message || 'Failed to process content');
      }
      
      if (!data) {
        TerminalStore.addLine(`Error: No data returned from the RAG processing function`);
        throw new Error('No data returned from the function');
      }
      
      if (!data.processedContent) {
        TerminalStore.addLine(`Error: Response is missing processedContent field`);
        throw new Error('Response is missing processedContent field');
      }
      
      setProcessedContent(data.processedContent);
      setIsValid(true);
      
      // Log what's in the processed content
      try {
        const contentData = JSON.parse(data.processedContent);
        if (Array.isArray(contentData)) {
          TerminalStore.addLine(`Processed ${contentData.length} items ready for database insertion`);
        } else {
          TerminalStore.addLine(`Generated a document with ID: ${contentData.document_id || 'unknown'}`);
        }
        TerminalStore.addLine(`RAG processing completed successfully`);
      } catch (e) {
        TerminalStore.addLine(`Warning: Could not parse processed content as JSON`);
      }
      
      toast({
        title: 'Content Processed',
        description: contentType === 'competitive-intel' 
          ? 'Competitive intelligence data has been extracted' 
          : 'Raw content has been processed for RAG embeddings',
      });
      
    } catch (error) {
      console.error('Error processing content:', error);
      TerminalStore.addLine(`Error processing content: ${error.message}`);
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
      TerminalStore.addLine(`Error: Admin API key is required for submission`);
      return;
    }

    if (!processedContent.trim()) {
      toast({
        title: 'No Content to Submit',
        description: 'Please process the raw content first',
        variant: 'destructive',
      });
      TerminalStore.addLine(`Error: No processed content to submit`);
      return;
    }

    if (!isValid) {
      toast({
        title: 'Invalid JSON',
        description: 'The processed content contains invalid JSON. Please fix it before submitting.',
        variant: 'destructive',
      });
      TerminalStore.addLine(`Error: Invalid JSON in processed content`);
      return;
    }

    try {
      setIsSubmitting(true);
      TerminalStore.addLine(`Submitting processed ${contentType} content to database...`);
      
      // Parse the JSON input
      const contentData = JSON.parse(processedContent);
      
      // Determine the endpoint and invoke the appropriate function
      if (contentType === 'competitive-intel') {
        TerminalStore.addLine(`Using admin-competitive-intel function...`);
        const { data, error } = await supabase.functions.invoke('admin-competitive-intel', {
          body: contentData,
          headers: {
            'Admin-Key': apiKey,
          }
        });
        
        if (error) {
          throw new Error(error.message || 'Failed to submit competitive intel data');
        }
        
        // Log the response from the function
        if (data) {
          TerminalStore.addLine(`Database response: ${JSON.stringify(data)}`);
        }
      } else {
        // For RAG embeddings
        TerminalStore.addLine(`Using admin-rag-embeddings function...`);
        const { data, error } = await supabase.functions.invoke('admin-rag-embeddings', {
          body: contentData,
          headers: {
            'Admin-Key': apiKey,
          }
        });
        
        if (error) {
          throw new Error(error.message || 'Failed to submit RAG embeddings');
        }
        
        // Log the response from the function
        if (data) {
          TerminalStore.addLine(`Database response: ${JSON.stringify(data)}`);
        }
      }
      
      TerminalStore.addLine(`Content successfully saved to database`);
      TerminalStore.addLine(`You can now query this data using the search endpoint`);
      
      toast({
        title: 'Success!',
        description: contentType === 'competitive-intel'
          ? 'Competitive intelligence data has been saved to the database'
          : 'Content has been processed and added to the RAG database',
        variant: 'default',
      });
      
      // Clear processed content after successful submission
      setProcessedContent('');
      setRawContent('');
      
    } catch (error) {
      console.error('Error submitting content:', error);
      TerminalStore.addLine(`Error submitting content: ${error.message}`);
      TerminalStore.addLine(`Check that your admin API key is correct and the database is accessible`);
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
    contentType,
    setContentType,
    isProcessing,
    isSubmitting,
    isValid,
    handleProcess,
    handleContentChange,
    handleSubmit
  };
};
