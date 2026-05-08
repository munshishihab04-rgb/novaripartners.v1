const ACTIVE_WINDOW_MS = 5 * 60 * 1000;

export interface VisitorEvent {
  type: string;
  page: string | null;
  productId: number | null;
  timestamp: Date;
}

export interface VisitorSession {
  sessionId: string;
  lastSeen: Date;
  currentPage: string | null;
  pageHistory: Array<{ page: string; timestamp: Date }>;
  events: VisitorEvent[];
}

const store = new Map<string, VisitorSession>();

export function updateVisitor(
  sessionId: string,
  type: string,
  page: string | null,
  productId: number | null,
) {
  const now = new Date();
  const existing: VisitorSession = store.get(sessionId) ?? {
    sessionId,
    lastSeen: now,
    currentPage: null,
    pageHistory: [],
    events: [],
  };
  existing.lastSeen = now;
  if (page) existing.currentPage = page;
  existing.events = [
    ...existing.events.slice(-29),
    { type, page, productId, timestamp: now },
  ];
  if (type === "page_view" && page) {
    existing.pageHistory = [
      ...existing.pageHistory.slice(-9),
      { page, timestamp: now },
    ];
  }
  store.set(sessionId, existing);
}

export function getActiveVisitors(): VisitorSession[] {
  const cutoff = new Date(Date.now() - ACTIVE_WINDOW_MS);
  const active: VisitorSession[] = [];
  for (const v of store.values()) {
    if (v.lastSeen >= cutoff) active.push(v);
  }
  return active.sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());
}

export function getRecentEvents(limit = 50): Array<VisitorEvent & { sessionId: string }> {
  const all: Array<VisitorEvent & { sessionId: string }> = [];
  for (const v of store.values()) {
    for (const e of v.events) {
      all.push({ ...e, sessionId: v.sessionId });
    }
  }
  return all
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

setInterval(() => {
  const cutoff = new Date(Date.now() - ACTIVE_WINDOW_MS * 2);
  for (const [id, v] of store.entries()) {
    if (v.lastSeen < cutoff) store.delete(id);
  }
}, 60_000);
