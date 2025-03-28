
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Calendar, Globe, FileDigit, Share2, FileText, ChevronRight, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ComplianceReport, getReportBySlug } from '@/services/reportService';
import VisualizationModal from '@/components/VisualizationModal';
import { painPointsData, marketEntryData, VisualizationDataPoint, MarketEntryDataPoint } from '@/utils/visualizationData';
import { toast } from '@/hooks/use-toast';

const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');
  const [visualizationOpen, setVisualizationOpen] = useState(false);
  const [selectedVisualization, setSelectedVisualization] = useState<{
    title: string;
    type: string;
    data: VisualizationDataPoint[] | MarketEntryDataPoint[];
  }>({
    title: '',
    type: '',
    data: painPointsData
  });

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        if (id) {
          const data = await getReportBySlug(id);
          if (data) {
            setReport(data);
          }
        }
      } catch (error) {
        console.error('Error fetching report:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleShareReport = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied to clipboard",
        description: "You can now share this report with others",
      });
    }).catch((err) => {
      console.error('Failed to copy link:', err);
    });
  };

  const handleVisualizationClick = (title: string, type: string) => {
    setSelectedVisualization({
      title,
      type,
      data: type === 'radar' ? painPointsData : marketEntryData
    });
    setVisualizationOpen(true);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cyber-dark flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-4 border-cyber-blue/20 border-t-cyber-blue rounded-full"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-cyber-dark">
        <div className="container mx-auto py-12 px-4">
          <Link to="/reports" className="text-cyber-blue mb-6 flex items-center gap-1 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Reports
          </Link>
          
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="h-16 w-16 text-cyber-blue/30 mb-4" />
            <h1 className="text-2xl font-bold mb-3">Report Not Found</h1>
            <p className="text-cyber-light/70 max-w-md mb-6">
              The report you are looking for does not exist or has been removed.
            </p>
            <Link to="/reports">
              <Button variant="outline" className="border-cyber-blue/30 text-cyber-blue">
                Browse All Reports
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-dark pb-16">
      {/* Report Header */}
      <div 
        className="w-full bg-gradient-to-b from-cyber-slate to-cyber-dark pt-20 pb-12 px-4"
        style={{
          backgroundImage: report.cover_image ? 
            `linear-gradient(to bottom, rgba(12, 20, 39, 0.9), rgba(12, 20, 39, 0.98)), url(${report.cover_image})` : 
            undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto">
          <Link to="/reports" className="text-cyber-blue mb-6 flex items-center gap-1 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Reports
          </Link>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {report.category && (
              <Badge className="bg-cyber-blue/20 text-cyber-blue hover:bg-cyber-blue/30 border-none">
                {report.category}
              </Badge>
            )}
            
            {report.country && (
              <Badge className="bg-cyber-dark/50 text-cyber-light/80 hover:bg-cyber-dark/70 border-none">
                {report.country}
              </Badge>
            )}
            
            {report.region && (
              <Badge variant="outline" className="border-cyber-blue/20 text-cyber-light/60">
                <Globe className="h-3 w-3 mr-1" /> {report.region}
              </Badge>
            )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 max-w-4xl">{report.title}</h1>
          
          <p className="text-cyber-light/80 max-w-3xl mb-6 text-lg">{report.summary}</p>
          
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-cyber-light/60">
              <Calendar className="h-4 w-4" />
              Published on {formatDate(report.published_at)}
            </div>
            
            {report.author && (
              <div className="text-cyber-light/60">
                By {report.author}
              </div>
            )}
            
            {report.read_time && (
              <div className="flex items-center gap-2 text-cyber-light/60">
                <Clock className="h-4 w-4" />
                {report.read_time} min read
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Report Content */}
      <div className="container mx-auto mt-8 px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full bg-cyber-slate/20 p-1">
                <TabsTrigger value="content" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" /> Content
                </TabsTrigger>
                
                {report.content.visualizations && report.content.visualizations.length > 0 && (
                  <TabsTrigger value="visualizations" className="flex-1">
                    <FileDigit className="h-4 w-4 mr-2" /> Visualizations
                  </TabsTrigger>
                )}
                
                {report.content.tables && report.content.tables.length > 0 && (
                  <TabsTrigger value="tables" className="flex-1">
                    <FileDigit className="h-4 w-4 mr-2" /> Data Tables
                  </TabsTrigger>
                )}
              </TabsList>
            
              <TabsContent value="content" className="pt-6">
                {report.content.sections.map((section, index) => (
                  <div key={index} className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-cyber-blue/20">
                      {section.title}
                    </h2>
                    <div 
                      className="text-cyber-light/80 space-y-4 prose prose-invert prose-p:text-cyber-light/80 max-w-none"
                      dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br />') }}
                    />
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="visualizations" className="pt-6">
                {report.content.visualizations && report.content.visualizations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {report.content.visualizations.map((viz, index) => (
                      <div 
                        key={index} 
                        className="bg-cyber-slate/30 border border-cyber-blue/10 rounded-lg overflow-hidden hover:border-cyber-blue/30 transition-colors cursor-pointer"
                        onClick={() => handleVisualizationClick(viz.title, viz.type)}
                      >
                        <div className="p-5">
                          <h3 className="text-lg font-medium mb-2">{viz.title}</h3>
                          <p className="text-cyber-light/70 text-sm mb-4">
                            {viz.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="bg-cyber-blue/10 text-cyber-blue border-cyber-blue/20">
                              {viz.type.charAt(0).toUpperCase() + viz.type.slice(1)} Chart
                            </Badge>
                            <Button size="sm" variant="ghost" className="text-cyber-blue">
                              View <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileDigit className="h-12 w-12 text-cyber-blue/20 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No visualizations available</h3>
                    <p className="text-cyber-light/60">
                      This report doesn't contain any visualizations.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="tables" className="pt-6">
                {report.content.tables && report.content.tables.length > 0 ? (
                  <div className="space-y-10">
                    {report.content.tables.map((table, index) => (
                      <div key={index}>
                        <h3 className="text-xl font-medium mb-4">{table.title}</h3>
                        <div className="border border-cyber-blue/20 rounded-lg overflow-hidden">
                          <ScrollArea className="h-auto max-h-[500px]">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-cyber-slate/40 hover:bg-cyber-slate/50">
                                  {table.columns.map((column, colIndex) => (
                                    <TableHead key={colIndex} className="text-cyber-blue font-medium">
                                      {column}
                                    </TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {table.rows.map((row, rowIndex) => (
                                  <TableRow key={rowIndex} className="border-cyber-blue/10 hover:bg-cyber-slate/30">
                                    {row.map((cell, cellIndex) => (
                                      <TableCell key={cellIndex} className="py-3">
                                        {cell}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="h-12 w-12 text-cyber-blue/20 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No tables available</h3>
                    <p className="text-cyber-light/60">
                      This report doesn't contain any data tables.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-8">
              <div className="bg-cyber-slate/20 border border-cyber-blue/10 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium mb-4 pb-2 border-b border-cyber-blue/20">Report Actions</h3>
                
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-cyber-light border-cyber-blue/20 hover:bg-cyber-blue/10"
                    onClick={handleShareReport}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Report
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-cyber-light border-cyber-blue/20 hover:bg-cyber-blue/10"
                    disabled
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
              
              <div className="bg-cyber-slate/20 border border-cyber-blue/10 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium mb-4 pb-2 border-b border-cyber-blue/20">Related Topics</h3>
                
                <div className="flex flex-wrap gap-2">
                  {report.tags.map((tag, index) => (
                    <Link key={index} to={`/reports?tag=${tag}`}>
                      <Badge 
                        variant="outline" 
                        className="bg-cyber-blue/5 border-cyber-blue/20 text-cyber-light/80 hover:bg-cyber-blue/10 cursor-pointer"
                      >
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <VisualizationModal
        isOpen={visualizationOpen}
        onClose={() => setVisualizationOpen(false)}
        title={selectedVisualization.title}
        visualizationType={selectedVisualization.type}
        data={selectedVisualization.data}
      />
    </div>
  );
};

export default ReportDetail;
