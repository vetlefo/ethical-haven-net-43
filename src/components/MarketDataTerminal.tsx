
import React, { useState, useRef, useEffect } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client

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
          brightWhite: '#ffffff'
        }
      });

      fitAddon.current = new FitAddon();
      term.current.loadAddon(fitAddon.current);
      term.current.open(terminalRef.current);
      fitAddon.current.fit();

      term.current.writeln('Welcome to the Compliance Research Terminal');
      term.current.writeln('Type `help` to see available commands.');

      term.current.onData((data) => {
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
      response: (): CommandResponse[] => {
        return [
          {
            type: 'text',
            content: 'Available commands:\n'
          },
          ...Object.entries(commands).map(([command, { description }]) => ({
            type: 'text' as const,
            content: `- ${command}: ${description}\n`
          }))
        ];
      }
    },
    clear: {
      description: 'Clear the terminal',
      response: (): CommandResponse[] => {
        term.current?.clear();
        return [];
      }
    },
    market: {
      description: 'Get market analysis insights',
      response: (): CommandResponse[] => {
        return [
          {
            type: 'text',
            content: 'Market analysis insights:\n'
          },
          {
            type: 'text',
            content: '- Global compliance market is growing rapidly.\n'
          },
          {
            type: 'text',
            content: '- Key regions: North America, Europe, Asia-Pacific.\n'
          }
        ];
      }
    },
    growth: {
      description: 'Display growth forecasts',
      response: (): CommandResponse[] => {
        return [
          {
            type: 'text',
            content: 'Growth forecasts:\n'
          },
          {
            type: 'text',
            content: '- Expected CAGR of 10-15% over the next 5 years.\n'
          },
          {
            type: 'text',
            content: '- Driven by increasing regulatory complexity.\n'
          }
        ];
      }
    },
    regulations: {
      description: 'List key compliance regulations',
      response: (): CommandResponse[] => {
        return [
          {
            type: 'text',
            content: 'Key compliance regulations:\n'
          },
          {
            type: 'text',
            content: '- GDPR, CCPA, HIPAA, SOX.\n'
          },
          {
            type: 'text',
            content: '- PSD2, MiFID II, Basel III.\n'
          }
        ];
      }
    },
    competitors: {
      description: 'Show major competitors in the market',
      response: (): CommandResponse[] => {
        return [
          {
            type: 'text',
            content: 'Major competitors:\n'
          },
          {
            type: 'text',
            content: '- Thomson Reuters, Wolters Kluwer, SAI Global.\n'
          },
          {
            type: 'text',
            content: '- MetricStream, NAVEX Global, LogicManager.\n'
          }
        ];
      }
    },
    roi: {
      description: 'Explain ROI of compliance software',
      response: (): CommandResponse[] => {
        return [
          {
            type: 'text',
            content: 'ROI of compliance software:\n'
          },
          {
            type: 'text',
            content: '- Reduced risk of fines and penalties.\n'
          },
          {
            type: 'text',
            content: '- Improved operational efficiency.\n'
          }
        ];
      }
    },
    reports: {
      description: 'Show available compliance reports',
      response: (): CommandResponse[] => {
        return [
          {
            type: 'text',
            content: '=== Available Compliance Reports ===\n'
          },
          {
            type: 'text',
            content: '> Germany Market Analysis: GDPR, NIS2, LkSG, IT Security Act 2.0\n'
          },
          {
            type: 'link',
            content: 'View full report: /reports/germany-market-analysis\n',
            url: '/reports/germany-market-analysis'
          },
          {
            type: 'text',
            content: '\nAdditional reports available in Reports section.'
          }
        ];
      }
    },
    ask: {
      description: 'Ask a question about compliance topics (e.g., `ask what is LkSG?`)',
      response: (): CommandResponse[] => {
        // This will be handled asynchronously in processCommand
        return [{ type: 'text', content: 'Processing your question...\n' }];
      }
    }
  };

  const handleInput = (data: string) => {
    const charCode = data.charCodeAt(0);
    if (charCode === 13) { // Enter key
      processCommand();
    } else if (charCode === 127) { // Backspace key
      if (currentCommand.length > 0) {
        term.current?.write('\b \b');
        setCurrentCommand(currentCommand.slice(0, -1));
      }
    } else if (charCode === 27) { // Escape key (handle arrow keys)
      // Arrow key sequences are typically ESC + [ + A/B/C/D
      // We need to buffer these and handle them together
    } else if (charCode === 9) { // Tab key
      // Prevent default tab behavior
      // You can implement tab completion here if desired
    } else if (charCode === 3) { // Ctrl+C
      term.current?.write('^C');
      term.current?.write('\r\n');
      printPrompt();
      setCurrentCommand('');
    }
    else if (charCode === 27) {
      // Handle arrow keys
      if (data === '\x1b[A') { // Up arrow
        if (historyIndex < commandHistory.length - 1) {
          const newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
          setHistoryIndex(newIndex);
          const command = commandHistory[commandHistory.length - 1 - newIndex];
          clearCurrentInput();
          term.current?.write(command);
          setCurrentCommand(command);
        }
      } else if (data === '\x1b[B') { // Down arrow
        if (historyIndex > -1) {
          const newIndex = Math.max(historyIndex - 1, -1);
          setHistoryIndex(newIndex);
          clearCurrentInput();
          if (newIndex === -1) {
            setCurrentCommand('');
          } else {
            const command = commandHistory[commandHistory.length - 1 - newIndex];
            term.current?.write(command);
            setCurrentCommand(command);
          }
        }
      } else {
        term.current?.write(data);
        setCurrentCommand(currentCommand + data);
      }
    }
    else {
      term.current?.write(data);
      setCurrentCommand(currentCommand + data);
    }
  };

  const clearCurrentInput = () => {
    for (let i = 0; i < currentCommand.length; i++) {
      term.current?.write('\b \b');
    }
  };

  const printPrompt = () => {
    term.current?.write('\r\n$ ');
  };

  const processCommand = async () => { // Make async
    term.current?.write('\r\n');
    const commandInput = currentCommand.trim(); // Rename to avoid conflict
    if (commandInput.length === 0) { // Use commandInput
      printPrompt();
      setCurrentCommand('');
      return;
    }

    // Add command to history
    setCommandHistory(prevHistory => [...prevHistory, commandInput]); // Use commandInput
    setHistoryIndex(-1); // Reset history index
    setCurrentCommand(''); // Clear current command input

    const [baseCommand, ...args] = commandInput.split(' '); // Use commandInput
    const cmd = commands[baseCommand];

    if (baseCommand === 'ask') {
      const query = args.join(' ');
      if (!query) {
        term.current?.write('Please provide a question after the ask command.\n');
        printPrompt();
        return;
      }

      term.current?.write('Processing your question...\r\n');
      try {
        // Call the RAG search function
        const { data, error } = await supabase.functions.invoke('rag-search', {
          body: { query },
        });

        if (error) {
          console.error("RAG search error:", error);
          term.current?.write(`\x1b[31mError: ${error.message || 'Failed to process query.'}\x1b[0m\n`);
        } else if (data && data.success) {
          term.current?.write(`\x1b[32mAnswer:\x1b[0m ${data.answer}\n`);
          if (data.sources && data.sources.length > 0) {
            term.current?.write('\n\x1b[34mSources:\x1b[0m\n');
            data.sources.forEach((source: any, index: number) => {
              term.current?.write(` [${index + 1}] Doc: ${source.document_id}, Chunk: ${source.chunk_id} (Similarity: ${source.similarity?.toFixed(3)})\n`);
            });
          }
        } else {
          term.current?.write(`\x1b[31mError: ${data?.error || 'Received unexpected response from server.'}\x1b[0m\n`);
        }
      } catch (invokeError) {
        console.error("Error invoking RAG search function:", invokeError);
        const errorMessage = invokeError instanceof Error ? invokeError.message : 'An unknown error occurred during the search.';
        term.current?.write(`\x1b[31mError: ${errorMessage}\x1b[0m\n`);
      }
    } else if (cmd) {
      // Handle predefined synchronous commands
      const responses = cmd.response(args);
      responses.forEach(response => {
        if (response.type === 'text') {
          term.current?.write(response.content);
        } else if (response.type === 'link' && response.url) {
          // Link handling (simplified, no absolute positioning)
          const match = response.content.match(/(.*): (.*)/);
          if (match) {
            const [, beforeLink, linkText] = match;
            term.current?.write(beforeLink + ': ');
            // Underline link text and make it navigable via router
            term.current?.write(`\x1b[4m${linkText.trim()}\x1b[0m`); // Underline
            // Note: Making terminal text directly clickable to navigate is complex with xterm.js
            // We rely on the user copying/pasting or recognizing the URL pattern.
            // Or potentially adding a separate clickable element outside the terminal.
            term.current?.write('\r\n');
          } else {
            term.current?.write(response.content);
          }
        }
      });
    } else {
      term.current?.write(`Command not found: ${baseCommand}\r\n`); // Use baseCommand
    }

    printPrompt();
    // setCurrentCommand(''); // Already cleared at the start of processing
  };

  return (
    <div 
      className={className}
      style={{
        backgroundColor: '#0c1427',
        border: '1px solid #3498db',
        borderRadius: '8px',
        padding: '10px'
      }}
    >
      <div ref={terminalRef} />
    </div>
  );
};

export default MarketDataTerminal;
