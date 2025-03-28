
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ApiKeyInput from '../shared/ApiKeyInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useUnifiedWorkflow } from './hooks/useUnifiedWorkflow';
import { Steps, Step } from './Steps';

const UnifiedArticleProcessor: React.FC = () => {
  const {
    apiKey,
    setApiKey,
    rawContent,
    setRawContent,
    contentType,
    setContentType,
    currentStep,
    isProcessing,
    processingStep,
    processStatus,
    handleProcess
  } = useUnifiedWorkflow();

  return (
    <Card className="w-full mx-auto bg-black/90 border-cyber-blue/30">
      <CardHeader>
        <CardTitle className="text-2xl text-cyber-light">Unified Article Processing</CardTitle>
        <CardDescription className="text-cyber-light/70">
          Add new content with a streamlined workflow: transform, process for RAG, and store in one step
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-cyber-light">
        <Alert className="bg-cyber-dark border-cyber-blue">
          <AlertCircle className="h-4 w-4 text-cyber-blue" />
          <AlertDescription className="text-cyber-light">
            Gemini API key is configured in your Supabase environment. You can proceed with content processing.
          </AlertDescription>
        </Alert>
        
        <ApiKeyInput
          value={apiKey}
          onChange={setApiKey}
          label="Admin API Key"
          placeholder="Enter your admin API key"
          description="Required to authenticate admin operations."
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
            Raw Content
          </label>
          <Textarea
            id="rawContent"
            value={rawContent}
            onChange={(e) => setRawContent(e.target.value)}
            placeholder={
              contentType === 'competitive-intel' 
                ? "Paste the competitive intelligence report text to be processed through the entire workflow"
                : "Paste the raw compliance report content to be transformed and processed automatically"
            }
            className="w-full min-h-[200px] bg-cyber-slate border-cyber-blue/30 text-cyber-light"
          />
        </div>
        
        <Steps currentStep={currentStep}>
          <Step 
            title="Transform Content" 
            description="Raw content is transformed into structured format" 
            status={processStatus[0]}
          />
          <Step 
            title="Process for RAG" 
            description="Content is processed into chunks with embeddings" 
            status={processStatus[1]}
          />
          <Step 
            title="Store in Database" 
            description="Processed data is stored in the database" 
            status={processStatus[2]}
          />
        </Steps>
        
        <Button 
          type="button" 
          onClick={handleProcess}
          className="w-full bg-cyber-blue hover:bg-cyber-blue/80" 
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {processingStep === 0 && "Transforming Content..."}
              {processingStep === 1 && "Processing for RAG..."}
              {processingStep === 2 && "Storing in Database..."}
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Process Article
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UnifiedArticleProcessor;
