
import { useState, useRef, useEffect } from 'react';
import { TerminalStore } from '@/pages/Admin';

export const useGeminiKeyValidation = (initialGeminiApiKey: string) => {
  const [geminiApiKey, setGeminiApiKey] = useState(initialGeminiApiKey);
  const [isKeyValidated, setIsKeyValidated] = useState(false);
  const [validationInProgress, setValidationInProgress] = useState(false);
  const validationLockRef = useRef(false);

  // Validate the Gemini API key
  const validateGeminiApiKey = async (key: string): Promise<boolean> => {
    // Prevent multiple concurrent validations using both state and ref
    if (validationInProgress || validationLockRef.current) {
      return isKeyValidated;
    }
    
    try {
      setValidationInProgress(true);
      validationLockRef.current = true;
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
      
      if (isValid) {
        TerminalStore.addLine(`Gemini API key validated successfully`);
        setIsKeyValidated(true);
      } else {
        TerminalStore.addLine(`Gemini API key validation failed: Invalid response format`);
        setIsKeyValidated(false);
      }
      
      return isValid;
    } catch (error) {
      console.error('Error validating Gemini API key:', error);
      TerminalStore.addLine(`Error validating Gemini API key: ${error.message}`);
      setIsKeyValidated(false);
      return false;
    } finally {
      setValidationInProgress(false);
      // Set timeout to release the lock after a delay to prevent rapid re-validation
      setTimeout(() => {
        validationLockRef.current = false;
      }, 2000);
    }
  };

  // Effect to validate key once when it's provided initially, with debounce
  useEffect(() => {
    let debounceTimeout: NodeJS.Timeout;
    
    if (geminiApiKey && !isKeyValidated && !validationInProgress && !validationLockRef.current) {
      // Debounce validation to prevent multiple rapid validations
      debounceTimeout = setTimeout(() => {
        validateGeminiApiKey(geminiApiKey);
      }, 500);
    }
    
    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, [geminiApiKey, isKeyValidated, validationInProgress]);

  return {
    geminiApiKey,
    setGeminiApiKey,
    isKeyValidated,
    validateGeminiApiKey,
    validationInProgress
  };
};
