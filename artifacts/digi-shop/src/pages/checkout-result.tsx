import { Layout } from "@/components/layout";
import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { CheckCircle2, XCircle, Loader2, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = "loading" | "paid" | "failed" | "pending";

export function CheckoutResult() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId || localStorage.getItem("nexuskeys_pending_order") || "";

  const [status, setStatus] = useState<Status>("loading");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      return;
    }

    const isMock = new URLSearchParams(window.location.search).get("mock") === "1";
    const verifyUrl = `/api/checkout/verify/${orderId}${isMock ? "?mock=1" : ""}`;

    const poll = async () => {
      try {
        const res = await fetch(verifyUrl);
        if (!res.ok) {
          setStatus("failed");
          return;
        }
        const data = await res.json() as { status: string };

        if (data.status === "paid") {
          setStatus("paid");
          localStorage.removeItem("nexuskeys_pending_order");
        } else if (data.status === "failed" || data.status === "cancelled") {
          setStatus("failed");
        } else {
          setAttempts((a) => a + 1);
        }
      } catch {
        setStatus("failed");
      }
    };

    poll();
  }, [orderId]);

  useEffect(() => {
    if (status === "loading" && attempts > 0 && attempts < 6) {
      const timer = setTimeout(() => {
        const isMock = new URLSearchParams(window.location.search).get("mock") === "1";
        fetch(`/api/checkout/verify/${orderId}${isMock ? "?mock=1" : ""}`)
          .then((r) => r.json())
          .then((data: { status: string }) => {
            if (data.status === "paid") {
              setStatus("paid");
              localStorage.removeItem("nexuskeys_pending_order");
            } else if (data.status === "failed" || data.status === "cancelled") {
              setStatus("failed");
            } else {
              setAttempts((a) => a + 1);
            }
          })
          .catch(() => setStatus("failed"));
      }, 2000);
      return () => clearTimeout(timer);
    }
    if (attempts >= 6) {
      setStatus("pending");
    }
  }, [attempts, orderId, status]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-24 max-w-lg">
        {status === "loading" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Verifying your payment</h1>
            <p className="text-muted-foreground">
              Please wait while we confirm your transaction with Nexi XPay.
            </p>
          </div>
        )}

        {status === "paid" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Payment successful</h1>
            <p className="text-muted-foreground mb-2">
              Your order has been confirmed. Your license key is on its way.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Please check your inbox — delivery typically takes under 1 minute.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-8 text-left">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800 text-sm">License key sent by email</span>
              </div>
              <p className="text-sm text-green-700">
                Your license key and activation instructions have been sent to your email address. If you don't see it within 5 minutes, check your spam folder or{" "}
                <Link href="/contact" className="underline hover:no-underline">contact support</Link>.
              </p>
            </div>

            {orderId && (
              <p className="text-xs text-muted-foreground mb-6">
                Order reference: <span className="font-mono font-medium">{orderId}</span>
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/catalog">
                <Button size="lg" className="font-semibold">
                  Continue Shopping
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Payment not completed</h1>
            <p className="text-muted-foreground mb-8">
              Your payment could not be processed. No charge was made to your card. Please try again or use a different payment method.
            </p>

            {orderId && (
              <p className="text-xs text-muted-foreground mb-6">
                Reference: <span className="font-mono font-medium">{orderId}</span>
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/cart">
                <Button size="lg" className="font-semibold">
                  Return to Cart
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === "pending" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Payment pending</h1>
            <p className="text-muted-foreground mb-8">
              We're still waiting for confirmation from Nexi XPay. If payment was successful, your license key will be delivered by email shortly. Please allow up to 5 minutes.
            </p>
            {orderId && (
              <p className="text-xs text-muted-foreground mb-6">
                Order reference: <span className="font-mono font-medium">{orderId}</span>
              </p>
            )}
            <Link href="/contact">
              <Button variant="outline">Contact Support</Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
