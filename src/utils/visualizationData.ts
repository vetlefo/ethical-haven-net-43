
export interface VisualizationDataPoint {
  name: string;
  value: number;
  description: string;
}

export interface MarketEntryDataPoint {
  market: string;
  criterion: string;
  rating: string;
}

export interface VisualizationData {
  type: string;
  data: VisualizationDataPoint[];
}

export const painPointsData: VisualizationDataPoint[] = [
  { name: "Regulatory Complexity", value: 87, description: "87% of compliance officers struggle with regulatory complexity" },
  { name: "Data Silos", value: 76, description: "76% report data scattered across disparate systems" },
  { name: "User-Unfriendly Software", value: 68, description: "68% find existing solutions have steep learning curves" },
  { name: "Inadequate Localization", value: 72, description: "72% struggle with lack of market-specific customization" },
  { name: "Limited Reporting", value: 81, description: "81% need more customizable reporting capabilities" }
];

export const marketEntryData: MarketEntryDataPoint[] = [
  { market: "Germany", criterion: "Market Size", rating: "High" },
  { market: "Germany", criterion: "Growth Rate", rating: "High" },
  { market: "Germany", criterion: "Regulatory Complexity", rating: "High" },
  { market: "Germany", criterion: "Competitive Intensity", rating: "Medium" },
  { market: "Germany", criterion: "Ease of Localization", rating: "Medium" },
  { market: "Germany", criterion: "Potential for Partnership with EY", rating: "High" },
  { market: "Germany", criterion: "Alignment with Existing MittVarsel Expertise", rating: "High" },
  { market: "United Kingdom", criterion: "Market Size", rating: "High" },
  { market: "United Kingdom", criterion: "Growth Rate", rating: "High" },
  { market: "United Kingdom", criterion: "Regulatory Complexity", rating: "High" },
  { market: "United Kingdom", criterion: "Competitive Intensity", rating: "High" },
  { market: "United Kingdom", criterion: "Ease of Localization", rating: "High" },
  { market: "United Kingdom", criterion: "Potential for Partnership with EY", rating: "High" },
  { market: "United Kingdom", criterion: "Alignment with Existing MittVarsel Expertise", rating: "High" },
  { market: "United States", criterion: "Market Size", rating: "High" },
  { market: "United States", criterion: "Growth Rate", rating: "High" },
  { market: "United States", criterion: "Regulatory Complexity", rating: "High" },
  { market: "United States", criterion: "Competitive Intensity", rating: "High" },
  { market: "United States", criterion: "Ease of Localization", rating: "High" },
  { market: "United States", criterion: "Potential for Partnership with EY", rating: "High" },
  { market: "United States", criterion: "Alignment with Existing MittVarsel Expertise", rating: "Medium" },
  { market: "Singapore", criterion: "Market Size", rating: "Medium" },
  { market: "Singapore", criterion: "Growth Rate", rating: "High" },
  { market: "Singapore", criterion: "Regulatory Complexity", rating: "Medium" },
  { market: "Singapore", criterion: "Competitive Intensity", rating: "Medium" },
  { market: "Singapore", criterion: "Ease of Localization", rating: "High" },
  { market: "Singapore", criterion: "Potential for Partnership with EY", rating: "High" },
  { market: "Singapore", criterion: "Alignment with Existing MittVarsel Expertise", rating: "Medium" },
  { market: "Indonesia", criterion: "Market Size", rating: "Medium" },
  { market: "Indonesia", criterion: "Growth Rate", rating: "Very High" },
  { market: "Indonesia", criterion: "Regulatory Complexity", rating: "Medium" },
  { market: "Indonesia", criterion: "Competitive Intensity", rating: "Low" },
  { market: "Indonesia", criterion: "Ease of Localization", rating: "Medium" },
  { market: "Indonesia", criterion: "Potential for Partnership with EY", rating: "High" },
  { market: "Indonesia", criterion: "Alignment with Existing MittVarsel Expertise", rating: "Medium" },
  { market: "Vietnam", criterion: "Market Size", rating: "Low" },
  { market: "Vietnam", criterion: "Growth Rate", rating: "Very High" },
  { market: "Vietnam", criterion: "Regulatory Complexity", rating: "Medium" },
  { market: "Vietnam", criterion: "Competitive Intensity", rating: "Low" },
  { market: "Vietnam", criterion: "Ease of Localization", rating: "Low" },
  { market: "Vietnam", criterion: "Potential for Partnership with EY", rating: "High" },
  { market: "Vietnam", criterion: "Alignment with Existing MittVarsel Expertise", rating: "Medium" },
  { market: "Thailand", criterion: "Market Size", rating: "Low" },
  { market: "Thailand", criterion: "Growth Rate", rating: "High" },
  { market: "Thailand", criterion: "Regulatory Complexity", rating: "Medium" },
  { market: "Thailand", criterion: "Competitive Intensity", rating: "Low" },
  { market: "Thailand", criterion: "Ease of Localization", rating: "Low" },
  { market: "Thailand", criterion: "Potential for Partnership with EY", rating: "High" },
  { market: "Thailand", criterion: "Alignment with Existing MittVarsel Expertise", rating: "Low" },
  { market: "Philippines", criterion: "Market Size", rating: "Low" },
  { market: "Philippines", criterion: "Growth Rate", rating: "High" },
  { market: "Philippines", criterion: "Regulatory Complexity", rating: "Medium" },
  { market: "Philippines", criterion: "Competitive Intensity", rating: "Low" },
  { market: "Philippines", criterion: "Ease of Localization", rating: "High" },
  { market: "Philippines", criterion: "Potential for Partnership with EY", rating: "High" },
  { market: "Philippines", criterion: "Alignment with Existing MittVarsel Expertise", rating: "Medium" },
  { market: "African Countries", criterion: "Market Size", rating: "Medium" },
  { market: "African Countries", criterion: "Growth Rate", rating: "High" },
  { market: "African Countries", criterion: "Regulatory Complexity", rating: "Medium" },
  { market: "African Countries", criterion: "Competitive Intensity", rating: "Medium" },
  { market: "African Countries", criterion: "Ease of Localization", rating: "Low" },
  { market: "African Countries", criterion: "Potential for Partnership with EY", rating: "High" },
  { market: "African Countries", criterion: "Alignment with Existing MittVarsel Expertise", rating: "Medium" }
];
