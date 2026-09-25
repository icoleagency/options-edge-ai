import type { AnalysisData, Company, EarningsData, NewsItem, OptionContract, TradeSetupData } from "./types";

export const companies: Company[] = [
  { symbol: "AAPL", name: "Apple Inc.", price: 254.63, change: 0.58, earningsDays: 31, spark: [43,45,44,48,47,51,53,52,56,58] },
  { symbol: "BLK", name: "BlackRock Inc.", price: 1182.44, change: 0.36, earningsDays: 22, spark: [44,46,45,48,50,49,52,51,54,56] },
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

export const defaultWatchlist = ["AAPL", "BLK", "AMZN", "GOOGL", "META", "MSFT", "NVDA", "PLTR", "SPY"];
export const marketSymbols = ["SPY", "QQQ", "DIA", "IWM", "VIX"];
const fallbackCompany: Company = { symbol: "SPY", name: "SPDR S&P 500 ETF", price: 663.70, change: 0.24, spark: [46,47,49,48,50,51,50,52,54,55] };
export const getCompany = (symbol: string): Company => companies.find((c) => c.symbol === symbol) ?? { ...fallbackCompany, symbol, name: "" };
export const knownName = (symbol: string) => companies.find((c) => c.symbol === symbol)?.name ?? "";

const generalNews = [
  { headline: "Investors assess rate outlook as technology shares lead", category: "Macro" as const, impact: "High" as const, summary: "Treasury yields and policy expectations remain key inputs for growth-stock valuations.", whyItMatters: "Changes in Treasury yields can affect valuation expectations for growth-oriented companies and may influence the broader trend." },
  { headline: "Options activity rises ahead of the next catalyst window", category: "Company" as const, impact: "Medium" as const, summary: "Implied volatility is reflecting increased demand for near-term protection and directional exposure.", whyItMatters: "Rising options activity can signal that traders expect a larger move, but it does not predict the direction of that move." },
  { headline: "Analysts refine estimates following recent sector checks", category: "Analyst" as const, impact: "Medium" as const, summary: "Updated channel data has prompted modest changes to revenue and margin expectations.", whyItMatters: "Estimate changes can reset expectations before earnings and may alter the price levels traders consider important." },
  { headline: "Earnings expectations remain central to near-term price action", category: "Earnings" as const, impact: "High" as const, summary: "Traders are watching guidance language and forward demand signals more closely than headline results.", whyItMatters: "Earnings can create fast price and volatility changes, making confirmation and risk limits especially important." },
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

export function getTradeSetup(symbol: string): TradeSetupData {
  const company = getCompany(symbol);
  const bullish = company.change > 0.7;
  const bearish = company.change < -0.7;
  const bias = bullish ? "Bullish" : bearish ? "Bearish" : "Neutral";
  const support = `$${(company.price * 0.97).toFixed(2)}`;
  const resistance = `$${(company.price * 1.03).toFixed(2)}`;
  return {
    bias,
    trend: bullish ? "Bullish" : bearish ? "Bearish" : "Neutral",
    momentum: bullish ? "Positive" : bearish ? "Weak" : "Neutral",
    volume: "Neutral",
    support,
    resistance,
    catalysts: ["Earnings", "News", "Analyst Activity", "Macro", "Sector"],
    status: "Watch",
    biasExplanation: bullish
      ? "The sample price is holding above its recent range and momentum is positive. Resistance is not confirmed as broken, so this remains a Watch rather than a trade signal."
      : bearish
        ? "The sample price is weakening relative to its recent range. Support has not been confirmed as broken, so the bearish case remains a Watch."
        : "The sample price is between support and resistance without enough momentum or volume confirmation to favor either direction.",
    momentumExplanation: "Momentum describes how strongly price is moving. This sample reading uses recent direction only; live price and volume data are required for confirmation.",
    call: {
      label: "Potential Call", status: bullish ? "Potential Call" : "Watch",
      met: bullish ? ["Price is above the sample support zone", "Short-term direction is positive"] : ["Price remains above the first support level"],
      unmet: ["Resistance breakout is not confirmed", "Live volume confirmation is unavailable"],
      confirmation: `A sustained move above ${resistance} with stronger volume`,
      invalidation: `A close below sample support at ${support}`,
      risks: ["Earnings volatility", "Broad-market reversal", "Time decay if price stalls"],
      explanation: "A call setup would become more relevant only if price clears resistance with confirming volume. Until then, the sample state is educational and remains on Watch.",
    },
    put: {
      label: "Potential Put", status: bearish ? "Potential Put" : "Watch",
      met: bearish ? ["Price direction is weakening", "Momentum is below neutral"] : ["Price remains below the sample resistance zone"],
      unmet: ["Support breakdown is not confirmed", "Live downside volume is unavailable"],
      confirmation: `A sustained break below ${support} with expanding volume`,
      invalidation: `A recovery above sample resistance at ${resistance}`,
      risks: ["Sharp relief rally", "Falling implied volatility", "Time decay if price stays range-bound"],
      explanation: "A put setup would require a confirmed support break and stronger downside participation. Without both, the sample state remains on Watch.",
    },
  };
}

export function getOptionContracts(symbol: string): OptionContract[] {
  const company = getCompany(symbol);
  const base = Math.round(company.price / 5) * 5;
  const expiration = "Nov 20, 2026";
  return (["Call", "Put"] as const).flatMap((type) => [-10, -5, 0, 5, 10].map((offset, index) => {
    const strike = base + offset;
    const distance = Math.abs(offset);
    const moneyness = offset === 0 ? "ATM" : type === "Call" ? (offset < 0 ? "ITM" : "OTM") : (offset > 0 ? "ITM" : "OTM");
    const mid = Math.max(1.15, 8.4 - distance * 0.45 + (type === "Call" ? company.change : -company.change) * 0.2);
    return { id: `${symbol}-${type}-${strike}`, type, expiration, strike, bid: Number((mid - 0.18).toFixed(2)), ask: Number((mid + 0.18).toFixed(2)), last: Number(mid.toFixed(2)), volume: 180 + index * 137, openInterest: 920 + index * 641, iv: Number((31.4 + index * 1.8).toFixed(1)), delta: Number(((type === "Call" ? 0.62 : -0.38) - index * 0.06).toFixed(2)), gamma: Number((0.018 + index * 0.003).toFixed(3)), theta: Number((-0.08 - index * 0.014).toFixed(3)), vega: Number((0.12 + index * 0.018).toFixed(3)), moneyness };
  }));
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
  Neutral: "Conditions do not clearly favor rising or falling prices yet.",
  Momentum: "How quickly and consistently price is moving in one direction.",
  IV: "Implied volatility: the options market's estimate of how much the stock may move, not which direction.",
  Delta: "An estimate of how much an option price may change for a $1 move in the stock.",
  Gamma: "How quickly an option's delta may change when the stock price moves.",
  Theta: "The estimated amount of option value lost each day from the passage of time.",
  Vega: "How sensitive an option price is to a change in implied volatility.",
  "Open Interest": "The number of option contracts that remain open and have not been closed or exercised.",
  "Earnings Volatility": "The larger price and implied-volatility changes that often occur around an earnings report.",
};
