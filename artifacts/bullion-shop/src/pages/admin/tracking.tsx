import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/admin-api";
import { BarChart2, CheckCircle, Circle, Eye, EyeOff, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TrackingConfig {
  enabled: boolean;
  ga4MeasurementId: string;
  googleAdsId: string;
  googleAdsPurchaseConversionLabel: string;
  gtmId: string | null;
}

function StatusBadge({ value }: { value: string | null | undefined }) {
  const ok = !!value && value.trim() !== "";
  return ok ? (
    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
      <CheckCircle className="w-3 h-3" /> Configured
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
      <Circle className="w-3 h-3" /> Not configured
    </span>
  );
}

function MaskedInput({
  label, value, onChange, placeholder, hint,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string;
}) {
  const [show, setShow] = useState(false);
  const masked = value.length > 8 ? value.slice(0, 6) + "..." + value.slice(-4) : value;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <StatusBadge value={value} />
      </div>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background pr-10 font-mono"
          value={show ? value : (value ? masked : "")}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setShow(true)}
          onBlur={() => setShow(false)}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          onMouseDown={() => setShow(s => !s)}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function AdminTracking() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cfg, setCfg] = useState<TrackingConfig>({
    enabled: false,
    ga4MeasurementId: "",
    googleAdsId: "",
    googleAdsPurchaseConversionLabel: "",
    gtmId: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminFetch("/admin/tracking-config") as TrackingConfig;
      setCfg({
        enabled: data.enabled ?? false,
        ga4MeasurementId: data.ga4MeasurementId ?? "",
        googleAdsId: data.googleAdsId ?? "",
        googleAdsPurchaseConversionLabel: data.googleAdsPurchaseConversionLabel ?? "",
        gtmId: data.gtmId ?? "",
      });
    } catch {
      toast({ title: "Failed to load tracking config", variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      await adminFetch("/admin/tracking-config", {
        method: "POST",
        body: JSON.stringify(cfg),
      });
      toast({ title: "Tracking config saved ✓" });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
    setSaving(false);
  };

  const set = (field: keyof TrackingConfig) => (value: string) =>
    setCfg(c => ({ ...c, [field]: value }));

  return (
    <AdminLayout>
      <div className="p-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <BarChart2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Tracking & Analytics</h1>
              <p className="text-sm text-muted-foreground">GA4 · Google Ads · Consent Mode v2</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Enable toggle */}
        <div className="bg-card border border-border rounded-xl p-5 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">Enable Tracking</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                When disabled, no GA4/Ads events are sent (Consent Mode stays active)
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCfg(c => ({ ...c, enabled: !c.enabled }))}
              className={`relative w-12 h-6 rounded-full transition-colors ${cfg.enabled ? "bg-primary" : "bg-slate-200"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${cfg.enabled ? "translate-x-7" : "translate-x-1"}`} />
            </button>
          </div>
        </div>

        {/* Fields */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-5 mb-5">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Google Analytics 4</h2>
          <MaskedInput
            label="GA4 Measurement ID"
            value={cfg.ga4MeasurementId}
            onChange={set("ga4MeasurementId")}
            placeholder="G-XXXXXXXXXX"
            hint="Found in GA4 → Admin → Data Streams → Measurement ID"
          />
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-5 mb-5">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Google Ads</h2>
          <MaskedInput
            label="Google Ads Account ID"
            value={cfg.googleAdsId}
            onChange={set("googleAdsId")}
            placeholder="AW-XXXXXXXXXX"
            hint="Found in Google Ads → Tools → Conversions → Tag setup"
          />
          <MaskedInput
            label="Purchase Conversion Label"
            value={cfg.googleAdsPurchaseConversionLabel}
            onChange={set("googleAdsPurchaseConversionLabel")}
            placeholder="XXXXXXXXXXXX"
            hint="Found next to the Conversion ID in your Google Ads purchase conversion action"
          />
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Google Tag Manager (optional)</h2>
          <MaskedInput
            label="GTM Container ID"
            value={cfg.gtmId ?? ""}
            onChange={set("gtmId")}
            placeholder="GTM-XXXXXXX"
            hint="Leave empty if using gtag directly (recommended)"
          />
        </div>

        {/* Summary */}
        <div className="bg-slate-50 rounded-xl border border-border p-4 mb-6 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-slate-700 mb-2">Current status</p>
          <div className="grid grid-cols-2 gap-1">
            <span>Tracking enabled:</span><span className={cfg.enabled ? "text-emerald-600 font-medium" : ""}>{cfg.enabled ? "Yes" : "No"}</span>
            <span>GA4:</span><StatusBadge value={cfg.ga4MeasurementId} />
            <span>Google Ads:</span><StatusBadge value={cfg.googleAdsId} />
            <span>Conversion Label:</span><StatusBadge value={cfg.googleAdsPurchaseConversionLabel} />
          </div>
        </div>

        <Button onClick={save} disabled={saving} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white">
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Configuration
        </Button>
      </div>
    </AdminLayout>
  );
}
