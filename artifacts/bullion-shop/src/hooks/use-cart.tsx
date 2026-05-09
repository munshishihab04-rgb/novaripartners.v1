import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type ShippingConfig = {
  freeThresholdCents: number | null;
  hasFreeShipping: boolean;
};

export type CartItem = {
  id: string;
  productId?: number;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  type: string;
  metal: string;
};

export type AppliedCoupon = {
  code: string;
  type: "fixed" | "percent";
  value: string;
  discountCents: number;
};

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  // coupon
  appliedCoupon: AppliedCoupon | null;
  couponLoading: boolean;
  couponError: string;
  applyCouponCode: (code: string) => Promise<void>;
  removeCoupon: () => void;
  // shipping config
  shippingConfig: ShippingConfig;
  couponDiscount: number; // USD
  total: number;           // USD after coupon
}

const CartContext = createContext<CartContextValue | null>(null);

function saveToStorage(items: CartItem[]) {
  try { localStorage.setItem("goldvault_cart", JSON.stringify(items)); } catch {}
}
function saveCouponToStorage(c: AppliedCoupon | null) {
  try {
    if (c) localStorage.setItem("goldvault_coupon", JSON.stringify(c));
    else localStorage.removeItem("goldvault_coupon");
  } catch {}
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { const s = localStorage.getItem("goldvault_cart"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(() => {
    try { const s = localStorage.getItem("goldvault_coupon"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [shippingConfig, setShippingConfig] = useState<ShippingConfig>({ freeThresholdCents: 50000, hasFreeShipping: true });

  useEffect(() => {
    fetch("/api/shipping/config")
      .then(r => r.json())
      .then(d => setShippingConfig(d))
      .catch(() => {}); // keep default on error
  }, []);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      const next = existing
        ? prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity, price: item.price, originalPrice: item.originalPrice } : i)
        : [...prev, item];
      saveToStorage(next);
      return next;
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => { const next = prev.filter(i => i.id !== id); saveToStorage(next); return next; });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => { const next = prev.map(i => i.id === id ? { ...i, quantity } : i); saveToStorage(next); return next; });
  };

  const clearCart = () => { setItems([]); saveToStorage([]); setAppliedCoupon(null); saveCouponToStorage(null); };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Re-validate coupon when subtotal changes
  const applyCouponCode = useCallback(async (code: string) => {
    setCouponError("");
    if (!code.trim()) { setCouponError("Enter a coupon code"); return; }
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), cartTotalCents: Math.round(subtotal * 100) }),
      });
      const data = await res.json();
      if (data.valid) {
        const c: AppliedCoupon = { code: data.code, type: data.type, value: data.value, discountCents: data.discountCents };
        setAppliedCoupon(c);
        saveCouponToStorage(c);
        setCouponError("");
      } else {
        setCouponError(data.message || "Invalid coupon");
      }
    } catch { setCouponError("Network error"); }
    finally { setCouponLoading(false); }
  }, [subtotal]);

  const removeCoupon = () => { setAppliedCoupon(null); saveCouponToStorage(null); setCouponError(""); };

  const couponDiscount = appliedCoupon ? appliedCoupon.discountCents / 100 : 0;
  const total = Math.max(0, subtotal - couponDiscount);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      subtotal, itemCount,
      appliedCoupon, couponLoading, couponError,
      applyCouponCode, removeCoupon,
      couponDiscount, total,
      shippingConfig,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
