import { createFileRoute } from "@tanstack/react-router";
import { OptionsLabPage } from "@/features/options-edge/pages";
export const Route = createFileRoute("/options-lab")({
  head: () => ({ meta: [
    { title: "Options Lab — Options Edge AI" },
    { name: "description", content: "Explore simulated options contracts, liquidity, volatility, and Greeks in an educational analysis workspace." },
    { property: "og:title", content: "Options Lab — Options Edge AI" },
    { property: "og:description", content: "Explore simulated options contracts, liquidity, volatility, and Greeks in an educational analysis workspace." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: OptionsLabPage,
});
