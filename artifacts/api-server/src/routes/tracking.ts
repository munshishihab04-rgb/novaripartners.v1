/**
 * Tracking Config Routes
 * GET  /api/tracking-config        — public, read-only
 * GET  /api/admin/tracking-config  — admin protected
 * POST /api/admin/tracking-config  — admin protected
 */

import { Router, type Request, type Response } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "./admin";

const router = Router();

interface TrackingConfigDB {
  enabled: boolean;
  ga4Id: string;
  adsId: string;
  adsLabel: string;
  gtmId: string;
}

const DEFAULT_CONFIG: TrackingConfigDB = {
  enabled: false,
  ga4Id: "",
  adsId: "",
  adsLabel: "",
  gtmId: "",
};

async function loadTrackingConfig(): Promise<TrackingConfigDB> {
  const [row] = await db.select().from(settingsTable).where(eq(settingsTable.key, "tracking_config"));
  if (!row) return { ...DEFAULT_CONFIG };
  const v = row.value as Partial<TrackingConfigDB>;
  return {
    enabled:  v.enabled  ?? false,
    ga4Id:    v.ga4Id    ?? "",
    adsId:    v.adsId    ?? "",
    adsLabel: v.adsLabel ?? "",
    gtmId:    v.gtmId    ?? "",
  };
}

function toPublicConfig(cfg: TrackingConfigDB) {
  // Apply env var fallbacks — these IDs are public (not secrets)
  return {
    enabled: cfg.enabled,
    ga4MeasurementId:                   cfg.ga4Id    || process.env.VITE_GA4_MEASUREMENT_ID || "",
    googleAdsId:                        cfg.adsId    || process.env.VITE_GOOGLE_ADS_ID      || "",
    googleAdsPurchaseConversionLabel:   cfg.adsLabel || process.env.VITE_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL || "",
    gtmId: cfg.gtmId || process.env.VITE_GTM_ID || null,
  };
}

// ── GET /api/tracking-config — public ─────────────────────────────────────────
router.get("/tracking-config", async (_req: Request, res: Response) => {
  try {
    const cfg = await loadTrackingConfig();
    res.json(toPublicConfig(cfg));
  } catch {
    // Never break frontend
    res.json({ enabled: false, ga4MeasurementId: "", googleAdsId: "", googleAdsPurchaseConversionLabel: "", gtmId: null });
  }
});

// ── GET /api/admin/tracking-config — admin protected ──────────────────────────
router.get("/admin/tracking-config", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const cfg = await loadTrackingConfig();
    res.json(toPublicConfig(cfg));
  } catch (e) {
    res.status(500).json({ error: "Failed to load tracking config" });
  }
});

// ── POST /api/admin/tracking-config — admin protected ─────────────────────────
router.post("/admin/tracking-config", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { enabled, ga4MeasurementId, googleAdsId, googleAdsPurchaseConversionLabel, gtmId } = req.body as {
      enabled?: boolean;
      ga4MeasurementId?: string;
      googleAdsId?: string;
      googleAdsPurchaseConversionLabel?: string;
      gtmId?: string | null;
    };

    const newValue: TrackingConfigDB = {
      enabled:  enabled  === true,
      ga4Id:    ga4MeasurementId ?? "",
      adsId:    googleAdsId ?? "",
      adsLabel: googleAdsPurchaseConversionLabel ?? "",
      gtmId:    gtmId ?? "",
    };

    await db.insert(settingsTable)
      .values({ key: "tracking_config", value: newValue as any, updatedAt: new Date() })
      .onConflictDoUpdate({ target: settingsTable.key, set: { value: newValue as any, updatedAt: new Date() } });

    req.log.info({ enabled: newValue.enabled, ga4Present: !!newValue.ga4Id, adsPresent: !!newValue.adsId }, "Tracking config updated");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to save tracking config" });
  }
});

export default router;
