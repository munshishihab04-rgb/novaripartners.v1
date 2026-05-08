import { Layout } from "@/components/layout";
import { useGetProduct, useAddToCart, getGetCartQueryKey, getGetProductQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShieldCheck, Zap, Monitor, Apple, MonitorSmartphone, CheckCircle2, ShoppingCart, CreditCard, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { useCurrency } from "@/lib/currency";

export function ProductDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: product, isLoading, isError } = useGetProduct(id, { 
    query: { enabled: !!id, queryKey: getGetProductQueryKey(id) } 
  });

  const addToCart = useAddToCart();
  const { format } = useCurrency();

  useEffect(() => {
    if (product?.id) {
      trackEvent("product_view", { productId: product.id, metadata: { name: product.name } });
    }
  }, [product?.id]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart.mutate({ data: { productId: product.id } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart.`,
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to add item to cart. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  const PlatformIcon = ({ platform, className }: { platform: string, className?: string }) => {
    switch (platform) {
      case "windows":
        return <Monitor className={className} />;
      case "macos":
        return <Apple className={className} />;
      case "cross-platform":
        return <MonitorSmartphone className={className} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="h-[60vh] w-full bg-white rounded-2xl border border-border animate-pulse shadow-sm" />
        </div>
      </Layout>
    );
  }

  if (isError || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center bg-white rounded-2xl border border-border mt-8 shadow-sm">
          <h1 className="text-3xl font-bold mb-4 text-foreground">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you are looking for does not exist or has been removed.</p>
          <Button onClick={() => window.history.back()} className="rounded-full">Go Back</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-muted-foreground mb-8 font-medium">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href="/catalog" className="hover:text-primary transition-colors">Catalog</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href={`/catalog?categoryId=${product.categoryId}`} className="hover:text-primary transition-colors">{product.categoryName}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-foreground truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left: Image & Trust */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl border border-border p-10 flex items-center justify-center relative shadow-sm"
            >
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full object-contain mix-blend-multiply" 
                />
              ) : (
                <div className="w-40 h-40 bg-muted/30 rounded-2xl flex items-center justify-center text-primary font-bold text-5xl">
                  {product.name.charAt(0)}
                </div>
              )}
            </motion.div>

            <div className="bg-white rounded-xl border border-border p-5 shadow-sm grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <ShieldCheck className="w-6 h-6 text-primary mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Verified Key</span>
              </div>
              <div className="flex flex-col items-center border-l border-r border-border">
                <Zap className="w-6 h-6 text-primary mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Instant</span>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-6 h-6 text-primary mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Support</span>
              </div>
            </div>
          </div>

          {/* Center: Details */}
          <div className="lg:col-span-5 space-y-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground leading-tight">
                {product.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded">
                  {product.publisher}
                </span>
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 border border-border px-2.5 py-1 rounded bg-white">
                  <PlatformIcon platform={product.platform} className="w-4 h-4" />
                  {product.platform}
                </span>
                <span className="text-sm font-medium text-muted-foreground border border-border px-2.5 py-1 rounded bg-white">
                  v{product.version}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-6 cursor-pointer group">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
                <span className="text-sm font-bold ml-1 text-foreground">{product.rating.toFixed(1)}</span>
                <span className="text-sm text-primary group-hover:underline ml-1">
                  ({product.reviewCount} customer reviews)
                </span>
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {product.shortDescription || product.description.substring(0, 120) + "..."}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold mb-4 text-foreground">Specifications</h3>
              <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-3 px-4 bg-muted/30 font-medium text-muted-foreground w-1/3">Delivery Type</td>
                      <td className="py-3 px-4 font-semibold text-foreground">Electronic License Key</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 bg-muted/30 font-medium text-muted-foreground">License Duration</td>
                      <td className="py-3 px-4 font-semibold text-foreground">Lifetime / Permanent</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 bg-muted/30 font-medium text-muted-foreground">Publisher</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{product.publisher}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 bg-muted/30 font-medium text-muted-foreground">Platform</td>
                      <td className="py-3 px-4 font-semibold text-foreground flex items-center gap-2 capitalize">
                        <PlatformIcon platform={product.platform} className="w-4 h-4 text-muted-foreground" />
                        {product.platform}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 bg-muted/30 font-medium text-muted-foreground">Language</td>
                      <td className="py-3 px-4 font-semibold text-foreground">Multilingual</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 bg-muted/30 font-medium text-muted-foreground">SKU</td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">NK-{product.id}-{product.platform.substring(0,3).toUpperCase()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <h3 className="text-xl font-bold mb-4 text-foreground">What's Included</h3>
              <ul className="grid grid-cols-1 gap-4">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-border shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="font-medium text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <h3 className="text-xl font-bold mb-4 text-foreground">Description</h3>
              <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground">
                <p className="leading-relaxed">{product.description}</p>
              </div>
            </motion.div>
          </div>

          {/* Right: Order Panel */}
          <div className="lg:col-span-3">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="sticky top-24 bg-white rounded-2xl p-6 shadow-xl shadow-primary/5 border border-border"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="text-sm text-muted-foreground line-through font-mono mb-1">
                      {format(product.originalPrice)}
                    </div>
                  )}
                  <div className="text-4xl font-bold text-primary font-mono tracking-tight">
                    {format(product.price)}
                  </div>
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold px-2 py-1 shadow-sm">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 mb-6 bg-muted/50 p-3 rounded-lg border border-border">
                {product.inStock ? (
                  <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-bold text-foreground tracking-wide">In Stock</span>
                    <span className="text-sm text-muted-foreground ml-auto">Ready to deliver</span>
                  </>
                ) : (
                  <>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    <span className="text-sm font-bold text-foreground tracking-wide">Out of Stock</span>
                  </>
                )}
              </div>

              <div className="space-y-3 mb-8">
                <Button 
                  className="w-full h-14 text-lg font-bold rounded-xl shadow-md hover:shadow-lg transition-shadow" 
                  disabled={!product.inStock || addToCart.isPending}
                  onClick={handleAddToCart}
                >
                  {addToCart.isPending ? "Processing..." : "Place Order"}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-14 font-bold rounded-xl bg-white border-2 border-primary/20 text-primary hover:bg-primary/5"
                  disabled={!product.inStock || addToCart.isPending}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 w-5 h-5" />
                  Add to Cart
                </Button>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="h-px bg-border flex-1"></div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Secure Checkout</span>
                  <div className="h-px bg-border flex-1"></div>
                </div>
                
                <div className="flex justify-center gap-4 text-muted-foreground">
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-[10px]">SSL</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Zap className="w-5 h-5" />
                    <span className="text-[10px]">Instant</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-[10px]">Genuine</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </Layout>
  );
}