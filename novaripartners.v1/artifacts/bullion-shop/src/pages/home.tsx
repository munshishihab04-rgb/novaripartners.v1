import { Layout } from "@/components/layout";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldCheck, TrendingUp, Lock, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";

type Review = {
  store_review_id: number;
  comments: string;
  rating: number;
  reviewer: { first_name: string; last_name: string; verified_buyer: string };
  date_formatted: string;
  timeago: string;
};

type FeaturedProduct = {
  id: number;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  year: number | null;
};

export default function Home() {
  const [featured, setFeatured] = useState<FeaturedProduct[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<{ total: number; avg: string } | null>(null);

  useEffect(() => {
    // SEO
    document.title = "Buy American Silver Eagles | NovariPartners.com";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Buy 2020–2026 American Silver Eagle BU coins. .999 fine silver, fully insured shipping, transparent pricing. NovariPartners LLC.');
  }, []);

  useEffect(() => {
    fetch("https://api.reviews.io/merchant/reviews?store=novaripartners.com&page=1&per_page=6")
      .then(r => r.ok ? r.json() : null)
      .then((d: { reviews?: Review[]; stats?: { total_reviews: number; average_rating: string } } | null) => {
        if (d?.reviews) setReviews(d.reviews.filter(r => r.comments?.trim() && r.rating >= 4).slice(0, 6));
        if (d?.stats) setReviewStats({ total: d.stats.total_reviews, avg: d.stats.average_rating });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/products/featured")
      .then((res) => res.ok ? res.json() as Promise<FeaturedProduct[]> : Promise.resolve([]))
      .then((data) => setFeatured(data.slice(0, 4)))
      .catch(() => {});
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-900 py-24 sm:py-32 lg:pb-40 border-b border-gray-800">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1618044733300-9472054094ee?auto=format&fit=crop&q=80&w=2000"
            alt="Silver Bullion Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/50 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
              <Lock className="w-3 h-3" /> American Silver Eagles — 2020 to 2026
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif text-white leading-[1.1] mb-6">
              Invest in <span className="text-primary italic">Genuine Silver</span> from the US Mint
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-10 leading-relaxed font-light max-w-xl">
              NOVARI PARTNERS LLC offers Brilliant Uncirculated American Silver Eagle coins for every year from 2020 to 2026. Fully insured, discreetly shipped to your door.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/catalog">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-primary hover:bg-primary/90 text-white font-bold">
                  Shop Silver Eagles
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-8 border-white/20 text-white hover:bg-white/5">
                  About NOVARI PARTNERS
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="border-b border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: "100% Authentic — US Mint", desc: "Every coin is sourced directly from authorized US Mint distributors. Sealed and verified." },
              { icon: Lock, title: "Secure & Insured Delivery", desc: "Discreet, tamper-evident packaging. Fully insured from our door to yours." },
              { icon: TrendingUp, title: "Transparent Market Pricing", desc: "Small, honest premiums over spot. No hidden fees, no bait-and-switch." }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 bg-background rounded-lg border border-border shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-xl text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">American Silver Eagles</p>
              <h2 className="text-3xl font-serif text-foreground mb-2">Featured Coins</h2>
              <p className="text-muted-foreground">BU quality — .999 fine silver — straight from the US Mint.</p>
            </div>
            <Link href="/catalog" className="hidden sm:flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium">
              View all years <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group border border-border bg-card rounded-lg overflow-hidden hover:border-primary/60 hover:shadow-md transition-all"
              >
                <Link href={`/products/${product.slug}`}>
                  <div className="aspect-square bg-gray-50 p-8 relative overflow-hidden">
                    <img
                      src={product.imageUrl || "/bullion-shop/silver-coin.png"}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.year && (
                      <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
                        {product.year}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="text-xs text-primary font-bold uppercase tracking-wider mb-2">Silver • 1 Troy Oz</div>
                    <h3 className="font-serif text-base text-foreground mb-4 line-clamp-2 h-12 group-hover:text-primary transition-colors">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-mono text-foreground font-semibold">${product.price.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 sm:hidden">
            <Link href="/catalog">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold">
                View all years
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews.io Section */}
      {reviews.length > 0 && (
        <section className="py-20 bg-gray-50 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Verified Buyers</p>
              <h2 className="text-3xl font-serif text-foreground mb-2">What Our Customers Say</h2>
              {reviewStats && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-5 h-5 ${ parseFloat(reviewStats.avg) >= s ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="font-bold text-foreground">{reviewStats.avg}</span>
                  <span className="text-muted-foreground text-sm">· {reviewStats.total.toLocaleString()} verified reviews</span>
                  <a href="https://www.reviews.io/company-reviews/store/novaripartners.com" target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline ml-1">See all →</a>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review, i) => (
                <motion.div
                  key={review.store_review_id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white border border-border rounded-lg p-6 shadow-sm"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${review.rating >= s ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-foreground text-sm leading-relaxed mb-4 line-clamp-4">&ldquo;{review.comments}&rdquo;</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{review.reviewer.first_name} {review.reviewer.last_name}</p>
                      {review.reviewer.verified_buyer === 'yes' && (
                        <p className="text-xs text-green-600 font-medium flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Verified Buyer</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{review.timeago}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <a href="https://www.reviews.io/company-reviews/store/novaripartners.com" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white font-semibold px-8">
                  Read All {reviewStats?.total.toLocaleString()} Reviews on Reviews.io
                </Button>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* IRA Banner */}
      <section className="bg-primary/5 border-t border-primary/20 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">IRA Eligible</p>
          <h3 className="text-2xl font-serif text-foreground mb-3">American Silver Eagles qualify for Precious Metals IRAs</h3>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">All coins meet IRS fineness requirements (.999) for self-directed IRA inclusion. Contact us for IRA custodian referrals.</p>
          <Link href="/catalog">
            <Button className="bg-primary hover:bg-primary/90 text-white font-bold px-8">
              Shop All Years
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
