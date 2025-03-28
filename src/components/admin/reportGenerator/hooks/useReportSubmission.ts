
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { TerminalStore } from '@/pages/Admin';
import { getAuthToken } from '@/utils/authUtils';

export interface UseReportSubmissionProps {
  setActiveTab: (tab: string) => void;
}

export const useReportSubmission = ({ setActiveTab }: UseReportSubmissionProps) => {
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (generatedReport: string, isValid: boolean) => {
    if (!apiKey.trim()) {
      toast({
        title: 'Admin API Key Required',
        description: 'Please enter your admin API key',
        variant: 'destructive',
      });
      TerminalStore.addLine(`Error: Admin API key required for report submission`);
      return;
    }

    if (!generatedReport.trim()) {
      toast({
        title: 'No Report to Submit',
        description: 'Please generate a report first',
        variant: 'destructive',
      });
      TerminalStore.addLine(`Error: No report to submit`);
      return;
    }

    if (!isValid) {
      toast({
        title: 'Invalid JSON',
        description: 'The report contains invalid JSON. Please fix it before submitting.',
        variant: 'destructive',
      });
      TerminalStore.addLine(`Error: Invalid JSON in report`);
      return;
    }

    try {
      // Get authentication token
      const authToken = await getAuthToken();
      if (!authToken) {
        toast({
          title: 'Authentication Required',
          description: 'You must be logged in to submit reports',
          variant: 'destructive',
        });
        TerminalStore.addLine(`Error: Authentication required for report submission`);
        return;
      }

      setIsSubmitting(true);
      TerminalStore.addLine(`Submitting generated report to database...`);
      
      // Parse the JSON input
      const reportData = JSON.parse(generatedReport);
      
      const response = await fetch('/api/admin-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Admin-Key': apiKey,
          'Authorization': `Bearer ${authToken}` // Add auth token
        },
        body: JSON.stringify(reportData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        TerminalStore.addLine(`Error submitting report: ${result.error || 'Unknown error'}`);
        throw new Error(result.error || 'Failed to submit report');
      }
      
      TerminalStore.addLine(`Report successfully submitted to database`);
      
      toast({
        title: 'Success!',
        description: 'Transformed report has been added to the database',
      });
      
      // Clear generated report after successful submission
      setActiveTab('prompt');
      
      return true;
    } catch (error) {
      console.error('Error submitting report:', error);
      TerminalStore.addLine(`Error submitting report: ${error.message}`);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit report',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    apiKey,
    setApiKey,
    isSubmitting,
    handleSubmit
  };
};
