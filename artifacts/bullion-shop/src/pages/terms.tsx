import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { FileText } from "lucide-react";

export default function Terms() {
  return (
    <Layout>
      <div className="bg-gray-50 border-b border-border py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span>Terms &amp; Conditions</span>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-serif text-foreground">Terms &amp; Conditions</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-2">Last updated: May 2, 2026 · NOVARI PARTNERS LLC</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl py-10">
        <div className="prose prose-slate max-w-none space-y-8 text-sm text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">1. Agreement to Terms</h2>
            <p>By accessing or using the NOVARI PARTNERS LLC website ("Site") and placing any order, you agree to be bound by these Terms &amp; Conditions. If you do not agree, do not use the Site. NOVARI PARTNERS LLC reserves the right to update these terms at any time without prior notice.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">2. Company Information</h2>
            <p>NOVARI PARTNERS LLC is a Wyoming limited liability company registered to do business in the United States.</p>
            <p className="mt-2"><strong className="text-foreground">Address:</strong> 30 N Gould St Ste R, Sheridan, WY 82801, United States<br />
            <strong className="text-foreground">Phone:</strong> +1 (917) 764-4680<br />
            <strong className="text-foreground">Email:</strong> contact@novaripartnersllc.com</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">3. Products &amp; Pricing</h2>
            <p>All products listed on the Site are United States Mint-issued precious metal bullion coins. Prices are denominated in US Dollars (USD) and reflect market premiums above the spot price of silver at the time of listing.</p>
            <p className="mt-2">Prices are subject to change without notice due to spot market volatility. The price displayed at the time of checkout is the final confirmed price. NOVARI PARTNERS LLC reserves the right to cancel any order if a pricing error has occurred.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">4. Order Acceptance</h2>
            <p>Submitting an order does not constitute a binding contract until NOVARI PARTNERS LLC sends a written order confirmation email. We reserve the right to refuse or cancel any order at our discretion, including but not limited to orders where payment cannot be verified, or where product availability has changed.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">5. Payment</h2>
            <p>We accept payment via major credit and debit cards through our secure, PCI-DSS certified payment processor. All card data is handled directly by the payment gateway and is never stored on our servers. By placing an order you authorize the charge to your payment method.</p>
            <p className="mt-2">Wire transfer, certified check, and money order payments may be available by contacting us directly. Orders paid by check or wire are held until funds are confirmed cleared.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">6. All Sales Final</h2>
            <p>Due to the spot-market nature of precious metals and price volatility, <strong className="text-foreground">all bullion sales are final</strong>. We do not accept returns or exchanges on bullion coins once an order has been confirmed and payment processed. Please see our <Link href="/returns" className="text-primary hover:underline">Returns Policy</Link> for more detail.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">7. Shipping &amp; Risk of Loss</h2>
            <p>All orders ship via insured, trackable carrier. Risk of loss passes to the buyer upon delivery confirmation. Please see our <Link href="/shipping" className="text-primary hover:underline">Shipping Policy</Link> for delivery timeframes and insurance details.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">8. Investment Risk Disclosure</h2>
            <p>Precious metals are commodities and their value fluctuates based on market conditions. Past performance is not indicative of future results. Nothing on this Site constitutes financial, investment, or tax advice. Consult a licensed financial advisor before making investment decisions.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">9. Anti-Money Laundering (AML) &amp; BSA Compliance</h2>
            <p>NOVARI PARTNERS LLC complies with the Bank Secrecy Act (BSA) and applicable anti-money laundering regulations. We are required to file Currency Transaction Reports (CTRs) for cash transactions exceeding $10,000 and Suspicious Activity Reports (SARs) when required. By placing an order, you certify that funds used for purchase are from legitimate sources.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">10. Tax Reporting</h2>
            <p>Precious metals transactions may be subject to IRS reporting requirements. Certain transactions may require submission of IRS Form 1099-B. It is your responsibility to comply with all applicable federal and state tax obligations related to your purchases. NOVARI PARTNERS LLC will issue required tax documents as mandated by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">11. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, NOVARI PARTNERS LLC shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Site or purchase of products. Our total liability shall not exceed the amount paid for the specific order giving rise to the claim.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">12. Governing Law</h2>
            <p>These Terms are governed by the laws of the State of Wyoming, United States, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Sheridan County, Wyoming.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">13. Contact</h2>
            <p>For questions about these Terms &amp; Conditions, please contact us at <a href="mailto:contact@novaripartnersllc.com" className="text-primary hover:underline">contact@novaripartnersllc.com</a> or call <a href="tel:+19177644680" className="text-primary hover:underline">+1 (917) 764-4680</a>.</p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
