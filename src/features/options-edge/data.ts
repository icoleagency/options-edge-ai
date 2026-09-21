import type { AnalysisData, Company, EarningsData, NewsItem } from "./types";

export const companies: Company[] = [
  { symbol: "AAPL", name: "Apple Inc.", price: 254.63, change: 0.58, earningsDays: 31, spark: [43,45,44,48,47,51,53,52,56,58] },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 176.24, change: 1.84, earningsDays: 18, spark: [40,42,39,46,50,48,54,57,55,62] },
  { symbol: "TSLA", name: "Tesla Inc.", price: 429.52, change: -1.26, earningsDays: 9, spark: [61,58,59,53,55,49,51,47,45,43] },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 231.44, change: 0.32, spark: [41,43,42,44,48,47,49,50,52,53] },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 517.81, change: -0.18, earningsDays: 25, spark: [52,53,51,54,52,55,54,53,55,54] },
  { symbol: "META", name: "Meta Platforms", price: 748.09, change: 1.12, spark: [38,41,43,42,47,49,48,52,54,57] },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 246.15, change: 0.76, spark: [42,44,43,46,49,48,51,54,53,56] },
  { symbol: "AMD", name: "Advanced Micro Devices", price: 157.36, change: -0.92, earningsDays: 14, spark: [60,57,59,55,52,54,49,51,47,46] },
  { symbol: "PLTR", name: "Palantir Technologies", price: 181.61, change: 2.31, spark: [37,40,45,43,49,52,55,54,60,64] },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", price: 663.70, change: 0.24, spark: [46,47,49,48,50,51,50,52,54,55] },
  { symbol: "QQQ", name: "Invesco QQQ Trust", price: 594.15, change: 0.41, spark: [45,47,46,50,52,51,53,55,54,57] },
  { symbol: "DIA", name: "SPDR Dow Jones ETF", price: 462.20, change: -0.08, spark: [52,51,53,52,54,53,52,54,53,52] },
  { symbol: "IWM", name: "iShares Russell 2000", price: 240.87, change: -0.37, spark: [56,54,55,52,53,50,51,49,48,47] },
  { symbol: "VIX", name: "CBOE Volatility Index", price: 16.43, change: -2.14, spark: [62,58,60,55,52,54,49,47,45,43] },
];

export const defaultWatchlist = ["AAPL", "NVDA", "TSLA", "AMZN", "MSFT", "META", "GOOGL", "AMD", "PLTR", "SPY"];
export const marketSymbols = ["SPY", "QQQ", "DIA", "IWM", "VIX"];
const fallbackCompany: Company = { symbol: "SPY", name: "SPDR S&P 500 ETF", price: 663.70, change: 0.24, spark: [46,47,49,48,50,51,50,52,54,55] };
export const getCompany = (symbol: string): Company => companies.find((c) => c.symbol === symbol) ?? fallbackCompany;

const generalNews = [
  { headline: "Investors assess rate outlook as technology shares lead", category: "Macroeconomic" as const, impact: "High" as const, summary: "Treasury yields and policy expectations remain key inputs for growth-stock valuations." },
  { headline: "Options activity rises ahead of the next catalyst window", category: "Company News" as const, impact: "Medium" as const, summary: "Implied volatility is reflecting increased demand for near-term protection and directional exposure." },
  { headline: "Analysts refine estimates following recent sector checks", category: "Analyst Ratings" as const, impact: "Medium" as const, summary: "Updated channel data has prompted modest changes to revenue and margin expectations." },
  { headline: "Earnings expectations remain central to near-term price action", category: "Earnings" as const, impact: "High" as const, summary: "Traders are watching guidance language and forward demand signals more closely than headline results." },
];

export function getNews(symbol: string): NewsItem[] {
  const company = getCompany(symbol);
  return generalNews.map((item, index) => ({
    id: `${symbol}-${index}`,
    symbol,
    ...item,
    headline: index === 0 ? `${company.name} holds near a key technical range` : item.headline,
    source: ["Market Brief", "Options Desk", "Street Research", "Earnings Wire"][index] ?? "Market Brief",
    timestamp: ["18 min ago", "1 hr ago", "3 hrs ago", "Yesterday"][index] ?? "Recently",
  }));
}

export function getEarnings(symbol: string): EarningsData {
  const company = getCompany(symbol);
  const days = company.earningsDays ?? 42;
  return {
    date: `Oct ${Math.min(28, 2 + days)}, 2026`, days,
    session: days % 2 ? "After market" : "Before market", estimatedEps: `$${(0.72 + symbol.length * 0.31).toFixed(2)}`,
    history: [
      { quarter: "Q2 '26", reaction: 4.8, result: "Beat" },
      { quarter: "Q1 '26", reaction: -2.1, result: "Mixed" },
      { quarter: "Q4 '25", reaction: 6.2, result: "Beat" },
      { quarter: "Q3 '25", reaction: 1.4, result: "In line" },
    ],
  };
}

export function getAnalysis(symbol: string): AnalysisData {
  const company = getCompany(symbol);
  const positive = company.change > 0.7;
  const negative = company.change < -0.7;
  return {
    bias: positive ? "Bullish" : negative ? "Bearish" : "Neutral",
    status: positive || negative ? "Developing" : "Monitoring",
    trend: positive ? "Higher highs, above short-term average" : negative ? "Weakening below short-term average" : "Range-bound, awaiting direction",
    momentum: positive ? "Improving" : negative ? "Softening" : "Balanced",
    volume: "Not confirmed — live feed disconnected",
    support: [`$${(company.price * 0.97).toFixed(2)}`, `$${(company.price * 0.94).toFixed(2)}`],
    resistance: [`$${(company.price * 1.03).toFixed(2)}`, `$${(company.price * 1.06).toFixed(2)}`],
    catalysts: ["Next earnings report", "Sector momentum", "Macro rate expectations"],
    callConditions: ["Price holds above first support", "Momentum expands with volume", "Broad market remains constructive"],
    putConditions: ["Support breaks on rising volume", "Lower high confirms trend change", "Sector relative strength deteriorates"],
    risk: ["Simulated and delayed inputs", "Event volatility may distort technical levels", "Options can lose 100% of premium"],
    confidence: 42,
  };
}

export function makeChartData(symbol: string) {
  const company = getCompany(symbol);
  return Array.from({ length: 42 }, (_, index) => {
    const wave = Math.sin(index / 3.1) * company.price * 0.018;
    const drift = (index - 20) * company.change * 0.08;
    return { time: `${index + 1}`, price: Number((company.price + wave + drift).toFixed(2)), volume: Math.round(25 + Math.abs(Math.cos(index)) * 70) };
  });
}

export const glossary: Record<string, string> = {
  Call: "An options contract that can gain value when the underlying stock rises.",
  Put: "An options contract that can gain value when the underlying stock falls.",
  "Implied volatility": "The market's estimate of how much a stock may move, reflected in option prices.",
  Earnings: "A company's scheduled report of revenue, profit, and business outlook.",
  RSI: "A momentum measure that compares recent gains and losses on a 0–100 scale.",
  MACD: "A trend and momentum indicator based on the relationship between moving averages.",
  Support: "A price area where buying has previously slowed or stopped a decline.",
  Resistance: "A price area where selling has previously slowed or stopped an advance.",
  Volume: "The number of shares or contracts traded during a period.",
  Bullish: "Expecting or observing conditions that favor rising prices.",
  Bearish: "Expecting or observing conditions that favor falling prices.",
};
