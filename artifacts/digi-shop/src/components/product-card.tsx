import { Link } from "wouter";
import { Star, Monitor, Apple, MonitorSmartphone } from "lucide-react";
import { Product } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { useCurrency } from "@/lib/currency";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { format } = useCurrency();
  const PlatformIcon = () => {
    switch (product.platform) {
      case "windows":
        return <Monitor className="w-3.5 h-3.5" />;
      case "macos":
        return <Apple className="w-3.5 h-3.5" />;
      case "cross-platform":
        return <MonitorSmartphone className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group h-full"
    >
      <Link href={`/products/${product.id}`} className="block h-full">
        <div className="h-full flex flex-col bg-white rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1">
          <div className="aspect-[4/3] bg-muted/20 relative overflow-hidden flex items-center justify-center p-8 group-hover:bg-muted/30 transition-colors">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500 mix-blend-multiply" 
              />
            ) : (
              <div className="w-24 h-24 bg-primary/5 rounded-2xl flex items-center justify-center text-primary font-bold text-3xl shadow-sm border border-primary/10">
                {product.name.charAt(0)}
              </div>
            )}
            
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <div className="bg-white border border-border/60 rounded px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex gap-1.5 items-center shadow-sm">
                <PlatformIcon />
                {product.platform}
              </div>
            </div>

            {product.originalPrice && product.originalPrice > product.price && (
              <div className="absolute top-3 right-3 bg-green-500 text-white rounded px-2 py-1 text-xs font-bold shadow-sm">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </div>
            )}
          </div>

          <div className="flex-1 p-5 flex flex-col">
            <div className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">{product.publisher}</div>
            <h3 className="font-semibold text-base leading-snug mb-3 text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
            
            <div className="flex items-center gap-1 mt-auto">
              <div className="flex text-amber-400">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="text-sm font-semibold text-foreground ml-1">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground ml-1">({product.reviewCount})</span>
            </div>
          </div>

          <div className="px-5 pb-5 pt-0 mt-auto flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-mono line-through mb-0.5">
                {product.originalPrice ? format(product.originalPrice) : ""}
              </span>
              <span className="text-xl font-bold font-mono text-primary">
                {format(product.price)}
              </span>
            </div>
            
            <div className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
              View Details →
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}