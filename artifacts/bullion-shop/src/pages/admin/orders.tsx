import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/admin-layout";
import { adminApi, type AdminOrder, type AdminOrderDetail, isAdminAuthenticated } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Eye, X, Copy, CheckCircle, AlertCircle, Clock, Ban, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUSES = ["all", "pending", "paid", "failed", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-600",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  paid: <CheckCircle className="w-4 h-4 text-green-600" />,
  pending: <Clock className="w-4 h-4 text-amber-500" />,
  failed: <AlertCircle className="w-4 h-4 text-red-500" />,
  cancelled: <Ban className="w-4 h-4 text-slate-400" />,
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[status] || "bg-slate-100 text-slate-600"}`}>
      {STATUS_ICONS[status]}
      {status}
    </span>
  );
}

function fmt(cents: number, currency = "USD") {
  return `${currency === "EUR" ? "€" : "$"}${(cents / 100).toFixed(2)}`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); }}
      className="ml-1 text-slate-400 hover:text-primary transition-colors"
      title="Copy"
    >
      {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function OrderDetailDrawer({ orderId, onClose, onStatusChange }: {
  orderId: string;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true); setError("");
    adminApi.getOrderDetail(orderId)
      .then(setDetail)
      .catch(e => setError(e.message || "Failed to load order"))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!detail) return;
    setUpdatingStatus(true);
    try {
      await onStatusChange(orderId, newStatus);
      setDetail(prev => prev ? { ...prev, status: newStatus } : prev);
      toast({ title: "Status updated", description: `Order ${orderId.slice(0, 12)}… → ${newStatus}` });
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } finally { setUpdatingStatus(false); }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-50 shrink-0">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-widest mb-0.5">Order Detail</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-slate-800">{orderId}</span>
              <CopyButton text={orderId} />
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {loading && (
            <div className="space-y-3 animate-pulse">
              {[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded" />)}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{error}</div>
          )}
          {detail && (
            <>
              {/* Status + Change */}
              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2">
                  <StatusBadge status={detail.status} />
                  <span className="text-xs text-slate-400">{new Date(detail.createdAt).toLocaleString("it-IT")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Change:</span>
                  <select
                    value={detail.status}
                    onChange={e => handleStatusChange(e.target.value)}
                    disabled={updatingStatus}
                    className="text-xs border border-input rounded-md px-2 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Customer */}
              <Section title="Customer">
                <Row label="Name" value={detail.customerName} />
                <Row label="Email" value={detail.customerEmail} copy />
                {detail.userId && <Row label="User ID" value={String(detail.userId)} />}
                {detail.userInfo && (
                  <Row label="Account" value={detail.userInfo.email} />
                )}
              </Section>

              {/* Order items */}
              <Section title={`Items (${detail.items.length})`}>
                {detail.items.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No item data stored (legacy order)</p>
                ) : (
                  <div className="space-y-2">
                    {detail.items.map((item, i) => (
                      <div key={i} className="flex items-start justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm font-medium text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-400 font-mono">slug: {item.slug} · id: {item.productId}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-sm font-mono font-semibold">${parseFloat(item.price).toFixed(2)} × {item.quantity}</p>
                          <p className="text-xs text-slate-400">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Financials */}
              <Section title="Financials">
                <Row label="Subtotal" value={fmt(detail.subtotalCents, detail.currency)} mono />
                {detail.couponCode && (
                  <Row label={`Coupon (${detail.couponCode})`} value={`−${fmt(detail.couponDiscountCents, detail.currency)}`} className="text-green-700" mono />
                )}
                <Row label={`Shipping (${detail.shippingMethodName || "—"})`} value={fmt(detail.shippingAmountCents, detail.currency)} mono />
                <div className="pt-2 border-t border-border mt-2">
                  <Row label="Total" value={fmt(detail.amountCents, detail.currency)} mono bold />
                  <Row label="Currency" value={detail.currency} />
                </div>
              </Section>

              {/* Payment */}
              <Section title="Payment">
                <Row label="Provider" value={detail.paymentProvider} />
                <Row label="Security Token" value={detail.nexiTokenPresent ? "●●●●●● (present)" : "—"} />
                {detail.nexiPaymentId && <Row label="Payment ID" value={detail.nexiPaymentId} copy mono />}
              </Section>

              {/* Timeline */}
              <Section title="Timeline">
                <TimelineItem time={detail.createdAt} label="Order created" />
                {detail.status !== "pending" && (
                  <TimelineItem time={detail.updatedAt} label={`Status → ${detail.status}`} highlight />
                )}
              </Section>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{title}</h3>
      <div className="bg-white border border-border rounded-xl divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, copy, mono, bold, className }: {
  label: string; value: string; copy?: boolean; mono?: boolean; bold?: boolean; className?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-xs text-slate-400 w-36 shrink-0">{label}</span>
      <span className={`text-sm text-right flex items-center gap-1 ${mono ? "font-mono" : ""} ${bold ? "font-bold text-slate-900" : "text-slate-700"} ${className || ""}`}>
        {value}
        {copy && value !== "—" && <CopyButton text={value} />}
      </span>
    </div>
  );
}

function TimelineItem({ time, label, highlight }: { time: string; label: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className={`w-2 h-2 rounded-full shrink-0 ${highlight ? "bg-primary" : "bg-slate-300"}`} />
      <span className="text-xs text-slate-400 w-40 shrink-0">{new Date(time).toLocaleString("it-IT")}</span>
      <span className={`text-sm ${highlight ? "font-semibold text-slate-800" : "text-slate-500"}`}>{label}</span>
    </div>
  );
}

// ─── Main Orders page ────────────────────────────────────────────────────────

export function AdminOrders() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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
                    <th className="text-left px-4 py-3">Change Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="font-mono text-xs text-primary hover:underline"
                        >
                          {order.id}
                        </button>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-800 whitespace-nowrap">{order.customerName}</td>
                      <td className="px-4 py-4 text-slate-500 text-xs whitespace-nowrap">{order.customerEmail}</td>
                      <td className="px-4 py-4 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                        ${(order.amountCents / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-4"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-4 text-xs text-slate-400 whitespace-nowrap">
                        <div>{new Date(order.createdAt).toLocaleDateString("it-IT")}</div>
                        <div>{new Date(order.createdAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}</div>
                      </td>
                      <td className="px-4 py-4">
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
                      <td className="px-4 py-4">
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary transition-colors font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedOrderId && (
        <OrderDetailDrawer
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </AdminLayout>
  );
}
