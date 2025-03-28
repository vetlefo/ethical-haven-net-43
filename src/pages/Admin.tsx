
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminReportSubmitter from '@/components/AdminReportSubmitter';
import AdminAIReportGenerator from '@/components/AdminAIReportGenerator';
import Terminal from '@/components/Terminal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from '@/components/ui/card';

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
    "Ready to process compliance reports."
  ]);

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
              <Tabs defaultValue="manual" className="w-full mx-auto">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="manual">Manual Submission</TabsTrigger>
                  <TabsTrigger value="ai">AI-Assisted Generation</TabsTrigger>
                </TabsList>
                
                <TabsContent value="manual">
                  <AdminReportSubmitter />
                </TabsContent>
                
                <TabsContent value="ai">
                  <AdminAIReportGenerator />
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="lg:col-span-1">
              <Card className="bg-background/80 backdrop-blur-sm border-cyber-blue/30 h-full">
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
                  onCommand={(command) => {
                    setTerminalLines(prev => [...prev, `$ ${command}`, `Processing command: ${command}...`]);
                  }}
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
