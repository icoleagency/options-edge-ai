import { Loader2, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { knownName } from "./data";
import { useDashboard } from "./dashboard-context";
import { useSymbolSearch } from "./use-finnhub";

/** Name for a symbol: stored search description, else the built-in list, else empty (never another company's). */
export function useCompanyName(symbol: string) {
  const { names } = useDashboard();
  return names[symbol] || knownName(symbol);
}

export function SymbolSearch({ variant }: { variant: "nav" | "watchlist" }) {
  const { addTicker, setSelectedSymbol } = useDashboard();
  const [query, setQuery] = useState("");
  const { results, loading, disconnected } = useSymbolSearch(query);
  const pick = (symbol: string, name?: string) => { addTicker(symbol, name); setSelectedSymbol(symbol); setQuery(""); };
  const nav = variant === "nav";
  const open = query.trim().length > 0;
  return <div className={cn("relative", nav && "w-full max-w-md")}>
    <Search className={cn("pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground", nav ? "left-3 size-4" : "left-2.5 size-3.5")} />
    <Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => {
      if (e.key === "Escape") setQuery("");
      if (e.key !== "Enter") return;
      const typed = query.trim().toUpperCase();
      const exact = results.find((r) => r.symbol === typed);
      if (/^[A-Z]{1,5}$/.test(typed)) pick(typed, exact?.description);
      else if (results[0]) pick(results[0].symbol, results[0].description);
    }} placeholder={nav ? "Search ticker or company" : "Add symbol or company"} aria-label={nav ? "Search ticker or company" : "Add symbol or company"} className={cn("h-8 text-xs", nav ? "border-border bg-secondary/50 pl-9" : "bg-secondary/40 pl-8 pr-8")} />
    {loading ? <Loader2 className={cn("absolute top-1/2 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground", nav ? "right-3" : "right-2.5")} /> : !nav && <Plus className="absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />}
    {open && <div className={cn("z-50 border border-border bg-popover p-1", nav ? "absolute left-0 right-0 top-10 shadow-2xl" : "mt-2")}>
      {results.map((r) => <button key={r.symbol} type="button" onClick={() => pick(r.symbol, r.description)} className="flex w-full items-center justify-between gap-2 px-2 py-2 text-left text-xs hover:bg-accent"><span className="min-w-0 truncate"><b>{r.symbol}</b><span className="text-muted-foreground"> — {r.description}</span></span><Plus className="size-3 shrink-0" /></button>)}
      {!loading && results.length === 0 && <p className="px-2 py-2 text-[10px] text-muted-foreground">{disconnected ? "Search unavailable — " : "No matches — "}press Enter to add “{query.trim().toUpperCase()}” directly.</p>}
      {loading && results.length === 0 && <p className="px-2 py-2 text-[10px] text-muted-foreground">Searching…</p>}
    </div>}
  </div>;
}
