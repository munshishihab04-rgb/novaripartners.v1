import { useEffect } from "react";
import { Layout } from "@/components/layout";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShieldCheck, Package, Mail } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export default function OrderSuccess() {
  const { clearCart } = useCart();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const orderId = params.get("orderId") || "";

  useEffect(() => {
    clearCart();
  }, []);

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
