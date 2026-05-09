import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/admin-layout";
import { adminApi, type AdminOrder, isAdminAuthenticated } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUSES = ["all", "pending", "paid", "failed", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-600",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

export function AdminOrders() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = (status: string) => {
    setLoading(true);
    adminApi.getOrders(status)
      .then(setOrders)
      .catch(() => toast({ title: "Error", description: "Could not load orders", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAdminAuthenticated()) { navigate("/admin/login"); return; }
    load(activeStatus);
  }, [activeStatus]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const updated = await adminApi.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      toast({ title: "Order updated", description: `Status changed to ${newStatus}` });
    } catch {
      toast({ title: "Error", description: "Failed to update order", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const counts: Record<string, number> = {};
  orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
            <p className="text-slate-500 text-sm mt-0.5">{orders.length} order{orders.length !== 1 ? "s" : ""} found</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => load(activeStatus)} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors border ${
                activeStatus === s
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-border hover:bg-slate-50"
              }`}
            >
              {s}
              {s !== "all" && counts[s] ? (
                <span className="ml-2 bg-white/20 text-inherit px-1.5 py-0.5 rounded text-xs">
                  {counts[s]}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <p className="text-sm">No orders found for this filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-50">
                    <th className="text-left px-6 py-3">Order ID</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-right px-4 py-3">Amount</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Date</th>
                    <th className="text-left px-6 py-3">Change Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">{order.id}</td>
                      <td className="px-4 py-4 font-medium text-slate-800 whitespace-nowrap">{order.customerName}</td>
                      <td className="px-4 py-4 text-slate-500 text-xs whitespace-nowrap">{order.customerEmail}</td>
                      <td className="px-4 py-4 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                        € {(order.amountCents / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-4"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-4 text-xs text-slate-400 whitespace-nowrap">
                        <div>{new Date(order.createdAt).toLocaleDateString("it-IT")}</div>
                        <div>{new Date(order.createdAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}</div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-xs border border-input rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
