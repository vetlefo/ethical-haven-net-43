import { AlertTriangle, BarChart, Crosshair, FileText, Globe, LucideIcon, Users } from 'lucide-react';

interface ResearchDetail {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  details: string[];
  image: string;
}

export const researchFindings = [
  {
    id: "pain-points",
    icon: AlertTriangle,
    title: "Market Pain Points",
    description: "Our market research identified several critical pain points in the compliance software market that represent key opportunities for ReportCase.",
    details: [
      "87% of compliance officers struggle with regulatory complexity",
      "76% report data silos hampering effective compliance monitoring",
      "68% find existing solutions have steep learning curves",
      "72% struggle with lack of market-specific customization",
      "81% need more customizable reporting capabilities"
    ],
    image: "/images/pain-points.jpg"
  },
  {
    id: "market-entry",
    icon: Globe,
    title: "Market Entry Strategy",
    description: "Analysis of potential target markets for ReportCase's international expansion based on multiple strategic criteria.",
    details: [
      "Germany, UK, and US show strongest overall market potential",
      "Emerging markets like Indonesia and Vietnam offer high growth rates",
      "Partnership potential exists across all evaluated markets",
      "Regulatory complexity varies significantly by region",
      "Localization requirements present challenges in several target markets"
    ],
    image: "/images/market-strategy.jpg"
  },
  {
    id: "competitive-analysis",
    icon: Crosshair,
    title: "Competitive Analysis",
    description: "Comprehensive analysis of the competitive landscape to identify strategic positioning opportunities.",
    details: [
      "Big Four dominate enterprise market, but lack specialized solutions",
      "Mid-market SaaS providers show strong innovation but limited global reach",
      "Regulatory tech startups focusing on specific compliance domains",
      "Many existing solutions lack AI/ML capabilities for predictive compliance",
      "Opportunity exists for comprehensive cross-border compliance platform"
    ],
    image: "/images/competitive-analysis.jpg"
  },
  {
    id: "customer-segments",
    icon: Users,
    title: "Customer Segments",
    description: "Target customer segments with highest potential value and alignment with ReportCase's solution.",
    details: [
      "Large enterprise (1000+ employees) compliance departments",
      "Mid-market compliance teams with cross-border operations",
      "Financial services industry represents 42% of total addressable market",
      "Healthcare and pharmaceutical sectors experiencing fastest regulatory growth",
      "Manufacturing and supply chain operations seeking streamlined compliance"
    ],
    image: "/images/customer-segments.jpg"
  },
  {
    id: "regulatory-trends",
    icon: FileText,
    title: "Regulatory Trends",
    description: "Analysis of regulatory landscape developments impacting compliance needs.",
    details: [
      "85% growth in new financial regulations since 2020",
      "ESG reporting requirements expanding across jurisdictions",
      "Data privacy frameworks evolving with increasing complexity",
      "AI governance emerging as critical compliance focus area",
      "Sanctions compliance becoming increasingly dynamic and complex"
    ],
    image: "/images/regulatory-trends.jpg"
  },
  {
    id: "market-sizing",
    icon: BarChart,
    title: "Market Sizing",
    description: "Quantification of total addressable market and serviceable segments.",
    details: [
      "Global GRC software market valued at $38.2B in 2023",
      "Projected 14.2% CAGR through 2028",
      "Financial services segment represents $16.8B opportunity",
      "Enterprise segment growing at 17.3% annually",
      "Cloud-based deployment model gaining market share rapidly"
    ],
    image: "/images/market-sizing.jpg"
  }
];
