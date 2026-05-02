import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, Building, Scale } from "lucide-react";

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-black py-24 border-b border-white/10">
        <div className="absolute inset-0 z-0 opacity-30">
          <img 
            src="https://images.unsplash.com/photo-1621508643801-4be68b577421?auto=format&fit=crop&q=80&w=2000" 
            alt="Vault Door" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
        </div>
        <div className="container relative z-10 mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl font-serif text-white mb-6">Built on Trust, Secured by Tradition</h1>
          <p className="text-lg text-gray-300 leading-relaxed font-light">
            Since 2005, GoldVault USA has been the discreet, trusted partner for American investors seeking to preserve their wealth in physical precious metals.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-invert prose-lg max-w-none">
            <h2 className="font-serif text-3xl text-white mt-0">Our Philosophy</h2>
            <p className="text-gray-300">
              In an era of digital digits and counterparty risk, physical gold and silver remain the ultimate store of value. At GoldVault USA, we believe that true wealth is something you can hold in your hand. We source exclusively from sovereign mints and LBMA-approved refiners to ensure absolute liquidity and uncompromised purity for our clients.
            </p>

            <h2 className="font-serif text-3xl text-white mt-12">The GoldVault Standard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 not-prose my-12">
              <div className="bg-card border border-white/10 p-6 rounded-lg">
                <ShieldCheck className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-serif text-white mb-2">Uncompromising Authenticity</h3>
                <p className="text-gray-400 text-sm">Every piece of bullion passes through our rigorous non-destructive assay protocol, utilizing XRF spectrometry and ultrasonic testing before it enters our vault.</p>
              </div>
              <div className="bg-card border border-white/10 p-6 rounded-lg">
                <Lock className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-serif text-white mb-2">Discreet Fulfillment</h3>
                <p className="text-gray-400 text-sm">Your privacy is paramount. All orders ship in nondescript, tamper-evident packaging. The return address never indicates the high-value nature of the contents.</p>
              </div>
              <div className="bg-card border border-white/10 p-6 rounded-lg">
                <Scale className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-serif text-white mb-2">Fair Market Pricing</h3>
                <p className="text-gray-400 text-sm">Our pricing algorithms are tied directly to the global spot markets. We maintain transparent premiums and never employ hidden fees or bait-and-switch tactics.</p>
              </div>
              <div className="bg-card border border-white/10 p-6 rounded-lg">
                <Building className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-serif text-white mb-2">IRA Eligible Assets</h3>
                <p className="text-gray-400 text-sm">We carry a vast selection of IRS-approved bullion suitable for inclusion in your Precious Metals IRA, partnering with America's leading gold IRA custodians.</p>
              </div>
            </div>

            <h2 className="font-serif text-3xl text-white mt-12">Compliance & Reporting</h2>
            <p className="text-gray-300">
              GoldVault USA operates in full compliance with all federal and state regulations. We are committed to maintaining the highest ethical standards in the industry.
            </p>
            <ul>
              <li className="text-gray-300"><strong>IRS Form 1099-B:</strong> We comply with all reporting requirements for reportable sales of specific precious metals by customers.</li>
              <li className="text-gray-300"><strong>Anti-Money Laundering (AML):</strong> We maintain a rigorous AML compliance program per the USA PATRIOT Act.</li>
              <li className="text-gray-300"><strong>Accreditation:</strong> We hold an A+ rating with the Better Business Bureau and are active members of the Industry Council for Tangible Assets (ICTA).</li>
            </ul>

            <div className="mt-16 text-center not-prose p-12 bg-card border border-white/10 rounded-lg">
              <h3 className="text-2xl font-serif text-white mb-4">Ready to secure your future?</h3>
              <Link href="/catalog">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-black font-bold px-8">
                  Browse Our Catalog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
