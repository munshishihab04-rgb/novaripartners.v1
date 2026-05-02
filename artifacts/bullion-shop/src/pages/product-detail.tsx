import { Layout } from "@/components/layout";
import { products } from "@/lib/data";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, Check, Truck, Scale } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail({ params }: { params: { id: string } }) {
  const product = products.find(p => p.id === params.id);
  const { addItem } = useCart();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-serif text-white mb-4">Product Not Found</h1>
          <Link href="/catalog">
            <Button variant="outline" className="border-white/20 text-white">Return to Catalog</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      image: product.image,
      type: product.type,
      metal: product.metal
    });
    toast({
      title: "Added to Cart",
      description: `${qty}x ${product.name} has been added to your vault.`,
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link href="/catalog" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Image */}
          <div className="bg-white rounded-lg p-12 aspect-square flex items-center justify-center border border-white/10 relative">
            <img 
              src={product.image} 
              alt={product.name} 
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <div className="mb-2">
              <span className="text-xs text-primary font-bold uppercase tracking-wider">{product.metal} • {product.type}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif text-white mb-6 leading-tight">{product.name}</h1>
            
            <div className="text-3xl font-mono text-white mb-8 pb-8 border-b border-white/10">
              ${product.price.toLocaleString('en-US', {minimumFractionDigits: 2})}
              <div className="text-sm text-gray-500 font-sans font-normal mt-2">Cash/Wire price. Any quantity.</div>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="bg-card border border-white/10 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Quantity</span>
                <div className="flex items-center border border-white/20 rounded bg-background">
                  <button 
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-4 py-2 text-white hover:bg-white/5 transition-colors"
                  >-</button>
                  <input 
                    type="number" 
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center bg-transparent text-white border-x border-white/20 py-2 focus:outline-none"
                    min="1"
                  />
                  <button 
                    onClick={() => setQty(qty + 1)}
                    className="px-4 py-2 text-white hover:bg-white/5 transition-colors"
                  >+</button>
                </div>
              </div>
              <Button 
                onClick={handleAddToCart}
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-14 text-lg"
              >
                Add to Vault
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-8">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>IRS Form 1099-B Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                <span>Fully Insured Transit</span>
              </div>
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                <span>IRA Eligible</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Guaranteed Authentic</span>
              </div>
            </div>

            <div>
              <h3 className="text-white font-serif text-xl mb-4 border-b border-white/10 pb-2">Specifications</h3>
              <dl className="divide-y divide-white/5">
                <div className="py-3 flex justify-between">
                  <dt className="text-gray-400">Metal Content</dt>
                  <dd className="text-white text-right font-medium">{product.weight}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-gray-400">Purity</dt>
                  <dd className="text-white text-right font-medium">{product.purity}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-gray-400">Mint / Brand</dt>
                  <dd className="text-white text-right font-medium">{product.mint}</dd>
                </div>
              </dl>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
