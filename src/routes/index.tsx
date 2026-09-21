import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/features/options-edge/dashboard-panels";
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Trading Dashboard — Options Edge AI" },
    { name: "description", content: "A personalized options education and market intelligence terminal for monitoring stocks, catalysts, and explainable setups." },
    { property: "og:title", content: "Trading Dashboard — Options Edge AI" },
    { property: "og:description", content: "A personalized options education and market intelligence terminal." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Dashboard,
});
