import { Router } from "express";

const router = Router();

// ── Spot price cache ─────────────────────────────────────────────────────────
let spotCache: { gold: number; silver: number; platinum: number; ts: number } | null = null;
const SPOT_TTL_MS = 5 * 60 * 1000; // 5 minuti

async function fetchSpotPrices(): Promise<{ gold: number; silver: number; platinum: number }> {
  try {
    const res = await fetch("https://api.metals.live/v1/spot", { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error("metals.live error");
    const data = await res.json() as Array<Record<string, number>>;
    const merged: Record<string, number> = {};
    for (const obj of data) Object.assign(merged, obj);
    if (merged.gold && merged.silver && merged.platinum) {
      return { gold: merged.gold, silver: merged.silver, platinum: merged.platinum };
    }
    throw new Error("incomplete data from metals.live");
  } catch {
    // Fallback: Yahoo Finance silver
    try {
      const r = await fetch(
        "https://query1.finance.yahoo.com/v8/finance/chart/SI=F?interval=1d&range=1d",
        { signal: AbortSignal.timeout(5000) }
      );
      const d = await r.json() as { chart?: { result?: Array<{ meta?: { regularMarketPrice?: number } }> } };
      const silver = d?.chart?.result?.[0]?.meta?.regularMarketPrice || 31.20;
      return {
        gold: spotCache?.gold || 2430,
        silver,
        platinum: spotCache?.platinum || 1010,
      };
    } catch {
      return {
        gold: spotCache?.gold || 2430,
        silver: spotCache?.silver || 31.20,
        platinum: spotCache?.platinum || 1010,
      };
    }
  }
}

router.get("/config", async (_req, res) => {
  const rawRate = process.env.EUR_USD_RATE;
  const rate = rawRate ? parseFloat(rawRate) : 1.09;

  // Refresh spot cache se stale
  if (!spotCache || Date.now() - spotCache.ts > SPOT_TTL_MS) {
    const prices = await fetchSpotPrices();
    spotCache = { ...prices, ts: Date.now() };
  }

  res.json({
    eurUsdRate: isFinite(rate) && rate > 0 ? rate : 1.09,
    currencies: ["EUR", "USD"],
    spotPrices: {
      gold: spotCache.gold,
      silver: spotCache.silver,
      platinum: spotCache.platinum,
    },
  });
});

export default router;
