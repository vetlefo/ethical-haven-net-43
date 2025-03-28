
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import ApiKeyInput from '../shared/ApiKeyInput';

interface PromptTabProps {
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

const PromptTab: React.FC<PromptTabProps> = ({
  geminiApiKey,
  setGeminiApiKey,
  prompt,
  setPrompt,
  isGenerating,
  onGenerate
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
        <label htmlFor="prompt" className="block text-sm font-medium text-cyber-light mb-1">
          Raw Report Content or Transformation Prompt
        </label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Paste your raw report content to be transformed into structured JSON, or provide a detailed prompt (e.g., 'Transform this GDPR compliance report for German healthcare providers...')"
          className="w-full min-h-[300px]"
        />
        <p className="text-xs text-cyber-light/70 mt-1">
          For best results with an existing report, paste the full text. The AI will extract the key information and format it according to our schema.
        </p>
      </div>
      
      <Button 
        type="button" 
        onClick={onGenerate}
        className="w-full" 
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Transforming...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Transform to Structured Format
          </>
        )}
      </Button>
    </div>
  );
};

export default PromptTab;
