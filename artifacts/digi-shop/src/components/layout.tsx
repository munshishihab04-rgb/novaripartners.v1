import { Link } from "wouter";
import { ShoppingCart, Package, Search, Menu, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetCart } from "@workspace/api-client-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: cart } = useGetCart();
  const cartItemCount = cart?.items?.length || 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans dark">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <Package className="w-5 h-5" />
              </div>
              <span className="font-bold tracking-tight text-lg">NexusKeys</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <Link href="/catalog" className="hover:text-foreground transition-colors">Catalog</Link>
              <Link href="/catalog?platform=windows" className="hover:text-foreground transition-colors">Windows</Link>
              <Link href="/catalog?platform=macos" className="hover:text-foreground transition-colors">macOS</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center relative group">
              <Search className="w-4 h-4 absolute left-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search software..." 
                className="h-9 w-[200px] lg:w-[300px] rounded-md border border-input bg-muted/50 px-9 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background"
              />
            </div>
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/40 bg-card/50 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground p-1 rounded-md">
                  <Package className="w-4 h-4" />
                </div>
                <span className="font-bold tracking-tight">NexusKeys</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional software licenses for developers, designers, and engineers. Instant delivery, guaranteed authentic.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Catalog</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/catalog" className="hover:text-primary transition-colors">All Products</Link></li>
                <li><Link href="/catalog?platform=windows" className="hover:text-primary transition-colors">Windows Software</Link></li>
                <li><Link href="/catalog?platform=macos" className="hover:text-primary transition-colors">macOS Software</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">License Activation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Trust & Security</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Verified Authentic Keys</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Secure 256-bit Encryption</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Instant Email Delivery</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border/40 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} NexusKeys. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Refund Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}