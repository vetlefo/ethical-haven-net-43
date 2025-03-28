
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Database } from 'lucide-react';
import ApiKeyInput from '../shared/ApiKeyInput';

interface RawContentFormProps {
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  rawContent: string;
  setRawContent: (content: string) => void;
  isProcessing: boolean;
  onProcess: () => void;
}

const RawContentForm: React.FC<RawContentFormProps> = ({
  geminiApiKey,
  setGeminiApiKey,
  rawContent,
  setRawContent,
  isProcessing,
  onProcess
}) => {
  return (
    <div className="space-y-6">
      <ApiKeyInput
        value={geminiApiKey}
        onChange={setGeminiApiKey}
        label="Gemini API Key (Session Only)"
        placeholder="Enter your Gemini API key for this session only"
        description="This key is only stored in your browser for this session and is not saved to our database."
      />
      
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
        onClick={onProcess}
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
    </div>
  );
};

export default RawContentForm;
