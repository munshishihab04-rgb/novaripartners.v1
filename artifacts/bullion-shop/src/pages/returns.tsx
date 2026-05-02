import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default function Returns() {
  return (
    <Layout>
      <div className="bg-gray-50 border-b border-border py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span>Returns &amp; Refunds</span>
          </div>
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-serif text-foreground">Returns &amp; Refund Policy</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-2">Last updated: May 2, 2026 · NOVARI PARTNERS LLC</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl py-10">

        {/* All Sales Final Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-amber-800 text-sm mb-1">All Bullion Sales Are Final</p>
            <p className="text-amber-700 text-xs leading-relaxed">Due to the spot-market nature of precious metals, NOVARI PARTNERS LLC does not accept returns or exchanges on confirmed bullion orders. Please review your order carefully before completing your purchase.</p>
          </div>
        </div>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">1. No-Return Policy for Bullion</h2>
            <p>Precious metals are commodities whose prices fluctuate with the open market. Because the value of silver can change significantly between the time of purchase and delivery, NOVARI PARTNERS LLC operates an <strong className="text-foreground">all-sales-final policy</strong> on all bullion coin orders. This is standard practice throughout the precious metals industry and protects both parties from market-risk arbitrage.</p>
            <p className="mt-2">By completing your purchase, you acknowledge and accept this policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">2. Order Cancellations</h2>
            <p>Orders may only be cancelled within <strong className="text-foreground">2 hours</strong> of placement and before the order has been dispatched for shipment. To request a cancellation, contact us immediately at <a href="mailto:contact@novaripartnersllc.com" className="text-primary hover:underline">contact@novaripartnersllc.com</a> or <a href="tel:+19177644680" className="text-primary hover:underline">+1 (917) 764-4680</a>.</p>
            <p className="mt-2">Cancelled orders may be subject to a <strong className="text-foreground">market-loss fee</strong> equal to the difference between the order price and the current spot price of silver at the time of cancellation, plus a processing fee. This fee reflects the market risk assumed by NOVARI PARTNERS LLC upon order confirmation.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">3. Exceptions — Damaged or Incorrect Items</h2>
            <p>While all bullion sales are final, we will issue a replacement or refund in the following limited circumstances:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li><strong className="text-foreground">Wrong item shipped:</strong> If you receive a coin that does not match your order, contact us within 5 business days of delivery.</li>
              <li><strong className="text-foreground">Damaged in transit:</strong> If your order arrives visibly damaged or opened, photograph the packaging immediately, do not accept or open the shipment further, and contact us within 24 hours. We will file an insurance claim and arrange a replacement.</li>
              <li><strong className="text-foreground">Counterfeit / authenticity concern:</strong> If you have genuine reason to believe a coin is not authentic, contact us within 5 business days of delivery. We will arrange for third-party authentication at our expense.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">4. Refund Processing</h2>
            <p>Approved refunds (under the exceptions above) will be processed to the original payment method within 5–10 business days of approval. Refund amounts will reflect the original purchase price, not the current market value of the metal.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">5. How to Contact Us</h2>
            <p>For all order concerns, please have your order number ready and contact us at:</p>
            <div className="mt-3 bg-card border border-border rounded-xl p-4">
              <p className="font-bold text-foreground mb-1">NOVARI PARTNERS LLC</p>
              <p>30 N Gould St Ste R, Sheridan, WY 82801</p>
              <p>Email: <a href="mailto:contact@novaripartnersllc.com" className="text-primary hover:underline">contact@novaripartnersllc.com</a></p>
              <p>Phone: <a href="tel:+19177644680" className="text-primary hover:underline">+1 (917) 764-4680</a></p>
              <p className="text-xs text-muted-foreground mt-2">Hours: Monday–Friday, 9:00 AM – 5:00 PM MT</p>
            </div>
          </section>

        </div>
      </div>
    </Layout>
  );
}
