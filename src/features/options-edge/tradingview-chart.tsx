// src/features/options-edge/tradingview-chart.tsx
// Real live chart via TradingView's free embeddable widget (no API key required).
// Drop-in replacement for the simulated Recharts chart. Design/theme match Options Edge AI.

import { useEffect, useId, useRef } from "react";

const TV_SRC = "https://s3.tradingview.com/tv.js";
let tvPromise: Promise<void> | null = null;

function loadTradingView(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as { TradingView?: unknown }).TradingView) return Promise.resolve();
  if (!tvPromise) {
    tvPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = TV_SRC;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load TradingView"));
      document.head.appendChild(s);
    });
  }
  return tvPromise;
}

// Map the app's timeframe labels to TradingView interval codes.
const INTERVAL_MAP: Record<string, string> = {
  "1m": "1", "5m": "5", "15m": "15", "30m": "30",
  "1H": "60", "4H": "240", "1D": "D", "1W": "W",
};

export function TradingViewChart({
  symbol,
  interval,
}: {
  symbol: string;
  interval: string;
}) {
  const reactId = useId();
  const idRef = useRef(`tv_${reactId.replace(/[^a-zA-Z0-9]/g, "")}`);

  useEffect(() => {
    let cancelled = false;
    loadTradingView()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = "";
        // @ts-expect-error TradingView global is injected by the external script
        new window.TradingView.widget({
          container_id: idRef.current,
          symbol,
          interval: INTERVAL_MAP[interval] ?? "D",
          theme: "dark",
          style: "1", // candles
          locale: "en",
          autosize: true,
          timezone: "America/New_York",
          hide_side_toolbar: false,
          allow_symbol_change: false,
          backgroundColor: "rgba(0,0,0,0)",
          gridColor: "rgba(255,255,255,0.06)",
        });
      })
      .catch(() => {
        /* Widget failed to load — the panel's own error/empty state can show here. */
      });
    return () => {
      cancelled = true;
    };
  }, [symbol, interval]);

  return <div id={idRef.current} ref={containerRef} className="h-full w-full" />;
}
