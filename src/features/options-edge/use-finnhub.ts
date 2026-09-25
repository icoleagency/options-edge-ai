import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getCompanyNews, getEarningsInfo, getQuote, searchSymbols } from "./finnhub.functions";

export type LiveState = "loading" | "empty" | "disconnected" | "ok";

export function useCompanyNews(symbol: string) {
  const fn = useServerFn(getCompanyNews);
  const q = useQuery({ queryKey: ["finnhub-news", symbol], queryFn: () => fn({ data: { symbol } }), staleTime: 5 * 60_000, retry: false });
  const items = q.data?.status === "ok" ? q.data.items : [];
  const state: LiveState = q.isLoading ? "loading" : q.isError || !q.data || q.data.status !== "ok" ? "disconnected" : items.length ? "ok" : "empty";
  return { items, state, sentiment: q.data?.status === "ok" ? q.data.sentiment : null };
}

export function useEarningsInfo(symbol: string) {
  const fn = useServerFn(getEarningsInfo);
  const q = useQuery({ queryKey: ["finnhub-earnings", symbol], queryFn: () => fn({ data: { symbol } }), staleTime: 30 * 60_000, retry: false });
  const earnings = q.data?.status === "ok" ? q.data.earnings : null;
  const state: LiveState = q.isLoading ? "loading" : q.isError || !q.data || q.data.status !== "ok" ? "disconnected" : earnings ? "ok" : "empty";
  return { earnings, state };
}

export function useQuote(symbol: string) {
  const fn = useServerFn(getQuote);
  const q = useQuery({ queryKey: ["finnhub-quote", symbol], queryFn: () => fn({ data: { symbol } }), staleTime: 60_000, refetchInterval: 90_000, retry: false });
  const d = q.data; return d && d.status === "ok" ? d : null;
}

export function useSymbolSearch(query: string) {
  const fn = useServerFn(searchSymbols);
  const [debounced, setDebounced] = useState(query.trim());
  useEffect(() => { const t = setTimeout(() => setDebounced(query.trim()), 300); return () => clearTimeout(t); }, [query]);
  const q = useQuery({ queryKey: ["finnhub-search", debounced.toUpperCase()], queryFn: () => fn({ data: { query: debounced } }), enabled: debounced.length > 0, staleTime: 10 * 60_000, retry: false });
  const pending = query.trim().length > 0 && (debounced !== query.trim() || q.isFetching);
  return { results: q.data?.status === "ok" ? q.data.results : [], loading: pending, disconnected: q.data?.status === "disconnected" || q.isError };
}
