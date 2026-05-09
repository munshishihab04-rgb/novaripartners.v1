import { AdminLayout } from "@/components/admin-layout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getAdminToken } from "@/lib/admin-auth";
import { Plus, Trash2, Save, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Tier = {
  minQty: number;
  maxQty: number | null;
  discountPercent: number;
  label: string;
};

export default function AdminDiscounts() {
  const { toast } = useToast();
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/discount-tiers", {
      headers: { Authorization: `Bearer ${getAdminToken()}` },
    })
      .then(r => r.json())
      .then((d: Tier[]) => setTiers(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (i: number, field: keyof Tier, val: string) => {
    setTiers(prev => prev.map((t, idx) => {
      if (idx !== i) return t;
      if (field === "maxQty") return { ...t, maxQty: val === "" || val === "∞" ? null : parseInt(val) || null };
      if (field === "minQty") return { ...t, minQty: parseInt(val) || 0 };
      if (field === "discountPercent") return { ...t, discountPercent: parseFloat(val) || 0 };
      return { ...t, [field]: val };
    }));
  };

  const addTier = () => {
    const last = tiers[tiers.length - 1];
    const newMin = last ? (last.maxQty ? last.maxQty + 1 : 50) : 1;
    setTiers(prev => [...prev, { minQty: newMin, maxQty: null, discountPercent: 0, label: `${newMin}+ coins` }]);
  };

  const removeTier = (i: number) => setTiers(prev => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch("/api/admin/discount-tiers", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify(tiers),
      });
      if (!r.ok) throw new Error("Save failed");
      toast({ title: "Saved", description: "Discount tiers updated successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to save tiers.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Volume Discounts</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Set quantity-based discounts. Applied automatically at checkout.
            </p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Note:</strong> Discounts are applied per-item quantity at checkout. Changes take effect immediately on new orders.
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-16 bg-muted rounded-lg" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Header */}
            <div className="grid grid-cols-12 gap-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-3">Min Qty</div>
              <div className="col-span-3">Max Qty</div>
              <div className="col-span-2">Discount %</div>
              <div className="col-span-3">Label</div>
              <div className="col-span-1"></div>
            </div>

            {tiers.map((tier, i) => (
              <div key={i} className="grid grid-cols-12 gap-3 items-center bg-card border border-border rounded-lg p-3">
                <div className="col-span-3">
                  <input
                    type="number"
                    min="1"
                    value={tier.minQty}
                    onChange={e => update(i, "minQty", e.target.value)}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="col-span-3">
                  <input
                    type="text"
                    placeholder="∞ (unlimited)"
                    value={tier.maxQty === null ? "" : String(tier.maxQty)}
                    onChange={e => update(i, "maxQty", e.target.value)}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="col-span-2">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="80"
                      step="0.5"
                      value={tier.discountPercent}
                      onChange={e => update(i, "discountPercent", e.target.value)}
                      className="w-full border border-input rounded-md px-3 py-2 pr-7 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">%</span>
                  </div>
                </div>
                <div className="col-span-3">
                  <input
                    type="text"
                    value={tier.label}
                    onChange={e => update(i, "label", e.target.value)}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. 5–9 coins"
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    onClick={() => removeTier(i)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    title="Remove tier"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addTier} className="w-full gap-2 border-dashed mt-2">
              <Plus className="w-4 h-4" />
              Add tier
            </Button>
          </div>
        )}

        {/* Preview */}
        {tiers.length > 0 && (
          <div className="mt-8 bg-card border border-border rounded-lg p-5">
            <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Preview (how it shows on product page)</h3>
            <div className={`grid gap-2 grid-cols-${Math.min(tiers.length, 4)}`}>
              {tiers.map((tier, i) => (
                <div key={i} className={`text-center p-2 rounded-lg border text-xs ${
                  i === 0 ? 'bg-amber-500 border-amber-500 text-white font-bold' : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <p className="font-semibold">{tier.label}</p>
                  <p>{tier.discountPercent > 0 ? `-${tier.discountPercent}% off` : "Base price"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
