import { AdminLayout } from "@/components/admin-layout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight } from "lucide-react";
import { adminFetch } from "@/lib/admin-api";

type Coupon = {
  id: number;
  code: string;
  type: "fixed" | "percent";
  value: string;
  active: boolean;
  minAmountCents: number;
  expiresAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  createdAt: string;
};

const empty = (): Partial<Coupon> => ({
  code: "", type: "fixed", value: "", active: true, minAmountCents: 0, expiresAt: null, usageLimit: null,
});

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<Partial<Coupon>>(empty());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminFetch<Coupon[]>("/admin/coupons");
      setCoupons(data);
    } catch { setError("Failed to load coupons"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const startNew = () => { setForm(empty()); setEditId("new"); setSaveError(""); };
  const startEdit = (c: Coupon) => {
    setForm({
      ...c,
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : null,
    });
    setEditId(c.id);
    setSaveError("");
  };
  const cancelEdit = () => { setEditId(null); setSaveError(""); };

  const save = async () => {
    if (!form.code?.trim() || !form.type || form.value == null || form.value === "") {
      setSaveError("Code, type and value are required"); return;
    }
    setSaving(true); setSaveError("");
    try {
      const body = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: parseFloat(String(form.value)),
        active: form.active !== false,
        minAmountCents: Number(form.minAmountCents ?? 0),
        expiresAt: form.expiresAt || null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      };
      if (editId === "new") {
        await adminFetch("/admin/coupons", { method: "POST", body: JSON.stringify(body) });
      } else {
        await adminFetch(`/admin/coupons/${editId}`, { method: "PUT", body: JSON.stringify(body) });
      }
      await load();
      setEditId(null);
    } catch (e: any) { setSaveError(e.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const toggle = async (c: Coupon) => {
    try {
      await adminFetch(`/admin/coupons/${c.id}`, { method: "PUT", body: JSON.stringify({ active: !c.active }) });
      await load();
    } catch {}
  };

  const del = async (id: number) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await adminFetch(`/admin/coupons/${id}`, { method: "DELETE" });
      await load();
    } catch {}
  };

  const f = (k: keyof Coupon, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-serif text-foreground">Coupon Codes</h1>
          {editId === null && (
            <Button onClick={startNew} size="sm" className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="w-4 h-4 mr-1" /> New Coupon
            </Button>
          )}
        </div>

        {/* Form */}
        {editId !== null && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-base font-semibold mb-4">{editId === "new" ? "New Coupon" : "Edit Coupon"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Code *</Label>
                <Input value={form.code ?? ""} onChange={e => f("code", e.target.value.toUpperCase())} placeholder="SAVE10" className="uppercase" />
              </div>
              <div className="space-y-1.5">
                <Label>Type *</Label>
                <select value={form.type ?? "fixed"} onChange={e => f("type", e.target.value)}
                  className="w-full h-10 px-3 border border-input rounded-lg bg-background text-sm">
                  <option value="fixed">Fixed USD ($)</option>
                  <option value="percent">Percent (%)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Value * {form.type === "percent" ? "(%)" : "($)"}</Label>
                <Input type="number" min="0" step="0.01" value={form.value ?? ""} onChange={e => f("value", e.target.value)} placeholder={form.type === "percent" ? "10" : "5.00"} />
              </div>
              <div className="space-y-1.5">
                <Label>Minimum cart ($)</Label>
                <Input type="number" min="0" step="0.01"
                  value={form.minAmountCents != null ? (form.minAmountCents / 100).toFixed(2) : ""}
                  onChange={e => f("minAmountCents", Math.round(parseFloat(e.target.value || "0") * 100))}
                  placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <Label>Expiry date</Label>
                <Input type="date" value={form.expiresAt ?? ""} onChange={e => f("expiresAt", e.target.value || null)} />
              </div>
              <div className="space-y-1.5">
                <Label>Usage limit</Label>
                <Input type="number" min="1" value={form.usageLimit ?? ""} onChange={e => f("usageLimit", e.target.value ? parseInt(e.target.value) : null)} placeholder="Unlimited" />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input type="checkbox" id="active-chk" checked={form.active !== false} onChange={e => f("active", e.target.checked)} className="w-4 h-4 accent-primary" />
                <Label htmlFor="active-chk" className="cursor-pointer">Active</Label>
              </div>
            </div>
            {saveError && <p className="text-sm text-red-600 mt-3">{saveError}</p>}
            <div className="flex gap-3 mt-5">
              <Button onClick={save} disabled={saving} className="bg-primary hover:bg-primary/90 text-white">
                <Check className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={cancelEdit}><X className="w-4 h-4 mr-1" /> Cancel</Button>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : coupons.length === 0 ? (
          <p className="text-muted-foreground text-sm">No coupons yet.</p>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  {["Code", "Type", "Value", "Min $", "Expires", "Usage", "Status", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {coupons.map(c => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-foreground">{c.code}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{c.type}</td>
                    <td className="px-4 py-3 font-mono">
                      {c.type === "percent" ? `${c.value}%` : `$${parseFloat(c.value).toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.minAmountCents > 0 ? `$${(c.minAmountCents / 100).toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.usageCount}/{c.usageLimit ?? "∞"}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggle(c)} title="Toggle active">
                        {c.active
                          ? <ToggleRight className="w-5 h-5 text-green-500" />
                          : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(c)} className="text-muted-foreground hover:text-primary" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => del(c.id)} className="text-muted-foreground hover:text-red-600" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
