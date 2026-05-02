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
      <section className="relative border-b border-border/40 bg-gradient-to-b from-background to-card overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Professional Software.<br />
                <span className="text-primary">Precision Delivery.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Secure, authentic licenses for industry-standard tools. Instant delivery to your inbox. No subscriptions, just lifetime keys for the software you trust.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/catalog">
                  <Button size="lg" className="h-12 px-8 font-semibold w-full sm:w-auto">
                    Browse Catalog
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/catalog?platform=windows">
                  <Button variant="outline" size="lg" className="h-12 px-8 font-semibold w-full sm:w-auto">
                    View Windows Software
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="border-b border-border/40 bg-card/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold">Instant Delivery</h3>
              <p className="text-sm text-muted-foreground">Keys are emailed instantly upon payment confirmation. Start working immediately.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold">Secure Payment</h3>
              <p className="text-sm text-muted-foreground">256-bit encrypted transactions. Your financial data is never stored on our servers.</p>
            </div>

            <div className="flex flex-col items-center text-center p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Key className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold">Authentic Licenses</h3>
              <p className="text-sm text-muted-foreground">100% genuine retail and volume licenses from authorized distributors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Featured Software</h2>
              <p className="text-muted-foreground">Industry standards for professionals.</p>
            </div>
            <Link href="/catalog" className="hidden sm:flex items-center text-sm font-medium text-primary hover:underline">
              View all products
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[400px] rounded-xl bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          )}
          
          <div className="mt-8 text-center sm:hidden">
            <Link href="/catalog">
              <Button variant="outline" className="w-full">
                View all products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}