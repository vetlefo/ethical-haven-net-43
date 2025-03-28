
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import ApiKeyInput from '../shared/ApiKeyInput';
import JsonEditor from '../shared/JsonEditor';

interface ProcessedContentFormProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  processedContent: string;
  onContentChange: (content: string) => void;
  isSubmitting: boolean;
  isValid: boolean;
  onSubmit: () => void;
}

const ProcessedContentForm: React.FC<ProcessedContentFormProps> = ({
  apiKey,
  setApiKey,
  processedContent,
  onContentChange,
  isSubmitting,
  isValid,
  onSubmit
}) => {
  return (
    <div className="space-y-6 text-cyber-light">
      <JsonEditor
        value={processedContent}
        onChange={onContentChange}
        label="Processed Content JSON"
        placeholder="Processed content for RAG embeddings will appear here"
        description="You can edit the processed JSON if needed before submitting."
      />
      
      <ApiKeyInput
        value={apiKey}
        onChange={setApiKey}
        label="Admin API Key"
        placeholder="Enter your admin API key to submit this content"
      />
      
      <Button 
        type="button" 
        className="w-full bg-cyber-blue hover:bg-cyber-blue/80" 
        disabled={isSubmitting || !isValid}
        onClick={onSubmit}
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
    </div>
  );
};

export default ProcessedContentForm;
