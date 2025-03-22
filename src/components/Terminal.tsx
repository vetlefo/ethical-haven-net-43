
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TerminalProps {
  lines: string[];
  typingSpeed?: number;
  startDelay?: number;
  className?: string;
}

const Terminal: React.FC<TerminalProps> = ({
  lines,
  typingSpeed = 25,
  startDelay = 1000,
  className,
}) => {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedChars, setDisplayedChars] = useState(0);
  const [cursor, setCursor] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStarted(true);
    }, startDelay);

    return () => clearTimeout(timer);
  }, [startDelay]);

  useEffect(() => {
    if (!started || currentLine >= lines.length) return;

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
  }, [displayedChars, displayedLines, currentLine, lines, started, typingSpeed]);

  // Blinking cursor
  useEffect(() => {
    const timer = setInterval(() => {
      setCursor((prev) => !prev);
    }, 500);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className={cn(
        "glass-card font-mono text-left p-4 sm:p-6 overflow-hidden text-sm sm:text-base",
        className
      )}
    >
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="ml-2 text-cyber-light/60 text-xs sm:text-sm">cybersecure@terminal:~</span>
      </div>
      <div className="text-cyber-light/90">
        {displayedLines.map((line, index) => (
          <div key={index} className="mb-1">
            <span className="text-cyber-blue mr-2">$</span> {line}
          </div>
        ))}
        {currentLine < lines.length && (
          <div>
            <span className="text-cyber-blue mr-2">$</span> {lines[currentLine].substring(0, displayedChars)}
            {cursor ? <span className="animate-pulse">_</span> : <span> </span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;
