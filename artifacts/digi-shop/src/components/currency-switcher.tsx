import { useCurrency, type CurrencyCode } from "@/lib/currency";

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  const options: { code: CurrencyCode; label: string }[] = [
    { code: "EUR", label: "€ EUR" },
    { code: "USD", label: "$ USD" },
  ];

  return (
    <div className="flex items-center rounded-full border border-input bg-muted/50 p-0.5 gap-0.5 shadow-sm">
      {options.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setCurrency(code)}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
            currency === code
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
