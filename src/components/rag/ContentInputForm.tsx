
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Database } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ContentInputFormProps {
  rawContent: string;
  setRawContent: (content: string) => void;
  contentType: string;
  setContentType: (type: string) => void;
  isProcessing: boolean;
  processingStep: number;
  onProcess: () => void;
}

const ContentInputForm: React.FC<ContentInputFormProps> = ({
  rawContent,
  setRawContent,
  contentType,
  setContentType,
  isProcessing,
  processingStep,
  onProcess
}) => {
  return (
    <div className="space-y-6 text-cyber-light">
      <Alert className="bg-cyber-dark border-cyber-blue">
        <AlertCircle className="h-4 w-4 text-cyber-blue" />
        <AlertDescription className="text-cyber-light">
          All processing is done securely with your admin credentials. This creates a RAG-enabled report that will be stored in your database.
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
          placeholder="Paste the raw content to be processed with Gemini, transformed into a structured format, and prepared for RAG"
          className="w-full min-h-[300px] bg-cyber-slate border-cyber-blue/30 text-cyber-light"
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
    </div>
  );
};

export default ContentInputForm;
