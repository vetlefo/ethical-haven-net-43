
import { AlertTriangle, BarChart3, Layers, Zap, Database, Globe } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface ResearchFinding {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  details: string[];
  image: string;
}

export const researchFindings: ResearchFinding[] = [
  {
    id: "pain-points",
    icon: AlertTriangle,
    title: "Market Pain Points",
    description: "Our research identified these critical challenges in the current compliance software landscape:",
    details: [
      "Regulatory Complexity: 87% of compliance officers struggle with the volume and complexity of regulations across jurisdictions.",
      "Data Silos & Manual Processes: Compliance data often scattered across disparate systems and managed through inefficient manual processes.",
      "User-Unfriendly Software: Existing compliance software often has complex interfaces and steep learning curves.",
      "Inadequate Localization: Lack of market-specific customization makes global compliance difficult.",
      "Limited Reporting & Analytics: Current solutions lack customizable reporting, trend analysis, and benchmarking capabilities."
    ],
    image: "https://placehold.co/600x400/0ea5e9/FFFFFF/png?text=Pain+Points+Analysis"
  },
  {
    id: "entry-strategy",
    icon: Layers,
    title: "Market Entry Strategy",
    description: "Our recommended approach for entering the global compliance software market:",
    details: [
      "Priority 1: Germany - $8.14B market (2030), 12.4% CAGR, medium competition, high regulatory complexity",
      "Priority 2: United Kingdom - $10.91B market (2030), 11.6% CAGR, high competition, strong regulatory environment",
      "Priority 3: United States - $33.1B market (2024), 10.9% CAGR, high competition, complex regulatory framework",
      "Phased rollout starting with Germany, then UK, then US",
      "Leverage strategic partnerships for market entry and client acquisition",
      "Focus on user-friendly design and seamless integration as key differentiators"
    ],
    image: "https://placehold.co/600x400/0ea5e9/FFFFFF/png?text=Market+Entry+Strategy"
  },
  {
    id: "growth-drivers",
    icon: BarChart3,
    title: "Market Growth Drivers",
    description: "Key factors driving the rapid growth in the compliance software market:",
    details: [
      "Increasing regulatory complexity and enforcement across jurisdictions",
      "Growing focus on ESG reporting and transparency",
      "Rising costs of non-compliance (fines, penalties, reputational damage)",
      "Digital transformation accelerating demand for automated compliance solutions",
      "Greater focus on whistleblower protection and corporate governance",
      "Increasing cybersecurity threats and data protection requirements"
    ],
    image: "https://placehold.co/600x400/0ea5e9/FFFFFF/png?text=Growth+Drivers"
  },
  {
    id: "competitive",
    icon: Database,
    title: "Competitive Landscape",
    description: "Analysis of the current competitive environment in key markets:",
    details: [
      "Moderately fragmented market with opportunities for differentiation",
      "Major players include NAVEX, Whistlelink, AuditBoard across various categories",
      "European market dominated by regional players with strong data privacy focus",
      "US market highly competitive with both established players and new entrants",
      "ASEAN markets relatively underserved with fewer established players",
      "Key differentiators: user experience, integration capabilities, and localization"
    ],
    image: "https://placehold.co/600x400/0ea5e9/FFFFFF/png?text=Competitive+Landscape"
  },
  {
    id: "partnership",
    icon: Globe,
    title: "Partnership Strategy",
    description: "Strategic partnership opportunities to accelerate market entry and growth:",
    details: [
      "Leverage existing relationship with EY for market entry in primary targets",
      "Collaborate to offer combined solution (technology + consulting services)",
      "Explore potential integrations with existing EY compliance offerings",
      "Utilize EY's global network for expansion into secondary markets",
      "Consider partnerships with regional players in ASEAN markets",
      "Explore collaborations with industry associations and regulatory bodies"
    ],
    image: "https://placehold.co/600x400/0ea5e9/FFFFFF/png?text=Partnership+Strategy"
  },
  {
    id: "success-metrics",
    icon: Zap,
    title: "Key Success Metrics",
    description: "Critical metrics to track for successful market entry and growth:",
    details: [
      "Market share in target markets",
      "Customer acquisition cost and lifetime value",
      "Customer satisfaction and Net Promoter Score (NPS)",
      "Regulatory compliance rates for customers",
      "Number and value of strategic partnerships",
      "Product adoption and feature utilization rates"
    ],
    image: "https://placehold.co/600x400/0ea5e9/FFFFFF/png?text=Success+Metrics"
  }
];

export const getTerminalCommands = (tab: string): string[] => {
  switch(tab) {
    case 'pain-points':
      return [
        "cd ~/research/market-analysis",
        "ls -la",
        "cat pain-points.json | jq",
        "npm run visualization --type=radar --dataset=pain-points",
        "# Generating visualization..."
      ];
    case 'entry-strategy':
      return [
        "cd ~/research/market-strategy",
        "ls -la",
        "grep -r 'Priority' ./entry-strategy.md",
        "python3 analyze.py --region=EMEA --focus=entry",
        "# Analyzing entry strategy data..."
      ];
    case 'growth-drivers':
      return [
        "cd ~/research/trends",
        "git pull origin main",
        "cat growth-factors.csv | sort -k2 -nr | head -10",
        "node generate-chart.js --data=growth-drivers",
        "# Processing growth data..."
      ];
    case 'competitive':
      return [
        "cd ~/research/competitors",
        "find . -name '*.xlsx' | xargs -I{} xlsx2csv {}",
        "curl -s api.market.io/v1/competitors | jq '.data[]'",
        "./analyze-competitors.sh --region=global",
        "# Mapping competitive landscape..."
      ];
    case 'partnership':
      return [
        "cd ~/research/partnerships",
        "git checkout strategy-branch",
        "grep -r 'EY' --include='*.md' .",
        "python3 partnership-model.py --simulate --years=5",
        "# Calculating partnership ROI..."
      ];
    case 'success-metrics':
      return [
        "cd ~/research/metrics",
        "cat KPIs.yaml",
        "./benchmark-calculator --industry=compliance --region=global",
        "node metrics-dashboard.js --interactive",
        "# Generating metrics dashboard..."
      ];
    default:
      return [
        "cd ~/research",
        "ls -la",
        "cat README.md",
        "# Loading research data..."
      ];
  }
};
