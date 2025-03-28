import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminReportSubmitter from '@/components/AdminReportSubmitter';
import AdminAIReportGenerator from '@/components/admin/reportGenerator/AdminAIReportGenerator';
import AdminRagEmbeddings from '@/components/admin/ragEmbeddings/AdminRagEmbeddings';
import UnifiedArticleProcessor from '@/components/admin/unifiedWorkflow/UnifiedArticleProcessor';
import Terminal from '@/components/Terminal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Create a singleton for terminal lines to be accessed across components
export const TerminalStore = {
  lines: [
    "# Compliance Intelligence Admin Console",
    "# Use the tabs above to manage compliance reports",
    "# AI Processing ready for report transformation",
    "",
    "Initializing report processing engine...",
    "Schema validation module loaded.",
    "JSON formatter ready.",
    "Vector embedding module initialized.",
    "Ready to process compliance reports."
  ],
  addLine: (line: string) => {},
  addLines: (newLines: string[]) => {}
};

const Admin: React.FC = () => {
  const [terminalLines, setTerminalLines] = useState<string[]>(TerminalStore.lines);
  
  // Store the Gemini API key at the top level so it can be shared with child components
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    // Don't use stored key from sessionStorage since it was over-used
    return '';
  });

  // Remove auto-validation logic
  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false);
  const validationInProgressRef = useRef(false);
  const validationDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Update the TerminalStore methods to modify the terminal lines
  useEffect(() => {
    TerminalStore.addLine = (line: string) => {
      setTerminalLines(prev => [...prev, line]);
    };
    
    TerminalStore.addLines = (newLines: string[]) => {
      setTerminalLines(prev => [...prev, ...newLines]);
    };
  }, []);

  // Remove auto-validation on component load
  

  const executeCommand = async (command: string) => {
    TerminalStore.addLine(`$ ${command}`);
    
    // Handle help command
    if (command.toLowerCase() === 'help') {
      TerminalStore.addLine("Available commands:");
      TerminalStore.addLine("  help - Show this help message");
      TerminalStore.addLine("  clear - Clear the terminal");
      TerminalStore.addLine("  status - Check system status");
      TerminalStore.addLine("  version - Show system version");
      TerminalStore.addLine("  tables - List database tables");
      return;
    }
    
    // Handle clear command
    if (command.toLowerCase() === 'clear') {
      setTerminalLines([
        "# Compliance Intelligence Admin Console",
        "# Terminal cleared",
        "# Type 'help' for available commands"
      ]);
      return;
    }
    
    // Handle status command
    if (command.toLowerCase() === 'status') {
      TerminalStore.addLine("System Status:");
      TerminalStore.addLine("- Database: Connected");
      TerminalStore.addLine("- API: Connected");
      TerminalStore.addLine("- Gemini API: " + (geminiApiKey ? "Key available" : "No key set"));
      TerminalStore.addLine("- Processing Engine: Ready");
      return;
    }
    
    // Handle version command
    if (command.toLowerCase() === 'version') {
      TerminalStore.addLine("Compliance Intelligence System v1.0.2");
      TerminalStore.addLine("- Report Processing: v1.1.0");
      TerminalStore.addLine("- RAG Embedding: v1.0.5");
      TerminalStore.addLine("- Competitive Analysis: v1.0.1");
      return;
    }
    
    // Handle tables command
    if (command.toLowerCase() === 'tables') {
      TerminalStore.addLine("Database Tables:");
      TerminalStore.addLine("- compliance_reports: Structured compliance reports");
      TerminalStore.addLine("- rag_documents: Document metadata for RAG system");
      TerminalStore.addLine("- rag_chunks: Text chunks with embeddings for search");
      TerminalStore.addLine("- competitors: Competitive intelligence data");
      return;
    }
    
    TerminalStore.addLine(`Processing command: ${command}...`);
    
    if (!geminiApiKey) {
      TerminalStore.addLine(`Error: Gemini API key is required. Please set it in the tabs above.`);
      toast({
        title: "API Key Required",
        description: "Please set your Gemini API key in the tabs above.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      TerminalStore.addLine(`Connecting to Supabase function...`);
      
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          geminiApiKey,
          prompt: command
        }
      });
      
      if (error) {
        TerminalStore.addLine(`Error: ${error.message}`);
      } else if (data) {
        TerminalStore.addLine(`Command executed successfully`);
        TerminalStore.addLine(`Result: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (err: any) {
      console.error("Error executing command:", err);
      TerminalStore.addLine(`Error: ${err.message || "Failed to execute command"}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Compliance Intelligence</title>
      </Helmet>
      <div className="min-h-screen flex flex-col bg-cyber-dark text-cyber-light">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-center text-cyber-light">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Tabs defaultValue="unified" className="w-full mx-auto">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="unified">One-Step Process</TabsTrigger>
                  <TabsTrigger value="manual">Manual Submission</TabsTrigger>
                  <TabsTrigger value="ai">Report Transformation</TabsTrigger>
                  <TabsTrigger value="rag">RAG Embeddings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="unified">
                  <UnifiedArticleProcessor geminiApiKey={geminiApiKey} setGeminiApiKey={setGeminiApiKey} />
                </TabsContent>
                
                <TabsContent value="manual">
                  <AdminReportSubmitter />
                </TabsContent>
                
                <TabsContent value="ai">
                  <AdminAIReportGenerator />
                </TabsContent>
                
                <TabsContent value="rag">
                  <AdminRagEmbeddings />
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="lg:col-span-1">
              <Card className="bg-cyber-dark border-cyber-blue/30 h-full">
                <Terminal 
                  lines={terminalLines} 
                  typingSpeed={10}
                  startDelay={500}
                  interactive={true}
                  className="h-full"
                  colors={{
                    prompt: "#00ffaa",
                    command: "#f8fafc",
                    comment: "#8B5CF6"
                  }}
                  onCommand={executeCommand}
                />
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Admin;
