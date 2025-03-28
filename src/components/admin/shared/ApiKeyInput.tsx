
import React from 'react';
import { Input } from '@/components/ui/input';

interface ApiKeyInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  description?: string;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  value,
  onChange,
  label,
  placeholder = "Enter API key",
  description
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-cyber-light mb-1">
        {label}
      </label>
      <Input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-cyber-slate border-cyber-blue/30 text-cyber-light"
      />
      {description && (
        <p className="text-xs text-cyber-light/70 mt-1">
          {description}
        </p>
      )}
    </div>
  );
};

export default ApiKeyInput;
