import { Layout } from "@/components/layout";
import { useCart } from "@/hooks/use-cart";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef, useEffect } from "react";
import { Lock, ShieldCheck, X, AlertTriangle, ExternalLink, Package, ShoppingCart, ArrowLeft } from "lucide-react";

type OverlayState = "idle" | "loading" | "open" | "blocked";

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const [, setLocation] = useLocation();

  const shipping = subtotal > 500 ? 0 : 25;
  const total = subtotal + shipping;

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const [overlayState, setOverlayState] = useState<OverlayState>("idle");
  const [hostedPage, setHostedPage] = useState("");
  const [orderId, setOrderId] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blockedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.lastName.trim()) errs.lastName = "Required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.address.trim()) errs.address = "Required";
    if (!form.city.trim()) errs.city = "Required";
    if (!form.state.trim()) errs.state = "Required";
    if (!form.zip.trim()) errs.zip = "Required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    setOverlayState("loading");

    try {
      const res = await fetch("/api/checkout/create-bullion-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: `${form.firstName.trim()} ${form.lastName.trim()}`,
          customerEmail: form.email.trim(),
          items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error || "An unexpected error occurred. Please try again.");
        setOverlayState("idle");
        return;
      }

      setOrderId(data.orderId);
      setHostedPage(data.hostedPage);
      setOverlayState("open");
    } catch {
      setApiError("Could not connect to the payment gateway. Please try again.");
      setOverlayState("idle");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (overlayState !== "open" || !hostedPage) return;
    blockedTimer.current = setTimeout(() => {
      try {
        const doc = iframeRef.current?.contentDocument;
        if (!doc) setOverlayState("blocked");
      } catch {
        setOverlayState("blocked");
      }
    }, 4000);
    return () => { if (blockedTimer.current) clearTimeout(blockedTimer.current); };
  }, [overlayState, hostedPage]);

  const handleIframeLoad = () => {
    if (blockedTimer.current) clearTimeout(blockedTimer.current);
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc && doc.body && doc.body.innerHTML === "") setOverlayState("blocked");
    } catch {
      // cross-origin = loaded successfully on Nexi domain
    }
  };

  const handleIframeError = () => {
    if (blockedTimer.current) clearTimeout(blockedTimer.current);
    setOverlayState("blocked");
  };

  const handleFallbackRedirect = () => { window.location.href = hostedPage; };

  const handleCloseOverlay = () => {
    if (blockedTimer.current) clearTimeout(blockedTimer.current);
    setOverlayState("idle");
    setHostedPage("");
    setOrderId("");
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center max-w-lg">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-serif text-foreground mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Browse our Silver Eagle collection before checking out.</p>
          <Link href="/catalog">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8">Return to Catalog</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Nexi Payment Overlay */}
      {(overlayState === "loading" || overlayState === "open" || overlayState === "blocked") && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(10,12,20,0.85)", backdropFilter: "blur(6px)" }}>
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-border shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Secure Card Payment</p>
                <p className="text-xs text-slate-400">SSL encrypted · NOVARI PARTNERS LLC</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold text-slate-700">
                ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <button
                onClick={handleCloseOverlay}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                title="Cancel payment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 relative overflow-hidden">
            {overlayState === "loading" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                <p className="text-white/80 text-sm font-medium">Preparing your secure checkout…</p>
              </div>
            )}

            {overlayState === "open" && hostedPage && (
              <iframe
                ref={iframeRef}
                src={hostedPage}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                className="w-full h-full border-0"
                title="Nexi XPay Secure Payment"
                allow="payment"
                sandbox="allow-scripts allow-forms allow-same-origin allow-top-navigation allow-popups"
              />
            )}

            {overlayState === "blocked" && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
                  <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-7 h-7 text-amber-500" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 mb-2">External Payment Page</h2>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    Nexi's payment page needs to open in a new tab for security reasons. Your order has been created — click below to complete your payment.
                  </p>
                  <Button className="w-full mb-3 bg-primary hover:bg-primary/90 text-white" onClick={handleFallbackRedirect}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Complete Payment on Nexi
                  </Button>
                  <button
                    onClick={handleCloseOverlay}
                    className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Cancel and go back
                  </button>
                  {orderId && (
                    <p className="text-xs text-slate-300 mt-4 font-mono">Order: {orderId}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="bg-gray-50 border-b border-border py-6">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-3">
            <ArrowLeft className="w-4 h-4" /> Back to cart
          </Link>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <h1 className="text-2xl font-serif text-foreground">Secure Checkout</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">256-bit encrypted · Powered by Nexi XPay</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>

              {/* Contact */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-serif text-foreground mb-5 pb-3 border-b border-border">1. Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                    <Input id="firstName" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className={errors.firstName ? "border-destructive" : ""} />
                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                    <Input id="lastName" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className={errors.lastName ? "border-destructive" : ""} />
                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                    <Input id="email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={errors.email ? "border-destructive" : ""} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    <p className="text-xs text-muted-foreground">Order confirmation will be sent here.</p>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-serif text-foreground mb-5 pb-3 border-b border-border">2. Shipping Address</h2>
                <p className="text-xs text-primary font-medium mb-4">We cannot ship to PO Boxes. A physical address is required for insured delivery.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="address">Street Address <span className="text-destructive">*</span></Label>
                    <Input id="address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className={errors.address ? "border-destructive" : ""} />
                    {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                    <Input id="city" value={form.city} onChange={e => setForm({...form, city: e.target.value})} className={errors.city ? "border-destructive" : ""} />
                    {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="state">State <span className="text-destructive">*</span></Label>
                      <Input id="state" value={form.state} onChange={e => setForm({...form, state: e.target.value})} className={errors.state ? "border-destructive" : ""} placeholder="WY" />
                      {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="zip">ZIP <span className="text-destructive">*</span></Label>
                      <Input id="zip" value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} className={errors.zip ? "border-destructive" : ""} />
                      {errors.zip && <p className="text-xs text-destructive">{errors.zip}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {apiError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive">{apiError}</p>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 text-base"
                disabled={submitting}
              >
                {submitting ? (
                  "Connecting to secure payment…"
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Pay ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })} with Card
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By placing your order you agree to our terms and conditions. All sales are final for physical bullion. NOVARI PARTNERS LLC — 30 N Gould St Ste R, Sheridan, WY 82801.
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <h3 className="font-serif text-lg text-foreground mb-4 pb-3 border-b border-border">Order Summary</h3>
              <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-12 h-12 bg-gray-50 border border-border rounded p-1 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-mono text-foreground font-semibold shrink-0">
                      ${(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Insured Shipping</span>
                  <span className="font-mono">{shipping === 0 ? <span className="text-green-600 font-medium">FREE</span> : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-foreground pt-1 text-base">
                  <span>Total (USD)</span>
                  <span className="font-mono">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Safe & Secure Payment</h3>
              {[
                { icon: Lock, text: "256-bit SSL encrypted connection" },
                { icon: ShieldCheck, text: "Powered by Nexi XPay payment gateway" },
                { icon: Package, text: "Fully insured shipping — Lloyd's of London" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <item.icon className="w-4 h-4 text-primary shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
