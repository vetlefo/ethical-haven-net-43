
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ApiKeyInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  description?: string;
  validateKey?: (key: string) => Promise<boolean>;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  value,
  onChange,
  label,
  placeholder = "Enter API key",
  description,
  validateKey
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [showKey, setShowKey] = useState(false);

  const handleValidate = async () => {
    if (!validateKey || !value.trim()) return;
    
    setIsValidating(true);
    setIsValid(null);
    
    try {
      const valid = await validateKey(value.trim());
      setIsValid(valid);
    } catch (error) {
      console.error('Validation error:', error);
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-cyber-light mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type={showKey ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pr-10 bg-cyber-slate border-cyber-blue/30 text-cyber-light"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-cyber-light/50 hover:text-cyber-light text-xs"
          >
            {showKey ? "Hide" : "Show"}
          </button>
        </div>
        
        {validateKey && (
          <Button 
            type="button" 
            onClick={handleValidate} 
            disabled={isValidating || !value.trim()}
            size="sm"
            variant="outline"
            className="shrink-0 border-cyber-blue/30 hover:bg-cyber-blue/20"
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Validate'
            )}
          </Button>
        )}
        
        {isValid !== null && !isValidating && (
          <div className="ml-2">
            {isValid ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        )}
      </div>
      
      {description && (
        <p className="text-xs text-cyber-light/70 mt-1">
          {description}
        </p>
      )}
      
      {isValid === false && !isValidating && (
        <p className="text-xs text-red-500 mt-1">
          Invalid API key. Please check and try again.
        </p>
      )}
      
      {isValid === true && !isValidating && (
        <p className="text-xs text-green-500 mt-1">
          API key validated successfully!
        </p>
      )}
    </div>
  );
};

export default ApiKeyInput;
