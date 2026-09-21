import { Info, LoaderCircle, PlugZap } from "lucide-react";
import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { glossary } from "./data";

export function Panel({ title, eyebrow, action, className, children }: { title: string; eyebrow?: string; action?: ReactNode; className?: string; children: ReactNode }) {
  return <section className={cn("min-w-0 border border-border bg-card", className)}>
    <header className="flex min-h-12 items-center justify-between gap-3 border-b border-border px-4 py-2.5">
      <div className="min-w-0"><h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>{eyebrow && <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{eyebrow}</p>}</div>
      {action}
    </header>
    {children}
  </section>;
}

export function SampleBadge({ children = "Simulated" }: { children?: ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded-sm border border-warning/25 bg-warning/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-warning"><span className="size-1 rounded-full bg-warning" />{children}</span>;
}

export function StatusDot({ status = "disconnected" }: { status?: "connected" | "disconnected" | "delayed" }) {
  return <span className={cn("inline-block size-1.5 rounded-full", status === "connected" ? "bg-positive" : status === "delayed" ? "bg-warning" : "bg-negative")} />;
}

export function Term({ children }: { children: keyof typeof glossary }) {
  return <TooltipProvider delayDuration={150}><Tooltip><TooltipTrigger asChild><button type="button" className="inline-flex items-center gap-1 border-b border-dotted border-muted-foreground/50 text-left">{children}<Info className="size-3 text-muted-foreground" /></button></TooltipTrigger><TooltipContent side="top" className="max-w-64 border border-border bg-popover text-popover-foreground shadow-xl"><p>{glossary[children]}</p></TooltipContent></Tooltip></TooltipProvider>;
}

export function DataState({ state, compact = false }: { state: "loading" | "empty" | "error" | "disconnected"; compact?: boolean }) {
  const copy = {
    loading: ["Loading market intelligence", "Waiting for the data service to respond."],
    empty: ["No data available", "There is nothing to display for this ticker yet."],
    error: ["Data could not be loaded", "The provider returned an error. Try again shortly."],
    disconnected: ["Live provider not connected", "The interface is ready for a secure server-side data connection."],
  }[state];
  return <div className={cn("flex flex-col items-center justify-center px-6 text-center", compact ? "min-h-32" : "min-h-64")}>{state === "loading" ? <LoaderCircle className="mb-3 size-5 animate-spin text-primary" /> : <PlugZap className="mb-3 size-5 text-muted-foreground" />}<p className="text-sm font-medium">{copy[0]}</p><p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">{copy[1]}</p></div>;
}

export function Change({ value, className }: { value: number; className?: string }) {
  return <span className={cn("font-mono text-xs font-semibold tabular-nums", value >= 0 ? "text-positive" : "text-negative", className)}>{value >= 0 ? "+" : ""}{value.toFixed(2)}%</span>;
}
