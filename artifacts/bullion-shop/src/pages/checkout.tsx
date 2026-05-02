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
          <h1 className="text-3xl font-serif text-foreground mb-4">Your cart is empty</h1>
          <Link href="/catalog">
            <Button variant="outline">Return to Catalog</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      clearCart();
      toast({
        title: "Order Confirmed",
        description: "Thank you! Your order has been placed. A confirmation will be sent to your email.",
      });
      setLocation("/");
    }, 1500);
  };

  return (
    <Layout>
      <div className="bg-gray-50 border-b border-border py-4">
        <div className="container mx-auto px-4 flex justify-center items-center gap-2 text-sm text-muted-foreground">
          <Lock className="w-4 h-4 text-primary" />
          Secure 256-bit encrypted checkout — Your data is protected.
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-serif text-foreground mb-8">Secure Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Form */}
          <div className="flex-1 order-2 lg:order-1">
            <form onSubmit={handleSubmit} className="space-y-8">

              <section className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-serif text-foreground mb-6 border-b border-border pb-4">1. Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" required />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" required />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" required />
                  </div>
                </div>
              </section>

              <section className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-serif text-foreground mb-6 border-b border-border pb-4">2. Shipping Address</h2>
                <p className="text-xs text-primary mb-4 font-medium">Note: We cannot ship to PO Boxes. A physical address is required for insured delivery.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input id="address" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input id="zip" required />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-card border border-border rounded-lg p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-serif text-foreground mb-6 border-b border-border pb-4">3. Payment Method</h2>
                <div className="bg-muted border border-border rounded p-4 mb-6 flex items-start gap-4">
                  <CreditCard className="w-6 h-6 text-muted-foreground mt-1" />
                  <div>
                    <h3 className="text-foreground font-medium mb-1">Credit / Debit Card</h3>
                    <p className="text-sm text-muted-foreground">Secure transaction via our payment gateway.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="ccName">Name on Card</Label>
                    <Input id="ccName" required />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="ccNum">Card Number</Label>
                    <Input id="ccNum" required placeholder="0000 0000 0000 0000" className="font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exp">Expiration</Label>
                    <Input id="exp" required placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" required placeholder="123" />
                  </div>
                </div>
              </section>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : `Complete Order — $${total.toLocaleString('en-US', {minimumFractionDigits: 2})}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96 flex-shrink-0 order-1 lg:order-2">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24 shadow-sm">
              <h3 className="text-xl font-serif text-foreground mb-6 pb-4 border-b border-border">Order Summary</h3>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-gray-50 border border-border rounded p-1 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground font-medium truncate">{item.name}</div>
                      <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-sm font-mono text-foreground text-right">
                      ${(item.price * item.quantity).toLocaleString('en-US')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-border text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground font-mono">${subtotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Insured Shipping</span>
                  <span className="text-foreground font-mono">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-foreground font-medium">Total</span>
                  <span className="text-2xl font-mono text-foreground font-bold">${total.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded p-3 flex gap-3 items-start">
                  <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                  <p className="text-xs text-muted-foreground leading-tight">
                    Your shipment is fully insured until signed for at your address. Contact: contact@novaripartnersllc.com
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
