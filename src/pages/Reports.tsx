
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, X, Tag, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ComplianceReport, getReports } from '@/services/reportService';
import ReportCard from '@/components/ReportCard';

const Reports: React.FC = () => {
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<ComplianceReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [allRegions, setAllRegions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const data = await getReports();
        setReports(data);
        setFilteredReports(data);
        
        // Extract all unique tags and regions
        const tags = Array.from(new Set(data.flatMap(report => report.tags)));
        const regions = Array.from(new Set(data.map(report => report.region).filter(Boolean) as string[]));
        
        setAllTags(tags);
        setAllRegions(regions);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReports();
  }, []);
  
  useEffect(() => {
    const applyFilters = () => {
      let results = reports;
      
      // Apply search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        results = results.filter(report => 
          report.title.toLowerCase().includes(query) ||
          report.summary.toLowerCase().includes(query) ||
          (report.content.sections.some(section => 
            section.title.toLowerCase().includes(query) || 
            section.content.toLowerCase().includes(query)
          ))
        );
      }
      
      // Apply tag filter
      if (selectedTags.length > 0) {
        results = results.filter(report => 
          selectedTags.some(tag => report.tags.includes(tag))
        );
      }
      
      // Apply region filter
      if (selectedRegions.length > 0) {
        results = results.filter(report => 
          report.region && selectedRegions.includes(report.region)
        );
      }
      
      setFilteredReports(results);
    };
    
    applyFilters();
  }, [searchQuery, selectedTags, selectedRegions, reports]);
  
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  const handleRegionToggle = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region) 
        : [...prev, region]
    );
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedRegions([]);
  };
  
  const hasActiveFilters = searchQuery || selectedTags.length > 0 || selectedRegions.length > 0;

  return (
    <div className="min-h-screen bg-cyber-dark">
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col mb-12">
          <Link to="/" className="text-cyber-blue mb-3 flex items-center gap-1 hover:underline">
            ← Back to Home
          </Link>
          
          <h1 className="text-4xl font-bold mb-4">Compliance Research Library</h1>
          <p className="text-cyber-light/70 max-w-3xl mb-8">
            In-depth market research reports on compliance software opportunities, regulatory frameworks, and market entry strategies across global markets.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyber-light/50 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-cyber-slate/50 border-cyber-blue/20 focus:border-cyber-blue"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyber-light/50 hover:text-cyber-light"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-cyber-blue/30 text-cyber-blue"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filters {hasActiveFilters && `(${selectedTags.length + selectedRegions.length})`}
            </Button>
            
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                className="text-cyber-light/70 hover:text-cyber-light"
                onClick={clearFilters}
              >
                Clear All
              </Button>
            )}
          </div>
          
          {showFilters && (
            <div className="mt-4 p-4 bg-cyber-slate/20 rounded-lg border border-cyber-blue/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-cyber-light font-medium mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-cyber-blue" />
                    Filter by Tag
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          selectedTags.includes(tag)
                            ? 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30'
                            : 'bg-cyber-slate/40 text-cyber-light/70 border border-transparent hover:border-cyber-blue/20'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-cyber-light font-medium mb-3 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-cyber-blue" />
                    Filter by Region
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allRegions.map(region => (
                      <button
                        key={region}
                        onClick={() => handleRegionToggle(region)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors ${
                          selectedRegions.includes(region)
                            ? 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30'
                            : 'bg-cyber-slate/40 text-cyber-light/70 border border-transparent hover:border-cyber-blue/20'
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-cyber-blue/20 border-t-cyber-blue rounded-full"></div>
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="h-16 w-16 text-cyber-blue/30 mb-4" />
            <h3 className="text-xl font-medium mb-2">No reports found</h3>
            <p className="text-cyber-light/70 max-w-md mb-6">
              We couldn't find any reports matching your search criteria. Try adjusting your filters or search query.
            </p>
            <Button onClick={clearFilters} variant="outline" className="border-cyber-blue/30 text-cyber-blue">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
