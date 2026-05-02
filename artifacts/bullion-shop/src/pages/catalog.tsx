import { Layout } from "@/components/layout";
import { products } from "@/lib/data";
import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Catalog() {
  const [metalFilter, setMetalFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");

  const filtered = products.filter(p => {
    if (metalFilter !== "All" && p.metal !== metalFilter) return false;
    if (typeFilter !== "All" && p.type !== typeFilter) return false;
    return true;
  });

  return (
    <Layout>
      <div className="bg-black py-16 border-b border-white/10">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-serif text-white mb-4">The Catalog</h1>
          <p className="text-gray-400 max-w-2xl">Browse our complete inventory of investment-grade precious metals. Prices are fixed to the global spot market and updated in real-time.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="sticky top-24 bg-card border border-white/10 rounded-lg p-6">
              <h3 className="text-white font-serif text-lg mb-4">Filters</h3>
              
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Metal Type</h4>
                <div className="space-y-2">
                  {["All", "Gold", "Silver", "Platinum"].map(metal => (
                    <label key={metal} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="metal" 
                        checked={metalFilter === metal}
                        onChange={() => setMetalFilter(metal)}
                        className="text-primary bg-background border-white/20 focus:ring-primary focus:ring-offset-background cursor-pointer"
                      />
                      <span className={`text-sm group-hover:text-white transition-colors ${metalFilter === metal ? 'text-white' : 'text-gray-400'}`}>{metal}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Product Type</h4>
                <div className="space-y-2">
                  {["All", "Coins", "Bars"].map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="type" 
                        checked={typeFilter === type}
                        onChange={() => setTypeFilter(type)}
                        className="text-primary bg-background border-white/20 focus:ring-primary focus:ring-offset-background cursor-pointer"
                      />
                      <span className={`text-sm group-hover:text-white transition-colors ${typeFilter === type ? 'text-white' : 'text-gray-400'}`}>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-6 text-sm text-gray-400">
              Showing <span className="text-white font-medium">{filtered.length}</span> products
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-24 bg-card border border-white/10 rounded-lg">
                <h3 className="text-white font-serif text-xl mb-2">No products found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your filters.</p>
                <Button 
                  variant="outline" 
                  onClick={() => { setMetalFilter("All"); setTypeFilter("All"); }}
                  className="border-white/20 text-white"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((product, i) => (
                  <motion.div 
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group border border-white/10 bg-card rounded-lg overflow-hidden hover:border-primary/50 transition-colors flex flex-col"
                  >
                    <Link href={`/products/${product.id}`} className="flex flex-col h-full">
                      <div className="aspect-square bg-white p-6 relative overflow-hidden flex-shrink-0">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="text-xs text-primary font-bold uppercase tracking-wider mb-2">{product.metal} • {product.weight}</div>
                        <h3 className="font-serif text-lg text-white mb-4 group-hover:text-primary transition-colors flex-1">{product.name}</h3>
                        <div className="mt-auto">
                          <div className="text-xl font-mono text-white mb-4">${product.price.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                          <Button className="w-full bg-white/5 border border-white/10 hover:bg-primary hover:text-black hover:border-primary text-white transition-all">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
