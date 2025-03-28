
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, ChevronRight } from 'lucide-react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { marketReports } from '@/utils/reportData';

const Reports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 6;

  // Filter reports based on search term
  const filteredReports = marketReports.filter(report => 
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.regions.some(region => region.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  return (
    <div className="min-h-screen bg-cyber-dark flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-28 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-10 space-y-4">
            <div className="inline-block px-4 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue text-sm font-medium">
              Market Intelligence
            </div>
            <h1 className="text-4xl font-bold">
              Compliance <span className="gradient-text">Research</span> Reports
            </h1>
            <p className="text-cyber-light/70 max-w-2xl mx-auto">
              Access our comprehensive market research reports with detailed analysis, 
              data visualizations, and strategic recommendations.
            </p>
          </div>

          <div className="relative max-w-md mx-auto mb-12">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-light/50" size={18} />
            <Input
              type="text"
              placeholder="Search reports by title, description, or region..."
              className="pl-10 bg-cyber-slate border border-cyber-blue/20 text-cyber-light focus:border-cyber-blue"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {currentReports.length > 0 ? (
              currentReports.map((report) => (
                <Link 
                  to={`/reports/${report.id}`} 
                  key={report.id}
                  className="glass-card overflow-hidden transition-all duration-300 group hover:border-cyber-blue/40 block"
                >
                  <div className="p-6 pb-8">
                    <div className="mb-4 p-3 rounded-full bg-cyber-blue/10 inline-block">
                      <FileText className="w-6 h-6 text-cyber-blue" />
                    </div>
                    <h3 className="text-xl font-medium mb-3 group-hover:text-cyber-blue transition-colors">
                      {report.title}
                    </h3>
                    <p className="text-cyber-light/70 mb-4 line-clamp-3">
                      {report.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {report.regions.map((region, idx) => (
                        <span 
                          key={idx} 
                          className="px-2 py-1 text-xs rounded-full bg-cyber-blue/10 text-cyber-blue"
                        >
                          {region}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-sm text-cyber-light/50">
                      <span>{report.date}</span>
                      <span>{report.pages} pages</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-cyber-blue/20 to-cyber-blue/10 px-6 py-4 flex justify-between items-center">
                    <span className="text-cyber-light font-medium">View Full Report</span>
                    <span className="text-cyber-blue transform group-hover:translate-x-1 transition-transform">
                      <ChevronRight size={18} />
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="mb-4 p-4 rounded-full bg-cyber-blue/10 inline-block">
                  <Search className="w-8 h-8 text-cyber-blue" />
                </div>
                <h3 className="text-xl font-medium mb-2">No Reports Found</h3>
                <p className="text-cyber-light/70">
                  We couldn't find any reports matching "{searchTerm}". 
                  Try using different keywords or browse all reports.
                </p>
                <button 
                  className="mt-6 cyber-button"
                  onClick={() => setSearchTerm('')}
                >
                  View All Reports
                </button>
              </div>
            )}
          </div>

          {filteredReports.length > reportsPerPage && (
            <Pagination className="my-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, idx) => (
                  <PaginationItem key={idx}>
                    <PaginationLink
                      onClick={() => setCurrentPage(idx + 1)}
                      isActive={currentPage === idx + 1}
                    >
                      {idx + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Reports;
