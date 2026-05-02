import { Layout } from "@/components/layout";
import { useCart } from "@/hooks/use-cart";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Lock, ShieldCheck, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shipping = subtotal > 500 ? 0 : 25;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-serif text-white mb-4">Your vault is empty</h1>
          <Link href="/catalog">
            <Button variant="outline" className="border-white/20 text-white">Return to Catalog</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate processing
    setTimeout(() => {
      clearCart();
      toast({
        title: "Order Secured",
        description: "Your investment has been locked in. You will receive an email confirmation shortly.",
      });
      setLocation("/");
    }, 1500);
  };

  return (
    <Layout>
      <div className="bg-black border-b border-white/10 py-6">
        <div className="container mx-auto px-4 flex justify-center items-center gap-2 text-sm text-gray-400">
          <Lock className="w-4 h-4 text-primary" /> 
          Secure 256-bit encrypted checkout. Your data is protected.
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-serif text-white mb-8">Secure Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Form */}
          <div className="flex-1 order-2 lg:order-1">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              <section className="bg-card border border-white/10 rounded-lg p-6 sm:p-8">
                <h2 className="text-xl font-serif text-white mb-6 border-b border-white/10 pb-4">1. Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                    <Input id="firstName" required className="bg-background border-white/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                    <Input id="lastName" required className="bg-background border-white/20 text-white" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                    <Input id="email" type="email" required className="bg-background border-white/20 text-white" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                    <Input id="phone" type="tel" required className="bg-background border-white/20 text-white" />
                  </div>
                </div>
              </section>

              <section className="bg-card border border-white/10 rounded-lg p-6 sm:p-8">
                <h2 className="text-xl font-serif text-white mb-6 border-b border-white/10 pb-4">2. Shipping Address</h2>
                <p className="text-xs text-primary mb-4">Note: We cannot ship to PO Boxes. A physical address is required for insured delivery.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address" className="text-gray-300">Street Address</Label>
                    <Input id="address" required className="bg-background border-white/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-300">City</Label>
                    <Input id="city" required className="bg-background border-white/20 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-gray-300">State</Label>
                      <Input id="state" required className="bg-background border-white/20 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip" className="text-gray-300">ZIP Code</Label>
                      <Input id="zip" required className="bg-background border-white/20 text-white" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-card border border-white/10 rounded-lg p-6 sm:p-8">
                <h2 className="text-xl font-serif text-white mb-6 border-b border-white/10 pb-4">3. Payment Method</h2>
                <div className="bg-background border border-white/10 rounded p-4 mb-6 flex items-start gap-4">
                  <CreditCard className="w-6 h-6 text-gray-400 mt-1" />
                  <div>
                    <h3 className="text-white font-medium mb-1">Credit / Debit Card</h3>
                    <p className="text-sm text-gray-500">Secure transaction via our payment gateway.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="ccName" className="text-gray-300">Name on Card</Label>
                    <Input id="ccName" required className="bg-background border-white/20 text-white" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="ccNum" className="text-gray-300">Card Number</Label>
                    <Input id="ccNum" required placeholder="0000 0000 0000 0000" className="bg-background border-white/20 text-white font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exp" className="text-gray-300">Expiration</Label>
                    <Input id="exp" required placeholder="MM/YY" className="bg-background border-white/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv" className="text-gray-300">CVV</Label>
                    <Input id="cvv" required placeholder="123" className="bg-background border-white/20 text-white" />
                  </div>
                </div>
              </section>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-14 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Securing Allocation..." : `Complete Order — $${total.toLocaleString('en-US', {minimumFractionDigits: 2})}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96 flex-shrink-0 order-1 lg:order-2">
            <div className="bg-card border border-white/10 rounded-lg p-6 sticky top-24">
              <h3 className="text-xl font-serif text-white mb-6 pb-4 border-b border-white/10">Order Summary</h3>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-white rounded p-1 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium truncate">{item.name}</div>
                      <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-sm font-mono text-white text-right">
                      ${(item.price * item.quantity).toLocaleString('en-US')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-white font-mono">${subtotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Insured Shipping</span>
                  <span className="text-white font-mono">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mt-4">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-2xl font-mono text-white font-bold">${total.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
                
                <div className="bg-primary/10 border border-primary/20 rounded p-3 flex gap-3 items-start">
                  <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                  <p className="text-xs text-gray-300 leading-tight">
                    Your shipment is fully insured by Lloyd's of London until signed for at your address.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
