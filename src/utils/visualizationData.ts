
export interface VisualizationDataPoint {
  name: string;
  value: number;
  description: string;
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
