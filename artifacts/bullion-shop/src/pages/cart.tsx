import { Layout } from "@/components/layout";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowRight, ShieldCheck } from "lucide-react";

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const shipping = subtotal > 500 ? 0 : 25;
  const total = subtotal + shipping;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-serif text-white mb-8">Your Vault</h1>

        {items.length === 0 ? (
          <div className="bg-card border border-white/10 rounded-lg p-12 text-center">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
              <ShieldCheck className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-2xl font-serif text-white mb-4">Your vault is currently empty.</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Ready to secure your legacy? Browse our catalog of investment-grade precious metals.
            </p>
            <Link href="/catalog">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-black font-bold px-8">
                Explore Catalog
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1">
              <div className="bg-card border border-white/10 rounded-lg overflow-hidden">
                <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                <div className="divide-y divide-white/5">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center">
                      <div className="col-span-6 flex items-center gap-4 w-full">
                        <div className="w-20 h-20 bg-white rounded flex-shrink-0 p-2">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <Link href={`/products/${item.id}`} className="font-serif text-white hover:text-primary transition-colors line-clamp-2">
                            {item.name}
                          </Link>
                          <div className="text-xs text-gray-500 mt-1">{item.metal}</div>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-xs text-destructive hover:text-destructive/80 mt-2 flex items-center gap-1 sm:hidden"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </div>

                      <div className="col-span-2 text-center w-full flex justify-between sm:block">
                        <span className="sm:hidden text-gray-400 text-sm">Price:</span>
                        <span className="font-mono text-gray-300">${item.price.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                      </div>

                      <div className="col-span-2 flex justify-center w-full sm:w-auto">
                        <div className="flex items-center border border-white/20 rounded bg-background w-full sm:w-auto">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 text-gray-400 hover:text-white transition-colors"
                          >-</button>
                          <span className="w-10 text-center text-white text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 text-gray-400 hover:text-white transition-colors"
                          >+</button>
                        </div>
                      </div>

                      <div className="col-span-2 flex justify-between sm:justify-end items-center w-full">
                        <span className="sm:hidden text-gray-400 text-sm">Total:</span>
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-white font-medium">${(item.price * item.quantity).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-gray-500 hover:text-destructive hidden sm:block transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-card border border-white/10 rounded-lg p-6 sticky top-24">
                <h3 className="text-xl font-serif text-white mb-6 pb-4 border-b border-white/10">Order Summary</h3>
                
                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-white font-mono">${subtotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping & Insurance</span>
                    <span className="text-white font-mono">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  {shipping > 0 && (
                    <div className="text-xs text-primary bg-primary/10 p-2 rounded">
                      Add ${(500 - subtotal).toLocaleString('en-US')} more to qualify for free shipping.
                    </div>
                  )}
                </div>

                <div className="border-t border-white/10 pt-4 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-white font-medium">Total</span>
                    <span className="text-2xl font-mono text-white font-bold">${total.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-right">Prices fixed at checkout.</p>
                </div>

                <Link href="/checkout">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-12 text-base group">
                    Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Safe & Secure Checkout
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
