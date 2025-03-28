
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReportGeneration } from './hooks/useReportGeneration';
import PromptTab from './PromptTab';
import ResultTab from './ResultTab';

const AdminAIReportGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('prompt');
  
  const {
    apiKey,
    setApiKey,
    geminiApiKey,
    setGeminiApiKey,
    prompt,
    setPrompt,
    generatedReport,
    isGenerating,
    isSubmitting,
    isValid,
    handleGenerate,
    handleReportChange,
    handleSubmit
  } = useReportGeneration({ setActiveTab });

  return (
    <Card className="w-full mx-auto bg-cyber-dark border-cyber-blue/30">
      <CardHeader>
        <CardTitle className="text-2xl text-cyber-light">Report Transformation</CardTitle>
        <CardDescription className="text-cyber-light/70">
          Transform raw reports into structured JSON format for website publication
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-cyber-slate">
            <TabsTrigger value="prompt" className="data-[state=active]:bg-cyber-blue">Transform Report</TabsTrigger>
            <TabsTrigger value="result" className="data-[state=active]:bg-cyber-blue" disabled={!generatedReport}>Result</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prompt">
            <PromptTab
              geminiApiKey={geminiApiKey}
              setGeminiApiKey={setGeminiApiKey}
              prompt={prompt}
              setPrompt={setPrompt}
              isGenerating={isGenerating}
              onGenerate={handleGenerate}
            />
          </TabsContent>
          
          <TabsContent value="result">
            <ResultTab
              apiKey={apiKey}
              setApiKey={setApiKey}
              generatedReport={generatedReport}
              onReportChange={handleReportChange}
              isSubmitting={isSubmitting}
              isValid={isValid}
              onSubmit={handleSubmit}
              onBack={() => setActiveTab('prompt')}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminAIReportGenerator;
