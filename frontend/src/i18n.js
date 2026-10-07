/**
 * i18n.js — bundled translations (no async HTTP loading).
 * All JSON files are imported directly so every language is
 * available instantly without a network request.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import all translation files directly
import en from "../public/locales/en/translation.json";
import am from "../public/locales/am/translation.json";
import ar from "../public/locales/ar/translation.json";
import fr from "../public/locales/fr/translation.json";

// Read stored language preference (set by PreferenceContext)
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
    },
    lng:        storedLang,   // start with stored preference
    fallbackLng: "en",
    supportedLngs: ["en", "am", "ar", "fr"],
    ns:         ["translation"],
    defaultNS:  "translation",
    interpolation: {
      escapeValue: false, // React escapes already
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
