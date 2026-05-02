import { Layout } from "@/components/layout";
import { useGetCart, useRemoveFromCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart, ArrowRight, ShieldCheck, CreditCard, Lock } from "lucide-react";
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
      <div className="bg-white border-b border-border py-8 mb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Secure Checkout</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20 max-w-6xl">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-32 bg-white border border-border rounded-2xl animate-pulse" />
              <div className="h-32 bg-white border border-border rounded-2xl animate-pulse" />
            </div>
            <div className="h-[400px] bg-white border border-border rounded-2xl animate-pulse" />
          </div>
        ) : isEmpty ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-white border border-border rounded-2xl shadow-sm"
          >
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-foreground">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
              Looks like you haven't added any software licenses to your cart yet.
            </p>
            <Link href="/catalog">
              <Button size="lg" className="rounded-full h-14 px-8 font-bold shadow-md hover:shadow-lg transition-shadow">
                Browse Catalog
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="hidden sm:grid grid-cols-12 gap-4 p-5 border-b border-border bg-muted/20 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <div className="col-span-8">Product</div>
                  <div className="col-span-3 text-right">Price</div>
                  <div className="col-span-1 text-center"></div>
                </div>
                
                <ul className="divide-y divide-border">
                  {cart.items.map((item, idx) => (
                    <motion.li 
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="p-5 hover:bg-muted/10 transition-colors"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                        <div className="sm:col-span-8 flex items-center gap-5">
                          <div className="w-20 h-20 bg-muted/30 border border-border rounded-xl flex items-center justify-center shrink-0">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.productName} className="w-14 h-14 object-contain mix-blend-multiply" />
                            ) : (
                              <div className="text-primary font-bold text-2xl">{item.productName.charAt(0)}</div>
                            )}
                          </div>
                          <div>
                            <Link href={`/products/${item.productId}`} className="font-bold text-lg hover:text-primary transition-colors text-foreground line-clamp-2 leading-snug mb-1">
                              {item.productName}
                            </Link>
                            <div className="text-xs font-medium text-primary bg-primary/10 inline-block px-2 py-0.5 rounded">
                              Instant Digital Key
                            </div>
                          </div>
                        </div>
                        
                        <div className="sm:col-span-3 text-left sm:text-right font-mono font-bold text-xl text-foreground">
                          {cart.currency} {item.price.toFixed(2)}
                        </div>
                        
                        <div className="sm:col-span-1 flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full"
                            onClick={() => handleRemove(item.id, item.productName)}
                            disabled={removeFromCart.isPending}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-white p-4 rounded-xl border border-border">
                <Lock className="w-4 h-4 text-green-500" />
                All transactions are secure and encrypted.
              </div>
            </div>

            {/* Right: Summary Panel */}
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-border rounded-2xl p-8 sticky top-24 shadow-xl shadow-primary/5"
              >
                <h3 className="font-bold text-xl mb-6 pb-4 border-b border-border text-foreground">Order Summary</h3>
                
                <div className="space-y-4 mb-6 text-sm font-medium">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-mono text-foreground">{cart.currency} {cart.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxes</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">Free (Instant)</span>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-border mb-8">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-lg text-foreground">Total</span>
                    <span className="font-bold text-4xl font-mono text-foreground tracking-tight">{cart.currency} {cart.total.toFixed(2)}</span>
                  </div>
                  <div className="text-right text-xs text-muted-foreground mt-1">USD, taxes included where applicable</div>
                </div>

                <Button className="w-full h-14 text-lg font-bold mb-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  Checkout Now
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mt-6">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Safe & Secure Checkout
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}