import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { defaultWatchlist } from "./data";
import type { DashboardPreferences } from "./types";

interface DashboardContextValue {
  watchlist: string[];
  selectedSymbol: string;
  preferences: DashboardPreferences;
  hydrated: boolean;
  setSelectedSymbol: (symbol: string) => void;
  addTicker: (symbol: string) => void;
  removeTicker: (symbol: string) => void;
  moveTicker: (symbol: string, direction: -1 | 1) => void;
  updatePreferences: (patch: Partial<DashboardPreferences>) => void;
  togglePanel: (panel: keyof DashboardPreferences["visiblePanels"]) => void;
}

const defaultPreferences: DashboardPreferences = {
  timeframe: "1D", notifications: true, compactMode: true,
  visiblePanels: { news: true, earnings: true, analyzer: true, overview: true, alerts: true },
};

// Keep a single context instance across hot-module reloads so consumers that
// still reference the previous module copy resolve the same provider.
const globalScope = globalThis as typeof globalThis & {
  __optionsEdgeDashboardContext?: React.Context<DashboardContextValue | null>;
};
const DashboardContext =
  globalScope.__optionsEdgeDashboardContext ??
  (globalScope.__optionsEdgeDashboardContext = createContext<DashboardContextValue | null>(null));
const STORAGE_KEY = "options-edge-ai:dashboard-v1";

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState(defaultWatchlist);
  const [selectedSymbol, setSelectedSymbol] = useState("NVDA");
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { watchlist?: string[]; selectedSymbol?: string; preferences?: DashboardPreferences };
        if (parsed.watchlist?.length) setWatchlist(parsed.watchlist);
        if (parsed.selectedSymbol) setSelectedSymbol(parsed.selectedSymbol);
        if (parsed.preferences) {
          const allowedTimeframes = ["1m", "5m", "15m", "30m", "1H", "4H", "1D", "1W"];
          setPreferences({ ...defaultPreferences, ...parsed.preferences, timeframe: allowedTimeframes.includes(parsed.preferences.timeframe) ? parsed.preferences.timeframe : defaultPreferences.timeframe, visiblePanels: { ...defaultPreferences.visiblePanels, ...parsed.preferences.visiblePanels } });
        }
      }
    } catch { /* Invalid stored prototype preferences fall back safely. */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ watchlist, selectedSymbol, preferences }));
  }, [hydrated, watchlist, selectedSymbol, preferences]);

  const value = useMemo<DashboardContextValue>(() => ({
    watchlist, selectedSymbol, preferences, hydrated, setSelectedSymbol,
    addTicker: (symbol) => setWatchlist((current) => current.includes(symbol) ? current : [...current, symbol].slice(0, 15)),
    removeTicker: (symbol) => setWatchlist((current) => {
      const next = current.filter((item) => item !== symbol);
      if (selectedSymbol === symbol) setSelectedSymbol(next[0] ?? "SPY");
      return next;
    }),
    moveTicker: (symbol, direction) => setWatchlist((current) => {
      const index = current.indexOf(symbol);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      const sourceValue = next[index];
      const targetValue = next[target];
      if (!sourceValue || !targetValue) return current;
      next[index] = targetValue;
      next[target] = sourceValue;
      return next;
    }),
    updatePreferences: (patch) => setPreferences((current) => ({ ...current, ...patch })),
    togglePanel: (panel) => setPreferences((current) => ({ ...current, visiblePanels: { ...current.visiblePanels, [panel]: !current.visiblePanels[panel] } })),
  }), [watchlist, selectedSymbol, preferences, hydrated]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used inside DashboardProvider");
  return context;
}
