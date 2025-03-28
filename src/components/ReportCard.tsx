
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Clock } from 'lucide-react';
import { ComplianceReport } from '@/services/reportService';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface ReportCardProps {
  report: ComplianceReport;
  className?: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, className }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Card className={`overflow-hidden border border-cyber-blue/20 bg-cyber-dark/40 hover:border-cyber-blue/40 transition-all duration-300 ${className}`}>
      <div className="h-48 overflow-hidden">
        {report.cover_image ? (
          <img 
            src={report.cover_image} 
            alt={report.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-cyber-slate flex items-center justify-center">
            <FileText className="w-12 h-12 text-cyber-blue/30" />
          </div>
        )}
      </div>
      
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-2">
          {report.category && (
            <span className="text-xs font-medium text-cyber-blue bg-cyber-blue/10 px-2 py-1 rounded">
              {report.category}
            </span>
          )}
          {report.country && (
            <span className="text-xs font-medium text-cyber-light/70 bg-cyber-dark/60 px-2 py-1 rounded flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyber-blue"></span>
              {report.country}
            </span>
          )}
        </div>
        
        <h3 className="text-xl font-semibold mb-3 line-clamp-2">{report.title}</h3>
        <p className="text-cyber-light/70 text-sm line-clamp-3 mb-3">{report.summary}</p>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {report.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="text-xs text-cyber-light/60 bg-cyber-slate/60 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
          {report.tags.length > 3 && (
            <span className="text-xs text-cyber-light/60">+{report.tags.length - 3}</span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-cyber-slate/30 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-cyber-light/60">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(report.published_at)}</span>
          
          {report.read_time && (
            <>
              <span className="mx-1">•</span>
              <Clock className="w-3.5 h-3.5" />
              <span>{report.read_time} min read</span>
            </>
          )}
        </div>
        
        <Link 
          to={`/reports/${report.slug}`}
          className="text-cyber-blue text-sm hover:underline flex items-center gap-1"
        >
          Read Analysis →
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ReportCard;
