import { Link } from "wouter";
import { Star, Monitor, Apple, MonitorSmartphone, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@workspace/api-client-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const PlatformIcon = () => {
    switch (product.platform) {
      case "windows":
        return <Monitor className="w-3 h-3" />;
      case "macos":
        return <Apple className="w-3 h-3" />;
      case "cross-platform":
        return <MonitorSmartphone className="w-3 h-3" />;
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
        <Card className="h-full flex flex-col overflow-hidden bg-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_-10px_hsl(var(--primary)/0.3)]">
          <div className="aspect-[4/3] bg-muted/30 relative overflow-hidden flex items-center justify-center p-6">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500" 
              />
            ) : (
              <div className="w-24 h-24 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-2xl">
                {product.name.charAt(0)}
              </div>
            )}
            
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border-border/50 font-mono text-[10px] uppercase tracking-wider text-muted-foreground flex gap-1.5 items-center py-1">
                <PlatformIcon />
                {product.platform}
              </Badge>
            </div>

            {product.originalPrice && product.originalPrice > product.price && (
              <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground font-mono font-bold">
                -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </Badge>
            )}
          </div>

          <CardContent className="flex-1 p-5 flex flex-col">
            <div className="text-xs font-mono text-primary mb-2 uppercase tracking-wider">{product.publisher}</div>
            <h3 className="font-semibold text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
            
            <div className="flex items-center gap-1.5 mt-auto pt-4">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground ml-1">({product.reviewCount})</span>
            </div>
          </CardContent>

          <CardFooter className="p-5 pt-0 border-t border-border/30 mt-auto flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-mono line-through">
                {product.originalPrice ? `${product.currency} ${product.originalPrice.toFixed(2)}` : ''}
              </span>
              <span className="text-xl font-bold font-mono text-foreground">
                {product.currency} {product.price.toFixed(2)}
              </span>
            </div>
            
            <Button size="icon" variant="secondary" className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}