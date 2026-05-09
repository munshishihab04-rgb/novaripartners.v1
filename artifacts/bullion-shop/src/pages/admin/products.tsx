import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/admin-layout";
import {
  adminApi,
  type AdminProduct,
  type AdminProductFull,
  type AdminCategory,
  type ImportResult,
  isAdminAuthenticated,
} from "@/lib/admin-api";
import {
  parseCSV,
  productsToCsv,
  downloadCSV,
  csvRowsToProducts,
  CSV_HEADERS,
  type CsvRow,
} from "@/lib/csv-utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  RefreshCw, Pencil, Search, Package2, Download, Upload,
  CheckSquare, Square, CheckCircle2, AlertCircle, X, Plus, Trash2,
} from "lucide-react";

const PLATFORMS = ["windows", "macos", "cross-platform"] as const;

function InStockBadge({ inStock }: { inStock: boolean }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
      {inStock ? "In Stock" : "Out of Stock"}
    </span>
  );
}

interface EditFormState {
  name: string; slug: string; shortDescription: string; description: string;
  publisher: string; version: string; platform: string; categoryId: number;
  price: string; originalPrice: string; currency: string; imageUrl: string;
  deliveryMethod: string; featuresText: string; inStock: boolean; isFeatured: boolean;
  rating: string; reviewCount: number;
}

const BLANK_FORM = (categories: AdminCategory[]): EditFormState => ({
  name: "", slug: "", shortDescription: "", description: "",
  publisher: "", version: "1.0", platform: "windows",
  categoryId: categories[0]?.id ?? 1,
  price: "0", originalPrice: "", currency: "EUR", imageUrl: "",
  deliveryMethod: "Email delivery within 24 hours",
  featuresText: "", inStock: true, isFeatured: false,
  rating: "5.0", reviewCount: 0,
});

function buildFormState(p: AdminProductFull, categories: AdminCategory[]): EditFormState {
  return {
    name: p.name, slug: p.slug, shortDescription: p.shortDescription,
    description: p.description, publisher: p.publisher, version: p.version,
    platform: p.platform, categoryId: p.categoryId || (categories[0]?.id ?? 1),
    price: p.price, originalPrice: p.originalPrice || "",
    currency: p.currency || "EUR", imageUrl: p.imageUrl || "",
    deliveryMethod: p.deliveryMethod,
    featuresText: (p.features || []).join("\n"),
    inStock: p.inStock, isFeatured: p.isFeatured,
    rating: p.rating || "5.0", reviewCount: p.reviewCount || 0,
  };
}

function ProductForm({ f, setF, categories }: {
  f: EditFormState;
  setF: (u: Partial<EditFormState>) => void;
  categories: AdminCategory[];
}) {
  const input = "w-full h-10 px-3 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background";
  const label = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide";

  return (
    <div className="space-y-5 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={label}>Product Name *</label>
          <input className={input} value={f.name} onChange={(e) => setF({ name: e.target.value })} placeholder="e.g. Microsoft Office 2024" />
        </div>
        <div>
          <label className={label}>Slug *</label>
          <input className={input} value={f.slug} onChange={(e) => setF({ slug: e.target.value })} placeholder="e.g. microsoft-office-2024" />
        </div>
        <div>
          <label className={label}>Publisher</label>
          <input className={input} value={f.publisher} onChange={(e) => setF({ publisher: e.target.value })} />
        </div>
        <div>
          <label className={label}>Version</label>
          <input className={input} value={f.version} onChange={(e) => setF({ version: e.target.value })} />
        </div>
        <div>
          <label className={label}>Platform</label>
          <select className={input} value={f.platform} onChange={(e) => setF({ platform: e.target.value })}>
            {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Category</label>
          <select className={input} value={f.categoryId} onChange={(e) => setF({ categoryId: Number(e.target.value) })}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Price (EUR) *</label>
          <input type="number" step="0.01" min="0" className={input} value={f.price} onChange={(e) => setF({ price: e.target.value })} />
        </div>
        <div>
          <label className={label}>Original Price (EUR, optional)</label>
          <input type="number" step="0.01" min="0" className={input} placeholder="Leave empty for no discount" value={f.originalPrice} onChange={(e) => setF({ originalPrice: e.target.value })} />
        </div>
      </div>

      <div>
        <label className={label}>Short Description</label>
        <textarea rows={2} className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none bg-background" value={f.shortDescription} onChange={(e) => setF({ shortDescription: e.target.value })} />
      </div>
      <div>
        <label className={label}>Full Description</label>
        <textarea rows={4} className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y bg-background" value={f.description} onChange={(e) => setF({ description: e.target.value })} />
      </div>
      <div>
        <label className={label}>Features (one per line)</label>
        <textarea rows={4} className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono resize-y bg-background" value={f.featuresText} onChange={(e) => setF({ featuresText: e.target.value })} placeholder={"Lifetime license\nAll future updates included\n..."} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Delivery Method</label>
          <input className={input} value={f.deliveryMethod} onChange={(e) => setF({ deliveryMethod: e.target.value })} />
        </div>
        <div>
          <label className={label}>Image URL</label>
          <input className={input} value={f.imageUrl} onChange={(e) => setF({ imageUrl: e.target.value })} placeholder="https://..." />
        </div>
        <div>
          <label className={label}>Rating (0–5)</label>
          <input type="number" step="0.1" min="0" max="5" className={input} value={f.rating} onChange={(e) => setF({ rating: e.target.value })} />
        </div>
        <div>
          <label className={label}>Review Count</label>
          <input type="number" min="0" className={input} value={f.reviewCount} onChange={(e) => setF({ reviewCount: Number(e.target.value) })} />
        </div>
      </div>

      <div className="flex gap-6 pt-1">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input type="checkbox" className="sr-only peer" checked={f.inStock} onChange={(e) => setF({ inStock: e.target.checked })} />
            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
          </div>
          <span className="text-sm font-medium text-slate-700">In Stock</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div className="relative">
            <input type="checkbox" className="sr-only peer" checked={f.isFeatured} onChange={(e) => setF({ isFeatured: e.target.checked })} />
            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
          </div>
          <span className="text-sm font-medium text-slate-700">Featured on Homepage</span>
        </label>
      </div>
    </div>
  );
}

export function AdminProducts() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<EditFormState | null>(null);
  const [creating, setCreating] = useState(false);

  // Edit modal
  const [editingProduct, setEditingProduct] = useState<AdminProductFull | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditFormState | null>(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Export/Import
  const [exporting, setExporting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<CsvRow[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([adminApi.getProducts(), adminApi.getCategories()])
      .then(([prods, cats]) => { setProducts(prods); setCategories(cats); })
      .catch(() => toast({ title: "Error", description: "Could not load products", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAdminAuthenticated()) { navigate("/admin/login"); return; }
    load();
  }, []);

  // Filtered list
  const filtered = products.filter((p) => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.categoryName || "").toLowerCase().includes(search.toLowerCase()) ||
      p.publisher.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || String(p.categoryId) === categoryFilter;
    return matchSearch && matchCat;
  });

  // Selection helpers
  const allSelected = filtered.length > 0 && filtered.every((p) => selectedIds.has(p.id));
  const someSelected = filtered.some((p) => selectedIds.has(p.id));

  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) filtered.forEach((p) => next.delete(p.id));
      else filtered.forEach((p) => next.add(p.id));
      return next;
    });
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ── CREATE ───────────────────────────────────────────────────
  const openCreate = () => {
    setCreateForm(BLANK_FORM(categories));
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!createForm) return;
    setCreating(true);
    try {
      const features = createForm.featuresText.split("\n").map((f) => f.trim()).filter(Boolean);
      await adminApi.createProduct({
        ...createForm, features,
        originalPrice: createForm.originalPrice || null,
        imageUrl: createForm.imageUrl || null,
        categoryId: Number(createForm.categoryId),
        reviewCount: Number(createForm.reviewCount),
      } as Parameters<typeof adminApi.createProduct>[0]);
      toast({ title: "Created", description: `${createForm.name} added to catalog.` });
      setCreateOpen(false);
      load();
    } catch (e: unknown) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Create failed", variant: "destructive" });
    } finally { setCreating(false); }
  };

  // ── EXPORT ──────────────────────────────────────────────────
  const handleExport = async () => {
    setExporting(true);
    try {
      const selectedInView = filtered.filter((p) => selectedIds.has(p.id)).map((p) => p.id);
      const ids = selectedInView.length > 0 ? selectedInView : filtered.map((p) => p.id);
      const catId = categoryFilter !== "all" && selectedInView.length === 0
        ? Number(categoryFilter) : undefined;

      const fullProducts = await adminApi.exportProducts(
        categoryFilter === "all" && selectedInView.length === 0 ? undefined : ids,
        catId,
      );

      const csv = productsToCsv(fullProducts);
      const date = new Date().toISOString().slice(0, 10);
      downloadCSV(`nexuskeys-products-${date}.csv`, csv);
      toast({ title: "Export complete", description: `${fullProducts.length} product${fullProducts.length !== 1 ? "s" : ""} exported.` });
    } catch (e: unknown) {
      toast({ title: "Export failed", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const exportButtonLabel = () => {
    const sel = [...selectedIds].filter((id) => filtered.some((p) => p.id === id));
    if (sel.length > 0) return `Export ${sel.length} selected`;
    if (categoryFilter !== "all") return `Export filtered (${filtered.length})`;
    return `Export all (${products.length})`;
  };

  // ── IMPORT ──────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      setImportRows(rows);
      setImportResult(null);
      setImportOpen(true);
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  const handleImport = async () => {
    if (!importRows.length) return;
    setImporting(true);
    try {
      const prods = csvRowsToProducts(importRows);
      const result = await adminApi.importProducts(prods);
      setImportResult(result);
      load();
    } catch (e: unknown) {
      toast({ title: "Import failed", description: e instanceof Error ? e.message : "Unknown error", variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const header = CSV_HEADERS.join(",");
    const example = [
      "","My Product","my-product","Publisher Inc","2024","windows","Microsoft",
      "49.99","69.99","EUR","Short description here","Full description here",
      "Feature 1|Feature 2|Feature 3","Email delivery within 24 hours","",
      "true","false","4.8","120",
    ].join(",");
    downloadCSV("nexuskeys-import-template.csv", "\uFEFF" + header + "\n" + example);
  };

  // ── EDIT MODAL ──────────────────────────────────────────────
  const openEdit = async (product: AdminProduct) => {
    setEditOpen(true); setEditLoading(true); setForm(null);
    try {
      const full = await adminApi.getProduct(product.id);
      setEditingProduct(full);
      setForm(buildFormState(full, categories));
    } catch {
      toast({ title: "Error", description: "Could not load product", variant: "destructive" });
      setEditOpen(false);
    } finally { setEditLoading(false); }
  };

  const handleSave = async () => {
    if (!editingProduct || !form) return;
    setSaving(true);
    try {
      const features = form.featuresText.split("\n").map((f) => f.trim()).filter(Boolean);
      await adminApi.updateProduct(editingProduct.id, {
        ...form, features,
        originalPrice: form.originalPrice || null,
        imageUrl: form.imageUrl || null,
        categoryId: Number(form.categoryId),
        reviewCount: Number(form.reviewCount),
      } as Parameters<typeof adminApi.updateProduct>[1]);
      toast({ title: "Saved", description: `${form.name} updated.` });
      setEditOpen(false);
      load();
    } catch (e: unknown) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Save failed", variant: "destructive" });
    } finally { setSaving(false); }
  };

  // ── DELETE ──────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.deleteProduct(deleteTarget.id);
      toast({ title: "Deleted", description: `${deleteTarget.name} removed from catalog.` });
      setDeleteTarget(null);
      load();
    } catch (e: unknown) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Delete failed", variant: "destructive" });
    } finally { setDeleting(false); }
  };

  const setF = (update: Partial<EditFormState>) => setForm((prev) => prev ? { ...prev, ...update } : prev);
  const f = form;
  const setCF = (update: Partial<EditFormState>) => setCreateForm((prev) => prev ? { ...prev, ...update } : prev);
  const cf = createForm;

  return (
    <AdminLayout>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Products</h1>
            <p className="text-slate-500 text-sm mt-0.5">{products.length} product{products.length !== 1 ? "s" : ""} in catalog</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-1.5" />
              Import CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting || loading}>
              <Download className={`w-4 h-4 mr-1.5 ${exporting ? "animate-spin" : ""}`} />
              {exporting ? "Exporting…" : exportButtonLabel()}
            </Button>
            <Button size="sm" onClick={openCreate} disabled={loading || categories.length === 0}>
              <Plus className="w-4 h-4 mr-1.5" />
              New Product
            </Button>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedIds(new Set()); }}
              className="w-full h-10 pl-9 pr-4 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setSelectedIds(new Set()); }}
            className="h-10 px-3 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
          {someSelected && (
            <div className="flex items-center gap-2 ml-auto bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5">
              <CheckSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {[...selectedIds].filter((id) => filtered.some((p) => p.id === id)).length} selected
              </span>
              <button onClick={() => setSelectedIds(new Set())} className="ml-1 text-primary/60 hover:text-primary">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <Package2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No products found.</p>
              {products.length === 0 && (
                <Button size="sm" className="mt-4" onClick={openCreate}>
                  <Plus className="w-4 h-4 mr-1.5" /> Add your first product
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-50">
                    <th className="px-4 py-3 w-10">
                      <button onClick={toggleAll} className="flex items-center text-slate-400 hover:text-primary transition-colors">
                        {allSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : someSelected ? <CheckSquare className="w-4 h-4 opacity-50" /> : <Square className="w-4 h-4" />}
                      </button>
                    </th>
                    <th className="text-left px-4 py-3">Product</th>
                    <th className="text-left px-4 py-3">Category</th>
                    <th className="text-left px-4 py-3">Platform</th>
                    <th className="text-right px-4 py-3">Price</th>
                    <th className="text-left px-4 py-3">Stock</th>
                    <th className="text-left px-4 py-3">Featured</th>
                    <th className="text-right px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((product) => {
                    const isChecked = selectedIds.has(product.id);
                    return (
                      <tr
                        key={product.id}
                        className={`transition-colors ${isChecked ? "bg-primary/5" : "hover:bg-slate-50"}`}
                      >
                        <td className="px-4 py-3">
                          <button onClick={() => toggleOne(product.id)} className="flex items-center text-slate-400 hover:text-primary transition-colors">
                            {isChecked ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-9 h-9 rounded-md object-contain bg-slate-50 border border-slate-100 shrink-0" />
                            ) : (
                              <div className="w-9 h-9 bg-slate-100 rounded-md flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                {product.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-slate-800 line-clamp-1">{product.name}</p>
                              <p className="text-xs text-slate-400">{product.publisher} · v{product.version}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs capitalize">{product.categoryName || "—"}</td>
                        <td className="px-4 py-3 text-slate-600 text-xs capitalize">{product.platform}</td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">
                          € {Number(product.price).toFixed(2)}
                          {product.originalPrice && (
                            <span className="block text-xs text-slate-400 line-through">€ {Number(product.originalPrice).toFixed(2)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3"><InStockBadge inStock={product.inStock} /></td>
                        <td className="px-4 py-3">
                          {product.isFeatured
                            ? <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">Featured</span>
                            : <span className="text-xs text-slate-300">—</span>}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button size="sm" variant="outline" onClick={() => openEdit(product)} className="h-8 text-xs">
                              <Pencil className="w-3 h-3 mr-1.5" />Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteTarget(product)}
                              className="h-8 text-xs text-red-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── CREATE MODAL ─────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={(o) => { if (!creating) setCreateOpen(o); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          {cf && <ProductForm f={cf} setF={setCF} categories={categories} />}
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !cf?.name || !cf?.slug} className="min-w-28">
              {creating ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Creating…</> : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── IMPORT MODAL ─────────────────────────────────────── */}
      <Dialog open={importOpen} onOpenChange={(o) => { if (!importing) setImportOpen(o); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Products from CSV</DialogTitle>
          </DialogHeader>

          {importResult ? (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-700">{importResult.created}</p>
                  <p className="text-xs text-green-600 font-medium">Created</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <RefreshCw className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-700">{importResult.updated}</p>
                  <p className="text-xs text-blue-600 font-medium">Updated</p>
                </div>
                <div className={`rounded-xl p-4 text-center border ${importResult.errors.length > 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-border"}`}>
                  <AlertCircle className={`w-6 h-6 mx-auto mb-1 ${importResult.errors.length > 0 ? "text-red-500" : "text-slate-400"}`} />
                  <p className={`text-2xl font-bold ${importResult.errors.length > 0 ? "text-red-600" : "text-slate-500"}`}>{importResult.errors.length}</p>
                  <p className={`text-xs font-medium ${importResult.errors.length > 0 ? "text-red-500" : "text-slate-400"}`}>Errors</p>
                </div>
              </div>
              {importResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-h-40 overflow-y-auto">
                  <p className="text-xs font-semibold text-red-700 mb-2">Error details:</p>
                  {importResult.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-600 font-mono">{err}</p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="py-2 space-y-4">
              <div className="flex items-center justify-between">
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
                  <p className="text-sm font-semibold text-blue-700">
                    {importRows.length} row{importRows.length !== 1 ? "s" : ""} found in CSV
                  </p>
                  <p className="text-xs text-blue-500 mt-0.5">Products will be created or updated (matched by slug)</p>
                </div>
                <button onClick={downloadTemplate} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Download className="w-3 h-3" />Download template
                </button>
              </div>
              {importRows.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Preview (first {Math.min(5, importRows.length)} rows)
                  </p>
                  <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-border">
                          {["name", "slug", "category", "platform", "price", "inStock", "isFeatured"].map((h) => (
                            <th key={h} className="text-left px-3 py-2 font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {importRows.slice(0, 5).map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            {["name", "slug", "category", "platform", "price", "inStock", "isFeatured"].map((h) => (
                              <td key={h} className="px-3 py-2 text-slate-700 max-w-32 truncate">{row[h] || "—"}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {importRows.length > 5 && (
                    <p className="text-xs text-slate-400 mt-1.5 text-center">
                      …and {importRows.length - 5} more row{importRows.length - 5 !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              )}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700 font-medium mb-1">CSV format notes:</p>
                <ul className="text-xs text-amber-600 space-y-0.5 list-disc list-inside">
                  <li>Use pipe <code className="bg-amber-100 px-1 rounded">|</code> to separate features</li>
                  <li>Existing products matched by <strong>slug</strong> will be updated</li>
                  <li>Platform: <code className="bg-amber-100 px-1 rounded">windows</code>, <code className="bg-amber-100 px-1 rounded">macos</code>, or <code className="bg-amber-100 px-1 rounded">cross-platform</code></li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {importResult ? (
              <Button onClick={() => setImportOpen(false)}>Close</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setImportOpen(false)} disabled={importing}>Cancel</Button>
                <Button onClick={handleImport} disabled={importing || importRows.length === 0} className="min-w-32">
                  {importing ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Importing…</> : `Import ${importRows.length} product${importRows.length !== 1 ? "s" : ""}`}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT MODAL ───────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editLoading || !f ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-3" />
              <p className="text-sm">Loading product data…</p>
            </div>
          ) : (
            <ProductForm f={f} setF={setF} categories={categories} />
          )}
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || editLoading || !f} className="min-w-24">
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE CONFIRM ───────────────────────────────────── */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!deleting && !o) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white min-w-24"
            >
              {deleting ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Deleting…</> : <><Trash2 className="w-4 h-4 mr-2" />Delete</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
