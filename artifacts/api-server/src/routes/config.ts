import { Router } from "express";

const router = Router();

router.get("/config", (_req, res) => {
  const rawRate = process.env.EUR_USD_RATE;
  const rate = rawRate ? parseFloat(rawRate) : 1.09;
  res.json({
    eurUsdRate: isFinite(rate) && rate > 0 ? rate : 1.09,
    currencies: ["EUR", "USD"],
  });
});

export default router;
