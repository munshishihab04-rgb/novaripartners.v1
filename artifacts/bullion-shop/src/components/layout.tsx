import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { spotPrices } from "@/lib/data";
import { ShoppingCart, Menu, ShieldCheck, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const { itemCount } = useCart();
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Top Spot Price Ticker */}
      <div className="bg-black text-xs sm:text-sm text-gray-300 py-2 border-b border-white/10">
        <div className="container mx-auto px-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap">
            <span className="font-mono"><span className="text-primary font-bold">GOLD</span> ${spotPrices.gold.toFixed(2)}</span>
            <span className="font-mono"><span className="text-gray-400 font-bold">SILVER</span> ${spotPrices.silver.toFixed(2)}</span>
            <span className="font-mono"><span className="text-gray-300 font-bold">PLATINUM</span> ${spotPrices.platinum.toFixed(2)}</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-primary" /> Fully insured shipping</span>
            <span className="text-gray-600">|</span>
            <span>Free shipping over $500</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer group">
                <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-sm">
                  <span className="font-serif font-bold text-black text-xl">GV</span>
                </div>
                <span className="font-serif font-bold text-2xl tracking-tight text-white group-hover:text-primary transition-colors">GoldVault <span className="font-sans font-light text-sm text-gray-400 uppercase tracking-widest ml-1">USA</span></span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/catalog" className={`text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary ${location === '/catalog' ? 'text-primary' : 'text-gray-300'}`}>Catalog</Link>
              <Link href="/about" className={`text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary ${location === '/about' ? 'text-primary' : 'text-gray-300'}`}>About Us</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative text-gray-300 hover:text-primary">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden text-gray-300">
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
      <footer className="bg-black border-t border-white/10 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary/20 border border-primary/50 flex items-center justify-center rounded-sm">
                  <span className="font-serif font-bold text-primary text-lg">GV</span>
                </div>
                <span className="font-serif font-bold text-xl text-white">GoldVault USA</span>
              </div>
              <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                America's premier destination for investment-grade precious metals. 
                Providing sovereign mint coins, premium bars, and secure vaulting services since 2005.
              </p>
              <div className="mt-8 flex gap-4">
                <div className="flex flex-col gap-1 border border-white/10 p-3 rounded bg-white/5">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Accredited</span>
                  <span className="font-serif text-white">BBB A+ Rating</span>
                </div>
                <div className="flex flex-col gap-1 border border-white/10 p-3 rounded bg-white/5">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Guaranteed</span>
                  <span className="font-serif text-white">100% Authentic</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-serif text-lg mb-4">Shop</h4>
              <ul className="space-y-3">
                <li><Link href="/catalog" className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center gap-2"><ChevronRight className="w-3 h-3"/> Gold</Link></li>
                <li><Link href="/catalog" className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center gap-2"><ChevronRight className="w-3 h-3"/> Silver</Link></li>
                <li><Link href="/catalog" className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center gap-2"><ChevronRight className="w-3 h-3"/> Platinum</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-serif text-lg mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center gap-2"><ChevronRight className="w-3 h-3"/> About Us</Link></li>
                <li><span className="text-gray-400 text-sm flex items-center gap-2"><ChevronRight className="w-3 h-3"/> Contact: 1-800-GOLD-USA</span></li>
                <li><span className="text-gray-400 text-sm flex items-center gap-2"><ChevronRight className="w-3 h-3"/> Email: vault@goldvaultusa.com</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-xs text-gray-600">
            <p>&copy; {new Date().getFullYear()} GoldVault USA. All rights reserved. Prices subject to market volatility.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
