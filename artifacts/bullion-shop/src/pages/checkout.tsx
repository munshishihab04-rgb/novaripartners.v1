import { Layout } from "@/components/layout";
import { useCart } from "@/hooks/use-cart";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef, useEffect, useCallback } from "react";
import { Lock, ShieldCheck, X, AlertTriangle, ExternalLink, Package, ShoppingCart, ArrowLeft, CreditCard, UserCircle, Users, ChevronRight, Eye, EyeOff } from "lucide-react";
import { isLoggedIn, getStoredUser, fetchWithAuth, setUserToken, setStoredUser } from "@/lib/user-auth";
import { USAddressFields, type AddressData } from "@/components/us-address-fields";
import { US_STATE_CODES, validateZip } from "@/lib/us-address-data";
import { FaCcVisa, FaCcMastercard, FaCcAmex } from "react-icons/fa";
import { FaGooglePay, FaApplePay } from "react-icons/fa6";

type OverlayState = "idle" | "loading" | "open" | "blocked";

export default function Checkout() {
  const { items, subtotal, total: cartTotal, clearCart, appliedCoupon, couponDiscount } = useCart();
  const [, setLocation] = useLocation();

  // Shipping
  type ShipMethod = { id: number; name: string; description: string | null; estimatedDays: string | null; priceCents: number; type: string; freeThresholdCents: number | null; };
  const [shippingMethods, setShippingMethods] = useState<ShipMethod[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/shipping/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtotalCents: Math.round(cartTotal * 100) }),
    })
      .then(r => r.json())
      .then((methods: (ShipMethod & { calculatedPriceCents: number })[]) => {
        setShippingMethods(methods);
        // Auto-select first (cheapest free if available, else first)
        if (methods.length > 0 && !selectedShippingId) {
          const free = methods.find(m => m.calculatedPriceCents === 0);
          setSelectedShippingId((free ?? methods[0]).id);
        }
      })
      .catch(() => {});
  }, [cartTotal]);

  const selectedMethod = shippingMethods.find(m => m.id === selectedShippingId);
  const shippingCents = (selectedMethod as any)?.calculatedPriceCents ?? 0;
  const total = cartTotal + shippingCents / 100;
  const totalSavings = items.reduce((acc, item) => { const orig = (item as any).originalPrice ?? item.price; return acc + (orig - item.price) * item.quantity; }, 0);

  // Account mode
  const [accountMode, setAccountMode] = useState<"choose" | "guest" | "login" | "register" | "loggedin">(
    isLoggedIn() ? "loggedin" : "choose"
  );
  const [authForm, setAuthForm] = useState({ email: "", password: "", confirmPassword: "", firstName: "", lastName: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showAuthPass, setShowAuthPass] = useState(false);
  const [loggedUser, setLoggedUser] = useState<any>(getStoredUser());

  const handleAuthLogin = async () => {
    setAuthError(""); setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ email: authForm.email, password: authForm.password }) });
      const d = await res.json();
      if (!res.ok) { setAuthError(d.error || "Login failed"); return; }
      setUserToken(d.token); setStoredUser(d.user); setLoggedUser(d.user);
      window.dispatchEvent(new Event("user-auth-changed"));
      // Pre-fill form
      setForm(prev => ({ ...prev, firstName: d.user.firstName||"", lastName: d.user.lastName||"", email: d.user.email }));
      setAccountMode("loggedin");
    } catch { setAuthError("Network error"); } finally { setAuthLoading(false); }
  };

  const handleAuthRegister = async () => {
    setAuthError(""); 
    if (authForm.password !== authForm.confirmPassword) { setAuthError("Passwords do not match"); return; }
    if (authForm.password.length < 8) { setAuthError("Password must be at least 8 characters"); return; }
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/register", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ email: authForm.email, password: authForm.password, firstName: authForm.firstName, lastName: authForm.lastName }) });
      const d = await res.json();
      if (!res.ok) { setAuthError(d.error || "Registration failed"); return; }
      setUserToken(d.token); setStoredUser(d.user); setLoggedUser(d.user);
      window.dispatchEvent(new Event("user-auth-changed"));
      setForm(prev => ({ ...prev, firstName: d.user.firstName||"", lastName: d.user.lastName||"", email: d.user.email }));
      setAccountMode("loggedin");
    } catch { setAuthError("Network error"); } finally { setAuthLoading(false); }
  };

  // ── Draft persistence ───────────────────────────────────────────────────
  const DRAFT_KEY = "novari_checkout_draft";
  const DRAFT_TTL = 48 * 3600 * 1000; // 48 hours
  const draftSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function loadDraft(): Partial<typeof defaultForm> | null {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.v || !parsed?.ts) return null;
      if (Date.now() - parsed.ts > DRAFT_TTL) { localStorage.removeItem(DRAFT_KEY); return null; }
      return parsed.data ?? null;
    } catch { return null; }
  }

  function saveDraft(data: typeof defaultForm) {
    try {
      // Never save payment data
      const safe = { firstName: data.firstName, lastName: data.lastName, email: data.email,
        phone: data.phone, address: data.address, address2: data.address2,
        city: data.city, state: data.state, zip: data.zip, country: data.country };
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ v: 1, ts: Date.now(), data: safe }));
    } catch { /* storage full or unavailable */ }
  }

  function clearDraft() {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  }

  const defaultForm = {
    firstName: "", lastName: "", email: "", phone: "",
    address: "", address2: "", city: "", state: "", zip: "", country: "United States",
  };

  const [form, setForm] = useState(() => {
    const draft = loadDraft();
    if (draft) return { ...defaultForm, ...draft };
    return defaultForm;
  });

  // Auto-save draft on form changes (debounced 500ms)
  useEffect(() => {
    if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current);
    draftSaveTimer.current = setTimeout(() => saveDraft(form), 500);
    return () => { if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current); };
  }, [form]);

  // Clear draft when cart is emptied
  useEffect(() => {
    if (items.length === 0) clearDraft();
  }, [items.length]);

  // Pre-fill from account default address if no draft and user is logged in
  useEffect(() => {
    if (!isLoggedIn()) return;
    const draft = loadDraft();
    if (draft && Object.values(draft).some(v => v)) return; // draft exists, keep it
    fetchWithAuth("/api/user/addresses")
      .then(r => r.json())
      .then((addrs: any[]) => {
        const def = addrs.find(a => a.is_default) ?? addrs[0];
        if (!def) return;
        setForm(prev => ({
          ...prev,
          firstName: prev.firstName || def.first_name || "",
          lastName: prev.lastName || def.last_name || "",
          address: prev.address || def.street || "",
          city: prev.city || def.city || "",
          state: prev.state || def.state || "",
          zip: prev.zip || def.zip || "",
          country: "United States",
        }));
      })
      .catch(() => {});
  }, [isLoggedIn()]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const [overlayState, setOverlayState] = useState<OverlayState>("idle");
  const [hostedPage, setHostedPage] = useState("");
  const [orderId, setOrderId] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const blockedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.lastName.trim()) errs.lastName = "Required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.address.trim()) errs.address = "Required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.state.trim()) errs.state = "State is required";
    else if (!US_STATE_CODES.has(form.state)) errs.state = "Select a valid US state";
    if (!form.zip.trim()) errs.zip = "ZIP code is required";
    else if (!validateZip(form.zip)) errs.zip = "Invalid ZIP (e.g. 12345 or 12345-6789)";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    setOverlayState("loading");

    try {
      const res = await fetch("/api/checkout/create-bullion-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: `${form.firstName.trim()} ${form.lastName.trim()}`,
          customerEmail: form.email.trim(),
          // Send productId (preferred) or id/slug fallback — NEVER send price
          items: items.map(i => ({
            ...(i.productId != null ? { productId: i.productId } : { slug: i.id }),
            quantity: i.quantity,
          })),
          // Coupon validated server-side — client cannot manipulate discount
          ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
          shippingMethodId: selectedShippingId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error || "An unexpected error occurred. Please try again.");
        setOverlayState("idle");
        return;
      }

      setOrderId(data.orderId);
      setHostedPage(data.hostedPage);
      clearDraft(); // clean up draft after successful order creation
      setOverlayState("open");
    } catch {
      setApiError("Could not connect to the payment gateway. Please try again.");
      setOverlayState("idle");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (overlayState !== "open" || !hostedPage) return;
    blockedTimer.current = setTimeout(() => {
      try {
        const doc = iframeRef.current?.contentDocument;
        if (!doc) setOverlayState("blocked");
      } catch {
        // SecurityError = cross-origin = Nexi loaded correctly
      }
    }, 5000);
    return () => { if (blockedTimer.current) clearTimeout(blockedTimer.current); };
  }, [overlayState, hostedPage]);

  const handleIframeLoad = () => {
    if (blockedTimer.current) clearTimeout(blockedTimer.current);
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc && doc.body && doc.body.innerHTML === "") setOverlayState("blocked");
    } catch {
      // cross-origin = loaded fine
    }
  };

  const handleIframeError = () => {
    if (blockedTimer.current) clearTimeout(blockedTimer.current);
    setOverlayState("blocked");
  };

  const handleFallbackRedirect = () => { window.location.href = hostedPage; };

  const handleCloseOverlay = () => {
    if (blockedTimer.current) clearTimeout(blockedTimer.current);
    setOverlayState("idle");
    setHostedPage("");
    setOrderId("");
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center max-w-lg">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-serif text-foreground mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Browse our Silver Eagle collection before checking out.</p>
          <Link href="/catalog">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8">Return to Catalog</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Nexi Payment Overlay */}
      {(overlayState === "loading" || overlayState === "open" || overlayState === "blocked") && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(10,12,20,0.85)", backdropFilter: "blur(6px)" }}>
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-border shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Secure Card Payment</p>
                <p className="text-xs text-slate-400">SSL encrypted · NOVARI PARTNERS LLC</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono font-bold text-slate-700">
                ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <button onClick={handleCloseOverlay} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 relative overflow-hidden">
            {overlayState === "loading" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                <p className="text-white/80 text-sm font-medium">Preparing your secure checkout…</p>
              </div>
            )}

            {overlayState === "open" && hostedPage && (
              <iframe
                ref={iframeRef}
                src={hostedPage}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                className="w-full h-full border-0"
                title="Nexi XPay Secure Payment"
                allow="payment"
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-forms allow-same-origin allow-top-navigation allow-popups"
              />
            )}

            {overlayState === "blocked" && (
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
                  <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-7 h-7 text-amber-500" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800 mb-2">Continue on Nexi</h2>
                  <p className="text-sm text-slate-500 mb-6">Click below to complete your payment on Nexi's secure page.</p>
                  <Button className="w-full mb-3 bg-primary hover:bg-primary/90 text-white" onClick={handleFallbackRedirect}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Complete Payment
                  </Button>
                  <button onClick={handleCloseOverlay} className="text-sm text-slate-400 hover:text-slate-600">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="bg-gray-50 border-b border-border py-6">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-3">
            <ArrowLeft className="w-4 h-4" /> Back to cart
          </Link>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <h1 className="text-2xl font-serif text-foreground">Secure Checkout</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">256-bit encrypted · Powered by Nexi XPay</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">

            {/* Account Mode Selector */}
            {accountMode === "choose" && (
              <div className="bg-card border border-border rounded-xl p-5 mb-6 shadow-sm">
                <h2 className="text-base font-semibold text-foreground mb-4">How would you like to checkout?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button type="button" onClick={() => setAccountMode("guest")}
                    className="flex items-center gap-3 p-4 border-2 border-border rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all text-left group">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">Guest Checkout</p>
                      <p className="text-xs text-muted-foreground">No account needed</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </button>
                  <button type="button" onClick={() => setAccountMode("login")}
                    className="flex items-center gap-3 p-4 border-2 border-primary/30 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group bg-primary/5">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <UserCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-primary text-sm">Sign In / Register</p>
                      <p className="text-xs text-muted-foreground">Track orders & save info</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-primary ml-auto" />
                  </button>
                </div>
              </div>
            )}

            {/* Login at checkout */}
            {(accountMode === "login" || accountMode === "register") && (
              <div className="bg-card border border-border rounded-xl p-5 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex border border-border rounded-lg overflow-hidden">
                    {(["login", "register"] as const).map(m => (
                      <button key={m} type="button" onClick={() => { setAccountMode(m); setAuthError(""); }}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${accountMode === m ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}>
                        {m === "login" ? "Sign In" : "Create Account"}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => { setAccountMode("guest"); setAuthError(""); }} className="text-xs text-muted-foreground hover:text-foreground">
                    Continue as Guest
                  </button>
                </div>
                {authError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg mb-3">{authError}</p>}
                <div className="space-y-3">
                  {accountMode === "register" && (
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="First Name" value={authForm.firstName} onChange={e => setAuthForm(p=>({...p,firstName:e.target.value}))}
                        className="h-10 px-3 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      <input placeholder="Last Name" value={authForm.lastName} onChange={e => setAuthForm(p=>({...p,lastName:e.target.value}))}
                        className="h-10 px-3 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                  )}
                  <input type="email" placeholder="Email" value={authForm.email} onChange={e => setAuthForm(p=>({...p,email:e.target.value}))}
                    className="w-full h-10 px-3 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <div className="relative">
                    <input type={showAuthPass ? "text" : "password"} placeholder="Password" value={authForm.password} onChange={e => setAuthForm(p=>({...p,password:e.target.value}))}
                      className="w-full h-10 px-3 pr-10 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <button type="button" onClick={() => setShowAuthPass(!showAuthPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showAuthPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {accountMode === "register" && (
                    <input type="password" placeholder="Confirm Password" value={authForm.confirmPassword} onChange={e => setAuthForm(p=>({...p,confirmPassword:e.target.value}))}
                      className="w-full h-10 px-3 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  )}
                  <button type="button" disabled={authLoading}
                    onClick={accountMode === "login" ? handleAuthLogin : handleAuthRegister}
                    className="w-full h-10 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-60">
                    {authLoading ? "Please wait..." : accountMode === "login" ? "Sign In & Continue" : "Create Account & Continue"}
                  </button>
                </div>
              </div>
            )}

            {/* Logged in badge */}
            {accountMode === "loggedin" && loggedUser && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-700 font-medium">Signed in as <strong>{loggedUser.email}</strong></p>
                </div>
                <button type="button" onClick={() => { setAccountMode("guest"); }} className="text-xs text-muted-foreground hover:text-foreground">Continue as guest</button>
              </div>
            )}

            {/* Guest badge */}
            {accountMode === "guest" && (
              <div className="bg-card border border-border rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <p className="text-sm text-foreground font-medium">Continuing as <strong>Guest</strong></p>
                </div>
                <button type="button" onClick={() => setAccountMode("choose")} className="text-xs text-primary hover:underline font-medium">Change</button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>

              {/* Contact */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-serif text-foreground mb-5 pb-3 border-b border-border">1. Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                    <Input id="firstName" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className={errors.firstName ? "border-destructive" : ""} />
                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                    <Input id="lastName" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className={errors.lastName ? "border-destructive" : ""} />
                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                    <Input id="email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={errors.email ? "border-destructive" : ""} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    <p className="text-xs text-muted-foreground">Order confirmation will be sent here.</p>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-serif text-foreground mb-5 pb-3 border-b border-border">2. Shipping Address</h2>
                <p className="text-xs text-primary font-medium mb-4">We cannot ship to PO Boxes. A physical address is required for insured delivery.</p>
                <USAddressFields
                  value={{ address: form.address, address2: form.address2, city: form.city, state: form.state, zip: form.zip, country: form.country }}
                  onChange={(v: AddressData) => setForm(prev => ({ ...prev, ...v }))}
                  errors={errors}
                  showAddress2={true}
                />
              </div>

              {/* Payment Method */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-serif text-foreground mb-5 pb-3 border-b border-border flex items-center gap-2">
                  <span>3. Payment Method</span>
                </h2>

                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Secure payment processed by <span className="font-semibold text-foreground">Nexi XPay</span>. We accept:
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <div className="flex items-center justify-center h-10 px-3 bg-white border border-border rounded-lg shadow-sm" title="Visa">
                    <FaCcVisa className="w-9 h-9 text-[#1A1F71]" />
                  </div>
                  <div className="flex items-center justify-center h-10 px-3 bg-white border border-border rounded-lg shadow-sm" title="Mastercard">
                    <FaCcMastercard className="w-9 h-9 text-[#EB001B]" />
                  </div>
                  <div className="flex items-center justify-center h-10 px-3 bg-white border border-border rounded-lg shadow-sm" title="American Express">
                    <FaCcAmex className="w-9 h-9 text-[#2E77BC]" />
                  </div>
                  <div className="flex items-center justify-center h-10 px-4 bg-white border border-border rounded-lg shadow-sm gap-1" title="Google Pay">
                    <FaGooglePay className="w-10 h-10 text-[#5F6368]" />
                  </div>
                  <div className="flex items-center justify-center h-10 px-4 bg-white border border-border rounded-lg shadow-sm" title="Apple Pay">
                    <FaApplePay className="w-10 h-10 text-[#000000]" />
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                  <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <p className="text-xs text-slate-500">
                    Your card details are entered securely on Nexi's encrypted page. We never store your payment information.
                  </p>
                </div>
              </div>

              {apiError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive">{apiError}</p>
                </div>
              )}

              {/* Shipping Method Selector */}
              {shippingMethods.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                  <h2 className="text-lg font-serif text-foreground mb-4 pb-3 border-b border-border">3. Shipping Method</h2>
                  <div className="space-y-3">
                    {shippingMethods.map(m => {
                      const price = (m as any).calculatedPriceCents as number;
                      return (
                        <label key={m.id} className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${
                          selectedShippingId === m.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/40'
                        }`}>
                          <input
                            type="radio"
                            name="shipping"
                            value={m.id}
                            checked={selectedShippingId === m.id}
                            onChange={() => setSelectedShippingId(m.id)}
                            className="mt-0.5 accent-primary"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-medium text-foreground text-sm">{m.name}</span>
                              <span className="font-mono font-bold text-sm text-primary shrink-0">
                                {price === 0 ? 'FREE' : `$${(price / 100).toFixed(2)}`}
                              </span>
                            </div>
                            {m.estimatedDays && <p className="text-xs text-muted-foreground mt-0.5">{m.estimatedDays}</p>}
                            {m.description && <p className="text-xs text-muted-foreground">{m.description}</p>}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 text-base"
                disabled={submitting || accountMode === "choose"}
              >
                {submitting ? (
                  "Connecting to secure payment…"
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Pay ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })} with Card
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By placing your order you agree to our terms and conditions. All sales are final for physical bullion. NOVARI PARTNERS LLC — 30 N Gould St Ste R, Sheridan, WY 82801.
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <h3 className="font-serif text-lg text-foreground mb-4 pb-3 border-b border-border">Order Summary</h3>
              <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-12 h-12 bg-gray-50 border border-border rounded p-1 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-mono text-foreground font-semibold shrink-0">
                      ${(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-green-600 text-sm font-medium">
                    <span>🏷️ Volume discount</span>
                    <span className="font-mono">-${totalSavings.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                  </div>
                )}
                {appliedCoupon && couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 text-sm font-medium">
                    <span>🎟️ Coupon {appliedCoupon.code}</span>
                    <span className="font-mono">-${couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-mono">{shippingCents === 0 ? <span className="text-green-600 font-medium">FREE</span> : `$${(shippingCents/100).toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-foreground pt-1 text-base">
                  <span>Total (USD)</span>
                  <span className="font-mono">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Safe & Secure Payment</h3>
              {[
                { icon: Lock, text: "256-bit SSL encrypted connection" },
                { icon: ShieldCheck, text: "Powered by Nexi XPay payment gateway" },
                { icon: Package, text: "Fully insured shipping — Lloyd's of London" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <item.icon className="w-4 h-4 text-primary shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
