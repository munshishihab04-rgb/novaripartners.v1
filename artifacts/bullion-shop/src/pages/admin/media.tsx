import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/admin-layout";
import { adminApi, type AdminMedia, isAdminAuthenticated } from "@/lib/admin-api";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Copy, CheckCircle, Search, RefreshCw, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={e => {
        e.stopPropagation();
        navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
      }}
      title="Copy URL"
      className="p-1.5 rounded hover:bg-slate-100 transition-colors text-slate-400 hover:text-primary"
    >
      {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

export default function AdminMediaPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [media, setMedia] = useState<AdminMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    adminApi.getMedia()
      .then(setMedia)
      .catch(() => toast({ title: "Error", description: "Could not load media", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAdminAuthenticated()) { navigate("/admin/login"); return; }
    load();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    e.target.value = "";

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ title: "Invalid type", description: `${file.name}: only jpg, png, webp, gif allowed`, variant: "destructive" });
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast({ title: "Too large", description: `${file.name}: max 5 MB`, variant: "destructive" });
        continue;
      }
      setUploading(true);
      try {
        const result = await adminApi.uploadMedia(file);
        setMedia(prev => [result, ...prev]);
        toast({ title: "Uploaded", description: file.name });
      } catch (err: any) {
        toast({ title: "Upload failed", description: err.message || "Unknown error", variant: "destructive" });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDelete = async (item: AdminMedia) => {
    if (!confirm(`Delete "${item.original_name}"? This cannot be undone.`)) return;
    setDeletingId(item.id);
    try {
      await adminApi.deleteMedia(item.id);
      setMedia(prev => prev.filter(m => m.id !== item.id));
      toast({ title: "Deleted", description: item.original_name });
    } catch (err: any) {
      toast({ title: "Cannot delete", description: err.message || "Delete failed", variant: "destructive" });
    } finally {
      setDeletingId(null); }
  };

  const filtered = search
    ? media.filter(m => m.original_name.toLowerCase().includes(search.toLowerCase()) || m.filename.includes(search))
    : media;

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Media Library</h1>
            <p className="text-slate-500 text-sm mt-0.5">{media.length} image{media.length !== 1 ? "s" : ""} uploaded</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Uploading…" : "Upload Image"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Upload zone */}
        <div
          className="border-2 border-dashed border-slate-200 rounded-xl p-8 mb-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            if (fileInputRef.current) {
              // Synthetic change
              const dt = new DataTransfer();
              files.forEach(f => dt.items.add(f));
              fileInputRef.current.files = dt.files;
              fileInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
            }
          }}
        >
          <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 font-medium">Click or drag & drop images here</p>
          <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP, GIF — max 5 MB each</p>
        </div>

        {/* Search */}
        {media.length > 0 && (
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by filename…"
              className="w-full pl-9 pr-4 h-10 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-square bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <ImageOff className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">{search ? "No results" : "No media uploaded yet"}</p>
            {!search && <p className="text-sm text-slate-400 mt-1">Upload your first image to get started.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(item => (
              <div key={item.id} className="group relative bg-white border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Thumbnail */}
                <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.original_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>

                {/* Info */}
                <div className="p-2">
                  <p className="text-xs font-medium text-slate-700 truncate" title={item.original_name}>
                    {item.original_name}
                  </p>
                  <p className="text-xs text-slate-400">{fmtSize(item.size_bytes)}</p>
                  <p className="text-xs text-slate-400">{new Date(item.created_at).toLocaleDateString("it-IT")}</p>
                </div>

                {/* Actions overlay */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CopyUrlButton url={item.url} />
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(item); }}
                    disabled={deletingId === item.id}
                    title="Delete"
                    className="p-1.5 rounded bg-white/90 hover:bg-red-50 transition-colors text-slate-400 hover:text-red-500 disabled:opacity-40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
