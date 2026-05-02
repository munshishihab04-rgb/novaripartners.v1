import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CheckoutCancel() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-24 max-w-lg text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
          <ArrowLeft className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Payment cancelled</h1>
        <p className="text-muted-foreground mb-8">
          You cancelled the payment process. Your cart has been preserved and no charge was made to your card.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/cart">
            <Button size="lg" className="font-semibold">
              <ShoppingCart className="mr-2 w-4 h-4" />
              Return to Cart
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="lg">
              Need Help?
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
