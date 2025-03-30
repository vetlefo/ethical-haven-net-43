import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import ApiKeyInput from '../shared/ApiKeyInput';
import JsonEditor from '../shared/JsonEditor';
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert
import { Terminal } from 'lucide-react'; // For Alert icon

interface ResultTabProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  generatedReport: string; // Expecting stringified JSON from the previous step
  onReportChange: (report: string) => void;
  isSubmitting: boolean; // For the main "Publish" action
  isValid: boolean; // For the main "Publish" action
  onSubmit: () => void; // Main "Publish" action handler
  onBack: () => void;
}

const ResultTab: React.FC<ResultTabProps> = ({
  apiKey,
  setApiKey,
  generatedReport,
  onReportChange,
  isSubmitting,
  isValid,
  onSubmit,
  onBack
}) => {
  // State for summary generation
  const [summaryJson, setSummaryJson] = useState<any>(null); // Store the generated summary JSON object
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Function to handle summary generation
  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    setSummaryError(null);
    setSummaryJson(null); // Clear previous summary

    if (!generatedReport) {
        setSummaryError("No full report content available to generate summary from.");
        setIsSummaryLoading(false);
        return;
    }

    try {
      // Pass the full report content string directly
      // The backend function will extract text if needed
      const { data, error } = await supabase.functions.invoke('generate-report-summary', {
        // Assuming generatedReport is the string representation of the JSON object
        body: { content: generatedReport }, 
      });

      if (error) {
        throw error; // Throw Supabase function invocation error
      }

      if (data && data.success && data.summary) {
        setSummaryJson(data.summary); // Set the parsed JSON object from the response
      } else {
        // Throw error if backend reported failure or summary is missing
        throw new Error(data?.error || 'Failed to generate summary. Invalid response from server.');
      }
    } catch (err: any) {
      console.error("Error generating summary:", err);
      // Handle potential network errors or errors thrown above
      setSummaryError(err.message || 'An unknown error occurred while generating the summary.');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Determine if the full report JSON string is valid enough to allow summary generation
  // Basic check: not empty and looks like JSON object start
  const canGenerateSummary = generatedReport && generatedReport.trim().startsWith('{');

  return (
    <div className="space-y-6">
      {/* Full Report Editor */}
      <JsonEditor
        value={generatedReport}
        onChange={onReportChange}
        label="Transformed Report JSON"
        placeholder="Transformed report will appear here"
        description="You can edit the transformed JSON if needed before submitting to the website."
      />

      {/* Summary Generation Section */}
      <div className="space-y-4 rounded-md border p-4">
        <h3 className="text-lg font-medium">Generate Summary</h3>
        <p className="text-sm text-muted-foreground">
          Generate a structured summary (including tags, entities, topics, etc.) from the full report content above.
        </p>
        <Button
          type="button"
          onClick={handleGenerateSummary}
          disabled={isSummaryLoading || !canGenerateSummary}
          variant="secondary" // Use secondary variant for less emphasis than primary actions
        >
          {isSummaryLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Summary'
          )}
        </Button>

        {summaryError && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error Generating Summary</AlertTitle>
            <AlertDescription>{summaryError}</AlertDescription>
          </Alert>
        )}

        {summaryJson && (
          <JsonEditor
            value={JSON.stringify(summaryJson, null, 2)} // Display the generated summary object as stringified JSON
            onChange={() => {}} // Make read-only
            readOnly={true} 
            label="Generated Summary JSON"
            placeholder=""
            description="Review the generated summary JSON."
            height="300px" // Adjust height as needed
          />
        )}
      </div>

      {/* API Key and Actions */}
      <ApiKeyInput
        value={apiKey}
        onChange={setApiKey}
        label="Admin API Key (for Publish)"
        placeholder="Enter your admin API key to publish this report"
      />
      
      <div className="flex space-x-4">
        <Button 
          type="button" 
          variant="outline"
          className="w-1/2" 
          onClick={onBack}
          disabled={isSubmitting || isSummaryLoading} // Disable if either action is running
        >
          Back to Content
        </Button>
        
        <Button 
          type="button" 
          className="w-1/2" 
          disabled={isSubmitting || !isValid || isSummaryLoading} // Disable if either action is running or form invalid
          onClick={onSubmit} // Main "Publish" action
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            'Publish Report to Website' // Clarify button action
          )}
        </Button>
      </div>
    </div>
  );
};

export default ResultTab;
