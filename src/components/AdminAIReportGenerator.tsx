
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/hooks/use-toast';
import { Loader2, Sparkles, FileCheck, FileWarning } from 'lucide-react';

const AdminAIReportGenerator: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedReport, setGeneratedReport] = useState('');
  const [activeTab, setActiveTab] = useState('prompt');
  const [isValid, setIsValid] = useState(false);

  const handleGenerate = async () => {
    if (!geminiApiKey.trim()) {
      toast({
        title: 'Gemini API Key Required',
        description: 'Please enter your Gemini API key for this session',
        variant: 'destructive',
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please enter a detailed prompt or paste the raw report content to transform',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsGenerating(true);
      
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          geminiApiKey,
          prompt
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate report');
      }
      
      setGeneratedReport(result.reportJson);
      setIsValid(true);
      setActiveTab('result');
      
      toast({
        title: 'Report Transformed',
        description: 'AI has transformed your content into a structured report format',
      });
      
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Transformation Error',
        description: error.message || 'Failed to transform report',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReportChange = (newValue: string) => {
    setGeneratedReport(newValue);
    // Check if the report is valid JSON
    try {
      JSON.parse(newValue);
      setIsValid(true);
    } catch (e) {
      setIsValid(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: 'Admin API Key Required',
        description: 'Please enter your admin API key',
        variant: 'destructive',
      });
      return;
    }

    if (!generatedReport.trim()) {
      toast({
        title: 'No Report to Submit',
        description: 'Please generate a report first',
        variant: 'destructive',
      });
      return;
    }

    if (!isValid) {
      toast({
        title: 'Invalid JSON',
        description: 'The report contains invalid JSON. Please fix it before submitting.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Parse the JSON input
      const reportData = JSON.parse(generatedReport);
      
      // Create URL for the Supabase Edge Function
      const response = await fetch('/api/admin-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Admin-Key': apiKey,
        },
        body: JSON.stringify(reportData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit report');
      }
      
      toast({
        title: 'Success!',
        description: 'Transformed report has been added to the database',
      });
      
      // Clear generated report after successful submission
      setGeneratedReport('');
      setActiveTab('prompt');
      
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit report',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full mx-auto bg-background/80 backdrop-blur-sm border-cyber-blue/30">
      <CardHeader>
        <CardTitle className="text-2xl text-cyber-light">Report Transformation</CardTitle>
        <CardDescription className="text-cyber-light/70">
          Transform raw reports into structured JSON format for website publication
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="prompt">Transform Report</TabsTrigger>
            <TabsTrigger value="result" disabled={!generatedReport}>Result</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prompt" className="space-y-6">
            <div>
              <label htmlFor="geminiApiKey" className="block text-sm font-medium text-cyber-light mb-1">
                Gemini API Key (Session Only)
              </label>
              <Input
                id="geminiApiKey"
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Enter your Gemini API key for this session only"
                className="w-full"
              />
              <p className="text-xs text-cyber-light/70 mt-1">
                This key is only stored in your browser for this session and is not saved to our database.
              </p>
            </div>
            
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
              onClick={handleGenerate}
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
          </TabsContent>
          
          <TabsContent value="result" className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="generatedReport" className="block text-sm font-medium text-cyber-light">
                  Transformed Report JSON
                </label>
                <div className="flex items-center">
                  {isValid ? (
                    <FileCheck className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <FileWarning className="h-4 w-4 text-yellow-500 mr-1" />
                  )}
                  <span className={`text-xs ${isValid ? 'text-green-500' : 'text-yellow-500'}`}>
                    {isValid ? 'Valid JSON' : 'Invalid JSON'}
                  </span>
                </div>
              </div>
              <Textarea
                id="generatedReport"
                value={generatedReport}
                onChange={(e) => handleReportChange(e.target.value)}
                placeholder="Transformed report will appear here"
                className="w-full min-h-[300px] font-mono text-sm"
              />
              <p className="text-xs text-cyber-light/70 mt-1">
                You can edit the transformed JSON if needed before submitting to the website.
              </p>
            </div>
            
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-cyber-light mb-1">
                Admin API Key
              </label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your admin API key to submit this report"
                className="w-full"
              />
            </div>
            
            <div className="flex space-x-4">
              <Button 
                type="button" 
                variant="outline"
                className="w-1/2" 
                onClick={() => setActiveTab('prompt')}
              >
                Back to Content
              </Button>
              
              <Button 
                type="button" 
                className="w-1/2" 
                disabled={isSubmitting || !isValid}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Publish to Website'
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminAIReportGenerator;
