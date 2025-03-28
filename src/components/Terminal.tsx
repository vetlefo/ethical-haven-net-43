
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TerminalProps {
  lines: string[];
  typingSpeed?: number;
  startDelay?: number;
  className?: string;
  interactive?: boolean;
  onCommand?: (command: string) => void;
  promptText?: string;
  colors?: {
    prompt?: string;
    command?: string;
    comment?: string;
  };
  title?: string; 
}

export const Terminal: React.FC<TerminalProps> = ({
  lines = [],
  typingSpeed = 25,
  startDelay = 1000,
  className,
  interactive = false,
  onCommand,
  promptText = "cybersecure@terminal:~",
  colors = {
    prompt: "#0ea5e9",
    command: "#f8fafc",
    comment: "#8B5CF6"
  },
  title
}) => {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedChars, setDisplayedChars] = useState(0);
  const [cursor, setCursor] = useState(true);
  const [started, setStarted] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [initialTypingComplete, setInitialTypingComplete] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Add mounted ref to track component lifecycle
  const mountedRef = useRef(true);

  useEffect(() => {
    // Set mounted on initialization
    mountedRef.current = true;
    
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        setStarted(true);
      }
    }, startDelay);

    // Cleanup function
    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, [startDelay]);

  useEffect(() => {
    if (!started || currentLine >= lines.length || !mountedRef.current) {
      if (started && currentLine >= lines.length && !initialTypingComplete && mountedRef.current) {
        setInitialTypingComplete(true);
      }
      return;
    }

    const lineToType = lines[currentLine];
    let timer: NodeJS.Timeout;
    
    if (displayedChars < lineToType.length) {
      timer = setTimeout(() => {
        if (mountedRef.current) {
          setDisplayedChars(displayedChars + 1);
        }
      }, typingSpeed);
      
    } else {
      // Line complete
      timer = setTimeout(() => {
        if (mountedRef.current) {
          setDisplayedLines(prev => {
            const newLines = [...prev];
            newLines[currentLine] = lineToType;
            return newLines;
          });
          setCurrentLine(prev => prev + 1);
          setDisplayedChars(0);
        }
      }, 500);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [displayedChars, currentLine, lines, started, typingSpeed, initialTypingComplete]);

  // Blinking cursor
  useEffect(() => {
    const timer = setInterval(() => {
      if (mountedRef.current) {
        setCursor(prev => !prev);
      }
    }, 500);
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current && mountedRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [displayedLines, userInput]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Focus input when terminal is clicked
  const focusInput = () => {
    if (interactive && initialTypingComplete && inputRef.current && mountedRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mountedRef.current) {
      setUserInput(e.target.value);
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userInput.trim() && onCommand && mountedRef.current) {
      // Add the command to displayed lines
      const commandLine = `$ ${userInput}`;
      setDisplayedLines(prev => [...prev, commandLine]);
      
      // Call the handler
      onCommand(userInput);
      
      // Clear input
      setUserInput('');
    }
  };

  // Format line based on content
  const formatLine = (line: string) => {
    if (line.startsWith('#')) {
      return <span style={{ color: colors.comment }}>{line}</span>;
    }
    return line;
  };

  return (
    <div className="bg-cyber-slate/80 border border-cyber-blue/30 rounded-md overflow-hidden">
      {title && (
        <div className="border-b border-cyber-blue/20 py-2 px-4 flex items-center">
          <span className="text-sm text-cyber-light/70">{title}</span>
        </div>
      )}
      <div 
        className={cn(
          "font-mono text-left p-4 sm:p-6 overflow-hidden text-sm sm:text-base",
          interactive && "h-[400px] sm:h-[500px] flex flex-col",
          className
        )}
        onClick={focusInput}
        ref={terminalRef}
      >
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-2 text-cyber-light/60 text-xs sm:text-sm">{promptText}</span>
        </div>
        
        <div className={cn("text-cyber-light/90", interactive && "flex-1 overflow-y-auto mb-4")}>
          {displayedLines.map((line, index) => (
            <div key={`line-${index}`} className="mb-1">
              {line.startsWith('$') ? (
                line
              ) : (
                <>
                  <span style={{ color: colors.prompt }} className="mr-2">$</span> {formatLine(line)}
                </>
              )}
            </div>
          ))}
          
          {currentLine < lines.length && (
            <div>
              <span style={{ color: colors.prompt }} className="mr-2">$</span> 
              <span style={{ color: colors.command }}>
                {formatLine(lines[currentLine].substring(0, displayedChars))}
              </span>
              {cursor ? <span className="animate-pulse">_</span> : <span> </span>}
            </div>
          )}
        </div>
        
        {interactive && initialTypingComplete && (
          <form onSubmit={handleInputSubmit} className="mt-auto flex items-center border-t border-cyber-blue/20 pt-3">
            <span style={{ color: colors.prompt }} className="mr-2">$</span>
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              className="flex-1 bg-transparent outline-none text-cyber-light/90"
              placeholder="Type a command (try 'help')..."
              autoFocus
            />
            {cursor && !userInput && <span className="animate-pulse">_</span>}
          </form>
        )}
      </div>
    </div>
  );
};

// We need to export both default and named export to support both import styles
export default Terminal;
