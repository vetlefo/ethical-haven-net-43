
import { useState, useRef, useEffect } from 'react';
import { TerminalStore } from '@/pages/Admin';

export const useGeminiKeyValidation = (initialGeminiApiKey: string) => {
  const [geminiApiKey, setGeminiApiKey] = useState(initialGeminiApiKey);
  const [isKeyValidated, setIsKeyValidated] = useState(false);
  const [validationInProgress, setValidationInProgress] = useState(false);
  const validationLockRef = useRef(false);

  // Reset validation status when key changes
  useEffect(() => {
    // Always invalidate key when it changes
    setIsKeyValidated(false);
  }, [geminiApiKey]);

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

  // Do not automatically validate on initial mount
  // This is changed to require explicit validation

  return {
    geminiApiKey,
    setGeminiApiKey,
    isKeyValidated,
    validateGeminiApiKey,
    validationInProgress
  };
};
