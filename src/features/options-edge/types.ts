export type Bias = "Bullish" | "Bearish" | "Neutral";
export type SetupStatus = "Monitoring" | "Developing" | "Confirmed" | "No Setup";

export interface Company {
  symbol: string;
  name: string;
  price: number;
  change: number;
  earningsDays?: number;
  spark: number[];
}

export interface NewsItem {
  id: string;
  symbol: string;
  headline: string;
  source: string;
  timestamp: string;
  category: "Earnings" | "Company News" | "Analyst Ratings" | "Macroeconomic";
  impact: "High" | "Medium" | "Low";
  summary: string;
  url?: string;
}

export interface EarningsData {
  date: string;
  days: number;
  session: "Before market" | "After market";
  estimatedEps: string;
  history: { quarter: string; reaction: number; result: string }[];
}

export interface AnalysisData {
  bias: Bias;
  status: SetupStatus;
  trend: string;
  momentum: string;
  volume: string;
  support: string[];
  resistance: string[];
  catalysts: string[];
  callConditions: string[];
  putConditions: string[];
  risk: string[];
  confidence: number;
}

export interface DashboardPreferences {
  timeframe: string;
  visiblePanels: Record<"news" | "earnings" | "analyzer" | "overview", boolean>;
  notifications: boolean;
  compactMode: boolean;
}
