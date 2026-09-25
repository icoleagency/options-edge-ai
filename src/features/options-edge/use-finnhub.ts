import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCompanyNews, getEarningsInfo } from "./finnhub.functions";

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
