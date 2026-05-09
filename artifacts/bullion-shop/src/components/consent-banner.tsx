import { useState, useEffect } from "react";
import { updateConsent, getConsentSaved } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getConsentSaved() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-xl">
      <div className="container mx-auto max-w-5xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <p className="text-sm text-muted-foreground flex-1">
          We use cookies to analyze traffic and improve your experience. No personal data is shared with third parties.{" "}
          <a href="/privacy" className="text-primary underline hover:no-underline">Privacy Policy</a>
        </p>
        <div className="flex gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={() => { updateConsent(false); setVisible(false); }}
          >
            Decline
          </Button>
          <Button
            size="sm"
            className="text-xs bg-primary hover:bg-primary/90 text-white"
            onClick={() => { updateConsent(true); setVisible(false); }}
          >
            Accept Analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
