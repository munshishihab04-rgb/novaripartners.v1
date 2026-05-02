import { Layout } from "@/components/layout";
import { useGetCart, useRemoveFromCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart, ArrowRight, ShieldCheck, CreditCard } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export function Cart() {
  const { data: cart, isLoading } = useGetCart();
  const removeFromCart = useRemoveFromCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleRemove = (itemId: string, productName: string) => {
    removeFromCart.mutate({ itemId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        toast({
          title: "Item removed",
          description: `${productName} was removed from your cart.`,
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to remove item. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  const isEmpty = !cart?.items || cart.items.length === 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-32 bg-card border border-border rounded-xl animate-pulse" />
              <div className="h-32 bg-card border border-border rounded-xl animate-pulse" />
            </div>
            <div className="h-64 bg-card border border-border rounded-xl animate-pulse" />
          </div>
        ) : isEmpty ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-card/30 border border-dashed border-border/50 rounded-2xl"
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Looks like you haven't added any software licenses to your cart yet. Browse our catalog to find what you need.
            </p>
            <Link href="/catalog">
              <Button size="lg">
                Browse Catalog
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
                <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-border/50 bg-muted/30 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-7">Product</div>
                  <div className="col-span-3 text-right">Price</div>
                  <div className="col-span-2 text-right">Action</div>
                </div>
                
                <ul className="divide-y divide-border/50">
                  {cart.items.map((item, idx) => (
                    <motion.li 
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="p-4 sm:p-6 hover:bg-muted/10 transition-colors"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                        <div className="sm:col-span-7 flex items-center gap-4">
                          <div className="w-16 h-16 bg-background border border-border/50 rounded-md flex items-center justify-center overflow-hidden shrink-0">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.productName} className="w-12 h-12 object-contain" />
                            ) : (
                              <div className="text-primary font-bold text-xl">{item.productName.charAt(0)}</div>
                            )}
                          </div>
                          <div>
                            <Link href={`/products/${item.productId}`} className="font-semibold hover:text-primary transition-colors text-base line-clamp-1">
                              {item.productName}
                            </Link>
                            <div className="text-xs text-muted-foreground font-mono mt-1">
                              Digital License Key
                            </div>
                          </div>
                        </div>
                        
                        <div className="sm:col-span-3 text-left sm:text-right font-mono font-bold text-lg">
                          {cart.currency} {item.price.toFixed(2)}
                        </div>
                        
                        <div className="sm:col-span-2 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemove(item.id, item.productName)}
                            disabled={removeFromCart.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Summary Panel */}
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border/50 rounded-xl p-6 sticky top-24 shadow-xl"
              >
                <h3 className="font-bold text-lg mb-6 pb-4 border-b border-border/50">Order Summary</h3>
                
                <div className="space-y-3 mb-6 font-mono text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{cart.currency} {cart.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxes</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery</span>
                    <span className="text-green-500">Free (Instant)</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border/50 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-3xl font-mono text-foreground">{cart.currency} {cart.total.toFixed(2)}</span>
                  </div>
                </div>

                <Button className="w-full h-12 text-lg font-bold mb-4">
                  <CreditCard className="mr-2 w-5 h-5" />
                  Proceed to Payment
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Guaranteed Safe & Secure Checkout
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}