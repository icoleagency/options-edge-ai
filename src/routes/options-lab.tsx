import { createFileRoute } from "@tanstack/react-router";
import { OptionsLabPage } from "@/features/options-edge/pages";
export const Route = createFileRoute("/options-lab")({
  head: () => ({ meta: [
    { title: "Options Lab — Options Edge AI" },
    { name: "description", content: "A future workspace for options strategy research and scenario modeling." },
    { property: "og:title", content: "Options Lab — Options Edge AI" },
    { property: "og:description", content: "A future workspace for options strategy research and scenario modeling." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: OptionsLabPage,
});
