import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { spotPrices } from "@/lib/data";
import { ShoppingCart, Menu, ShieldCheck, ChevronRight, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "./ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const { itemCount } = useCart();
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Spot Price Ticker */}
      <div className="bg-gray-900 text-xs sm:text-sm text-gray-300 py-2 border-b border-gray-800">
        <div className="container mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap">
            <span className="font-mono"><span className="text-primary font-bold">GOLD</span> ${spotPrices.gold.toFixed(2)}</span>
            <span className="font-mono"><span className="text-gray-300 font-bold">SILVER</span> ${spotPrices.silver.toFixed(2)}</span>
            <span className="font-mono"><span className="text-gray-400 font-bold">PLATINUM</span> ${spotPrices.platinum.toFixed(2)}</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-primary" /> Fully insured shipping</span>
            <span className="text-gray-600">|</span>
            <span>Free shipping over $500</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-sm shadow-sm">
                  <span className="font-serif font-bold text-white text-lg">NP</span>
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-serif font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">NOVARI PARTNERS</span>
                  <span className="font-sans font-light text-xs text-muted-foreground uppercase tracking-widest">novaripartners.com</span>
                </div>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/catalog" className={`text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary ${location === '/catalog' ? 'text-primary' : 'text-muted-foreground'}`}>Catalog</Link>
              <Link href="/about" className={`text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary ${location === '/about' ? 'text-primary' : 'text-muted-foreground'}`}>About Us</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary/20 border border-primary/40 flex items-center justify-center rounded-sm">
                  <span className="font-serif font-bold text-primary text-sm">NP</span>
                </div>
                <span className="font-serif font-bold text-xl text-white">NOVARI PARTNERS LLC</span>
              </div>
              <p className="text-gray-400 text-sm max-w-md leading-relaxed mb-4">
                America's trusted destination for investment-grade silver bullion. 
                Providing sovereign mint coins, transparent pricing, and secure shipping.
              </p>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>30 N Gould St Ste R, Sheridan, WY 82801, United States</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>+1 (917) 764-4680</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>contact@novaripartnersllc.com</span>
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <div className="flex flex-col gap-1 border border-gray-700 p-3 rounded bg-gray-800">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Guaranteed</span>
                  <span className="font-serif text-white text-sm">100% Authentic</span>
                </div>
                <div className="flex flex-col gap-1 border border-gray-700 p-3 rounded bg-gray-800">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">IRA Eligible</span>
                  <span className="font-serif text-white text-sm">US Mint Coins</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-serif text-lg mb-4">Shop</h4>
              <ul className="space-y-3">
                <li><Link href="/catalog" className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center gap-2"><ChevronRight className="w-3 h-3"/> All Silver Eagles</Link></li>
                <li><Link href="/catalog" className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center gap-2"><ChevronRight className="w-3 h-3"/> 2025 Silver Eagle</Link></li>
                <li><Link href="/catalog" className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center gap-2"><ChevronRight className="w-3 h-3"/> 2026 Silver Eagle</Link></li>
                <li><Link href="/catalog" className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center gap-2"><ChevronRight className="w-3 h-3"/> View Cart</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-serif text-lg mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center gap-2"><ChevronRight className="w-3 h-3"/> About Us</Link></li>
                <li><a href="mailto:contact@novaripartnersllc.com" className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center gap-2"><ChevronRight className="w-3 h-3"/> Contact Us</a></li>
                <li><span className="text-gray-400 text-sm flex items-center gap-2"><ChevronRight className="w-3 h-3"/> novaripartners.com</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-xs text-gray-600">
            <p>&copy; {new Date().getFullYear()} NOVARI PARTNERS LLC. All rights reserved. 30 N Gould St Ste R, Sheridan, WY 82801. Prices subject to market volatility.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
