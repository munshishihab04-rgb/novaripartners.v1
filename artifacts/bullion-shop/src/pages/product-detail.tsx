import { Layout } from "@/components/layout";
import { products } from "@/lib/data";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, ShieldCheck, Truck, Scale, Check,
  Award, Star, Info, ChevronDown, ChevronUp, ShoppingCart, Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail({ params }: { params: { id: string } }) {
  const product = products.find(p => p.id === params.id);
  const { addItem } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const [descExpanded, setDescExpanded] = useState(false);

  if (!product) {
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
    addItem({ id: product.id, name: product.name, price: product.price, quantity: qty, image: product.image, type: product.type, metal: product.metal });
    toast({ title: "Added to Cart", description: `${qty}× ${product.name} added to your cart.` });
  };

  const handleBuyNow = () => {
    addItem({ id: product.id, name: product.name, price: product.price, quantity: qty, image: product.image, type: product.type, metal: product.metal });
    setLocation("/checkout");
  };

  const lineTotal = (product.price * qty).toLocaleString("en-US", { minimumFractionDigits: 2 });
  const unitPrice = product.price.toLocaleString("en-US", { minimumFractionDigits: 2 });

  const badges = [
    { icon: ShieldCheck, label: "Authentic & Certified" },
    { icon: Truck, label: "Fully Insured Shipping" },
    { icon: Scale, label: "IRA Eligible" },
    { icon: Award, label: "US Mint Issued" },
  ];

  const highlights = [
    "One full troy ounce of .999 fine silver",
    "Official United States Mint legal-tender bullion",
    `${product.year} date — Brilliant Uncirculated (BU) grade`,
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
                src={product.image}
                alt={product.name}
                className="w-4/5 h-4/5 object-contain drop-shadow-2xl"
              />
              <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md tracking-wider">
                {product.year}
              </div>
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
              <span className="text-xs text-primary font-bold uppercase tracking-widest">{product.metal} · {product.type} · US Mint</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-foreground mb-4 leading-tight">{product.name}</h1>

            {/* Price block */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Price per coin</p>
                  <p className="text-3xl lg:text-4xl font-mono text-foreground font-bold">${unitPrice}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Spot Silver</p>
                  <p className="text-sm font-mono text-muted-foreground">~$31.20/oz</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Cash / Wire / Check price · Any quantity · Price includes handling premium</p>
            </div>

            {/* Description (collapsible on mobile) */}
            <div className="mb-5">
              <div className={`text-muted-foreground text-sm leading-relaxed ${!descExpanded ? "line-clamp-3 lg:line-clamp-none" : ""}`}>
                {product.description}
              </div>
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
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  size="lg"
                  className="h-13 bg-primary hover:bg-primary/90 text-white font-bold"
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
                  ["Year", product.year],
                  ["Metal Content", product.weight],
                  ["Purity", product.purity],
                  ["Mint", product.mint],
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
          <Button onClick={handleAddToCart} variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary/5 h-11 px-4 font-bold">
            <ShoppingCart className="w-4 h-4" />
          </Button>
          <Button onClick={handleBuyNow} size="sm" className="bg-primary hover:bg-primary/90 text-white h-11 px-6 font-bold flex-1">
            Buy Now
          </Button>
        </div>
      </div>

      {/* Bottom padding for sticky bar */}
      <div className="lg:hidden h-20" />
    </Layout>
  );
}
