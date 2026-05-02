import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { useGetFeaturedProducts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, ShieldCheck, Zap, Key } from "lucide-react";
import { motion } from "framer-motion";

export function Home() {
  const { data: featuredProducts, isLoading } = useGetFeaturedProducts();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden py-24 md:py-32 border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-foreground leading-[1.1]">
                Premium Software.<br />
                <span className="text-primary">Instant Delivery.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Secure, authentic licenses for industry-standard tools. Instant delivery to your inbox. No subscriptions, just lifetime keys for the software you trust.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/catalog">
                  <Button size="lg" className="h-14 px-8 font-semibold w-full sm:w-auto text-base rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                    Browse Catalog
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/catalog?platform=windows">
                  <Button variant="outline" size="lg" className="h-14 px-8 font-semibold w-full sm:w-auto text-base rounded-full bg-white hover:bg-muted/50 border-border shadow-sm">
                    View Windows Software
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="bg-muted/20 py-16 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-border shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Instant Delivery</h3>
              <p className="text-muted-foreground leading-relaxed">Keys are emailed instantly upon payment confirmation. Start working immediately.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-border shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Secure Payment</h3>
              <p className="text-muted-foreground leading-relaxed">256-bit encrypted transactions. Your financial data is never stored on our servers.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-border shadow-sm flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                <Key className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Authentic Licenses</h3>
              <p className="text-muted-foreground leading-relaxed">100% genuine retail and volume licenses from authorized distributors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3 text-foreground">Featured Software</h2>
              <p className="text-muted-foreground text-lg">Industry standards for professionals.</p>
            </div>
            <Link href="/catalog" className="hidden sm:flex items-center text-sm font-semibold text-primary hover:underline">
              View all products
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[420px] rounded-xl bg-muted/30 border border-border animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          )}
          
          <div className="mt-10 text-center sm:hidden">
            <Link href="/catalog">
              <Button variant="outline" className="w-full h-12 rounded-full font-medium">
                View all products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}