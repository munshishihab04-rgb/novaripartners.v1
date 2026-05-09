/**
 * analytics.ts — GA4 + Google Ads tracking helper
 * - No PII sent to Google
 * - All functions are no-ops if config not loaded / disabled
 * - Never throws — all calls wrapped in try/catch
 */

export interface TrackingConfig {
  enabled: boolean;
  ga4MeasurementId: string;
  googleAdsId: string;
  googleAdsPurchaseConversionLabel: string;
  gtmId: string | null;
}

let _config: TrackingConfig | null = null;
let _initialized = false;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function gtag(...args: unknown[]) {
  try {
    window.dataLayer = window.dataLayer || [];
    (window.dataLayer as unknown[]).push(args);
  } catch { /* no-op */ }
}

// ── Consent ───────────────────────────────────────────────────────────────────

export function initConsent() {
  try {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: unknown[]) {
      // eslint-disable-next-line prefer-rest-params
      (window.dataLayer as unknown[]).push(arguments);
    };
    // Default: all denied until user grants
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500,
    });
    // Restore saved preference
    const saved = localStorage.getItem("novari_consent");
    if (saved === "granted") {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
      });
    }
  } catch { /* no-op */ }
}

export function updateConsent(granted: boolean) {
  try {
    localStorage.setItem("novari_consent", granted ? "granted" : "denied");
    if (!window.gtag) return;
    window.gtag("consent", "update", {
      analytics_storage: granted ? "granted" : "denied",
      ad_storage: granted ? "granted" : "denied",
      ad_user_data: granted ? "granted" : "denied",
      ad_personalization: granted ? "granted" : "denied",
    });
  } catch { /* no-op */ }
}

export function getConsentSaved(): "granted" | "denied" | null {
  try {
    const v = localStorage.getItem("novari_consent");
    return (v === "granted" || v === "denied") ? v : null;
  } catch { return null; }
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function initAnalytics(config: TrackingConfig) {
  try {
    _config = config;
    if (!config.enabled) return;
    if (!config.ga4MeasurementId && !config.googleAdsId) return;
    if (_initialized) return;
    _initialized = true;

    const tagId = config.ga4MeasurementId || config.googleAdsId;

    // Load gtag.js async
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${tagId}`;
    document.head.appendChild(script);

    // Init
    window.gtag!("js", new Date());
    if (config.ga4MeasurementId) {
      window.gtag!("config", config.ga4MeasurementId, { send_page_view: true });
    }
    if (config.googleAdsId) {
      window.gtag!("config", config.googleAdsId);
    }
  } catch { /* no-op */ }
}

export function isReady(): boolean {
  return !!(_config?.enabled && _initialized && typeof window.gtag === "function");
}

// ── Events ────────────────────────────────────────────────────────────────────

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  try {
    if (!isReady()) return;
    window.gtag!("event", name, params);
  } catch { /* no-op */ }
}

export function trackViewItem(product: {
  id: string | number;
  name: string;
  price: number;
  category?: string;
  currency?: string;
}) {
  trackEvent("view_item", {
    currency: product.currency || "USD",
    value: product.price,
    items: [{
      item_id: String(product.id),
      item_name: product.name,
      price: product.price,
      quantity: 1,
      item_category: product.category || "",
    }],
  });
}

export function trackAddToCart(item: {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  currency?: string;
}) {
  trackEvent("add_to_cart", {
    currency: item.currency || "USD",
    value: item.price * item.quantity,
    items: [{
      item_id: String(item.id),
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
      item_category: item.category || "",
    }],
  });
}

export function trackBeginCheckout(data: {
  value: number;
  currency?: string;
  coupon?: string;
  items: Array<{ id: string | number; name: string; price: number; quantity: number; }>;
}) {
  try {
    // Deduplicate per session per cart hash
    const cartHash = data.items.map(i => `${i.id}:${i.quantity}`).join(",");
    const flagKey = `novari_begin_checkout_tracked_${cartHash}`;
    if (sessionStorage.getItem(flagKey)) return;
    sessionStorage.setItem(flagKey, "1");

    trackEvent("begin_checkout", {
      currency: data.currency || "USD",
      value: data.value,
      ...(data.coupon ? { coupon: data.coupon } : {}),
      items: data.items.map(i => ({
        item_id: String(i.id),
        item_name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
    });
  } catch { /* no-op */ }
}

export function trackShippingInfo(data: {
  value: number;
  currency?: string;
  shippingTier: string;
  items: Array<{ id: string | number; name: string; price: number; quantity: number; }>;
}) {
  trackEvent("add_shipping_info", {
    currency: data.currency || "USD",
    value: data.value,
    shipping_tier: data.shippingTier,
    items: data.items.map(i => ({
      item_id: String(i.id),
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  });
}

export function trackPurchase(order: {
  orderId: string;
  total: number;
  currency?: string;
  shipping?: number;
  tax?: number;
  couponCode?: string | null;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    discount?: number;
  }>;
}) {
  try {
    // Deduplicate: never send twice for same orderId
    const flagKey = `novari_purchase_tracked_${order.orderId}`;
    if (localStorage.getItem(flagKey)) return;
    localStorage.setItem(flagKey, "true");

    // GA4 purchase event
    trackEvent("purchase", {
      transaction_id: order.orderId,
      value: order.total,
      currency: order.currency || "USD",
      shipping: order.shipping || 0,
      tax: order.tax || 0,
      ...(order.couponCode ? { coupon: order.couponCode } : {}),
      items: order.items.map(i => ({
        item_id: i.productId,
        item_name: i.name,
        quantity: i.quantity,
        price: i.price,
        discount: i.discount || 0,
      })),
    });

    // Google Ads conversion
    if (_config?.googleAdsId && _config?.googleAdsPurchaseConversionLabel && window.gtag) {
      window.gtag("event", "conversion", {
        send_to: `${_config.googleAdsId}/${_config.googleAdsPurchaseConversionLabel}`,
        value: order.total,
        currency: order.currency || "USD",
        transaction_id: order.orderId,
      });
    }
  } catch { /* no-op */ }
}
