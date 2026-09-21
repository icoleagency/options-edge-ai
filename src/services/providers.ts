import type { AnalysisData, EarningsData, NewsItem } from "@/features/options-edge/types";

export interface MarketDataService { getQuote(symbol: string): Promise<unknown>; getHistory(symbol: string, timeframe: string): Promise<unknown>; }
export interface CompanyNewsService { getNews(symbol: string): Promise<NewsItem[]>; }
export interface EarningsService { getEarnings(symbol: string): Promise<EarningsData>; }
export interface TechnicalAnalysisService { getAnalysis(symbol: string): Promise<AnalysisData>; }
export interface AIExplanationService { explain(symbol: string, context: AnalysisData): Promise<string>; }
export interface OptionsChainService { getChain(symbol: string, expiration?: string): Promise<unknown>; }

export const providerStatus = {
  marketData: "disconnected", news: "sample", earnings: "sample", technicalAnalysis: "sample", aiExplanations: "disconnected", optionsChain: "disconnected",
} as const;
