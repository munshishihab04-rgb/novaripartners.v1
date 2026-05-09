import app from "./app";
import { logger } from "./lib/logger";

// ── Validate required env vars at startup ─────────────────────────────────
const REQUIRED_VARS: string[] = [
  "PORT",
  "DATABASE_URL",
  "ADMIN_PASSWORD",
  "ADMIN_JWT_SECRET",
  "SITE_URL",
];

const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
if (missing.length > 0) {
  // Log without values
  logger.error({ missing }, "Missing required environment variables — server will not start");
  process.exit(1);
}

if (process.env.NODE_ENV === "production" && !process.env.NEXI_API_KEY) {
  logger.warn("NEXI_API_KEY is not set — payments will use mock mode in production!");
}

logger.info({
  NODE_ENV: process.env.NODE_ENV,
  SITE_URL: process.env.SITE_URL,
  NEXI_ENV: process.env.NEXI_ENV || "sandbox",
  hasNexiKey: !!process.env.NEXI_API_KEY,
}, "Server startup config");

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
