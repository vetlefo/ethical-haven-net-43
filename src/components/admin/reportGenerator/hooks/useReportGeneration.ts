
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logToTerminal } from '@/utils/terminalLogger';
import { useReportSubmission } from './useReportSubmission';

export interface UseReportGenerationProps {
  setActiveTab: (tab: string) => void;
}

export const useReportGeneration = ({ setActiveTab }: UseReportGenerationProps) => {
  // Report state
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedReport, setGeneratedReport] = useState('');
  const [isValid, setIsValid] = useState(false);
  
  // Report submission
  const { 
    apiKey, 
    setApiKey, 
    isSubmitting, 
    handleSubmit: submitReport 
  } = useReportSubmission({ setActiveTab });

  // Generate report using the Gemini API
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please enter a detailed prompt or paste the raw report content to transform',
        variant: 'destructive',
      });
      logToTerminal(`Error: No prompt content provided for report generation`);
      return;
    }

    try {
      setIsGenerating(true);
      logToTerminal(`Starting report generation process...`);
      
      logToTerminal(`Sending request to generate-report function...`);
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          prompt
        }
      });
      
      if (error) {
        logToTerminal(`Error from generate-report function: ${error.message}`);
        throw new Error(error.message || 'Failed to generate report');
      }
      
      if (!data || data.success === false) {
        logToTerminal(`Report generation failed: ${data?.error || 'Unknown error'}`);
        throw new Error(data?.error || 'Failed to generate report');
      }
      
      setGeneratedReport(data.reportJson);
      setIsValid(true);
      setActiveTab('result');
      
      logToTerminal(`Report generation completed successfully`);
      
      toast({
        title: 'Report Transformed',
        description: 'AI has transformed your content into a structured report format',
      });
      
    } catch (error: any) {
      console.error('Error generating report:', error);
      logToTerminal(`Error generating report: ${error.message}`);
      toast({
        title: 'Transformation Error',
        description: error.message || 'Failed to transform report',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Update report and validate JSON
  const handleReportChange = useCallback((newValue: string) => {
    setGeneratedReport(newValue);
    
    // Check if the report is valid JSON
    try {
      if (newValue.trim()) {
        JSON.parse(newValue);
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    } catch (e) {
      setIsValid(false);
    }
  }, []);

  // Submit the generated report
  const handleSubmit = async () => {
    await submitReport(generatedReport, isValid);
    // If submission is successful, clear the report
    setGeneratedReport('');
  };

  return {
    apiKey,
    setApiKey,
    prompt,
    setPrompt,
    generatedReport,
    isGenerating,
    isSubmitting,
    isValid,
    handleGenerate,
    handleReportChange,
    handleSubmit
  };
};
