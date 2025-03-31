
import { useState, useCallback, useEffect } from 'react';
import { logToTerminal } from '@/utils/terminalLogger';

export interface UseGeminiKeyValidationProps {
  initialKey?: string;
  autoValidate?: boolean;
}

export const useGeminiKeyValidation = ({
  initialKey = '',
  autoValidate = true
}: UseGeminiKeyValidationProps = {}) => {
  const [apiKey, setApiKey] = useState(initialKey);
  const [isValidating, setIsValidating] = useState(false);
  const [isKeyValidated, setIsKeyValidated] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);

  const validateGeminiApiKey = useCallback(async (key: string): Promise<boolean> => {
    // Skip validation if no key provided
    if (!key.trim()) {
      setIsKeyValidated(false);
      return false;
    }
    
    try {
      setIsValidating(true);
      logToTerminal(`Validating Gemini API key...`);
      
      // Use the Gemini API to validate the key
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: "Respond with only the word 'valid'" }]
          }]
        }),
      });
      
      if (!response.ok) {
        logToTerminal(`Gemini API key validation failed: ${response.status} ${response.statusText}`);
        setIsKeyValidated(false);
        return false;
      }
      
      const data = await response.json();
      
      if (!data || !data.candidates || data.candidates.length === 0) {
        logToTerminal(`Gemini API key validation failed: Invalid response format`);
        setIsKeyValidated(false);
        return false;
      }
      
      logToTerminal(`Gemini API key validation successful`);
      setIsKeyValidated(true);
      return true;
    } catch (error) {
      console.error('Error validating Gemini API key:', error);
      logToTerminal(`Error validating Gemini API key: ${error.message}`);
      setIsKeyValidated(false);
      return false;
    } finally {
      setIsValidating(false);
      setValidationAttempted(true);
    }
  }, []);

  useEffect(() => {
    if (autoValidate && apiKey.trim()) {
      validateGeminiApiKey(apiKey);
    } else if (!apiKey.trim()) {
      setIsKeyValidated(false);
    }
  }, [apiKey, validateGeminiApiKey, autoValidate]);

  return {
    apiKey,
    setApiKey,
    isValidating,
    isKeyValidated,
    validationAttempted,
    validateGeminiApiKey
  };
};
