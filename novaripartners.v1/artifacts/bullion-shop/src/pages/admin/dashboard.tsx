import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/admin-layout";
import { adminApi, type AdminStats, type AdminAnalytics, isAdminAuthenticated } from "@/lib/admin-api";
import {
  TrendingUp, ShoppingBag, Package, CheckCircle2, Clock, AlertCircle,
  Users, Eye, MousePointerClick, CreditCard,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-600",
};
function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

function fmt(n: number) {
  return n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function pct(num: number, denom: number) {
  if (!denom) return "—";
  return `${Math.round((num / denom) * 100)}%`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-white border border-border rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      <p className="text-slate-900 font-bold">€ {fmt(d?.revenue ?? 0)}</p>
      <p className="text-slate-500 text-xs">{d?.orders ?? 0} order{d?.orders !== 1 ? "s" : ""}</p>
    </div>
  );
};

const PAGE_LABELS: Record<string, string> = {
  "/": "Homepage",
  "/catalog": "Catalog",
  "/cart": "Cart",
  "/checkout": "Checkout",
  "/about": "About",
  "/contact": "Contact",
  "/faq": "FAQ",
};

export function AdminDashboard() {
  const [, navigate] = useLocation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdminAuthenticated()) { navigate("/admin/login"); return; }
    Promise.all([adminApi.getStats(), adminApi.getAnalytics()])
      .then(([s, a]) => { setStats(s); setAnalytics(a); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout>
      <div className="p-8 space-y-6 animate-pulse">
        <div className="grid grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-xl border" />)}</div>
        <div className="h-72 bg-white rounded-xl border" />
        <div className="grid grid-cols-3 gap-6"><div className="col-span-2 h-64 bg-white rounded-xl border" /><div className="h-64 bg-white rounded-xl border" /></div>
      </div>
    </AdminLayout>
  );

  if (error || !stats) return (
    <AdminLayout>
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600">
          <p className="font-semibold">Failed to load dashboard</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    </AdminLayout>
  );

  const s = stats;
  const a = analytics;
  const paidOrders = s.orderStats["paid"] || 0;
  const pendingOrders = s.orderStats["pending"] || 0;
  const failedOrders = s.orderStats["failed"] || 0;
  const avgOrderEur = paidOrders > 0 ? (s.totalRevenueCents / 100 / paidOrders) : 0;

  const statCards = [
    {
      label: "Total Revenue", value: `€ ${fmt(s.totalRevenueCents / 100)}`,
      sub: `${paidOrders} paid order${paidOrders !== 1 ? "s" : ""}`,
      icon: <TrendingUp className="w-5 h-5" />, color: "text-green-600 bg-green-100",
    },
    {
      label: "Total Orders", value: String(s.totalOrders),
      sub: `${pendingOrders} pending · ${failedOrders} failed`,
      icon: <ShoppingBag className="w-5 h-5" />, color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Avg. Order Value", value: `€ ${fmt(avgOrderEur)}`,
      sub: a ? `${a.sessions30d.toLocaleString()} sessions (30d)` : "from paid orders",
      icon: <Users className="w-5 h-5" />, color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Products", value: String(s.totalProducts),
      sub: `${s.inStockCount} in stock · ${s.outOfStockCount} out`,
      icon: <Package className="w-5 h-5" />, color: "text-orange-600 bg-orange-100",
    },
  ];

  // Funnel
  const funnel = a?.funnel ?? { pageViews: 0, productViews: 0, checkoutStarted: 0, paidOrders: 0 };
  const funnelMax = Math.max(funnel.pageViews, 1);
  const funnelSteps = [
    { label: "Page Views", sub: "Unique sessions (30d)", value: funnel.pageViews, icon: <Eye className="w-4 h-4" />, color: "bg-blue-500", prev: null },
    { label: "Product Views", sub: "Sessions that viewed a product", value: funnel.productViews, icon: <MousePointerClick className="w-4 h-4" />, color: "bg-indigo-500", prev: funnel.pageViews },
    { label: "Checkout Started", sub: "Sessions that initiated payment", value: funnel.checkoutStarted, icon: <ShoppingBag className="w-4 h-4" />, color: "bg-violet-500", prev: funnel.productViews },
    { label: "Paid Orders", sub: "Completed purchases (30d)", value: funnel.paidOrders, icon: <CreditCard className="w-4 h-4" />, color: "bg-green-500", prev: funnel.checkoutStarted },
  ];

  // Revenue chart — show 12m but only colour bars with revenue
  const chartData = a?.monthlyRevenue ?? [];
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Your store at a glance</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">{card.label}</span>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.color}`}>{card.icon}</div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-border shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-800">Monthly Revenue</h2>
              <p className="text-xs text-slate-400 mt-0.5">Paid orders · last 12 months</p>
            </div>
            {a && (
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800">€ {fmt(a.monthlyRevenue.reduce((s, m) => s + m.revenue, 0))}</p>
                <p className="text-xs text-slate-400">12-month total</p>
              </div>
            )}
          </div>
          <div className="p-6">
            {chartData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-slate-400">
                <p className="text-sm">No revenue data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false} tickLine={false}
                    tickFormatter={(v) => v >= 1000 ? `€${(v / 1000).toFixed(0)}k` : `€${v}`}
                    width={48}
                  />
                  <Tooltip content={<RevenueTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.revenue > 0 ? "hsl(var(--primary))" : "#e2e8f0"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Analytics section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Conversion Funnel */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-border shadow-sm">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-slate-800">Conversion Funnel</h2>
              <p className="text-xs text-slate-400 mt-0.5">Last 30 days · unique visitor sessions</p>
            </div>
            <div className="p-6 space-y-5">
              {funnelSteps.map((step, i) => {
                const barWidth = funnelMax > 0 ? Math.max((step.value / funnelMax) * 100, step.value > 0 ? 2 : 0) : 0;
                const convRate = step.prev !== null ? pct(step.value, step.prev ?? 0) : null;
                return (
                  <div key={step.label}>
                    {convRate && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-px h-4 bg-slate-200 ml-4" />
                        <span className="text-xs text-slate-400">{convRate} conversion</span>
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${step.color}`}>
                        {step.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <div>
                            <span className="text-sm font-semibold text-slate-800">{step.label}</span>
                            <span className="text-xs text-slate-400 ml-2">{step.sub}</span>
                          </div>
                          <span className="text-sm font-bold text-slate-900 tabular-nums ml-2 shrink-0">
                            {step.value.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${step.color} rounded-full transition-all duration-500`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {funnel.pageViews === 0 && (
                <p className="text-xs text-slate-400 text-center pt-2">Analytics data will appear here once visitors start browsing the store.</p>
              )}
            </div>
          </div>

          {/* Sessions + Top Pages */}
          <div className="space-y-4">
            {/* Sessions */}
            <div className="bg-white rounded-xl border border-border shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Visitor Sessions
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Last 7 days</span>
                  <span className="text-lg font-bold text-slate-800">{(a?.sessions7d ?? 0).toLocaleString()}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Last 30 days</span>
                  <span className="text-lg font-bold text-slate-800">{(a?.sessions30d ?? 0).toLocaleString()}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Page views (30d)</span>
                  <span className="text-lg font-bold text-slate-800">{(a?.pageViews30d ?? 0).toLocaleString()}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Cart abandonment</span>
                  <span className="text-sm font-semibold text-red-500">
                    {funnel.checkoutStarted > 0
                      ? `${Math.round((1 - funnel.paidOrders / funnel.checkoutStarted) * 100)}%`
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-white rounded-xl border border-border shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" /> Top Pages (30d)
              </h3>
              {!a || a.topPages.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No page view data yet</p>
              ) : (
                <div className="space-y-2">
                  {a.topPages.slice(0, 6).map((p) => {
                    const maxViews = a.topPages[0]?.views ?? 1;
                    const barW = Math.max((p.views / maxViews) * 100, 4);
                    return (
                      <div key={p.page}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-600 truncate max-w-32">
                            {PAGE_LABELS[p.page] ?? p.page}
                          </span>
                          <span className="text-xs font-semibold text-slate-700 tabular-nums">{p.views.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary/50 rounded-full" style={{ width: `${barW}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders + Orders by status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Recent Orders</h2>
              <a href="/admin/orders" className="text-xs text-primary hover:underline font-medium">View all →</a>
            </div>
            {s.recentOrders.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      <th className="text-left px-6 py-3">Order ID</th>
                      <th className="text-left px-4 py-3">Customer</th>
                      <th className="text-right px-4 py-3">Amount</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-6 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {s.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 font-mono text-xs text-slate-500">{order.id}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800 truncate max-w-32">{order.customerName}</p>
                          <p className="text-xs text-slate-400 truncate max-w-32">{order.customerEmail}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">€ {fmt(order.amountCents / 100)}</td>
                        <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                        <td className="px-6 py-3 text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString("it-IT")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <h2 className="font-semibold text-slate-800 mb-4">Orders by Status</h2>
            <div className="space-y-3">
              {[
                { label: "Paid", key: "paid", color: "bg-green-500", icon: <CheckCircle2 className="w-4 h-4 text-green-600" /> },
                { label: "Pending", key: "pending", color: "bg-amber-400", icon: <Clock className="w-4 h-4 text-amber-500" /> },
                { label: "Failed", key: "failed", color: "bg-red-400", icon: <AlertCircle className="w-4 h-4 text-red-500" /> },
                { label: "Cancelled", key: "cancelled", color: "bg-slate-300", icon: <AlertCircle className="w-4 h-4 text-slate-400" /> },
              ].map(({ label, key, color, icon }) => {
                const cnt = s.orderStats[key] || 0;
                const barPct = s.totalOrders > 0 ? Math.round((cnt / s.totalOrders) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">{icon}<span className="text-sm font-medium text-slate-700">{label}</span></div>
                      <span className="text-sm font-semibold text-slate-800">{cnt}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${barPct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
