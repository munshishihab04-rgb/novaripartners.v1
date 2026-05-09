import { Layout } from "@/components/layout";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowRight, ShieldCheck, ShoppingCart, Tag, X } from "lucide-react";
import { useState } from "react";

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, total, couponDiscount, appliedCoupon, couponLoading, couponError, applyCouponCode, removeCoupon } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const shipping = total > 500 ? 0 : 25;
  const totalSavings = items.reduce((acc, item) => {
    const orig = item.originalPrice ?? item.price;
    return acc + (orig - item.price) * item.quantity;
  }, 0);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-serif text-foreground mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-serif text-foreground mb-4">Your cart is empty.</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Browse our collection of Brilliant Uncirculated American Silver Eagles from 2020 to 2026.
            </p>
            <Link href="/catalog">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8">
                Explore Catalog
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="flex-1">
              <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                <div className="divide-y divide-border">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center">
                      <div className="col-span-6 flex items-center gap-4 w-full">
                        <div className="w-20 h-20 bg-gray-50 rounded border border-border flex-shrink-0 p-2">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <Link href={`/products/${item.id}`} className="font-serif text-foreground hover:text-primary transition-colors line-clamp-2 text-sm font-medium">
                            {item.name}
                          </Link>
                          <div className="text-xs text-muted-foreground mt-1">{item.metal} • .999 Fine Silver</div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-xs text-destructive hover:text-destructive/80 mt-2 flex items-center gap-1 sm:hidden"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </div>

                      <div className="col-span-2 text-center w-full flex justify-between sm:block">
                        <span className="sm:hidden text-muted-foreground text-sm">Price:</span>
                        <span className="font-mono text-foreground">${item.price.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                      </div>

                      <div className="col-span-2 flex justify-center w-full sm:w-auto">
                        <div className="flex items-center border border-input rounded bg-background w-full sm:w-auto">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 text-muted-foreground hover:text-foreground transition-colors"
                          >-</button>
                          <span className="w-10 text-center text-foreground text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 text-muted-foreground hover:text-foreground transition-colors"
                          >+</button>
                        </div>
                      </div>

                      <div className="col-span-2 flex justify-between sm:justify-end items-center w-full">
                        <span className="sm:hidden text-muted-foreground text-sm">Total:</span>
                        <div className="flex items-center gap-4">
                          <span className="font-mono text-foreground font-semibold">${(item.price * item.quantity).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive hidden sm:block transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-24 shadow-sm">
                <h3 className="text-xl font-serif text-foreground mb-6 pb-4 border-b border-border">Order Summary</h3>

                {/* Coupon input */}
                <div className="mb-4">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 text-green-700 text-sm">
                        <Tag className="w-3.5 h-3.5" />
                        <span className="font-medium">{appliedCoupon.code}</span>
                        <span>-${couponDiscount.toFixed(2)}</span>
                      </div>
                      <button onClick={removeCoupon} className="text-green-500 hover:text-green-700"><X className="w-3.5 h-3.5" /></button>
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
                      <Button size="sm" variant="outline" onClick={() => applyCouponCode(couponInput)} disabled={couponLoading} className="h-9 px-3 text-xs">
                        {couponLoading ? "..." : "Apply"}
                      </Button>
                    </div>
                  )}
                  {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                </div>

                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="text-foreground font-mono">${subtotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>🏷️ Volume discount</span>
                      <span className="font-mono">-${totalSavings.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>🎟️ Coupon {appliedCoupon.code}</span>
                      <span className="font-mono">-${couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping & Insurance</span>
                    <span className="text-foreground font-mono">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  {shipping > 0 && (
                    <div className="text-xs text-primary bg-primary/10 border border-primary/20 p-2 rounded">
                      Add ${(500 - total).toLocaleString('en-US')} more to qualify for free shipping.
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-foreground font-medium">Total</span>
                    <span className="text-2xl font-mono text-foreground font-bold">${(total + shipping).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-right">Prices fixed at checkout.</p>
                </div>

                <Link href="/checkout">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 text-base group">
                    Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Safe & Secure Checkout
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
