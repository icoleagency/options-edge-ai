import { createFileRoute } from "@tanstack/react-router";
import { EarningsPage } from "@/features/options-edge/pages";
export const Route = createFileRoute("/earnings")({
  head: () => ({ meta: [
    { title: "Earnings Calendar — Options Edge AI" },
    { name: "description", content: "Monitor sample earnings dates, estimates, and historical reactions." },
    { property: "og:title", content: "Earnings Calendar — Options Edge AI" },
    { property: "og:description", content: "Monitor sample earnings dates, estimates, and historical reactions." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: EarningsPage,
});
