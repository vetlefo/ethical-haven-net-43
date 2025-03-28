
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

const AdminReportSubmitter: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reportJson, setReportJson] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: 'API Key Required',
        description: 'Please enter your admin API key',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Parse the JSON input
      const reportData = JSON.parse(reportJson);
      
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
        description: 'Report has been added to the database',
      });
      
      // Clear the form
      setReportJson('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit report',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sampleReport = {
    title: "Sample Report Title",
    slug: "sample-report-slug",
    summary: "A brief summary of the report content.",
    content: {
      sections: [
        {
          title: "Introduction",
          content: "This is the introduction section of the report."
        },
        {
          title: "Findings",
          content: "These are the main findings of the report."
        }
      ],
      visualizations: [
        {
          title: "Data Visualization",
          type: "bar",
          description: "A description of what this visualization shows."
        }
      ],
      tables: [
        {
          title: "Data Table",
          columns: ["Column 1", "Column 2"],
          rows: [
            ["Row 1, Cell 1", "Row 1, Cell 2"],
            ["Row 2, Cell 1", "Row 2, Cell 2"]
          ]
        }
      ]
    },
    country: "Germany",
    region: "Europe",
    tags: ["Tag1", "Tag2"],
    category: "Market Analysis",
    author: "Author Name",
    cover_image: "https://example.com/image.jpg",
    read_time: 10,
    is_featured: false
  };

  const loadSample = () => {
    setReportJson(JSON.stringify(sampleReport, null, 2));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-background/80 backdrop-blur-sm border-cyber-blue/30">
      <CardHeader>
        <CardTitle className="text-2xl text-cyber-light">Admin Report Submission</CardTitle>
        <CardDescription className="text-cyber-light/70">
          Add new compliance reports to the database
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-cyber-light mb-1">
              Admin API Key
            </label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your admin API key"
              className="w-full"
              required
            />
          </div>
          
          <Separator />
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="reportJson" className="block text-sm font-medium text-cyber-light">
                Report JSON
              </label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={loadSample}
              >
                Load Sample
              </Button>
            </div>
            <Textarea
              id="reportJson"
              value={reportJson}
              onChange={(e) => setReportJson(e.target.value)}
              placeholder="Paste your report JSON here"
              className="w-full min-h-[400px] font-mono text-sm"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminReportSubmitter;
