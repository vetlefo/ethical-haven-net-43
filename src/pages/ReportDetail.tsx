
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Calendar, Globe, FileDigit, Share2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { marketReports } from '@/utils/reportData';
import VisualizationArea from '@/components/research/VisualizationArea';
import { createVisualization } from '@/utils/visualizationUtils';

const ReportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState(marketReports.find(r => r.id === id));
  const [showVisualization, setShowVisualization] = useState(false);
  const [activeChart, setActiveChart] = useState('');
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Find the report based on the URL parameter
    const foundReport = marketReports.find(r => r.id === id);
    setReport(foundReport);
    
    // For demonstration purposes, set showVisualization after a delay
    const timer = setTimeout(() => {
      setShowVisualization(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [id]);
  
  useEffect(() => {
    if (showVisualization && activeChart && report?.visualizations) {
      const matchingViz = report.visualizations.find(v => v.id === activeChart);
      if (matchingViz) {
        const timer = setTimeout(() => {
          createVisualization(`viz-${activeChart}`, matchingViz.type, matchingViz.data);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [showVisualization, activeChart, report]);
  
  if (!report) {
    return (
      <div className="min-h-screen bg-cyber-dark flex flex-col">
        <Navbar />
        <main className="flex-grow py-28 px-6 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Report Not Found</h2>
            <p className="text-cyber-light/70 mb-8">The report you're looking for doesn't exist or has been moved.</p>
            <Link to="/reports" className="cyber-button">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-dark flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-28 px-6">
        <div className="container mx-auto">
          {/* Header section */}
          <div className="mb-10">
            <Link to="/reports" className="inline-flex items-center text-cyber-blue hover:underline mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </Link>
            
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex flex-wrap gap-2 mb-2">
                  {report.regions.map((region, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 text-sm rounded-full bg-cyber-blue/10 text-cyber-blue flex items-center"
                    >
                      <Globe className="mr-1 h-3 w-3" />
                      {region}
                    </span>
                  ))}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">{report.title}</h1>
                <p className="text-cyber-light/70 text-lg">{report.description}</p>
                <div className="flex flex-wrap gap-6 text-sm text-cyber-light/60">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-cyber-blue" />
                    Published: {report.date}
                  </div>
                  <div className="flex items-center">
                    <FileDigit className="mr-2 h-4 w-4 text-cyber-blue" />
                    {report.pages} pages
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <button className="cyber-button w-full flex items-center justify-center">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </button>
                <button className="cyber-button-outline w-full flex items-center justify-center">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Report
                </button>
              </div>
            </div>
          </div>
          
          {/* Content section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Table of Contents Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass-card sticky top-24">
                <div className="p-6 border-b border-cyber-blue/20">
                  <h3 className="text-lg font-medium">Table of Contents</h3>
                </div>
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="p-4">
                    <nav className="space-y-1">
                      {report.sections.map((section, idx) => (
                        <div key={idx} className="py-2">
                          <a 
                            href={`#section-${idx}`} 
                            className="block py-2 px-3 rounded-md hover:bg-cyber-blue/10 transition-colors text-cyber-light hover:text-cyber-blue font-medium"
                          >
                            {idx + 1}. {section.title}
                          </a>
                          {section.subsections && (
                            <div className="ml-4 mt-1 space-y-1 border-l border-cyber-blue/20 pl-3">
                              {section.subsections.map((subsection, subIdx) => (
                                <a 
                                  key={subIdx}
                                  href={`#subsection-${idx}-${subIdx}`}
                                  className="block py-1.5 px-3 rounded-md hover:bg-cyber-blue/10 transition-colors text-cyber-light/70 hover:text-cyber-blue text-sm"
                                >
                                  {idx + 1}.{subIdx + 1} {subsection}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </nav>
                  </div>
                </ScrollArea>
              </div>
            </div>
            
            {/* Main Report Content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Executive Summary */}
              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-6">Executive Summary</h2>
                <div className="prose prose-invert prose-blue max-w-none">
                  <p className="mb-4">{report.executiveSummary}</p>
                </div>
              </div>
              
              {/* Report Sections */}
              {report.sections.map((section, idx) => (
                <div id={`section-${idx}`} key={idx} className="glass-card p-8">
                  <h2 className="text-2xl font-bold mb-6">{idx + 1}. {section.title}</h2>
                  
                  <div className="prose prose-invert prose-blue max-w-none">
                    <p className="mb-6">{section.content}</p>
                    
                    {/* Subsections */}
                    {section.subsections && section.subsections.map((subsection, subIdx) => (
                      <div id={`subsection-${idx}-${subIdx}`} key={subIdx} className="mt-8">
                        <h3 className="text-xl font-medium mb-4">{idx + 1}.{subIdx + 1} {subsection}</h3>
                        <p>{section.subsectionContents?.[subIdx] || "Detailed analysis and findings for this subsection."}</p>
                      </div>
                    ))}
                    
                    {/* If there's a visualization for this section */}
                    {section.visualizationId && (
                      <div className="mt-8 border border-cyber-blue/20 rounded-lg overflow-hidden">
                        <div 
                          className="bg-cyber-slate/50 p-4 border-b border-cyber-blue/20 flex justify-between items-center"
                        >
                          <h4 className="font-medium">Figure {idx + 1}: {section.visualizationTitle || "Data Visualization"}</h4>
                          <Dialog>
                            <DialogTrigger asChild>
                              <button 
                                className="text-cyber-blue text-sm hover:underline"
                                onClick={() => setActiveChart(section.visualizationId || '')}
                              >
                                View Full Size
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl bg-cyber-slate">
                              <div className="pt-6">
                                <h3 className="text-xl font-medium mb-6">
                                  Figure {idx + 1}: {section.visualizationTitle || "Data Visualization"}
                                </h3>
                                <div className="h-[500px]">
                                  <VisualizationArea
                                    visualizationContainerId={`dialog-viz-${section.visualizationId}`}
                                    showVisualization={showVisualization}
                                    activeTab={activeChart}
                                  />
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className="p-4 h-[300px]">
                          <VisualizationArea
                            visualizationContainerId={`viz-${section.visualizationId}`}
                            showVisualization={showVisualization}
                            activeTab={activeChart}
                          />
                        </div>
                        <div className="bg-cyber-slate/30 p-4 border-t border-cyber-blue/20 text-sm text-cyber-light/70">
                          {section.visualizationDescription || "This visualization illustrates key data points discussed in this section."}
                        </div>
                      </div>
                    )}
                    
                    {/* Tables if present */}
                    {section.table && (
                      <div className="mt-8 overflow-hidden">
                        <h4 className="font-medium mb-3">Table {idx + 1}: {section.table.title}</h4>
                        <div className="border border-cyber-blue/20 rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-cyber-blue/10 hover:bg-cyber-blue/20">
                                {section.table.headers.map((header, headerIdx) => (
                                  <TableHead key={headerIdx} className="text-cyber-blue">
                                    {header}
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {section.table.rows.map((row, rowIdx) => (
                                <TableRow key={rowIdx} className="border-b border-cyber-blue/10 hover:bg-cyber-slate/50">
                                  {row.map((cell, cellIdx) => (
                                    <TableCell key={cellIdx}>{cell}</TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        {section.table.caption && (
                          <p className="mt-2 text-sm text-cyber-light/70 italic">
                            {section.table.caption}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* References and Sources */}
              <div className="glass-card p-8">
                <h2 className="text-2xl font-bold mb-6">References and Sources</h2>
                <div className="prose prose-invert prose-blue max-w-none">
                  <ol className="space-y-3">
                    {report.sources.map((source, idx) => (
                      <li key={idx} className="text-cyber-light/80">
                        <span className="text-cyber-blue">[{idx + 1}]</span> {source}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
          
          {/* Related Reports */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Related Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {marketReports
                .filter(r => r.id !== report.id && r.regions.some(region => report.regions.includes(region)))
                .slice(0, 3)
                .map((relatedReport) => (
                  <Link 
                    to={`/reports/${relatedReport.id}`} 
                    key={relatedReport.id}
                    className="glass-card overflow-hidden transition-all duration-300 group hover:border-cyber-blue/40 block"
                  >
                    <div className="p-6 pb-8">
                      <div className="mb-4 p-3 rounded-full bg-cyber-blue/10 inline-block">
                        <FileText className="w-6 h-6 text-cyber-blue" />
                      </div>
                      <h3 className="text-xl font-medium mb-3 group-hover:text-cyber-blue transition-colors">
                        {relatedReport.title}
                      </h3>
                      <p className="text-cyber-light/70 mb-4 line-clamp-3">
                        {relatedReport.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {relatedReport.regions.map((region, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-1 text-xs rounded-full bg-cyber-blue/10 text-cyber-blue"
                          >
                            {region}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-cyber-blue/20 to-cyber-blue/10 px-6 py-4 flex justify-between items-center">
                      <span className="text-cyber-light font-medium">View Full Report</span>
                      <span className="text-cyber-blue transform group-hover:translate-x-1 transition-transform">
                        <ChevronRight size={18} />
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ReportDetail;
