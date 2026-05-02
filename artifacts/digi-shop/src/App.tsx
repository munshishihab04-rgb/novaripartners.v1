import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Home } from "@/pages/home";
import { Catalog } from "@/pages/catalog";
import { ProductDetail } from "@/pages/product-detail";
import { Cart } from "@/pages/cart";
import { Checkout } from "@/pages/checkout";
import { CheckoutResult } from "@/pages/checkout-result";
import { CheckoutCancel } from "@/pages/checkout-cancel";
import { About } from "@/pages/about";
import { Contact } from "@/pages/contact";
import { FAQ } from "@/pages/faq";
import { Terms } from "@/pages/terms";
import { Privacy } from "@/pages/privacy";
import { Cookies } from "@/pages/cookies";
import { Refunds } from "@/pages/refunds";
import { Withdrawal } from "@/pages/withdrawal";
import { CookieBanner } from "@/components/cookie-banner";
import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";
import { AdminLogin } from "@/pages/admin/login";
import { AdminDashboard } from "@/pages/admin/dashboard";
import { AdminOrders } from "@/pages/admin/orders";
import { AdminProducts } from "@/pages/admin/products";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function PageViewTracker() {
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
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/" component={Home} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/checkout/result/:orderId" component={CheckoutResult} />
      <Route path="/checkout/result" component={CheckoutResult} />
      <Route path="/checkout/cancel" component={CheckoutCancel} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/faq" component={FAQ} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/cookies" component={Cookies} />
      <Route path="/refunds" component={Refunds} />
      <Route path="/withdrawal" component={Withdrawal} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <PageViewTracker />
          <Router />
          <CookieBanner />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
