
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { logToTerminal } from '@/utils/terminalLogger';
import { getAuthToken } from '@/utils/authUtils';
import { supabase } from '@/integrations/supabase/client';

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
      logToTerminal(`Error: Admin API key required for report submission`);
      return;
    }

    if (!generatedReport.trim()) {
      toast({
        title: 'No Report to Submit',
        description: 'Please generate a report first',
        variant: 'destructive',
      });
      logToTerminal(`Error: No report to submit`);
      return;
    }

    if (!isValid) {
      toast({
        title: 'Invalid JSON',
        description: 'The report contains invalid JSON. Please fix it before submitting.',
        variant: 'destructive',
      });
      logToTerminal(`Error: Invalid JSON in report`);
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
        logToTerminal(`Error: Authentication required for report submission`);
        return;
      }

      setIsSubmitting(true);
      logToTerminal(`Submitting generated report to database...`);

      // Parse the JSON input
      const reportData = JSON.parse(generatedReport);

      // Use supabase.functions.invoke
      const { data: result, error } = await supabase.functions.invoke('admin-reports', { // Assuming function name matches route
        body: reportData,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Admin-Key': apiKey // Pass Admin-Key if required by the function
        }
      });

      if (error) {
        logToTerminal(`Error submitting report: ${error.message}`);
        throw new Error(error.message || 'Failed to submit report');
      }

      // Check for application-level errors if the function returns a success flag
      // Note: Adjust this check based on the actual return structure of 'admin-reports'
      if (!result || result.success === false) {
         const errorMsg = result?.error || 'Report submission failed';
         logToTerminal(`Report submission failed: ${errorMsg}`);
         throw new Error(errorMsg);
      }

      logToTerminal(`Report successfully submitted to database`);

      toast({
        title: 'Success!',
        description: 'Transformed report has been added to the database',
      });
      
      // Clear generated report after successful submission
      setActiveTab('prompt');
      
      return true;
    } catch (error: any) { // Add type annotation
      console.error('Error submitting report:', error);
      logToTerminal(`Error submitting report: ${error.message}`);
      toast({
        title: 'Submission Error', // More specific title
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
