import { Layout } from "@/components/layout";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type Product = {
  id: number;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  year: number | null;
  inStock: boolean;
  isFeatured: boolean;
};

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [yearFilter, setYearFilter] = useState<number | "All">("All");

  useEffect(() => {
    document.title = "American Silver Eagle Coins 2020–2026 | NovariPartners.com";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Browse all 2020–2026 American Silver Eagle BU coins. .999 fine silver, 1 troy oz, fully insured shipping. Buy at NovariPartners LLC.');
  }, []);

  useEffect(() => {
    fetch("/api/products?limit=100&offset=0")
      .then(async (res) => {
        if (!res.ok) throw new Error("Server error");
        const data = await res.json() as { products: Product[] };
        setProducts(data.products);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const years = Array.from(new Set(products.map(p => p.year).filter((y): y is number => y != null))).sort((a, b) => a - b);

  const filtered = products.filter(p => {
    if (yearFilter !== "All" && p.year !== yearFilter) return false;
    return true;
  });

  return (
    <Layout>
      <div className="bg-gray-900 py-16 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">US Mint Bullion</p>
          <h1 className="text-4xl font-serif text-white mb-4">American Silver Eagles — BU Collection</h1>
          <p className="text-gray-400 max-w-2xl">Brilliant Uncirculated .999 fine silver coins from every year, 2020 through 2026. Each coin contains exactly one troy ounce of fine silver and carries a $1 face value guaranteed by the United States government.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full md:w-56 flex-shrink-0">
            <div className="sticky top-24 bg-card border border-border rounded-lg p-6 shadow-sm">
              <h3 className="text-foreground font-serif text-lg mb-4">Filter by Year</h3>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="year"
                    checked={yearFilter === "All"}
                    onChange={() => setYearFilter("All")}
                    className="text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className={`text-sm group-hover:text-foreground transition-colors ${yearFilter === "All" ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>All Years</span>
                </label>
                {years.map(year => (
                  <label key={year} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="year"
                      checked={yearFilter === year}
                      onChange={() => setYearFilter(year)}
                      className="text-primary focus:ring-primary cursor-pointer"
                    />
                    <span className={`text-sm group-hover:text-foreground transition-colors ${yearFilter === year ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{year}</span>
                  </label>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><span className="font-medium text-foreground">Metal:</span> .999 Fine Silver</p>
                  <p><span className="font-medium text-foreground">Weight:</span> 1 Troy Oz</p>
                  <p><span className="font-medium text-foreground">Mint:</span> US Mint</p>
                  <p><span className="font-medium text-foreground">Grade:</span> BU (Brilliant Uncirculated)</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="border border-border rounded-lg overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-100" />
                    <div className="p-6 space-y-3">
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="h-5 bg-gray-100 rounded w-3/4" />
                      <div className="h-8 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-24 bg-card border border-border rounded-lg">
                <h3 className="text-foreground font-serif text-xl mb-2">Could not load products</h3>
                <p className="text-muted-foreground mb-6">Please try refreshing the page.</p>
                <Button variant="outline" onClick={() => window.location.reload()}>Refresh</Button>
              </div>
            ) : (
              <>
                <div className="mb-6 text-sm text-muted-foreground">
                  Showing <span className="text-foreground font-medium">{filtered.length}</span> coins
                </div>

                {filtered.length === 0 ? (
                  <div className="text-center py-24 bg-card border border-border rounded-lg">
                    <h3 className="text-foreground font-serif text-xl mb-2">No coins found</h3>
                    <p className="text-muted-foreground mb-6">Try adjusting your filter.</p>
                    <Button variant="outline" onClick={() => setYearFilter("All")}>Show All Years</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((product, i) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group border border-border bg-card rounded-lg overflow-hidden hover:border-primary/60 hover:shadow-md transition-all flex flex-col"
                      >
                        <Link href={`/products/${product.slug}`} className="flex flex-col h-full">
                          <div className="aspect-square bg-gray-50 p-6 relative overflow-hidden flex-shrink-0">
                            <img
                              src={product.imageUrl || "/bullion-shop/silver-coin.png"}
                              alt={product.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                            />
                            {product.year && (
                              <div className="absolute top-3 right-3 bg-primary text-white text-sm font-bold px-3 py-1 rounded shadow">
                                {product.year}
                              </div>
                            )}
                            {!product.inStock && (
                              <div className="absolute bottom-3 left-3 bg-gray-800/80 text-white text-xs font-bold px-2 py-1 rounded">
                                Out of Stock
                              </div>
                            )}
                          </div>
                          <div className="p-6 flex-1 flex flex-col">
                            <div className="text-xs text-primary font-bold uppercase tracking-wider mb-2">Silver • 1 Troy Oz • .999 Fine</div>
                            <h3 className="font-serif text-base text-foreground mb-4 group-hover:text-primary transition-colors flex-1">{product.name}</h3>
                            <div className="mt-auto">
                              <div className="text-xl font-mono text-foreground font-semibold mb-4">${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                              <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
