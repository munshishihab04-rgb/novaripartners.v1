import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type CurrencyCode = "EUR" | "USD";

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  rate: number;
  convert: (eurPrice: number) => number;
  format: (eurPrice: number) => string;
  symbol: string;
  rateLoading: boolean;
}

const DEFAULT_RATE = 1.09;

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "EUR",
  setCurrency: () => {},
  rate: DEFAULT_RATE,
  convert: (p) => p,
  format: (p) => `EUR ${p.toFixed(2)}`,
  symbol: "€",
  rateLoading: true,
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      return (localStorage.getItem("_nk_currency") as CurrencyCode) ?? "EUR";
    } catch {
      return "EUR";
    }
  });
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [rateLoading, setRateLoading] = useState(true);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.eurUsdRate === "number" && d.eurUsdRate > 0) {
          setRate(d.eurUsdRate);
        }
      })
      .catch(() => {})
      .finally(() => setRateLoading(false));
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    try { localStorage.setItem("_nk_currency", c); } catch {}
    setCurrencyState(c);
  };

  const convert = (eurPrice: number) =>
    currency === "USD" ? eurPrice * rate : eurPrice;

  const format = (eurPrice: number) => {
    const amount = convert(eurPrice);
    return currency === "USD"
      ? `$ ${amount.toFixed(2)}`
      : `€ ${amount.toFixed(2)}`;
  };

  const symbol = currency === "USD" ? "$" : "€";

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, rate, convert, format, symbol, rateLoading }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
