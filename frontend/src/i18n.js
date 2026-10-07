/**
 * i18n.js — bundled translations.
 * JSON files live in src/locales/ so Vite includes them
 * in the bundle — no async HTTP loading, works on all hosts.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files from src/locales/ (Vite-bundled)
import en from "./locales/en/translation.json";
import am from "./locales/am/translation.json";
import ar from "./locales/ar/translation.json";
import fr from "./locales/fr/translation.json";
import om from "./locales/om/translation.json";

// Read stored language preference set by PreferenceContext
const storedLang = (() => {
  try {
    const v = localStorage.getItem("pref_language");
    if (v) return JSON.parse(v)?.code || "en";
  } catch { /* ignore */ }
  return "en";
})();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      am: { translation: am },
      ar: { translation: ar },
      fr: { translation: fr },
      om: { translation: om },
    },
    lng:           storedLang,
    fallbackLng:   "en",
    supportedLngs: ["en", "am", "ar", "fr", "om"],
    ns:            ["translation"],
    defaultNS:     "translation",
    interpolation: { escapeValue: false },
    react:         { useSuspense: false },
  });

export default i18n;
