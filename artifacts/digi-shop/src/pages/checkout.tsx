import { Layout } from "@/components/layout";
import { useGetCart } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { ShoppingCart, Lock, ShieldCheck, Zap, ArrowLeft } from "lucide-react";

export function Checkout() {
  const { data: cart, isLoading } = useGetCart();
  const [, navigate] = useLocation();

  const [form, setForm] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const isEmpty = !cart?.items || cart.items.length === 0;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email.trim()) errs.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Please enter a valid email address";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const sessionId =
        localStorage.getItem("nexuskeys_session") || "default-session";

      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId,
        },
        body: JSON.stringify({
          customerName: form.name.trim(),
          customerEmail: form.email.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error || "An unexpected error occurred.");
        return;
      }

      localStorage.setItem("nexuskeys_pending_order", data.orderId);
      window.location.href = data.hostedPage;
    } catch {
      setApiError("Could not connect to the payment gateway. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <div className="h-96 bg-card border border-border rounded-2xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (isEmpty) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 max-w-lg text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Add some software licenses before proceeding to checkout.
          </p>
          <Link href="/catalog">
            <Button size="lg">Browse Catalog</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const totalEur = cart!.total.toFixed(2);

  return (
    <Layout>
      <div className="bg-muted/40 border-b border-border py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to cart
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Secure Checkout</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-6">Contact Information</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Your license key will be sent to the email address below immediately after payment confirmation.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="name">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Mario Rossi"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={`w-full h-11 px-4 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background ${errors.name ? "border-destructive" : "border-input"}`}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="email">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="mario@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full h-11 px-4 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-background ${errors.email ? "border-destructive" : "border-input"}`}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Your license key will be delivered to this address.
                  </p>
                </div>

                {apiError && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-sm text-destructive">{apiError}</p>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-13 text-base font-bold py-3.5"
                    disabled={submitting}
                  >
                    {submitting ? (
                      "Connecting to payment gateway..."
                    ) : (
                      <>
                        <Lock className="mr-2 w-4 h-4" />
                        Pay EUR {totalEur} — Proceed to Nexi XPay
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  By placing your order you agree to our{" "}
                  <Link href="/terms" className="text-primary hover:underline">Terms & Conditions</Link>,{" "}
                  <Link href="/refunds" className="text-primary hover:underline">Refund Policy</Link>, and{" "}
                  <Link href="/withdrawal" className="text-primary hover:underline">Right of Withdrawal</Link>.
                  You expressly consent to immediate digital delivery and acknowledge that you waive your right of withdrawal upon key delivery.
                </p>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-4 pb-3 border-b border-border">
                Order Summary
              </h3>
              <ul className="space-y-3 mb-4">
                {cart!.items.map((item) => (
                  <li key={item.id} className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 bg-muted rounded-md flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                        {item.productName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">Digital License Key</p>
                      </div>
                    </div>
                    <span className="text-sm font-mono font-semibold shrink-0">
                      EUR {item.price.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono">EUR {totalEur}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Delivery</span>
                  <span className="text-green-600 font-medium">Free (Instant)</span>
                </div>
                <div className="flex justify-between font-bold text-foreground pt-1">
                  <span>Total</span>
                  <span className="font-mono text-lg">EUR {totalEur}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Why it's safe to pay here</h3>
              <div className="space-y-3">
                {[
                  { icon: <Lock className="w-4 h-4" />, text: "256-bit SSL encrypted connection" },
                  { icon: <ShieldCheck className="w-4 h-4" />, text: "Powered by Nexi XPay — Italy's leading gateway" },
                  { icon: <Zap className="w-4 h-4" />, text: "License key delivered instantly to your inbox" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="text-primary shrink-0">{item.icon}</div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
