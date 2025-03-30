
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  description?: string;
  readOnly?: boolean; // Add readOnly prop
  height?: string; // Add height prop
}

const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  label,
  placeholder = "Enter JSON",
  description,
  readOnly = false, // Default readOnly to false
  height = "200px" // Default height
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-cyber-light mb-1">
        {label}
      </label>
      <Textarea
        value={value}
        onChange={(e) => !readOnly && onChange(e.target.value)} // Only call onChange if not readOnly
        placeholder={placeholder}
        readOnly={readOnly} // Pass readOnly to Textarea
        className="w-full font-mono text-sm bg-cyber-slate border-cyber-blue/30 text-cyber-light"
        style={{ minHeight: height }} // Apply dynamic height
      />
      {description && (
        <p className="text-xs text-cyber-light/70 mt-1">
          {description}
        </p>
      )}
    </div>
  );
};

export default JsonEditor;
