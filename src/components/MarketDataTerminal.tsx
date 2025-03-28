
import React, { useState, useRef, useEffect } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { Link, useNavigate } from 'react-router-dom';

interface MarketDataTerminalProps {
  interactive?: boolean;
  className?: string;
}

interface CommandResponse {
  type: 'text' | 'link';
  content: string;
  url?: string;
}

const MarketDataTerminal: React.FC<MarketDataTerminalProps> = ({ interactive = false, className }) => {
  const navigate = useNavigate();
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentCommand, setCurrentCommand] = useState('');

  useEffect(() => {
    if (terminalRef.current) {
      term.current = new Terminal({
        cursorBlink: true,
        disableStdin: !interactive,
        theme: {
          background: '#0c1427',
          foreground: '#b3b9c6',
          cursor: '#3498db',
          selectionBackground: '#214283',
          black: '#000000',
          red: '#C45500',
          green: '#98BC37',
          yellow: '#dbc26d',
          blue: '#3498db',
          magenta: '#bb86fc',
          cyan: '#00bcd4',
          white: '#ffffff',
          brightBlack: '#546e7a',
          brightRed: '#ff6e4b',
          brightGreen: '#aed581',
          brightYellow: '#fff59d',
          brightBlue: '#82b1ff',
          brightMagenta: '#e1bee7',
          brightCyan: '#80deea',
          brightWhite: '#ffffff',
        }
      });

      fitAddon.current = new FitAddon();
      term.current.loadAddon(fitAddon.current);
      term.current.open(terminalRef.current);
      fitAddon.current.fit();

      term.current.writeln('Welcome to the Compliance Research Terminal');
      term.current.writeln('Type `help` to see available commands.');

      term.current.onData(data => {
        if (interactive) {
          handleInput(data);
        }
      });

      const handleResize = () => {
        fitAddon.current?.fit();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        term.current?.dispose();
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [interactive]);

  useEffect(() => {
    if (term.current) {
      fitAddon.current?.fit();
    }
  }, []);

  const commands: Record<string, {
    description: string;
    command?: string;
    response: (args?: string[]) => CommandResponse[];
  }> = {
    help: {
      description: 'Show available commands',
      response: () => {
        return [
          { type: 'text', content: 'Available commands:\n' },
          ...Object.entries(commands).map(([command, { description }]) => ({
            type: 'text',
            content: `- ${command}: ${description}\n`,
          })),
        ];
      },
    },
    clear: {
      description: 'Clear the terminal',
      response: () => {
        term.current?.clear();
        return [];
      },
    },
    market: {
      description: 'Get market analysis insights',
      response: () => {
        return [
          { type: 'text', content: 'Market analysis insights:\n' },
          { type: 'text', content: '- Global compliance market is growing rapidly.\n' },
          { type: 'text', content: '- Key regions: North America, Europe, Asia-Pacific.\n' },
        ];
      },
    },
    growth: {
      description: 'Display growth forecasts',
      response: () => {
        return [
          { type: 'text', content: 'Growth forecasts:\n' },
          { type: 'text', content: '- Expected CAGR of 10-15% over the next 5 years.\n' },
          { type: 'text', content: '- Driven by increasing regulatory complexity.\n' },
        ];
      },
    },
    regulations: {
      description: 'List key compliance regulations',
      response: () => {
        return [
          { type: 'text', content: 'Key compliance regulations:\n' },
          { type: 'text', content: '- GDPR, CCPA, HIPAA, SOX.\n' },
          { type: 'text', content: '- PSD2, MiFID II, Basel III.\n' },
        ];
      },
    },
    competitors: {
      description: 'Show major competitors in the market',
      response: () => {
        return [
          { type: 'text', content: 'Major competitors:\n' },
          { type: 'text', content: '- Thomson Reuters, Wolters Kluwer, SAI Global.\n' },
          { type: 'text', content: '- MetricStream, NAVEX Global, LogicManager.\n' },
        ];
      },
    },
    roi: {
      description: 'Explain ROI of compliance software',
      response: () => {
        return [
          { type: 'text', content: 'ROI of compliance software:\n' },
          { type: 'text', content: '- Reduced risk of fines and penalties.\n' },
          { type: 'text', content: '- Improved operational efficiency.\n' },
        ];
      },
    },
    reports: {
      description: 'Show available compliance reports',
      response: () => {
        return [
          { type: 'text', content: '=== Available Compliance Reports ===\n' },
          { type: 'text', content: '> Germany Market Analysis: GDPR, NIS2, LkSG, IT Security Act 2.0\n' },
          { 
            type: 'link', 
            content: 'View full report: /reports/germany-market-analysis\n', 
            url: '/reports/germany-market-analysis' 
          },
          { type: 'text', content: '\nAdditional reports available in Reports section.' },
        ];
      }
    },
  };

  const handleInput = (data: string) => {
    const keyCode = data.charCodeAt(0);

    if (keyCode === 13) { // Enter key
      term.current?.writeln('');
      processCommand(currentCommand);
      setCommandHistory(prevHistory => [currentCommand, ...prevHistory]);
      setHistoryIndex(-1);
      setCurrentCommand('');
    } else if (keyCode === 8) { // Backspace key
      if (currentCommand.length > 0) {
        term.current?.write('\b \b');
        setCurrentCommand(prevCommand => prevCommand.slice(0, -1));
      }
    } else if (keyCode === 27) { // Escape key - Handle ANSI escape sequences
      // For simplicity, ignore ANSI escape sequences in this example
    } else if (keyCode === 9) { // Tab key
      // Implement tab completion if needed
    } else if (keyCode === 38) { // Up arrow key
      if (commandHistory.length > 0) {
        if (historyIndex < commandHistory.length - 1) {
          setHistoryIndex(prevIndex => prevIndex + 1);
          const command = commandHistory[historyIndex + 1];
          setCurrentCommand(command);
          // Clear the current input line
          for (let i = 0; i < currentCommand.length; i++) {
            term.current?.write('\b \b');
          }
          // Write the history command
          term.current?.write(command);
        }
      }
    } else if (keyCode === 40) { // Down arrow key
      if (historyIndex >= 0) {
        setHistoryIndex(prevIndex => prevIndex - 1);
        if (historyIndex === 0) {
          setCurrentCommand('');
          // Clear the current input line
          for (let i = 0; i < currentCommand.length; i++) {
            term.current?.write('\b \b');
          }
        } else {
          const command = commandHistory[historyIndex - 1];
          setCurrentCommand(command);
           // Clear the current input line
           for (let i = 0; i < currentCommand.length; i++) {
            term.current?.write('\b \b');
          }
          // Write the history command
          term.current?.write(command);
        }
      }
    }
    else {
      term.current?.write(data);
      setCurrentCommand(prevCommand => prevCommand + data);
    }
  };

  const processCommand = (command: string) => {
    const cmd = command.trim();
    if (cmd === '') return;

    const commandParts = cmd.split(' ');
    const baseCommand = commandParts[0];
    const args = commandParts.slice(1);

    if (commands[baseCommand]) {
      const response = commands[baseCommand].response(args);
      response.forEach(item => {
        if (item.type === 'text') {
          term.current?.write(item.content);
        } else if (item.type === 'link' && item.url) {
          // Handle link clicks to navigate within the app
          const linkContent = item.content;
          const linkUrl = item.url;
          
          // Create interactive link
          term.current?.write(`\x1b]8;;${linkUrl}\x1b\\${linkContent}\x1b]8;;\x1b\\`);
          
          // Alternatively, we could navigate programmatically, but this approach
          // gives the user more control to click or ignore the link
        }
      });
    } else {
      term.current?.writeln(`Command not found: ${cmd}`);
    }
  };

  return (
    <div className={className} style={{ backgroundColor: '#0c1427', border: '1px solid #3498db', borderRadius: '8px', padding: '10px' }}>
      <div ref={terminalRef} />
    </div>
  );
};

export default MarketDataTerminal;
