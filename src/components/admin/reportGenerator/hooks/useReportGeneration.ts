
import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface UseReportGenerationProps {
  setActiveTab: (tab: string) => void;
}

export const useReportGeneration = ({ setActiveTab }: UseReportGenerationProps) => {
  const [apiKey, setApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    // Try to get stored key from sessionStorage
    return sessionStorage.getItem('geminiApiKey') || '';
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generatedReport, setGeneratedReport] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isKeyValidated, setIsKeyValidated] = useState(false);

  const validateGeminiApiKey = useCallback(async (key: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: "Respond with only the word 'valid'" }]
          }]
        }),
      });
      
      if (!response.ok) {
        setIsKeyValidated(false);
        return false;
      }
      
      const data = await response.json();
      const isValid = !!data.candidates;
      setIsKeyValidated(isValid);
      return isValid;
    } catch (error) {
      console.error('Error validating Gemini API key:', error);
      setIsKeyValidated(false);
      return false;
    }
  }, []);

  // Validate the API key when it changes
  useEffect(() => {
    if (geminiApiKey) {
      validateGeminiApiKey(geminiApiKey);
    } else {
      setIsKeyValidated(false);
    }
  }, [geminiApiKey, validateGeminiApiKey]);

  const handleGenerate = async () => {
    if (!geminiApiKey.trim() || !isKeyValidated) {
      toast({
        title: 'Gemini API Key Required',
        description: 'Please enter a valid Gemini API key for this session',
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
      
      // Save valid key to sessionStorage
      sessionStorage.setItem('geminiApiKey', geminiApiKey);
      
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          geminiApiKey,
          prompt
        }
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to generate report');
      }
      
      if (!data || data.success === false) {
        throw new Error(data?.error || 'Failed to generate report');
      }
      
      setGeneratedReport(data.reportJson);
      setIsValid(true);
      setActiveTab('result');
      
      toast({
        title: 'Report Transformed',
        description: 'AI has transformed your content into a structured report format',
      });
      
    } catch (error: any) {
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
      if (newValue.trim()) {
        JSON.parse(newValue);
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    } catch (e) {
      setIsValid(false);
    }
  };

  const handleSubmit = async () => {
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
