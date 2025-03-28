
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

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
  placeholder = "Enter JSON",
  description
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-cyber-light mb-1">
        {label}
      </label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[200px] font-mono text-sm bg-cyber-slate border-cyber-blue/30 text-cyber-light"
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
