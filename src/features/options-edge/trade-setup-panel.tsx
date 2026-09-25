import { useMemo } from "react";
import { Check, CircleAlert, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanyNews, useEarningsInfo } from "./use-finnhub";
import { useDashboard } from "./dashboard-context";
import type { SetupDetail } from "./types";
import { DataState, Panel, SampleBadge, Term, Why } from "./ui";
import { computeRecommendation, type TradeRecommendation } from "./analysis/recommendation-engine";
import { useBars, useIntradayBars } from "./use-bars";

function toPanel(rec: TradeRecommendation) {
  const bull = rec.factors.filter((f) => f.direction === "bullish").map((f) => f.detail);
  const bear = rec.factors.filter((f) => f.direction === "bearish").map((f) => f.detail);
  const neutral = rec.factors.filter((f) => f.direction === "neutral").map((f) => f.detail);
  const find = (k: string) => rec.factors.find((f) => f.key === k);
  const trend = find("trend"); const mom = find("macd"); const vol = find("volume");
  const bias = rec.lean === "Call" ? "Bullish" : rec.lean === "Put" ? "Bearish" : "Neutral";
  const verdict = rec.lean === "Call" ? "Potential Call" : rec.lean === "Put" ? "Potential Put" : "Watch";
  const mk = (label: "Potential Call" | "Potential Put", active: boolean, met: string[], unmet: string[]): SetupDetail => ({
    label,
    status: active ? verdict : rec.lean === "Wait" ? "Watch" : "No Setup",
    met: met.length ? met : ["No supporting evidence yet."],
    unmet: unmet.length ? unmet : ["—"],
    confirmation: active || rec.lean === "Wait" ? rec.confirmation : "Evidence currently favors the other side.",
    invalidation: active || rec.lean === "Wait" ? rec.invalidation : "N/A while the opposite setup is leading.",
    risks: rec.risks,
    explanation: rec.summary,
  });
  return {
    bias, verdict,
    trend: trend ? (trend.direction === "bullish" ? "Bullish" : trend.direction === "bearish" ? "Bearish" : "Neutral") : "—",
    momentum: mom ? (mom.direction === "bullish" ? "Positive" : mom.direction === "bearish" ? "Negative" : "Neutral") : "—",
    volume: vol ? (vol.weight !== 0 ? "Confirming" : vol.detail.includes("only") ? "Weak" : "Neutral") : "—",
    biasExplanation: rec.summary,
    momentumExplanation: mom?.detail ?? "Not enough history for MACD.",
    call: mk("Potential Call", rec.lean === "Call", bull, [...bear, ...neutral]),
    put: mk("Potential Put", rec.lean === "Put", bear, [...bull, ...neutral]),
  };
}

export function AITradeSetupPanel({ full = false }: { full?: boolean }) {
  const { selectedSymbol } = useDashboard();
  const { bars, state } = useBars(selectedSymbol);
  const { earnings } = useEarningsInfo(selectedSymbol);
  const { sentiment } = useCompanyNews(selectedSymbol);
  const { bars: intradayBars } = useIntradayBars(selectedSymbol);
  const daysToEarnings = earnings?.days;
  const rec = useMemo(() => (bars.length ? computeRecommendation(bars, { ...(daysToEarnings != null ? { daysToEarnings } : {}), ...(sentiment != null ? { newsSentiment: sentiment } : {}), ...(intradayBars.length ? { intradayCandles: intradayBars } : {}) }) : null), [bars, daysToEarnings, sentiment, intradayBars]);
  const setup = rec ? toPanel(rec) : null;
  const biasTone = setup?.bias === "Bullish" ? "text-positive" : setup?.bias === "Bearish" ? "text-negative" : "text-warning";
  return <Panel title="AI TRADE SETUP" eyebrow={`${selectedSymbol} · daily bars · Real-time (IEX)`} className={cn(full && "mx-auto max-w-7xl")} action={setup ? <SampleBadge>{setup.verdict}</SampleBadge> : <SampleBadge>No setup</SampleBadge>}>
    {!setup || !rec ? <DataState state={state === "ok" ? "empty" : state} /> : <>
    <div className="grid border-b border-border lg:grid-cols-[1.05fr_1.45fr]">
      <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:border-r lg:border-border">
        <SetupMetric label="Overall Bias" value={setup.bias} tone={biasTone} whyTitle={`Why is this ${setup.bias.toLowerCase()}?`} why={setup.biasExplanation} />
        <SetupMetric label="Trend" value={setup.trend} />
        <SetupMetric label="Momentum" value={setup.momentum} whyTitle={`Why is momentum ${setup.momentum.toLowerCase()}?`} why={setup.momentumExplanation} term="Momentum" />
        <SetupMetric label="Volume" value={setup.volume} term="Volume" />
        <SetupMetric label="Support" value={rec.support != null ? `$${rec.support.toFixed(2)}` : "—"} term="Support" />
        <SetupMetric label="Resistance" value={rec.resistance != null ? `$${rec.resistance.toFixed(2)}` : "—"} term="Resistance" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Confidence</p><span className="font-mono text-xs font-semibold">{rec.confidence}%</span></div>
        <div className="mt-2 h-1.5 bg-secondary"><div className={cn("h-full", rec.lean === "Call" ? "bg-positive" : rec.lean === "Put" ? "bg-negative" : "bg-warning")} style={{ width: `${rec.confidence}%` }} /></div>
        <p className="mt-3 text-[10px] font-semibold uppercase text-muted-foreground">Evidence</p>
        <ul className="mt-2 space-y-1.5">{rec.factors.map((f) => <li key={f.key} className="flex gap-2 text-[10px] leading-relaxed"><span className={cn("mt-1 block size-1.5 shrink-0 rounded-full", f.direction === "bullish" ? "bg-positive" : f.direction === "bearish" ? "bg-negative" : "bg-muted-foreground")} /><span><b>{f.label}:</b> {f.detail}</span></li>)}</ul>
        <div className="mt-3 flex items-start gap-2 border border-warning/20 bg-warning/5 p-3 text-[10px] leading-relaxed text-muted-foreground"><CircleAlert className="mt-0.5 size-3.5 shrink-0 text-warning" /><span>{rec.summary}</span></div>
        {rec.expectedRange && <div className="mt-3 border border-border bg-secondary/25 p-3">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">Expected range</p>
          <p className="mt-2 font-mono text-[11px] tabular-nums">Typical range next {rec.expectedRange.days} days: ${rec.expectedRange.low.toFixed(2)} – ${rec.expectedRange.high.toFixed(2)} (±${rec.expectedRange.move.toFixed(2)})</p>
          <div className="relative mt-2 h-1.5 bg-secondary"><span className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary bg-background" /></div>
          <div className="mt-1 flex justify-between font-mono text-[9px] tabular-nums text-muted-foreground"><span>${rec.expectedRange.low.toFixed(2)}</span><span>${rec.expectedRange.high.toFixed(2)}</span></div>
          <p className="mt-2 text-[9px] leading-relaxed text-muted-foreground">A probable band from recent volatility (ATR), not a prediction of direction.</p>
        </div>}
      </div>
    </div>
    <div className="grid lg:grid-cols-2"><SetupColumn detail={setup.call} /><SetupColumn detail={setup.put} className="border-t border-border lg:border-l lg:border-t-0" /></div>
    </>}
    <div className="border-t border-border bg-secondary/25 px-4 py-3 text-[10px] leading-relaxed text-muted-foreground"><strong className="text-primary">Educational framework:</strong> understand what is happening, why it matters, what could confirm it, and what would invalidate it. This is not a recommendation to trade.</div>
  </Panel>;
}

function SetupMetric({ label, value, tone, term, whyTitle, why }: { label: string; value: string; tone?: string; term?: "Support" | "Resistance" | "Volume" | "Momentum"; whyTitle?: string; why?: string }) {
  return <div className="min-h-20 bg-card p-3"><div className="flex items-center gap-1 text-[9px] uppercase text-muted-foreground">{term ? <Term>{term}</Term> : label}{why && whyTitle && <Why title={whyTitle}>{why}</Why>}</div><p className={cn("mt-2 font-mono text-xs font-semibold", tone)}>{value}</p></div>;
}

function SetupColumn({ detail, className }: { detail: SetupDetail; className?: string }) {
  const call = detail.label === "Potential Call";
  return <section className={cn("p-4", className)}><div className="flex items-center justify-between gap-3"><div><p className={cn("text-xs font-bold", call ? "text-positive" : "text-negative")}>{detail.label.toUpperCase()}</p><p className="mt-1 text-[9px] text-muted-foreground">Educational scenario · not an order</p></div><div className="flex items-center gap-1"><span className="border border-warning/25 bg-warning/10 px-2 py-1 text-[9px] font-bold uppercase text-warning">{detail.status}</span><Why title={`Why ${detail.label.toLowerCase()}?`}>{detail.explanation}</Why></div></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><ConditionList title="Conditions met" items={detail.met} icon="check" /><ConditionList title="Not yet met" items={detail.unmet} icon="minus" /><ConditionList title="Confirmation required" items={[detail.confirmation]} icon="check" /><ConditionList title="Invalidating condition" items={[detail.invalidation]} icon="x" /><ConditionList title="Risk factors" items={detail.risks} icon="alert" className="sm:col-span-2" /></div></section>;
}

function ConditionList({ title, items, icon, className }: { title: string; items: string[]; icon: "check" | "minus" | "x" | "alert"; className?: string }) {
  const Icon = icon === "check" ? Check : icon === "x" ? X : icon === "alert" ? CircleAlert : Minus;
  return <div className={className}><p className="mb-2 text-[9px] font-semibold uppercase text-muted-foreground">{title}</p><ul className="space-y-1.5">{items.map((item, i) => <li key={`${i}-${item}`} className="flex gap-2 text-[10px] leading-relaxed"><Icon className={cn("mt-0.5 size-3 shrink-0", icon === "check" ? "text-positive" : icon === "x" ? "text-negative" : icon === "alert" ? "text-warning" : "text-muted-foreground")} /><span>{item}</span></li>)}</ul></div>;
}
