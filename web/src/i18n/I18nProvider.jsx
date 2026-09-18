import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, detectLocale, normalizeLocale, translate } from "./core.js";

const STORAGE_KEY = "opentakeoff_locale";
const I18nContext = createContext(null);

function initialLocale() {
  let query = "";
  let stored = "";
  let languages = [];
  try { query = new URLSearchParams(window.location.search).get("lang") || ""; } catch { /* no window */ }
  try { stored = localStorage.getItem(STORAGE_KEY) || ""; } catch { /* blocked storage */ }
  try { languages = navigator.languages || [navigator.language]; } catch { /* no navigator */ }
  return detectLocale({ query, stored, languages });
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(initialLocale);

  const setLocale = useCallback((next) => {
    setLocaleState(normalizeLocale(next) || DEFAULT_LOCALE);
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, locale); } catch { /* private mode */ }
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = "ltr";
      document.title = translate(locale, "meta.title");
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", translate(locale, "meta.description"));
    }
  }, [locale]);

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      const next = normalizeLocale(event.newValue);
      if (next) setLocaleState(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const t = useCallback((key, vars, fallback) => translate(locale, key, vars, fallback), [locale]);
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside I18nProvider");
  return value;
}
