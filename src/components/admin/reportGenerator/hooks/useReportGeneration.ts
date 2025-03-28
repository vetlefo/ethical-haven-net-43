
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TerminalStore } from '@/pages/Admin';
import { useApiKeyValidation } from './useApiKeyValidation';
import { useReportSubmission } from './useReportSubmission';

export interface UseReportGenerationProps {
  setActiveTab: (tab: string) => void;
}

export const useReportGeneration = ({ setActiveTab }: UseReportGenerationProps) => {
  // Initialize Gemini API key from session storage
  const initialGeminiApiKey = sessionStorage.getItem('geminiApiKey') || '';
  
  // API key validation - specifically for Gemini
  const { 
    apiKey: geminiApiKey, 
    setApiKey: setGeminiApiKey, 
    isKeyValidated,
    validateGeminiApiKey 
  } = useApiKeyValidation(initialGeminiApiKey);
  
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
    if (!geminiApiKey.trim() || !isKeyValidated) {
      toast({
        title: 'Gemini API Key Required',
        description: 'Please enter a valid Gemini API key for this session',
        variant: 'destructive',
      });
      TerminalStore.addLine(`Error: Valid Gemini API key required for report generation`);
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: 'Content Required',
        description: 'Please enter a detailed prompt or paste the raw report content to transform',
        variant: 'destructive',
      });
      TerminalStore.addLine(`Error: No prompt content provided for report generation`);
      return;
    }

    try {
      setIsGenerating(true);
      TerminalStore.addLine(`Starting report generation process...`);
      
      // Save valid key to sessionStorage
      sessionStorage.setItem('geminiApiKey', geminiApiKey);
      
      TerminalStore.addLine(`Sending request to generate-report function...`);
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          geminiApiKey,
          prompt
        }
      });
      
      if (error) {
        TerminalStore.addLine(`Error from generate-report function: ${error.message}`);
        throw new Error(error.message || 'Failed to generate report');
      }
      
      if (!data || data.success === false) {
        TerminalStore.addLine(`Report generation failed: ${data?.error || 'Unknown error'}`);
        throw new Error(data?.error || 'Failed to generate report');
      }
      
      setGeneratedReport(data.reportJson);
      setIsValid(true);
      setActiveTab('result');
      
      TerminalStore.addLine(`Report generation completed successfully`);
      
      toast({
        title: 'Report Transformed',
        description: 'AI has transformed your content into a structured report format',
      });
      
    } catch (error: any) {
      console.error('Error generating report:', error);
      TerminalStore.addLine(`Error generating report: ${error.message}`);
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
    geminiApiKey,
    setGeminiApiKey,
    prompt,
    setPrompt,
    generatedReport,
    isGenerating,
    isSubmitting,
    isValid,
    isKeyValidated,
    handleGenerate,
    handleReportChange,
    handleSubmit,
    validateGeminiApiKey
  };
};
