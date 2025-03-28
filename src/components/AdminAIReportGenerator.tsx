
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';

const AdminAIReportGenerator: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedReport, setGeneratedReport] = useState('');

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
        title: 'Prompt Required',
        description: 'Please enter a detailed prompt for the AI to generate a report',
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
      
      toast({
        title: 'Report Generated',
        description: 'AI has generated a report based on your prompt',
      });
      
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Generation Error',
        description: error.message || 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
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
        description: 'AI-generated report has been added to the database',
      });
      
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
    <Card className="w-full max-w-4xl mx-auto bg-background/80 backdrop-blur-sm border-cyber-blue/30">
      <CardHeader>
        <CardTitle className="text-2xl text-cyber-light">AI-Assisted Report Generation</CardTitle>
        <CardDescription className="text-cyber-light/70">
          Use AI to generate compliance reports based on your prompts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
              Prompt for AI Report Generation
            </label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the compliance report you want to generate (e.g. 'Create a detailed report about GDPR compliance challenges for healthcare providers in Germany')"
              className="w-full min-h-[150px]"
            />
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
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Report with AI
              </>
            )}
          </Button>
          
          <Separator />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <label htmlFor="generatedReport" className="block text-sm font-medium text-cyber-light">
                  Generated Report JSON
                </label>
              </div>
              <Textarea
                id="generatedReport"
                value={generatedReport}
                onChange={(e) => setGeneratedReport(e.target.value)}
                placeholder="AI-generated report will appear here"
                className="w-full min-h-[300px] font-mono text-sm"
              />
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
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !generatedReport}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Generated Report'}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAIReportGenerator;
