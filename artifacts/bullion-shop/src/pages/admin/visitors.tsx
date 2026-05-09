import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/admin-layout";
import { type VisitorsData, type VisitorSession, isAdminAuthenticated, getAdminToken } from "@/lib/admin-api";
import { Users, Eye, MousePointerClick, ShoppingBag, CreditCard, Activity, Clock } from "lucide-react";

const PAGE_LABELS: Record<string, string> = {
  "/": "Homepage",
  "/catalog": "Catalog",
  "/cart": "Cart",
  "/checkout": "Checkout",
  "/about": "About",
  "/contact": "Contact",
  "/faq": "FAQ",
  "/terms": "Terms",
  "/privacy": "Privacy",
};

const EVENT_ICONS: Record<string, React.ReactNode> = {
  page_view: <Eye className="w-3.5 h-3.5 text-blue-500" />,
  product_view: <MousePointerClick className="w-3.5 h-3.5 text-indigo-500" />,
  add_to_cart: <ShoppingBag className="w-3.5 h-3.5 text-orange-500" />,
  start_checkout: <CreditCard className="w-3.5 h-3.5 text-violet-500" />,
};

const EVENT_LABELS: Record<string, string> = {
  page_view: "Page view",
  product_view: "Product view",
  add_to_cart: "Added to cart",
  start_checkout: "Started checkout",
};

function pageLabel(page: string | null) {
  if (!page) return "Unknown";
  const known = PAGE_LABELS[page];
  if (known) return known;
  if (page.startsWith("/products/")) return `Product #${page.split("/").pop()}`;
  return page;
}

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function shortSession(id: string) {
  return id.slice(0, 8);
}

function VisitorCard({ visitor }: { visitor: VisitorSession }) {
  const lastEvent = visitor.events[visitor.events.length - 1];
  const eventType = lastEvent?.type ?? "page_view";
  const dotColor =
    eventType === "start_checkout" ? "bg-violet-500" :
    eventType === "add_to_cart" ? "bg-orange-400" :
    eventType === "product_view" ? "bg-indigo-400" :
    "bg-green-400";

  return (
    <div className="bg-white border border-border rounded-xl p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-mono text-xs font-bold">
              {shortSession(visitor.sessionId)}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${dotColor}`} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">
              Visitor <span className="font-mono text-slate-500">{shortSession(visitor.sessionId)}</span>
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              {timeAgo(visitor.lastSeen)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            {EVENT_ICONS[eventType] || <Activity className="w-3.5 h-3.5 text-slate-400" />}
            <span className="text-xs text-slate-500">{EVENT_LABELS[eventType] || eventType}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg px-3 py-2 mb-3">
        <p className="text-xs text-slate-400 mb-0.5">Current page</p>
        <p className="text-sm font-medium text-slate-700">{pageLabel(visitor.currentPage)}</p>
      </div>

      {visitor.pageHistory.length > 1 && (
        <div>
          <p className="text-xs text-slate-400 mb-1.5">Page journey</p>
          <div className="flex flex-wrap gap-1">
            {visitor.pageHistory.slice(-5).map((h, i) => (
              <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {pageLabel(h.page)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminVisitors() {
  const [, navigate] = useLocation();
  const [data, setData] = useState<VisitorsData | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastPulse, setLastPulse] = useState(Date.now());
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!isAdminAuthenticated()) { navigate("/admin/login"); return; }

    const connect = () => {
      const token = getAdminToken();
      const url = `/api/admin/visitors/stream?token=${encodeURIComponent(token)}`;
      const es = new EventSource(url);
      esRef.current = es;

      const handleMessage = (e: MessageEvent) => {
        try {
          const parsed = JSON.parse(e.data) as VisitorsData;
          setData(parsed);
          setConnected(true);
          setLastPulse(Date.now());
        } catch {
          // ignore parse errors
        }
      };

      es.onmessage = handleMessage;
      es.onerror = () => {
        setConnected(false);
        es.close();
        setTimeout(connect, 4000);
      };
    };

    connect();

    return () => {
      esRef.current?.close();
    };
  }, []);

  const visitors = data?.visitors ?? [];
  const events = data?.events ?? [];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Live Visitors</h1>
            <p className="text-slate-500 text-sm mt-0.5">Real-time activity — updates every 3 seconds</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
            <span className="text-xs font-medium text-slate-500">
              {connected ? "Live" : "Connecting…"}
            </span>
          </div>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Active Visitors", value: visitors.length, icon: <Users className="w-4 h-4" />, color: "text-green-600 bg-green-100" },
            {
              label: "On Product Pages",
              value: visitors.filter(v => v.currentPage?.startsWith("/products/")).length,
              icon: <MousePointerClick className="w-4 h-4" />,
              color: "text-indigo-600 bg-indigo-100",
            },
            {
              label: "In Cart / Checkout",
              value: visitors.filter(v => v.currentPage === "/cart" || v.currentPage === "/checkout").length,
              icon: <ShoppingBag className="w-4 h-4" />,
              color: "text-orange-600 bg-orange-100",
            },
            {
              label: "Recent Events",
              value: events.length,
              icon: <Activity className="w-4 h-4" />,
              color: "text-violet-600 bg-violet-100",
            },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">{card.label}</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${card.color}`}>{card.icon}</div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active visitors */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-800">Active Sessions <span className="text-slate-400 font-normal">(last 5 min)</span></h2>
            </div>
            {visitors.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-12 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-25" />
                <p className="text-sm font-medium">No active visitors right now</p>
                <p className="text-xs mt-1">Sessions appear here as soon as someone visits the store</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {visitors.map((v) => (
                  <VisitorCard key={v.sessionId} visitor={v} />
                ))}
              </div>
            )}
          </div>

          {/* Live event feed */}
          <div>
            <h2 className="font-semibold text-slate-800 mb-3">Live Event Feed</h2>
            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
              {events.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-25" />
                  <p className="text-xs">No events yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border max-h-[520px] overflow-y-auto">
                  {events.map((ev, i) => (
                    <div key={i} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                          {EVENT_ICONS[ev.type] || <Activity className="w-3.5 h-3.5 text-slate-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-700 truncate">
                            {EVENT_LABELS[ev.type] || ev.type}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {ev.page ? pageLabel(ev.page) : "—"}
                            <span className="ml-1 font-mono text-slate-300">· {shortSession(ev.sessionId)}</span>
                          </p>
                        </div>
                        <span className="text-xs text-slate-300 whitespace-nowrap">{timeAgo(ev.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Page distribution */}
            {visitors.length > 0 && (
              <div className="mt-4 bg-white rounded-xl border border-border shadow-sm p-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Where visitors are now</h3>
                {(() => {
                  const pageCounts: Record<string, number> = {};
                  for (const v of visitors) {
                    const p = v.currentPage ?? "Unknown";
                    pageCounts[p] = (pageCounts[p] || 0) + 1;
                  }
                  const max = Math.max(...Object.values(pageCounts), 1);
                  return Object.entries(pageCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([page, count]) => (
                      <div key={page} className="mb-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-600 truncate max-w-36">{pageLabel(page)}</span>
                          <span className="text-xs font-semibold text-slate-700">{count}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-400 rounded-full transition-all duration-500"
                            style={{ width: `${(count / max) * 100}%` }}
                          />
                        </div>
                      </div>
                    ));
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
