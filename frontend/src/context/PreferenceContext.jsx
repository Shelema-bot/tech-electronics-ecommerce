/**
 * PreferenceContext — global language, currency, country.
 * Persists to localStorage. Powers Navbar dropdowns, price formatting,
 * and the admin Preferences settings tab.
 *
 * All prices in the DB are stored in ETB.
 * formatPrice(etbAmount) converts + formats for display.
 */
import { createContext, useContext, useState, useEffect } from "react";
import i18n from "../i18n.js";

// ── Data lists ────────────────────────────────────────────────────────────────

export const COUNTRIES = [
  { code:"ET", flag:"🇪🇹", name:"Ethiopia",       dialCode:"+251" },
  { code:"US", flag:"🇺🇸", name:"United States",  dialCode:"+1"   },
  { code:"GB", flag:"🇬🇧", name:"United Kingdom", dialCode:"+44"  },
  { code:"AE", flag:"🇦🇪", name:"UAE",            dialCode:"+971" },
  { code:"SA", flag:"🇸🇦", name:"Saudi Arabia",   dialCode:"+966" },
  { code:"CN", flag:"🇨🇳", name:"China",          dialCode:"+86"  },
  { code:"IN", flag:"🇮🇳", name:"India",          dialCode:"+91"  },
  { code:"DE", flag:"🇩🇪", name:"Germany",        dialCode:"+49"  },
  { code:"FR", flag:"🇫🇷", name:"France",         dialCode:"+33"  },
  { code:"NG", flag:"🇳🇬", name:"Nigeria",        dialCode:"+234" },
  { code:"KE", flag:"🇰🇪", name:"Kenya",          dialCode:"+254" },
  { code:"ZA", flag:"🇿🇦", name:"South Africa",   dialCode:"+27"  },
  { code:"EG", flag:"🇪🇬", name:"Egypt",          dialCode:"+20"  },
  { code:"GH", flag:"🇬🇭", name:"Ghana",          dialCode:"+233" },
  { code:"TZ", flag:"🇹🇿", name:"Tanzania",       dialCode:"+255" },
  { code:"UG", flag:"🇺🇬", name:"Uganda",         dialCode:"+256" },
  { code:"RW", flag:"🇷🇼", name:"Rwanda",         dialCode:"+250" },
  { code:"SD", flag:"🇸🇩", name:"Sudan",          dialCode:"+249" },
  { code:"SO", flag:"🇸🇴", name:"Somalia",        dialCode:"+252" },
  { code:"ER", flag:"🇪🇷", name:"Eritrea",        dialCode:"+291" },
  { code:"DJ", flag:"🇩🇯", name:"Djibouti",       dialCode:"+253" },
  { code:"TR", flag:"🇹🇷", name:"Turkey",         dialCode:"+90"  },
  { code:"CA", flag:"🇨🇦", name:"Canada",         dialCode:"+1"   },
  { code:"AU", flag:"🇦🇺", name:"Australia",      dialCode:"+61"  },
  { code:"JP", flag:"🇯🇵", name:"Japan",          dialCode:"+81"  },
];

export const LANGUAGES = [
  { code:"en", label:"EN",  name:"English",      nativeName:"English",       dir:"ltr" },
  { code:"am", label:"አማ", name:"Amharic",      nativeName:"አማርኛ",          dir:"ltr" },
  { code:"om", label:"OM",  name:"Afaan Oromoo", nativeName:"Afaan Oromoo",  dir:"ltr" },
  { code:"so", label:"SO",  name:"Somali",       nativeName:"Soomaali",      dir:"ltr" },
  { code:"ti", label:"ትግ", name:"Tigrinya",     nativeName:"ትግርኛ",          dir:"ltr" },
  { code:"ar", label:"AR",  name:"Arabic",       nativeName:"العربية",       dir:"rtl" },
  { code:"fr", label:"FR",  name:"French",       nativeName:"Français",      dir:"ltr" },
  { code:"sw", label:"SW",  name:"Swahili",      nativeName:"Kiswahili",     dir:"ltr" },
  { code:"zh", label:"ZH",  name:"Chinese",      nativeName:"中文",           dir:"ltr" },
  { code:"hi", label:"HI",  name:"Hindi",        nativeName:"हिन्दी",          dir:"ltr" },
  { code:"de", label:"DE",  name:"German",       nativeName:"Deutsch",       dir:"ltr" },
  { code:"tr", label:"TR",  name:"Turkish",      nativeName:"Türkçe",        dir:"ltr" },
];

export const CURRENCIES = [
  { code:"ETB", symbol:"ETB", name:"Ethiopian Birr",     rate:1,       locale:"en-ET", decimals:0 },
  { code:"USD", symbol:"$",   name:"US Dollar",          rate:0.018,   locale:"en-US", decimals:2 },
  { code:"EUR", symbol:"€",   name:"Euro",               rate:0.016,   locale:"de-DE", decimals:2 },
  { code:"GBP", symbol:"£",   name:"British Pound",      rate:0.014,   locale:"en-GB", decimals:2 },
  { code:"AED", symbol:"AED", name:"UAE Dirham",         rate:0.066,   locale:"ar-AE", decimals:2 },
  { code:"SAR", symbol:"SAR", name:"Saudi Riyal",        rate:0.067,   locale:"ar-SA", decimals:2 },
  { code:"CNY", symbol:"¥",   name:"Chinese Yuan",       rate:0.13,    locale:"zh-CN", decimals:2 },
  { code:"INR", symbol:"₹",   name:"Indian Rupee",       rate:1.5,     locale:"en-IN", decimals:0 },
  { code:"TRY", symbol:"₺",   name:"Turkish Lira",       rate:0.58,    locale:"tr-TR", decimals:2 },
  { code:"KES", symbol:"KSh", name:"Kenyan Shilling",    rate:2.3,     locale:"en-KE", decimals:0 },
  { code:"NGN", symbol:"₦",   name:"Nigerian Naira",     rate:27,      locale:"en-NG", decimals:0 },
  { code:"ZAR", symbol:"R",   name:"South African Rand", rate:0.33,    locale:"en-ZA", decimals:2 },
  { code:"EGP", symbol:"E£",  name:"Egyptian Pound",     rate:0.87,    locale:"ar-EG", decimals:2 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const load = (key, def) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
  catch { return def; }
};

/**
 * Convert an ETB amount to the given currency object and return a display string.
 * e.g. formatPrice(1000, { code:"USD", symbol:"$", rate:0.018, decimals:2 }) → "$ 18.00"
 */
export function formatPrice(etbAmount, currency) {
  if (etbAmount === undefined || etbAmount === null) return "—";
  const cur = currency || CURRENCIES[0];
  const raw = Number(etbAmount) * cur.rate;
  if (isNaN(raw)) return "—";

  const formatted = cur.decimals > 0
    ? raw.toLocaleString(cur.locale, { minimumFractionDigits: cur.decimals, maximumFractionDigits: cur.decimals })
    : Math.round(raw).toLocaleString(cur.locale);

  return `${cur.symbol} ${formatted}`;
}

// ── Context ───────────────────────────────────────────────────────────────────

const PreferenceContext = createContext();

export function PreferenceProvider({ children }) {
  const [country,  setCountryState]  = useState(() => load("pref_country",  COUNTRIES[0]));
  const [language, setLanguageState] = useState(() => load("pref_language", LANGUAGES[0]));
  const [currency, setCurrencyState] = useState(() => load("pref_currency", CURRENCIES[0]));

  // Apply text direction + i18next language when language changes
  useEffect(() => {
    document.documentElement.dir  = language.dir || "ltr";
    document.documentElement.lang = language.code;
    // Sync i18next — changeLanguage is idempotent if already that lang
    i18n.changeLanguage(language.code);
  }, [language]);

  const setCountry  = (c) => { setCountryState(c);  localStorage.setItem("pref_country",  JSON.stringify(c)); };
  const setLanguage = (l) => { setLanguageState(l); localStorage.setItem("pref_language", JSON.stringify(l)); };
  const setCurrency = (c) => { setCurrencyState(c); localStorage.setItem("pref_currency", JSON.stringify(c)); };

  /** Format an ETB amount using the current currency preference */
  const fmt = (etbAmount) => formatPrice(etbAmount, currency);

  return (
    <PreferenceContext.Provider value={{
      country,  setCountry,
      language, setLanguage,
      currency, setCurrency,
      /** @deprecated use fmt() */ formatPrice: fmt,
      /** Preferred alias */ fmt,
    }}>
      {children}
    </PreferenceContext.Provider>
  );
}

export const usePreference = () => useContext(PreferenceContext);
