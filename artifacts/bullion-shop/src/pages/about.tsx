import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, Building, Scale, MapPin, Phone, Mail } from "lucide-react";

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gray-900 py-24 border-b border-gray-800">
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1621508643801-4be68b577421?auto=format&fit=crop&q=80&w=2000"
            alt="Silver Bullion"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        </div>
        <div className="container relative z-10 mx-auto px-4 max-w-4xl text-center">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">About Us</p>
          <h1 className="text-4xl sm:text-5xl font-serif text-white mb-6">NOVARI PARTNERS LLC</h1>
          <p className="text-lg text-gray-300 leading-relaxed font-light max-w-2xl mx-auto">
            A Wyoming-registered precious metals dealer specializing in Brilliant Uncirculated American Silver Eagle coins from the United States Mint.
          </p>
        </div>
      </section>

      {/* Contact Banner */}
      <section className="bg-primary/5 border-b border-primary/20 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>30 N Gould St Ste R, Sheridan, WY 82801, United States</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Phone className="w-4 h-4 text-primary" />
              <a href="tel:+19177644680" className="hover:text-primary transition-colors">+1 (917) 764-4680</a>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Mail className="w-4 h-4 text-primary" />
              <a href="mailto:contact@novaripartnersllc.com" className="hover:text-primary transition-colors">contact@novaripartnersllc.com</a>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-slate prose-lg max-w-none">
            <h2 className="font-serif text-3xl text-foreground mt-0">Our Mission</h2>
            <p className="text-muted-foreground">
              NOVARI PARTNERS LLC was founded with a single purpose: to make investment-grade silver bullion accessible to every American investor. We specialize exclusively in American Silver Eagle coins — the most recognizable and liquid silver bullion coins in the world — offering every year from 2020 through 2026 in Brilliant Uncirculated (BU) condition.
            </p>
            <p className="text-muted-foreground">
              We believe in total transparency. Our pricing is tied directly to the global silver spot market, with honest, published premiums. No hidden fees. No bait-and-switch. What you see is what you pay.
            </p>

            <h2 className="font-serif text-3xl text-foreground mt-12">The NOVARI PARTNERS Standard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 not-prose my-12">
              <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
                <ShieldCheck className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-serif text-foreground mb-2">Uncompromising Authenticity</h3>
                <p className="text-muted-foreground text-sm">Every American Silver Eagle is sourced directly from authorized US Mint distributors and ships in the original sealed packaging. All coins are government-guaranteed for weight and purity.</p>
              </div>
              <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
                <Lock className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-serif text-foreground mb-2">Discreet Fulfillment</h3>
                <p className="text-muted-foreground text-sm">Your privacy is paramount. All orders ship in nondescript, tamper-evident packaging. The return address never indicates the high-value nature of the contents.</p>
              </div>
              <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
                <Scale className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-serif text-foreground mb-2">Fair Market Pricing</h3>
                <p className="text-muted-foreground text-sm">Our premiums over spot are small, transparent, and published. We never hide fees or employ bait-and-switch tactics. The price shown is the price you pay.</p>
              </div>
              <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
                <Building className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-serif text-foreground mb-2">IRA Eligible Silver</h3>
                <p className="text-muted-foreground text-sm">American Silver Eagles meet the IRS fineness standard (.999) for Precious Metals IRAs. We can provide guidance on working with leading IRA custodians.</p>
              </div>
            </div>

            <h2 className="font-serif text-3xl text-foreground mt-12">Compliance & Reporting</h2>
            <p className="text-muted-foreground">
              NOVARI PARTNERS LLC operates in full compliance with all applicable federal and state regulations governing the sale of precious metals.
            </p>
            <ul>
              <li className="text-muted-foreground"><strong className="text-foreground">IRS Form 1099-B:</strong> We comply with all federal reporting requirements for reportable sales of precious metals.</li>
              <li className="text-muted-foreground"><strong className="text-foreground">Anti-Money Laundering (AML):</strong> We maintain a rigorous AML compliance program in accordance with the USA PATRIOT Act and FinCEN regulations.</li>
              <li className="text-muted-foreground"><strong className="text-foreground">Wyoming Registration:</strong> Registered in the State of Wyoming. Business name: NOVARI PARTNERS LLC, 30 N Gould St Ste R, Sheridan, WY 82801.</li>
            </ul>

            <h2 className="font-serif text-3xl text-foreground mt-12">Contact Us</h2>
            <div className="not-prose grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium text-foreground">Address</p>
                <p className="text-sm text-muted-foreground">30 N Gould St Ste R<br />Sheridan, WY 82801<br />United States</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-2">
                <Phone className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium text-foreground">Phone</p>
                <a href="tel:+19177644680" className="text-sm text-primary hover:text-primary/80">+1 (917) 764-4680</a>
              </div>
              <div className="bg-card border border-border rounded-lg p-5 flex flex-col gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium text-foreground">Email</p>
                <a href="mailto:contact@novaripartnersllc.com" className="text-sm text-primary hover:text-primary/80 break-all">contact@novaripartnersllc.com</a>
              </div>
            </div>

            <div className="mt-12 text-center not-prose p-12 bg-primary/5 border border-primary/20 rounded-lg">
              <h3 className="text-2xl font-serif text-foreground mb-4">Ready to start stacking?</h3>
              <p className="text-muted-foreground mb-6">Browse our full collection of American Silver Eagle BU coins, 2020–2026.</p>
              <Link href="/catalog">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8">
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
