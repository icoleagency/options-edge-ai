import { createFileRoute } from "@tanstack/react-router";
import { AnalyzerPage } from "@/features/options-edge/pages";
export const Route = createFileRoute("/analyzer")({
  head: () => ({ meta: [
    { title: "AI Trade Analyzer — Options Edge AI" },
    { name: "description", content: "Explore explainable, educational sample trade setup analysis." },
    { property: "og:title", content: "AI Trade Analyzer — Options Edge AI" },
    { property: "og:description", content: "Explore explainable, educational sample trade setup analysis." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AnalyzerPage,
});
