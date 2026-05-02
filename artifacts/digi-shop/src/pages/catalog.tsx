import { Layout } from "@/components/layout";
import { ProductCard } from "@/components/product-card";
import { useListProducts, useListCategories, ListProductsPlatform } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, Check } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

export function Catalog() {
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
      <div className="bg-white border-b border-border py-8 mb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight text-center mb-6">Software Catalog</h1>
            <div className="relative shadow-sm">
              <Search className="w-5 h-5 absolute left-4 top-3.5 text-muted-foreground" />
              <Input 
                placeholder="Search for software, publishers, or tools..." 
                className="pl-12 h-12 bg-white border-border rounded-full text-base focus-visible:ring-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar / Filters */}
          <aside className="w-full lg:w-64 shrink-0 space-y-8">
            <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2 border-b border-border pb-4">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
                Filters
              </h3>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Platform</h4>
                  <div className="space-y-1.5">
                    <button 
                      onClick={() => setSelectedPlatform(undefined)}
                      className={`text-sm w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${!selectedPlatform ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    >
                      All Platforms
                      {!selectedPlatform && <Check className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => setSelectedPlatform("windows")}
                      className={`text-sm w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${selectedPlatform === "windows" ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    >
                      Windows
                      {selectedPlatform === "windows" && <Check className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => setSelectedPlatform("macos")}
                      className={`text-sm w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${selectedPlatform === "macos" ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    >
                      macOS
                      {selectedPlatform === "macos" && <Check className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => setSelectedPlatform("cross-platform")}
                      className={`text-sm w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${selectedPlatform === "cross-platform" ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    >
                      Cross-Platform
                      {selectedPlatform === "cross-platform" && <Check className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">Categories</h4>
                  <div className="space-y-1.5">
                    <button 
                      onClick={() => setSelectedCategory(undefined)}
                      className={`text-sm w-full text-left px-3 py-2 rounded-md transition-colors flex justify-between items-center ${!selectedCategory ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                    >
                      <span>All Categories</span>
                      {!selectedCategory && <Check className="w-4 h-4" />}
                    </button>
                    {categories?.map(category => (
                      <button 
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`text-sm w-full text-left px-3 py-2 rounded-md transition-colors flex justify-between items-center ${selectedCategory === category.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
                      >
                        <span>{category.name}</span>
                        {selectedCategory === category.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{category.productCount}</span>
                        )}
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
              <div className="text-sm text-muted-foreground font-medium">
                Showing <span className="text-foreground font-bold">{productData?.total || 0}</span> products
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-[420px] rounded-xl bg-white border border-border animate-pulse shadow-sm" />
                ))}
              </div>
            ) : productData?.products.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-border rounded-2xl bg-white shadow-sm">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-xl font-bold text-foreground mb-2">No products found</p>
                <p className="text-muted-foreground max-w-md mx-auto">We couldn't find anything matching your current filters and search query.</p>
                <Button 
                  variant="outline" 
                  className="mt-8 rounded-full"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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