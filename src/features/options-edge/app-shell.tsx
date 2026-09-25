import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Bell, BookOpen, BrainCircuit, CalendarDays, ChevronDown, CircleUserRound, LayoutDashboard, Menu, Newspaper, NotebookPen, Settings, Star, WifiOff, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { SymbolSearch } from "./symbol-search";
import { DashboardProvider } from "./dashboard-context";
import { SampleBadge, StatusDot } from "./ui";

const nav = [
  { to: "/", label: "Trading Dashboard", icon: LayoutDashboard },
  { to: "/watchlist", label: "My Watchlist", icon: Star },
  { to: "/news", label: "Market News", icon: Newspaper },
  { to: "/earnings", label: "Earnings Calendar", icon: CalendarDays },
  { to: "/analyzer", label: "AI Trade Analyzer", icon: BrainCircuit },
  { to: "/journal", label: "Trade Journal", icon: NotebookPen },
  { to: "/learning", label: "Learning Center", icon: BookOpen },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function Brand() {
  return <Link to="/" className="flex items-center gap-2.5"><span className="grid size-8 place-items-center border border-primary/40 bg-primary/10 text-primary"><BarChart3 className="size-4" /></span><span><strong className="block text-sm tracking-wide">OPTIONS EDGE <span className="text-primary">AI</span></strong><small className="block text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Decision intelligence</small></span></Link>;
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return <nav className="space-y-1 px-3 py-4" aria-label="Primary navigation">{nav.map((item) => {
    const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
    return <Link key={item.to} to={item.to} onClick={onNavigate} className={cn("group flex min-h-9 items-center gap-3 border-l-2 px-3 text-xs font-medium transition-colors", active ? "border-primary bg-primary/10 text-foreground" : "border-transparent text-muted-foreground hover:bg-accent hover:text-foreground")}><item.icon className={cn("size-4", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} /><span className="flex-1">{item.label}</span></Link>;
  })}</nav>;
}

function ShellContent({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-3 backdrop-blur md:px-4">
      <div className="hidden w-56 lg:block"><Brand /></div>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}><SheetTrigger asChild><Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation"><Menu /></Button></SheetTrigger><SheetContent side="left" className="w-72 border-border bg-sidebar p-0"><SheetTitle className="border-b border-border p-4"><Brand /></SheetTitle><Navigation onNavigate={() => setMobileOpen(false)} /></SheetContent></Sheet>
      <SymbolSearch variant="nav" />
      <div className="ml-auto hidden items-center gap-3 xl:flex"><div className="flex items-center gap-2 border-r border-border pr-4 text-[10px]"><StatusDot status="disconnected" /><span className="text-muted-foreground">DATA</span><span className="font-semibold">DISCONNECTED</span></div><div className="flex items-center gap-2 text-xs"><span className="size-1.5 rounded-full bg-negative" /><span>Market closed</span><span className="text-muted-foreground">• Opens 9:30 ET</span></div></div>
      <Button variant="ghost" size="icon" aria-label="Notifications" className="relative"><Bell /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-warning" /></Button>
      <Button variant="ghost" className="hidden h-8 gap-2 px-2 sm:flex"><CircleUserRound className="size-4" /><span className="text-xs">Trader</span><ChevronDown className="size-3" /></Button>
    </header>
    <div className="flex min-h-[calc(100vh-3.5rem)]"><aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 border-r border-border bg-sidebar lg:flex lg:flex-col"><Navigation /><div className="mt-auto border-t border-border p-4"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-[10px] font-medium uppercase text-muted-foreground"><WifiOff className="size-3" />Provider status</span><SampleBadge>Prototype</SampleBadge></div><p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">No live market connection. All displayed values are simulated.</p></div></aside><main className="min-w-0 flex-1">{children}</main></div>
  </div>;
}

export function AppShell({ children }: { children: ReactNode }) { return <DashboardProvider><ShellContent>{children}</ShellContent></DashboardProvider>; }
