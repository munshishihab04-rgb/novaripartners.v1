/**
 * NEXI XPAY HPP — Configurazione Centrale
 * Modifica solo questo file per adattare l'integrazione.
 */

export const NEXI_ENV = (process.env.NEXI_ENV ?? "sandbox") as "sandbox" | "production";

export const NEXI_API_KEY = process.env.NEXI_API_KEY ?? "";

export const NEXI_BASE_URL =
  NEXI_ENV === "production"
    ? "https://xpay.nexigroup.com/api/phoenix-0.0/psp/api/v1"
    : "https://xpaysandbox.nexigroup.com/api/phoenix-0.0/psp/api/v1";

export function getSiteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const domains = process.env.REPLIT_DOMAINS?.split(",");
  if (domains?.length) return `https://${domains[0].trim()}`;
  if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  throw new Error("SITE_URL non configurato");
}

export const API_BASE_PATH = "/api";
export const RESULT_PATH   = "/order-success"; // ?orderId= aggiunto automaticamente
export const CANCEL_PATH   = "/cart";
export const CURRENCY      = "USD";
export const LANGUAGE      = "eng";
export const ORDER_ID_PREFIX = "NV";
