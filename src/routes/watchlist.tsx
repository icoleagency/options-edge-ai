import { createFileRoute } from "@tanstack/react-router";
import { WatchlistPage } from "@/features/options-edge/pages";
export const Route = createFileRoute("/watchlist")({
  head: () => ({ meta: [
    { title: "My Watchlist — Options Edge AI" },
    { name: "description", content: "Manage a personalized stock watchlist for synchronized market intelligence." },
    { property: "og:title", content: "My Watchlist — Options Edge AI" },
    { property: "og:description", content: "Manage a personalized stock watchlist for synchronized market intelligence." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: WatchlistPage,
});
