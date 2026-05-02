import { Layout } from "@/components/layout";
import { products } from "@/lib/data";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldCheck, TrendingUp, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const featured = products.filter(p => p.featured).slice(0, 4);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black py-24 sm:py-32 lg:pb-40 border-b border-white/10">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1618044733300-9472054094ee?auto=format&fit=crop&q=80&w=2000" 
            alt="Gold Vault Background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              <Lock className="w-3 h-3" /> Securing American Wealth
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif text-white leading-[1.1] mb-6">
              Preserve Your Legacy in <span className="text-primary italic">Gold & Silver</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-10 leading-relaxed font-light max-w-xl">
              Acquire investment-grade precious metals from America's most trusted private bullion dealer. Fully insured, discreetly shipped directly to your door.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/catalog">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-primary hover:bg-primary/90 text-black font-bold">
                  View Catalog
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-8 border-white/20 text-white hover:bg-white/5">
                  Our Vault Story
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="border-b border-white/10 bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: "100% Authentic Guarantee", desc: "Every item is rigorously tested and certified for purity." },
              { icon: Lock, title: "Secure & Insured Delivery", desc: "Discreet packaging. Fully insured until signed for." },
              { icon: TrendingUp, title: "Live Market Pricing", desc: "Prices algorithmically updated to global spot markets." }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 bg-background rounded-lg border border-white/5">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-serif text-white mb-2">Vault Recommendations</h2>
              <p className="text-gray-400">Our most requested sovereign coins and premium bars.</p>
            </div>
            <Link href="/catalog" className="hidden sm:flex items-center gap-2 text-primary hover:text-white transition-colors">
              View all products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product, i) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group border border-white/10 bg-card rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
              >
                <Link href={`/products/${product.id}`}>
                  <div className="aspect-square bg-white p-8 relative overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-xs text-primary font-bold uppercase tracking-wider mb-2">{product.metal} • {product.type}</div>
                    <h3 className="font-serif text-lg text-white mb-4 line-clamp-2 h-14 group-hover:text-primary transition-colors">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-mono text-white">${product.price.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-10 sm:hidden">
            <Link href="/catalog">
              <Button className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white">
                View all products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
