
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useContentProcessing } from '@/hooks/useContentProcessing';
import ContentInputForm from './rag/ContentInputForm';
import ProcessingSteps from './rag/ProcessingSteps';
import ProcessingResult from './rag/ProcessingResult';

const RAGContentProcessor: React.FC = () => {
  const {
    rawContent,
    setRawContent,
    contentType,
    setContentType,
    isProcessing,
    currentStep,
    processingStep,
    processStatus,
    result,
    handleProcess,
  } = useContentProcessing();

  return (
    <Card className="w-full mx-auto bg-black/90 border-cyber-blue/30">
      <CardHeader>
        <CardTitle className="text-2xl text-cyber-light">RAG Content Processor</CardTitle>
        <CardDescription className="text-cyber-light/70">
          Transform raw content with AI, generate embeddings, and store in the knowledge base
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-cyber-light">
        <ContentInputForm
          rawContent={rawContent}
          setRawContent={setRawContent}
          contentType={contentType}
          setContentType={setContentType}
          isProcessing={isProcessing}
          processingStep={processingStep}
          onProcess={handleProcess}
        />
        
        <ProcessingSteps 
          currentStep={currentStep}
          processStatus={processStatus}
        />
        
        <ProcessingResult result={result} />
      </CardContent>
    </Card>
  );
};

export default RAGContentProcessor;
