import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/admin-layout";
import { adminApi, type AdminProduct, type AdminProductFull, type AdminCategory, getAdminPassword } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RefreshCw, Pencil, Search, Package2 } from "lucide-react";

const PLATFORMS = ["windows", "macos", "cross-platform"] as const;

function InStockBadge({ inStock }: { inStock: boolean }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
      {inStock ? "In Stock" : "Out of Stock"}
    </span>
  );
}

interface EditFormState {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  publisher: string;
  version: string;
  platform: string;
  categoryId: number;
  price: string;
  originalPrice: string;
  currency: string;
  imageUrl: string;
  deliveryMethod: string;
  featuresText: string;
  inStock: boolean;
  isFeatured: boolean;
  rating: string;
  reviewCount: number;
}

function buildFormState(p: AdminProductFull, categories: AdminCategory[]): EditFormState {
  return {
    name: p.name,
    slug: p.slug,
    shortDescription: p.shortDescription,
    description: p.description,
    publisher: p.publisher,
    version: p.version,
    platform: p.platform,
    categoryId: p.categoryId || (categories[0]?.id ?? 1),
    price: p.price,
    originalPrice: p.originalPrice || "",
    currency: p.currency || "EUR",
    imageUrl: p.imageUrl || "",
    deliveryMethod: p.deliveryMethod,
    featuresText: (p.features || []).join("\n"),
    inStock: p.inStock,
    isFeatured: p.isFeatured,
    rating: p.rating || "5.0",
    reviewCount: p.reviewCount || 0,
  };
}

export function AdminProducts() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editingProduct, setEditingProduct] = useState<AdminProductFull | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditFormState | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([adminApi.getProducts(), adminApi.getCategories()])
      .then(([prods, cats]) => { setProducts(prods); setCategories(cats); })
      .catch(() => toast({ title: "Error", description: "Could not load products", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!getAdminPassword()) { navigate("/admin/login"); return; }
    load();
  }, []);

  const openEdit = async (product: AdminProduct) => {
    setEditOpen(true);
    setEditLoading(true);
    setForm(null);
    try {
      const full = await adminApi.getProduct(product.id);
      setEditingProduct(full);
      setForm(buildFormState(full, categories));
    } catch {
      toast({ title: "Error", description: "Could not load product", variant: "destructive" });
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingProduct || !form) return;
    setSaving(true);
    try {
      const features = form.featuresText.split("\n").map((f) => f.trim()).filter(Boolean);
      await adminApi.updateProduct(editingProduct.id, {
        ...form,
        features,
        originalPrice: form.originalPrice || null,
        imageUrl: form.imageUrl || null,
        categoryId: Number(form.categoryId),
        reviewCount: Number(form.reviewCount),
      } as Parameters<typeof adminApi.updateProduct>[1]);
      toast({ title: "Saved", description: `${form.name} has been updated.` });
      setEditOpen(false);
      load();
    } catch (e: unknown) {
      toast({ title: "Error", description: e instanceof Error ? e.message : "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.categoryName || "").toLowerCase().includes(search.toLowerCase())
  );

  const f = form;
  const setF = (update: Partial<EditFormState>) => setForm((prev) => prev ? { ...prev, ...update } : prev);

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Products</h1>
            <p className="text-slate-500 text-sm mt-0.5">{products.length} product{products.length !== 1 ? "s" : ""} in catalog</p>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="relative mb-5 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
          />
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <Package2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No products found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-50">
                    <th className="text-left px-6 py-3">Product</th>
                    <th className="text-left px-4 py-3">Category</th>
                    <th className="text-left px-4 py-3">Platform</th>
                    <th className="text-right px-4 py-3">Price</th>
                    <th className="text-left px-4 py-3">Stock</th>
                    <th className="text-left px-4 py-3">Featured</th>
                    <th className="text-right px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-100 rounded-md flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {product.name.charAt(0)}
                          </div>
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
                        {product.isFeatured ? (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">Featured</span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Button size="sm" variant="outline" onClick={() => openEdit(product)} className="h-8 text-xs">
                          <Pencil className="w-3 h-3 mr-1.5" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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
            <div className="space-y-5 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Product Name</label>
                  <input className="w-full h-10 px-3 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" value={f.name} onChange={(e) => setF({ name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Slug</label>
                  <input className="w-full h-10 px-3 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" value={f.slug} onChange={(e) => setF({ slug: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Publisher</label>
                  <input className="w-full h-10 px-3 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" value={f.publisher} onChange={(e) => setF({ publisher: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Version</label>
                  <input className="w-full h-10 px-3 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" value={f.version} onChange={(e) => setF({ version: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Platform</label>
                  <select className="w-full h-10 px-3 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background" value={f.platform} onChange={(e) => setF({ platform: e.target.value })}>
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Category</label>
                  <select className="w-full h-10 px-3 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background" value={f.categoryId} onChange={(e) => setF({ categoryId: Number(e.target.value) })}>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Price (EUR)</label>
                  <input type="number" step="0.01" min="0" className="w-full h-10 px-3 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" value={f.price} onChange={(e) => setF({ price: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Original Price (EUR, optional)</label>
                  <input type="number" step="0.01" min="0" placeholder="Leave empty for no discount" className="w-full h-10 px-3 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" value={f.originalPrice} onChange={(e) => setF({ originalPrice: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Short Description</label>
                <textarea rows={2} className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" value={f.shortDescription} onChange={(e) => setF({ shortDescription: e.target.value })} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Full Description</label>
                <textarea rows={4} className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y" value={f.description} onChange={(e) => setF({ description: e.target.value })} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Features (one per line)</label>
                <textarea rows={4} className="w-full px-3 py-2 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono resize-y" value={f.featuresText} onChange={(e) => setF({ featuresText: e.target.value })} placeholder={"Lifetime license\nAll future updates included\n..."}/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Delivery Method</label>
                  <input className="w-full h-10 px-3 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" value={f.deliveryMethod} onChange={(e) => setF({ deliveryMethod: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Image URL</label>
                  <input className="w-full h-10 px-3 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" value={f.imageUrl} onChange={(e) => setF({ imageUrl: e.target.value })} placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Rating (0–5)</label>
                  <input type="number" step="0.1" min="0" max="5" className="w-full h-10 px-3 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" value={f.rating} onChange={(e) => setF({ rating: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Review Count</label>
                  <input type="number" min="0" className="w-full h-10 px-3 text-sm border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" value={f.reviewCount} onChange={(e) => setF({ reviewCount: Number(e.target.value) })} />
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
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || editLoading || !f} className="min-w-24">
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
