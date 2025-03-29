import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button'; // Assuming Button component exists

// Import the store type
import { TerminalStore } from '@/pages/Admin'; // Adjust path if TerminalStore is moved

interface TerminalProps {
  // Remove lines, typingSpeed, startDelay
  store: TerminalStore; // Add store prop
  className?: string;
  interactive?: boolean; // Keep interactive mode optional
  onCommand?: (command: string) => void; // Keep for interactive mode
  promptText?: string; // Keep for interactive mode
  colors?: {
    prompt?: string;
    command?: string;
    comment?: string;
  };
  title?: string;
}

export const Terminal: React.FC<TerminalProps> = ({
  store, // Destructure store
  className,
  interactive = false,
  onCommand,
  promptText = "admin@reportcase:~", // Updated prompt
  colors = {
    prompt: "#0ea5e9", // Keep default colors or adjust
    command: "#f8fafc",
    comment: "#8B5CF6"
  },
  title
}) => {
  // State to hold lines from the store
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  // State for interactive input
  const [userInput, setUserInput] = useState('');
  const [cursor, setCursor] = useState(true);
  // Refs
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);

  // Subscribe to the store on mount and unsubscribe on unmount
  useEffect(() => {
    mountedRef.current = true;

    const unsubscribe = store.subscribe((newLines: string[]) => {
      if (mountedRef.current) {
        setTerminalLines(newLines);
      }
    });

    // Cleanup function
    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [store]); // Re-subscribe if the store instance changes (though it shouldn't with Singleton)

  // Blinking cursor effect for interactive mode
  useEffect(() => {
    if (!interactive) return; // Only needed for interactive mode

    const timer = setInterval(() => {
      if (mountedRef.current) {
        setCursor(prev => !prev);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [interactive]);

  // Auto-scroll to bottom when lines change or user types
  useEffect(() => {
    if (terminalRef.current && mountedRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLines, userInput]); // Depend on lines from store and user input

  // Ensure mountedRef is false on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Focus input when terminal area is clicked in interactive mode
  const focusInput = () => {
    if (interactive && inputRef.current && mountedRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle changes in the interactive input field
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mountedRef.current) {
      setUserInput(e.target.value);
    }
  };

  // Handle command submission in interactive mode
  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && onCommand && mountedRef.current) {
      // Add command to store log
      store.addLine(`$ ${userInput}`);
      // Execute the command callback
      onCommand(userInput);
      // Clear the input field
      setUserInput('');
    }
  };

  // Format lines for display (e.g., timestamps, command prompts)
  const formatLine = (line: string) => {
    // Simple timestamp check (adjust regex if format changes)
    const timestampMatch = line.match(/^(\d{2}:\d{2}:\d{2}\.\d{3}):\s/);
    if (timestampMatch) {
      const timestamp = timestampMatch[1];
      const content = line.substring(timestampMatch[0].length);
      // Example: Dim timestamp, normal content
      return <><span className="text-cyber-light/50 mr-2">{timestamp}</span>{content}</>;
    }
    // Format command input lines differently
    if (line.startsWith('$ ')) {
       return <span className="text-green-400">{line}</span>;
    }
    // Keep comment formatting or other specific formatting
    if (line.startsWith('#')) {
      return <span style={{ color: colors.comment }}>{line}</span>;
    }
    return line; // Default return
  };

  // Handler for the clear log button
  const handleClearLog = () => {
    store.clearLines();
  };

  return (
    // Main container with styling
    <div className="bg-cyber-slate/80 border border-cyber-blue/30 rounded-md overflow-hidden flex flex-col">
      {/* Optional Title Bar */}
      {title && (
        <div className="border-b border-cyber-blue/20 py-2 px-4 flex items-center justify-between">
          <span className="text-sm text-cyber-light/70">{title}</span>
          {/* Clear Log Button */}
          <Button variant="ghost" size="sm" onClick={handleClearLog} className="text-xs h-auto px-2 py-1 text-cyber-light/60 hover:bg-cyber-light/10 hover:text-cyber-light">
            Clear Log
          </Button>
        </div>
      )}
      {/* Terminal Content Area */}
      <div
        className={cn(
          "font-mono text-left p-4 sm:p-6 overflow-hidden text-sm sm:text-base",
          "h-[400px] sm:h-[500px] flex flex-col", // Fixed height, flex column layout
          className
        )}
        onClick={focusInput} // Allow focusing input by clicking area
        ref={terminalRef} // Ref for auto-scrolling
      >
        {/* Log Display Area */}
        <div className={cn("text-cyber-light/90 flex-1 overflow-y-auto mb-4")}>
          {terminalLines.map((line, index) => (
            // Render each line, ensuring wrapping
            <div key={`line-${index}`} className="whitespace-pre-wrap break-words">
              {formatLine(line)}
            </div>
          ))}
        </div>

        {/* Interactive Input Area (only if interactive is true) */}
        {interactive && (
          <form onSubmit={handleInputSubmit} className="mt-auto flex items-center border-t border-cyber-blue/20 pt-3">
            {/* Prompt */}
            <span style={{ color: colors.prompt }} className="mr-2">{promptText}$</span>
            {/* Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              className="flex-1 bg-transparent outline-none text-cyber-light/90"
              placeholder="Type a command..." // Placeholder text
              autoFocus // Auto-focus on render
            />
            {/* Blinking cursor simulation */}
            {cursor && !userInput && <span className="animate-pulse">_</span>}
          </form>
        )}
      </div>
    </div>
  );
};

// Export both default and named export
export default Terminal;
