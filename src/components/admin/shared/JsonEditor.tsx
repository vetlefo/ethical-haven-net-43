
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { FileCheck, FileWarning } from 'lucide-react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  description?: string;
}

const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  label,
  placeholder = "JSON content will appear here",
  description
}) => {
  const [isValid, setIsValid] = useState(true);
  
  const handleChange = (newValue: string) => {
    onChange(newValue);
    // Check if the content is valid JSON
    try {
      if (newValue.trim()) {
        JSON.parse(newValue);
        setIsValid(true);
      } else {
        setIsValid(true); // Empty is valid for our purposes
      }
    } catch (e) {
      setIsValid(false);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label htmlFor="jsonContent" className="block text-sm font-medium text-cyber-light">
          {label}
        </label>
        {value && (
          <div className="flex items-center">
            {isValid ? (
              <FileCheck className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <FileWarning className="h-4 w-4 text-yellow-500 mr-1" />
            )}
            <span className={`text-xs ${isValid ? 'text-green-500' : 'text-yellow-500'}`}>
              {isValid ? 'Valid JSON' : 'Invalid JSON'}
            </span>
          </div>
        )}
      </div>
      <Textarea
        id="jsonContent"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[300px] font-mono text-sm"
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
