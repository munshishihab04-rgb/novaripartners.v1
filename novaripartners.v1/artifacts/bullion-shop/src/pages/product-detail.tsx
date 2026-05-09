import { Layout } from "@/components/layout";
import { useCart } from "@/hooks/use-cart";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, ShieldCheck, Truck, Scale, Check,
  Award, Star, Info, ChevronDown, ChevronUp, ShoppingCart, Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ProductData = {
  id: number;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  currency: string;
  imageUrl: string | null;
  publisher: string;
  version: string;
  year: number | null;
  inStock: boolean;
  isFeatured: boolean;
  published: boolean;
  features: string[];
  deliveryMethod: string;
};

export default function ProductDetail({ params }: { params: { id: string } }) {
  const { addItem } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const [descExpanded, setDescExpanded] = useState(false);

  // Quantity discount tiers — loaded from API
  type DiscountTier = { minQty: number; maxQty: number | null; discountPercent: number; label: string };
  const [discountTiers, setDiscountTiers] = useState<DiscountTier[]>([
    { minQty: 1, maxQty: 4, discountPercent: 0, label: "1–4 coins" },
    { minQty: 5, maxQty: 9, discountPercent: 3, label: "5–9 coins" },
    { minQty: 10, maxQty: 19, discountPercent: 6, label: "10–19 coins" },
    { minQty: 20, maxQty: null, discountPercent: 10, label: "20+ coins" },
  ]);

  useEffect(() => {
    fetch("/api/discount-tiers")
      .then(r => r.ok ? r.json() : null)
      .then((d: DiscountTier[] | null) => { if (d?.length) setDiscountTiers(d); })
      .catch(() => {});
  }, []);

  const activeTier = (product: ProductData | null) => discountTiers.find(t => qty >= t.minQty && (t.maxQty === null || qty <= t.maxQty)) || discountTiers[0];
  const getDiscountedPrice = (p: ProductData | null) => p ? Math.round(p.price * (1 - ((activeTier(p)?.discountPercent ?? 0) / 100)) * 100) / 100 : 0;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [silverSpot, setSilverSpot] = useState<number | null>(null);

  const slug = params.id;

  useEffect(() => {
    fetch("/api/config")
      .then(r => r.ok ? r.json() : null)
      .then((d: { spotPrices?: { silver: number } } | null) => {
        if (d?.spotPrices?.silver) setSilverSpot(d.spotPrices.silver);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | NovariPartners.com`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', product.shortDescription || `Buy ${product.name} — .999 fine silver, BU quality, fully insured shipping. NovariPartners LLC.`);
    }
  }, [product]);

  // JSON-LD Product schema per SEO (description da DB, non mostrata in UI)
  useEffect(() => {
    if (!product) return;
    const existing = document.getElementById('product-jsonld');
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.id = 'product-jsonld';
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "Product",
      name: product.name,
      description: product.description || product.shortDescription,
      image: product.imageUrl ? [`https://novaripartners.com${product.imageUrl}`] : [],
      sku: `ASE-${product.year}-BU`,
      brand: { "@type": "Brand", name: "United States Mint" },
      offers: {
        "@type": "Offer",
        url: `https://novaripartners.com/products/${product.slug}`,
        priceCurrency: "USD",
        price: product.price,
        priceValidUntil: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        seller: { "@type": "Organization", name: "Novari Partners LLC" }
      },
      material: ".999 Fine Silver",
      additionalProperty: [
        { "@type": "PropertyValue", name: "Weight", value: "1 Troy Ounce" },
        { "@type": "PropertyValue", name: "Purity", value: ".999 Fine Silver" },
        { "@type": "PropertyValue", name: "Diameter", value: "40.6 mm" },
        { "@type": "PropertyValue", name: "Mint", value: "United States Mint" },
        { "@type": "PropertyValue", name: "Year", value: String(product.year) }
      ]
    });
    document.head.appendChild(script);
    return () => { document.getElementById('product-jsonld')?.remove(); };
  }, [product]);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetch(`/api/products/by-slug/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) throw new Error("Server error");
        const data = await res.json() as ProductData;
        setProduct(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="bg-gray-50 border-b border-border py-3">
          <div className="container mx-auto px-4">
            <Link href="/catalog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
            </Link>
          </div>
        </div>
        <div className="container mx-auto px-4 py-24 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-pulse">
            <div className="aspect-square bg-gray-100 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-100 rounded w-32" />
              <div className="h-10 bg-gray-100 rounded w-3/4" />
              <div className="h-24 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (notFound || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-serif text-foreground mb-4">Product Not Found</h1>
          <Link href="/catalog"><Button variant="outline">Return to Catalog</Button></Link>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.slug,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      image: product.imageUrl || "/bullion-shop/silver-coin.png",
      type: "Coins",
      metal: "Silver",
    });
    toast({ title: "Added to Cart", description: `${qty}× ${product.name} added to your cart.` });
  };

  const handleBuyNow = () => {
    addItem({
      id: product.slug,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      image: product.imageUrl || "/bullion-shop/silver-coin.png",
      type: "Coins",
      metal: "Silver",
    });
    setLocation("/checkout");
  };

  const currentTier = activeTier(product);
  const discountedPrice = getDiscountedPrice(product);
  const lineTotal = (discountedPrice * qty).toLocaleString("en-US", { minimumFractionDigits: 2 });
  const unitPrice = discountedPrice.toLocaleString("en-US", { minimumFractionDigits: 2 });

  const badges = [
    { icon: ShieldCheck, label: "Authentic & Certified" },
    { icon: Truck, label: "Fully Insured Shipping" },
    { icon: Scale, label: "IRA Eligible" },
    { icon: Award, label: "US Mint Issued" },
  ];

  const highlights = product.features.length > 0
    ? product.features
    : [
        "One full troy ounce of .999 fine silver",
        "Official United States Mint legal-tender bullion",
        `${product.year ?? ""} date — Brilliant Uncirculated (BU) grade`,
        "Ships in tamper-evident protective capsule",
        "IRS Form 1099-B compliant",
      ];

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-border py-3">
        <div className="container mx-auto px-4">
          <Link href="/catalog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 lg:py-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-16">

          {/* ── IMAGE COLUMN ── */}
          <div className="mb-6 lg:mb-0">
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-border overflow-hidden aspect-square flex items-center justify-center shadow-md">
              <img
                src={product.imageUrl || "/bullion-shop/silver-coin.png"}
                alt={product.name}
                className="w-4/5 h-4/5 object-contain drop-shadow-2xl"
              />
              {product.year && (
                <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md tracking-wider">
                  {product.year}
                </div>
              )}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border border-border text-xs font-bold text-foreground px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-primary text-primary" /> BU Grade
              </div>
            </div>

            {/* Trust badges — visible on mobile below image */}
            <div className="grid grid-cols-2 gap-2 mt-4 lg:hidden">
              {badges.map((b, i) => (
                <div key={i} className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2.5 shadow-sm">
                  <b.icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-xs text-muted-foreground font-medium">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── DETAILS COLUMN ── */}
          <div className="flex flex-col">
            {/* Category */}
            <div className="mb-2">
              <span className="text-xs text-primary font-bold uppercase tracking-widest">Silver · Coins · US Mint</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-foreground mb-4 leading-tight">{product.name}</h1>

            {/* Price block */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5">
              <div className="flex items-end gap-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Price per coin</p>
                  <p className="text-3xl lg:text-4xl font-mono text-foreground font-bold">${unitPrice}</p>
                  {(currentTier ? currentTier.discountPercent / 100 : 0 ?? 0) > 0 && (
                    <p className="text-xs text-muted-foreground line-through mt-0.5">${product.price.toFixed(2)}</p>
                  )}
                </div>
                {(currentTier ? currentTier.discountPercent / 100 : 0 ?? 0) > 0 && (
                  <div className="mb-1">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      -{Math.round((currentTier ? currentTier.discountPercent / 100 : 0 ?? 0) * 100)}% bulk discount
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Price includes handling premium · Free shipping over $500</p>
            </div>

            {/* Volume discount tiers */}
            <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">🏷️ Volume Discounts</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {discountTiers.map(tier => (
                  <div key={tier.minQty} className={`text-center p-2 rounded-lg border text-xs transition-all ${
                    qty >= tier.minQty && (tier.maxQty === null || qty <= tier.maxQty)
                      ? 'bg-amber-500 border-amber-500 text-white font-bold'
                      : 'bg-white border-amber-200 text-amber-900'
                  }`}>
                    <p className="font-semibold">{tier.label}</p>
                    {tier.discountPercent > 0
                      ? <p>-{tier.discountPercent}% off</p>
                      : <p>Base price</p>
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* Out of stock banner */}
            {!product.inStock && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
                <p className="text-sm text-amber-700 font-medium">This coin is currently out of stock. Check back soon or browse other years.</p>
              </div>
            )}

            {/* Description */}
            <div className="mb-5">
              <div
                className={`prose prose-sm max-w-none text-muted-foreground text-sm leading-relaxed ${!descExpanded ? 'line-clamp-4 lg:line-clamp-none' : ''}`}
                dangerouslySetInnerHTML={{ __html: product.shortDescription }}
              />
              <button
                className="lg:hidden flex items-center gap-1 text-primary text-xs font-medium mt-1.5"
                onClick={() => setDescExpanded(!descExpanded)}
              >
                {descExpanded ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Read more</>}
              </button>
            </div>

            {/* Highlights */}
            <div className="bg-card border border-border rounded-xl p-4 mb-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> What You Get</p>
              <ul className="space-y-2">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity + CTA */}
            <div className="bg-card border border-border rounded-xl p-4 mb-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-foreground">Quantity</span>
                <div className="flex items-center border border-input rounded-lg overflow-hidden bg-background">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-muted transition-colors text-xl font-light active:bg-muted/80"
                  >−</button>
                  <input
                    type="number"
                    value={qty}
                    onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 h-11 text-center bg-transparent text-foreground border-x border-input focus:outline-none text-sm font-bold"
                    min="1"
                  />
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-11 h-11 flex items-center justify-center text-foreground hover:bg-muted transition-colors text-xl font-light active:bg-muted/80"
                  >+</button>
                </div>
              </div>

              {qty > 1 && (
                <div className="flex justify-between text-xs text-muted-foreground mb-3 px-1">
                  <span>{qty} coins × ${unitPrice}</span>
                  <span className="font-bold text-foreground">${lineTotal} total</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  size="lg"
                  className="h-13 font-bold border-primary/40 text-primary hover:bg-primary/5 hover:border-primary"
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  size="lg"
                  className="h-13 bg-primary hover:bg-primary/90 text-white font-bold"
                  disabled={!product.inStock}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Buy Now
                </Button>
              </div>

              {qty >= 10 && (
                <p className="text-xs text-center text-primary mt-2 font-medium">Bulk order — contact us for volume pricing.</p>
              )}
            </div>

            {/* Trust badges desktop */}
            <div className="hidden lg:grid grid-cols-2 gap-3 mb-5">
              {badges.map((b, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-gray-50 border border-border rounded-xl px-3 py-3">
                  <b.icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-xs text-muted-foreground font-medium">{b.label}</span>
                </div>
              ))}
            </div>

            {/* Specifications */}
            <div>
              <h3 className="text-foreground font-serif text-lg mb-3 border-b border-border pb-2">Specifications</h3>
              <dl className="divide-y divide-border text-sm">
                {[
                  ["Year", product.year ?? "—"],
                  ["Metal Content", "1 Troy oz"],
                  ["Purity", ".999 fine silver"],
                  ["Mint", product.publisher],
                  ["Grade", "Brilliant Uncirculated (BU)"],
                  ["Face Value", "$1 USD (legal tender)"],
                  ["Diameter", "40.6 mm"],
                  ["Thickness", "2.98 mm"],
                ].map(([label, value]) => (
                  <div key={String(label)} className="py-2.5 flex justify-between items-center">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-foreground font-medium text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* Why Invest Section */}
        <div className="mt-12 lg:mt-16 border-t border-border pt-10">
          <h2 className="text-2xl font-serif text-foreground mb-6 text-center">Why the American Silver Eagle?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Legal Tender", body: "Backed by the full faith of the US government. Carries a $1 face value and is official currency." },
              { title: "IRA Eligible", body: "Qualifies for Precious Metals IRAs under IRS guidelines. Diversify your retirement portfolio with physical silver." },
              { title: "Universal Liquidity", body: "The world's most recognized silver coin. Easily sold or traded at any reputable dealer worldwide." },
              { title: ".999 Fine Silver", body: "Among the purest silver coins minted. Each coin contains exactly one troy ounce of .999 fine silver." },
              { title: "Insured Delivery", body: "Every shipment is fully insured through Lloyd's of London and shipped in tamper-evident packaging." },
              { title: "Guaranteed Authentic", body: "Every coin is verified for authenticity before shipment. Certificate available on request." },
            ].map((item, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <h4 className="font-serif font-bold text-foreground mb-1.5 text-sm">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-2xl p-3 safe-area-inset-bottom">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground leading-none mb-0.5">Total for {qty} coin{qty > 1 ? "s" : ""}</p>
            <p className="text-lg font-mono font-bold text-foreground">${lineTotal}</p>
          </div>
          <Button onClick={handleAddToCart} variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/5 h-11 px-4 font-bold" disabled={!product.inStock}>
            <ShoppingCart className="w-4 h-4" />
          </Button>
          <Button onClick={handleBuyNow} size="sm" className="bg-primary hover:bg-primary/90 text-white h-11 px-6 font-bold flex-1" disabled={!product.inStock}>
            Buy Now
          </Button>
        </div>
      </div>

      {/* Bottom padding for sticky bar */}
      <div className="lg:hidden h-20" />
    </Layout>
  );
}
