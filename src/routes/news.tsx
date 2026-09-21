import { createFileRoute } from "@tanstack/react-router";
import { NewsPage } from "@/features/options-edge/pages";
export const Route = createFileRoute("/news")({
  head: () => ({ meta: [
    { title: "Market News — Options Edge AI" },
    { name: "description", content: "Review ticker-specific sample market news and catalyst context." },
    { property: "og:title", content: "Market News — Options Edge AI" },
    { property: "og:description", content: "Review ticker-specific sample market news and catalyst context." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: NewsPage,
});
