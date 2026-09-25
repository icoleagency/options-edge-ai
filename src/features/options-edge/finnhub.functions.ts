import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { EarningsData, NewsItem } from "./types";

const symbolSchema = z.object({ symbol: z.string().regex(/^[A-Z.]{1,10}$/) });
const day = (offset: number) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);

export type LiveNewsItem = NewsItem & { sentiment: number };
export type NewsResult =
  | { status: "ok"; items: LiveNewsItem[]; sentiment: number | null }
  | { status: "disconnected"; items: []; sentiment: null; message: string };
export type EarningsResult =
  | { status: "ok"; earnings: EarningsData | null }
  | { status: "disconnected"; earnings: null; message: string };

const POS = ["beat", "beats", "surge", "soar", "jump", "rally", "record", "upgrade", "raises", "strong", "growth", "gain", "tops", "bullish", "outperform", "wins", "approval", "partnership"];
const NEG = ["miss", "misses", "plunge", "drop", "fall", "falls", "slump", "downgrade", "cut", "cuts", "weak", "lawsuit", "probe", "investigation", "recall", "loss", "bearish", "underperform", "decline", "fine", "layoff", "warns"];
const HIGH = ["earnings", "guidance", "acquire", "acquisition", "merger", "sec", "fda", "antitrust", "downgrade", "upgrade", "lawsuit"];

function words(text: string) { return text.toLowerCase().match(/[a-z]+/g) ?? []; }

function classify(headline: string, finnhubCategory: string): Pick<NewsItem, "category" | "impact" | "whyItMatters"> & { sentiment: number } {
  const w = words(headline);
  const pos = w.filter((x) => POS.includes(x)).length;
  const neg = w.filter((x) => NEG.includes(x)).length;
  const sentiment = pos + neg === 0 ? 0 : (pos - neg) / (pos + neg);
  const has = (...k: string[]) => w.some((x) => k.includes(x));
  const category: NewsItem["category"] = has("earnings", "eps", "revenue", "quarter", "guidance") ? "Earnings"
    : has("analyst", "upgrade", "downgrade", "target", "rating", "outperform", "underperform") ? "Analyst"
    : has("sec", "fda", "antitrust", "lawsuit", "regulator", "regulatory", "probe", "court") ? "Regulatory"
    : has("fed", "inflation", "yields", "rates", "tariff", "economy", "jobs") ? "Macro"
    : has("launch", "launches", "unveils", "product", "chip", "model") ? "Product"
    : finnhubCategory === "company" ? "Company" : "Industry";
  const impact: NewsItem["impact"] = w.some((x) => HIGH.includes(x)) || Math.abs(pos - neg) >= 2 ? "High" : pos + neg > 0 ? "Medium" : "Low";
  const tone = sentiment > 0 ? "leans positive" : sentiment < 0 ? "leans negative" : "has no clear positive or negative wording";
  const whyItMatters = `Keyword heuristic: this ${category.toLowerCase()} headline ${tone}. ${impact === "High" ? "Topics like this can move price and implied volatility quickly." : "It may add context but is less likely to move price on its own."} Read the full article before drawing conclusions.`;
  return { category, impact, whyItMatters, sentiment };
}

function relative(unixSeconds: number) {
  const mins = Math.max(0, Math.round((Date.now() - unixSeconds * 1000) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const d = Math.round(hrs / 24);
  return d === 1 ? "Yesterday" : `${d} days ago`;
}

export const getCompanyNews = createServerFn({ method: "GET" })
  .inputValidator((d) => symbolSchema.parse(d))
  .handler(async ({ data }): Promise<NewsResult> => {
    const key = process.env["FINNHUB_API_KEY"];
    if (!key) return { status: "disconnected", items: [], sentiment: null, message: "Finnhub key not configured." };
    try {
      const res = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(data.symbol)}&from=${day(-14)}&to=${day(0)}&token=${key}`);
      if (!res.ok) { console.error("Finnhub news failed", res.status); return { status: "disconnected", items: [], sentiment: null, message: `Finnhub returned ${res.status}` }; }
      const json = (await res.json()) as { id: number; headline: string; source: string; datetime: number; summary: string; url: string; category: string }[];
      const items = (Array.isArray(json) ? json : []).filter((a) => a.headline).sort((a, b) => b.datetime - a.datetime).slice(0, 6).map((a): LiveNewsItem => ({
        id: String(a.id), symbol: data.symbol, headline: a.headline, source: a.source, timestamp: relative(a.datetime),
        summary: a.summary || "No summary provided by the source.", url: a.url, ...classify(a.headline, a.category),
      }));
      const sentiment = items.length ? items.reduce((s, i) => s + i.sentiment, 0) / items.length : null;
      return { status: "ok", items, sentiment };
    } catch (e) {
      console.error("Finnhub news error", e);
      return { status: "disconnected", items: [], sentiment: null, message: "Network error contacting Finnhub." };
    }
  });

export const getEarningsInfo = createServerFn({ method: "GET" })
  .inputValidator((d) => symbolSchema.parse(d))
  .handler(async ({ data }): Promise<EarningsResult> => {
    const key = process.env["FINNHUB_API_KEY"];
    if (!key) return { status: "disconnected", earnings: null, message: "Finnhub key not configured." };
    try {
      const res = await fetch(`https://finnhub.io/api/v1/calendar/earnings?symbol=${encodeURIComponent(data.symbol)}&from=${day(0)}&to=${day(90)}&token=${key}`);
      if (!res.ok) { console.error("Finnhub earnings failed", res.status); return { status: "disconnected", earnings: null, message: `Finnhub returned ${res.status}` }; }
      const json = (await res.json()) as { earningsCalendar?: { date: string; hour: string; epsEstimate: number | null; symbol: string }[] };
      const next = (json.earningsCalendar ?? []).filter((e) => e.symbol === data.symbol).sort((a, b) => a.date.localeCompare(b.date))[0];
      if (!next) return { status: "ok", earnings: null };
      const today = new Date(day(0) + "T00:00:00Z").getTime();
      const days = Math.max(0, Math.round((new Date(next.date + "T00:00:00Z").getTime() - today) / 86400000));
      return { status: "ok", earnings: {
        date: new Date(next.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }),
        days,
        session: next.hour === "bmo" ? "Before market" : next.hour === "amc" ? "After market" : "Time not confirmed",
        estimatedEps: next.epsEstimate != null ? `$${next.epsEstimate.toFixed(2)}` : "—",
        history: [],
      } };
    } catch (e) {
      console.error("Finnhub earnings error", e);
      return { status: "disconnected", earnings: null, message: "Network error contacting Finnhub." };
    }
  });
