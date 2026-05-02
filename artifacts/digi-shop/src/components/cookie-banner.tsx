import { useState, useEffect } from "react";
import { Link } from "wouter";
import { X, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "essential_only");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white border-t border-border shadow-2xl">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="bg-primary/10 text-primary p-2 rounded-lg shrink-0 mt-0.5">
                <Cookie className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">We use cookies</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use strictly necessary cookies to keep your cart working, and optional analytics cookies to improve your experience.{" "}
                  <Link href="/cookies" className="text-primary hover:underline font-medium">Cookie Policy</Link>
                  {" "}·{" "}
                  <Link href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 pl-0 sm:pl-4">
              <Button variant="outline" size="sm" onClick={decline} className="text-sm h-9">
                Essential only
              </Button>
              <Button size="sm" onClick={accept} className="text-sm h-9 font-semibold px-5">
                Accept all
              </Button>
              <button
                onClick={decline}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-muted"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
