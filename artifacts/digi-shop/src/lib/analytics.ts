const SESSION_KEY = "_nk_sid";

export function getAnalyticsSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export type EventType =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "remove_from_cart"
  | "start_checkout"
  | "complete_checkout"
  | "abandon_checkout";

export function trackEvent(
  type: EventType,
  options?: {
    page?: string;
    productId?: number;
    metadata?: Record<string, unknown>;
  }
) {
  // Never throw — analytics must never break the app
  try {
    const sessionId = getAnalyticsSessionId();
    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        sessionId,
        page: options?.page ?? window.location.pathname,
        productId: options?.productId ?? null,
        metadata: options?.metadata ?? null,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // silent
  }
}
