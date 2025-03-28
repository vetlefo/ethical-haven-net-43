
import React, { useState } from 'react';
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

const Admin: React.FC = () => {
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "# Compliance Intelligence Admin Console",
    "# Use the tabs above to manage compliance reports",
    "# AI Processing ready for report transformation",
    "",
    "Initializing report processing engine...",
    "Schema validation module loaded.",
    "JSON formatter ready.",
    "Gemini API connection established.",
    "Vector embedding module initialized.",
    "Ready to process compliance reports."
  ]);
  
  // Store the Gemini API key at the top level so it can be shared with child components
  const [geminiApiKey, setGeminiApiKey] = useState('');

  const executeCommand = async (command: string) => {
    setTerminalLines(prev => [...prev, `$ ${command}`, `Processing command: ${command}...`]);
    
    if (!geminiApiKey) {
      setTerminalLines(prev => [...prev, `Error: Gemini API key is required. Please set it in the tabs above.`]);
      toast({
        title: "API Key Required",
        description: "Please set your Gemini API key in the tabs above.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if it's a research command
    try {
      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: {
          geminiApiKey,
          prompt: command
        }
      });
      
      if (error) {
        setTerminalLines(prev => [...prev, `Error: ${error.message}`]);
      } else if (data) {
        setTerminalLines(prev => [...prev, `Command executed successfully`, `Result: ${JSON.stringify(data, null, 2)}`]);
      }
    } catch (err: any) {
      console.error("Error executing command:", err);
      setTerminalLines(prev => [...prev, `Error: ${err.message || "Failed to execute command"}`]);
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
