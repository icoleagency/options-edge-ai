import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/features/options-edge/pages";
export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Settings — Options Edge AI" },
    { name: "description", content: "Configure dashboard panels, chart defaults, notifications, and provider status." },
    { property: "og:title", content: "Settings — Options Edge AI" },
    { property: "og:description", content: "Configure dashboard panels, chart defaults, notifications, and provider status." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: SettingsPage,
});
