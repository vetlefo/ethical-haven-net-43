
import React from 'react';

const ResearchHeader: React.FC = () => {
  return (
    <div className="text-center mb-16 space-y-3">
      <div className="inline-block px-4 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue text-sm font-medium">
        Research Insights
      </div>
      <h2 className="font-bold">
        Key <span className="gradient-text">Findings</span> & Recommendations
      </h2>
      <p className="text-cyber-light/70 max-w-2xl mx-auto text-lg">
        Our comprehensive market research reveals critical insights for successful entry
        into the global compliance software market.
      </p>
    </div>
  );
};

export default ResearchHeader;
