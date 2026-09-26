// @ts-nocheck
// src/features/options-edge/annotated-chart.tsx
// A self-drawn candlestick chart that overlays the levels the engine finds —
// support/resistance, entry/target/stop, and the expected-range band — so the
// trader can SEE the setup. (The TradingView widget can't take custom overlays,
// so this is our own canvas chart for the analysis view.)

import { useEffect, useRef } from "react";
import type { Candle } from "./analysis/recommendation-engine";

type Tone = "pos" | "neg" | "accent" | "muted" | "warn";
export interface ChartLine {
  price: number;
  label: string;
  tone: Tone;
  dashed?: boolean;
}

function cssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function AnnotatedChart({
  candles,
  lines = [],
  band = null,
  height = 360,
}: {
  candles: Candle[];
  lines?: ChartLine[];
  band?: { low: number; high: number } | null;
  height?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const draw = () => {
      const data = (candles || []).slice(-60);
      if (data.length < 2) return;

      const W = wrap.clientWidth;
      const H = height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const C = {
        pos: cssVar("--positive", "oklch(0.74 0.16 153)"),
        neg: cssVar("--negative", "oklch(0.68 0.2 25)"),
        accent: cssVar("--primary", "oklch(0.72 0.16 166)"),
        muted: cssVar("--muted-foreground", "#8791a8"),
        warn: cssVar("--warning", "oklch(0.79 0.15 82)"),
        border: cssVar("--border", "#232c40"),
        card: cssVar("--card", "#141b2b"),
      };
      const toneColor = (t: Tone) => C[t] || C.muted;

      const padL = 8;
      const padR = 96; // room for level labels
      const padT = 12;
      const padB = 22;
      const plotW = W - padL - padR;
      const plotH = H - padT - padB;

      // price scale must include candles, all line prices, and the band
      let lo = Math.min(...data.map((c) => c.l));
      let hi = Math.max(...data.map((c) => c.h));
      const extra: number[] = [];
      lines.forEach((l) => Number.isFinite(l.price) && extra.push(l.price));
      if (band) { extra.push(band.low, band.high); }
      extra.forEach((v) => { lo = Math.min(lo, v); hi = Math.max(hi, v); });
      const pad = (hi - lo) * 0.06 || 1;
      lo -= pad; hi += pad;

      const x = (i: number) => padL + (plotW * (i + 0.5)) / data.length;
      const y = (v: number) => padT + plotH * (1 - (v - lo) / (hi - lo));

      // expected-range band
      if (band) {
        ctx.fillStyle = C.accent;
        ctx.globalAlpha = 0.08;
        ctx.fillRect(padL, y(band.high), plotW, y(band.low) - y(band.high));
        ctx.globalAlpha = 1;
      }

      // candles
      const cw = Math.max(1.5, (plotW / data.length) * 0.62);
      data.forEach((c, i) => {
        const up = c.c >= c.o;
        const col = up ? C.pos : C.neg;
        const px = x(i);
        ctx.strokeStyle = col;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(px, y(c.h)); ctx.lineTo(px, y(c.l)); ctx.stroke();
        const yo = y(c.o), yc = y(c.c);
        ctx.fillStyle = col;
        ctx.fillRect(px - cw / 2, Math.min(yo, yc), cw, Math.max(1, Math.abs(yc - yo)));
      });

      // level lines + labels
      ctx.font = "10px ui-monospace, monospace";
      ctx.textBaseline = "middle";
      lines.forEach((l) => {
        if (!Number.isFinite(l.price)) return;
        const yy = y(l.price);
        const col = toneColor(l.tone);
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.4;
        ctx.setLineDash(l.dashed ? [4, 3] : []);
        ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(padL + plotW, yy); ctx.stroke();
        ctx.setLineDash([]);
        // label chip on the right
        const text = `${l.label} ${l.price.toFixed(2)}`;
        const tw = ctx.measureText(text).width;
        const chipX = padL + plotW + 4;
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.16;
        ctx.fillRect(chipX, yy - 8, Math.min(tw + 8, padR - 6), 16);
        ctx.globalAlpha = 1;
        ctx.fillStyle = col;
        ctx.fillText(text, chipX + 4, yy);
      });

      // date ticks
      ctx.fillStyle = C.muted;
      ctx.textAlign = "center";
      const step = Math.ceil(data.length / 5);
      data.forEach((c, i) => {
        if (i % step === 0) {
          const d = new Date(c.t);
          const lbl = Number.isNaN(d.getTime()) ? String(i) : `${d.getMonth() + 1}/${d.getDate()}`;
          ctx.fillText(lbl, x(i), H - 6);
        }
      });
      ctx.textAlign = "start";
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [candles, lines, band, height]);

  return (
    <div ref={wrapRef} style={{ width: "100%" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height, display: "block" }} />
    </div>
  );
}
