
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Database, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RawContentFormProps {
  rawContent: string;
  setRawContent: (content: string) => void;
  contentType: string;
  setContentType: (type: string) => void;
  isProcessing: boolean;
  onProcess: () => void;
}

const RawContentForm: React.FC<RawContentFormProps> = ({
  rawContent,
  setRawContent,
  contentType,
  setContentType,
  isProcessing,
  onProcess
}) => {
  return (
    <div className="space-y-6 text-cyber-light">
      <Alert className="bg-cyber-dark border-cyber-blue">
        <AlertCircle className="h-4 w-4 text-cyber-blue" />
        <AlertDescription className="text-cyber-light">
          The Gemini API key is configured in your Supabase environment. You can proceed with processing content.
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
