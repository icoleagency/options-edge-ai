// src/features/options-edge/analyzer-trade-plan.tsx
// The annotated chart + trade plan block at the top of the AI Trade Analyzer
// page. Draws the engine's levels (entry/target/stop or support/resistance) and
// the expected-range band over the daily candles, then spells out the plan.

import { useMemo } from "react";
import { CircleAlert, Minus, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboard } from "./dashboard-context";
import { useBars, useIntradayBars } from "./use-bars";
import { useCompanyNews, useEarningsInfo } from "./use-finnhub";
import { DataState, Panel, SampleBadge } from "./ui";
import { computeRecommendation } from "./analysis/recommendation-engine";
import { AnnotatedChart, type ChartLine } from "./annotated-chart";

export function AnalyzerTradePlan() {
  const { selectedSymbol } = useDashboard();
  const { bars, state } = useBars(selectedSymbol);
  const { earnings } = useEarningsInfo(selectedSymbol);
  const { sentiment } = useCompanyNews(selectedSymbol);
  const { bars: intradayBars } = useIntradayBars(selectedSymbol);
  const daysToEarnings = earnings?.days;
  const rec = useMemo(() => (bars.length ? computeRecommendation(bars, { ...(daysToEarnings != null ? { daysToEarnings } : {}), ...(sentiment != null ? { newsSentiment: sentiment } : {}), ...(intradayBars.length ? { intradayCandles: intradayBars } : {}) }) : null), [bars, daysToEarnings, sentiment, intradayBars]);

  const { lines, band } = useMemo(() => {
    if (!rec) return { lines: [] as ChartLine[], band: null };
    const plan = rec.tradePlan;
    const ls: ChartLine[] = plan
      ? [
          { price: plan.entry, label: "Entry", tone: "accent", dashed: true },
          { price: plan.target, label: "Target", tone: "pos" },
          { price: plan.stop, label: "Stop", tone: "neg" },
        ]
      : ([
          rec.support != null ? { price: rec.support, label: "Support", tone: "pos" } : null,
          rec.resistance != null ? { price: rec.resistance, label: "Resistance", tone: "neg" } : null,
        ].filter(Boolean) as ChartLine[]);
    return {
      lines: ls,
      band: rec.expectedRange ? { low: rec.expectedRange.low, high: rec.expectedRange.high } : null,
    };
  }, [rec]);

  const plan = rec?.tradePlan ?? null;

  return <div className="space-y-4">
    <Panel title="ANNOTATED ANALYSIS CHART" eyebrow={`${selectedSymbol} · daily bars · Real-time (IEX)`} action={plan ? <SampleBadge>{plan.direction === "Call" ? "Call setup" : "Put setup"}</SampleBadge> : <SampleBadge>Watch</SampleBadge>}>
      {!rec ? <DataState state={state === "ok" ? "empty" : state} /> : <div className="p-3"><AnnotatedChart candles={bars} lines={lines} band={band} height={380} /></div>}
    </Panel>
    <Panel title="TRADE PLAN" eyebrow={plan ? `${selectedSymbol} · ${plan.pattern}` : `${selectedSymbol} · no active plan`}>
      {!rec ? <DataState state={state === "ok" ? "empty" : state} compact /> : plan ? <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider", plan.direction === "Call" ? "border-positive/30 bg-positive/10 text-positive" : "border-negative/30 bg-negative/10 text-negative")}>{plan.direction}</span>
          <span className={cn("border px-2.5 py-1 font-mono text-[10px] font-bold", plan.rrOk ? "border-positive/30 bg-positive/10 text-positive" : "border-warning/30 bg-warning/10 text-warning")}>{plan.riskReward.toFixed(2)}:1 Reward:Risk</span>
          {!plan.rrOk && <span className="text-[9px] uppercase text-warning">Below 2:1 — thin edge</span>}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-px bg-border">
          <PlanTile label="Entry" value={plan.entry} tone="accent" />
          <PlanTile label="Target" value={plan.target} tone="pos" />
          <PlanTile label="Stop" value={plan.stop} tone="neg" />
        </div>
        <p className="mt-3 border-l-2 border-primary/50 pl-3 text-[11px] leading-relaxed text-muted-foreground">{plan.rationale}</p>
        <p className="mt-3 text-[9px] leading-relaxed text-muted-foreground">Educational framework — not an order or a recommendation to trade. The plan describes what the setup implies, if you choose to act on it.</p>
      </div> : <div className="flex items-start gap-2 p-4 text-[11px] leading-relaxed text-muted-foreground"><CircleAlert className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" /><span>No trade plan — the setup is a Wait; there's no clean entry with a defined edge right now.</span></div>}
    </Panel>
  </div>;
}

function PlanTile({ label, value, tone }: { label: string; value: number; tone: "accent" | "pos" | "neg" }) {
  return <div className="bg-card p-3"><div className="flex items-center gap-1 text-[9px] font-semibold uppercase text-muted-foreground"><Target className="size-3" />{label}</div><p className={cn("mt-2 font-mono text-sm font-semibold tabular-nums", tone === "pos" ? "text-positive" : tone === "neg" ? "text-negative" : "text-primary")}>${value.toFixed(2)}</p></div>;
}
