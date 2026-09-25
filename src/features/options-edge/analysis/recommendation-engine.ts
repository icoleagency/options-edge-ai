// src/features/options-edge/analysis/recommendation-engine.ts
// -----------------------------------------------------------------------------
// Options Edge AI — Recommendation Engine (Phase 3)
//
// Pure, dependency-free logic. It takes candles (OHLCV bars) plus a little
// context and returns an EXPLAINABLE Call / Put / Wait recommendation:
// a directional lean, a confidence score, the weighted evidence behind it,
// what would CONFIRM the setup, and what would INVALIDATE it.
//
// Design rules (from the Blueprint):
//   • It never hides its reasoning — every factor carries a plain-English "why".
//   • It happily returns "Wait" (no edge) instead of forcing a direction.
//   • It treats earnings as event risk, not a signal.
//   • It's provider-agnostic: feed it bars from Alpaca, Tradier, anything.
// This is decision support, not financial advice.
// -----------------------------------------------------------------------------

/* ----------------------------------- types --------------------------------- */

export interface Candle {
  t: number | string; // timestamp (ms epoch or ISO) — display only
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface RecommendationContext {
  /** Trading days until the next earnings report, if known. */
  daysToEarnings?: number;
  /** Net news sentiment for the symbol, roughly -1 (bearish) … +1 (bullish). */
  newsSentiment?: number;
}

export type Lean = "Call" | "Put" | "Wait";
export type Direction = "bullish" | "bearish" | "neutral";

export interface Factor {
  key: string;
  label: string;
  direction: Direction;
  /** Signed contribution to the aggregate score (positive = bullish). */
  weight: number;
  /** Plain-English explanation, with the actual numbers in it. */
  detail: string;
}

export interface Indicators {
  price: number;
  ma20: number | null;
  ma50: number | null;
  rsi: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHist: number | null;
  atr: number | null;
  avgVolume: number | null;
  lastVolume: number;
  support: number | null;
  resistance: number | null;
}

export interface TradeRecommendation {
  lean: Lean;
  /** 0–100. How much the evidence agrees, trimmed for event risk / thin data. */
  confidence: number;
  /** Raw aggregate score (positive = bullish, negative = bearish). */
  score: number;
  factors: Factor[];
  support: number | null;
  resistance: number | null;
  /** What price action would CONFIRM the lean. */
  confirmation: string;
  /** What would INVALIDATE it — the line in the sand. */
  invalidation: string;
  risks: string[];
  /** One-sentence summary a beginner can read at a glance. */
  summary: string;
  /** Whether there were enough bars to trust the read. */
  hasEnoughData: boolean;
  indicators: Indicators;
}

/* ------------------------------- indicators -------------------------------- */

export function sma(values: number[], period: number): number | null {
  if (values.length < period) return null;
  let sum = 0;
  for (let i = values.length - period; i < values.length; i++) sum += values[i];
  return sum / period;
}

export function ema(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const k = 2 / (period + 1);
  const out: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) out.push(values[i] * k + out[i - 1] * (1 - k));
  return out;
}

/** Wilder's RSI. Returns null if there isn't enough history. */
export function rsi(closes: number[], period = 14): number | null {
  if (closes.length <= period) return null;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    if (d >= 0) gain += d;
    else loss -= d;
  }
  gain /= period;
  loss /= period;
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    gain = (gain * (period - 1) + Math.max(d, 0)) / period;
    loss = (loss * (period - 1) + Math.max(-d, 0)) / period;
  }
  if (loss === 0) return 100;
  return 100 - 100 / (1 + gain / loss);
}

export function macd(closes: number[], fast = 12, slow = 26, signalPeriod = 9) {
  if (closes.length < slow) return { macd: null, signal: null, hist: null };
  const emaFast = ema(closes, fast);
  const emaSlow = ema(closes, slow);
  const line = emaFast.map((v, i) => v - emaSlow[i]);
  const signal = ema(line, signalPeriod);
  const m = line[line.length - 1];
  const s = signal[signal.length - 1];
  return { macd: m, signal: s, hist: m - s };
}

/** Average True Range — used for volatility-aware stops / invalidation. */
export function atr(candles: Candle[], period = 14): number | null {
  if (candles.length <= period) return null;
  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const cur = candles[i];
    const prevClose = candles[i - 1].c;
    trs.push(Math.max(cur.h - cur.l, Math.abs(cur.h - prevClose), Math.abs(cur.l - prevClose)));
  }
  // Wilder smoothing
  let a = trs.slice(0, period).reduce((x, y) => x + y, 0) / period;
  for (let i = period; i < trs.length; i++) a = (a * (period - 1) + trs[i]) / period;
  return a;
}

/**
 * Nearest support (below price) and resistance (above price) from recent swing
 * pivots. A pivot high/low is a bar that is the local extreme within `window`
 * bars on each side. Falls back to a simple percentage band if none are found.
 */
export function supportResistance(
  candles: Candle[],
  price: number,
  window = 3,
  lookback = 60,
): { support: number | null; resistance: number | null } {
  const slice = candles.slice(-lookback);
  const highs: number[] = [];
  const lows: number[] = [];
  for (let i = window; i < slice.length - window; i++) {
    let isHigh = true;
    let isLow = true;
    for (let j = i - window; j <= i + window; j++) {
      if (slice[j].h > slice[i].h) isHigh = false;
      if (slice[j].l < slice[i].l) isLow = false;
    }
    if (isHigh) highs.push(slice[i].h);
    if (isLow) lows.push(slice[i].l);
  }
  const support = lows.filter((l) => l < price).sort((a, b) => b - a)[0] ?? null;
  const resistance = highs.filter((h) => h > price).sort((a, b) => a - b)[0] ?? null;
  return {
    support: support ?? +(price * 0.97).toFixed(2),
    resistance: resistance ?? +(price * 1.03).toFixed(2),
  };
}

/* --------------------------------- engine ---------------------------------- */

const MIN_BARS = 30; // below this, we don't trust the read

export function computeIndicators(candles: Candle[]): Indicators {
  const closes = candles.map((c) => c.c);
  const price = closes[closes.length - 1];
  const { macd: m, signal, hist } = macd(closes);
  const sr = supportResistance(candles, price);
  const recentVols = candles.slice(-20).map((c) => c.v);
  const avgVolume = recentVols.length ? recentVols.reduce((a, b) => a + b, 0) / recentVols.length : null;
  return {
    price,
    ma20: sma(closes, 20),
    ma50: sma(closes, 50),
    rsi: rsi(closes, 14),
    macd: m,
    macdSignal: signal,
    macdHist: hist,
    atr: atr(candles, 14),
    avgVolume,
    lastVolume: candles[candles.length - 1]?.v ?? 0,
    support: sr.support,
    resistance: sr.resistance,
  };
}

export function computeRecommendation(
  candles: Candle[],
  ctx: RecommendationContext = {},
): TradeRecommendation {
  const ind = computeIndicators(candles);
  const factors: Factor[] = [];
  const { price, ma20, ma50, rsi: rsiVal, macd: macdVal, macdSignal, macdHist, atr: atrVal, avgVolume, lastVolume } = ind;
  const hasEnoughData = candles.length >= MIN_BARS;

  const add = (key: string, label: string, direction: Direction, weight: number, detail: string) =>
    factors.push({ key, label, direction, weight, detail });

  // 1) Trend — price vs moving averages (weight up to ±2)
  if (ma20 != null && ma50 != null) {
    if (price > ma20 && ma20 > ma50) {
      add("trend", "Trend", "bullish", 2, `Price $${price.toFixed(2)} is above both the 20-day ($${ma20.toFixed(2)}) and 50-day ($${ma50.toFixed(2)}) averages — buyers in control.`);
    } else if (price < ma20 && ma20 < ma50) {
      add("trend", "Trend", "bearish", -2, `Price $${price.toFixed(2)} is below the 20-day ($${ma20.toFixed(2)}) and 50-day ($${ma50.toFixed(2)}) averages — sellers in control.`);
    } else {
      add("trend", "Trend", "neutral", 0, `Moving averages aren't aligned (price $${price.toFixed(2)}, MA20 $${ma20.toFixed(2)}, MA50 $${ma50.toFixed(2)}) — no clear directional edge.`);
    }
  }

  // Trend strength flags — used to keep RSI from fighting a confirmed trend.
  const strongUp = ma20 != null && ma50 != null && price > ma20 && ma20 > ma50;
  const strongDown = ma20 != null && ma50 != null && price < ma20 && ma20 < ma50;

  // 2) Momentum — MACD vs its signal line, with a flat dead-zone (weight up to ±1.5)
  if (macdVal != null && macdSignal != null && macdHist != null) {
    const eps = (atrVal ?? price * 0.01) * 0.05; // ignore negligible histograms
    if (macdHist > eps) {
      add("macd", "Momentum (MACD)", "bullish", 1.5, `MACD (${macdVal.toFixed(2)}) is above its signal (${macdSignal.toFixed(2)}) — short-term momentum is turning up.`);
    } else if (macdHist < -eps) {
      add("macd", "Momentum (MACD)", "bearish", -1.5, `MACD (${macdVal.toFixed(2)}) is below its signal (${macdSignal.toFixed(2)}) — short-term momentum is turning down.`);
    } else {
      add("macd", "Momentum (MACD)", "neutral", 0, `MACD (${macdVal.toFixed(2)}) and its signal (${macdSignal.toFixed(2)}) are converged — momentum is flat, no clear push either way.`);
    }
  }

  // 3) RSI — overbought / oversold, but don't fight a strong trend (weight up to ±1)
  if (rsiVal != null) {
    if (rsiVal > 70) {
      if (strongUp) add("rsi", "RSI", "neutral", 0, `RSI is ${rsiVal.toFixed(0)} (>70) — overbought, but that's normal inside a strong uptrend and isn't a reversal signal on its own.`);
      else add("rsi", "RSI", "bearish", -1, `RSI is ${rsiVal.toFixed(0)} (>70) — overbought. Chasing calls here risks buying the top.`);
    } else if (rsiVal < 30) {
      if (strongDown) add("rsi", "RSI", "neutral", 0, `RSI is ${rsiVal.toFixed(0)} (<30) — oversold, but that's typical inside a strong downtrend and isn't a reversal signal on its own.`);
      else add("rsi", "RSI", "bullish", 1, `RSI is ${rsiVal.toFixed(0)} (<30) — oversold. Selling may be exhausted; watch for a bounce.`);
    } else {
      add("rsi", "RSI", "neutral", 0, `RSI is ${rsiVal.toFixed(0)} — in the normal 30–70 band, no extreme to fade.`);
    }
  }

  // 4) Location vs support/resistance (weight up to ±1)
  if (ind.support != null && ind.resistance != null && atrVal != null) {
    const nearSupport = price - ind.support <= atrVal * 1.0;
    const nearResistance = ind.resistance - price <= atrVal * 1.0;
    if (nearSupport && !nearResistance) {
      add("location", "Price location", "bullish", 1, `Price is near support ($${ind.support.toFixed(2)}) — a lower-risk area for a bounce than mid-range.`);
    } else if (nearResistance && !nearSupport) {
      add("location", "Price location", "bearish", -1, `Price is near resistance ($${ind.resistance.toFixed(2)}) — buyers often stall here; chasing is riskier.`);
    } else {
      add("location", "Price location", "neutral", 0, `Price sits between support ($${ind.support.toFixed(2)}) and resistance ($${ind.resistance.toFixed(2)}).`);
    }
  }

  // 5) Volume confirmation (weight up to ±1) — expanding volume confirms the move
  if (avgVolume != null && avgVolume > 0) {
    const rel = lastVolume / avgVolume;
    const trendUp = ma20 != null && price > ma20;
    if (rel >= 1.3) {
      const dir: Direction = trendUp ? "bullish" : "bearish";
      add("volume", "Volume", dir, trendUp ? 1 : -1, `Volume is ${rel.toFixed(1)}× its 20-day average — the current move has real participation behind it.`);
    } else if (rel <= 0.6) {
      add("volume", "Volume", "neutral", 0, `Volume is only ${rel.toFixed(1)}× average — the move lacks conviction; treat breakouts with caution.`);
    } else {
      add("volume", "Volume", "neutral", 0, `Volume is roughly normal (${rel.toFixed(1)}× average).`);
    }
  }

  // 6) News sentiment (optional, weight up to ±1)
  if (typeof ctx.newsSentiment === "number") {
    const s = ctx.newsSentiment;
    if (s > 0.2) add("news", "News sentiment", "bullish", 1, `Recent headlines skew positive (${s.toFixed(2)}) — sentiment supports upside.`);
    else if (s < -0.2) add("news", "News sentiment", "bearish", -1, `Recent headlines skew negative (${s.toFixed(2)}) — sentiment is a headwind.`);
    else add("news", "News sentiment", "neutral", 0, `Recent headlines are mixed — no strong sentiment tilt.`);
  }

  // 7) Earnings proximity — EVENT RISK overlay, not a directional signal
  let earningsGuard = false;
  if (typeof ctx.daysToEarnings === "number") {
    if (ctx.daysToEarnings <= 7) {
      earningsGuard = true;
      add("earnings", "Earnings risk", "neutral", 0, `Earnings in ${ctx.daysToEarnings} day${ctx.daysToEarnings === 1 ? "" : "s"} — implied volatility is elevated and the stock can gap either way. Beginners often wait until after the report.`);
    } else {
      add("earnings", "Earnings risk", "neutral", 0, `Next earnings are more than a week out — no earnings-gap risk on a short-term trade right now.`);
    }
  }

  // ---- aggregate ----
  const score = factors.reduce((sum, f) => sum + f.weight, 0);
  const bullishCount = factors.filter((f) => f.direction === "bullish").length;
  const bearishCount = factors.filter((f) => f.direction === "bearish").length;

  let lean: Lean;
  if (!hasEnoughData) lean = "Wait";
  else if (earningsGuard && Math.abs(score) < 3.5) lean = "Wait";
  else if (score >= 2.0) lean = "Call";
  else if (score <= -2.0) lean = "Put";
  else lean = "Wait";

  // ---- confidence ----
  // Base on how strong AND how one-sided the evidence is, then trim for risk.
  const maxScore = 6.5; // sum of max absolute weights that can point one way
  const strength = Math.min(1, Math.abs(score) / maxScore);
  const directional = bullishCount + bearishCount;
  const agreement = directional > 0
    ? Math.max(bullishCount, bearishCount) / directional
    : 0.5;
  let confidence = Math.round((0.35 + 0.5 * strength) * (0.6 + 0.4 * agreement) * 100);
  if (directional <= 1) confidence = Math.round(confidence * 0.85); // stay humble on a single-factor read
  if (earningsGuard) confidence = Math.max(15, confidence - 20);
  if (!hasEnoughData) confidence = Math.min(confidence, 25);
  confidence = Math.max(10, Math.min(95, confidence));
  if (lean === "Wait") confidence = Math.min(confidence, 55);

  // ---- confirmation / invalidation / risks ----
  const R = ind.resistance;
  const S = ind.support;
  const stopDist = atrVal != null ? atrVal * 1.5 : price * 0.03;
  let confirmation: string;
  let invalidation: string;
  if (lean === "Call") {
    confirmation = R != null ? `A sustained move above resistance $${R.toFixed(2)} on stronger volume.` : `A sustained breakout on stronger volume.`;
    invalidation = `A close below $${(price - stopDist).toFixed(2)} (about 1.5× ATR under price)${S != null ? `, or losing support at $${S.toFixed(2)}` : ""}.`;
  } else if (lean === "Put") {
    confirmation = S != null ? `A sustained break below support $${S.toFixed(2)} on expanding volume.` : `A sustained breakdown on expanding volume.`;
    invalidation = `A close above $${(price + stopDist).toFixed(2)} (about 1.5× ATR over price)${R != null ? `, or reclaiming resistance at $${R.toFixed(2)}` : ""}.`;
  } else {
    confirmation = R != null && S != null ? `A decisive break of either support ($${S.toFixed(2)}) or resistance ($${R.toFixed(2)}) with volume.` : `A decisive break of the current range with volume.`;
    invalidation = `No clear edge yet — a trade taken here has no defined line in the sand.`;
  }

  const risks: string[] = [
    "Options can lose 100% of premium — size positions small.",
    "Signals are probabilities, not certainties; confirm with your own read.",
  ];
  if (earningsGuard) risks.unshift("Earnings within a week can cause large gaps and IV crush.");
  if (!hasEnoughData) risks.unshift(`Only ${candles.length} bars available — not enough history for a reliable read.`);
  if (avgVolume != null && lastVolume / (avgVolume || 1) <= 0.6) risks.push("Thin volume can produce false breakouts.");

  // ---- summary sentence ----
  const summary = buildSummary(lean, confidence, factors, earningsGuard, hasEnoughData);

  return {
    lean,
    confidence,
    score: +score.toFixed(2),
    factors,
    support: S,
    resistance: R,
    confirmation,
    invalidation,
    risks,
    summary,
    hasEnoughData,
    indicators: ind,
  };
}

function buildSummary(lean: Lean, confidence: number, factors: Factor[], earningsGuard: boolean, hasEnoughData: boolean): string {
  if (!hasEnoughData) return "Not enough price history to form a view yet — waiting for more data.";
  const bull = factors.filter((f) => f.direction === "bullish").map((f) => f.label.toLowerCase());
  const bear = factors.filter((f) => f.direction === "bearish").map((f) => f.label.toLowerCase());
  if (lean === "Call") return `Leaning Call (${confidence}% confidence): ${bull.join(", ")} favor the upside${bear.length ? `, though ${bear.join(", ")} give reason for caution` : ""}.`;
  if (lean === "Put") return `Leaning Put (${confidence}% confidence): ${bear.join(", ")} favor the downside${bull.length ? `, though ${bull.join(", ")} cut the other way` : ""}.`;
  if (earningsGuard) return `Waiting: earnings are near, so the smart move is to sit out the event-risk rather than guess direction.`;
  return `Waiting (${confidence}% confidence): the evidence is mixed and there's no clean edge — no trade is a position too.`;
}
