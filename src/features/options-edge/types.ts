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
  category: "Earnings" | "Company" | "Analyst" | "Macro" | "Regulatory" | "Product" | "Industry";
  impact: "High" | "Medium" | "Low";
  summary: string;
  whyItMatters: string;
  url?: string;
}

export interface EarningsData {
  date: string;
  days: number;
  session: "Before market" | "After market" | "Time not confirmed";
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

export type SetupOutcome = "Potential Call" | "Potential Put" | "Watch" | "No Setup";

export interface SetupDetail {
  label: "Potential Call" | "Potential Put";
  status: SetupOutcome;
  met: string[];
  unmet: string[];
  confirmation: string;
  invalidation: string;
  risks: string[];
  explanation: string;
}

export interface TradeSetupData {
  bias: Bias;
  trend: "Strong Bullish" | "Bullish" | "Neutral" | "Bearish" | "Strong Bearish";
  momentum: "Strong" | "Positive" | "Neutral" | "Weak" | "Negative";
  volume: "Confirming" | "Neutral" | "Weak";
  support: string;
  resistance: string;
  catalysts: string[];
  status: SetupOutcome;
  biasExplanation: string;
  momentumExplanation: string;
  call: SetupDetail;
  put: SetupDetail;
}

export interface OptionContract {
  id: string;
  type: "Call" | "Put";
  expiration: string;
  strike: number;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  openInterest: number;
  iv: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  moneyness: "ITM" | "ATM" | "OTM";
}

export interface DashboardPreferences {
  timeframe: string;
  visiblePanels: Record<"news" | "earnings" | "analyzer" | "overview" | "alerts", boolean>;
  notifications: boolean;
  compactMode: boolean;
}
