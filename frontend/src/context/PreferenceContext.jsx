/**
 * PreferenceContext — verified language, currency, and country preferences.
 * - Dynamic live currency exchange rates updated with time.
 * - LocalStorage caching with 1-hour expiration and background auto-refresh.
 * - Only verified working localization languages (EN, AM, OM).
 */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import i18n from "../i18n.js";

// ── Verified Working Localization Languages ──────────────────────────────────
export const LANGUAGES = [
  { code: "en", label: "EN",  name: "English",      nativeName: "English",      dir: "ltr" },
  { code: "am", label: "አማ", name: "Amharic",      nativeName: "አማርኛ",         dir: "ltr" },
  { code: "om", label: "OM",  name: "Afaan Oromoo", nativeName: "Afaan Oromoo", dir: "ltr" },
];

export const COUNTRIES = [
  { code: "ET", flag: "🇪🇹", name: "Ethiopia",       dialCode: "+251" },
  { code: "US", flag: "🇺🇸", name: "United States",  dialCode: "+1"   },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom", dialCode: "+44"  },
  { code: "AE", flag: "🇦🇪", name: "UAE",            dialCode: "+971" },
  { code: "SA", flag: "🇸🇦", name: "Saudi Arabia",   dialCode: "+966" },
  { code: "DE", flag: "🇩🇪", name: "Germany",        dialCode: "+49"  },
  { code: "KE", flag: "🇰🇪", name: "Kenya",          dialCode: "+254" },
];

// Fallback baseline exchange rates (1 ETB = X foreign currency)
export const DEFAULT_CURRENCIES = [
  { code: "ETB", symbol: "ETB", name: "Ethiopian Birr", rate: 1,        locale: "en-ET", decimals: 0 },
  { code: "USD", symbol: "$",   name: "US Dollar",      rate: 0.00615,  locale: "en-US", decimals: 2 },
  { code: "EUR", symbol: "€",   name: "Euro",           rate: 0.00534,  locale: "de-DE", decimals: 2 },
];

export let CURRENCIES = [...DEFAULT_CURRENCIES];

// ── Helpers ───────────────────────────────────────────────────────────────────
const load = (key, def) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch {
    return def;
  }
};

const save = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
};

export function formatPrice(etbAmount, currency) {
  if (etbAmount === undefined || etbAmount === null) return "—";
  const cur = currency || CURRENCIES[0];
  const raw = Number(etbAmount) * (cur.rate || 1);
  if (isNaN(raw)) return "—";

  const formatted = cur.decimals > 0
    ? raw.toLocaleString(cur.locale || "en-US", { minimumFractionDigits: cur.decimals, maximumFractionDigits: cur.decimals })
    : Math.round(raw).toLocaleString(cur.locale || "en-ET");

  return `${cur.symbol} ${formatted}`;
}

const PreferenceContext = createContext();

export function PreferenceProvider({ children }) {
  const [country,  setCountryState]  = useState(() => load("pref_country",  COUNTRIES[0]));
  const [language, setLanguageState] = useState(() => {
    const saved = load("pref_language", LANGUAGES[0]);
    const match = LANGUAGES.find(l => l.code === saved?.code);
    return match || LANGUAGES[0];
  });

  // Dynamic currency rates state
  const [currencies, setCurrencies] = useState(() => {
    const cached = load("pref_currency_list", null);
    if (cached && Array.isArray(cached) && cached.length >= 3) {
      CURRENCIES = cached;
      return cached;
    }
    return DEFAULT_CURRENCIES;
  });

  const [currency, setCurrencyState] = useState(() => {
    const saved = load("pref_currency", DEFAULT_CURRENCIES[0]);
    // Match with current dynamic rates
    const match = currencies.find(c => c.code === saved?.code);
    return match || DEFAULT_CURRENCIES[0];
  });

  const [lastRateUpdate, setLastRateUpdate] = useState(() => {
    return load("pref_rate_updated_at", null);
  });

  // Apply text direction + i18next language when language changes
  useEffect(() => {
    document.documentElement.dir  = language.dir || "ltr";
    document.documentElement.lang = language.code;
    i18n.changeLanguage(language.code);
  }, [language]);

  // Fetch live exchange rates
  const updateExchangeRates = useCallback(async (force = false) => {
    const CACHE_MS = 60 * 60 * 1000; // 1 hour cache
    const lastTime = load("pref_rate_timestamp", 0);
    const now = Date.now();

    if (!force && lastTime && (now - lastTime) < CACHE_MS) {
      return;
    }

    try {
      let rates = null;
      // 1. Primary open exchange rate API (Cloudflare hosted, free, real-time)
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/ETB");
        if (res.ok) {
          const data = await res.json();
          if (data && data.rates && data.rates.USD && data.rates.EUR) {
            rates = data.rates;
          }
        }
      } catch (e1) {
        console.warn("Primary exchange rate fetch failed, trying fallback...", e1.message);
      }

      // 2. Fallback API
      if (!rates) {
        try {
          const fallbackRes = await fetch("https://api.exchangerate-api.com/v4/latest/ETB");
          if (fallbackRes.ok) {
            const fbData = await fallbackRes.json();
            if (fbData && fbData.rates && fbData.rates.USD && fbData.rates.EUR) {
              rates = fbData.rates;
            }
          }
        } catch (e2) {
          console.warn("Fallback exchange rate fetch failed:", e2.message);
        }
      }

      if (rates && rates.USD && rates.EUR) {
        const updatedList = [
          { code: "ETB", symbol: "ETB", name: "Ethiopian Birr", rate: 1,             locale: "en-ET", decimals: 0 },
          { code: "USD", symbol: "$",   name: "US Dollar",      rate: rates.USD,     locale: "en-US", decimals: 2 },
          { code: "EUR", symbol: "€",   name: "Euro",           rate: rates.EUR,     locale: "de-DE", decimals: 2 },
        ];

        CURRENCIES = updatedList;
        setCurrencies(updatedList);
        save("pref_currency_list", updatedList);
        save("pref_rate_timestamp", now);
        const updateStr = new Date().toLocaleTimeString();
        setLastRateUpdate(updateStr);
        save("pref_rate_updated_at", updateStr);

        // Keep current selected currency aligned with fresh rate
        setCurrencyState(prev => {
          const fresh = updatedList.find(c => c.code === prev?.code);
          if (fresh) {
            save("pref_currency", fresh);
            return fresh;
          }
          return prev;
        });
      }
    } catch (err) {
      console.warn("Live exchange rate updater notice:", err.message);
    }
  }, []);

  // Update rates on mount and set up periodic refresh every 30 minutes
  useEffect(() => {
    updateExchangeRates();
    const interval = setInterval(() => {
      updateExchangeRates(true);
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [updateExchangeRates]);

  const setCountry  = (c) => { setCountryState(c);  save("pref_country",  c); };
  const setLanguage = (l) => { setLanguageState(l); save("pref_language", l); };
  const setCurrency = (c) => {
    const fresh = currencies.find(cur => cur.code === (c?.code || c)) || c;
    setCurrencyState(fresh);
    save("pref_currency", fresh);
  };

  const fmt = (etbAmount) => formatPrice(etbAmount, currency);

  return (
    <PreferenceContext.Provider value={{
      country,  setCountry,
      language, setLanguage,
      currency, setCurrency,
      currencies,
      lastRateUpdate,
      refreshExchangeRates: () => updateExchangeRates(true),
      formatPrice: fmt,
      fmt,
    }}>
      {children}
    </PreferenceContext.Provider>
  );
}

export const usePreference = () => useContext(PreferenceContext);
