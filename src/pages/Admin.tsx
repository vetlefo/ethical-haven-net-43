
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Terminal } from '@/components/Terminal';
import AdminAIReportGenerator from '@/components/admin/reportGenerator/AdminAIReportGenerator';
import AdminRagEmbeddings from '@/components/admin/ragEmbeddings/AdminRagEmbeddings';
import UnifiedArticleProcessor from '@/components/admin/unifiedWorkflow/UnifiedArticleProcessor';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Store for the terminal
export class TerminalStore {
  static lines: string[] = [];
  static listeners: Function[] = [];

  static addLine(line: string) {
    this.lines.push(`${new Date().toISOString().split('T')[1].slice(0, -1)}: ${line}`);
    if (this.lines.length > 100) this.lines.shift();
    this.notifyListeners();
  }

  static subscribe(callback: Function) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  static notifyListeners() {
    for (const listener of this.listeners) {
      listener(this.lines);
    }
  }
}

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const { user, isAdmin, signOut, isLoading } = useAuth();
  const navigate = useNavigate();

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Wait until auth loading is complete
        if (isLoading) return;
        
        setLoading(false);
        
        if (!user) {
          // Not logged in
          toast({
            title: "Authentication Required",
            description: "Please login to access the admin panel",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }
        
        if (!isAdmin) {
          // Logged in but not admin
          toast({
            title: "Unauthorized",
            description: "You don't have permission to access the admin panel",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        
        // Successfully authenticated as admin
        TerminalStore.addLine(`Admin session authenticated: ${user.email}`);
      } catch (error) {
        console.error('Authentication error:', error);
        toast({
          title: "Authentication error",
          description: error.message || "Please try logging in again",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };
    
    checkAuth();
  }, [navigate, user, isAdmin, isLoading]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-cyber-blue animate-spin" />
          <div className="text-cyber-light text-xl">Verifying credentials...</div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md mx-auto p-6">
          <ShieldAlert className="w-16 h-16 text-red-500" />
          <h2 className="text-cyber-light text-2xl font-bold">Access Denied</h2>
          <p className="text-cyber-light/70">You don't have permission to access the admin panel. Please contact the administrator if you believe this is an error.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-cyber-blue text-white rounded hover:bg-cyber-blue/80 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-dark flex flex-col">
      <header className="bg-cyber-slate border-b border-cyber-blue/30 py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-cyber-light text-xl font-medium">ReportCase Admin Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 border border-cyber-light/20 rounded text-cyber-light/80 hover:bg-cyber-light/10 hover:text-cyber-light transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-6">
        <Tabs defaultValue="reportGenerator" className="space-y-8">
          <TabsList className="grid grid-cols-3 w-full bg-cyber-slate/50 border border-cyber-light/10">
            <TabsTrigger value="reportGenerator" className="data-[state=active]:bg-cyber-slate data-[state=active]:text-cyber-blue">
              AI Report Generator
            </TabsTrigger>
            <TabsTrigger value="ragEmbeddings" className="data-[state=active]:bg-cyber-slate data-[state=active]:text-cyber-blue">
              RAG Embeddings
            </TabsTrigger>
            <TabsTrigger value="unifiedWorkflow" className="data-[state=active]:bg-cyber-slate data-[state=active]:text-cyber-blue">
              Unified Workflow
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="reportGenerator">
            <AdminAIReportGenerator />
          </TabsContent>
          
          <TabsContent value="ragEmbeddings">
            <AdminRagEmbeddings />
          </TabsContent>
          
          <TabsContent value="unifiedWorkflow">
            <UnifiedArticleProcessor />
          </TabsContent>
        </Tabs>
      </main>
      
      <div className="container mx-auto px-6 pb-6">
        <Terminal title="Admin Operations Log" lines={TerminalStore.lines} />
      </div>
    </div>
  );
};

export default Admin;
