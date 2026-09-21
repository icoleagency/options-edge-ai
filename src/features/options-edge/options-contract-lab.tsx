import { useMemo, useState } from "react";
import { FlaskConical, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getOptionContracts } from "./data";
import { useDashboard } from "./dashboard-context";
import { Panel, SampleBadge, Term } from "./ui";

export function OptionsContractLab({ full = false }: { full?: boolean }) {
  const { selectedSymbol } = useDashboard();
  const [type, setType] = useState<"Call" | "Put">("Call");
  const [moneyness, setMoneyness] = useState("All");
  const contracts = useMemo(() => getOptionContracts(selectedSymbol).filter((item) => item.type === type && (moneyness === "All" || item.moneyness === moneyness)), [selectedSymbol, type, moneyness]);
  return <Panel title="OPTIONS CONTRACT LAB" eyebrow={`${selectedSymbol} · future options-chain workspace`} className={cn(full && "mx-auto max-w-7xl")} action={<SampleBadge>Simulated contracts</SampleBadge>}>
    <div className="flex flex-wrap items-end gap-3 border-b border-border p-3">
      <Tabs value={type} onValueChange={(value) => setType(value as "Call" | "Put")}><TabsList className="h-8 rounded-none bg-secondary/50"><TabsTrigger value="Call" className="h-7 rounded-sm text-[10px] data-[state=active]:text-positive">Calls</TabsTrigger><TabsTrigger value="Put" className="h-7 rounded-sm text-[10px] data-[state=active]:text-negative">Puts</TabsTrigger></TabsList></Tabs>
      <Filter label="Expiration" value="Nov 20, 2026" options={["Nov 20, 2026", "Dec 18, 2026"]} />
      <Filter label="Strike range" value="± $10" options={["± $10", "± $25", "All strikes"]} />
      <Filter label="Moneyness" value={moneyness} onChange={setMoneyness} options={["All", "ITM", "ATM", "OTM"]} />
      <Dialog><DialogTrigger asChild><Button size="sm" className="ml-auto h-8 text-[10px]"><FlaskConical className="size-3" />Analyze Contract</Button></DialogTrigger><DialogContent className="border-border bg-card"><DialogHeader><DialogTitle>Live options data required</DialogTitle><DialogDescription className="pt-2 leading-relaxed">Contract analysis is intentionally unavailable in this prototype. Connect a verified options-chain provider before evaluating pricing, liquidity, volatility, or Greeks.</DialogDescription></DialogHeader><div className="flex items-start gap-3 border border-warning/20 bg-warning/5 p-3 text-xs text-muted-foreground"><LockKeyhole className="size-4 shrink-0 text-warning" />No recommendation or contract ranking has been generated.</div></DialogContent></Dialog>
    </div>
    <Table><TableHeader><TableRow className="bg-secondary/35"><TableHead>Type</TableHead><TableHead>Expiration</TableHead><TableHead>Strike</TableHead><TableHead>Bid</TableHead><TableHead>Ask</TableHead><TableHead>Last</TableHead><TableHead><Term>Volume</Term></TableHead><TableHead><Term>Open Interest</Term></TableHead><TableHead><Term>IV</Term></TableHead><TableHead><Term>Delta</Term></TableHead><TableHead><Term>Gamma</Term></TableHead><TableHead><Term>Theta</Term></TableHead><TableHead><Term>Vega</Term></TableHead></TableRow></TableHeader><TableBody>{contracts.map((item) => <TableRow key={item.id} className="text-[10px]"><TableCell><span className={cn("font-semibold", item.type === "Call" ? "text-positive" : "text-negative")}>{item.type}</span></TableCell><TableCell className="whitespace-nowrap">{item.expiration}</TableCell><TableCell className="font-mono">${item.strike.toFixed(2)} <span className="ml-1 text-[8px] text-muted-foreground">{item.moneyness}</span></TableCell><TableCell className="font-mono">{item.bid.toFixed(2)}</TableCell><TableCell className="font-mono">{item.ask.toFixed(2)}</TableCell><TableCell className="font-mono">{item.last.toFixed(2)}</TableCell><TableCell className="font-mono">{item.volume}</TableCell><TableCell className="font-mono">{item.openInterest.toLocaleString()}</TableCell><TableCell className="font-mono">{item.iv.toFixed(1)}%</TableCell><TableCell className="font-mono">{item.delta.toFixed(2)}</TableCell><TableCell className="font-mono">{item.gamma.toFixed(3)}</TableCell><TableCell className="font-mono text-negative">{item.theta.toFixed(3)}</TableCell><TableCell className="font-mono">{item.vega.toFixed(3)}</TableCell></TableRow>)}</TableBody></Table>
    <div className="border-t border-border bg-secondary/20 px-4 py-3 text-[10px] leading-relaxed text-muted-foreground">Simulated prices and Greeks are for interface preview only. They are not current, executable, or suitable for trading decisions.</div>
  </Panel>;
}

function Filter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange?: (value: string) => void }) {
  return <div><p className="mb-1 text-[8px] font-semibold uppercase text-muted-foreground">{label}</p><Select value={value} onValueChange={onChange}><SelectTrigger className="h-8 min-w-28 text-[10px]"><SelectValue /></SelectTrigger><SelectContent>{options.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>;
}