import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShieldCheck, Package, Mail, Clock, XCircle, AlertTriangle } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { trackPurchase } from "@/lib/analytics";

type OrderStatus = "loading" | "paid" | "pending" | "failed" | "cancelled" | "unknown";

export default function OrderSuccess() {
  const { clearCart } = useCart();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const orderId = params.get("orderId") || "";
  const isMock = params.get("mock") === "1";

  const [status, setStatus] = useState<OrderStatus>("loading");

  // ── Iframe break-out ──────────────────────────────────────────────────────
  // Nexi HPP redirects resultUrl inside the iframe after payment.
  // Detect this and break out to the top window immediately.
  useEffect(() => {
    try {
      if (window.self !== window.top && window.top) {
        window.top.location.replace(window.location.href);
      }
    } catch {
      // Cross-origin top: shouldn't happen since resultUrl is same-origin
    }
  }, []);

  useEffect(() => {
    if (!orderId) {
      setStatus("unknown");
      return;
    }

    // Dev mock bypass
    if (isMock) {
      clearCart();
      setStatus("paid");
      return;
    }

    // Poll backend for real status — ogni 2s per max 10 volte (20s) come da template Nexi
    let attempts = 0;
    const maxAttempts = 10;
    const pollInterval = 2000;

    const poll = async () => {
      try {
        const res = await fetch(`/api/checkout/verify/${encodeURIComponent(orderId)}`);
        if (!res.ok) {
          setStatus("unknown");
          return;
        }
        const data = await res.json() as {
          status: string; total?: number; currency?: string; shipping?: number;
          tax?: number; couponCode?: string | null;
          items?: Array<{ productId: string; name: string; quantity: number; price: number; discount?: number; }>;
        };
        const s = data.status;

        if (s === "paid") {
          clearCart();
          setStatus("paid");
          // GA4 + Google Ads purchase (deduplicato via localStorage)
          trackPurchase({
            orderId,
            total: data.total ?? 0,
            currency: data.currency ?? "USD",
            shipping: data.shipping ?? 0,
            tax: data.tax ?? 0,
            couponCode: data.couponCode ?? null,
            items: (data.items ?? []).map(i => ({
              productId: i.productId || "",
              name: i.name || "",
              quantity: i.quantity || 1,
              price: i.price || 0,
              discount: i.discount || 0,
            })),
          });
          return;
        }
        if (s === "failed" || s === "cancelled") {
          setStatus(s);
          return;
        }

        // pending / processing — retry
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, pollInterval);
        } else {
          setStatus("pending");
        }
      } catch {
        setStatus("unknown");
      }
    };

    poll();
  }, [orderId]);

  if (status === "loading") {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-serif text-foreground mb-2">Verifying your payment…</h1>
          <p className="text-muted-foreground">Please wait while we confirm your order with the payment gateway.</p>
        </div>
      </Layout>
    );
  }

  if (status === "failed" || status === "cancelled") {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-serif text-foreground mb-4">Payment {status === "cancelled" ? "Cancelled" : "Failed"}</h1>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            {status === "cancelled"
              ? "Your payment was cancelled. No charge was made."
              : "Your payment could not be processed. No charge was made."}
          </p>
          {orderId && (
            <div className="bg-card border border-border rounded-lg p-4 mb-8 inline-block">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order Reference</p>
              <p className="font-mono text-foreground font-bold text-lg">{orderId}</p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cart">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-10">
                Return to Cart
              </Button>
            </Link>
            <Link href="/catalog">
              <Button size="lg" variant="outline" className="px-10">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (status === "pending") {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-3xl font-serif text-foreground mb-4">Payment Processing</h1>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Your payment is being processed. This usually takes just a moment. You will receive a confirmation email once complete.
          </p>
          {orderId && (
            <div className="bg-card border border-border rounded-lg p-4 mb-8 inline-block">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order Reference</p>
              <p className="font-mono text-foreground font-bold text-lg">{orderId}</p>
            </div>
          )}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-8">
            <p className="text-sm text-muted-foreground">
              Questions? Contact us at{" "}
              <a href="mailto:contact@novaripartnersllc.com" className="text-primary hover:underline font-medium">
                contact@novaripartnersllc.com
              </a>
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (status === "unknown") {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <AlertTriangle className="w-10 h-10 text-gray-500" />
          </div>
          <h1 className="text-3xl font-serif text-foreground mb-4">Order Not Found</h1>
          <p className="text-muted-foreground text-lg mb-8">
            We could not find this order. If you completed a payment, please contact us with your order reference.
          </p>
          <Link href="/catalog">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-10">
              Return to Store
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // ── PAID ──────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-4xl font-serif text-foreground mb-4">Order Confirmed!</h1>
        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          Thank you for your purchase from <strong className="text-foreground">NOVARI PARTNERS LLC</strong>. Your payment has been processed successfully.
        </p>

        {orderId && (
          <div className="bg-card border border-border rounded-lg p-4 mb-8 inline-block">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order Reference</p>
            <p className="font-mono text-foreground font-bold text-lg">{orderId}</p>
          </div>
        )}

        <div className="bg-card border border-border rounded-lg p-8 mb-8 text-left shadow-sm">
          <h2 className="font-serif text-xl text-foreground mb-6">What Happens Next</h2>
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Email Confirmation</p>
                <p className="text-sm text-muted-foreground">You will receive an order confirmation email from NOVARI PARTNERS LLC within a few minutes.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Authentication & Verification</p>
                <p className="text-sm text-muted-foreground">Your coins are verified for authenticity using XRF spectrometry before shipment.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Insured Shipping</p>
                <p className="text-sm text-muted-foreground">Your order ships in discreet, tamper-evident packaging with full insurance coverage until delivery.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-8">
          <p className="text-sm text-muted-foreground">
            Questions? Contact us at{" "}
            <a href="mailto:contact@novaripartnersllc.com" className="text-primary hover:underline font-medium">
              contact@novaripartnersllc.com
            </a>{" "}
            or call{" "}
            <a href="tel:+19177644680" className="text-primary hover:underline font-medium">
              +1 (917) 764-4680
            </a>
          </p>
        </div>

        <Link href="/catalog">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-10">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </Layout>
  );
}
