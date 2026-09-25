import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/features/options-edge/pages";
import { TradeJournal } from "@/features/options-edge/discipline";
export const Route = createFileRoute("/journal")({
  head: () => ({ meta: [
    { title: "Trade Journal — Options Edge AI" },
    { name: "description", content: "Log options trades, theses, and outcomes to track your win rate." },
    { property: "og:title", content: "Trade Journal — Options Edge AI" },
    { property: "og:description", content: "Log options trades, theses, and outcomes to track your win rate." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <div className="mx-auto max-w-6xl p-4 md:p-6"><PageHeader eyebrow="Discipline" title="Trade Journal" description="Write your thesis before each trade and record the result after. Entries are saved on this device." /><TradeJournal /></div>,
});
