import { AdminLayout } from "@/components/admin-layout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight } from "lucide-react";
import { adminFetch } from "@/lib/admin-api";

type ShippingMethod = {
  id: number; name: string; description: string | null; estimatedDays: string | null;
  priceCents: number; type: string; freeThresholdCents: number | null;
  active: boolean; sortOrder: number;
};
type ShippingClass = {
  id: number; name: string; description: string | null; extraPriceCents: number; active: boolean;
};

const emptyMethod = (): Partial<ShippingMethod> => ({
  name: "", description: "", estimatedDays: "", priceCents: 0, type: "flat_rate",
  freeThresholdCents: null, active: true, sortOrder: 0,
});
const emptyClass = (): Partial<ShippingClass> => ({ name: "", description: "", extraPriceCents: 0, active: true });

export default function AdminShipping() {
  const [tab, setTab] = useState<"methods" | "classes">("methods");
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [classes, setClasses] = useState<ShippingClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<Partial<ShippingMethod> | Partial<ShippingClass>>(emptyMethod());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  const loadMethods = async () => {
    try { setMethods(await adminFetch<ShippingMethod[]>("/admin/shipping/methods")); } catch {}
  };
  const loadClasses = async () => {
    try { setClasses(await adminFetch<ShippingClass[]>("/admin/shipping/classes")); } catch {}
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadMethods(), loadClasses()]).finally(() => setLoading(false));
  }, []);

  const startNew = () => {
    setForm(tab === "methods" ? emptyMethod() : emptyClass());
    setEditId("new"); setSaveError("");
  };
  const startEdit = (item: ShippingMethod | ShippingClass) => { setForm({ ...item }); setEditId(item.id); setSaveError(""); };
  const cancel = () => { setEditId(null); setSaveError(""); };

  const save = async () => {
    const f = form as any;
    if (!f.name?.trim()) { setSaveError("Name is required"); return; }
    setSaving(true); setSaveError("");
    try {
      const isMethod = tab === "methods";
      const path = isMethod ? "/admin/shipping/methods" : "/admin/shipping/classes";
      const body = isMethod
        ? {
            name: f.name.trim(), description: f.description || null, estimatedDays: f.estimatedDays || null,
            priceCents: Number(f.priceCents ?? 0), type: f.type ?? "flat_rate",
            freeThresholdCents: f.freeThresholdCents ? Number(f.freeThresholdCents) : null,
            active: f.active !== false, sortOrder: Number(f.sortOrder ?? 0),
          }
        : {
            name: f.name.trim(), description: f.description || null,
            extraPriceCents: Number(f.extraPriceCents ?? 0), active: f.active !== false,
          };
      if (editId === "new") await adminFetch(path, { method: "POST", body: JSON.stringify(body) });
      else await adminFetch(`${path}/${editId}`, { method: "PUT", body: JSON.stringify(body) });
      await (isMethod ? loadMethods() : loadClasses());
      setEditId(null);
    } catch (e: any) { setSaveError(e.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const toggle = async (item: ShippingMethod | ShippingClass) => {
    const path = tab === "methods" ? "/admin/shipping/methods" : "/admin/shipping/classes";
    try {
      await adminFetch(`${path}/${item.id}`, { method: "PUT", body: JSON.stringify({ active: !item.active }) });
      tab === "methods" ? await loadMethods() : await loadClasses();
    } catch {}
  };

  const del = async (id: number) => {
    if (!confirm("Delete this item?")) return;
    const path = tab === "methods" ? "/admin/shipping/methods" : "/admin/shipping/classes";
    try { await adminFetch(`${path}/${id}`, { method: "DELETE" }); tab === "methods" ? await loadMethods() : await loadClasses(); } catch {}
  };

  const f = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const fm = form as any;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-serif text-foreground">Shipping Settings</h1>
          {editId === null && (
            <Button onClick={startNew} size="sm" className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="w-4 h-4 mr-1" /> New {tab === "methods" ? "Method" : "Class"}
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted/50 p-1 rounded-lg w-fit">
          {(["methods", "classes"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setEditId(null); }}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
                tab === t ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}>
              Shipping {t}
            </button>
          ))}
        </div>

        {/* Form */}
        {editId !== null && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-base font-semibold mb-4">{editId === "new" ? "New" : "Edit"} {tab === "methods" ? "Shipping Method" : "Shipping Class"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input value={fm.name ?? ""} onChange={e => f("name", e.target.value)} placeholder="Standard Shipping" />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input value={fm.description ?? ""} onChange={e => f("description", e.target.value)} placeholder="Optional description" />
              </div>
              {tab === "methods" && (<>
                <div className="space-y-1.5">
                  <Label>Type *</Label>
                  <select value={fm.type ?? "flat_rate"} onChange={e => f("type", e.target.value)}
                    className="w-full h-10 px-3 border border-input rounded-lg bg-background text-sm">
                    <option value="flat_rate">Flat Rate</option>
                    <option value="free">Always Free</option>
                    <option value="free_threshold">Free Above Threshold</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Price ($) {fm.type === "free" ? "(ignored)" : ""}</Label>
                  <Input type="number" min="0" step="0.01"
                    value={fm.priceCents != null ? (fm.priceCents / 100).toFixed(2) : ""}
                    onChange={e => f("priceCents", Math.round(parseFloat(e.target.value || "0") * 100))}
                    disabled={fm.type === "free"} placeholder="25.00" />
                </div>
                {fm.type === "free_threshold" && (
                  <div className="space-y-1.5">
                    <Label>Free Threshold ($)</Label>
                    <Input type="number" min="0" step="0.01"
                      value={fm.freeThresholdCents != null ? (fm.freeThresholdCents / 100).toFixed(2) : ""}
                      onChange={e => f("freeThresholdCents", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null)}
                      placeholder="500.00" />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label>Estimated Days</Label>
                  <Input value={fm.estimatedDays ?? ""} onChange={e => f("estimatedDays", e.target.value)} placeholder="3–5 business days" />
                </div>
                <div className="space-y-1.5">
                  <Label>Sort Order</Label>
                  <Input type="number" value={fm.sortOrder ?? 0} onChange={e => f("sortOrder", parseInt(e.target.value || "0"))} />
                </div>
              </>)}
              {tab === "classes" && (
                <div className="space-y-1.5">
                  <Label>Extra Price ($)</Label>
                  <Input type="number" min="0" step="0.01"
                    value={fm.extraPriceCents != null ? (fm.extraPriceCents / 100).toFixed(2) : "0.00"}
                    onChange={e => f("extraPriceCents", Math.round(parseFloat(e.target.value || "0") * 100))}
                    placeholder="0.00" />
                </div>
              )}
              <div className="flex items-center gap-3 pt-6">
                <input type="checkbox" id="active-cb" checked={fm.active !== false} onChange={e => f("active", e.target.checked)} className="w-4 h-4 accent-primary" />
                <Label htmlFor="active-cb" className="cursor-pointer">Active</Label>
              </div>
            </div>
            {saveError && <p className="text-sm text-red-600 mt-3">{saveError}</p>}
            <div className="flex gap-3 mt-5">
              <Button onClick={save} disabled={saving} className="bg-primary hover:bg-primary/90 text-white">
                <Check className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={cancel}><X className="w-4 h-4 mr-1" /> Cancel</Button>
            </div>
          </div>
        )}

        {/* Methods Table */}
        {tab === "methods" && (
          loading ? <p className="text-sm text-muted-foreground">Loading...</p> :
          methods.length === 0 ? <p className="text-sm text-muted-foreground">No shipping methods.</p> :
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr>{["Method", "Type", "Price", "Free Threshold", "ETA", "Order", "Status", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {methods.map(m => (
                  <tr key={m.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium text-foreground">{m.name}{m.description && <div className="text-xs text-muted-foreground">{m.description}</div>}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{m.type.replace("_", " ")}</td>
                    <td className="px-4 py-3 font-mono">{m.type === "free" ? "FREE" : `$${(m.priceCents / 100).toFixed(2)}`}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.freeThresholdCents ? `$${(m.freeThresholdCents / 100).toFixed(2)}` : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{m.estimatedDays ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.sortOrder}</td>
                    <td className="px-4 py-3"><button onClick={() => toggle(m)}>{m.active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}</button></td>
                    <td className="px-4 py-3"><div className="flex gap-2">
                      <button onClick={() => startEdit(m)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => del(m.id)} className="text-muted-foreground hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Classes Table */}
        {tab === "classes" && (
          loading ? <p className="text-sm text-muted-foreground">Loading...</p> :
          classes.length === 0 ? <p className="text-sm text-muted-foreground">No shipping classes.</p> :
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border"><tr>
                {["Class", "Description", "Extra Price", "Status", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-border">
                {classes.map(c => (
                  <tr key={c.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{c.description ?? "—"}</td>
                    <td className="px-4 py-3 font-mono">{c.extraPriceCents > 0 ? `+$${(c.extraPriceCents/100).toFixed(2)}` : "—"}</td>
                    <td className="px-4 py-3"><button onClick={() => toggle(c)}>{c.active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}</button></td>
                    <td className="px-4 py-3"><div className="flex gap-2">
                      <button onClick={() => startEdit(c)} className="text-muted-foreground hover:text-primary"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => del(c.id)} className="text-muted-foreground hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Info box */}
        <div className="mt-8 bg-muted/30 border border-border rounded-lg p-4 text-xs text-muted-foreground space-y-1">
          <p><strong>Flat Rate:</strong> fixed price regardless of order total.</p>
          <p><strong>Always Free:</strong> $0 shipping always.</p>
          <p><strong>Free Above Threshold:</strong> free if cart ≥ threshold, otherwise charges base price.</p>
          <p><strong>Shipping Classes:</strong> assign to products for surcharges (e.g. heavy items). Edit products to assign a class.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
