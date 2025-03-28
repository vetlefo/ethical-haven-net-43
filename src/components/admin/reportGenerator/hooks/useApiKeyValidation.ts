
import { useState, useCallback, useEffect } from 'react';
import { TerminalStore } from '@/pages/Admin';

export const useApiKeyValidation = (initialKey: string = '') => {
  const [apiKey, setApiKey] = useState(initialKey);
  const [isValidating, setIsValidating] = useState(false);
  const [isKeyValidated, setIsKeyValidated] = useState(false);

  const validateGeminiApiKey = useCallback(async (key: string): Promise<boolean> => {
    // Skip validation if no key provided
    if (!key.trim()) {
      setIsKeyValidated(false);
      return false;
    }
    
    try {
      setIsValidating(true);
      TerminalStore.addLine(`Validating Gemini API key...`);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
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
        TerminalStore.addLine(`Gemini API key validation failed: ${response.status} ${response.statusText}`);
        setIsKeyValidated(false);
        return false;
      }
      
      const data = await response.json();
      const isValid = !!data.candidates;
      TerminalStore.addLine(`Gemini API key validation ${isValid ? 'successful' : 'failed'}`);
      setIsKeyValidated(isValid);
      return isValid;
    } catch (error) {
      console.error('Error validating Gemini API key:', error);
      TerminalStore.addLine(`Error validating Gemini API key: ${error.message}`);
      setIsKeyValidated(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, []);

  useEffect(() => {
    if (apiKey.trim()) {
      validateGeminiApiKey(apiKey);
    } else {
      setIsKeyValidated(false);
    }
  }, [apiKey, validateGeminiApiKey]);

  return {
    apiKey,
    setApiKey,
    isValidating,
    isKeyValidated,
    validateGeminiApiKey
  };
};
