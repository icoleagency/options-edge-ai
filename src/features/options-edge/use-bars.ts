import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getBars, getIntradayBars } from "./market-data.functions";

export type BarsState = "loading" | "empty" | "error" | "disconnected" | "ok";

export function useBars(symbol: string) {
  const fetchBars = useServerFn(getBars);
  const query = useQuery({
    queryKey: ["alpaca-bars", symbol],
    queryFn: () => fetchBars({ data: { symbol } }),
    staleTime: 60_000,
    retry: false,
  });
  const bars = query.data?.status === "ok" ? query.data.bars : [];
  let state: BarsState;
  if (query.isLoading) state = "loading";
  else if (query.isError) state = "error";
  else if (!query.data) state = "empty";
  else if (query.data.status !== "ok") state = query.data.status;
  else state = bars.length ? "ok" : "empty";
  const last = bars[bars.length - 1];
  const prev = bars[bars.length - 2];
  const quote = last ? { price: last.c, change: prev ? ((last.c - prev.c) / prev.c) * 100 : 0 } : null;
  return { bars, state, quote };
}
