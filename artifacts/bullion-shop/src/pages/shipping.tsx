import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Truck, ShieldCheck, Package, Clock } from "lucide-react";

export default function Shipping() {
  return (
    <Layout>
      <div className="bg-gray-50 border-b border-border py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span>Shipping Policy</span>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-serif text-foreground">Shipping Policy</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-2">Last updated: May 2, 2026 · NOVARI PARTNERS LLC</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl py-10">

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Clock, title: "Processing Time", body: "1–2 business days after payment clears" },
            { icon: Truck, title: "Delivery Time", body: "3–7 business days (continental US)" },
            { icon: ShieldCheck, title: "Insurance", body: "Full value, Lloyd's of London" },
          ].map((c, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 shadow-sm text-center">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <c.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground text-sm mb-1">{c.title}</h3>
              <p className="text-xs text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>

        <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">1. Processing Time</h2>
            <p>Orders are processed within 1–2 business days of payment confirmation. Orders paid by credit/debit card are confirmed immediately. Orders paid by check or wire transfer are held until funds are confirmed cleared, which may take 5–7 business days.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">2. Delivery Methods</h2>
            <p>All precious metals shipments are sent via USPS Priority Mail Registered, UPS, or FedEx with signature confirmation required upon delivery. The carrier and service level are selected based on order value and destination to ensure optimal security.</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 font-bold text-foreground border-b border-border">Order Value</th>
                    <th className="text-left px-3 py-2 font-bold text-foreground border-b border-border">Shipping Cost</th>
                    <th className="text-left px-3 py-2 font-bold text-foreground border-b border-border">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-3 py-2">Under $500</td>
                    <td className="px-3 py-2">$25.00</td>
                    <td className="px-3 py-2">Insured Priority Mail / UPS</td>
                  </tr>
                  <tr className="bg-primary/5">
                    <td className="px-3 py-2 text-primary font-bold">$500 and above</td>
                    <td className="px-3 py-2 text-primary font-bold">FREE</td>
                    <td className="px-3 py-2">Insured Priority Mail / UPS</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">3. Insurance Coverage</h2>
            <p>Every shipment is fully insured through Lloyd's of London for the full market value of the coins at time of shipment. Insurance coverage is included in the shipping cost — there is no additional charge. Coverage applies from the moment the package leaves our facility until delivery is confirmed.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">4. Discreet Packaging</h2>
            <p>All orders ship in discreet, plain outer packaging with no indication of contents. Inner packaging uses tamper-evident materials and protective coin capsules to maintain Brilliant Uncirculated (BU) condition during transit.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">5. Signature Required</h2>
            <p>A valid signature is required upon delivery for all bullion orders. If you are not available to sign, the carrier will leave a notice and attempt re-delivery up to 3 times. Please ensure someone is available at the shipping address during delivery windows.</p>
            <p className="mt-2"><strong className="text-foreground">We cannot ship to PO Boxes.</strong> A physical street address is required for all orders.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">6. Shipping Destinations</h2>
            <p>We currently ship to all 50 US states and Washington, D.C. We do not ship internationally at this time. For international inquiries, please contact us at <a href="mailto:contact@novaripartnersllc.com" className="text-primary hover:underline">contact@novaripartnersllc.com</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">7. Tracking</h2>
            <p>A tracking number will be emailed to you once your order ships. You can use this number to monitor delivery status on the carrier's website. Expected delivery is 3–7 business days from ship date for continental US addresses; Hawaii and Alaska may require additional transit time.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">8. Lost or Damaged Shipments</h2>
            <p>In the unlikely event of a lost or damaged shipment, please contact us immediately at <a href="mailto:contact@novaripartnersllc.com" className="text-primary hover:underline">contact@novaripartnersllc.com</a> or <a href="tel:+19177644680" className="text-primary hover:underline">+1 (917) 764-4680</a>. We will file an insurance claim on your behalf and work to resolve the issue promptly.</p>
          </section>

        </div>
      </div>
    </Layout>
  );
}
