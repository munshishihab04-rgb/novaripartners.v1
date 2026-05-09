import { useCart } from "@/hooks/use-cart";
import { X, ShoppingCart, Trash2, Plus, Minus, ShieldCheck, Truck, ArrowRight, Tag } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, subtotal, total, updateQuantity, removeItem, appliedCoupon, couponLoading, couponError, applyCouponCode, removeCoupon, couponDiscount, shippingConfig } = useCart();
  const [, setLocation] = useLocation();
  const [couponInput, setCouponInput] = useState("");

  // Use real free threshold from admin (fallback 50000 cents = $500)
  const freeThresholdCents = shippingConfig.freeThresholdCents ?? 50000;
  const freeThreshold = freeThresholdCents / 100;

  const totalSavings = items.reduce((acc, item) => {
    const orig = (item as any).originalPrice ?? item.price;
    return acc + (orig - item.price) * item.quantity;
  }, 0);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-background z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-serif text-foreground font-bold">Your Cart</h2>
            {items.length > 0 && (
              <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {items.reduce((a, i) => a + i.quantity, 0)}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <ShoppingCart className="w-14 h-14 text-muted-foreground/30" />
            <p className="text-foreground font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Browse our silver coin collection</p>
            <Button onClick={() => { onClose(); setLocation("/catalog"); }} className="bg-primary text-white hover:bg-primary/90 mt-2">
              Browse Catalog <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <>  
            {/* Free shipping progress — threshold from admin */}
            {shippingConfig.hasFreeShipping && total < freeThreshold && (
              <div className="px-5 py-3 bg-primary/5 border-b border-border">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Add <span className="font-bold text-primary">${(freeThreshold - total).toFixed(2)}</span> more for free shipping</span>
                  <span>{Math.round((total / freeThreshold) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (total / freeThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            {shippingConfig.hasFreeShipping && total >= freeThreshold && (
              <div className="px-5 py-2 bg-green-50 border-b border-green-100 flex items-center gap-2">
                <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-700 font-medium">🎉 You qualify for free insured shipping!</p>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 bg-card border border-border rounded-xl p-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0 bg-muted"
                    onError={e => { (e.target as HTMLImageElement).src = "/bullion-shop/silver-coin.png"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-tight truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Silver · .999 Fine Silver</p>
                    <div className="flex items-center justify-between mt-2">
                      {/* Qty controls */}
                      <div className="flex items-center border border-input rounded-lg overflow-hidden bg-background">
                        <button
                          onClick={() => item.quantity <= 1 ? removeItem(item.id) : updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-foreground hover:bg-muted text-sm transition-colors"
                        >−</button>
                        <span className="w-8 text-center text-sm font-bold text-foreground">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-foreground hover:bg-muted text-sm transition-colors"
                        >+</button>
                      </div>
                      {/* Price */}
                      <div className="text-right">
                        <p className="text-sm font-bold font-mono text-foreground">
                          ${(item.price * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                        {(item as any).originalPrice && (item as any).originalPrice > item.price && (
                          <p className="text-xs text-muted-foreground line-through">
                            ${((item as any).originalPrice * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive p-1 self-start transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-5 py-4 space-y-3 bg-card/50">
              {/* Coupon input */}
              <div className="pt-1">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 text-green-700 text-sm">
                      <Tag className="w-3.5 h-3.5" />
                      <span className="font-medium">{appliedCoupon.code}</span>
                      <span className="text-green-600">-${couponDiscount.toFixed(2)}</span>
                    </div>
                    <button onClick={removeCoupon} className="text-green-500 hover:text-green-700 ml-2">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === "Enter" && applyCouponCode(couponInput)}
                      placeholder="Coupon code"
                      className="flex-1 h-9 px-3 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applyCouponCode(couponInput)}
                      disabled={couponLoading}
                      className="h-9 px-3 text-xs"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </Button>
                  </div>
                )}
                {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>🏷️ Volume discount</span>
                  <span className="font-mono">-${totalSavings.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>🎟️ Coupon {appliedCoupon.code}</span>
                  <span className="font-mono">-${couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span className="font-mono text-foreground">{"calculated at checkout"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-foreground font-bold text-base">Subtotal (excl. shipping)</span>
                <span className="text-xl font-mono font-bold text-foreground">
                  ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <Button
                onClick={() => { onClose(); setLocation("/checkout"); }}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 text-base rounded-xl"
              >
                Checkout <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <button onClick={onClose} className="w-full text-sm text-muted-foreground hover:text-foreground text-center py-1 transition-colors">
                Continue Shopping
              </button>

              <div className="flex items-center justify-center gap-4 pt-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Truck className="w-3.5 h-3.5 text-primary" />
                  <span>Fully Insured</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
