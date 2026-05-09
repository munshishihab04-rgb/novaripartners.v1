import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";
import { globalLimiter } from "./lib/limiters";

const app: Express = express();

// ── Trust proxy (Nginx → Express) ─────────────────────────────────────────
// Required for correct IP detection in rate limiters behind Nginx
app.set("trust proxy", 1);

// ── Security headers (Helmet) ──────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        frameSrc: ["https://xpay.nexigroup.com", "https://xpaysandbox.nexigroup.com"],
        frameAncestors: ["'none'"],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

// ── CORS: solo dal dominio produzione ──────────────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || process.env.SITE_URL || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: false,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Session-Id"],
  })
);

// ── Global rate limiter ────────────────────────────────────────────────────
app.use(globalLimiter);

// ── Body size limit (increased for base64 image uploads ~5MB → ~7MB JSON) ───
app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true, limit: "8mb" }));

// ── Serve uploaded media files publicly ───────────────────────────────────
const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads", "media");
try { require("fs").mkdirSync(uploadsDir, { recursive: true }); } catch {}
app.use("/uploads/media", express.static(uploadsDir, {
  maxAge: "30d",
  immutable: false,
  index: false,
  dotfiles: "deny",
}));

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use("/api", router);

export default app;
