import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { useListProducts, useListCategories, ListProductsPlatform } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export function Catalog() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const rawPlatform = searchParams.get("platform");
  const initialPlatform = (rawPlatform === "windows" || rawPlatform === "macos" || rawPlatform === "cross-platform") ? rawPlatform as ListProductsPlatform : undefined;
  
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<number | undefined>();
  const [selectedPlatform, setSelectedPlatform] = React.useState<ListProductsPlatform | undefined>(initialPlatform);

  const { data: categories } = useListCategories();
  const { data: productData, isLoading } = useListProducts({
    search: search || undefined,
    categoryId: selectedCategory,
    platform: selectedPlatform,
    limit: 50
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar / Filters */}
          <aside className="w-full md:w-64 shrink-0 space-y-8">
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </h3>
              
              <div className="relative mb-6">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-9 bg-card border-border/50 font-mono text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider font-mono">Platform</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setSelectedPlatform(undefined)}
                      className={`text-sm w-full text-left px-2 py-1.5 rounded transition-colors ${!selectedPlatform ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-foreground'}`}
                    >
                      All Platforms
                    </button>
                    <button 
                      onClick={() => setSelectedPlatform("windows")}
                      className={`text-sm w-full text-left px-2 py-1.5 rounded transition-colors ${selectedPlatform === "windows" ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-foreground'}`}
                    >
                      Windows
                    </button>
                    <button 
                      onClick={() => setSelectedPlatform("macos")}
                      className={`text-sm w-full text-left px-2 py-1.5 rounded transition-colors ${selectedPlatform === "macos" ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-foreground'}`}
                    >
                      macOS
                    </button>
                    <button 
                      onClick={() => setSelectedPlatform("cross-platform")}
                      className={`text-sm w-full text-left px-2 py-1.5 rounded transition-colors ${selectedPlatform === "cross-platform" ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-foreground'}`}
                    >
                      Cross-Platform
                    </button>
                  </div>
                </div>

                <div className="h-px bg-border/50 w-full" />

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider font-mono">Categories</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setSelectedCategory(undefined)}
                      className={`text-sm w-full text-left px-2 py-1.5 rounded transition-colors flex justify-between items-center ${!selectedCategory ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-foreground'}`}
                    >
                      <span>All Categories</span>
                    </button>
                    {categories?.map(category => (
                      <button 
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`text-sm w-full text-left px-2 py-1.5 rounded transition-colors flex justify-between items-center ${selectedCategory === category.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50 text-foreground'}`}
                      >
                        <span>{category.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{category.productCount}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Software Catalog</h1>
              <div className="text-sm text-muted-foreground font-mono">
                {productData?.total || 0} products found
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-[400px] rounded-xl bg-card border border-border animate-pulse" />
                ))}
              </div>
            ) : productData?.products.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-border/50 rounded-xl bg-card/30">
                <p className="text-lg font-medium text-foreground mb-2">No products found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
                <Button 
                  variant="outline" 
                  className="mt-6"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory(undefined);
                    setSelectedPlatform(undefined);
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productData?.products.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}