
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
    contentType,
    setContentType,
    isProcessing,
    isSubmitting,
    isValid,
    handleProcess,
    handleContentChange,
    handleSubmit
  } = useRagEmbeddings();

  return (
    <Card className="w-full mx-auto bg-cyber-dark border-cyber-blue/30">
      <CardHeader>
        <CardTitle className="text-2xl text-cyber-light">RAG and Competitive Intelligence</CardTitle>
        <CardDescription className="text-cyber-light/70">
          Process reports into structured data for RAG embeddings or competitive analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RawContentForm
          geminiApiKey={geminiApiKey}
          setGeminiApiKey={setGeminiApiKey}
          rawContent={rawContent}
          setRawContent={setRawContent}
          contentType={contentType}
          setContentType={setContentType}
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
