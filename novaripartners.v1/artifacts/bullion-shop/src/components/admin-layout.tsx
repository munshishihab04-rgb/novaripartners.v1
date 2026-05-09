import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, ShoppingBag, LogOut, ExternalLink, Store, Users, Tag } from "lucide-react";
import { clearAdminSession } from "@/lib/admin-api";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, exact: false },
  { href: "/admin/products", label: "Products", icon: Package, exact: false },
  { href: "/admin/discounts", label: "Volume Discounts", icon: Tag, exact: false },
  { href: "/admin/visitors", label: "Live Visitors", icon: Users, exact: false },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const handleLogout = () => {
    clearAdminSession();
    window.location.href = "/admin/login";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-60 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-slate-700">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Admin Panel</p>
          <h1 className="font-bold text-lg text-white">US Bullion Store</h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? location === href : location.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-amber-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                {label === "Live Visitors" && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700 space-y-0.5">
          <a
            href="/"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Store className="w-4 h-4 shrink-0" />
            View Store
            <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-900/40 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
