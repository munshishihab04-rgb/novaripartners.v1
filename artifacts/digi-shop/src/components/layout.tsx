import { Link } from "wouter";
import { ShoppingCart, Package, Search, Menu, ShieldCheck, Mail, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetCart } from "@workspace/api-client-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: cart } = useGetCart();
  const cartItemCount = cart?.items?.length || 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <div className="bg-muted/30 border-b border-border text-xs py-1.5 px-4 flex justify-between items-center text-muted-foreground">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex gap-4">
            <span className="hidden sm:inline-flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secure Checkout</span>
            <span className="hidden sm:inline-flex items-center gap-1"><Package className="w-3 h-3" /> Instant Digital Delivery</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground transition-colors flex items-center gap-1"><HelpCircle className="w-3 h-3" /> Support</a>
            <a href="#" className="hover:text-foreground transition-colors flex items-center gap-1"><Mail className="w-3 h-3" /> Contact</a>
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm group-hover:shadow-md transition-all">
                <Package className="w-5 h-5" />
              </div>
              <span className="font-bold tracking-tight text-xl text-foreground">NexusKeys</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/catalog" className="text-muted-foreground hover:text-primary transition-colors">Catalog</Link>
              <Link href="/catalog?platform=windows" className="text-muted-foreground hover:text-primary transition-colors">Windows</Link>
              <Link href="/catalog?platform=macos" className="text-muted-foreground hover:text-primary transition-colors">macOS</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center relative group">
              <Search className="w-4 h-4 absolute left-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search software..." 
                className="h-10 w-[200px] lg:w-[300px] rounded-full border border-input bg-muted/50 px-10 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background shadow-sm"
              />
            </div>
            <Link href="/cart">
              <Button variant="outline" size="icon" className="relative rounded-full bg-card hover:bg-muted shadow-sm border-border">
                <ShoppingCart className="w-5 h-5 text-foreground" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
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

      <main className="flex-1 bg-muted/10">
        {children}
      </main>

      <footer className="border-t border-border bg-white mt-16">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
                  <Package className="w-5 h-5" />
                </div>
                <span className="font-bold tracking-tight text-xl">NexusKeys</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Professional software licenses for developers, designers, and engineers. Instant delivery, guaranteed authentic.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Catalog</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link href="/catalog" className="hover:text-primary transition-colors">All Products</Link></li>
                <li><Link href="/catalog?platform=windows" className="hover:text-primary transition-colors">Windows Software</Link></li>
                <li><Link href="/catalog?platform=macos" className="hover:text-primary transition-colors">macOS Software</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Support</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">License Activation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Trust & Security</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="bg-primary/10 p-1.5 rounded-md text-primary">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>Verified Authentic Keys</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="bg-primary/10 p-1.5 rounded-md text-primary">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>Secure 256-bit Encryption</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="bg-primary/10 p-1.5 rounded-md text-primary">
                    <Package className="w-4 h-4" />
                  </div>
                  <span>Instant Email Delivery</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} NexusKeys. All rights reserved.</p>
            <div className="flex gap-6">
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