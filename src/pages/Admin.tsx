import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Terminal } from '@/components/Terminal';
import AdminAIReportGenerator from '@/components/admin/reportGenerator/AdminAIReportGenerator';
import AdminRagEmbeddings from '@/components/admin/ragEmbeddings/AdminRagEmbeddings';
import UnifiedArticleProcessor from '@/components/admin/unifiedWorkflow/UnifiedArticleProcessor';
import { toast } from '@/hooks/use-toast';

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
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
          toast({
            title: "Authentication required",
            description: "You must be logged in to access the admin panel",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        
        // Successfully authenticated
        setAuthenticated(true);
        TerminalStore.addLine(`Admin session authenticated: ${session.user.email}`);
      } catch (error) {
        console.error('Authentication error:', error);
        toast({
          title: "Authentication error",
          description: error.message || "Please try logging in again",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setAuthenticated(false);
        navigate('/');
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-cyber-blue animate-spin" />
          <div className="text-cyber-light text-xl">Verifying credentials...</div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null; // Will redirect in useEffect
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
        <Terminal title="Admin Operations Log" />
      </div>
    </div>
  );
};

export default Admin;
