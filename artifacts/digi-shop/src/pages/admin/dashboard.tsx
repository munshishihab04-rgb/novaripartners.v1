import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/admin-layout";
import { adminApi, type AdminStats, getAdminPassword } from "@/lib/admin-api";
import { TrendingUp, ShoppingBag, Package, AlertCircle, CheckCircle2, Clock } from "lucide-react";

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

export function AdminDashboard() {
  const [, navigate] = useLocation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getAdminPassword()) { navigate("/admin/login"); return; }
    adminApi.getStats()
      .then(setStats)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-xl border border-border animate-pulse" />)}
        </div>
        <div className="h-64 bg-white rounded-xl border border-border animate-pulse" />
      </div>
    </AdminLayout>
  );

  if (error) return (
    <AdminLayout>
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600">
          <p className="font-semibold mb-1">Failed to load stats</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    </AdminLayout>
  );

  const s = stats!;
  const paidOrders = s.orderStats["paid"] || 0;
  const pendingOrders = s.orderStats["pending"] || 0;
  const failedOrders = s.orderStats["failed"] || 0;
  const avgOrderEur = paidOrders > 0 ? (s.totalRevenueCents / 100 / paidOrders).toFixed(2) : "0.00";

  const statCards = [
    {
      label: "Total Revenue",
      value: `€ ${Number(s.totalRevenueEur).toLocaleString("it-IT", { minimumFractionDigits: 2 })}`,
      sub: `${paidOrders} paid order${paidOrders !== 1 ? "s" : ""}`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Total Orders",
      value: String(s.totalOrders),
      sub: `${pendingOrders} pending · ${failedOrders} failed`,
      icon: <ShoppingBag className="w-5 h-5" />,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Avg. Order Value",
      value: `€ ${avgOrderEur}`,
      sub: "from paid orders",
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Products",
      value: String(s.totalProducts),
      sub: `${s.inStockCount} in stock · ${s.outOfStockCount} out`,
      icon: <Package className="w-5 h-5" />,
      color: "text-orange-600 bg-orange-100",
    },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Overview of your store performance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">{card.label}</span>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.color}`}>
                  {card.icon}
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

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
                        <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">
                          € {(order.amountCents / 100).toFixed(2)}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                        <td className="px-6 py-3 text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString("it-IT")}
                        </td>
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
                const pct = s.totalOrders > 0 ? Math.round((cnt / s.totalOrders) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {icon}
                        <span className="text-sm font-medium text-slate-700">{label}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-800">{cnt}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
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
