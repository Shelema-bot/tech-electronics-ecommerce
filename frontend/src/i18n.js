/**
 * i18n.js — bundled translations for active languages.
 * Clean, lightweight, fully bundled with Vite.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/translation.json";
import am from "./locales/am/translation.json";
import om from "./locales/om/translation.json";

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
      om: { translation: om },
    },
    lng:           storedLang,
    fallbackLng:   "en",
    supportedLngs: ["en", "am", "om"],
    ns:            ["translation"],
    defaultNS:     "translation",
    interpolation: { escapeValue: false },
    react:         { useSuspense: false },
  });

export default i18n;
