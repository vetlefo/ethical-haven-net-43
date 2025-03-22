
export interface ResearchDataCategory {
  name: string;
  description: string;
  commands: string[];
  data: string[];
}

export const researchCategories: ResearchDataCategory[] = [
  {
    name: "market",
    description: "Global compliance market size and projections",
    commands: ["show market", "market data", "market size"],
    data: [
      "Market analysis initiated",
      "Analyzing compliance software market...",
      "Key Metrics:",
      "",
      "Germany: $8.14B market (2030) | 12.4% CAGR | High regulatory complexity",
      "UK: $10.91B market (2030) | 11.6% CAGR | High regulatory complexity",
      "US: $33.1B market (2024) | 10.9% CAGR | High regulatory complexity",
      "",
      "Analysis complete: Significant opportunity in both established markets"
    ]
  },
  {
    name: "growth",
    description: "Fastest growing compliance markets",
    commands: ["show growth", "growth regions", "growth data"],
    data: [
      "Analyzing high-growth regions...",
      "Southeast Asia Growth Leaders:",
      "Indonesia: 24.6% RegTech CAGR | Vietnam: 22.0% RegTech CAGR",
      "Philippines: 19.7% RegTech CAGR | Singapore: 16.7% RegTech CAGR",
      "",
      "Africa: GRC market projected at $10.93B by 2030 | 14.6% CAGR",
      "",
      "Analysis complete: Emerging markets show highest growth potential"
    ]
  },
  {
    name: "regulations",
    description: "Regulatory landscape overview",
    commands: ["show regulations", "regulatory data", "compliance requirements"],
    data: [
      "Analyzing regulatory landscape...",
      "Key regulatory frameworks affecting global compliance:",
      "EU: GDPR, DORA, MiCA, NIS2 Directive, AI Act",
      "US: CCPA, NYDFS, Sarbanes-Oxley, HIPAA",
      "Asia: PIPL (China), PDPA (Singapore), APPI (Japan)",
      "",
      "Trend analysis: 47% increase in regulatory requirements since 2018",
      "Forecast: 30% additional increase by 2026",
      "",
      "Analysis complete: Regulatory complexity driving compliance demand"
    ]
  },
  {
    name: "competitors",
    description: "Competitor landscape analysis",
    commands: ["show competitors", "competitor analysis", "market players"],
    data: [
      "Analyzing competitor landscape...",
      "Major players by market share:",
      "Enterprise segment: MetricStream (23%), IBM (19%), SAP (16%)",
      "Mid-market: AuditBoard (14%), Galvanize (11%), LogicGate (9%)",
      "SMB: ZenGRC (7%), Resolver (6%), StandardFusion (5%)",
      "",
      "Consolidation trend: 28 major acquisitions in last 24 months",
      "Funding analysis: $2.8B invested in RegTech startups (2022-2023)",
      "",
      "Analysis complete: Fragmented market with consolidation opportunities"
    ]
  },
  {
    name: "roi",
    description: "Return on investment data for compliance solutions",
    commands: ["show roi", "investment returns", "value proposition"],
    data: [
      "Calculating ROI metrics for compliance implementations...",
      "Average ROI findings:",
      "Large enterprise: 287% ROI over 3 years | 9 month payback period",
      "Mid-market: 342% ROI over 3 years | 7 month payback period",
      "SMB: 412% ROI over 3 years | 5 month payback period",
      "",
      "Cost reduction areas:",
      "Manual effort reduction: 68%",
      "Audit cost reduction: 41%",
      "Average compliance failure prevention value: $4.2M annually",
      "",
      "Analysis complete: Strong ROI case across all market segments"
    ]
  },
  {
    name: "help",
    description: "Available research commands",
    commands: ["help", "commands", "?"],
    data: [
      "Available research commands:",
      "",
      "market - Global compliance market size and projections",
      "growth - Fastest growing compliance markets",
      "regulations - Regulatory landscape overview", 
      "competitors - Competitor landscape analysis",
      "roi - Return on investment data for compliance solutions",
      "clear - Clear the terminal",
      "help - Show this help message",
      "",
      "Type a command to continue..."
    ]
  }
];

export const findResearchCategory = (input: string): ResearchDataCategory | null => {
  const normalizedInput = input.toLowerCase().trim();
  
  // First check exact command match
  for (const category of researchCategories) {
    if (category.commands.some(cmd => normalizedInput === cmd)) {
      return category;
    }
  }
  
  // Then check partial match
  for (const category of researchCategories) {
    if (
      category.name === normalizedInput ||
      category.commands.some(cmd => normalizedInput.includes(cmd.toLowerCase())) ||
      normalizedInput.includes(category.name)
    ) {
      return category;
    }
  }
  
  return null;
};

export const getDefaultResponse = (): string[] => [
  "Command not recognized. Type 'help' to see available commands."
];
