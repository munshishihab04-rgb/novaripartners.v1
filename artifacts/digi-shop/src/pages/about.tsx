import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { ShieldCheck, Zap, Key, Globe, Building2, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export function About() {
  return (
    <Layout>
      <div className="bg-muted/40 border-b border-border py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">About NexusKeys</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            We are a licensed Italian software reseller dedicated to making professional software accessible, affordable, and instantly available to businesses and individuals across Europe.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl py-16 space-y-16">
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Who We Are</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-muted-foreground leading-relaxed">
            <p>
              NexusKeys is operated by <strong className="text-foreground">DIGITALSOFT DI MUNSHI SHIHAB</strong>, a sole proprietorship registered in Bologna, Italy. We specialise in the legitimate resale of software license keys for industry-standard applications from publishers including Microsoft, Adobe, Autodesk, JetBrains, and Corel.
            </p>
            <p>
              Our mission is simple: professional software should not require a corporate budget. By sourcing genuine retail and volume licenses through authorised distribution channels, we are able to offer significant savings compared to publisher list prices — without compromising on authenticity or legality.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-8">Why Choose NexusKeys</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <ShieldCheck className="w-5 h-5" />,
                title: "100% Genuine Licenses",
                description:
                  "Every key sold by NexusKeys is genuine and sourced through lawful channels. We do not deal in counterfeit, grey-market, or cracked keys.",
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: "Instant Delivery",
                description:
                  "License keys are delivered to your inbox within minutes of a confirmed payment — no waiting, no shipping, no delays.",
              },
              {
                icon: <Key className="w-5 h-5" />,
                title: "Permanent Licenses",
                description:
                  "We offer lifetime activation keys where available, so you own your software outright with no recurring subscription fees.",
              },
              {
                icon: <Globe className="w-5 h-5" />,
                title: "EU-Compliant Selling",
                description:
                  "We operate in full compliance with EU consumer protection law, the GDPR, and Italian commercial regulations, including a transparent right of withdrawal policy.",
              },
              {
                icon: <Award className="w-5 h-5" />,
                title: "Competitive Pricing",
                description:
                  "Our pricing reflects genuine savings on publisher recommended retail prices. All discounts shown are calculated against the official publisher list price.",
              },
              {
                icon: <Building2 className="w-5 h-5" />,
                title: "Registered Italian Business",
                description:
                  "We are a formally registered Italian business with a VAT number, REA registration, and full accountability to Italian and EU commercial law.",
              },
            ].map((item, i) => (
              <div key={i} className="border border-border rounded-xl p-6 bg-white hover:shadow-md transition-shadow">
                <div className="bg-primary/10 text-primary p-2.5 rounded-lg w-fit mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Legal and Company Information</h2>
          <div className="border border-border rounded-xl overflow-hidden">
            {[
              ["Legal Name", "DIGITALSOFT DI MUNSHI SHIHAB"],
              ["Trading Name", "NexusKeys"],
              ["Business Type", "Ditta individuale (sole proprietorship)"],
              ["Registered Address", "Via Aldo Pio Manuzio 24, 40132 Bologna (BO), Italia"],
              ["VAT Number", "IT04358941203"],
              ["REA", "BO-588058"],
              ["Country of Registration", "Italy (European Union)"],
              ["Customer Support", "support@nexuskeys.com"],
              ["Privacy Enquiries", "privacy@nexuskeys.com"],
            ].map(([label, value], i) => (
              <div
                key={i}
                className={`grid grid-cols-2 sm:grid-cols-3 ${i !== 0 ? "border-t border-border" : ""}`}
              >
                <div className="col-span-1 bg-muted/30 px-5 py-3.5 text-sm font-medium text-muted-foreground">
                  {label}
                </div>
                <div className="col-span-1 sm:col-span-2 px-5 py-3.5 text-sm text-foreground">
                  {value}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-primary/5 border border-primary/20 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Browse our catalog of genuine software licenses and get your key delivered to your inbox in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalog">
              <Button size="lg" className="font-semibold px-8">
                Browse Catalog
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="font-semibold px-8">
                Contact Us
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
