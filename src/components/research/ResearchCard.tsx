
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ResearchDetail {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  details: string[];
  image: string;
}

interface ResearchCardProps {
  finding: ResearchDetail;
}

const ResearchCard: React.FC<ResearchCardProps> = ({ finding }) => {
  return (
    <div className="glass-card p-8">
      <h3 className="text-2xl font-semibold mb-4 flex items-center">
        <finding.icon className="h-6 w-6 mr-2 text-cyber-blue" />
        {finding.title}
      </h3>
      <p className="text-cyber-light/70 mb-6">
        {finding.description}
      </p>
      <ul className="space-y-3">
        {finding.details.map((detail, index) => (
          <li key={index} className="flex items-start">
            <span className="w-2 h-2 bg-cyber-blue rounded-full mr-3 mt-1.5"></span>
            <span className="text-cyber-light/80">{detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResearchCard;
