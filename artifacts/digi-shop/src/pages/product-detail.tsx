import { Layout } from "@/components/layout";
import { useGetProduct, useAddToCart, getGetCartQueryKey, getGetProductQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShieldCheck, Zap, Monitor, Apple, MonitorSmartphone, CheckCircle2, ShoppingCart, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

export function ProductDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: product, isLoading, isError } = useGetProduct(id, { 
    query: { enabled: !!id, queryKey: getGetProductQueryKey(id) } 
  });

  const addToCart = useAddToCart();

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
          <div className="h-[60vh] w-full bg-card rounded-xl border border-border animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (isError || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you are looking for does not exist or has been removed.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left: Image */}
          <div className="lg:col-span-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="aspect-square lg:aspect-[4/5] rounded-xl bg-card border border-border/50 p-8 flex items-center justify-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-contain drop-shadow-2xl z-10" 
                />
              ) : (
                <div className="w-32 h-32 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-4xl z-10">
                  {product.name.charAt(0)}
                </div>
              )}
            </motion.div>
          </div>

          {/* Center: Details */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  {product.categoryName}
                </Badge>
                <Badge variant="secondary" className="font-mono text-xs uppercase tracking-wider flex gap-1.5 items-center">
                  <PlatformIcon platform={product.platform} className="w-3 h-3" />
                  {product.platform}
                </Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 leading-tight">
                {product.name}
              </h1>
              
              <div className="text-primary font-mono text-sm font-medium uppercase tracking-widest mb-4">
                BY {product.publisher}
              </div>
              
              <div className="flex items-center gap-2 mb-6 bg-card inline-flex px-3 py-1.5 rounded-md border border-border/50">
                <div className="flex text-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-primary' : 'fill-muted text-muted'}`} />
                  ))}
                </div>
                <span className="text-sm font-bold ml-1">{product.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground border-l border-border/50 pl-2 ml-1">
                  {product.reviewCount} Reviews
                </span>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold tracking-tight border-b border-border/50 pb-2">Key Features</h3>
              <ul className="grid grid-cols-1 gap-3">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold tracking-tight border-b border-border/50 pb-2">Technical Specifications</h3>
              <div className="bg-card border border-border/50 rounded-xl overflow-hidden text-sm">
                <div className="grid grid-cols-3 border-b border-border/50">
                  <div className="col-span-1 bg-muted/30 p-3 font-medium text-muted-foreground font-mono uppercase text-xs flex items-center">License Type</div>
                  <div className="col-span-2 p-3 font-medium">Digital Key / Retail</div>
                </div>
                <div className="grid grid-cols-3 border-b border-border/50">
                  <div className="col-span-1 bg-muted/30 p-3 font-medium text-muted-foreground font-mono uppercase text-xs flex items-center">Duration</div>
                  <div className="col-span-2 p-3 font-medium">Lifetime / Permanent</div>
                </div>
                <div className="grid grid-cols-3 border-b border-border/50">
                  <div className="col-span-1 bg-muted/30 p-3 font-medium text-muted-foreground font-mono uppercase text-xs flex items-center">Version</div>
                  <div className="col-span-2 p-3 font-medium font-mono">{product.version}</div>
                </div>
                <div className="grid grid-cols-3 border-b border-border/50">
                  <div className="col-span-1 bg-muted/30 p-3 font-medium text-muted-foreground font-mono uppercase text-xs flex items-center">Delivery</div>
                  <div className="col-span-2 p-3 font-medium">{product.deliveryMethod}</div>
                </div>
                <div className="grid grid-cols-3">
                  <div className="col-span-1 bg-muted/30 p-3 font-medium text-muted-foreground font-mono uppercase text-xs flex items-center">SKU</div>
                  <div className="col-span-2 p-3 font-medium font-mono text-muted-foreground">NK-{product.id}-{product.platform.substring(0,3).toUpperCase()}</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Order Panel */}
          <div className="lg:col-span-3">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="sticky top-24 bg-card border border-border/50 rounded-2xl p-6 shadow-2xl shadow-black/50"
            >
              <div className="flex items-center gap-2 mb-4">
                {product.inStock ? (
                  <>
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-medium text-green-500 font-mono uppercase tracking-wider">In Stock</span>
                  </>
                ) : (
                  <>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    <span className="text-sm font-medium text-red-500 font-mono uppercase tracking-wider">Out of Stock</span>
                  </>
                )}
              </div>

              <div className="mb-6">
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="text-sm text-muted-foreground line-through font-mono mb-1">
                    {product.currency} {product.originalPrice.toFixed(2)}
                  </div>
                )}
                <div className="text-4xl font-bold text-foreground font-mono tracking-tight">
                  {product.currency} {product.price.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-2">One-time payment. Taxes included.</div>
              </div>

              <div className="space-y-3 mb-6">
                <Button 
                  className="w-full h-12 text-lg font-bold" 
                  disabled={!product.inStock || addToCart.isPending}
                  onClick={handleAddToCart}
                >
                  {addToCart.isPending ? "Processing..." : (
                    <>
                      <CreditCard className="mr-2 w-5 h-5" />
                      Buy Now
                    </>
                  )}
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full h-12 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20"
                  disabled={!product.inStock || addToCart.isPending}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 w-5 h-5" />
                  Add to Cart
                </Button>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-foreground">Instant Delivery</div>
                    <div className="text-xs text-muted-foreground">License key sent via email within 5 minutes</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-foreground">Secure Transaction</div>
                    <div className="text-xs text-muted-foreground">256-bit SSL encrypted checkout</div>
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