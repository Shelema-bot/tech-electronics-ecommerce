/**
 * PreferenceContext — global country, language, currency.
 * Persists to localStorage. Powers Navbar dropdowns.
 */
import { createContext, useContext, useState } from "react";

// ── Comprehensive lists ───────────────────────────────────────
export const COUNTRIES = [
  { code: "ET", flag: "🇪🇹", name: "Ethiopia",        dialCode: "+251" },
  { code: "US", flag: "🇺🇸", name: "United States",   dialCode: "+1" },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom",  dialCode: "+44" },
  { code: "AE", flag: "🇦🇪", name: "UAE",             dialCode: "+971" },
  { code: "SA", flag: "🇸🇦", name: "Saudi Arabia",    dialCode: "+966" },
  { code: "CN", flag: "🇨🇳", name: "China",           dialCode: "+86" },
  { code: "IN", flag: "🇮🇳", name: "India",           dialCode: "+91" },
  { code: "DE", flag: "🇩🇪", name: "Germany",         dialCode: "+49" },
  { code: "FR", flag: "🇫🇷", name: "France",          dialCode: "+33" },
  { code: "NG", flag: "🇳🇬", name: "Nigeria",         dialCode: "+234" },
  { code: "KE", flag: "🇰🇪", name: "Kenya",           dialCode: "+254" },
  { code: "ZA", flag: "🇿🇦", name: "South Africa",    dialCode: "+27" },
  { code: "EG", flag: "🇪🇬", name: "Egypt",           dialCode: "+20" },
  { code: "GH", flag: "🇬🇭", name: "Ghana",           dialCode: "+233" },
  { code: "TZ", flag: "🇹🇿", name: "Tanzania",        dialCode: "+255" },
  { code: "UG", flag: "🇺🇬", name: "Uganda",          dialCode: "+256" },
  { code: "RW", flag: "🇷🇼", name: "Rwanda",          dialCode: "+250" },
  { code: "SD", flag: "🇸🇩", name: "Sudan",           dialCode: "+249" },
  { code: "SO", flag: "🇸🇴", name: "Somalia",         dialCode: "+252" },
  { code: "ER", flag: "🇪🇷", name: "Eritrea",         dialCode: "+291" },
  { code: "DJ", flag: "🇩🇯", name: "Djibouti",        dialCode: "+253" },
  { code: "TR", flag: "🇹🇷", name: "Turkey",          dialCode: "+90" },
  { code: "CA", flag: "🇨🇦", name: "Canada",          dialCode: "+1" },
  { code: "AU", flag: "🇦🇺", name: "Australia",       dialCode: "+61" },
  { code: "JP", flag: "🇯🇵", name: "Japan",           dialCode: "+81" },
];

export const LANGUAGES = [
  { code: "en",  label: "EN",   name: "English",       nativeName: "English" },
  { code: "am",  label: "አማ",  name: "Amharic",       nativeName: "አማርኛ" },
  { code: "om",  label: "OM",   name: "Afaan Oromoo",  nativeName: "Afaan Oromoo" },
  { code: "so",  label: "SO",   name: "Somali",        nativeName: "Soomaali" },
  { code: "ti",  label: "ትግ",  name: "Tigrinya",      nativeName: "ትግርኛ" },
  { code: "ar",  label: "AR",   name: "Arabic",        nativeName: "العربية" },
  { code: "fr",  label: "FR",   name: "French",        nativeName: "Français" },
  { code: "sw",  label: "SW",   name: "Swahili",       nativeName: "Kiswahili" },
  { code: "zh",  label: "ZH",   name: "Chinese",       nativeName: "中文" },
  { code: "hi",  label: "HI",   name: "Hindi",         nativeName: "हिन्दी" },
  { code: "de",  label: "DE",   name: "German",        nativeName: "Deutsch" },
  { code: "tr",  label: "TR",   name: "Turkish",       nativeName: "Türkçe" },
];

export const CURRENCIES = [
  { code: "ETB", symbol: "ETB",  name: "Ethiopian Birr",  rate: 1 },
  { code: "USD", symbol: "$",    name: "US Dollar",       rate: 0.018  },
  { code: "EUR", symbol: "€",    name: "Euro",            rate: 0.016  },
  { code: "GBP", symbol: "£",    name: "British Pound",   rate: 0.014  },
  { code: "AED", symbol: "AED",  name: "UAE Dirham",      rate: 0.066  },
  { code: "SAR", symbol: "SAR",  name: "Saudi Riyal",     rate: 0.067  },
  { code: "CNY", symbol: "¥",    name: "Chinese Yuan",    rate: 0.13   },
  { code: "INR", symbol: "₹",    name: "Indian Rupee",    rate: 1.5    },
  { code: "TRY", symbol: "₺",    name: "Turkish Lira",    rate: 0.58   },
  { code: "KES", symbol: "KSh",  name: "Kenyan Shilling", rate: 2.3    },
  { code: "NGN", symbol: "₦",    name: "Nigerian Naira",  rate: 27     },
  { code: "ZAR", symbol: "R",    name: "South African Rand", rate: 0.33 },
  { code: "EGP", symbol: "E£",   name: "Egyptian Pound",  rate: 0.87   },
];

const load = (key, def) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; } };

const PreferenceContext = createContext();

export function PreferenceProvider({ children }) {
  const [country,  setCountryState]  = useState(() => load("pref_country",  COUNTRIES[0]));
  const [language, setLanguageState] = useState(() => load("pref_language", LANGUAGES[0]));
  const [currency, setCurrencyState] = useState(() => load("pref_currency", CURRENCIES[0]));

  const setCountry  = (c) => { setCountryState(c);  localStorage.setItem("pref_country",  JSON.stringify(c)); };
  const setLanguage = (l) => { setLanguageState(l); localStorage.setItem("pref_language", JSON.stringify(l)); };
  const setCurrency = (c) => { setCurrencyState(c); localStorage.setItem("pref_currency", JSON.stringify(c)); };

  // Convert ETB amount to selected currency
  const formatPrice = (etbAmount) => {
    if (!etbAmount) return "0";
    const converted = etbAmount * currency.rate;
    const rounded   = converted < 1 ? converted.toFixed(2) : Math.round(converted);
    return `${currency.symbol} ${Number(rounded).toLocaleString()}`;
  };

  return (
    <PreferenceContext.Provider value={{ country, setCountry, language, setLanguage, currency, setCurrency, formatPrice }}>
      {children}
    </PreferenceContext.Provider>
  );
}

export const usePreference = () => useContext(PreferenceContext);
