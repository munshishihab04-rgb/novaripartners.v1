import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Shield } from "lucide-react";

export default function Privacy() {
  return (
    <Layout>
      <div className="bg-gray-50 border-b border-border py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <span>Privacy Policy</span>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-serif text-foreground">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-2">Last updated: May 2, 2026 · NOVARI PARTNERS LLC</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl py-10">
        <div className="prose prose-slate max-w-none space-y-8 text-sm text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">1. Introduction</h2>
            <p>NOVARI PARTNERS LLC ("we", "us", "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains what information we collect, how we use it, and your rights.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">2. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li><strong className="text-foreground">Identity data:</strong> first name, last name.</li>
              <li><strong className="text-foreground">Contact data:</strong> email address, phone number, billing and shipping address.</li>
              <li><strong className="text-foreground">Transaction data:</strong> details of products purchased, order ID, and amount paid.</li>
              <li><strong className="text-foreground">Technical data:</strong> IP address, browser type, device information, pages visited.</li>
              <li><strong className="text-foreground">Usage data:</strong> how you interact with our Site.</li>
            </ul>
            <p className="mt-3">We do <strong className="text-foreground">not</strong> store credit/debit card numbers. All payment data is processed and stored by Nexi XPay in accordance with PCI DSS standards.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>To process and fulfill your orders and send confirmation emails.</li>
              <li>To comply with legal obligations, including BSA/AML reporting requirements.</li>
              <li>To issue required IRS tax documents (e.g., Form 1099-B).</li>
              <li>To contact you regarding your order, including shipping and delivery updates.</li>
              <li>To respond to customer service inquiries.</li>
              <li>To improve our website and services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">4. Legal Basis for Processing</h2>
            <p>We process your data under the following legal bases: (a) performance of a contract — to fulfill your purchase; (b) legal obligation — to comply with BSA/AML and IRS reporting laws; (c) legitimate interests — to improve our services and prevent fraud.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">5. Sharing Your Information</h2>
            <p>We do not sell or rent your personal data to third parties. We may share your data with:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-2">
              <li><strong className="text-foreground">Payment processors</strong> (Nexi XPay) to process your payment.</li>
              <li><strong className="text-foreground">Shipping carriers</strong> to deliver your order.</li>
              <li><strong className="text-foreground">Government authorities</strong> where required by law (e.g., IRS, FinCEN).</li>
              <li><strong className="text-foreground">Professional advisors</strong> (attorneys, accountants) under confidentiality obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">6. Data Retention</h2>
            <p>We retain your personal data for as long as necessary to fulfill the purposes described in this policy, including retention required by law. Transaction records are kept for a minimum of 5 years as required under BSA/AML regulations.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">7. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to access, correct, delete, or restrict processing of your personal data. To exercise your rights, contact us at <a href="mailto:contact@novaripartnersllc.com" className="text-primary hover:underline">contact@novaripartnersllc.com</a>.</p>
            <p className="mt-2">Note: certain data cannot be deleted where retention is legally required (e.g., BSA/AML transaction records).</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">8. Cookies</h2>
            <p>We use only essential cookies to maintain your shopping cart session. We do not use advertising, tracking, or analytics cookies. No third-party cookies are set on our Site.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">9. Security</h2>
            <p>We use industry-standard security measures including SSL/TLS encryption for data in transit. Access to personal data is restricted to authorized personnel only.</p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-foreground mb-3">10. Contact</h2>
            <p>NOVARI PARTNERS LLC · 30 N Gould St Ste R, Sheridan, WY 82801<br />
            Email: <a href="mailto:contact@novaripartnersllc.com" className="text-primary hover:underline">contact@novaripartnersllc.com</a><br />
            Phone: <a href="tel:+19177644680" className="text-primary hover:underline">+1 (917) 764-4680</a></p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
