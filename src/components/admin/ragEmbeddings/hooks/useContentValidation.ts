
import { useState } from 'react';

export const useContentValidation = () => {
  const [isValid, setIsValid] = useState(false);

  const validateContent = (content: string): boolean => {
    if (!content.trim()) {
      return false;
    }
    
    try {
      JSON.parse(content);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleContentChange = (newValue: string) => {
    setIsValid(validateContent(newValue));
    return newValue;
  };

  return {
    isValid,
    setIsValid,
    validateContent,
    handleContentChange
  };
};
