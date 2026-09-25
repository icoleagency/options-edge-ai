import { AlertTriangle, Check, ChevronDown, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { dayTradeLessons } from "./data/lessons";
import { useDashboard } from "./dashboard-context";
import { useEarningsInfo } from "./use-finnhub";
import { useLocalState } from "./use-local-state";
import { Panel } from "./ui";

const fieldCls = "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground";

/* ---------------- Lessons ---------------- */
export function LessonTrack() {
  const [done, setDone] = useLocalState<string[]>("oe-lessons-done", []);
  const [open, setOpen] = useState<string | null>(dayTradeLessons[0]?.id ?? null);
  const toggle = (id: string) => setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  return <Panel title="DAY TRADE 101" eyebrow="Lesson track" action={<span className="text-xs font-semibold tabular-nums text-primary">{done.length} of {dayTradeLessons.length} done</span>} className="mb-4">
    <div className="h-1 bg-secondary"><div className="h-full bg-primary transition-all" style={{ width: `${(done.length / dayTradeLessons.length) * 100}%` }} /></div>
    <div className="divide-y divide-border">{dayTradeLessons.map((l, i) => {
      const isOpen = open === l.id; const isDone = done.includes(l.id);
      return <div key={l.id}>
        <button type="button" onClick={() => setOpen(isOpen ? null : l.id)} aria-expanded={isOpen} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent/40">
          <span className={cn("flex size-6 shrink-0 items-center justify-center border text-[10px] font-semibold tabular-nums", isDone ? "border-positive bg-positive/15 text-positive" : "border-border text-muted-foreground")}>{isDone ? <Check className="size-3" /> : i + 1}</span>
          <span className="flex-1 text-sm font-medium">{l.title}</span>
          <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
        </button>
        {isOpen && <div className="space-y-3 px-4 pb-4 pl-13">
          <p className="text-xs leading-relaxed text-muted-foreground">{l.body}</p>
          <div className="border-l-2 border-primary bg-primary/5 p-3 text-xs"><p className={fieldCls}>Key takeaway</p><p className="mt-1 font-medium">{l.takeaway}</p></div>
          <Button size="sm" variant={isDone ? "secondary" : "outline"} onClick={() => toggle(l.id)}>{isDone ? <><Check className="size-3.5" />Done</> : "Mark as done"}</Button>
        </div>}
      </div>;
    })}</div>
  </Panel>;
}

/* ---------------- Checklist ---------------- */
const CHECKS = [
  "Trading with the trend (or a clear reason not to)",
  "Not chasing — price isn't extended after a big move",
  "Entry, target, and stop defined before entering",
  "Risk on this trade is 1% of account or less",
  "Not within earnings week (unless intentionally playing the event)",
  "Analysis and my own read agree",
  "Thesis written in the Journal",
];
export function PreTradeChecklist() {
  const { selectedSymbol } = useDashboard();
  const { earnings } = useEarningsInfo(selectedSymbol);
  const days = earnings?.days;
  const [checked, setChecked] = useLocalState<number[]>("oe-checklist", []);
  const toggle = (i: number) => setChecked((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]));
  return <Panel title="PRE-TRADE CHECKLIST" eyebrow={`${checked.length} of ${CHECKS.length} checked · ${selectedSymbol}`} action={<Button variant="ghost" size="sm" onClick={() => setChecked([])}><RotateCcw className="size-3.5" />Reset</Button>}>
    <ul className="divide-y divide-border">{CHECKS.map((label, i) => <li key={label}>
      <label className="flex cursor-pointer items-start gap-3 px-4 py-3 text-xs hover:bg-accent/40">
        <input type="checkbox" className="mt-0.5 size-3.5 accent-[var(--color-primary)]" checked={checked.includes(i)} onChange={() => toggle(i)} />
        <span className={cn("flex-1 leading-relaxed", checked.includes(i) && "text-muted-foreground line-through")}>{label}</span>
        {i === 4 && typeof days === "number" && days <= 7 && <span className="flex shrink-0 items-center gap-1 border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[10px] font-semibold text-warning"><AlertTriangle className="size-3" />Earnings in {days}d</span>}
      </label>
    </li>)}</ul>
  </Panel>;
}

/* ---------------- Risk sizer ---------------- */
const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
export function RiskSizer() {
  const [v, setV] = useLocalState("oe-risk-sizer", { account: "10000", risk: "1", premium: "2.50" });
  const account = Number(v.account) || 0, risk = Number(v.risk) || 0, premium = Number(v.premium) || 0;
  const maxRisk = account * (risk / 100);
  const perContract = premium * 100;
  const contracts = perContract > 0 ? Math.floor(maxRisk / perContract) : 0;
  const total = contracts * perContract;
  const fields: [keyof typeof v, string][] = [["account", "Account size ($)"], ["risk", "Risk per trade (%)"], ["premium", "Option premium ($/share)"]];
  const rows: [string, string][] = [["Max risk", usd(maxRisk)], ["Cost per contract", usd(perContract)], ["Contracts", String(contracts)], ["Total cost", usd(total)], ["Max loss", usd(total)]];
  return <Panel title="RISK SIZER" eyebrow="Long option position size">
    <div className="grid gap-3 p-4 sm:grid-cols-3">{fields.map(([k, label]) => <label key={k} className="space-y-1.5"><span className={fieldCls}>{label}</span><Input type="number" min="0" step="any" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} /></label>)}</div>
    <dl className="grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-5">{rows.map(([k, val]) => <div key={k} className="bg-card p-3"><dt className={fieldCls}>{k}</dt><dd className="mt-1 text-sm font-semibold tabular-nums">{val}</dd></div>)}</dl>
    {contracts === 0 && premium > 0 && <p className="border-t border-warning/25 bg-warning/5 p-3 text-xs text-warning"><AlertTriangle className="mr-1.5 inline size-3.5" />This premium is above your risk limit — lower your risk %, add funds, or choose a cheaper contract.</p>}
    <p className="border-t border-border p-3 text-[10px] text-muted-foreground">A long option's max loss is the premium paid.</p>
  </Panel>;
}

/* ---------------- Journal ---------------- */
type Trade = { id: string; date: string; ticker: string; direction: "Call" | "Put"; strike: string; expiry: string; entry: string; contracts: string; thesis: string; exit?: string; outcome?: "Win" | "Loss" | "Break-even" };
const today = () => new Date().toLocaleDateString("en-CA");
const emptyForm = (): Omit<Trade, "id"> => ({ date: today(), ticker: "", direction: "Call", strike: "", expiry: "", entry: "", contracts: "1", thesis: "" });

export function TradeJournal() {
  const [trades, setTrades] = useLocalState<Trade[]>("oe-journal", []);
  const [form, setForm] = useState(emptyForm);
  const set = (k: keyof typeof form, val: string) => setForm({ ...form, [k]: val });
  const update = (id: string, patch: Partial<Trade>) => setTrades((t) => t.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!form.ticker.trim()) return; setTrades((t) => [{ ...form, ticker: form.ticker.trim().toUpperCase(), id: crypto.randomUUID() }, ...t]); setForm(emptyForm()); };
  const sorted = [...trades].sort((a, b) => b.date.localeCompare(a.date));
  const closed = trades.filter((t) => t.outcome);
  const wins = closed.filter((t) => t.outcome === "Win").length;
  const inputs: [keyof typeof form, string, string][] = [["date", "Date", "date"], ["ticker", "Ticker", "text"], ["strike", "Strike", "number"], ["expiry", "Expiry", "date"], ["entry", "Entry premium", "number"], ["contracts", "Contracts", "number"]];
  const sel = "h-9 w-full border border-input bg-background px-2 text-xs";
  return <div className="space-y-4">
    <Panel title="LOG A TRADE" eyebrow="Saved on this device">
      <form onSubmit={submit} className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {inputs.map(([k, label, type]) => <label key={k} className="space-y-1.5"><span className={fieldCls}>{label}</span><Input required={k === "ticker"} type={type} step="any" min={type === "number" ? "0" : undefined} value={form[k] as string} onChange={(e) => set(k, e.target.value)} /></label>)}
        <label className="space-y-1.5"><span className={fieldCls}>Direction</span><select className={sel} value={form.direction} onChange={(e) => set("direction", e.target.value)}><option>Call</option><option>Put</option></select></label>
        <label className="space-y-1.5 sm:col-span-2 lg:col-span-4"><span className={fieldCls}>Thesis</span><textarea className="min-h-20 w-full border border-input bg-background p-2 text-xs" value={form.thesis} onChange={(e) => set("thesis", e.target.value)} placeholder="Why this trade, what confirms it, what invalidates it?" /></label>
        <div className="sm:col-span-2 lg:col-span-4"><Button type="submit" size="sm">Log trade</Button></div>
      </form>
    </Panel>
    <Panel title="TRADE LOG" eyebrow={`${trades.length} trades`} action={<span className="text-xs tabular-nums"><span className="text-muted-foreground">Win rate </span><span className="font-semibold text-positive">{wins} / {closed.length}</span>{closed.length > 0 && <span className="text-muted-foreground"> · {Math.round((wins / closed.length) * 100)}%</span>}</span>}>
      {sorted.length === 0 ? <p className="p-6 text-center text-xs text-muted-foreground">No trades logged yet.</p> :
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-xs"><thead><tr className="border-b border-border text-left">{["Date", "Ticker", "Dir", "Strike", "Expiry", "Entry", "Qty", "Thesis", "Exit", "Outcome", ""].map((h) => <th key={h} className={cn(fieldCls, "px-3 py-2")}>{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-border">{sorted.map((t) => <tr key={t.id} className="align-top">
          <td className="px-3 py-2 tabular-nums">{t.date}</td>
          <td className="px-3 py-2 font-semibold">{t.ticker}</td>
          <td className={cn("px-3 py-2 font-semibold", t.direction === "Call" ? "text-positive" : "text-negative")}>{t.direction}</td>
          <td className="px-3 py-2 tabular-nums">{t.strike}</td>
          <td className="px-3 py-2 tabular-nums">{t.expiry}</td>
          <td className="px-3 py-2 tabular-nums">{t.entry}</td>
          <td className="px-3 py-2 tabular-nums">{t.contracts}</td>
          <td className="max-w-[220px] px-3 py-2 text-muted-foreground">{t.thesis}</td>
          <td className="px-3 py-2"><Input className="h-7 w-20 text-xs" type="number" step="any" min="0" value={t.exit ?? ""} onChange={(e) => update(t.id, { exit: e.target.value })} aria-label="Exit premium" /></td>
          <td className="px-3 py-2"><select className="h-7 border border-input bg-background px-1 text-xs" value={t.outcome ?? ""} onChange={(e) => update(t.id, { outcome: (e.target.value || undefined) as Trade["outcome"] } as Partial<Trade>)} aria-label="Outcome"><option value="">Open</option><option>Win</option><option>Loss</option><option>Break-even</option></select></td>
          <td className="px-3 py-2"><Button variant="ghost" size="icon" className="size-7" aria-label="Delete trade" onClick={() => setTrades((x) => x.filter((y) => y.id !== t.id))}><Trash2 className="size-3.5 text-negative" /></Button></td>
        </tr>)}</tbody></table></div>}
    </Panel>
  </div>;
}
