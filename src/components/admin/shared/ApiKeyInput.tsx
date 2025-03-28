
import React from 'react';
import { Input } from '@/components/ui/input';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

interface ApiKeyInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  hideKey?: boolean;
  adminKey?: boolean;
  description?: string;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  value,
  onChange,
  label = 'API Key',
  placeholder = 'Enter API key',
  hideKey = true,
  adminKey = false,
  description
}) => {
  const [showKey, setShowKey] = React.useState(false);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label htmlFor="apiKey" className="block text-sm font-medium text-cyber-light">
          {label}
        </label>
        {adminKey && value && (
          <span className="text-xs text-cyber-blue">✓ Using admin key for {label.toLowerCase()}</span>
        )}
      </div>
      <div className="relative">
        <Input
          id="apiKey"
          type={hideKey && !showKey ? 'password' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-cyber-slate border-cyber-blue/30 text-cyber-light pr-10"
        />
        {hideKey && (
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyber-light/50 hover:text-cyber-light"
          >
            {showKey ? (
              <EyeOffIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {description && (
        <p className="text-xs text-cyber-light/70">{description}</p>
      )}
    </div>
  );
};

export default ApiKeyInput;
