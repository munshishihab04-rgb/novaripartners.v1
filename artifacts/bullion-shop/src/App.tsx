import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Catalog from "@/pages/catalog";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import About from "@/pages/about";
import OrderSuccess from "@/pages/order-success";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Shipping from "@/pages/shipping";
import Returns from "@/pages/returns";

import { AdminLogin } from "@/pages/admin/login";
import { AdminDashboard } from "@/pages/admin/dashboard";
import { AdminOrders } from "@/pages/admin/orders";
import { AdminProducts } from "@/pages/admin/products";
import { AdminVisitors } from "@/pages/admin/visitors";
import AdminDiscounts from "@/pages/admin/discounts";
import AdminCoupons from "@/pages/admin/coupons";
import AdminShipping from "@/pages/admin/shipping";
import AdminMedia from "@/pages/admin/media";
import AccountPage from "@/pages/account/index";
import AccountAuth from "@/pages/account/auth";
import AdminTracking from "@/pages/admin/tracking";

import { CartProvider } from "@/hooks/use-cart";
import { trackEvent, initConsent, initAnalytics } from "@/lib/analytics";
import { ConsentBanner } from "@/components/consent-banner";

// Init consent BEFORE any render (Consent Mode v2)
initConsent();

const queryClient = new QueryClient();

function AnalyticsTracker() {
  const [location] = useLocation();
  useEffect(() => {
    if (!location.startsWith("/admin")) {
      trackEvent("page_view", { page: location });
    }
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <AnalyticsTracker />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/catalog" component={Catalog} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/about" component={About} />
        <Route path="/order-success" component={OrderSuccess} />
        <Route path="/terms" component={Terms} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/shipping" component={Shipping} />
        <Route path="/returns" component={Returns} />

        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/orders" component={AdminOrders} />
        <Route path="/admin/products" component={AdminProducts} />
        <Route path="/admin/discounts" component={AdminDiscounts} />
        <Route path="/admin/coupons" component={AdminCoupons} />
        <Route path="/admin/shipping" component={AdminShipping} />
        <Route path="/admin/tracking" component={AdminTracking} />
        <Route path="/admin/media" component={AdminMedia} />
        <Route path="/admin/visitors" component={AdminVisitors} />
        <Route path="/account/reset-password" component={AccountAuth} />
        <Route path="/account/auth" component={AccountAuth} />
        <Route path="/account" component={AccountPage} />
        <Route path="/admin" component={AdminDashboard} />

        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  useEffect(() => {
    fetch("/api/tracking-config")
      .then(r => r.json())
      .then(cfg => initAnalytics(cfg))
      .catch(() => {});
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
          <ConsentBanner />
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
