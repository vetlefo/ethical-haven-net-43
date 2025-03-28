
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type ApiKeyInputProps = {
  value: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  label: string;
  placeholder?: string;
  description?: string; // Added prop for description
};

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  value,
  onChange,
  label,
  placeholder = '••••••••••••••••••••••••••••••••',
  description
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="api-key" className="text-cyber-light">
        {label}
      </Label>
      <Input
        id="api-key"
        type="password"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-cyber-slate border-cyber-light/20 text-cyber-light w-full"
      />
      {description && (
        <p className="text-xs text-cyber-light/70">
          {description}
        </p>
      )}
    </div>
  );
};

export default ApiKeyInput;
