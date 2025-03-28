
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRagEmbeddings } from './hooks/useRagEmbeddings';
import RawContentForm from './RawContentForm';
import ProcessedContentForm from './ProcessedContentForm';

const AdminRagEmbeddings: React.FC = () => {
  const {
    apiKey,
    setApiKey,
    geminiApiKey,
    setGeminiApiKey,
    rawContent,
    setRawContent,
    processedContent,
    isProcessing,
    isSubmitting,
    isValid,
    handleProcess,
    handleContentChange,
    handleSubmit
  } = useRagEmbeddings();

  return (
    <Card className="w-full mx-auto bg-background/80 backdrop-blur-sm border-cyber-blue/30">
      <CardHeader>
        <CardTitle className="text-2xl text-cyber-light">RAG Embeddings Generator</CardTitle>
        <CardDescription className="text-cyber-light/70">
          Process raw reports into structured JSON for RAG vector embeddings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RawContentForm
          geminiApiKey={geminiApiKey}
          setGeminiApiKey={setGeminiApiKey}
          rawContent={rawContent}
          setRawContent={setRawContent}
          isProcessing={isProcessing}
          onProcess={handleProcess}
        />
        
        {processedContent && (
          <ProcessedContentForm
            apiKey={apiKey}
            setApiKey={setApiKey}
            processedContent={processedContent}
            onContentChange={handleContentChange}
            isSubmitting={isSubmitting}
            isValid={isValid}
            onSubmit={handleSubmit}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AdminRagEmbeddings;
