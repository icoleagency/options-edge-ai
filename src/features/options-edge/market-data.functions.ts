import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Candle } from "./analysis/recommendation-engine";

export type BarsResult =
  | { status: "ok"; bars: Candle[] }
  | { status: "disconnected" | "error"; bars: []; message: string };

export const getBars = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ symbol: z.string().regex(/^[A-Z.]{1,10}$/) }).parse(data))
  .handler(async ({ data }): Promise<BarsResult> => {
    const keyId = process.env["ALPACA_API_KEY_ID"];
    const secret = process.env["ALPACA_API_SECRET_KEY"];
    if (!keyId || !secret) return { status: "disconnected", bars: [], message: "Alpaca keys are not configured." };
    const start = new Date(Date.now() - 200 * 86400000).toISOString().slice(0, 10);
    const url = `https://data.alpaca.markets/v2/stocks/${encodeURIComponent(data.symbol)}/bars?timeframe=1Day&limit=120&feed=iex&start=${start}`;
    try {
      const res = await fetch(url, { headers: { "APCA-API-KEY-ID": keyId, "APCA-API-SECRET-KEY": secret } });
      if (!res.ok) {
        console.error("Alpaca bars failed", res.status, await res.text());
        return { status: res.status === 401 || res.status === 403 ? "disconnected" : "error", bars: [], message: `Alpaca returned ${res.status}` };
      }
      const json = (await res.json()) as { bars?: { t: string; o: number; h: number; l: number; c: number; v: number }[] | null };
      const bars = (json.bars ?? []).map(({ t, o, h, l, c, v }) => ({ t, o, h, l, c, v }));
      return { status: "ok", bars };
    } catch (e) {
      console.error("Alpaca bars error", e);
      return { status: "error", bars: [], message: "Network error contacting Alpaca." };
    }
  });

export const getIntradayBars = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ symbol: z.string().regex(/^[A-Z.]{1,10}$/) }).parse(data))
  .handler(async ({ data }): Promise<BarsResult> => {
    const keyId = process.env["ALPACA_API_KEY_ID"];
    const secret = process.env["ALPACA_API_SECRET_KEY"];
    if (!keyId || !secret) return { status: "disconnected", bars: [], message: "Alpaca keys are not configured." };
    const url = `https://data.alpaca.markets/v2/stocks/${encodeURIComponent(data.symbol)}/bars?timeframe=5Min&limit=78&feed=iex`;
    try {
      const res = await fetch(url, { headers: { "APCA-API-KEY-ID": keyId, "APCA-API-SECRET-KEY": secret } });
      if (!res.ok) {
        console.error("Alpaca intraday bars failed", res.status, await res.text());
        return { status: res.status === 401 || res.status === 403 ? "disconnected" : "error", bars: [], message: `Alpaca returned ${res.status}` };
      }
      const json = (await res.json()) as { bars?: { t: string; o: number; h: number; l: number; c: number; v: number }[] | null };
      const bars = (json.bars ?? []).map(({ t, o, h, l, c, v }) => ({ t, o, h, l, c, v }));
      return { status: "ok", bars };
    } catch (e) {
      console.error("Alpaca intraday bars error", e);
      return { status: "error", bars: [], message: "Network error contacting Alpaca." };
    }
  });
