import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilterIcon, Search, X, Calendar, Tag, ChevronRight, Globe } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ComplianceReport, getReports } from '@/services/reportService';

interface Filter {
  category?: string;
  country?: string;
  region?: string;
  tag?: string;
}

const ComplianceReports: React.FC = () => {
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReports, setFilteredReports] = useState<ComplianceReport[]>([]);
  const [filter, setFilter] = useState<Filter>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const data = await getReports();
        setReports(data);
        setFilteredReports(data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filter, reports]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (newFilter: Filter) => {
    setFilter(prevFilter => ({ ...prevFilter, ...newFilter }));
  };

  const clearFilter = (filterKey: string) => {
    const newFilter = { ...filter };
    delete newFilter[filterKey];
    setFilter(newFilter);
  };

  const applyFilters = () => {
    let results = [...reports];

    if (searchTerm) {
      results = results.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filter.category) {
      results = results.filter(report => report.category === filter.category);
    }

    if (filter.country) {
      results = results.filter(report => report.country === filter.country);
    }

    if (filter.region) {
      results = results.filter(report => report.region === filter.region);
    }

    if (filter.tag) {
      results = results.filter(report => report.tags.includes(filter.tag!));
    }

    setFilteredReports(results);
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

  return (
    <div className="min-h-screen bg-cyber-dark">
      <div className="container mx-auto py-12 px-4">
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Compliance Reports</h1>
          <Link to="/admin">
            <Button className="bg-cyber-blue hover:bg-cyber-blue/80">
              Add New Report
            </Button>
          </Link>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Input
              type="search"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={handleSearch}
              className="bg-cyber-slate/30 border-cyber-blue/10 text-cyber-light shadow-none focus-visible:ring-cyber-blue/40"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-cyber-slate/40 text-cyber-light"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-cyber-light/50" />
          </div>

          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" className="border-cyber-blue/30 text-cyber-blue hover:bg-cyber-blue/10">
                <FilterIcon className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-cyber-slate text-cyber-light border-l border-cyber-blue/20">
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Filter Reports</h2>

                {/* Category Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-cyber-light/70 mb-2">Category</label>
                  <select
                    className="w-full bg-cyber-dark/80 border border-cyber-blue/20 rounded px-3 py-2 text-sm text-cyber-light focus:outline-none focus:ring-2 focus:ring-cyber-blue/50"
                    value={filter.category || ''}
                    onChange={(e) => handleFilterChange({ category: e.target.value })}
                  >
                    <option value="">All Categories</option>
                    <option value="Financial">Financial</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </div>

                {/* Country Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-cyber-light/70 mb-2">Country</label>
                  <select
                    className="w-full bg-cyber-dark/80 border border-cyber-blue/20 rounded px-3 py-2 text-sm text-cyber-light focus:outline-none focus:ring-2 focus:ring-cyber-blue/50"
                    value={filter.country || ''}
                    onChange={(e) => handleFilterChange({ country: e.target.value })}
                  >
                    <option value="">All Countries</option>
                    <option value="USA">USA</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                  </select>
                </div>

                {/* Region Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-cyber-light/70 mb-2">Region</label>
                  <select
                    className="w-full bg-cyber-dark/80 border border-cyber-blue/20 rounded px-3 py-2 text-sm text-cyber-light focus:outline-none focus:ring-2 focus:ring-cyber-blue/50"
                    value={filter.region || ''}
                    onChange={(e) => handleFilterChange({ region: e.target.value })}
                  >
                    <option value="">All Regions</option>
                    <option value="North America">North America</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                  </select>
                </div>

                {/* Tag Filter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-cyber-light/70 mb-2">Tag</label>
                  <select
                    className="w-full bg-cyber-dark/80 border border-cyber-blue/20 rounded px-3 py-2 text-sm text-cyber-light focus:outline-none focus:ring-2 focus:ring-cyber-blue/50"
                    value={filter.tag || ''}
                    onChange={(e) => handleFilterChange({ tag: e.target.value })}
                  >
                    <option value="">All Tags</option>
                    <option value="GDPR">GDPR</option>
                    <option value="CCPA">CCPA</option>
                    <option value="HIPAA">HIPAA</option>
                  </select>
                </div>

                <Button onClick={() => setFilter({})} variant="secondary" className="w-full border-cyber-blue/30 text-cyber-light hover:bg-cyber-blue/10">
                  Clear All Filters
                </Button>
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        {/* Active Filters Display */}
        {Object.keys(filter).length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {filter.category && (
              <Badge className="bg-cyber-blue/20 text-cyber-blue hover:bg-cyber-blue/30 border-none">
                {filter.category}
                <button onClick={() => clearFilter('category')} className="ml-1">
                  <X className="h-3 w-3 inline-block" />
                </button>
              </Badge>
            )}
            {filter.country && (
              <Badge className="bg-cyber-dark/50 text-cyber-light/80 hover:bg-cyber-dark/70 border-none">
                {filter.country}
                <button onClick={() => clearFilter('country')} className="ml-1">
                  <X className="h-3 w-3 inline-block" />
                </button>
              </Badge>
            )}
            {filter.region && (
              <Badge variant="outline" className="border-cyber-blue/20 text-cyber-light/60">
                <Globe className="h-3 w-3 mr-1" />
                {filter.region}
                <button onClick={() => clearFilter('region')} className="ml-1">
                  <X className="h-3 w-3 inline-block" />
                </button>
              </Badge>
            )}
            {filter.tag && (
              <Badge variant="outline" className="border-cyber-blue/20 text-cyber-light/60">
                <Tag className="h-3 w-3 mr-1" />
                {filter.tag}
                <button onClick={() => clearFilter('tag')} className="ml-1">
                  <X className="h-3 w-3 inline-block" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map(report => (
            <Link key={report.id} to={`/reports/${report.slug}`}>
              <Card className="bg-cyber-slate/20 border border-cyber-blue/10 hover:border-cyber-blue/30 transition-colors">
                {report.cover_image && (
                  <img
                    src={report.cover_image}
                    alt={report.title}
                    className="w-full h-48 object-cover rounded-t-md"
                  />
                )}
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">{report.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-cyber-light/80 text-sm line-clamp-3">{report.summary}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {report.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-cyber-dark/50 text-cyber-light/70 border-none">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between text-sm text-cyber-light/60">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(report.published_at)}
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="h-16 w-16 text-cyber-blue/30 mb-4" />
            <h2 className="text-2xl font-bold mb-3">No Reports Found</h2>
            <p className="text-cyber-light/70 max-w-md mb-6">
              We couldn't find any reports matching your search criteria. Please try again with different keywords or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceReports;
