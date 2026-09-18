import en from "./locales/en.js";
import ptBR from "./locales/pt-BR.js";
import es from "./locales/es.js";

export const DEFAULT_LOCALE = "en";
export const SUPPORTED_LOCALES = ["pt-BR", "en", "es"];
export const LANGUAGE_OPTIONS = [
  { value: "pt-BR", label: "Português" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];

const dictionaries = { en, "pt-BR": ptBR, es };

export function normalizeLocale(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return null;
  if (raw === "pt" || raw === "pt-br" || raw.startsWith("pt-")) return "pt-BR";
  if (raw === "es" || raw.startsWith("es-")) return "es";
  if (raw === "en" || raw.startsWith("en-")) return "en";
  return null;
}

export function detectLocale({ query, stored, languages } = {}) {
  const candidates = [query, stored, ...(Array.isArray(languages) ? languages : [])];
  for (const candidate of candidates) {
    const normalized = normalizeLocale(candidate);
    if (normalized) return normalized;
  }
  return DEFAULT_LOCALE;
}

function readPath(obj, key) {
  return String(key || "").split(".").reduce((cur, part) => (
    cur && Object.prototype.hasOwnProperty.call(cur, part) ? cur[part] : undefined
  ), obj);
}

function interpolate(value, vars) {
  return String(value).replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, name) => {
    const replacement = vars && Object.prototype.hasOwnProperty.call(vars, name) ? vars[name] : "";
    return replacement == null ? "" : String(replacement);
  });
}

export function translate(locale, key, vars = {}, fallback) {
  const active = dictionaries[normalizeLocale(locale) || DEFAULT_LOCALE] || en;
  const localized = readPath(active, key);
  const english = readPath(en, key);
  const value = typeof localized === "string"
    ? localized
    : typeof english === "string"
      ? english
      : fallback !== undefined
        ? fallback
        : key;
  return interpolate(value, vars);
}
