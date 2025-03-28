
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Database, AlertCircle } from 'lucide-react';
import ApiKeyInput from '../shared/ApiKeyInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RawContentFormProps {
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  rawContent: string;
  setRawContent: (content: string) => void;
  contentType: string;
  setContentType: (type: string) => void;
  isProcessing: boolean;
  onProcess: () => void;
  validateGeminiApiKey?: (key: string) => Promise<boolean>;
}

const RawContentForm: React.FC<RawContentFormProps> = ({
  geminiApiKey,
  setGeminiApiKey,
  rawContent,
  setRawContent,
  contentType,
  setContentType,
  isProcessing,
  onProcess,
  validateGeminiApiKey
}) => {
  return (
    <div className="space-y-6 text-cyber-light">
      <Alert className="bg-cyber-dark border-cyber-blue">
        <AlertCircle className="h-4 w-4 text-cyber-blue" />
        <AlertDescription className="text-cyber-light">
          You'll need a Gemini API key to process content. You can get one from the{' '}
          <a 
            href="https://ai.google.dev/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyber-blue underline hover:text-cyber-blue/80"
          >
            Google AI Developer Portal
          </a>
        </AlertDescription>
      </Alert>
      
      <ApiKeyInput
        value={geminiApiKey}
        onChange={setGeminiApiKey}
        label="Gemini API Key (Session Only)"
        placeholder="Enter your Gemini API key for this session only"
        description="This key is only stored in your browser for this session and is not saved to our database."
        validateKey={validateGeminiApiKey}
      />
      
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
          </SelectContent>
        </Select>
        <p className="text-xs text-cyber-light/70 mt-1">
          Select the type of content you're processing to use the appropriate AI model.
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
          placeholder={contentType === 'competitive-intel' 
            ? "Paste the competitive intelligence report to extract structured data about multiple competitors"
            : "Paste the raw compliance report content to be processed for RAG embeddings"
          }
          className="w-full min-h-[200px] bg-cyber-slate border-cyber-blue/30 text-cyber-light"
        />
      </div>
      
      <Button 
        type="button" 
        onClick={onProcess}
        className="w-full bg-cyber-blue hover:bg-cyber-blue/80" 
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
            {contentType === 'competitive-intel' 
              ? 'Extract Competitive Intelligence' 
              : 'Process for RAG Embeddings'
            }
          </>
        )}
      </Button>
    </div>
  );
};

export default RawContentForm;
