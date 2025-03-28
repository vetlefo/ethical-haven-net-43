
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Database } from 'lucide-react';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Report {
  id: string;
  title: string;
  summary: string;
  slug: string;
  tags: string[];
  category: string;
  created_at: string;
  is_rag_enabled?: boolean;
}

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('compliance_reports')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setReports(data);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-cyber-dark flex flex-col">
      <main className="flex-grow container mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cyber-light">Compliance Reports</h1>
            <p className="text-cyber-light/70 mt-1">
              Browse our latest compliance reports and regulatory analyses
            </p>
          </div>
          
          {isAdmin && (
            <div className="flex space-x-2">
              <Button asChild variant="outline" className="bg-cyber-dark text-cyber-light border-cyber-blue/50 hover:bg-cyber-slate">
                <Link to="/rag-processor">
                  <Database className="mr-2 h-4 w-4" />
                  RAG Processor
                </Link>
              </Button>
              <Button asChild className="bg-cyber-blue hover:bg-cyber-blue/80">
                <Link to="/admin">
                  <Plus className="mr-2 h-4 w-4" />
                  New Report
                </Link>
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-cyber-blue/20 border-t-cyber-blue rounded-full"></div>
          </div>
        ) : reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <Card key={report.id} className="bg-cyber-slate/30 border-cyber-blue/20 hover:border-cyber-blue/50 transition-all">
                <CardHeader>
                  <CardTitle className="text-cyber-light">
                    <Link to={`/reports/${report.slug}`} className="hover:text-cyber-blue transition-colors">
                      {report.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-cyber-light/70">
                    {new Date(report.created_at).toLocaleDateString()} · {report.category}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-cyber-light/90 line-clamp-3">
                    {report.summary}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2">
                  {report.tags?.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="bg-cyber-dark/50 text-cyber-light border-cyber-blue/30">
                      {tag}
                    </Badge>
                  ))}
                  {report.is_rag_enabled && (
                    <Badge className="bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30">
                      RAG Enabled
                    </Badge>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-cyber-light/70">No reports found.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Reports;
