
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TerminalStore } from '@/pages/Admin';

interface ProcessContentParams {
  rawContent: string;
  contentType: string;
}

interface SubmitContentParams {
  apiKey: string;
  processedContent: string;
  contentType: string;
}

export const useRagEmbeddingsApi = () => {
  const processContent = async ({ rawContent, contentType }: ProcessContentParams) => {
    if (!rawContent.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please enter the raw report content to process',
        variant: 'destructive',
      });
      TerminalStore.addLine(`Error: No content provided for RAG processing`);
      throw new Error('Content is required');
    }

    TerminalStore.addLine(`Starting ${contentType} content processing for RAG...`);
    TerminalStore.addLine(`Calling process-for-rag function...`);
    
    const { data, error } = await supabase.functions.invoke('process-for-rag', {
      body: {
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
    
    return data.processedContent;
  };

  const submitContent = async ({ apiKey, processedContent, contentType }: SubmitContentParams) => {
    if (!apiKey.trim()) {
      toast({
        title: 'Admin API Key Required',
        description: 'Please enter your admin API key',
        variant: 'destructive',
      });
      TerminalStore.addLine(`Error: Admin API key is required for submission`);
      throw new Error('Admin API key is required');
    }

    if (!processedContent.trim()) {
      toast({
        title: 'No Content to Submit',
        description: 'Please process the raw content first',
        variant: 'destructive',
      });
      TerminalStore.addLine(`Error: No processed content to submit`);
      throw new Error('No processed content');
    }

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
  };

  return {
    processContent,
    submitContent
  };
};
