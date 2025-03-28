
import React from 'react';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

export type StepStatus = 'waiting' | 'processing' | 'completed' | 'error';

interface StepProps {
  title: string;
  description: string;
  status: StepStatus;
}

export const Step: React.FC<StepProps> = ({ title, description, status }) => {
  return (
    <div className="flex items-start">
      <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-3">
        {status === 'completed' && (
          <CheckCircle className="w-6 h-6 text-cyber-green" />
        )}
        {status === 'processing' && (
          <Circle className="w-6 h-6 text-cyber-blue animate-pulse" />
        )}
        {status === 'waiting' && (
          <Circle className="w-6 h-6 text-cyber-light/50" />
        )}
        {status === 'error' && (
          <AlertCircle className="w-6 h-6 text-red-500" />
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-cyber-light">{title}</h3>
        <p className="text-xs text-cyber-light/70">{description}</p>
      </div>
    </div>
  );
};

interface StepsProps {
  children: React.ReactNode;
  currentStep: number;
}

export const Steps: React.FC<StepsProps> = ({ children, currentStep }) => {
  return (
    <div className="p-4 bg-cyber-slate/50 rounded-md border border-cyber-blue/20">
      <div className="space-y-3">
        {React.Children.map(children, (child, index) => (
          <div key={index} className={index !== 0 ? "pt-3 border-t border-cyber-blue/10" : ""}>
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};
