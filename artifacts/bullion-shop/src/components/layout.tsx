import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { spotPrices } from "@/lib/data";
import { ShoppingCart, ShieldCheck, ChevronRight, Phone, Mail, MapPin, Menu, X } from "lucide-react";
import { Button } from "./ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const { itemCount } = useCart();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/catalog", label: "Catalog" },
    { href: "/about", label: "About Us" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Spot Price Ticker */}
      <div className="bg-gray-900 text-xs sm:text-sm text-gray-300 py-2 border-b border-gray-800">
        <div className="container mx-auto px-4 flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap">
            <span className="font-mono"><span className="text-primary font-bold">GOLD</span> ${spotPrices.gold.toFixed(2)}</span>
            <span className="font-mono"><span className="text-gray-300 font-bold">SILVER</span> ${spotPrices.silver.toFixed(2)}</span>
            <span className="font-mono"><span className="text-gray-400 font-bold">PLATINUM</span> ${spotPrices.platinum.toFixed(2)}</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-primary" /> Fully insured shipping</span>
            <span className="text-gray-600">|</span>
            <span>Free shipping over $500</span>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-18 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary flex items-center justify-center rounded-sm shadow-sm flex-shrink-0">
                <span className="font-serif font-bold text-white text-base sm:text-lg">NP</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-serif font-bold text-lg sm:text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">NOVARI PARTNERS</span>
                <span className="hidden sm:block font-sans font-light text-xs text-muted-foreground uppercase tracking-widest">novaripartners.com</span>
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className={`text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary ${location === l.href ? "text-primary" : "text-muted-foreground"}`}>{l.label}</Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-card shadow-lg">
            <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 py-3 px-2 rounded-lg text-sm font-medium uppercase tracking-wide transition-colors ${location === l.href ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-primary hover:bg-gray-50"}`}
                >
                  <ChevronRight className="w-4 h-4" /> {l.label}
                </Link>
              ))}
              <div className="border-t border-border mt-2 pt-2">
                <p className="text-xs text-muted-foreground px-2 py-1 uppercase tracking-wider font-medium">Legal</p>
                {[
                  { href: "/terms", label: "Terms & Conditions" },
                  { href: "/privacy", label: "Privacy Policy" },
                  { href: "/shipping", label: "Shipping Policy" },
                  { href: "/returns", label: "Returns & Refunds" },
                ].map(l => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 py-2.5 px-2 rounded-lg text-xs text-muted-foreground hover:text-primary hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" /> {l.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 pt-14 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Brand col */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 bg-primary/20 border border-primary/40 flex items-center justify-center rounded-sm">
                  <span className="font-serif font-bold text-primary text-sm">NP</span>
                </div>
                <span className="font-serif font-bold text-lg text-white">NOVARI PARTNERS LLC</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                America's trusted destination for investment-grade silver bullion. Sovereign mint coins, transparent pricing, secure insured shipping.
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>30 N Gould St Ste R, Sheridan, WY 82801</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  <a href="tel:+19177644680" className="hover:text-primary transition-colors">+1 (917) 764-4680</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                  <a href="mailto:contact@novaripartnersllc.com" className="hover:text-primary transition-colors">contact@novaripartnersllc.com</a>
                </div>
              </div>
            </div>

            {/* Shop */}
            <div>
              <h4 className="text-white font-serif text-base mb-4">Shop</h4>
              <ul className="space-y-2.5">
                {[
                  { href: "/catalog", label: "All Silver Eagles" },
                  { href: "/catalog?year=2025", label: "2025 Silver Eagle" },
                  { href: "/catalog?year=2026", label: "2026 Silver Eagle" },
                  { href: "/cart", label: "View Cart" },
                ].map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center gap-2">
                      <ChevronRight className="w-3 h-3" /> {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-serif text-base mb-4">Company</h4>
              <ul className="space-y-2.5">
                {[
                  { href: "/about", label: "About Us" },
                ].map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center gap-2">
                      <ChevronRight className="w-3 h-3" /> {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a href="mailto:contact@novaripartnersllc.com" className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center gap-2">
                    <ChevronRight className="w-3 h-3" /> Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-serif text-base mb-4">Legal</h4>
              <ul className="space-y-2.5">
                {[
                  { href: "/terms", label: "Terms & Conditions" },
                  { href: "/privacy", label: "Privacy Policy" },
                  { href: "/shipping", label: "Shipping Policy" },
                  { href: "/returns", label: "Returns & Refunds" },
                ].map(l => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center gap-2">
                      <ChevronRight className="w-3 h-3" /> {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-600">
              <p>&copy; {new Date().getFullYear()} NOVARI PARTNERS LLC. All rights reserved. Prices subject to market volatility.</p>
              <div className="flex items-center gap-3">
                <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
                <span>·</span>
                <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link>
                <span>·</span>
                <Link href="/shipping" className="hover:text-gray-400 transition-colors">Shipping</Link>
                <span>·</span>
                <Link href="/returns" className="hover:text-gray-400 transition-colors">Returns</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
