import { createFileRoute } from "@tanstack/react-router";
import { LearningPage } from "@/features/options-edge/pages";
export const Route = createFileRoute("/learning")({
  head: () => ({ meta: [
    { title: "Learning Center — Options Edge AI" },
    { name: "description", content: "Learn beginner options and technical analysis concepts in plain language." },
    { property: "og:title", content: "Learning Center — Options Edge AI" },
    { property: "og:description", content: "Learn beginner options and technical analysis concepts in plain language." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: LearningPage,
});
