
import React, { useState, useEffect } from 'react';
import Terminal from './Terminal';
import { cn } from '@/lib/utils';

interface MarketDataTerminalProps {
  className?: string;
}

const MarketDataTerminal: React.FC<MarketDataTerminalProps> = ({ className }) => {
  const marketDataLines = [
    "Market analysis initiated",
    "Analyzing compliance software market...",
    "Key Metrics:",
    "",
    "Germany: $8.14B market (2030) | 12.4% CAGR | High regulatory complexity",
    "UK: $10.91B market (2030) | 11.6% CAGR | High regulatory complexity",
    "US: $33.1B market (2024) | 10.9% CAGR | High regulatory complexity",
    "",
    "Southeast Asia Growth Leaders:",
    "Indonesia: 24.6% RegTech CAGR | Vietnam: 22.0% RegTech CAGR",
    "Philippines: 19.7% RegTech CAGR | Singapore: 16.7% RegTech CAGR",
    "",
    "Africa: GRC market projected at $10.93B by 2030 | 14.6% CAGR",
    "",
    "Analysis complete: Significant opportunity in both established and emerging markets"
  ];

  return (
    <Terminal
      lines={marketDataLines}
      typingSpeed={15}
      startDelay={500}
      className={cn(className)}
    />
  );
};

export default MarketDataTerminal;
