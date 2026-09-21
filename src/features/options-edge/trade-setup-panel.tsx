import { Check, CircleAlert, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTradeSetup } from "./data";
import { useDashboard } from "./dashboard-context";
import type { SetupDetail } from "./types";
import { Panel, SampleBadge, Term, Why } from "./ui";

export function AITradeSetupPanel({ full = false }: { full?: boolean }) {
  const { selectedSymbol } = useDashboard();
  const setup = getTradeSetup(selectedSymbol);
  const biasTone = setup.bias === "Bullish" ? "text-positive" : setup.bias === "Bearish" ? "text-negative" : "text-warning";
  return <Panel title="AI TRADE SETUP" eyebrow={`${selectedSymbol} · sample educational analysis`} className={cn(full && "mx-auto max-w-7xl")} action={<SampleBadge>Sample analysis</SampleBadge>}>
    <div className="grid border-b border-border lg:grid-cols-[1.05fr_1.45fr]">
      <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:border-r lg:border-border">
        <SetupMetric label="Overall Bias" value={setup.bias} tone={biasTone} whyTitle={`Why is this ${setup.bias.toLowerCase()}?`} why={setup.biasExplanation} />
        <SetupMetric label="Trend" value={setup.trend} />
        <SetupMetric label="Momentum" value={setup.momentum} whyTitle={`Why is momentum ${setup.momentum.toLowerCase()}?`} why={setup.momentumExplanation} term="Momentum" />
        <SetupMetric label="Volume" value={setup.volume} term="Volume" />
        <SetupMetric label="Support" value={setup.support} term="Support" />
        <SetupMetric label="Resistance" value={setup.resistance} term="Resistance" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3"><p className="text-[10px] font-semibold uppercase text-muted-foreground">Catalyst monitor</p><span className="text-[9px] uppercase text-warning">Sample inputs only</span></div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">{setup.catalysts.map((item, index) => <div key={item} className="border border-border bg-secondary/30 px-2 py-2"><span className={cn("mb-2 block size-1.5 rounded-full", index < 2 ? "bg-warning" : "bg-muted-foreground")} /><p className="text-[10px] font-medium">{item}</p><p className="mt-1 text-[9px] text-muted-foreground">Monitoring</p></div>)}</div>
        <div className="mt-3 flex items-start gap-2 border border-warning/20 bg-warning/5 p-3 text-[10px] leading-relaxed text-muted-foreground"><CircleAlert className="mt-0.5 size-3.5 shrink-0 text-warning" /><span>Connect verified market, volume, catalyst, and options data before using this framework for real analysis.</span></div>
      </div>
    </div>
    <div className="grid lg:grid-cols-2"><SetupColumn detail={setup.call} /><SetupColumn detail={setup.put} className="border-t border-border lg:border-l lg:border-t-0" /></div>
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
  return <div className={className}><p className="mb-2 text-[9px] font-semibold uppercase text-muted-foreground">{title}</p><ul className="space-y-1.5">{items.map((item) => <li key={item} className="flex gap-2 text-[10px] leading-relaxed"><Icon className={cn("mt-0.5 size-3 shrink-0", icon === "check" ? "text-positive" : icon === "x" ? "text-negative" : icon === "alert" ? "text-warning" : "text-muted-foreground")} /><span>{item}</span></li>)}</ul></div>;
}