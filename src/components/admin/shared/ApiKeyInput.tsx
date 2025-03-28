
import React from 'react';
import { Input } from '@/components/ui/input';

interface ApiKeyInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  description?: string;
  placeholder?: string;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  value,
  onChange,
  label,
  description,
  placeholder = "Enter your API key"
}) => {
  return (
    <div>
      <label htmlFor="apiKey" className="block text-sm font-medium text-cyber-light mb-1">
        {label}
      </label>
      <Input
        id="apiKey"
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full"
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
