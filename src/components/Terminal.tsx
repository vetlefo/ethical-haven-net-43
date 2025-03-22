
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
}

const Terminal: React.FC<TerminalProps> = ({
  lines,
  typingSpeed = 25,
  startDelay = 1000,
  className,
  interactive = false,
  onCommand,
  promptText = "cybersecure@terminal:~",
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setStarted(true);
    }, startDelay);

    return () => clearTimeout(timer);
  }, [startDelay]);

  useEffect(() => {
    if (!started || currentLine >= lines.length) {
      if (started && currentLine >= lines.length && !initialTypingComplete) {
        setInitialTypingComplete(true);
      }
      return;
    }

    const lineToType = lines[currentLine];
    
    if (displayedChars < lineToType.length) {
      const timer = setTimeout(() => {
        setDisplayedChars(displayedChars + 1);
      }, typingSpeed);
      
      return () => clearTimeout(timer);
    } else {
      // Line complete
      const newDisplayedLines = [...displayedLines];
      newDisplayedLines[currentLine] = lineToType;
      
      const timer = setTimeout(() => {
        setDisplayedLines(newDisplayedLines);
        setCurrentLine(currentLine + 1);
        setDisplayedChars(0);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [displayedChars, displayedLines, currentLine, lines, started, typingSpeed, initialTypingComplete]);

  // Blinking cursor
  useEffect(() => {
    const timer = setInterval(() => {
      setCursor((prev) => !prev);
    }, 500);
    
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [displayedLines, userInput]);

  // Focus input when terminal is clicked
  const focusInput = () => {
    if (interactive && initialTypingComplete && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userInput.trim() && onCommand) {
      // Add the command to displayed lines
      const commandLine = `$ ${userInput}`;
      setDisplayedLines(prev => [...prev, commandLine]);
      
      // Call the handler
      onCommand(userInput);
      
      // Clear input
      setUserInput('');
    }
  };

  return (
    <div 
      className={cn(
        "glass-card font-mono text-left p-4 sm:p-6 overflow-hidden text-sm sm:text-base",
        interactive && "h-[400px] sm:h-[500px] flex flex-col",
        className
      )}
      onClick={focusInput}
      ref={terminalRef}
    >
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="ml-2 text-cyber-light/60 text-xs sm:text-sm">{promptText}</span>
      </div>
      
      <div className={cn("text-cyber-light/90", interactive && "flex-1 overflow-y-auto mb-4")}>
        {displayedLines.map((line, index) => (
          <div key={index} className="mb-1">
            {line.startsWith('$') ? (
              line
            ) : (
              <>
                <span className="text-cyber-blue mr-2">$</span> {line}
              </>
            )}
          </div>
        ))}
        
        {currentLine < lines.length && (
          <div>
            <span className="text-cyber-blue mr-2">$</span> {lines[currentLine].substring(0, displayedChars)}
            {cursor ? <span className="animate-pulse">_</span> : <span> </span>}
          </div>
        )}
      </div>
      
      {interactive && initialTypingComplete && (
        <form onSubmit={handleInputSubmit} className="mt-auto flex items-center border-t border-cyber-blue/20 pt-3">
          <span className="text-cyber-blue mr-2">$</span>
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
  );
};

export default Terminal;
