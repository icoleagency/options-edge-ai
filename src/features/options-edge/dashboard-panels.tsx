import { BellRing, ChevronDown, ChevronUp, Expand, MoreHorizontal, PencilRuler, Plus, Search, SlidersHorizontal, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useBars } from "./use-bars";
import { getCompany, knownName, marketSymbols } from "./data";
import { SymbolSearch, useCompanyName } from "./symbol-search";
import { useCompanyNews, useEarningsInfo, useQuote } from "./use-finnhub";
import { useDashboard } from "./dashboard-context";
import { Change, DataState, Panel, SampleBadge, StatusDot, Why } from "./ui";
import { AITradeSetupPanel } from "./trade-setup-panel";
import { TradingViewChart } from "./tradingview-chart";

export function MarketOverviewStrip() {
  const { preferences } = useDashboard();
  if (!preferences.visiblePanels.overview) return null;
  return <section aria-label="Market overview" className="grid border-y border-border bg-card sm:grid-cols-5">{marketSymbols.map((symbol, index) => <OverviewCell key={symbol} symbol={symbol} index={index} />)}</section>;
}

function QuoteValue({ symbol, dollar = true }: { symbol: string; dollar?: boolean }) {
  const quote = useQuote(symbol);
  return <><p className="font-mono text-xs tabular-nums">{quote ? `${dollar ? "$" : ""}${quote.price.toFixed(2)}` : "—"}</p>{quote?.changePct != null ? <Change value={quote.changePct} /> : <span className="font-mono text-[10px] text-muted-foreground">—</span>}</>;
}

function OverviewCell({ symbol, index }: { symbol: string; index: number }) {
  const quote = useQuote(symbol);
  return <div key={symbol} className={cn("flex min-h-16 items-center justify-between gap-3 px-4 py-2", index > 0 && "border-t border-border sm:border-l sm:border-t-0")}><div><div className="flex items-center gap-2"><b className="text-xs">{symbol}</b></div><p className="mt-1 font-mono text-xs tabular-nums">{quote ? quote.price.toFixed(2) : "—"}</p></div>{quote?.changePct != null ? <Change value={quote.changePct} /> : <span className="font-mono text-[10px] text-muted-foreground">—</span>}</div>;
}

export function WatchlistPanel({ management = false }: { management?: boolean }) {
  const { watchlist, selectedSymbol, setSelectedSymbol, removeTicker, moveTicker, names } = useDashboard();
  return <Panel title={management ? "Watchlist management" : "My Watchlist"} eyebrow={`${watchlist.length} of 15 symbols`} className={cn(!management && "h-full")} action={<SampleBadge />}>
    <div className="border-b border-border p-3"><SymbolSearch variant="watchlist" /></div>
    <div className={cn("overflow-y-auto", management ? "max-h-[580px]" : "max-h-[560px]")}>{watchlist.map((symbol, index) => { const item = getCompany(symbol); const name = names[symbol] || knownName(symbol); const selected = selectedSymbol === symbol; return <div key={symbol} role="button" tabIndex={0} onClick={() => setSelectedSymbol(symbol)} onKeyDown={(event) => { if (event.key === "Enter") setSelectedSymbol(symbol); }} className={cn("group grid min-h-[59px] cursor-pointer grid-cols-[1fr_auto] items-center gap-2 border-b border-border px-3 py-2 outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring", selected ? "border-l-2 border-l-primary bg-primary/8" : "border-l-2 border-l-transparent hover:bg-accent/60")}>
      <div className="min-w-0"><div className="flex items-center gap-2"><b className="text-xs">{symbol}</b>{item.name && item.earningsDays && item.earningsDays <= 18 && <span className="rounded-sm bg-warning/10 px-1 py-0.5 text-[8px] font-bold text-warning">E {item.earningsDays}D</span>}</div><p className="mt-1 truncate text-[10px] text-muted-foreground">{name || "—"}</p></div>
      <div className="flex items-center gap-2"><div className="text-right"><QuoteValue symbol={symbol} /></div>{management ? <div className="flex"><Button variant="ghost" size="icon" className="size-6" disabled={index === 0} onClick={(e) => { e.stopPropagation(); moveTicker(symbol, -1); }} aria-label={`Move ${symbol} up`}><ChevronUp className="size-3" /></Button><Button variant="ghost" size="icon" className="size-6" disabled={index === watchlist.length - 1} onClick={(e) => { e.stopPropagation(); moveTicker(symbol, 1); }} aria-label={`Move ${symbol} down`}><ChevronDown className="size-3" /></Button><Button variant="ghost" size="icon" className="size-6 text-negative" onClick={(e) => { e.stopPropagation(); removeTicker(symbol); }} aria-label={`Remove ${symbol}`}><Trash2 className="size-3" /></Button></div> : null}</div>
    </div>; })}</div>
  </Panel>;
}

export function TradingViewChartPanel() {
  const { selectedSymbol, preferences, updatePreferences } = useDashboard();
  const companyName = useCompanyName(selectedSymbol);
  const live = useBars(selectedSymbol);
  const [chartType, setChartType] = useState("Area");
  const [expanded, setExpanded] = useState(false);
  const [indicators, setIndicators] = useState(["Volume"]);
  const [drawingTools, setDrawingTools] = useState(false);
  const timeframes = ["1m", "5m", "15m", "30m", "1H", "4H", "1D", "1W"];
  return <Panel title="CHART WORKSPACE" eyebrow="TradingView · live chart" className={cn(expanded && "fixed inset-3 z-50 shadow-2xl")} action={<div className="flex items-center gap-1"><SampleBadge /><Button variant="ghost" size="icon" className="size-7" aria-label="Chart options"><MoreHorizontal className="size-3.5" /></Button></div>}>
    <div className="flex flex-wrap items-end gap-4 border-b border-border px-4 py-4"><div className="min-w-48"><div className="flex items-center gap-2"><h2 className="text-xl font-bold">{selectedSymbol}</h2><span className="text-xs text-muted-foreground">{companyName}</span></div><div className="mt-2 flex items-end gap-3">{live.quote ? <><p className="font-mono text-3xl font-semibold tabular-nums">${live.quote.price.toFixed(2)}</p><Change value={live.quote.change} className="mb-1 text-sm" /><span className="mb-1 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-positive"><StatusDot status="connected" />Real-time (IEX)</span></> : <p className="font-mono text-sm text-muted-foreground">{live.state === "loading" ? "Loading price…" : live.state === "empty" ? "No bars returned" : live.state === "error" ? "Price unavailable (provider error)" : "Live provider not connected"}</p>}</div></div><div className="ml-auto"><Select value={chartType} onValueChange={setChartType}><SelectTrigger className="h-8 w-24 text-[10px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Area">Area</SelectItem><SelectItem value="Bars">Bars</SelectItem></SelectContent></Select></div></div>
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary/20 px-3 py-2"><div className="flex flex-wrap border border-border bg-background">{timeframes.map((time) => <Button key={time} type="button" variant="ghost" size="sm" onClick={() => updatePreferences({ timeframe: time })} className={cn("h-7 min-w-8 rounded-none px-2 text-[10px]", preferences.timeframe === time && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground")}>{time}</Button>)}</div><Button variant={indicators.includes("SMA 20") ? "secondary" : "ghost"} size="sm" className="h-7 text-[10px]" onClick={() => setIndicators((current) => current.includes("SMA 20") ? current.filter((item) => item !== "SMA 20") : [...current, "SMA 20"])}><SlidersHorizontal className="size-3" />Indicators</Button><Button variant={drawingTools ? "secondary" : "ghost"} size="sm" className="h-7 text-[10px]" onClick={() => setDrawingTools((value) => !value)}><PencilRuler className="size-3" />Drawing tools</Button><Button variant="ghost" size="sm" className="ml-auto h-7 text-[10px]" onClick={() => setExpanded(!expanded)}><Expand className="size-3" />Fullscreen</Button></div>
    <div className={cn("relative h-[440px] p-3", expanded && "h-[calc(100vh-12rem)]")}><div className="absolute left-5 top-14 z-10 flex gap-2">{indicators.map((item) => <span key={item} className="border border-border bg-background/85 px-1.5 py-0.5 text-[9px] text-muted-foreground">{item}</span>)}{drawingTools && <span className="border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary">Drawing mode preview</span>}</div><TradingViewChart symbol={selectedSymbol} interval={preferences.timeframe} /></div>
  </Panel>;
}

export function MarketNewsPanel({ full = false }: { full?: boolean }) {
  const { selectedSymbol } = useDashboard(); const [filter, setFilter] = useState("All");
  const { items: live, state } = useCompanyNews(selectedSymbol);
  const items = useMemo(() => live.filter((item) => filter === "All" || filter === "High Impact" && item.impact === "High" || filter === "Earnings" && item.category === "Earnings" || filter === "Company News" && item.category === "Company"), [live, filter]);
  return <Panel title="Catalyst Intelligence" eyebrow={`${selectedSymbol} news · Live (Finnhub)`} action={<SampleBadge>Live (Finnhub)</SampleBadge>}><Tabs value={filter} onValueChange={setFilter} className="overflow-x-auto border-b border-border px-3 pt-2"><TabsList className="h-8 w-max justify-start rounded-none bg-transparent p-0">{["All", "Earnings", "Company News", "High Impact"].map((tab) => <TabsTrigger key={tab} value={tab} className="h-8 rounded-none px-2 text-[10px] data-[state=active]:border-b data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">{tab}</TabsTrigger>)}</TabsList></Tabs><div className={cn("divide-y divide-border overflow-y-auto", full ? "max-h-none" : "max-h-[520px]")}>{state !== "ok" ? <DataState state={state} compact /> : items.length === 0 ? <p className="p-6 text-center text-xs text-muted-foreground">No stories match this filter.</p> : items.map((item) => <article key={item.id} className="p-4 transition-colors hover:bg-accent/35"><div className="flex flex-wrap items-center gap-2 text-[9px] uppercase text-muted-foreground"><span className={cn("size-1.5 rounded-full", item.impact === "High" ? "bg-negative" : item.impact === "Medium" ? "bg-warning" : "bg-muted-foreground")} /><b className={item.impact === "High" ? "text-negative" : item.impact === "Medium" ? "text-warning" : "text-muted-foreground"}>{item.impact}</b><Why title={`Why is this ${item.impact.toLowerCase()} impact?`}>{item.whyItMatters}</Why><span>•</span><span>{item.category}</span><span className="ml-auto">{item.timestamp}</span></div><h3 className="mt-2 text-xs font-semibold leading-relaxed">{item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">{item.headline}</a> : item.headline}</h3><p className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-muted-foreground">{item.summary}</p><div className="mt-3 border-l-2 border-primary/50 pl-3"><p className="text-[9px] font-semibold uppercase text-primary">Why it matters</p><p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">{item.whyItMatters}</p></div><div className="mt-2 flex items-center justify-between text-[9px]"><span className="text-muted-foreground">{item.source}</span><b className="text-primary">{item.symbol}</b></div></article>)}</div></Panel>;
}

export function EarningsMonitorPanel({ full = false }: { full?: boolean }) {
  const { selectedSymbol } = useDashboard(); const { earnings, state } = useEarningsInfo(selectedSymbol);
  return <Panel title="Earnings Monitor" eyebrow={`${selectedSymbol} · Live (Finnhub)`} action={<SampleBadge>Live (Finnhub)</SampleBadge>}>{!earnings ? <DataState state={state === "ok" ? "empty" : state} compact /> : <div className={cn("grid", full && "lg:grid-cols-2")}><div className="border-b border-border p-4 lg:border-r"><div className="flex items-start justify-between"><div><p className="text-[10px] uppercase text-muted-foreground">Next report</p><p className="mt-1 text-lg font-semibold">{earnings.date}</p><p className="mt-1 text-xs text-muted-foreground">{earnings.session}</p></div><div className="border border-warning/30 bg-warning/10 px-3 py-2 text-center"><strong className="block font-mono text-xl text-warning">{earnings.days}</strong><span className="text-[9px] uppercase text-warning">Days</span></div></div><div className="mt-4 grid grid-cols-2 gap-2"><div className="bg-secondary/50 p-3"><p className="text-[9px] uppercase text-muted-foreground">Est. EPS</p><p className="mt-1 font-mono text-sm">{earnings.estimatedEps}</p></div><div className="bg-secondary/50 p-3"><p className="text-[9px] uppercase text-muted-foreground">Reported EPS</p><p className="mt-1 text-sm text-muted-foreground">Pending</p></div></div></div><div className="p-4"><p className="mb-3 text-[10px] font-semibold uppercase text-muted-foreground">Historical next-day reaction</p><p className="text-[11px] leading-relaxed text-muted-foreground">Historical reactions are not provided by this data source yet.</p></div></div>}</Panel>;
}

export function AITradeAnalyzerPanel({ full = false }: { full?: boolean }) {
  return <AITradeSetupPanel full={full} />;
}

export function Dashboard() {
  const { preferences } = useDashboard();
  return <div><MarketOverviewStrip /><div className="p-3 md:p-4"><div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Workspace 01</p><h1 className="mt-1 text-xl font-semibold">Trading Dashboard</h1></div><div className="hidden items-center gap-2 text-[10px] text-muted-foreground sm:flex"><BellRing className="size-3" />Sample intelligence · prototype only</div></div><div className="grid min-w-0 gap-3 xl:grid-cols-[220px_minmax(0,1fr)_300px]"><div className="xl:col-start-1 xl:row-span-2 xl:row-start-1"><WatchlistPanel /></div><div className="xl:col-start-2 xl:row-start-1"><TradingViewChartPanel /></div>{preferences.visiblePanels.news && <div className="xl:col-start-3 xl:row-span-2 xl:row-start-1"><MarketNewsPanel /></div>}{preferences.visiblePanels.earnings && <div className="xl:col-start-2 xl:row-start-2"><EarningsMonitorPanel /></div>}{preferences.visiblePanels.analyzer && <div className="xl:col-span-3"><AITradeAnalyzerPanel /></div>}</div></div></div>;
}
