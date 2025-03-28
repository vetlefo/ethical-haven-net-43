
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import ApiKeyInput from '../shared/ApiKeyInput';
import JsonEditor from '../shared/JsonEditor';

interface ResultTabProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  generatedReport: string;
  onReportChange: (report: string) => void;
  isSubmitting: boolean;
  isValid: boolean;
  onSubmit: () => void;
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
  return (
    <div className="space-y-6">
      <JsonEditor
        value={generatedReport}
        onChange={onReportChange}
        label="Transformed Report JSON"
        placeholder="Transformed report will appear here"
        description="You can edit the transformed JSON if needed before submitting to the website."
      />
      
      <ApiKeyInput
        value={apiKey}
        onChange={setApiKey}
        label="Admin API Key"
        placeholder="Enter your admin API key to submit this report"
      />
      
      <div className="flex space-x-4">
        <Button 
          type="button" 
          variant="outline"
          className="w-1/2" 
          onClick={onBack}
        >
          Back to Content
        </Button>
        
        <Button 
          type="button" 
          className="w-1/2" 
          disabled={isSubmitting || !isValid}
          onClick={onSubmit}
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
    </div>
  );
};

export default ResultTab;
